import assert from 'node:assert';

import { importData } from '../../server/controllers/all';
import { create, destroy, preloadView, update } from '../../server/controllers/views';
import { Access, Account, Setting, Transaction, User, View } from '../../server/models';
import { DEFAULT_CURRENCY } from '../../shared/settings';

import { makeReq, makeRes } from './helpers';

async function cleanAll(userId) {
    await Access.destroyAll(userId);
    await Account.destroyAll(userId);
    await Transaction.destroyAll(userId);
    await View.destroyAll(userId);
}

let USER_ID = null;
before(async () => {
    // Reload the USER_ID from the database, since process.kresus.defaultUser.id which
    // might have been clobbered by another test.
    const users = await User.all();
    if (!users.length) {
        throw new Error('user should have been created!');
    }
    USER_ID = users[0].id;
    if (typeof USER_ID !== 'number') {
        throw new Error('missing user id in test.');
    }

    // The currency fallback for accounts without a currency depends on this setting, and other
    // test suites share the database, so don't rely on the default being untouched.
    await Setting.updateByKey(USER_ID, DEFAULT_CURRENCY, 'EUR');
});

// importData mutates the world it is given (it reassigns ids, parses dates…), so build a
// fresh one for every test.
function makeWorld() {
    return {
        accesses: [
            {
                id: 0,
                vendorId: 'manual',
                login: 'whatever-manual-acc--does-not-care',
                customLabel: 'Manual access',
            },
        ],

        accounts: [
            {
                id: 0,
                accessId: 0,
                vendorAccountId: 'manualaccount-checking',
                type: 'account-type.checking',
                initialBalance: 0,
                label: 'Compte Courant',
                currency: 'EUR',
                importDate: new Date('2019-01-01T00:00:00.000Z'),
            },
            {
                id: 1,
                accessId: 0,
                vendorAccountId: 'manualaccount-savings',
                type: 'account-type.savings',
                initialBalance: 0,
                label: 'Livret A',
                currency: 'EUR',
                importDate: new Date('2019-01-01T00:00:00.000Z'),
            },
            {
                id: 2,
                accessId: 0,
                vendorAccountId: 'manualaccount-dollars',
                type: 'account-type.checking',
                initialBalance: 0,
                label: 'Dollar account',
                currency: 'USD',
                importDate: new Date('2019-01-01T00:00:00.000Z'),
            },
            {
                // No currency at all: falls back to the user's default currency (EUR above).
                id: 3,
                accessId: 0,
                vendorAccountId: 'manualaccount-nocurrency',
                type: 'account-type.checking',
                initialBalance: 0,
                label: 'No currency account',
                importDate: new Date('2019-01-01T00:00:00.000Z'),
            },
        ],

        transactions: [],

        views: [],
    };
}

describe('views controller', () => {
    // Seeded entities, resolved by label since importData reassigns ids.
    let euroAccount = null;
    let otherEuroAccount = null;
    let dollarAccount = null;
    let noCurrencyAccount = null;

    beforeEach(async () => {
        await cleanAll(USER_ID);
        await importData(USER_ID, makeWorld());

        const accounts = await Account.all(USER_ID);
        euroAccount = accounts.find(a => a.label === 'Compte Courant');
        otherEuroAccount = accounts.find(a => a.label === 'Livret A');
        dollarAccount = accounts.find(a => a.label === 'Dollar account');
        noCurrencyAccount = accounts.find(a => a.label === 'No currency account');

        for (const entity of [euroAccount, otherEuroAccount, dollarAccount, noCurrencyAccount]) {
            assert.ok(entity, 'fixtures should have been imported');
        }
    });

    after(async () => {
        await cleanAll(USER_ID);
    });

    // Creates a view directly through the model, bypassing the controller's validation. Used to
    // set up views which the controller would refuse to create.
    async function createViewUnchecked(label, accountIds) {
        return await View.create(USER_ID, {
            label,
            createdByUser: true,
            accounts: accountIds.map(accountId => ({ accountId })),
        });
    }

    async function callCreate(body) {
        const req = makeReq({ userId: USER_ID, body });
        const res = makeRes();
        await create(req, res);
        return res;
    }

    async function callUpdate(view, body) {
        const req = makeReq({ userId: USER_ID, body, preloaded: { view } });
        const res = makeRes();
        await update(req, res);
        return res;
    }

    describe('create', () => {
        it('should create a view whose accounts share the same currency', async () => {
            const res = await callCreate({
                label: 'Euro view',
                accounts: [{ accountId: euroAccount.id }, { accountId: otherEuroAccount.id }],
            });

            assert.strictEqual(res.statusCode, 201);
            assert.strictEqual(res.body.label, 'Euro view');
            assert.strictEqual(res.body.accounts.length, 2);
        });

        it('should refuse a view mixing several currencies', async () => {
            const before = await View.all(USER_ID);

            const res = await callCreate({
                label: 'Mixed view',
                accounts: [{ accountId: euroAccount.id }, { accountId: dollarAccount.id }],
            });

            assert.strictEqual(res.statusCode, 400);
            assert.strictEqual(
                res.body.message,
                'a view cannot contain accounts of different currencies'
            );

            const after = await View.all(USER_ID);
            assert.strictEqual(after.length, before.length, 'no view should have been created');
        });

        it('should accept an account without currency alongside one using the default currency', async () => {
            const res = await callCreate({
                label: 'Default currency view',
                accounts: [{ accountId: noCurrencyAccount.id }, { accountId: euroAccount.id }],
            });

            assert.strictEqual(res.statusCode, 201);
            assert.strictEqual(res.body.accounts.length, 2);
        });

        it('should refuse an account without currency alongside one using another currency', async () => {
            const res = await callCreate({
                label: 'Mixed view',
                accounts: [{ accountId: noCurrencyAccount.id }, { accountId: dollarAccount.id }],
            });

            assert.strictEqual(res.statusCode, 400);
            assert.strictEqual(
                res.body.message,
                'a view cannot contain accounts of different currencies'
            );
        });

        it('should refuse the same account listed twice', async () => {
            const res = await callCreate({
                label: 'Duplicated account view',
                accounts: [{ accountId: euroAccount.id }, { accountId: euroAccount.id }],
            });

            assert.strictEqual(res.statusCode, 400);
        });

        it('should refuse an account which does not belong to the user', async () => {
            const res = await callCreate({
                label: 'Unknown account view',
                accounts: [{ accountId: euroAccount.id + 10000 }],
            });

            assert.strictEqual(res.statusCode, 404);
            assert.strictEqual(res.body.message, 'some view accounts could not be found');
        });

        it('should refuse malformed accounts', async () => {
            for (const accounts of [undefined, null, [], 'nope', [42], [{}], [null]]) {
                const res = await callCreate({ label: 'Malformed view', accounts });
                assert.strictEqual(
                    res.statusCode,
                    400,
                    `accounts ${JSON.stringify(accounts)} should be refused`
                );
            }
        });

        it('should refuse a missing label', async () => {
            const res = await callCreate({ accounts: [{ accountId: euroAccount.id }] });

            assert.strictEqual(res.statusCode, 400);
            assert.strictEqual(res.body.message, 'missing parameters');
        });
    });

    describe('update', () => {
        it('should update the accounts when they share the same currency', async () => {
            const view = await createViewUnchecked('Euro view', [euroAccount.id]);

            const res = await callUpdate(view, {
                accounts: [{ accountId: euroAccount.id }, { accountId: otherEuroAccount.id }],
            });

            assert.strictEqual(res.statusCode, 200);
            assert.strictEqual(res.body.accounts.length, 2);
        });

        it('should refuse to update the accounts to several currencies, and leave them untouched', async () => {
            const view = await createViewUnchecked('Euro view', [euroAccount.id]);

            const res = await callUpdate(view, {
                accounts: [{ accountId: euroAccount.id }, { accountId: dollarAccount.id }],
            });

            assert.strictEqual(res.statusCode, 400);
            assert.strictEqual(
                res.body.message,
                'a view cannot contain accounts of different currencies'
            );

            const stored = await View.find(USER_ID, view.id);
            assert.strictEqual(stored.accounts.length, 1);
            assert.strictEqual(stored.accounts[0].accountId, euroAccount.id);
        });

        it('should rename a view whose accounts share the same currency', async () => {
            const view = await createViewUnchecked('Euro view', [
                euroAccount.id,
                otherEuroAccount.id,
            ]);

            // No accounts in the payload: the view's current ones are validated instead.
            const res = await callUpdate(view, { label: 'Renamed euro view' });

            assert.strictEqual(res.statusCode, 200);
            assert.strictEqual(res.body.label, 'Renamed euro view');
            assert.strictEqual(res.body.accounts.length, 2);
        });

        it('should refuse to rename a view which already mixes currencies', async () => {
            // Such views may predate this restriction, or result from an account's currency
            // being changed on the bank's side: they must be fixed before being modified.
            const view = await createViewUnchecked('Legacy mixed view', [
                euroAccount.id,
                dollarAccount.id,
            ]);

            const res = await callUpdate(view, { label: 'Renamed mixed view' });

            assert.strictEqual(res.statusCode, 400);
            assert.strictEqual(
                res.body.message,
                'a view cannot contain accounts of different currencies'
            );

            const stored = await View.find(USER_ID, view.id);
            assert.strictEqual(stored.label, 'Legacy mixed view');
        });

        it('should refuse malformed accounts', async () => {
            const view = await createViewUnchecked('Euro view', [euroAccount.id]);

            for (const accounts of [null, [], 'nope', [42], [{}]]) {
                const res = await callUpdate(view, { accounts });
                assert.strictEqual(
                    res.statusCode,
                    400,
                    `accounts ${JSON.stringify(accounts)} should be refused`
                );
            }
        });
    });

    describe('preloadView', () => {
        it('should preload a known view and call the next handler', async () => {
            const view = await createViewUnchecked('Euro view', [euroAccount.id]);

            const req = makeReq({ userId: USER_ID });
            const res = makeRes();
            let nextCalls = 0;

            await preloadView(req, res, () => nextCalls++, view.id);

            assert.strictEqual(nextCalls, 1);
            assert.strictEqual(res.statusCode, null);
            assert.strictEqual(req.preloaded.view.id, view.id);
        });

        it('should answer 404 and not call the next handler for an unknown view', async () => {
            const req = makeReq({ userId: USER_ID });
            const res = makeRes();
            let nextCalls = 0;

            await preloadView(req, res, () => nextCalls++, 10000);

            assert.strictEqual(nextCalls, 0);
            assert.strictEqual(res.statusCode, 404);
            assert.strictEqual(res.body.message, 'View not found');
        });
    });

    describe('destroy', () => {
        it('should destroy a view', async () => {
            const view = await createViewUnchecked('Euro view', [euroAccount.id]);

            const req = makeReq({ userId: USER_ID, preloaded: { view } });
            const res = makeRes();

            await destroy(req, res);

            assert.strictEqual(res.statusCode, 204);
            assert.strictEqual(await View.find(USER_ID, view.id), null);
        });
    });

    describe('import', () => {
        it('should still import a view mixing several currencies', async () => {
            // Validation lives in the controller on purpose, so that older backups keep
            // importing successfully.
            await cleanAll(USER_ID);

            const world = makeWorld();
            world.views = [
                {
                    id: 0,
                    label: 'Legacy mixed view',
                    createdByUser: true,
                    accounts: [{ accountId: 0 }, { accountId: 2 }],
                },
            ];

            await importData(USER_ID, world);

            const views = await View.all(USER_ID);
            const imported = views.find(v => v.label === 'Legacy mixed view');
            assert.ok(imported, 'the mixed-currency view should have been imported');
            assert.strictEqual(imported.accounts.length, 2);
        });
    });
});
