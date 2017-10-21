'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = diffAccount;

var _helpers = require('../helpers');

function tryPerfectMatch(known, provideds) {
    for (var i = 0; i < provideds.length; i++) {
        var provided = provideds[i];
        (0, _helpers.assert)(known.bank === provided.bank, 'data inconsistency');

        // Normalize data.
        var oldTitle = provided.title.replace(/ /g, '').toLowerCase();
        var newTitle = known.title.replace(/ /g, '').toLowerCase();

        if (oldTitle === newTitle && provided.accountNumber === known.accountNumber && provided.iban === known.iban && provided.currency === known.currency) {
            return {
                providedIndex: i,
                providedAccount: provided
            };
        }
    }
    return null;
}

var HEURISTICS = {
    SAME_TITLE: 5,
    SAME_ACCOUNT_NUMBER: 5,
    SAME_IBAN: 1,
    SAME_CURRENCY: 1
};

// The minimum similarity to consider two accounts are the same.
var MIN_SIMILARITY = HEURISTICS.SAME_IBAN + HEURISTICS.SAME_CURRENCY + 1;

function computeScoreMatrix(knowns, provideds) {
    var scores = [];

    for (var i = 0; i < knowns.length; i++) {
        var known = knowns[i];

        scores.push([]);

        for (var j = 0; j < provideds.length; j++) {
            var provided = provideds[j];

            // Normalize data.
            var oldTitle = provided.title.replace(/ /g, '').toLowerCase();
            var newTitle = known.title.replace(/ /g, '').toLowerCase();
            var titleScore = oldTitle === newTitle ? HEURISTICS.SAME_TITLE : 0;

            var accountNumberScore = known.accountNumber === provided.accountNumber ? HEURISTICS.SAME_ACCOUNT_NUMBER : 0;
            var ibanScore = known.iban === provided.iban ? HEURISTICS.SAME_IBAN : 0;
            var currencyScore = known.currency === provided.currency ? HEURISTICS.SAME_CURRENCY : 0;

            scores[i][j] = titleScore + accountNumberScore + ibanScore + currencyScore;
        }
    }

    return scores;
}

function findOptimalMerges(knowns, provideds) {
    var scoreMatrix = computeScoreMatrix(knowns, provideds);

    // Use a greedy strategy: find the first pairing that maximizes similarity,
    // then remove both columns; then find the pairing that maximizes
    // similarity, etc.

    var duplicateCandidates = [];

    while (knowns.length && provideds.length) {
        var max = MIN_SIMILARITY;
        var indexes = null;

        // Find max.
        for (var i = 0; i < knowns.length; i++) {
            for (var j = 0; j < provideds.length; j++) {
                if (scoreMatrix[i][j] > max) {
                    max = scoreMatrix[i][j];
                    indexes = { i: i, j: j };
                }
            }
        }

        if (indexes === null) break;

        var pair = [knowns.splice(indexes.i, 1)[0], provideds.splice(indexes.j, 1)[0]];

        // Remove line indexes.i and column indexes.j from the score matrix.
        for (var _i = 0; _i < scoreMatrix.length; _i++) {
            scoreMatrix[_i].splice(indexes.j, 1);
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
function diffAccount(known, provided) {
    var unprocessed = known;
    var nextUnprocessed = [];

    // 1. Find perfect matches.

    var perfectMatches = [];
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
        for (var _iterator = unprocessed[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var target = _step.value;

            var match = tryPerfectMatch(target, provided);
            if (match) {
                provided.splice(match.providedIndex, 1);
                perfectMatches.push([target, match.providedAccount]);
            } else {
                nextUnprocessed.push(target);
            }
        }
    } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
    } finally {
        try {
            if (!_iteratorNormalCompletion && _iterator.return) {
                _iterator.return();
            }
        } finally {
            if (_didIteratorError) {
                throw _iteratorError;
            }
        }
    }

    unprocessed = nextUnprocessed;

    // 2. Find potential duplicates.

    var duplicateCandidates = findOptimalMerges(unprocessed, provided);

    // 3. Conclude.

    var knownOrphans = unprocessed;
    var providerOrphans = provided;

    return {
        perfectMatches: perfectMatches,
        providerOrphans: providerOrphans,
        knownOrphans: knownOrphans,
        duplicateCandidates: duplicateCandidates
    };
}