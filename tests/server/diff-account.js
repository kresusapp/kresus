import assert from 'node:assert';

import diffAccounts, { testing } from '../../server/lib/diff-accounts';
import { SOURCE_NAME as MANUAL_BANK_NAME } from '../../server/providers/manual';

let A = {
    accessId: 0,
    label: 'Checking account',
    vendorAccountId: '1234abcd',
    iban: null,
    currency: null,
};

let copyA = structuredClone(A);

let B = {
    accessId: 0,
    label: 'Savings account',
    vendorAccountId: '0147200001',
    iban: '1234 5678 9012 34',
    currency: 'dogecoin',
};

let copyB = structuredClone(B);

// Same currency as B, to make sure it's not merged with B by default.
let C = {
    accessId: 0,
    label: 'Bury me with my money',
    vendorAccountId: 'theInternetz',
    currency: 'dogecoin',
};

let copyC = structuredClone(C);

describe("diffing account when there's only one account", () => {
    it('should return an exact match for the same account', () => {
        let { perfectMatches, providerOrphans, knownOrphans, duplicateCandidates } = diffAccounts(
            [A],
            [copyA],
            'whatever'
        );

        assert.strictEqual(perfectMatches.length, 1);

        let match = perfectMatches[0];
        assert.strictEqual(match[0], A);
        assert.strictEqual(match[1], copyA);

        assert.strictEqual(providerOrphans.length, 0);
        assert.strictEqual(knownOrphans.length, 0);
        assert.strictEqual(duplicateCandidates.length, 0);
    });

    it("should insert a single provider's account", () => {
        let { perfectMatches, providerOrphans, knownOrphans, duplicateCandidates } = diffAccounts(
            [],
            [A],
            'whatever'
        );

        assert.strictEqual(perfectMatches.length, 0);

        assert.strictEqual(providerOrphans.length, 1);
        assert.strictEqual(providerOrphans[0], A);

        assert.strictEqual(knownOrphans.length, 0);
        assert.strictEqual(duplicateCandidates.length, 0);
    });

    it('should mark a known single account as orphan', () => {
        let { perfectMatches, providerOrphans, knownOrphans, duplicateCandidates } = diffAccounts(
            [A],
            [],
            'whatever'
        );

        assert.strictEqual(perfectMatches.length, 0);
        assert.strictEqual(providerOrphans.length, 0);

        assert.strictEqual(knownOrphans.length, 1);
        assert.strictEqual(knownOrphans[0], A);

        assert.strictEqual(duplicateCandidates.length, 0);
    });

    it('should merge a single account when an iban has been added', () => {
        let changedA = {
            ...structuredClone(A),
            iban: '1234 5678 9012 34',
        };

        let { perfectMatches, providerOrphans, knownOrphans, duplicateCandidates } = diffAccounts(
            [A],
            [changedA],
            'whatever'
        );

        assert.strictEqual(perfectMatches.length, 0);
        assert.strictEqual(providerOrphans.length, 0);
        assert.strictEqual(knownOrphans.length, 0);

        assert.strictEqual(duplicateCandidates.length, 1);
        let pair = duplicateCandidates[0];
        assert.strictEqual(pair[0], A);
        assert.strictEqual(pair[1], changedA);
    });

    it('should merge a single account when the account number has been changed', () => {
        let changedA = {
            ...structuredClone(A),
            vendorAccountId: 'lolololol',
        };
        let { perfectMatches, providerOrphans, knownOrphans, duplicateCandidates } = diffAccounts(
            [A],
            [changedA],
            'whatever'
        );

        assert.strictEqual(perfectMatches.length, 0);
        assert.strictEqual(providerOrphans.length, 0);
        assert.strictEqual(knownOrphans.length, 0);

        assert.strictEqual(duplicateCandidates.length, 1);
        let pair = duplicateCandidates[0];
        assert.strictEqual(pair[0], A);
        assert.strictEqual(pair[1], changedA);
    });
});

describe('diffing account when there are several accounts', () => {
    it('should find perfect matches in any order', () => {
        let { perfectMatches, providerOrphans, knownOrphans, duplicateCandidates } = diffAccounts(
            [A, B, C],
            [copyB, copyC, copyA],
            'whatever'
        );

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
        let { perfectMatches, providerOrphans, knownOrphans, duplicateCandidates } = diffAccounts(
            [A, B, C],
            [copyB, copyC],
            'whatever'
        );

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
        let { perfectMatches, providerOrphans, knownOrphans, duplicateCandidates } = diffAccounts(
            [A, B],
            [A, copyB, C],
            'whatever'
        );

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

    it('should provide meaningful merges', () => {
        let otherB = { ...structuredClone(B), iban: null };
        let otherC = {
            ...structuredClone(C),
            label: 'Comptes de Perrault',
            iban: '1234 5678 9012 34', // That's B's iban
        };

        let { perfectMatches, providerOrphans, knownOrphans, duplicateCandidates } = diffAccounts(
            [A, B, C],
            [otherB, otherC],
            'whatever'
        );

        assert.strictEqual(perfectMatches.length, 0);

        assert.strictEqual(knownOrphans.length, 1);
        assert.strictEqual(knownOrphans[0], A);

        assert.strictEqual(providerOrphans.length, 0);

        assert.strictEqual(duplicateCandidates.length, 2);

        let pair = duplicateCandidates[0];
        assert.strictEqual(pair[0], B);
        assert.strictEqual(pair[1], otherB);

        pair = duplicateCandidates[1];
        assert.strictEqual(pair[0], C);
        assert.strictEqual(pair[1], otherC);
    });

    it('should not merge accounts that are too different', () => {
        let { perfectMatches, providerOrphans, knownOrphans, duplicateCandidates } = diffAccounts(
            [A, B],
            [C],
            'whatever'
        );

        assert.strictEqual(perfectMatches.length, 0);

        assert.strictEqual(knownOrphans.length, 2);
        assert.strictEqual(knownOrphans[0], A);
        assert.strictEqual(knownOrphans[1], B);

        assert.strictEqual(providerOrphans.length, 1);
        assert.strictEqual(providerOrphans[0], C);

        assert.strictEqual(duplicateCandidates.length, 0);
    });

    it('should return a higher compute paire score for manual accounts with different labels as long as vendorAccountId is identical', () => {
        // The minimum score is 4 (iban + currency + type all equal to 1, plus 1).
        // An identical vendorAccountId is worth 5 points, which makes the label check
        // kind of irrelevant. This test however exists in case the minimum
        // score evolves.

        const first = {
            accessId: 0,
            label: 'Checking account',
            vendorAccountId: '1234abcd',
        };
        const same = {
            ...structuredClone(first),
            label: 'Compte chèque',
            iban: '1234 5678 9012 34',
        };

        const { computePairScore } = testing;

        // Without a manual bank.
        assert.strictEqual(computePairScore(first, same, 'whatever'), 7);

        // Without a manual bank.
        assert.strictEqual(computePairScore(first, same, MANUAL_BANK_NAME), 12);
    });
});
