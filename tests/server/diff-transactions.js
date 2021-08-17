import should from 'should';
import deepclone from 'lodash.clonedeep';
import moment from 'moment';

import diffTransactions from '../../server/lib/diff-transactions';
import { UNKNOWN_OPERATION_TYPE } from '../../shared/helpers';

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
        perfectMatches.length.should.equal(1);

        let match = perfectMatches[0];
        match[0].should.equal(A);
        match[1].should.equal(copyA);

        providerOrphans.length.should.equal(0);
        knownOrphans.length.should.equal(0);
        duplicateCandidates.length.should.equal(0);
    });

    it("should insert a single provider's transaction", () => {
        let { perfectMatches, providerOrphans, knownOrphans, duplicateCandidates } =
            diffTransactions([], [A]);

        perfectMatches.length.should.equal(0);

        providerOrphans.length.should.equal(1);
        providerOrphans[0].should.equal(A);

        knownOrphans.length.should.equal(0);
        duplicateCandidates.length.should.equal(0);
    });

    it('should mark a known single transaction as orphan', () => {
        let { perfectMatches, providerOrphans, knownOrphans, duplicateCandidates } =
            diffTransactions([A], []);

        perfectMatches.length.should.equal(0);
        providerOrphans.length.should.equal(0);

        knownOrphans.length.should.equal(1);
        knownOrphans[0].should.equal(A);

        duplicateCandidates.length.should.equal(0);
    });

    it('should merge a single provided and a known transaction when the dates are separated by 1 day', () => {
        let changedA = {
            ...deepclone(A),
            date: moment(A.date).add(1, 'day').toDate(),
        };

        let { perfectMatches, providerOrphans, knownOrphans, duplicateCandidates } =
            diffTransactions([A], [changedA]);

        perfectMatches.length.should.equal(0);
        providerOrphans.length.should.equal(0);
        knownOrphans.length.should.equal(0);

        duplicateCandidates.length.should.equal(1);
        let pair = duplicateCandidates[0];
        pair[0].should.equal(A);
        pair[1].should.equal(changedA);
    });

    it('should select the transaction with the closest date as duplicate, and detect the other as orphan', () => {
        let changedA = { ...deepclone(A), date: moment(A.date).add(1, 'day').toDate() };
        let youngerA = { ...deepclone(A), date: moment(A.date).add(2, 'day').toDate() };

        let { perfectMatches, providerOrphans, knownOrphans, duplicateCandidates } =
            diffTransactions([A], [changedA, youngerA]);

        perfectMatches.length.should.equal(0);
        providerOrphans.length.should.equal(1);
        providerOrphans[0].should.equal(youngerA);
        knownOrphans.length.should.equal(0);

        duplicateCandidates.length.should.equal(1);
        let pair = duplicateCandidates[0];
        pair[0].should.equal(A);
        pair[1].should.equal(changedA);
    });

    it('should detect a duplicate transaction if the known transaction has an unknown type.', () => {
        let changedA = { ...deepclone(A), type: UNKNOWN_OPERATION_TYPE };

        let { perfectMatches, providerOrphans, knownOrphans, duplicateCandidates } =
            diffTransactions([A], [changedA]);

        perfectMatches.length.should.equal(0);
        providerOrphans.length.should.equal(0);
        knownOrphans.length.should.equal(0);

        duplicateCandidates.length.should.equal(1);
    });

    it('should detect a duplicate transaction if the known transaction has an unknown type.', () => {
        let changedA = { ...deepclone(A), type: UNKNOWN_OPERATION_TYPE };

        let { perfectMatches, providerOrphans, knownOrphans, duplicateCandidates } =
            diffTransactions([changedA], [A]);

        perfectMatches.length.should.equal(0);
        providerOrphans.length.should.equal(0);
        knownOrphans.length.should.equal(0);

        duplicateCandidates.length.should.equal(1);
    });

    it('should merge an operation if the known transaction has an unknown debitDate.', () => {
        let changedA = { ...A };
        delete changedA.debitDate;

        let { perfectMatches, providerOrphans, knownOrphans, duplicateCandidates } =
            diffTransactions([changedA], [A]);

        perfectMatches.length.should.equal(1);
        providerOrphans.length.should.equal(0);
        knownOrphans.length.should.equal(0);

        duplicateCandidates.length.should.equal(0);
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

        perfectMatches.length.should.equal(1);
        providerOrphans.length.should.equal(0);
        knownOrphans.length.should.equal(0);

        duplicateCandidates.length.should.equal(0);
    });
});

describe('diffing transaction when there are several transactions', () => {
    it('should find perfect matches in any order', () => {
        let { perfectMatches, providerOrphans, knownOrphans, duplicateCandidates } =
            diffTransactions([A, B, C], [copyB, copyC, copyA]);

        perfectMatches.length.should.equal(3);

        let match = perfectMatches[0];
        match[0].should.equal(A);
        match[1].should.equal(copyA);

        match = perfectMatches[1];
        match[0].should.equal(B);
        match[1].should.equal(copyB);

        match = perfectMatches[2];
        match[0].should.equal(C);
        match[1].should.equal(copyC);

        providerOrphans.length.should.equal(0);
        knownOrphans.length.should.equal(0);
        duplicateCandidates.length.should.equal(0);
    });

    it('should find kresus orphans', () => {
        let { perfectMatches, providerOrphans, knownOrphans, duplicateCandidates } =
            diffTransactions([A, B, C], [copyB, copyC]);

        perfectMatches.length.should.equal(2);

        let match = perfectMatches[0];
        match[0].should.equal(B);
        match[1].should.equal(copyB);

        match = perfectMatches[1];
        match[0].should.equal(C);
        match[1].should.equal(copyC);

        providerOrphans.length.should.equal(0);

        knownOrphans.length.should.equal(1);
        knownOrphans[0].should.equal(A);

        duplicateCandidates.length.should.equal(0);
    });

    it('should find provider orphans', () => {
        let { perfectMatches, providerOrphans, knownOrphans, duplicateCandidates } =
            diffTransactions([A, B], [A, copyB, C]);

        perfectMatches.length.should.equal(2);

        let match = perfectMatches[0];
        match[0].should.equal(A);
        match[1].should.equal(A);

        match = perfectMatches[1];
        match[0].should.equal(B);
        match[1].should.equal(copyB);

        knownOrphans.length.should.equal(0);

        providerOrphans.length.should.equal(1);
        providerOrphans[0].should.equal(C);

        duplicateCandidates.length.should.equal(0);
    });

    it('should not merge transactions that are too different', () => {
        let { perfectMatches, providerOrphans, knownOrphans, duplicateCandidates } =
            diffTransactions([A, B], [C]);

        perfectMatches.length.should.equal(0);

        knownOrphans.length.should.equal(2);
        knownOrphans[0].should.equal(A);
        knownOrphans[1].should.equal(B);

        providerOrphans.length.should.equal(1);
        providerOrphans[0].should.equal(C);

        duplicateCandidates.length.should.equal(0);
    });
});
