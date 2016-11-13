import {
    assert
} from '../helpers';

function tryPerfectMatch(known, provideds) {
    for (let i = 0; i < provideds.length; i++) {
        let provided = provideds[i];
        assert(known.bank === provided.bank, "data inconsistency");

        // Normalize data.
        let oldTitle = provided.title.replace(/ /g, '').toLowerCase();
        let newTitle = target.title.replace(/ /g, '').toLowerCase();

        if (oldTitle === newTitle &&
            provided.accountNumber === target.accountNumber &&
            provided.iban === target.iban &&
            provided.currency === target.currency) {
            return {
                providedIndex: i,
                providedAccount: provided
            };
        }
    }
    return null;
}

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
            let titleScore = oldTitle === newTitle ? 1 : 0;

            let accountNumberScore = known.accountNumber === provided.accountNumber ? 1 : 0;
            let ibanScore = known.iban === provided.iban ? 1 : 0;
            let currencyScore = known.currency === provided.currency ? 1 : 0;

            scores[i][j] = titleScore + accountNumberScore + ibanScore + currencyScore;
        }
    }

    return scores;
}

function deepCopyMatrix(m) {
    let ret = [];
    for (let i = 0; i < m.length; i++) {
        ret.push([]);
        for (let j = 0; j < m[i].length; j++) {
            ret[i][j] = m[i][j];
        }
    }
    return ret;
}

function findOptimalMerge(knowns, provideds) {
    let scores = [];

    let imax = knowns.length;
    let jmax = provideds.length;

    for (let i = 0; i < knowns.length; i++) {
        scores.push([]);
        for (let j = 0; j < provideds.length; j++) {

        }
    }
}

// Given a list of `known` accounts (known to Kresus and saved into the
// database), and a list of accounts `provided` by the source backend, compute
// a diff between the twos. Returns an object containing the following fields:
//
// - perfectMatch: An array consisting of pairs of accounts that are surely the
// same, meaning most information is the same.
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
    nextUnprocessed = [];

    // 2. Find potential duplicates.

    let duplicateCandidates = [];
    let scoreMatrix = computeScoreMatrix(unprocessed, provided);
    // TODO FIXME XXX bnjbvr: continue here

    // 3. Conclude.

    let knownOrphans = nextUnprocessed;
    let providerOrphans = provided;

    return {
        perfectMatches,
        providerOrphans,
        knownOrphans,
        duplicateCandidates
    };
}
