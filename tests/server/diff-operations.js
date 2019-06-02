import should from 'should';
import u from 'updeep';
import moment from 'moment';

import diffOperations from '../../server/lib/diff-operations';
import { UNKNOWN_OPERATION_TYPE } from '../../shared/helpers';

let A = {
    label: 'Toto',
    rawLabel: 'Toto',
    amount: 10,
    date: new Date(),
    debitDate: moment(new Date())
        .add(10, 'days')
        .toDate(),
    type: 'type.transfer'
};

let copyA = { ...A };

let B = {
    label: 'Savings',
    rawLabel: 'Savings',
    amount: 15,
    date: moment(new Date())
        .add(10, 'day')
        .toDate(),
    type: 'type.card'
};

let copyB = { ...B };

let C = {
    label: 'Bury me with my money',
    rawLabel: 'Bury me with my money',
    amount: 35,
    date: moment(new Date())
        .add(20, 'day')
        .toDate(),
    type: 'type.card'
};

let copyC = { ...C };

describe("diffing operations when there's only one operation", () => {
    it('should return an exact match for the same operation', () => {
        let { perfectMatches, providerOrphans, knownOrphans, duplicateCandidates } = diffOperations(
            [A],
            [copyA]
        );
        perfectMatches.length.should.equal(1);

        let match = perfectMatches[0];
        match[0].should.equal(A);
        match[1].should.equal(copyA);

        providerOrphans.length.should.equal(0);
        knownOrphans.length.should.equal(0);
        duplicateCandidates.length.should.equal(0);
    });

    it("should insert a single provider's operation", () => {
        let { perfectMatches, providerOrphans, knownOrphans, duplicateCandidates } = diffOperations(
            [],
            [A]
        );

        perfectMatches.length.should.equal(0);

        providerOrphans.length.should.equal(1);
        providerOrphans[0].should.equal(A);

        knownOrphans.length.should.equal(0);
        duplicateCandidates.length.should.equal(0);
    });

    it('should mark a known single operation as orphan', () => {
        let { perfectMatches, providerOrphans, knownOrphans, duplicateCandidates } = diffOperations(
            [A],
            []
        );

        perfectMatches.length.should.equal(0);
        providerOrphans.length.should.equal(0);

        knownOrphans.length.should.equal(1);
        knownOrphans[0].should.equal(A);

        duplicateCandidates.length.should.equal(0);
    });

    it('should merge a single operation when the dates are separated by 1 day', () => {
        let changedA = u(
            {
                date: moment(A.date)
                    .add(1, 'day')
                    .toDate()
            },
            A
        );

        let { perfectMatches, providerOrphans, knownOrphans, duplicateCandidates } = diffOperations(
            [A],
            [changedA]
        );

        perfectMatches.length.should.equal(0);
        providerOrphans.length.should.equal(0);
        knownOrphans.length.should.equal(0);

        duplicateCandidates.length.should.equal(1);
        let pair = duplicateCandidates[0];
        pair[0].should.equal(A);
        pair[1].should.equal(changedA);
    });

    it('should select the operation with the closest date as duplicate, and detect the other as orphan', () => {
        let changedA = u(
            {
                date: moment(A.date)
                    .add(1, 'day')
                    .toDate()
            },
            A
        );

        let youngerA = u(
            {
                date: moment(A.date)
                    .add(2, 'day')
                    .toDate()
            },
            A
        );

        let { perfectMatches, providerOrphans, knownOrphans, duplicateCandidates } = diffOperations(
            [A],
            [changedA, youngerA]
        );

        perfectMatches.length.should.equal(0);
        providerOrphans.length.should.equal(1);
        providerOrphans[0].should.equal(youngerA);
        knownOrphans.length.should.equal(0);

        duplicateCandidates.length.should.equal(1);
        let pair = duplicateCandidates[0];
        pair[0].should.equal(A);
        pair[1].should.equal(changedA);
    });

    it('should merge an operation if the provided operation has an unknown type.', () => {
        let changedA = u(
            {
                type: UNKNOWN_OPERATION_TYPE
            },
            A
        );

        let { perfectMatches, providerOrphans, knownOrphans, duplicateCandidates } = diffOperations(
            [A],
            [changedA]
        );

        perfectMatches.length.should.equal(1);
        providerOrphans.length.should.equal(0);
        knownOrphans.length.should.equal(0);

        duplicateCandidates.length.should.equal(0);
    });

    it('should merge an operation if the known operation has an unknown type.', () => {
        let changedA = u(
            {
                type: UNKNOWN_OPERATION_TYPE
            },
            A
        );

        let { perfectMatches, providerOrphans, knownOrphans, duplicateCandidates } = diffOperations(
            [changedA],
            [A]
        );

        perfectMatches.length.should.equal(1);
        providerOrphans.length.should.equal(0);
        knownOrphans.length.should.equal(0);

        duplicateCandidates.length.should.equal(0);
    });

    it('should merge an operation if the known operation has an unknown debitDate.', () => {
        let changedA = { ...A };
        delete changedA.debitDate;

        let { perfectMatches, providerOrphans, knownOrphans, duplicateCandidates } = diffOperations(
            [changedA],
            [A]
        );

        perfectMatches.length.should.equal(1);
        providerOrphans.length.should.equal(0);
        knownOrphans.length.should.equal(0);

        duplicateCandidates.length.should.equal(0);
    });
});

describe('diffing operation when there are several operations', () => {
    it('should find perfect matches in any order', () => {
        let { perfectMatches, providerOrphans, knownOrphans, duplicateCandidates } = diffOperations(
            [A, B, C],
            [copyB, copyC, copyA]
        );

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
        let { perfectMatches, providerOrphans, knownOrphans, duplicateCandidates } = diffOperations(
            [A, B, C],
            [copyB, copyC]
        );

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
        let { perfectMatches, providerOrphans, knownOrphans, duplicateCandidates } = diffOperations(
            [A, B],
            [A, copyB, C]
        );

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

    it('should not merge operations that are too different', () => {
        let { perfectMatches, providerOrphans, knownOrphans, duplicateCandidates } = diffOperations(
            [A, B],
            [C]
        );

        perfectMatches.length.should.equal(0);

        knownOrphans.length.should.equal(2);
        knownOrphans[0].should.equal(A);
        knownOrphans[1].should.equal(B);

        providerOrphans.length.should.equal(1);
        providerOrphans[0].should.equal(C);

        duplicateCandidates.length.should.equal(0);
    });
});
