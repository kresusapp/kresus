// There's a bug between eslint and prettier with spacing around async arrow
// functions, so we need to explicitly use async functions instead.
/* eslint-disable prefer-arrow-callback */
import should from 'should';
import fs from 'fs';
import path from 'path';
import moment from 'moment';

import { Access, Account, Category, Setting, Transaction, User } from '../../server/models';
import { testing, importData } from '../../server/controllers/all';
import { testing as ofxTesting } from '../../server/controllers/ofx';

let { ofxToKresus } = testing;
let { parseOfxDate } = ofxTesting;

async function cleanAll(userId) {
    await Access.destroyAll(userId);
    await Account.destroyAll(userId);
    await Category.destroyAll(userId);
    await Setting.destroyAll(userId);
    await Transaction.destroyAll(userId);
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
    before(async function() {
        await cleanAll(USER_ID);
    });

    let world = {
        accesses: [
            {
                id: 0,
                vendorId: 'manual',
                login: 'whatever-manual-acc--does-not-care',
                customLabel: 'Optional custom label'
            }
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
                importDate: new Date('2019-01-01:00:00.000Z')
            }
        ],

        categories: [
            {
                label: 'Groceries',
                color: '#1b9d68',
                id: 0
            },
            {
                label: 'Books',
                color: '#b562bf',
                id: 1
            },
            {
                label: 'Taxes',
                color: '#ff0000',
                id: 2
            },
            {
                label: 'Misc',
                color: '#00ff00',
                id: 3
            }
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
                amount: -83.8
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
                amount: -60.8
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
                amount: -20
            },
            {
                accountId: 0,
                type: 'type.transfer',
                label: 'SEPA m. john doe 123457689 rent',
                rawLabel: 'transfer to m. john doe 123457689 rent',
                date: new Date('2019-07-27T00:00:00.000Z'),
                importDate: new Date('2019-01-01:00:00.000Z'),
                amount: -500
            },
            {
                accountId: 0,
                categoryId: 2,
                type: 'type.order',
                label: 'taxes public department: fr123abc456',
                rawLabel: 'direct debit sepa taxes public department: fr123abc456',
                date: new Date('2019-08-17T00:00:00.000Z'),
                importDate: new Date('2019-01-01:00:00.000Z'),
                amount: -150
            },
            {
                accountId: 0,
                categoryId: 3,
                type: 'type.withdrawal',
                label: 'ATM my pretty town center',
                date: new Date('2019-08-19T00:00:00.000Z'),
                importDate: new Date('2019-01-01:00:00.000Z'),
                amount: -20
            },
            {
                accountId: 0,
                type: 'type.bankfee',
                rawLabel: 'commission on non euro buy 0.65eur',
                date: new Date('2019-08-22T00:00:00.000Z'),
                importDate: new Date('2019-01-01:00:00.000Z'),
                amount: -0.65
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
                amount: -71.99
            },
            {
                // This one is invalid, because it doesn't have a label.
                accountId: 0,
                type: 'type.bankfee',
                date: new Date('2019-08-22T00:00:00.000Z'),
                importDate: new Date('2019-01-01:00:00.000Z'),
                amount: -0.65
            },
            {
                // This one is invalid, because it doesn't have a date.
                accountId: 0,
                type: 'type.bankfee',
                label: 'No date',
                importDate: new Date('2019-01-01:00:00.000Z'),
                amount: -0.65
            },
            {
                // This one is invalid, because it doesn't have an amount
                accountId: 0,
                type: 'type.bankfee',
                label: 'No amount',
                importDate: new Date('2019-01-01:00:00.000Z')
            }
        ]
    };

    function cleanUndefined(obj) {
        for (let k in obj) {
            if (typeof obj[k] === 'undefined') {
                delete obj[k];
            }
        }
        return obj;
    }

    function newWorld() {
        let result = { ...world };
        result.accesses = result.accesses.map(access => Access.cast(access)).map(cleanUndefined);
        result.accounts = result.accounts.map(account => Account.cast(account)).map(cleanUndefined);
        result.categories = result.categories
            .map(category => Category.cast(category))
            .map(cleanUndefined);
        result.operations = result.operations
            .map(operation => Transaction.cast(operation))
            .map(cleanUndefined);
        return result;
    }

    it('should run the import properly', async function() {
        let data = newWorld();
        await importData(USER_ID, data);

        let actualAccessses = await Access.all(USER_ID);
        actualAccessses.length.should.equal(data.accesses.length);
        actualAccessses.should.containDeep(data.accesses);

        let actualAccounts = await Account.all(USER_ID);
        actualAccounts.length.should.equal(data.accounts.length);
        actualAccounts.should.containDeep(data.accounts);

        let actualCategories = await Category.all(USER_ID);
        actualCategories.length.should.equal(data.categories.length);
        actualCategories.should.containDeep(data.categories);

        // Test for transactions is done below.
    });

    describe('lastCheckDate', () => {
        it('The lastCheckDate property of an account should equal the date of the latest operation if missing', async function() {
            let allAccounts = await Account.all(USER_ID);
            allAccounts[0].lastCheckDate.should.eql(world.operations[6].date);
        });

        it('The lastCheckDate property of an account should be ~now if missing & no operations', async function() {
            await cleanAll(USER_ID);

            let data = newWorld();
            delete data.operations;

            await importData(USER_ID, data);

            let allAccounts = await Account.all(USER_ID);
            allAccounts[0].lastCheckDate.should.be.a.Date();
        });

        it('The lastCheckDate property of an account should not be modified if defined in the import data', async function() {
            await cleanAll(USER_ID);

            let data = newWorld();
            const lastCheckDate = '2019-07-31T00:00:00.000Z';
            data.accounts[0].lastCheckDate = lastCheckDate;

            await importData(USER_ID, data);

            let allAccounts = await Account.all(USER_ID);
            allAccounts[0].lastCheckDate.should.eql(new Date(lastCheckDate));
        });
    });

    describe('label & rawLabel', () => {
        it('The label should be used to fill the rawLabel field if missing', async function() {
            let allData = await Transaction.all(USER_ID);
            let label = world.operations[5].label;
            let transaction = allData.find(t => t.label === label);
            transaction.rawLabel.should.equal(label);
        });

        it('The rawLabel should be used to fill the label field if missing', async function() {
            let allData = await Transaction.all(USER_ID);
            let rawLabel = world.operations[6].rawLabel;
            let transaction = allData.find(t => t.rawLabel === rawLabel);
            transaction.label.should.equal(rawLabel);
        });
    });

    describe('Mandatory properties', () => {
        it('Transaction without date, amount or labels and raw labels should be ignored', async function() {
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
    });

    describe('importDate', () => {
        it('should be set to now if missing', async function() {
            let allData = await Transaction.all(USER_ID);
            allData[7].importDate.should.be.a.Date();
        });
    });

    describe('should apply renamings when importing', () => {
        it('should successfully import Setting with the old format', async function() {
            await cleanAll(USER_ID);
            let data = newWorld();
            data.settings = [
                {
                    name: 'budget-display-percent',
                    value: 'true'
                }
            ];
            await importData(USER_ID, data);
        });

        it('should have renamed Setting.name into Setting.key', async function() {
            let settings = await Setting.allWithoutGhost(USER_ID);
            // Add "locale".
            settings.length.should.equal(2);
            settings.should.containDeep([
                {
                    key: 'budget-display-percent',
                    value: 'true'
                }
            ]);
        });

        it('should successfully import Setting with the new format', async function() {
            await cleanAll(USER_ID);
            let data = newWorld();
            data.settings = [
                {
                    key: 'budget-display-percent',
                    value: 'true'
                }
            ];
            await importData(USER_ID, data);
        });

        it('should have kept Setting.key', async function() {
            let settings = await Setting.allWithoutGhost(USER_ID);
            // Add "locale".
            settings.length.should.equal(2);
            settings.should.containDeep([
                {
                    key: 'budget-display-percent',
                    value: 'true'
                }
            ]);
        });

        it('should successfully do several renamings if needed', async function() {
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
                amount: -13.37
            };

            data.operations.push(newTransaction);
            await importData(USER_ID, data);
        });

        it('should have applied the renamings in database', async function() {
            let transactions = await Transaction.all(USER_ID);

            // Only 8 transactions were valid in the initial batch.
            transactions.length.should.equal(8 + 1);

            let actualTransaction = cleanUndefined(
                Transaction.cast({
                    type: 'type.card',
                    label: 'Mystery transaction',
                    rawLabel: 'card 07/07/2019 mystery',
                    customLabel: 'Surprise',
                    date: moment('2019-07-07').toDate(),
                    importDate: moment('2019-07-07T00:00:00.000Z').toDate(),
                    amount: -13.37,
                    isUserDefinedType: true // As the type is defined, on import, isUserDefinedType will be set to true.
                })
            );

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
    });

    describe('"name" or "value" not being strings of access customField', () => {
        it('should be ignored when imported', async () => {
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
                        validField
                    ]
                }
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

    describe('legacy "customFields" access property', () => {
        it('should be converted to new "fields" property', async () => {
            await cleanAll(USER_ID);
            let data = newWorld();
            const fields = [{ name: 'valid', value: 'valid' }];

            data.accesses = [
                {
                    id: 0,
                    vendorId: 'manual',
                    login: 'whatever-manual-acc--does-not-care',
                    customLabel: 'Optional custom label',
                    customFields: JSON.stringify(fields)
                }
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
    });
});

describe('import OFX', () => {
    let ofx = null;
    let account = null;
    let transactions = null;

    before(async function() {
        await cleanAll(USER_ID);
    });

    it('should parse OFX DateTime fields correctly', function() {
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

    it('should run the import properly', async function() {
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
