import assert from 'node:assert';

import { Access, Account, DuplicatesIgnored, Transaction, User } from '../../server/models';
import { testing, importData } from '../../server/controllers/all';

const { getAllData: exportData } = testing;

async function cleanAll(userId) {
    await DuplicatesIgnored.destroyAll(userId);
    await Access.destroyAll(userId);
    await Account.destroyAll(userId);
    await Transaction.destroyAll(userId);
}

// Returns the pairs in a comparable form: each pair sorted, then the list of pairs sorted.
function normalizePairs(pairs) {
    return pairs
        .map(pair => pair.slice().sort((a, b) => a - b))
        .sort((a, b) => a[0] - b[0] || a[1] - b[1]);
}

describe('export', () => {
    let USER_ID = null;
    before(async () => {
        // Reload the USER_ID from the database, since process.kresus.defaultUser.id which
        // might have been clobbered by another test.
        // TODO: this is bad for testing and we should fix this properly later.
        const users = await User.all();
        if (!users.length) {
            throw new Error('user should have been created!');
        }
        USER_ID = users[0].id;
        if (typeof USER_ID !== 'number') {
            throw new Error('missing user id in test.');
        }

        await cleanAll(USER_ID);
    });

    const world = {
        accesses: [
            {
                id: 0,
                vendorId: 'manual',
                session: '{}',
                // Should be migrated to fields, but legacy fields should be handled anyway.
                login: 'whatever-manual-acc--does-not-care',
                password: 'strongestpassindaworld',
            },
        ],
    };

    // Extract it now as the field will be removed on import during the migration to fields.
    const expectedPassword = world.accesses[0].password;

    it('should run the import properly', async () => {
        await importData(USER_ID, world);

        const accesses = await Access.all(USER_ID);
        assert.strictEqual(accesses.length, world.accesses.length);
        assert.strictEqual(accesses[0].password, world.accesses[0].password);
        assert.strictEqual(accesses[0].session, world.accesses[0].session);
        assert.ok(
            accesses[0].fields.some(f => f.name === 'password' && f.value === expectedPassword)
        );
    });

    it('should not export access password/session unless asked', async () => {
        const { accesses } = await exportData(USER_ID);
        assert.strictEqual(accesses.length, world.accesses.length);
        for (const access of accesses) {
            assert.ok(!('session' in access));
            assert.ok(!access.fields.some(f => f.name === 'password'));
        }
    });

    it('should export access password/session if asked', async () => {
        const { accesses } = await exportData(USER_ID, { isExport: true, cleanPassword: false });
        assert.strictEqual(accesses.length, world.accesses.length);
        assert.strictEqual(accesses[0].session, world.accesses[0].session);
        assert.ok(
            accesses[0].fields.some(f => f.name === 'password' && f.value === expectedPassword)
        );
    });

    it('should not return sessions if not an export (API call)', async () => {
        const { accesses } = await exportData(USER_ID, { isExport: false, cleanPassword: false });
        assert.strictEqual(accesses.length, world.accesses.length);
        for (const access of accesses) {
            assert.ok(!('session' in access));
        }
    });

    it('should not export userId', async () => {
        const { accesses } = await exportData(USER_ID, { isExport: true, cleanPassword: false });
        assert.strictEqual(accesses.length, world.accesses.length);
        assert.ok(!('userId' in accesses[0]));
    });
});

describe('export duplicates pairs to ignore', () => {
    let USER_ID = null;

    before(async () => {
        const users = await User.all();
        if (!users.length) {
            throw new Error('user should have been created!');
        }
        USER_ID = users[0].id;
        if (typeof USER_ID !== 'number') {
            throw new Error('missing user id in test.');
        }
    });

    // Two accounts, each one with a pair of transactions, so we can check that the pairs of every
    // account are exported and not only those of the first one.
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
                vendorAccountId: 'export-duplicates-account',
                type: 'account-type.checking',
                initialBalance: 0,
                label: 'Compte test',
                currency: 'EUR',
                importDate: new Date('2020-01-01T00:00:00.000Z'),
            },
            {
                id: 1,
                accessId: 0,
                vendorAccountId: 'export-duplicates-account-2',
                type: 'account-type.checking',
                initialBalance: 0,
                label: 'Compte test #2',
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
            {
                accountId: 1,
                type: 'type.card',
                label: 'Internet',
                rawLabel: 'Internet',
                amount: -40,
                date: new Date('2020-06-04T00:00:00.000Z'),
                importDate: new Date('2020-06-04T00:00:00.000Z'),
            },
            {
                accountId: 1,
                type: 'type.card',
                label: 'Internet',
                rawLabel: 'Internet',
                amount: -40,
                date: new Date('2020-06-05T00:00:00.000Z'),
                importDate: new Date('2020-06-06T00:00:00.000Z'),
            },
        ],
    };

    // Imports the world above, then ignores one pair of duplicates per account. Returns the two
    // ignored pairs, as pairs of database transaction ids.
    async function importAndIgnoreOnePairPerAccount() {
        await cleanAll(USER_ID);
        await importData(USER_ID, structuredClone(world));

        const accounts = await Account.all(USER_ID);
        assert.strictEqual(accounts.length, 2);

        const pairs = [];
        for (const account of accounts) {
            const transactions = await Transaction.byAccount(USER_ID, account.id);
            assert.strictEqual(transactions.length, 2);

            await DuplicatesIgnored.create(USER_ID, transactions[0].id, transactions[1].id);
            pairs.push([transactions[0].id, transactions[1].id]);
        }

        return normalizePairs(pairs);
    }

    it('should export the ignored pairs as pairs of transaction ids', async () => {
        const expectedPairs = await importAndIgnoreOnePairPerAccount();

        const data = await exportData(USER_ID, { isExport: true });

        assert.ok(data.duplicates, 'the export should contain a duplicates object');
        assert.deepStrictEqual(normalizePairs(data.duplicates.ignored), expectedPairs);
    });

    it('should export an empty list of ignored pairs when there is none', async () => {
        await cleanAll(USER_ID);
        await importData(USER_ID, structuredClone(world));

        const data = await exportData(USER_ID, { isExport: true });
        assert.ok(data.duplicates);
        assert.deepStrictEqual(data.duplicates.ignored, []);
    });

    it('should keep the transaction ids, so the exported pairs can be matched', async () => {
        await importAndIgnoreOnePairPerAccount();

        const data = await exportData(USER_ID, { isExport: true });

        // Every id referenced by an ignored pair must exist in the exported transactions,
        // otherwise the pairs can't be remapped on import.
        const exportedIds = data.transactions.map(tr => tr.id);
        assert.strictEqual(exportedIds.length, world.transactions.length);

        for (const pair of data.duplicates.ignored) {
            assert.ok(exportedIds.includes(pair[0]), `transaction ${pair[0]} should be exported`);
            assert.ok(exportedIds.includes(pair[1]), `transaction ${pair[1]} should be exported`);
        }
    });

    it('should not export the ignored pairs for the /all endpoint', async () => {
        await importAndIgnoreOnePairPerAccount();

        // They are lazy-loaded through the /duplicates endpoint instead.
        const data = await exportData(USER_ID, { isExport: false });
        assert.strictEqual(typeof data.duplicates, 'undefined');
    });
});
