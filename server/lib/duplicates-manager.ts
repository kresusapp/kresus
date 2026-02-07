import moment from 'moment';

import { UNKNOWN_TRANSACTION_TYPE, NONE_CATEGORY_ID, makeLogger } from '../helpers';

import type { MinimalTransaction, Transaction } from '../models';

const log = makeLogger('duplicates-manager');

const isMinimalTransaction = (tr: any): tr is MinimalTransaction =>
    typeof tr.rawLabel !== 'undefined' &&
    typeof tr.date !== 'undefined' &&
    typeof tr.amount !== 'undefined';

/**
 * Returns a score between 0 and 1 indicating if two transactions are duplicates.
 * 0 means not duplicates, 1 means duplicates.
 *
 * @param threshold in days
 */
export function getDuplicatePairScore(
    tr: Transaction,
    next: MinimalTransaction,
    threshold: number,
    ignoreDuplicatesWithDifferentCustomFields: boolean,
    ignoreIfSameImportDate = true
): number {
    const diffAmount = Math.abs(next.amount - tr.amount);
    if (diffAmount > 0.001) {
        return 0;
    }

    // Two transactions are duplicates only if they were not imported at the same date.
    if (ignoreIfSameImportDate && +tr.importDate === +next.importDate) {
        return 0;
    }

    const datediff = Math.abs(moment(tr.date).diff(moment(next.date), 'days'));

    if (datediff > threshold) {
        return 0;
    }

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

    let score = 1;

    // If the dates differ, decrease the score.
    if (datediff > 0) {
        score -= 0.1;
    }

    // If the labels do not match exactly, decrease the score.
    // TODO: build score based on labels & levenshtein distance
    const trRawLabel = tr.rawLabel.replace(/ /g, '').toLowerCase();
    const nextRawLabel = next.rawLabel.replace(/ /g, '').toLowerCase();
    if (trRawLabel !== nextRawLabel) {
        score -= 0.1;
    }

    return score;
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

    // duplicateThreshold is in hours, transform it to days
    const threshold = Math.round(duplicateThreshold / 24);
    log.debug(`Threshold: ${threshold}`);

    // O(n log n)
    // Tests showed that assert'ing the rawLabel/date/amount fields inside the getDuplicatePairScore
    // was slow (650ms for 4592 transactions, vs 280 with this filter).
    const sorted = transactions.filter(isMinimalTransaction).sort((a, b) => a.amount - b.amount);

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
