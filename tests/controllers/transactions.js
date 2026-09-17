import assert from 'node:assert';

import { importData } from '../../server/controllers/all';
import {
    create,
    destroy,
    merge,
    preloadOtherTransaction,
    preloadTransaction,
    update,
} from '../../server/controllers/transactions';
import { UNKNOWN_TRANSACTION_TYPE } from '../../server/helpers';
import { Access, Account, Category, Transaction, User } from '../../server/models';

import { makeReq, makeRes } from './helpers';

async function cleanAll(userId) {
    await Access.destroyAll(userId);
    await Account.destroyAll(userId);
    await Category.destroyAll(userId);
    await Transaction.destroyAll(userId);
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
        ],

        categories: [
            { id: 0, label: 'Groceries', color: '#1b9d68' },
            { id: 1, label: 'Books', color: '#b562bf' },
        ],

        transactions: [
            // A transaction as imported from a bank: not created by the user.
            {
                accountId: 0,
                type: 'type.card',
                label: 'Wholemart',
                rawLabel: 'card 07/07/2019 wholemart',
                date: new Date('2019-07-07T06:00:00.000Z'),
                importDate: new Date('2019-07-08T00:00:00.000Z'),
                amount: -83.8,
                isUserDefinedType: false,
            },

            // A transaction created by the user: date/amount are updatable.
            {
                accountId: 0,
                type: 'type.card',
                label: 'Bakery',
                rawLabel: 'bakery',
                date: new Date('2019-07-10T00:00:00.000Z'),
                importDate: new Date('2019-07-10T00:00:00.000Z'),
                amount: -12.5,
                createdByUser: true,
                isUserDefinedType: false,
            },

            // A second Wholemart transaction, on the same account as the imported one: used to
            // check which fields `merge` transfers.
            {
                accountId: 0,
                type: 'type.card',
                label: 'Wholemart bis',
                rawLabel: 'card 07/07/2019 wholemart',
                customLabel: 'Groceries of the week',
                date: new Date('2019-07-07T06:00:00.000Z'),
                importDate: new Date('2019-07-09T00:00:00.000Z'),
                amount: -83.8,
                isUserDefinedType: false,
            },

            // A transaction on another account, which `merge` must refuse to merge.
            {
                accountId: 1,
                type: 'type.transfer',
                label: 'SEPA rent',
                rawLabel: 'transfer to m. john doe rent',
                customLabel: 'Rent',
                date: new Date('2019-07-27T00:00:00.000Z'),
                importDate: new Date('2019-07-28T00:00:00.000Z'),
                amount: -500,
                isUserDefinedType: false,
            },
        ],
    };
}

describe('transactions controller', () => {
    // Seeded entities, resolved by label since importData reassigns ids.
    let checkingAccount = null;
    let savingsAccount = null;
    let groceries = null;
    let books = null;
    let imported = null;
    let userCreated = null;
    let sameAccountTransaction = null;
    let otherAccountTransaction = null;

    beforeEach(async () => {
        await cleanAll(USER_ID);
        await importData(USER_ID, makeWorld());

        const accounts = await Account.all(USER_ID);
        checkingAccount = accounts.find(a => a.label === 'Compte Courant');
        savingsAccount = accounts.find(a => a.label === 'Livret A');

        const categories = await Category.all(USER_ID);
        groceries = categories.find(c => c.label === 'Groceries');
        books = categories.find(c => c.label === 'Books');

        const transactions = await Transaction.all(USER_ID);
        imported = transactions.find(t => t.label === 'Wholemart');
        userCreated = transactions.find(t => t.label === 'Bakery');
        sameAccountTransaction = transactions.find(t => t.label === 'Wholemart bis');
        otherAccountTransaction = transactions.find(t => t.label === 'SEPA rent');

        for (const entity of [
            checkingAccount,
            savingsAccount,
            groceries,
            books,
            imported,
            userCreated,
            sameAccountTransaction,
            otherAccountTransaction,
        ]) {
            assert.ok(entity, 'fixtures should have been imported');
        }
    });

    after(async () => {
        await cleanAll(USER_ID);
    });

    // Returns the balance of an account, as `Account.find` computes it.
    async function balanceOf(accountId) {
        const account = await Account.find(USER_ID, accountId);
        return account.balance;
    }

    describe('preloadTransaction', () => {
        it('should preload a known transaction and call the next handler', async () => {
            const req = makeReq({ userId: USER_ID });
            const res = makeRes();
            let nextCalls = 0;

            await preloadTransaction(req, res, () => nextCalls++, imported.id);

            assert.strictEqual(nextCalls, 1);
            assert.strictEqual(res.statusCode, null);
            assert.strictEqual(req.preloaded.transaction.id, imported.id);
            assert.strictEqual(req.preloaded.transaction.label, 'Wholemart');
        });

        it('should answer 404 and not call the next handler for an unknown transaction', async () => {
            const req = makeReq({ userId: USER_ID });
            const res = makeRes();
            let nextCalls = 0;

            await preloadTransaction(req, res, () => nextCalls++, imported.id + 10000);

            assert.strictEqual(nextCalls, 0);
            assert.strictEqual(res.statusCode, 404);
            assert.strictEqual(res.body.message, 'bank transaction not found');
            assert.strictEqual(typeof req.preloaded.transaction, 'undefined');
        });
    });

    describe('preloadOtherTransaction', () => {
        it('should preload under the otherTransaction key', async () => {
            const req = makeReq({ userId: USER_ID });
            const res = makeRes();

            await preloadOtherTransaction(req, res, () => {}, imported.id);

            assert.strictEqual(req.preloaded.otherTransaction.id, imported.id);
            assert.strictEqual(typeof req.preloaded.transaction, 'undefined');
        });

        it('should coexist with a transaction preloaded on the same request', async () => {
            const req = makeReq({ userId: USER_ID });
            const res = makeRes();

            await preloadTransaction(req, res, () => {}, imported.id);
            await preloadOtherTransaction(req, res, () => {}, userCreated.id);

            assert.strictEqual(req.preloaded.transaction.id, imported.id);
            assert.strictEqual(req.preloaded.otherTransaction.id, userCreated.id);
        });

        it('should answer 404 for an unknown transaction', async () => {
            const req = makeReq({ userId: USER_ID });
            const res = makeRes();
            let nextCalls = 0;

            await preloadOtherTransaction(req, res, () => nextCalls++, userCreated.id + 10000);

            assert.strictEqual(nextCalls, 0);
            assert.strictEqual(res.statusCode, 404);
        });
    });

    describe('create', () => {
        // A body with all the fields Transaction.isTransaction() requires. Rebuilt for every
        // test since the account is recreated (and gets a new id) by the outer beforeEach.
        let transactionPayload = null;
        beforeEach(() => {
            transactionPayload = {
                accountId: checkingAccount.id,
                label: 'Hardware store',
                date: new Date('2019-08-01T00:00:00.000Z'),
                amount: -25,
                type: 'type.card',
            };
        });

        it('should refuse a body which is not a transaction', async () => {
            const body = { ...transactionPayload };
            delete body.amount;

            const req = makeReq({ userId: USER_ID, body });
            const res = makeRes();

            await create(req, res);

            assert.strictEqual(res.statusCode, 400);
            assert.strictEqual(res.body.message, 'Not a transaction');
        });

        it('should refuse an unknown category', async () => {
            const req = makeReq({
                userId: USER_ID,
                body: { ...transactionPayload, categoryId: groceries.id + 10000 },
            });
            const res = makeRes();

            await create(req, res);

            assert.strictEqual(res.statusCode, 404);
            assert.strictEqual(res.body.message, 'Category not found');
        });

        it('should accept a null category', async () => {
            const req = makeReq({
                userId: USER_ID,
                body: { ...transactionPayload, categoryId: null },
            });
            const res = makeRes();

            await create(req, res);

            assert.strictEqual(res.statusCode, 201);
            assert.strictEqual(res.body.transaction.categoryId, null);
        });

        it('should create the transaction and fill the missing fields', async () => {
            const { date } = transactionPayload;
            const before = await balanceOf(checkingAccount.id);

            const req = makeReq({
                userId: USER_ID,
                body: { ...transactionPayload, categoryId: groceries.id },
            });
            const res = makeRes();

            await create(req, res);

            assert.strictEqual(res.statusCode, 201);

            const { transaction } = res.body;
            assert.strictEqual(transaction.label, 'Hardware store');
            assert.strictEqual(transaction.categoryId, groceries.id);
            assert.strictEqual(transaction.createdByUser, true);

            // rawLabel and debitDate fall back to label and date respectively.
            assert.strictEqual(transaction.rawLabel, 'Hardware store');
            assert.strictEqual(transaction.debitDate.getTime(), date.getTime());
            assert.ok(transaction.importDate instanceof Date);

            // The transaction has actually been persisted.
            const persisted = await Transaction.find(USER_ID, transaction.id);
            assert.ok(persisted);
            assert.strictEqual(persisted.label, 'Hardware store');

            // The response carries the updated balance.
            assert.strictEqual(res.body.accountId, checkingAccount.id);
            assert.strictEqual(res.body.accountBalance, Math.round((before - 25) * 100) / 100);
        });

        it('should keep a provided rawLabel', async () => {
            const req = makeReq({
                userId: USER_ID,
                body: { ...transactionPayload, rawLabel: 'card 01/08/2019 hardware store' },
            });
            const res = makeRes();

            await create(req, res);

            assert.strictEqual(res.statusCode, 201);
            assert.strictEqual(res.body.transaction.rawLabel, 'card 01/08/2019 hardware store');
        });

        it('should set the customLabel from the label', async () => {
            const req = makeReq({ userId: USER_ID, body: { ...transactionPayload } });
            const res = makeRes();

            await create(req, res);

            assert.strictEqual(res.statusCode, 201);
            assert.strictEqual(res.body.transaction.customLabel, 'Hardware store');
        });

        it('should keep a customLabel provided in the body', async () => {
            const req = makeReq({
                userId: USER_ID,
                body: { ...transactionPayload, customLabel: 'Something else entirely' },
            });
            const res = makeRes();

            await create(req, res);

            assert.strictEqual(res.statusCode, 201);
            assert.strictEqual(res.body.transaction.customLabel, 'Something else entirely');
        });

        it('should mark the type as user defined when a known type is given', async () => {
            const req = makeReq({
                userId: USER_ID,
                body: { ...transactionPayload, type: 'type.card' },
            });
            const res = makeRes();

            await create(req, res);

            assert.strictEqual(res.statusCode, 201);
            assert.strictEqual(res.body.transaction.type, 'type.card');
            assert.strictEqual(res.body.transaction.isUserDefinedType, true);
        });

        it('should not mark the type as user defined for the unknown type', async () => {
            const req = makeReq({
                userId: USER_ID,
                body: { ...transactionPayload, type: UNKNOWN_TRANSACTION_TYPE },
            });
            const res = makeRes();

            await create(req, res);

            assert.strictEqual(res.statusCode, 201);
            assert.strictEqual(res.body.transaction.isUserDefinedType, false);
        });
    });

    describe('update', () => {
        function makeUpdateReq(transaction, body) {
            return makeReq({ userId: USER_ID, body, preloaded: { transaction } });
        }

        it('should refuse an empty body', async () => {
            const res = makeRes();
            await update(makeUpdateReq(imported, {}), res);

            assert.strictEqual(res.statusCode, 400);
            assert.strictEqual(res.body.message, 'Missing parameter');
        });

        it('should refuse to update the date of an imported transaction', async () => {
            const res = makeRes();
            await update(makeUpdateReq(imported, { date: '2020-01-01T00:00:00.000Z' }), res);

            assert.strictEqual(res.statusCode, 400);
            assert.strictEqual(res.body.message, 'Missing parameter');
        });

        it('should refuse to update the amount of an imported transaction', async () => {
            const res = makeRes();
            await update(makeUpdateReq(imported, { amount: -10 }), res);

            assert.strictEqual(res.statusCode, 400);
            assert.strictEqual(res.body.message, 'Missing parameter');
        });

        it('should update the date and debitDate of a user created transaction', async () => {
            const date = '2020-02-03T00:00:00.000Z';
            const debitDate = '2020-02-05T00:00:00.000Z';

            const res = makeRes();
            await update(makeUpdateReq(userCreated, { date, debitDate }), res);

            assert.strictEqual(res.statusCode, 201);
            assert.strictEqual(res.body.transaction.date.getTime(), new Date(date).getTime());
            assert.strictEqual(
                res.body.transaction.debitDate.getTime(),
                new Date(debitDate).getTime()
            );
        });

        it('should update the amount of a user created transaction', async () => {
            const res = makeRes();
            await update(makeUpdateReq(userCreated, { amount: -42.5 }), res);

            assert.strictEqual(res.statusCode, 201);
            assert.strictEqual(res.body.transaction.amount, -42.5);
        });

        it('should refuse an unknown category', async () => {
            const res = makeRes();
            await update(makeUpdateReq(imported, { categoryId: groceries.id + 10000 }), res);

            assert.strictEqual(res.statusCode, 404);
            assert.strictEqual(res.body.message, 'Category not found');
        });

        it('should set a known category', async () => {
            const res = makeRes();
            await update(makeUpdateReq(imported, { categoryId: books.id }), res);

            assert.strictEqual(res.statusCode, 201);
            assert.strictEqual(res.body.transaction.categoryId, books.id);
        });

        it('should unset the category when given null', async () => {
            let res = makeRes();
            await update(makeUpdateReq(imported, { categoryId: books.id }), res);
            assert.strictEqual(res.body.transaction.categoryId, books.id);

            res = makeRes();
            await update(makeUpdateReq(imported, { categoryId: null }), res);

            assert.strictEqual(res.statusCode, 201);
            assert.strictEqual(res.body.transaction.categoryId, null);
        });

        it('should set a known type and mark it as user defined', async () => {
            assert.strictEqual(imported.isUserDefinedType, false);

            const res = makeRes();
            await update(makeUpdateReq(imported, { type: 'type.transfer' }), res);

            assert.strictEqual(res.statusCode, 201);
            assert.strictEqual(res.body.transaction.type, 'type.transfer');
            assert.strictEqual(res.body.transaction.isUserDefinedType, true);
        });

        it('should fall back to the unknown type for an unknown type name', async () => {
            const res = makeRes();
            await update(makeUpdateReq(imported, { type: 'type.does-not-exist' }), res);

            assert.strictEqual(res.statusCode, 201);
            assert.strictEqual(res.body.transaction.type, UNKNOWN_TRANSACTION_TYPE);
            assert.strictEqual(res.body.transaction.isUserDefinedType, true);
        });

        it('should set the custom label', async () => {
            const res = makeRes();
            await update(makeUpdateReq(imported, { customLabel: 'Weekly groceries' }), res);

            assert.strictEqual(res.statusCode, 201);
            assert.strictEqual(res.body.transaction.customLabel, 'Weekly groceries');
        });

        it('should store an empty custom label as null', async () => {
            let res = makeRes();
            await update(makeUpdateReq(imported, { customLabel: 'Weekly groceries' }), res);
            assert.strictEqual(res.body.transaction.customLabel, 'Weekly groceries');

            res = makeRes();
            await update(makeUpdateReq(imported, { customLabel: '' }), res);

            assert.strictEqual(res.statusCode, 201);
            assert.strictEqual(res.body.transaction.customLabel, null);
        });

        it('should set the budget date', async () => {
            const budgetDate = '2019-08-01T00:00:00.000Z';

            const res = makeRes();
            await update(makeUpdateReq(imported, { budgetDate }), res);

            assert.strictEqual(res.statusCode, 201);
            assert.strictEqual(
                res.body.transaction.budgetDate.getTime(),
                new Date(budgetDate).getTime()
            );
        });

        it('should unset the budget date when given null', async () => {
            let res = makeRes();
            await update(makeUpdateReq(imported, { budgetDate: '2019-08-01T00:00:00.000Z' }), res);
            assert.ok(res.body.transaction.budgetDate);

            res = makeRes();
            await update(makeUpdateReq(imported, { budgetDate: null }), res);

            assert.strictEqual(res.statusCode, 201);
            assert.strictEqual(res.body.transaction.budgetDate, null);
        });

        it('should send back the account balance and id', async () => {
            const res = makeRes();
            await update(makeUpdateReq(imported, { customLabel: 'Whatever' }), res);

            assert.strictEqual(res.statusCode, 201);
            assert.strictEqual(res.body.accountId, checkingAccount.id);
            assert.strictEqual(res.body.accountBalance, await balanceOf(checkingAccount.id));
        });
    });

    describe('merge', () => {
        function makeMergeReq(transaction, otherTransaction) {
            return makeReq({ userId: USER_ID, preloaded: { transaction, otherTransaction } });
        }

        it('should delete the other transaction and keep the first one', async () => {
            const res = makeRes();
            await merge(makeMergeReq(imported, userCreated), res);

            assert.strictEqual(res.statusCode, 200);
            assert.strictEqual(res.body.transaction.id, imported.id);
            assert.ok(await Transaction.find(USER_ID, imported.id));
            assert.strictEqual(await Transaction.find(USER_ID, userCreated.id), null);
        });

        it('should transfer fields from the other transaction, as mergeWith does', async () => {
            // `imported` has no custom label, `sameAccountTransaction` has one: it is transferred.
            assert.strictEqual(imported.customLabel, null);

            const res = makeRes();
            await merge(makeMergeReq(imported, sameAccountTransaction), res);

            assert.strictEqual(res.statusCode, 200);
            assert.strictEqual(res.body.transaction.customLabel, 'Groceries of the week');
            assert.strictEqual(
                res.body.transaction.importDate.getTime(),
                sameAccountTransaction.importDate.getTime()
            );

            assert.strictEqual(res.statusCode, 200);
            assert.strictEqual(res.body.accountId, checkingAccount.id);
            assert.strictEqual(res.body.accountBalance, await balanceOf(checkingAccount.id));
        });

        it('should refuse to merge transactions from different accounts', async () => {
            const res = makeRes();
            await merge(makeMergeReq(imported, otherAccountTransaction), res);

            assert.strictEqual(res.statusCode, 400);

            // Both transactions are left untouched.
            const kept = await Transaction.find(USER_ID, imported.id);
            assert.ok(kept);
            assert.strictEqual(kept.customLabel, null);
            assert.ok(await Transaction.find(USER_ID, otherAccountTransaction.id));
        });
    });

    describe('destroy', () => {
        it('should delete the transaction and send back the updated balance', async () => {
            const before = await balanceOf(checkingAccount.id);

            const req = makeReq({ userId: USER_ID, preloaded: { transaction: imported } });
            const res = makeRes();

            await destroy(req, res);

            assert.strictEqual(res.statusCode, 200);
            assert.strictEqual(await Transaction.find(USER_ID, imported.id), null);
            assert.strictEqual(res.body.accountId, checkingAccount.id);
            assert.strictEqual(
                res.body.accountBalance,
                Math.round((before - imported.amount) * 100) / 100
            );
        });
    });
});
