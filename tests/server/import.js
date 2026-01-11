import assert from 'node:assert';

import fs from 'fs';
import path from 'path';
import moment from 'moment';

import {
    Access,
    Account,
    Alert,
    Budget,
    Category,
    Setting,
    Transaction,
    User,
    TransactionRule,
    RecurringTransaction,
    AppliedRecurringTransaction,
    View,
} from '../../server/models';
import { testing, importData } from '../../server/controllers/all';
import { testing as ofxTesting } from '../../server/controllers/ofx';
import { DEFAULT_ACCOUNT_ID } from '../../shared/settings';

import { checkObjectIsSubsetOf } from '../helpers';

let { ofxToKresus } = testing;
let { parseOfxDate } = ofxTesting;

async function cleanAll(userId) {
    await Access.destroyAll(userId);
    await Account.destroyAll(userId);
    await Alert.destroyAll(userId);
    await Budget.destroyAll(userId);
    await Category.destroyAll(userId);
    await Setting.destroyAll(userId);
    await Transaction.destroyAll(userId);
    await TransactionRule.destroyAll(userId);
    await RecurringTransaction.destroyAll(userId);
    await AppliedRecurringTransaction.destroyAll(userId);
    await View.destroyAll(userId);
}

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
});

const now = new Date();

describe('import', () => {
    before(async () => {
        await cleanAll(USER_ID);
    });

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

            {
                id: 1,
                accessId: 0,
                vendorAccountId: 'manualaccount-randomid2',
                type: 'account-type.checking',
                initialBalance: 0,
                label: 'Compte pas courant',
                iban: 'FR4830066645148131544778524',
                currency: 'USD',
                importDate: new Date('2025-01-01:00:00.000Z'),
            },
        ],

        views: [
            {
                id: 0,
                label: 'Automatic view',
                createdByUser: false,
                accounts: [
                    {
                        accountId: 0,
                    },
                ],
            },
            {
                id: 1,
                label: 'Automatic view #2',
                createdByUser: false,
                accounts: [
                    {
                        accountId: 1,
                    },
                ],
            },
            {
                id: 2,
                label: 'First user view',
                createdByUser: true,
                accounts: [
                    {
                        accountId: 0,
                    },
                ],
            },
            {
                id: 3,
                label: 'Second user view',
                createdByUser: true,
                accounts: [
                    {
                        accountId: 0,
                    },
                    {
                        accountId: 1,
                    },
                ],
            },
        ],

        categories: [
            {
                label: 'Groceries',
                color: '#1b9d68',
                id: 0,
            },
            {
                label: 'Books',
                color: '#b562bf',
                id: 1,
            },
            {
                label: 'Taxes',
                color: '#ff0000',
                id: 2,
            },
            {
                label: 'Misc',
                color: '#00ff00',
                id: 3,
            },
        ],

        transactions: [
            {
                accountId: 0,
                categoryId: 0,
                type: 'type.card',
                label: 'Wholemart',
                rawLabel: 'card 07/07/2019 wholemart',
                customLabel: 'Food',
                date: new Date('2019-07-07T00:00:00.000Z'),
                importDate: new Date('2019-01-01:00:00.000Z'),
                amount: -83.8,
            },
            {
                accountId: 0,
                categoryId: 0,
                type: 'type.card',
                label: 'Wholemart',
                rawLabel: 'card 09/07/2019 wholemart',
                customLabel: 'Food & stuff',
                date: new Date('2019-07-09T00:00:00.000Z'),
                importDate: new Date('2019-01-01:00:00.000Z'),
                amount: -60.8,
            },
            {
                accountId: 0,
                categoryId: 1,
                type: 'type.card',
                label: 'amazon payments',
                rawLabel: 'carte 19/07/2019 amazon payments',
                customLabel: '1984 - George Orwell',
                date: new Date('2019-07-19T00:00:00.000Z'),
                importDate: new Date('2019-01-01:00:00.000Z'),
                amount: -20,
            },
            {
                accountId: 0,
                type: 'type.transfer',
                label: 'SEPA m. john doe 123457689 rent',
                rawLabel: 'transfer to m. john doe 123457689 rent',
                date: new Date('2019-07-27T00:00:00.000Z'),
                importDate: new Date('2019-01-01:00:00.000Z'),
                amount: -500,
            },
            {
                accountId: 0,
                categoryId: 2,
                type: 'type.order',
                label: 'taxes public department: fr123abc456',
                rawLabel: 'direct debit sepa taxes public department: fr123abc456',
                date: new Date('2019-08-17T00:00:00.000Z'),
                importDate: new Date('2019-01-01:00:00.000Z'),
                amount: -150,
            },
            {
                accountId: 0,
                categoryId: 3,
                type: 'type.withdrawal',
                label: 'ATM my pretty town center',
                date: new Date('2019-08-19T00:00:00.000Z'),
                importDate: new Date('2019-01-01:00:00.000Z'),
                amount: -20,
            },
            {
                accountId: 0,
                type: 'type.bankfee',
                rawLabel: 'commission on non euro buy 0.65eur',
                date: new Date('2019-08-22T00:00:00.000Z'),
                importDate: new Date('2019-01-01:00:00.000Z'),
                amount: -0.65,
            },
            {
                // This one misses the importDate. The import should not fail but the importDate
                // should be set to a default value (~now).
                accountId: 0,
                type: 'type.card',
                label: 'Debit Transfer: Postage',
                rawLabel: 'Transfer',
                date: new Date('2012-09-06T22:00:00.000Z'),
                debitDate: new Date('2012-09-06T22:00:00.000Z'),
                amount: -71.99,
            },
            {
                // This one is invalid, because it doesn't have a label.
                accountId: 0,
                type: 'type.bankfee',
                date: new Date('2019-08-22T00:00:00.000Z'),
                importDate: new Date('2019-01-01:00:00.000Z'),
                amount: -0.65,
            },
            {
                // This one is invalid, because it doesn't have a date.
                accountId: 0,
                type: 'type.bankfee',
                label: 'No date',
                importDate: new Date('2019-01-01:00:00.000Z'),
                amount: -0.65,
            },
            {
                // This one is invalid, because it doesn't have an amount
                accountId: 0,
                type: 'type.bankfee',
                label: 'No amount',
                importDate: new Date('2019-01-01:00:00.000Z'),
            },
        ],

        budgets: [
            // No viewId should map to the default view.
            { categoryId: 0, year: 2025, month: 10, threshold: 150 },

            // Duplicates should be cleaned and no error should be thrown. The view id refers to a
            // view created automatically for an account (and thus won't be imported as-is).
            { categoryId: 0, year: 2020, month: 12, threshold: 100, viewId: 0 },

            { categoryId: 0, year: 2020, month: 12, threshold: 100, viewId: 0 },
        ],

        recurringTransactions: [
            {
                type: 'type.order',
                id: 1,
                userId: 1,
                accountId: 0,
                label: 'PRELEVEMENT ELECTRICITE',
                amount: -100,
                dayOfMonth: 21,
                listOfMonths: 'all',
            },
            {
                type: 'type.loan_payment',
                id: 2,
                userId: 1,
                accountId: 0,
                label: 'REMBOURSEMENT DE PRET',
                amount: -654.32,
                dayOfMonth: 15,
                listOfMonths: 'all',
            },
        ],

        appliedRecurringTransactions: [
            {
                id: 1,
                userId: 1,
                recurringTransactionId: 1,
                accountId: 0,
                month: now.getMonth(),
                year: now.getFullYear(),
            },
            {
                id: 2,
                userId: 1,
                recurringTransactionId: 2,
                accountId: 0,
                month: 1,
                year: 2000,
            },
        ],
    };

    function newWorld() {
        let result = { ...world };
        result.accesses = result.accesses.map(access => Access.cast(access));
        result.accounts = result.accounts.map(account => Account.cast(account));
        result.categories = result.categories.map(category => Category.cast(category));
        result.transactions = result.transactions.map(transaction => Transaction.cast(transaction));
        result.budgets = result.budgets.map(budget => Budget.cast(budget));
        result.recurringTransactions = result.recurringTransactions.map(rt =>
            RecurringTransaction.cast(rt)
        );
        result.appliedRecurringTransactions = result.appliedRecurringTransactions.map(art =>
            AppliedRecurringTransaction.cast(art)
        );
        result.views = result.views.map(view => View.cast(view));
        return result;
    }

    it('should run simple imports properly', async () => {
        let data = newWorld();
        await importData(USER_ID, data);

        let actualAccesses = await Access.all(USER_ID);
        assert.strictEqual(actualAccesses.length, data.accesses.length);
        assert.ok(
            data.accesses.every(c => actualAccesses.some(ac => checkObjectIsSubsetOf(c, ac)))
        );

        // Delete ids of imported accounts so that containDeep still works (since ids have been
        // altered when inserted in database).
        data.accounts.forEach(acc => {
            delete acc.id;
            delete acc.userId;
            delete acc.accessId;
        });

        let actualAccounts = await Account.all(USER_ID);
        assert.strictEqual(actualAccounts.length, data.accounts.length);
        actualAccounts.forEach(account => (account.balance = null));
        assert.ok(
            data.accounts.every(c => actualAccounts.some(ac => checkObjectIsSubsetOf(c, ac)))
        );

        let actualCategories = await Category.all(USER_ID);
        assert.strictEqual(actualCategories.length, data.categories.length);
        assert.ok(
            data.categories.every(c => actualCategories.some(ac => checkObjectIsSubsetOf(c, ac)))
        );

        // Budgets duplicates should be removed.
        const actualBudgets = await Budget.all(USER_ID);
        assert.strictEqual(actualBudgets.length, 2, 'There should be exactly 2 budgets');
        assert.ok(actualBudgets.some(ab => checkObjectIsSubsetOf(data.budgets[0], ab)));
        assert.ok(actualBudgets.some(ab => checkObjectIsSubsetOf(data.budgets[1], ab)));

        // Test for transactions is done below.

        const recurringTransactions = await RecurringTransaction.all(USER_ID);
        assert.strictEqual(recurringTransactions.length, 2);
        assert.ok(
            data.recurringTransactions.every(c =>
                recurringTransactions.some(ac => checkObjectIsSubsetOf(c, ac))
            )
        );

        // Only applied recurring transactions from the current month should be imported.
        const appliedRecurringTransactions = await AppliedRecurringTransaction.all(USER_ID);
        assert.strictEqual(appliedRecurringTransactions.length, 1);
        assert.ok(
            appliedRecurringTransactions.some(art =>
                checkObjectIsSubsetOf(data.appliedRecurringTransactions[0], art)
            )
        );

        // Only views created by the user should be created by the import but
        // every account will have a view associated to it automatically.
        // So, with two accounts imported, and two user views, and one auto with two accounts (even though
        // right now every auto view has only one account), there should be 5 views.
        const views = await View.all(USER_ID);
        assert.strictEqual(views.length, 4);

        // None of the 'auto' view should be imported.
        assert(!views.some(v => v.label.includes('Automatic')));

        const userViews = views.filter(v => v.createdByUser === true);
        assert.strictEqual(userViews.length, 2);
        assert.strictEqual(userViews[0].label, world.views[2].label);
        assert.strictEqual(userViews[1].label, world.views[3].label);
    });

    describe('ignore imports', () => {
        it('transaction without date, amount or labels and raw labels should be ignored', async () => {
            let transactions = newWorld()
                .transactions.filter(
                    op =>
                        typeof op.date !== 'undefined' &&
                        typeof amount === 'number' &&
                        (typeof op.label !== 'undefined' || typeof op.rawLabel !== 'undefined')
                )
                .map(op => {
                    // Import ids are remapped.
                    delete op.accountId;
                    delete op.categoryId;
                    return op;
                });
            let actualTransactions = await Transaction.all(USER_ID);
            assert.strictEqual(actualTransactions.length, 8);
            assert.ok(
                transactions.every(tr =>
                    actualTransactions.some(atr => checkObjectIsSubsetOf(tr, atr))
                )
            );
        });

        it('invalid customFields should be ignored when imported', async () => {
            await cleanAll(USER_ID);
            let data = newWorld();
            let validField = { name: 'valid', value: 'valid' };

            data.accesses = [
                {
                    id: 0,
                    vendorId: 'manual',
                    login: 'whatever-manual-acc--does-not-care',
                    customLabel: 'Optional custom label',
                    fields: [
                        { name: 'name' },
                        { value: 'value' },
                        { name: 'number_value', value: 3 },
                        { name: 3, value: 'number_name' },
                        validField,
                    ],
                },
            ];
            await importData(USER_ID, data);
            let accesses = await Access.all(USER_ID);
            assert.strictEqual(accesses.length, 1);
            assert.strictEqual(accesses[0].fields.length, 1);
            let field = accesses[0].fields[0];
            assert.strictEqual(field.name, validField.name);
            assert.strictEqual(field.value, validField.value);
        });

        it('views without valid accounts should be ignored', async () => {
            await cleanAll(USER_ID);
            let data = newWorld();
            data.views.push({
                id: 123,
                accounts: [],
            });
            data.views.push({
                id: 456,
                accounts: [
                    {
                        accountId: 999,
                    },
                ],
            });
            await importData(USER_ID, data);
            const views = await View.all(USER_ID);
            assert.strictEqual(views.length, 4);
            assert.ok(views.every(v => v.accounts.length > 0 && !v.accounts.includes(999)));
        });
    });

    describe('data cleanup', () => {
        it('The lastCheckDate property of an account should equal the date of the latest transaction if missing', async () => {
            let allAccounts = await Account.all(USER_ID);
            assert.deepStrictEqual(allAccounts[0].lastCheckDate, world.transactions[6].date);
        });

        it('The lastCheckDate property of an account should be ~now if missing & no transactions', async () => {
            await cleanAll(USER_ID);

            let data = newWorld();
            delete data.transactions;

            await importData(USER_ID, data);

            let allAccounts = await Account.all(USER_ID);
            assert.ok(allAccounts[0].lastCheckDate instanceof Date);
        });

        it('The lastCheckDate property of an account should not be modified if defined in the import data', async () => {
            await cleanAll(USER_ID);

            let data = newWorld();
            const lastCheckDate = '2019-07-31T00:00:00.000Z';
            data.accounts[0].lastCheckDate = lastCheckDate;

            await importData(USER_ID, data);

            let allAccounts = await Account.all(USER_ID);
            assert.deepStrictEqual(allAccounts[0].lastCheckDate, new Date(lastCheckDate));
        });

        it('The label should be used to fill the rawLabel field if missing', async () => {
            let allData = await Transaction.all(USER_ID);
            let label = world.transactions[5].label;
            let transaction = allData.find(t => t.label === label);
            assert.strictEqual(transaction.rawLabel, label);
        });

        it('The rawLabel should be used to fill the label field if missing', async () => {
            let allData = await Transaction.all(USER_ID);
            let rawLabel = world.transactions[6].rawLabel;
            let transaction = allData.find(t => t.rawLabel === rawLabel);
            assert.strictEqual(transaction.label, rawLabel);
        });

        it('importData should be set to now if missing', async () => {
            let allData = await Transaction.all(USER_ID);
            assert.ok(allData[7].importDate instanceof Date);
        });

        it('should successfully import Setting with the old format', async () => {
            await cleanAll(USER_ID);
            let data = newWorld();
            data.settings = [
                {
                    name: 'budget-display-percent',
                    value: 'true',
                },
            ];
            await importData(USER_ID, data);
        });

        it('should have renamed Setting.name into Setting.key', async () => {
            let settings = await Setting.all(USER_ID);
            // Add "locale".
            assert.strictEqual(settings.length, 2);
            assert.ok(settings.some(s => s.key === 'budget-display-percent' && s.value === 'true'));
        });

        it('should successfully import Setting with the new format', async () => {
            await cleanAll(USER_ID);
            let data = newWorld();
            data.settings = [
                {
                    key: 'budget-display-percent',
                    value: 'true',
                },
            ];
            await importData(USER_ID, data);
        });

        it('should have kept Setting.key', async () => {
            let settings = await Setting.all(USER_ID);
            // Add "locale".
            assert.strictEqual(settings.length, 2);
            assert.ok(settings.some(s => s.key === 'budget-display-percent' && s.value === 'true'));
        });

        it('should successfully do several renamings if needed', async () => {
            await cleanAll(USER_ID);

            let data = newWorld();
            let newTransaction = {
                accountId: 0,
                categoryId: 0,
                type: 'type.card',
                title: 'Mystery transaction',
                raw: 'card 07/07/2019 mystery',
                customLabel: 'Surprise',
                date: moment('2019-07-07').toDate(),
                dateImport: moment('2019-07-07T00:00:00.000Z').toDate(),
                amount: -13.37,
            };

            data.transactions.push(newTransaction);
            await importData(USER_ID, data);
        });

        it('should have applied the renamings in database', async () => {
            let transactions = await Transaction.all(USER_ID);

            // Only 8 transactions were valid in the initial batch.
            assert.strictEqual(transactions.length, 8 + 1);

            let actualTransaction = Transaction.cast({
                type: 'type.card',
                label: 'Mystery transaction',
                rawLabel: 'card 07/07/2019 mystery',
                customLabel: 'Surprise',
                date: moment('2019-07-07').toDate(),
                importDate: moment('2019-07-07T00:00:00.000Z').toDate(),
                amount: -13.37,
                isUserDefinedType: true, // As the type is defined, on import, isUserDefinedType will be set to true.
            });
            // Delete the categoryId (set to null, because it's missing in the
            // dictionary above), since we don't have an easy mapping from old
            // category numbers to new ones.
            delete actualTransaction.categoryId;

            // Compare the dates separately: the date field only contains the
            // date/month/year, not a timestamp.
            let insertedDate = moment(transactions[transactions.length - 1].date);
            let actualDate = moment(actualTransaction.date);
            assert.strictEqual(insertedDate.date(), actualDate.date());
            assert.strictEqual(insertedDate.month(), actualDate.month());
            assert.strictEqual(insertedDate.year(), actualDate.year());
            delete actualTransaction.date;

            assert.ok(transactions.some(tr => checkObjectIsSubsetOf(actualTransaction, tr)));
        });

        it('legacy customFields should be converted to new "fields" property', async () => {
            await cleanAll(USER_ID);
            let data = newWorld();
            const fields = [{ name: 'valid', value: 'valid' }];

            data.accesses = [
                {
                    id: 0,
                    vendorId: 'manual',
                    login: 'whatever-manual-acc--does-not-care',
                    customLabel: 'Optional custom label',
                    customFields: JSON.stringify(fields),
                },
            ];
            await importData(USER_ID, data);
            let accesses = await Access.all(USER_ID);
            assert.strictEqual(accesses.length, 1);
            assert.ok(!accesses[0].customFields);
            assert.strictEqual(accesses[0].fields.length, 1);
            let field = accesses[0].fields[0];
            assert.strictEqual(field.name, fields[0].name);
            assert.strictEqual(field.value, fields[0].value);
        });

        it("shouldn't use user-provided userId", async () => {
            await cleanAll(USER_ID);

            let data = newWorld();
            data.accesses[0].userId = USER_ID + 42;
            data.accounts[0].userId = USER_ID + 13;
            data.categories[0].userId = USER_ID + 37;
            data.transactions[0].userId = USER_ID + 100;

            await importData(USER_ID, data);

            let accesses = await Access.all(USER_ID + 42);
            assert.strictEqual(accesses.length, 0);
            accesses = await Access.all(USER_ID);
            assert.strictEqual(accesses.length, 1);

            let accounts = await Account.all(USER_ID + 13);
            assert.strictEqual(accounts.length, 0);
            accounts = await Account.all(USER_ID);
            assert.strictEqual(accounts.length, 2);

            let categories = await Category.all(USER_ID + 37);
            assert.strictEqual(categories.length, 0);
            categories = await Category.all(USER_ID);
            assert.strictEqual(categories.length, 4);

            let transactions = await Transaction.all(USER_ID + 100);
            assert.strictEqual(transactions.length, 0);
            transactions = await Transaction.all(USER_ID);
            // Only 8 out of the 11 transactions are valid.
            assert.strictEqual(transactions.length, 8);
        });
    });

    it('should import the default account id correctly', async () => {
        await cleanAll(USER_ID);

        let data = {
            settings: [
                Setting.cast({
                    id: 42,
                    key: DEFAULT_ACCOUNT_ID,
                    // Account id 0.
                    value: '0',
                }),
            ],
            ...newWorld(),
        };

        await importData(USER_ID, data);

        let accounts = await Account.all(USER_ID);
        assert.strictEqual(accounts.length, 2);
        let accountId = accounts[0].id;

        let settings = await Setting.all(USER_ID);

        let found = false;
        for (let s of settings) {
            if (s.key === DEFAULT_ACCOUNT_ID) {
                assert.strictEqual(s.value, accountId.toString());
                assert.strictEqual(found, false);
                found = true;
            }
        }
        assert.strictEqual(found, true);
    });

    describe('ignore entries already present', () => {
        it("shouldn't import duplicated categories", async () => {
            await cleanAll(USER_ID);

            let data = { categories: newWorld().categories };

            await importData(USER_ID, data);
            let categories = await Category.all(USER_ID);
            assert.strictEqual(categories.length, data.categories.length);

            await importData(USER_ID, data);
            categories = await Category.all(USER_ID);
            assert.strictEqual(categories.length, data.categories.length);

            assert.ok(
                data.categories.every(cat => categories.some(c => checkObjectIsSubsetOf(cat, c)))
            );

            let newCategories = [
                {
                    label: 'yolo',
                    color: '#424242',
                },
                ...data.categories,
            ];

            await importData(USER_ID, {
                categories: newCategories,
            });

            categories = await Category.all(USER_ID);
            assert.strictEqual(categories.length, data.categories.length + 1);

            assert.ok(
                newCategories.every(cat => categories.some(c => checkObjectIsSubsetOf(cat, c)))
            );
        });

        it("shouldn't import duplicated transaction rules", async () => {
            await cleanAll(USER_ID);

            let rules = [
                {
                    position: 0,
                    conditions: [{ type: 'label_matches_text', value: 'carouf' }],
                    actions: [{ type: 'categorize', categoryId: 0 }],
                },
                {
                    position: 1,
                    conditions: [{ type: 'label_matches_regexp', value: 'misc{0-9}*' }],
                    actions: [{ type: 'categorize', categoryId: 3 }],
                },
            ];

            let data = {
                categories: newWorld().categories,
                transactionRules: rules,
            };

            // deep copy lol
            let copy = JSON.parse(JSON.stringify(data));
            await importData(USER_ID, copy);

            let actualRules = await TransactionRule.allOrdered(USER_ID);
            assert.strictEqual(actualRules.length, 2);

            const cleanedTransactionRulesCopy = copy.transactionRules.slice().map(rule => {
                for (let action of rule.actions) {
                    delete action.categoryId;
                }
                return rule;
            });
            assert.ok(
                cleanedTransactionRulesCopy.every(trr =>
                    actualRules.some(ar => checkObjectIsSubsetOf(trr, ar))
                )
            );

            data.transactionRules.push({
                position: 2,
                conditions: [{ type: 'label_matches_text', value: 'hochons' }],
                actions: [{ type: 'categorize', categoryId: 0 }],
            });

            await importData(USER_ID, data);

            actualRules = await TransactionRule.allOrdered(USER_ID);
            assert.strictEqual(actualRules.length, 3);

            const cleanedRulesCopy = rules.slice().map(rule => {
                for (let action of rule.actions) {
                    delete action.categoryId;
                }
                return rule;
            });
            assert.ok(
                cleanedRulesCopy.every(r => actualRules.some(ar => checkObjectIsSubsetOf(r, ar)))
            );
        });

        it("shouldn't import duplicated accesses/accounts/transactions/alerts", async () => {
            await cleanAll(USER_ID);

            let alert = Alert.cast({
                id: 0,
                accountId: 0,
                type: 'report',
                frequency: 'daily',
                limit: null,
                order: null,
                lastTriggeredDate: null,
            });

            // Set up the initial state.
            let data = newWorld();
            data.alerts = [structuredClone(alert)];

            await importData(USER_ID, data);

            // Some sanity checks.
            {
                let accesses = await Access.all(USER_ID);
                assert.strictEqual(accesses.length, 1);
                let accounts = await Account.all(USER_ID);
                assert.strictEqual(accounts.length, 2);
                let transactions = await Transaction.all(USER_ID);
                assert.strictEqual(transactions.length, 8);
                let alerts = await Alert.all(USER_ID);
                assert.strictEqual(alerts.length, 1);
            }

            data = newWorld();
            data.alerts = [structuredClone(alert)];

            // Include a new access that's exactly the same as the previous one, modulo ID.
            let accessCopy = structuredClone(data.accesses[0]);
            accessCopy.id = 1;
            data.accesses.push(accessCopy);

            // Add a new account for this access.
            data.accounts.push(
                Account.cast({
                    id: 2,
                    // Use the access from the duplicated access.
                    accessId: 1,
                    vendorAccountId: 'manualaccount-randomid1337',
                    type: 'account-type.checking',
                    initialBalance: 0,
                    label: 'PEA',
                    currency: 'EUR',
                    importDate: new Date('2019-01-01:00:00.000Z'),
                })
            );

            // Add a new transaction for the new account.
            data.transactions.push(
                Transaction.cast({
                    accountId: 2,
                    type: 'type.card',
                    label: 'Wholefood',
                    rawLabel: 'card 13/12/2024',
                    date: new Date('2024-12-13T00:00:00.000Z'),
                    importDate: new Date('2024-12-13:00:00.000Z'),
                    amount: -42,
                })
            );

            await importData(USER_ID, data);

            // There's still a single access.
            let accesses = await Access.all(USER_ID);
            assert.strictEqual(accesses.length, 1);

            // But the new account must have been added!
            let accounts = await Account.all(USER_ID);
            assert.strictEqual(accounts.length, 3);
            assert.strictEqual(accounts[0].label, 'Compte Courant');
            assert.strictEqual(accounts[2].label, 'PEA');

            // Only one transaction has been imported.
            let transactions = await Transaction.all(USER_ID);
            assert.strictEqual(transactions.length, 9);

            assert.strictEqual(transactions[8].label, 'Wholefood');

            // Still only one alert.
            let alerts = await Alert.all(USER_ID);
            assert.strictEqual(alerts.length, 1);
        });
    });
});

describe('import OFX', () => {
    let ofx = null;
    let account = null;
    let transactions = null;

    before(async () => {
        await cleanAll(USER_ID);
    });

    it('should parse OFX DateTime fields correctly', () => {
        assert.ok(parseOfxDate('20200201') instanceof Date, 'WTF');
        assert.ok(parseOfxDate('20200211120000') instanceof Date, 'WTF');
        assert.ok(parseOfxDate('20200211120000.000') instanceof Date, 'WTF');
        assert.ok(parseOfxDate('20200211120000.000[-12:EST]') instanceof Date, 'WTF');
        assert.ok(parseOfxDate('20200211120000.000[-01:EST]') instanceof Date, 'WTF');
        assert.ok(parseOfxDate('20200211120605.123[-5:EST]') instanceof Date, 'WTF');

        assert.strictEqual(parseOfxDate('2020021'), null);
        assert.strictEqual(parseOfxDate('20201301'), null);
        assert.strictEqual(parseOfxDate('20200211120000.000[-13:EST]'), null);
        assert.strictEqual(parseOfxDate('20200211120000.000[+15:EST]'), null);
        assert.strictEqual(parseOfxDate('20200211120000.000[15:EST]'), null);
    });

    it('should run the import properly', async () => {
        let ofxFilePath = path.join(
            path.dirname(fs.realpathSync(__filename)),
            '..',
            'fixtures',
            'checking.ofx'
        );
        ofx = fs.readFileSync(ofxFilePath, { encoding: 'utf8' });

        await importData(USER_ID, await ofxToKresus(ofx));

        let allData = await Access.all(USER_ID);
        assert.strictEqual(allData.length, 1);

        allData = await Account.all(USER_ID);
        assert.strictEqual(allData.length, 1);
        account = allData[0];

        allData = await Transaction.all(USER_ID);
        assert.strictEqual(allData.length, 5);
        transactions = allData;

        // It should have detected the right account vendor id, type, initial
        // balance and currency and transactions type
        assert.strictEqual(account.vendorAccountId, '1234567-00');

        assert.strictEqual(account.type, 'account-type.savings');
        assert.strictEqual(account.initialBalance, 12.79);
        assert.strictEqual(account.currency, 'NZD');

        assert.strictEqual(transactions.filter(t => t.type === 'type.bankfee').length, 1);
        assert.strictEqual(transactions.filter(t => t.type === 'type.card').length, 4);
    });
});

describe('Data migrations', () => {
    before(async () => {
        await cleanAll(USER_ID);
    });

    it('should remove access fields for boursorama, cmmc and ganassurances', async () => {
        const data = {
            accesses: [
                {
                    id: 0,
                    vendorId: 'boursorama',
                    login: 'whatever-manual-acc--does-not-care',
                    fields: [
                        {
                            name: 'device',
                            value: 'whatever',
                        },
                        {
                            name: 'pin_code',
                            value: '1234',
                        },
                    ],
                },

                {
                    id: 1,
                    vendorId: 'cmmc',
                    login: 'whatever-manual-acc--does-not-care',
                    fields: [
                        {
                            name: 'website',
                            value: 'par',
                        },
                    ],
                },

                {
                    id: 2,
                    vendorId: 'ganassurances',
                    login: 'whatever-manual-acc--does-not-care',
                    fields: [
                        {
                            name: 'website',
                            value: 'espaceclient.ganassurances.fr',
                        },
                    ],
                },

                {
                    id: 3,
                    vendorId: 'manual',
                    login: 'whatever-manual-acc--does-not-care',
                    fields: [
                        {
                            name: 'test',
                            value: 'whatever',
                        },
                    ],
                },
            ],
        };

        await importData(USER_ID, data);

        const actualAccesses = await Access.all(USER_ID);
        assert.strictEqual(actualAccesses.length, data.accesses.length);

        assert.strictEqual(actualAccesses[0].fields.length, 0);
        assert.strictEqual(actualAccesses[1].fields.length, 0);
        assert.strictEqual(actualAccesses[2].fields.length, 0);
        assert.strictEqual(actualAccesses[3].fields.length, 1);
    });

    it('should rename cmmc vendor to creditmutuel', async () => {
        assert.strictEqual((await Access.byVendorId(USER_ID, { uuid: 'cmmc' })).length, 0);
        assert.strictEqual((await Access.byVendorId(USER_ID, { uuid: 'creditmutuel' })).length, 1);
    });

    it('should not have renamed other vendors', async () => {
        assert.strictEqual((await Access.byVendorId(USER_ID, { uuid: 'boursorama' })).length, 1);
        assert.strictEqual((await Access.byVendorId(USER_ID, { uuid: 'ganassurances' })).length, 1);
        assert.strictEqual((await Access.byVendorId(USER_ID, { uuid: 'manual' })).length, 1);
    });

    it('should remove creditcooperatif/btpbanque auth_type', async () => {
        await cleanAll(USER_ID);

        const data = {
            accesses: [
                {
                    id: 0,
                    vendorId: 'creditcooperatif',
                    login: 'whatever-manual-acc--does-not-care',
                    fields: [
                        {
                            name: 'auth_type',
                            value: 'particular',
                        },
                    ],
                },

                {
                    id: 1,
                    vendorId: 'btpbanque',
                    login: 'whatever-manual-acc--does-not-care',
                    fields: [
                        {
                            name: 'auth_type',
                            value: 'strong',
                        },
                    ],
                },

                {
                    id: 2,
                    vendorId: 'bred',
                    login: 'whatever-manual-acc--does-not-care',
                    fields: [
                        {
                            name: 'website',
                            value: 'bred',
                        },
                    ],
                },

                {
                    id: 3,
                    vendorId: 'manual',
                    login: 'whatever-manual-acc--does-not-care',
                    fields: [
                        {
                            name: 'test',
                            value: 'whatever',
                        },
                    ],
                },
            ],
        };

        await importData(USER_ID, data);

        const actualAccesses = await Access.all(USER_ID);
        assert.strictEqual(actualAccesses.length, data.accesses.length);

        // Remove All The Fields!
        assert.strictEqual(actualAccesses[0].fields.length, 0);
        assert.strictEqual(actualAccesses[1].fields.length, 0);
        assert.strictEqual(actualAccesses[2].fields.length, 0);

        // But not the fields of unrelated accesses.
        assert.strictEqual(actualAccesses[3].fields.length, 1);
    });

    it('should rename bnporc to bnp', async () => {
        await cleanAll(USER_ID);

        const data = {
            accesses: [
                {
                    id: 0,
                    vendorId: 'bnporc',
                    login: 'whatever-manual-acc--does-not-care',
                    fields: [
                        {
                            name: 'device',
                            value: 'whatever',
                        },
                        {
                            name: 'pin_code',
                            value: '1234',
                        },
                    ],
                },
            ],
        };

        await importData(USER_ID, data);

        const actualAccesses = await Access.all(USER_ID);
        assert.strictEqual(actualAccesses.length, 1);
        assert.strictEqual(actualAccesses[0].vendorId, 'bnp');
    });
});
