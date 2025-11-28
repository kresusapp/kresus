import { UNKNOWN_TRANSACTION_TYPE, NONE_CATEGORY_ID, makeLogger } from '../helpers';

import type { Transaction } from '../models';

const log = makeLogger('duplicates-manager');

/**
 * Returns a score between 0 and 1 indicating if two transactions are duplicates.
 * 0 means not duplicates, 1 means duplicates.
 */
export function getDuplicatePairScore(
    tr: Transaction,
    next: Transaction,
    threshold: number,
    ignoreDuplicatesWithDifferentCustomFields: boolean
): number {
    const diffAmount = Math.abs(next.amount - tr.amount);
    if (diffAmount > 0.001) {
        return 0;
    }

    // TODO: mutualize with diff-transactions.ts
    // TODO: build score based on labels & levenshtein distance

    // Two transactions are duplicates only if they were not imported at the same date.
    if (+tr.importDate === +next.importDate) {
        return 0;
    }

    const datediff = Math.abs(+tr.date - +next.date);
    if (datediff <= threshold) {
        if (ignoreDuplicatesWithDifferentCustomFields) {
            // If both transactions have a defined type, category or custom label and one of
            // these fields differ between the two transactions, do no count it as a
            // duplicate.
            if (tr.customLabel && next.customLabel && tr.customLabel !== next.customLabel) {
                return 0;
            }

            if (
                tr.type !== UNKNOWN_TRANSACTION_TYPE &&
                next.type !== UNKNOWN_TRANSACTION_TYPE &&
                tr.type !== next.type
            ) {
                return 0;
            }

            const trCategoryId = tr.categoryId ?? NONE_CATEGORY_ID;
            const nextCategoryId = next.categoryId ?? NONE_CATEGORY_ID;

            if (
                trCategoryId !== NONE_CATEGORY_ID &&
                nextCategoryId !== NONE_CATEGORY_ID &&
                trCategoryId !== nextCategoryId
            ) {
                return 0;
            }
        }

        return 1;
    }

    return 0;
}

export function findRedundantPairs(
    transactions: Transaction[],
    duplicateThreshold: number,
    ignoreDuplicatesWithDifferentCustomFields: boolean
): [Transaction['id'], Transaction['id']][] {
    const before = Date.now();
    log.debug('Running findRedundantPairs algorithm...');
    log.debug(`Input: ${transactions.length} transactions`);
    const similar = [];

    // duplicateThreshold is in hours
    const threshold = duplicateThreshold * 60 * 60 * 1000;
    log.debug(`Threshold: ${threshold}`);

    // O(n log n)
    const sorted = transactions.slice().sort((a, b) => a.amount - b.amount);
    for (let i = 0; i < transactions.length; ++i) {
        const tr = sorted[i];
        let j = i + 1;
        while (j < transactions.length) {
            const next = sorted[j];

            const duplicateScore = getDuplicatePairScore(
                tr,
                next,
                threshold,
                ignoreDuplicatesWithDifferentCustomFields
            );

            if (duplicateScore > 0) {
                similar.push([tr, next]);
            }

            j += 1;
        }
    }

    log.debug(`${similar.length} pairs of similar transactions found`);
    log.debug(`findRedundantPairs took ${Date.now() - before}ms.`);

    // The duplicates are sorted from last imported to first imported
    similar.sort(
        (a, b) =>
            Math.max(+b[0].importDate, +b[1].importDate) -
            Math.max(+a[0].importDate, +a[1].importDate)
    );

    return similar.map(([trA, trB]) => [trA.id, trB.id]);
}
