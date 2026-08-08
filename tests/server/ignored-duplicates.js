import assert from 'node:assert';

import { importData } from '../../server/controllers/all';
import { findIgnoredDuplicates, findRedundantPairs } from '../../server/lib/duplicates-manager';

import {
    Access,
    Account,
    DuplicatesIgnored,
    Setting,
    Transaction,
    User,
} from '../../server/models';

async function cleanAll(userId) {
    await DuplicatesIgnored.destroyAll(userId);
    await Access.destroyAll(userId);
    await Account.destroyAll(userId);
    await Setting.destroyAll(userId);
    await Transaction.destroyAll(userId);
}

const world = {
    accesses: [
        {
            id: 0,
            vendorId: 'demo',
            login: 'whatever',
            password: 'whatever',
        },
    ],
    accounts: [
        {
            id: 0,
            accessId: 0,
            vendorAccountId: 'ignored-duplicates-test-account',
            type: 'account-type.checking',
            initialBalance: 0,
            balance: 0,
            label: 'Compte test',
            currency: 'EUR',
            importDate: new Date('2020-01-01T00:00:00.000Z'),
        },
    ],
    transactions: [
        {
            accountId: 0,
            type: 'type.card',
            label: 'Loyer',
            rawLabel: 'Loyer',
            amount: -300,
            date: new Date('2020-05-04T00:00:00.000Z'),
            importDate: new Date('2020-05-04T00:00:00.000Z'),
        },
        {
            accountId: 0,
            type: 'type.card',
            label: 'Loyer',
            rawLabel: 'Loyer',
            amount: -300,
            date: new Date('2020-05-05T00:00:00.000Z'),
            importDate: new Date('2020-05-06T00:00:00.000Z'),
        },
    ],
};

describe('ignored duplicates', () => {
    let USER_ID = null;
    let accountId = null;
    let transactions = null;

    before(async () => {
        // Reload the USER_ID from the database, since process.kresus.defaultUser.id
        // might have been clobbered by another test.
        const users = await User.all();
        if (!users.length) {
            throw new Error('user should have been created!');
        }
        USER_ID = users[0].id;
        if (typeof USER_ID !== 'number') {
            throw new Error('missing user id in test.');
        }
    });

    beforeEach(async () => {
        await cleanAll(USER_ID);
        await importData(USER_ID, structuredClone(world));

        accountId = (await Account.all(USER_ID))[0].id;
        transactions = await Transaction.byAccount(USER_ID, accountId);
        assert.strictEqual(transactions.length, 2);
    });

    // Detects the duplicates of the test account, discarding the ignored ones, the same way the
    // /duplicates endpoint does. The threshold is expressed in hours.
    async function detectDuplicates(threshold = 30) {
        const ignored = await findIgnoredDuplicates(USER_ID);

        return findRedundantPairs(
            await Transaction.byAccount(USER_ID, accountId),
            threshold,
            false,
            ignored.flatMap(item => item.duplicates)
        );
    }

    it('should detect the pair as a duplicate when it is not ignored', async () => {
        assert.strictEqual((await detectDuplicates()).length, 1);
        assert.deepStrictEqual(await findIgnoredDuplicates(USER_ID), []);
    });

    it('should move the pair to the ignored list once ignored', async () => {
        await DuplicatesIgnored.create(USER_ID, transactions[0].id, transactions[1].id);

        assert.strictEqual((await detectDuplicates()).length, 0);

        const ignored = await findIgnoredDuplicates(USER_ID);
        assert.strictEqual(ignored.length, 1);
        assert.strictEqual(ignored[0].accountId, accountId);
        assert.deepStrictEqual(
            ignored[0].duplicates[0].slice().sort((a, b) => a - b),
            [transactions[0].id, transactions[1].id].sort((a, b) => a - b)
        );
    });

    it('should ignore the pair whatever the order of the two ids', async () => {
        await DuplicatesIgnored.create(USER_ID, transactions[1].id, transactions[0].id);

        assert.strictEqual((await detectDuplicates()).length, 0);
        assert.strictEqual((await findIgnoredDuplicates(USER_ID)).length, 1);
    });

    it('should not store the same pair twice', async () => {
        await DuplicatesIgnored.create(USER_ID, transactions[0].id, transactions[1].id);
        await DuplicatesIgnored.create(USER_ID, transactions[1].id, transactions[0].id);

        const all = await DuplicatesIgnored.all(USER_ID);
        assert.strictEqual(all.length, 1);
    });

    it('should detect the pair again once un-ignored', async () => {
        await DuplicatesIgnored.create(USER_ID, transactions[0].id, transactions[1].id);
        await DuplicatesIgnored.destroy(USER_ID, transactions[1].id, transactions[0].id);

        assert.strictEqual((await detectDuplicates()).length, 1);
        assert.deepStrictEqual(await findIgnoredDuplicates(USER_ID), []);
    });

    it('should list an ignored pair even when it is not detected as a duplicate anymore', async () => {
        await DuplicatesIgnored.create(USER_ID, transactions[0].id, transactions[1].id);

        // A threshold of 0 day: the two transactions are one day apart, they're not duplicates
        // anymore.
        assert.strictEqual((await detectDuplicates(0)).length, 0);
        assert.strictEqual((await findIgnoredDuplicates(USER_ID)).length, 1);
    });

    it('should list the ignored pairs grouped by account', async () => {
        assert.deepStrictEqual(await findIgnoredDuplicates(USER_ID), []);

        await DuplicatesIgnored.create(USER_ID, transactions[0].id, transactions[1].id);

        const ignored = await findIgnoredDuplicates(USER_ID);
        assert.strictEqual(ignored.length, 1);
        assert.strictEqual(ignored[0].accountId, accountId);
        assert.strictEqual(ignored[0].duplicates.length, 1);
        assert.deepStrictEqual(
            ignored[0].duplicates[0].slice().sort((a, b) => a - b),
            [transactions[0].id, transactions[1].id].sort((a, b) => a - b)
        );
    });

    it('should remove the ignored pair when one of the transactions is deleted', async () => {
        await DuplicatesIgnored.create(USER_ID, transactions[0].id, transactions[1].id);

        await Transaction.destroy(USER_ID, transactions[0].id);

        const all = await DuplicatesIgnored.all(USER_ID);
        assert.strictEqual(all.length, 0);
    });
});
