import should from 'should';
import fs from 'fs';
import path from 'path';
import moment from 'moment';

import {
    Access,
    Account,
    Budget,
    Category,
    Setting,
    Transaction,
    User,
    TransactionRule,
} from '../../server/models';
import { testing, importData } from '../../server/controllers/all';
import { testing as ofxTesting } from '../../server/controllers/ofx';

let { ofxToKresus } = testing;
let { parseOfxDate } = ofxTesting;

async function cleanAll(userId) {
    await Access.destroyAll(userId);
    await Account.destroyAll(userId);
    await Budget.destroyAll(userId);
    await Category.destroyAll(userId);
    await Setting.destroyAll(userId);
    await Transaction.destroyAll(userId);
    await TransactionRule.destroyAll(userId);
}

let USER_ID = null;
before(async () => {
    // Reload the USER_ID from the database, since process.kresus.user.id which
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
                vendorId: 'manual',
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

        operations: [
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
            // Duplicates should be cleaned and no error should be thrown
            { categoryId: 0, year: 2020, month: 12, threshold: 100 },

            { categoryId: 0, year: 2020, month: 12, threshold: 100 },
        ],
    };

    function newWorld() {
        let result = { ...world };
        result.accesses = result.accesses.map(access => Access.cast(access));
        result.accounts = result.accounts.map(account => Account.cast(account));
        result.categories = result.categories.map(category => Category.cast(category));
        result.operations = result.operations.map(operation => Transaction.cast(operation));
        result.budgets = result.budgets.map(budget => Budget.cast(budget));
        return result;
    }

    it('should run simple imports properly', async () => {
        let data = newWorld();
        await importData(USER_ID, data);

        let actualAccesses = await Access.all(USER_ID);
        actualAccesses.length.should.equal(data.accesses.length);
        actualAccesses.should.containDeep(data.accesses);

        let actualAccounts = await Account.all(USER_ID);
        actualAccounts.length.should.equal(data.accounts.length);
        actualAccounts.should.containDeep(data.accounts);

        let actualCategories = await Category.all(USER_ID);
        actualCategories.length.should.equal(data.categories.length);
        actualCategories.should.containDeep(data.categories);

        // Budgets duplicates should be removed.
        const actualBudgets = await Budget.all(USER_ID);
        actualBudgets.length.should.equal(1);
        actualBudgets.should.containDeep([data.budgets[0]]);

        // Test for transactions is done below.
    });

    describe('ignore imports', () => {
        it('transaction without date, amount or labels and raw labels should be ignored', async () => {
            let operations = newWorld()
                .operations.filter(
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
            actualTransactions.length.should.equal(8);
            actualTransactions.should.containDeep(operations);
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
            accesses.length.should.equal(1);
            accesses[0].fields.length.should.equal(1);
            let field = accesses[0].fields[0];
            field.name.should.equal(validField.name);
            field.value.should.equal(validField.value);
        });
    });

    describe('data cleanup', () => {
        it('The lastCheckDate property of an account should equal the date of the latest operation if missing', async () => {
            let allAccounts = await Account.all(USER_ID);
            allAccounts[0].lastCheckDate.should.eql(world.operations[6].date);
        });

        it('The lastCheckDate property of an account should be ~now if missing & no operations', async () => {
            await cleanAll(USER_ID);

            let data = newWorld();
            delete data.operations;

            await importData(USER_ID, data);

            let allAccounts = await Account.all(USER_ID);
            allAccounts[0].lastCheckDate.should.be.a.Date();
        });

        it('The lastCheckDate property of an account should not be modified if defined in the import data', async () => {
            await cleanAll(USER_ID);

            let data = newWorld();
            const lastCheckDate = '2019-07-31T00:00:00.000Z';
            data.accounts[0].lastCheckDate = lastCheckDate;

            await importData(USER_ID, data);

            let allAccounts = await Account.all(USER_ID);
            allAccounts[0].lastCheckDate.should.eql(new Date(lastCheckDate));
        });

        it('The label should be used to fill the rawLabel field if missing', async () => {
            let allData = await Transaction.all(USER_ID);
            let label = world.operations[5].label;
            let transaction = allData.find(t => t.label === label);
            transaction.rawLabel.should.equal(label);
        });

        it('The rawLabel should be used to fill the label field if missing', async () => {
            let allData = await Transaction.all(USER_ID);
            let rawLabel = world.operations[6].rawLabel;
            let transaction = allData.find(t => t.rawLabel === rawLabel);
            transaction.label.should.equal(rawLabel);
        });

        it('importData should be set to now if missing', async () => {
            let allData = await Transaction.all(USER_ID);
            allData[7].importDate.should.be.a.Date();
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
            settings.length.should.equal(2);
            settings.should.containDeep([
                {
                    key: 'budget-display-percent',
                    value: 'true',
                },
            ]);
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
            settings.length.should.equal(2);
            settings.should.containDeep([
                {
                    key: 'budget-display-percent',
                    value: 'true',
                },
            ]);
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

            data.operations.push(newTransaction);
            await importData(USER_ID, data);
        });

        it('should have applied the renamings in database', async () => {
            let transactions = await Transaction.all(USER_ID);

            // Only 8 transactions were valid in the initial batch.
            transactions.length.should.equal(8 + 1);

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
            insertedDate.date().should.equal(actualDate.date());
            insertedDate.month().should.equal(actualDate.month());
            insertedDate.year().should.equal(actualDate.year());
            delete actualTransaction.date;

            transactions.should.containDeep([actualTransaction]);
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
            accesses.length.should.equal(1);
            should.equal(accesses[0].customFields, null);
            accesses[0].fields.length.should.equal(1);
            let field = accesses[0].fields[0];
            field.name.should.equal(fields[0].name);
            field.value.should.equal(fields[0].value);
        });

        it("shouldn't use user-provided userId", async () => {
            await cleanAll(USER_ID);

            let data = newWorld();
            data.accesses[0].userId = USER_ID + 42;
            data.accounts[0].userId = USER_ID + 13;
            data.categories[0].userId = USER_ID + 37;
            data.operations[0].userId = USER_ID + 100;

            await importData(USER_ID, data);

            let accesses = await Access.all(USER_ID + 42);
            accesses.length.should.equal(0);
            accesses = await Access.all(USER_ID);
            accesses.length.should.equal(data.accesses.length);

            let accounts = await Account.all(USER_ID + 13);
            accounts.length.should.equal(0);
            accounts = await Account.all(USER_ID);
            accounts.length.should.equal(data.accounts.length);

            let categories = await Category.all(USER_ID + 37);
            categories.length.should.equal(0);
            categories = await Category.all(USER_ID);
            categories.length.should.equal(data.categories.length);

            let operations = await Transaction.all(USER_ID + 100);
            operations.length.should.equal(0);
            operations = await Transaction.all(USER_ID);
            operations.length.should.equal(data.operations.length);
        });
    });

    describe('ignore entries already present', () => {
        it("shouldn't import duplicated categories", async () => {
            await cleanAll(USER_ID);

            let data = { categories: newWorld().categories };

            await importData(USER_ID, data);
            let categories = await Category.all(USER_ID);
            categories.length.should.equal(data.categories.length);

            await importData(USER_ID, data);
            categories = await Category.all(USER_ID);
            categories.length.should.equal(data.categories.length);
            categories.should.containDeep(data.categories);

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
            categories.length.should.equal(data.categories.length + 1);
            categories.should.containDeep(newCategories);
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
            actualRules.length.should.equal(2);
            actualRules.should.containDeep(
                copy.transactionRules.slice().map(rule => {
                    for (let action of rule.actions) {
                        delete action.categoryId;
                    }
                    return rule;
                })
            );

            data.transactionRules.push({
                position: 2,
                conditions: [{ type: 'label_matches_text', value: 'hochons' }],
                actions: [{ type: 'categorize', categoryId: 0 }],
            });

            await importData(USER_ID, data);

            actualRules = await TransactionRule.allOrdered(USER_ID);
            actualRules.length.should.equal(3);
            actualRules.should.containDeep(
                rules.slice().map(rule => {
                    for (let action of rule.actions) {
                        delete action.categoryId;
                    }
                    return rule;
                })
            );
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
        should(parseOfxDate('20200201')).be.a.Date();
        should(parseOfxDate('20200211120000')).be.a.Date();
        should(parseOfxDate('20200211120000.000')).be.a.Date();
        should(parseOfxDate('20200211120000.000[-12:EST]')).be.a.Date();
        should(parseOfxDate('20200211120000.000[-01:EST]')).be.a.Date();
        should(parseOfxDate('20200211120605.123[-5:EST]')).be.a.Date();

        should(parseOfxDate('2020021')).be.null();
        should(parseOfxDate('20201301')).be.null();
        should(parseOfxDate('20200211120000.000[-13:EST]')).be.null();
        should(parseOfxDate('20200211120000.000[+15:EST]')).be.null();
        should(parseOfxDate('20200211120000.000[15:EST]')).be.null();
    });

    it('should run the import properly', async () => {
        let ofxFilePath = path.join(
            path.dirname(fs.realpathSync(__filename)),
            '..',
            'fixtures',
            'checking.ofx'
        );
        ofx = fs.readFileSync(ofxFilePath, { encoding: 'utf8' });

        await importData(USER_ID, ofxToKresus(ofx));

        let allData = await Access.all(USER_ID);
        allData.length.should.equal(1);

        allData = await Account.all(USER_ID);
        allData.length.should.equal(1);
        account = allData[0];

        allData = await Transaction.all(USER_ID);
        allData.length.should.equal(5);
        transactions = allData;

        // It should have detected the right account vendor id, type, initial
        // balance and currency and transactions type
        account.vendorAccountId.should.equal('1234567-00');

        account.type.should.equal('account-type.savings');
        account.initialBalance.should.equal(12.79);
        account.currency.should.equal('NZD');

        transactions.filter(t => t.type === 'type.bankfee').length.should.equal(1);
        transactions.filter(t => t.type === 'type.card').length.should.equal(4);
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
        actualAccesses.length.should.equal(data.accesses.length);

        actualAccesses[0].fields.length.should.equal(0);
        actualAccesses[1].fields.length.should.equal(0);
        actualAccesses[2].fields.length.should.equal(0);
        actualAccesses[3].fields.length.should.equal(1);
    });

    it('should rename cmmc vendor to creditmutuel', async () => {
        (await Access.byVendorId(USER_ID, { uuid: 'cmmc' })).length.should.equal(0);
        (await Access.byVendorId(USER_ID, { uuid: 'creditmutuel' })).length.should.equal(1);
    });

    it('should not have renamed other vendors', async () => {
        (await Access.byVendorId(USER_ID, { uuid: 'boursorama' })).length.should.equal(1);
        (await Access.byVendorId(USER_ID, { uuid: 'ganassurances' })).length.should.equal(1);
        (await Access.byVendorId(USER_ID, { uuid: 'manual' })).length.should.equal(1);
    });
});
