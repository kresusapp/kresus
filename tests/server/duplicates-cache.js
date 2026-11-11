import assert from 'node:assert';

import { getAccountDuplicates, testing } from '../../server/lib/duplicates-cache';
import { Access, Account, Transaction, User } from '../../server/models';

const {
    getCachedDuplicates,
    getDuplicatesCacheVersion,
    setCachedDuplicates,
    invalidateDuplicates,
} = testing;

describe('duplicates cache', () => {
    // The cache is only kept in memory and never checks the database: the ids don't need to
    // exist.
    const USER_ID = 42;
    const ACCOUNT_ID = 1;
    const OTHER_ACCOUNT_ID = 2;

    beforeEach(() => {
        invalidateDuplicates(USER_ID);
    });

    after(() => {
        invalidateDuplicates(USER_ID);
    });

    it('should only invalidate the given account', () => {
        const version = getDuplicatesCacheVersion(USER_ID);
        setCachedDuplicates(USER_ID, ACCOUNT_ID, version, 24, true, [[1, 2]]);
        setCachedDuplicates(USER_ID, OTHER_ACCOUNT_ID, version, 24, true, [[3, 4]]);

        invalidateDuplicates(USER_ID, [ACCOUNT_ID]);
        assert.strictEqual(getCachedDuplicates(USER_ID, ACCOUNT_ID, 24, true), null);
        assert.deepStrictEqual(getCachedDuplicates(USER_ID, OTHER_ACCOUNT_ID, 24, true), [[3, 4]]);

        // The version was bumped: a result computed before the invalidation is refused.
        setCachedDuplicates(USER_ID, ACCOUNT_ID, version, 24, true, [[1, 2]]);
        assert.strictEqual(getCachedDuplicates(USER_ID, ACCOUNT_ID, 24, true), null);
    });

    it('should forget everything when a user is deleted', async () => {
        const version = getDuplicatesCacheVersion(USER_ID);
        setCachedDuplicates(USER_ID, ACCOUNT_ID, version, 24, true, [[1, 2]]);
        assert.deepStrictEqual(getCachedDuplicates(USER_ID, ACCOUNT_ID, 24, true), [[1, 2]]);

        // The deleted users are not known to the cache, so deleting any user clears it all.
        const otherUser = await User.create({ login: 'duplicates-cache-other-user' });
        await User.destroy(otherUser.id);
        assert.strictEqual(getCachedDuplicates(USER_ID, ACCOUNT_ID, 24, true), null);

        // A result computed before the deletion is not stored.
        setCachedDuplicates(USER_ID, ACCOUNT_ID, version, 24, true, [[1, 2]]);
        assert.strictEqual(getCachedDuplicates(USER_ID, ACCOUNT_ID, 24, true), null);
    });

    it('should not store a result computed while transactions changed', () => {
        const version = getDuplicatesCacheVersion(USER_ID);
        invalidateDuplicates(USER_ID);
        setCachedDuplicates(USER_ID, ACCOUNT_ID, version, 24, true, [[1, 2]]);
        assert.strictEqual(getCachedDuplicates(USER_ID, ACCOUNT_ID, 24, true), null);

        const newVersion = getDuplicatesCacheVersion(USER_ID);
        setCachedDuplicates(USER_ID, ACCOUNT_ID, newVersion, 24, true, [[1, 2]]);
        assert.deepStrictEqual(getCachedDuplicates(USER_ID, ACCOUNT_ID, 24, true), [[1, 2]]);
        assert.strictEqual(getCachedDuplicates(USER_ID, ACCOUNT_ID, 48, true), null);
    });

    describe('getAccountDuplicates', () => {
        let userId;
        let accountId;

        const makeTransaction = importDate => ({
            accountId,
            type: 'type.unknown',
            label: 'Duplicate',
            rawLabel: 'Duplicate',
            amount: -42,
            date: new Date('2026-01-01'),
            importDate,
        });

        before(async () => {
            const user = await User.create({ login: 'duplicates-cache-user' });
            userId = user.id;
            const access = await Access.create(userId, {
                login: 'login',
                password: 'password',
                vendorId: 'whatever',
            });
            const account = await Account.create(userId, {
                accessId: access.id,
                vendorAccountId: 'duplicates-cache-account',
                label: 'Duplicates cache account',
                initialBalance: 0,
                importDate: new Date(),
                lastCheckDate: new Date(),
            });
            accountId = account.id;
        });

        after(async () => {
            await User.destroy(userId);
        });

        it('should compute the duplicates on a miss and recompute them once invalidated', async () => {
            const first = await Transaction.create(userId, makeTransaction(new Date('2026-01-02')));
            const second = await Transaction.create(
                userId,
                makeTransaction(new Date('2026-01-03'))
            );

            const pairs = await getAccountDuplicates(userId, accountId, 24, false);
            assert.strictEqual(pairs.length, 1);
            assert.deepStrictEqual([...pairs[0]].sort(), [first.id, second.id].sort());

            // The result is cached.
            assert.strictEqual(getCachedDuplicates(userId, accountId, 24, false), pairs);

            // Creating a transaction invalidates the cache of the account...
            await Transaction.create(userId, makeTransaction(new Date('2026-01-04')));
            assert.strictEqual(getCachedDuplicates(userId, accountId, 24, false), null);

            // ...and the duplicates are recomputed with it.
            const newPairs = await getAccountDuplicates(userId, accountId, 24, false);
            assert.strictEqual(newPairs.length, 3);
        });
    });
});
