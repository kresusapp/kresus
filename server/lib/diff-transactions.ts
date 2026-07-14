import makeDiff, { DiffParams } from './diff-list';
import { getDuplicatePairScore } from './duplicates-manager';
import type { MinimalTransaction, Transaction } from '../models';

function isPerfectMatch(
    known: Transaction,
    provided: MinimalTransaction,
    params?: DiffParams
): boolean {
    return (
        getDuplicatePairScore(
            known,
            provided,
            params?.perfectMatchMaxDateThreshold ?? 0,
            false,
            false
        ) === 1 &&
        known.type === provided.type &&
        !!known.isRecurrentTransaction === !!provided.isRecurrentTransaction &&
        !!known.createdByUser === !!provided.createdByUser
    );
}

const MAX_DATE_DIFFERENCE = 2;

/* getDuplicateScore will remove 0.1 for any label difference */
const MIN_SIMILARITY = 1 - 0.1;

function computePairScore(known: Transaction, provided: MinimalTransaction): number {
    return getDuplicatePairScore(known, provided, MAX_DATE_DIFFERENCE, false);
}

const diffTransactions = makeDiff<Transaction, MinimalTransaction>(
    isPerfectMatch,
    computePairScore,
    MIN_SIMILARITY
);
export default diffTransactions;
