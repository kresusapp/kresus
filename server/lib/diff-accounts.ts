import { assert } from '../helpers';
import makeDiff from './diff-list';
import { SOURCE_NAME as MANUAL_BANK_NAME } from '../providers/manual';
import { Account } from '../models';

function isPerfectMatch(known: Account, provided: Partial<Account>): boolean {
    assert(known.vendorId === provided.vendorId, 'data inconsistency');
    assert(typeof provided.label !== 'undefined', 'account label must be defined at this point');

    const newLabel = known.label.replace(/ /g, '').toLowerCase();
    const oldLabel = provided.label.replace(/ /g, '').toLowerCase();
    return (
        oldLabel === newLabel &&
        provided.vendorAccountId === known.vendorAccountId &&
        ((!provided.iban && !known.iban) || provided.iban === known.iban) &&
        provided.currency === known.currency &&
        provided.type === known.type
    );
}

const HEURISTICS = {
    SAME_LABEL: 5,
    SAME_ACCOUNT_NUMBER: 5,
    SAME_IBAN: 1,
    SAME_CURRENCY: 1,
    SAME_TYPE: 1,
};

// The minimum similarity to consider two accounts are the same. We can't only rely on the IBAN:
// some banks sometimes provide two different accounts with the same IBAN.
const MIN_SIMILARITY = HEURISTICS.SAME_IBAN + HEURISTICS.SAME_CURRENCY + HEURISTICS.SAME_TYPE + 1;

function computePairScore(known: Account, provided: Partial<Account>): number {
    assert(typeof provided.label !== 'undefined', 'account label must be defined at this point');

    // Normalize data.
    const oldLabel = provided.label.replace(/ /g, '').toLowerCase();
    const newLabel = known.label.replace(/ /g, '').toLowerCase();

    // The manual bank accounts labels might change when the locale changes. Suppose the label
    // is identical if the access is the same and rely on the account number.
    let labelScore = 0;
    if (
        oldLabel === newLabel ||
        (known.vendorId === provided.vendorId &&
            known.accessId === provided.accessId &&
            known.vendorId === MANUAL_BANK_NAME)
    ) {
        labelScore = HEURISTICS.SAME_LABEL;
    }

    const accountIdScore =
        known.vendorAccountId === provided.vendorAccountId ? HEURISTICS.SAME_ACCOUNT_NUMBER : 0;
    const ibanScore = known.iban === provided.iban ? HEURISTICS.SAME_IBAN : 0;
    const currencyScore = known.currency === provided.currency ? HEURISTICS.SAME_CURRENCY : 0;
    const typeScore = known.type === provided.type ? HEURISTICS.SAME_TYPE : 0;
    return labelScore + accountIdScore + ibanScore + currencyScore + typeScore;
}

const diffAccount = makeDiff<Account>(isPerfectMatch, computePairScore, MIN_SIMILARITY);
export default diffAccount;
