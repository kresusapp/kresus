import { ModelEvent, modelEvents } from '../models/events';
import type { DuplicatesPairList } from '../shared/types';

// The settings used to compute the pairs are stored along with them, so that a change in the
// settings automatically invalidates the entry.
type Entry = {
    threshold: number;
    ignoreDifferentCustomFields: boolean;
    // The pairs of duplicates, *including* the pairs ignored by the user.
    pairs: DuplicatesPairList;
};

type UserCache = {
    // Incremented on each invalidation, to detect that transactions changed while duplicates were
    // being computed.
    version: number;
    accounts: Map<number, Entry>;
};

const cache = new Map<number, UserCache>();

const getUserCache = (userId: number): UserCache => {
    let userCache = cache.get(userId);
    if (!userCache) {
        userCache = { version: 0, accounts: new Map() };
        cache.set(userId, userCache);
    }
    return userCache;
};

/**
 * Returns an opaque token to pass to `setCachedDuplicates`, so that a result computed from
 * transactions which were modified in the meantime is not stored.
 *
 * Example of the race this prevents (version is N at first):
 * 1. request A misses the cache, reads version N and starts loading the transactions
 *    (`await`);
 * 2. meanwhile, a bank sync inserts a transaction: the `transaction-created` event invalidates
 *    the cache and bumps the version to N + 1;
 * 3. request A resumes; what it loaded may not include the new transaction;
 * 4. request A computes the pairs and calls `setCachedDuplicates` with N: since the version is
 *    now N + 1, the possibly stale result is returned to the client but not stored, and the next
 *    request recomputes it.
 *
 * Without this check, the stale result would stay in the cache until the next change on the
 * account.
 */
export const getDuplicatesCacheVersion = (userId: number): number => {
    return getUserCache(userId).version;
};

export const getCachedDuplicates = (
    userId: number,
    accountId: number,
    threshold: number,
    ignoreDifferentCustomFields: boolean
): DuplicatesPairList | null => {
    const entry = cache.get(userId)?.accounts.get(accountId);
    if (
        !entry ||
        entry.threshold !== threshold ||
        entry.ignoreDifferentCustomFields !== ignoreDifferentCustomFields
    ) {
        return null;
    }
    return entry.pairs;
};

export const setCachedDuplicates = (
    userId: number,
    accountId: number,
    version: number,
    threshold: number,
    ignoreDifferentCustomFields: boolean,
    pairs: DuplicatesPairList
): void => {
    // Don't recreate the entry if it was removed in the meantime (the user was deleted).
    const userCache = cache.get(userId);
    if (!userCache || userCache.version !== version) {
        // Transactions changed while computing the duplicates: the result may be stale.
        return;
    }
    userCache.accounts.set(accountId, { threshold, ignoreDifferentCustomFields, pairs });
};

// Invalidates the given accounts of the user, or all of them if `accountIds` is not provided.
const invalidateDuplicates = (userId: number, accountIds?: number[]): void => {
    const userCache = cache.get(userId);
    if (!userCache) {
        return;
    }

    userCache.version++;

    if (accountIds) {
        for (const accountId of accountIds) {
            userCache.accounts.delete(accountId);
        }
    } else {
        userCache.accounts.clear();
    }
};

// Invalidates all the accounts of all the users, for the events which don't tell which user or
// accounts are affected.
const invalidateAllDuplicates = (): void => {
    for (const userId of cache.keys()) {
        invalidateDuplicates(userId);
    }
};

let isSetUp = false;

export function setupDuplicatesCache(): void {
    if (isSetUp) {
        return;
    }
    isSetUp = true;

    modelEvents
        .on(ModelEvent.TransactionCreated, (_manager, { transaction }) =>
            invalidateDuplicates(transaction.userId, [transaction.accountId])
        )
        // The updated or deleted transactions are not known (nor their former account, on an
        // update), so invalidate everything.
        .on(ModelEvent.TransactionsUpdated, invalidateAllDuplicates)
        .on(ModelEvent.TransactionsDeleted, invalidateAllDuplicates)
        .on(ModelEvent.AccountsDeleted, invalidateAllDuplicates)
        .on(ModelEvent.AccessesDeleted, invalidateAllDuplicates)
        // A category deletion resets the category of the attached transactions, which matters when
        // ignoring the duplicates with different custom fields.
        .on(ModelEvent.CategoriesDeleted, invalidateAllDuplicates)
        // The deleted users are not known: forget everything, the event is rare enough
        .on(ModelEvent.UsersDeleted, () => {
            cache.clear();
        });
}

export const testing = {
    invalidateDuplicates,
};
