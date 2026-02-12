import makeDiff from './diff-list';
import { getDuplicatePairScore } from './duplicates-manager';
import type { MinimalTransaction, Transaction } from '../models';

function isPerfectMatch(known: Transaction, provided: MinimalTransaction): boolean {
    return (
        getDuplicatePairScore(known, provided, 0, false, false) === 1 &&
        known.type === provided.type
    );
}

const MAX_DATE_DIFFERENCE = 2;

/* getDuplicateScore will remove 0.1 for each days difference (we allow 2), and 0.1 for any label difference */
const MIN_SIMILARITY = 1 - (0.1 * MAX_DATE_DIFFERENCE + 0.1);

function computePairScore(known: Transaction, provided: MinimalTransaction): number {
    return getDuplicatePairScore(known, provided, MAX_DATE_DIFFERENCE, false);
}

const diffTransactions = makeDiff<Transaction, MinimalTransaction>(
    isPerfectMatch,
    computePairScore,
    MIN_SIMILARITY
);
export default diffTransactions;
