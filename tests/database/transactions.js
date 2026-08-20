import assert from 'node:assert';
import { importData } from '../../server/controllers/all';
import { Access, Account, Transaction } from '../../server/models';

import { checkObjectIsSubsetOf } from '../helpers';

describe('Transaction model API', () => {
    let world = {
        accesses: [
            {
                id: 0,
                vendorId: 'manual',
                login: 'whatever-manual-acc--does-not-care',
                customLabel: 'Optional custom label',
            },
        ],

        accounts: [
            {
                id: 0,
                accessId: 0,
                vendorAccountId: 'manualaccount-randomid',
                type: 'account-type.checking',
                initialBalance: 0,
                label: 'Compte Courant',
                iban: 'FR4830066645148131544778523',
                currency: 'EUR',
                importDate: new Date('2019-01-01:00:00.000Z'),
            },
        ],

        transactions: [
            {
                accountId: 0,
                type: 'type.card',
                label: 'Wholemart',
                rawLabel: 'card 07/07/2019 wholemart',
                customLabel: 'Food',
                date: new Date('2019-07-07T06:00:00.000Z'),
                importDate: new Date('2020-01-01:00:00.000Z'),
                amount: -83.8,
            },
            {
                accountId: 0,
                type: 'type.card',
                label: 'Wholemart',
                rawLabel: 'card 09/07/2019 wholemart',
                customLabel: 'Food & stuff',
                date: new Date('2019-07-09T12:00:00.000Z'),
                importDate: new Date('2020-01-01:00:00.000Z'),
                amount: -60.8,
            },
            {
                accountId: 0,
                type: 'type.card',
                label: 'amazon payments',
                rawLabel: 'carte 19/07/2019 amazon payments',
                customLabel: '1984 - George Orwell',
                date: new Date('2019-07-19T00:00:00.000Z'),
                importDate: new Date('2020-01-01:00:00.000Z'),
                amount: -20,
            },
            {
                accountId: 0,
                type: 'type.transfer',
                label: 'SEPA m. john doe 123457689 rent',
                rawLabel: 'transfer to m. john doe 123457689 rent',
                date: new Date('2019-07-27T00:00:00.000Z'),
                importDate: new Date('2020-01-01:00:00.000Z'),
                amount: -500,
            },
            {
                accountId: 0,
                type: 'type.order',
                label: 'taxes public department: fr123abc456',
                rawLabel: 'direct debit sepa taxes public department: fr123abc456',
                date: new Date('2019-08-17T00:00:00.000Z'),
                importDate: new Date('2020-01-01:00:00.000Z'),
                amount: -150,
            },
            {
                accountId: 0,
                type: 'type.withdrawal',
                label: 'ATM my pretty town center',
                date: new Date('2019-08-19T00:00:00.000Z'),
                importDate: new Date('2020-01-01:00:00.000Z'),
                amount: -20,
            },
            {
                accountId: 0,
                type: 'type.bankfee',
                rawLabel: 'commission on non euro buy 0.65eur',
                date: new Date('2019-08-22T00:00:00.000Z'),
                importDate: new Date('2020-01-01:00:00.000Z'),
                amount: -0.65,
            },
        ],
    };

    let USER_ID = null;
    before(() => {
        // applyConfig must have already been called.
        USER_ID = process.kresus.defaultUser.id;
    });

    describe('Transaction retrieval', () => {
        before(async () => {
            await Access.destroyAll(USER_ID);
        });

        it('Retrieval between two dates should work', async () => {
            await importData(USER_ID, world);

            const accounts = await Account.all(USER_ID);
            const twoFirstTransactions = await Transaction.byBankSortedByDateBetweenDates(
                USER_ID,
                accounts[0],
                world.transactions[0].date,
                world.transactions[1].date
            );
            assert.strictEqual(twoFirstTransactions.length, 2);

            assert.ok(
                world.transactions.some(tr => checkObjectIsSubsetOf(tr, twoFirstTransactions[0]))
            );
            assert.ok(
                world.transactions.some(tr => checkObjectIsSubsetOf(tr, twoFirstTransactions[1]))
            );
        });
    });

    describe('Transaction.bulkCreate', () => {
        let accountId = null;

        // Builds `count` distinct transactions for the test account.
        function makeTransactions(count) {
            return Array.from({ length: count }, (unused, i) => ({
                accountId,
                type: 'type.card',
                label: `bulk transaction ${i}`,
                rawLabel: `bulk transaction ${i}`,
                date: new Date('2021-01-01T00:00:00.000Z'),
                importDate: new Date('2021-01-01T00:00:00.000Z'),
                amount: -(i + 1),
            }));
        }

        beforeEach(async () => {
            await Access.destroyAll(USER_ID);
            await Account.destroyAll(USER_ID);
            await Transaction.destroyAll(USER_ID);

            await importData(USER_ID, {
                accesses: [
                    {
                        id: 0,
                        vendorId: 'manual',
                        login: 'whatever-manual-acc--does-not-care',
                    },
                ],
                accounts: [
                    {
                        id: 0,
                        accessId: 0,
                        vendorAccountId: 'bulk-create-account',
                        type: 'account-type.checking',
                        initialBalance: 0,
                        label: 'Compte bulk',
                        currency: 'EUR',
                        importDate: new Date('2021-01-01T00:00:00.000Z'),
                    },
                ],
            });

            const accounts = await Account.all(USER_ID);
            assert.strictEqual(accounts.length, 1);
            accountId = accounts[0].id;
        });

        it('should return no id when there is nothing to insert', async () => {
            assert.deepStrictEqual(await Transaction.bulkCreate(USER_ID, []), []);
        });

        it('should return the id of the single inserted transaction', async () => {
            const insertedIds = await Transaction.bulkCreate(USER_ID, makeTransactions(1));

            const transactions = await Transaction.byAccount(USER_ID, accountId);
            assert.strictEqual(transactions.length, 1);
            assert.deepStrictEqual(insertedIds, [transactions[0].id]);
        });

        it('should return one id per inserted transaction, in the same order', async () => {
            const toInsert = makeTransactions(3);
            const insertedIds = await Transaction.bulkCreate(USER_ID, toInsert);

            assert.strictEqual(insertedIds.length, toInsert.length);

            for (let i = 0; i < toInsert.length; i++) {
                const inserted = await Transaction.find(USER_ID, insertedIds[i]);
                assert.ok(inserted !== null, `transaction ${insertedIds[i]} should exist`);
                assert.strictEqual(inserted.label, toInsert[i].label);
            }
        });

        it('should return one id per inserted transaction when split in several batches', async () => {
            // The sqlite batch size is 50 entities, so this spans several batches.
            const toInsert = makeTransactions(120);
            const insertedIds = await Transaction.bulkCreate(USER_ID, toInsert);

            assert.strictEqual(insertedIds.length, toInsert.length);
            assert.strictEqual(new Set(insertedIds).size, toInsert.length);

            const transactions = await Transaction.byAccount(USER_ID, accountId);
            assert.strictEqual(transactions.length, toInsert.length);
            assert.deepStrictEqual(
                insertedIds.slice().sort((a, b) => a - b),
                transactions
                    .map(tr => tr.id)
                    .slice()
                    .sort((a, b) => a - b)
            );
        });
    });
});
