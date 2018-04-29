import { assert } from '../helpers';
import makeDiff from './diff-list';

function isPerfectMatch(known, provided) {
    assert(known.bank === provided.bank, 'data inconsistency');
    let newTitle = known.title.replace(/ /g, '').toLowerCase();
    let oldTitle = provided.title.replace(/ /g, '').toLowerCase();
    return (
        oldTitle === newTitle &&
        provided.accountNumber === known.accountNumber &&
        ((!provided.iban && !known.iban) || provided.iban === known.iban) &&
        provided.currency === known.currency &&
        provided.type === known.type
    );
}

const HEURISTICS = {
    SAME_TITLE: 5,
    SAME_ACCOUNT_NUMBER: 5,
    SAME_IBAN: 1,
    SAME_CURRENCY: 1,
    SAME_TYPE: 1
};

// The minimum similarity to consider two accounts are the same.
const MIN_SIMILARITY = HEURISTICS.SAME_IBAN + HEURISTICS.SAME_CURRENCY + HEURISTICS.SAME_TYPE + 1;

function computePairScore(known, provided) {
    // Normalize data.
    let oldTitle = provided.title.replace(/ /g, '').toLowerCase();
    let newTitle = known.title.replace(/ /g, '').toLowerCase();
    let titleScore = oldTitle === newTitle ? HEURISTICS.SAME_TITLE : 0;

    let accountNumberScore =
        known.accountNumber === provided.accountNumber ? HEURISTICS.SAME_ACCOUNT_NUMBER : 0;
    let ibanScore = known.iban === provided.iban ? HEURISTICS.SAME_IBAN : 0;
    let currencyScore = known.currency === provided.currency ? HEURISTICS.SAME_CURRENCY : 0;
    let typeScore = known.type === provided.type ? HEURISTICS.SAME_TYPE : 0;
    return titleScore + accountNumberScore + ibanScore + currencyScore + typeScore;
}

const diffAccount = makeDiff(isPerfectMatch, computePairScore, MIN_SIMILARITY);
export default diffAccount;
