import { assert } from '../helpers';

function tryPerfectMatch(known, provideds) {
    for (let i = 0; i < provideds.length; i++) {
        let provided = provideds[i];
        assert(known.bank === provided.bank, 'data inconsistency');

        // Normalize data.
        let oldTitle = provided.title.replace(/ /g, '').toLowerCase();
        let newTitle = known.title.replace(/ /g, '').toLowerCase();

        if (
            oldTitle === newTitle &&
            provided.accountNumber === known.accountNumber &&
            provided.iban === known.iban &&
            provided.currency === known.currency
        ) {
            return {
                providedIndex: i,
                providedAccount: provided
            };
        }
    }
    return null;
}

const HEURISTICS = {
    SAME_TITLE: 5,
    SAME_ACCOUNT_NUMBER: 5,
    SAME_IBAN: 1,
    SAME_CURRENCY: 1
};

// The minimum similarity to consider two accounts are the same.
const MIN_SIMILARITY = HEURISTICS.SAME_IBAN + HEURISTICS.SAME_CURRENCY + 1;

function computeScoreMatrix(knowns, provideds) {
    let scores = [];

    for (let i = 0; i < knowns.length; i++) {
        let known = knowns[i];

        scores.push([]);

        for (let j = 0; j < provideds.length; j++) {
            let provided = provideds[j];

            // Normalize data.
            let oldTitle = provided.title.replace(/ /g, '').toLowerCase();
            let newTitle = known.title.replace(/ /g, '').toLowerCase();
            let titleScore = oldTitle === newTitle ? HEURISTICS.SAME_TITLE : 0;

            let accountNumberScore =
                known.accountNumber === provided.accountNumber ? HEURISTICS.SAME_ACCOUNT_NUMBER : 0;
            let ibanScore = known.iban === provided.iban ? HEURISTICS.SAME_IBAN : 0;
            let currencyScore = known.currency === provided.currency ? HEURISTICS.SAME_CURRENCY : 0;

            scores[i][j] = titleScore + accountNumberScore + ibanScore + currencyScore;
        }
    }

    return scores;
}

function findOptimalMerges(knowns, provideds) {
    let scoreMatrix = computeScoreMatrix(knowns, provideds);

    // Use a greedy strategy: find the first pairing that maximizes similarity,
    // then remove both columns; then find the pairing that maximizes
    // similarity, etc.

    let duplicateCandidates = [];

    while (knowns.length && provideds.length) {
        let max = MIN_SIMILARITY;
        let indexes = null;

        // Find max.
        for (let i = 0; i < knowns.length; i++) {
            for (let j = 0; j < provideds.length; j++) {
                if (scoreMatrix[i][j] > max) {
                    max = scoreMatrix[i][j];
                    indexes = { i, j };
                }
            }
        }

        if (indexes === null) {
            break;
        }

        let pair = [knowns.splice(indexes.i, 1)[0], provideds.splice(indexes.j, 1)[0]];

        // Remove line indexes.i and column indexes.j from the score matrix.
        for (let i = 0; i < scoreMatrix.length; i++) {
            scoreMatrix[i].splice(indexes.j, 1);
        }
        scoreMatrix.splice(indexes.i, 1);

        duplicateCandidates.push(pair);
    }

    return duplicateCandidates;
}

// Given a list of `known` accounts (known to Kresus and saved into the
// database), and a list of accounts `provided` by the source backend, compute
// a diff between the twos. Returns an object containing the following fields:
//
// - perfectMatches: An array consisting of pairs of accounts that are surely
// the same, meaning most information is the same.
// - providerOrphans: a list of orphan accounts only known by the provider, not
// by Kresus.
// - knownOrphans: a list of orphan accounts only known by Kresus but not by
// the provider.
// - duplicateCandidates: a list of potential duplicate accounts. That happens
// when two accounts are not perfect matches but they could be. In this case,
// Kresus tries to infer what's the most likely match, and will return only
// this one.
export default function diffAccount(known, provided) {
    let unprocessed = known;
    let nextUnprocessed = [];

    // 1. Find perfect matches.

    let perfectMatches = [];
    for (let target of unprocessed) {
        let match = tryPerfectMatch(target, provided);
        if (match) {
            provided.splice(match.providedIndex, 1);
            perfectMatches.push([target, match.providedAccount]);
        } else {
            nextUnprocessed.push(target);
        }
    }

    unprocessed = nextUnprocessed;

    // 2. Find potential duplicates.

    let duplicateCandidates = findOptimalMerges(unprocessed, provided);

    // 3. Conclude.

    let knownOrphans = unprocessed;
    let providerOrphans = provided;

    return {
        perfectMatches,
        providerOrphans,
        knownOrphans,
        duplicateCandidates
    };
}
