import assert from 'node:assert';

import moment from 'moment';

import diffTransactions from '../../server/lib/diff-transactions';
import { UNKNOWN_TRANSACTION_TYPE } from '../../shared/helpers';

let A = {
    label: 'Toto',
    rawLabel: 'Toto',
    amount: 10,
    date: new Date(),
    debitDate: moment(new Date()).add(10, 'days').toDate(),
    type: 'type.transfer',
};

let copyA = { ...A };

let B = {
    label: 'Savings',
    rawLabel: 'Savings',
    amount: 15,
    date: moment(new Date()).add(10, 'day').toDate(),
    type: 'type.card',
};

let copyB = { ...B };

let C = {
    label: 'Bury me with my money',
    rawLabel: 'Bury me with my money',
    amount: 35,
    date: moment(new Date()).add(20, 'day').toDate(),
    type: 'type.card',
};

let copyC = { ...C };

describe("diffing transactions when there's only one transaction", () => {
    it('should return an exact match for the same transaction', () => {
        let { perfectMatches, providerOrphans, knownOrphans, duplicateCandidates } =
            diffTransactions([A], [copyA]);
        assert.strictEqual(perfectMatches.length, 1);

        let match = perfectMatches[0];
        assert.strictEqual(match[0], A);
        assert.strictEqual(match[1], copyA);

        assert.strictEqual(providerOrphans.length, 0);
        assert.strictEqual(knownOrphans.length, 0);
        assert.strictEqual(duplicateCandidates.length, 0);
    });

    it("should insert a single provider's transaction", () => {
        let { perfectMatches, providerOrphans, knownOrphans, duplicateCandidates } =
            diffTransactions([], [A]);

        assert.strictEqual(perfectMatches.length, 0);

        assert.strictEqual(providerOrphans.length, 1);
        assert.strictEqual(providerOrphans[0], A);

        assert.strictEqual(knownOrphans.length, 0);
        assert.strictEqual(duplicateCandidates.length, 0);
    });

    it('should mark a known single transaction as orphan', () => {
        let { perfectMatches, providerOrphans, knownOrphans, duplicateCandidates } =
            diffTransactions([A], []);

        assert.strictEqual(perfectMatches.length, 0);
        assert.strictEqual(providerOrphans.length, 0);

        assert.strictEqual(knownOrphans.length, 1);
        assert.strictEqual(knownOrphans[0], A);

        assert.strictEqual(duplicateCandidates.length, 0);
    });

    it('should merge a single provided and a known transaction when the dates are separated by 1 day', () => {
        let changedA = {
            ...structuredClone(A),
            date: moment(A.date).add(1, 'day').toDate(),
        };

        let { perfectMatches, providerOrphans, knownOrphans, duplicateCandidates } =
            diffTransactions([A], [changedA]);

        assert.strictEqual(perfectMatches.length, 0);
        assert.strictEqual(providerOrphans.length, 0);
        assert.strictEqual(knownOrphans.length, 0);

        assert.strictEqual(duplicateCandidates.length, 1);
        let pair = duplicateCandidates[0];
        assert.strictEqual(pair[0], A);
        assert.strictEqual(pair[1], changedA);
    });

    it('should select the transaction with the closest date as duplicate, and detect the other as orphan', () => {
        let changedA = { ...structuredClone(A), date: moment(A.date).add(1, 'day').toDate() };
        let youngerA = { ...structuredClone(A), date: moment(A.date).add(2, 'day').toDate() };

        let { perfectMatches, providerOrphans, knownOrphans, duplicateCandidates } =
            diffTransactions([A], [changedA, youngerA]);

        assert.strictEqual(perfectMatches.length, 0);
        assert.strictEqual(providerOrphans.length, 1);
        assert.strictEqual(providerOrphans[0], youngerA);
        assert.strictEqual(knownOrphans.length, 0);

        assert.strictEqual(duplicateCandidates.length, 1);
        let pair = duplicateCandidates[0];
        assert.strictEqual(pair[0], A);
        assert.strictEqual(pair[1], changedA);
    });

    it('should detect a duplicate transaction if the known transaction has an unknown type.', () => {
        let changedA = { ...structuredClone(A), type: UNKNOWN_TRANSACTION_TYPE };

        let { perfectMatches, providerOrphans, knownOrphans, duplicateCandidates } =
            diffTransactions([A], [changedA]);

        assert.strictEqual(perfectMatches.length, 0);
        assert.strictEqual(providerOrphans.length, 0);
        assert.strictEqual(knownOrphans.length, 0);

        assert.strictEqual(duplicateCandidates.length, 1);
    });

    it('should detect a duplicate transaction if the known transaction has an unknown type.', () => {
        let changedA = { ...structuredClone(A), type: UNKNOWN_TRANSACTION_TYPE };

        let { perfectMatches, providerOrphans, knownOrphans, duplicateCandidates } =
            diffTransactions([changedA], [A]);

        assert.strictEqual(perfectMatches.length, 0);
        assert.strictEqual(providerOrphans.length, 0);
        assert.strictEqual(knownOrphans.length, 0);

        assert.strictEqual(duplicateCandidates.length, 1);
    });

    it('should merge a transaction if the known transaction has an unknown debitDate.', () => {
        let changedA = { ...A };
        delete changedA.debitDate;

        let { perfectMatches, providerOrphans, knownOrphans, duplicateCandidates } =
            diffTransactions([changedA], [A]);

        assert.strictEqual(perfectMatches.length, 1);
        assert.strictEqual(providerOrphans.length, 0);
        assert.strictEqual(knownOrphans.length, 0);

        assert.strictEqual(duplicateCandidates.length, 0);
    });

    it('should merge a transaction if the known and provided transactions have date which are the same day, but differ from a few hours.', () => {
        let changedA = {
            ...A,
            date: moment(A.date)
                .hour(A.date.getHours() > 0 ? 0 : 1)
                .toDate(),
        };

        let { perfectMatches, providerOrphans, knownOrphans, duplicateCandidates } =
            diffTransactions([changedA], [A]);

        assert.strictEqual(perfectMatches.length, 1);
        assert.strictEqual(providerOrphans.length, 0);
        assert.strictEqual(knownOrphans.length, 0);

        assert.strictEqual(duplicateCandidates.length, 0);
    });
});

describe('diffing transaction when there are several transactions', () => {
    it('should find perfect matches in any order', () => {
        let { perfectMatches, providerOrphans, knownOrphans, duplicateCandidates } =
            diffTransactions([A, B, C], [copyB, copyC, copyA]);

        assert.strictEqual(perfectMatches.length, 3);

        let match = perfectMatches[0];
        assert.strictEqual(match[0], A);
        assert.strictEqual(match[1], copyA);

        match = perfectMatches[1];
        assert.strictEqual(match[0], B);
        assert.strictEqual(match[1], copyB);

        match = perfectMatches[2];
        assert.strictEqual(match[0], C);
        assert.strictEqual(match[1], copyC);

        assert.strictEqual(providerOrphans.length, 0);
        assert.strictEqual(knownOrphans.length, 0);
        assert.strictEqual(duplicateCandidates.length, 0);
    });

    it('should find kresus orphans', () => {
        let { perfectMatches, providerOrphans, knownOrphans, duplicateCandidates } =
            diffTransactions([A, B, C], [copyB, copyC]);

        assert.strictEqual(perfectMatches.length, 2);

        let match = perfectMatches[0];
        assert.strictEqual(match[0], B);
        assert.strictEqual(match[1], copyB);

        match = perfectMatches[1];
        assert.strictEqual(match[0], C);
        assert.strictEqual(match[1], copyC);

        assert.strictEqual(providerOrphans.length, 0);

        assert.strictEqual(knownOrphans.length, 1);
        assert.strictEqual(knownOrphans[0], A);

        assert.strictEqual(duplicateCandidates.length, 0);
    });

    it('should find provider orphans', () => {
        let { perfectMatches, providerOrphans, knownOrphans, duplicateCandidates } =
            diffTransactions([A, B], [A, copyB, C]);

        assert.strictEqual(perfectMatches.length, 2);

        let match = perfectMatches[0];
        assert.strictEqual(match[0], A);
        assert.strictEqual(match[1], A);

        match = perfectMatches[1];
        assert.strictEqual(match[0], B);
        assert.strictEqual(match[1], copyB);

        assert.strictEqual(knownOrphans.length, 0);

        assert.strictEqual(providerOrphans.length, 1);
        assert.strictEqual(providerOrphans[0], C);

        assert.strictEqual(duplicateCandidates.length, 0);
    });

    it('should not merge transactions that are too different', () => {
        let { perfectMatches, providerOrphans, knownOrphans, duplicateCandidates } =
            diffTransactions([A, B], [C]);

        assert.strictEqual(perfectMatches.length, 0);

        assert.strictEqual(knownOrphans.length, 2);
        assert.strictEqual(knownOrphans[0], A);
        assert.strictEqual(knownOrphans[1], B);

        assert.strictEqual(providerOrphans.length, 1);
        assert.strictEqual(providerOrphans[0], C);

        assert.strictEqual(duplicateCandidates.length, 0);
    });
});
