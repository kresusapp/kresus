// There's a bug between eslint and prettier with spacing around async arrow
// functions, so we need to explicitly use async functions instead.
/* eslint-disable prefer-arrow-callback */
import should from 'should';
import fs from 'fs';
import path from 'path';

import { clear } from '../database/helpers';

let Accesses = null;
let Accounts = null;
let Categories = null;
let Settings = null;
let Transactions = null;
let importData = null;
let ofxToKresus = null;

before(async function() {
    Accesses = require('../../server/models/accesses');
    Accounts = require('../../server/models/accounts');
    Categories = require('../../server/models/categories');
    Settings = require('../../server/models/settings');
    Transactions = require('../../server/models/transactions');

    ({ importData, ofxToKresus } = require('../../server/controllers/v1/all').testing);
});

async function cleanAll() {
    await clear(Accesses);
    await clear(Accounts);
    await clear(Categories);
    await clear(Settings);
    await clear(Transactions);
}

describe('import', () => {
    before(async function() {
        await cleanAll();
    });

    let world = {
        accesses: [
            {
                vendorId: 'manual',
                login: 'whatever-manual-acc--does-not-care',
                customLabel: 'Optional custom label',
                id: 0
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
                currency: 'EUR'
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
                date: '2019-07-07T00:00:00.000Z',
                amount: -83.8
            },
            {
                accountId: 0,
                categoryId: 0,
                type: 'type.card',
                label: 'Wholemart',
                rawLabel: 'card 09/07/2019 wholemart',
                customLabel: 'Food & stuff',
                date: '2019-07-09T00:00:00.000Z',
                amount: -60.8
            },
            {
                accountId: 0,
                categoryId: 1,
                type: 'type.card',
                label: 'amazon payments',
                rawLabel: 'carte 19/07/2019 amazon payments',
                customLabel: '1984 - George Orwell',
                date: '2019-07-19T00:00:00.000Z',
                amount: -20
            },
            {
                accountId: 0,
                type: 'type.transfer',
                label: 'SEPA m. john doe 123457689 rent',
                rawLabel: 'transfer to m. john doe 123457689 rent',
                date: '2019-07-27T00:00:00.000Z',
                amount: -500
            },
            {
                accountId: 0,
                categoryId: 2,
                type: 'type.order',
                label: 'taxes public department: fr123abc456',
                rawLabel: 'direct debit sepa taxes public department: fr123abc456',
                date: '2019-08-17T00:00:00.000Z',
                amount: -150
            },
            {
                accountId: 0,
                categoryId: 3,
                type: 'type.withdrawal',
                label: 'ATM my pretty town center',
                date: '2019-08-19T00:00:00.000Z',
                amount: -20
            },
            {
                accountId: 0,
                type: 'type.bankfee',
                rawLabel: 'commission on non euro buy 0.65eur',
                date: '2019-08-22T00:00:00.000Z',
                amount: -0.65
            },
            {
                accountId: 0,
                type: 'type.bankfee',
                date: '2019-08-22T00:00:00.000Z',
                amount: -0.65
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
        // Make a deep copy to avoid modifications on the root object.
        let result = JSON.parse(JSON.stringify(world));
        result.accesses = result.accounts.map(access => Accesses.cast(access)).map(cleanUndefined);
        result.accounts = result.accounts
            .map(account => Accounts.cast(account))
            .map(cleanUndefined);
        result.categories = result.categories
            .map(category => Categories.cast(category))
            .map(cleanUndefined);
        result.operations = result.operations
            .map(operation => Transactions.cast(operation))
            .map(cleanUndefined);
        return result;
    }

    it('should run the import properly', async function() {
        let data = newWorld();
        await importData(0, data);

        let actualAccessses = await Accesses.all(0);
        actualAccessses.length.should.equal(data.accesses.length);
        actualAccessses.should.containDeep(data.accesses);

        let actualAccounts = await Accounts.all(0);
        actualAccounts.length.should.equal(data.accounts.length);
        actualAccounts.should.containDeep(data.accounts);

        let actualCategories = await Categories.all(0);
        actualCategories.length.should.equal(data.categories.length);
        actualCategories.should.containDeep(data.categories);

        // Test for transactions is done below.
    });

    describe('lastCheckDate', () => {
        it('The lastCheckDate property of an account should equal the date of the latest operation if missing', async function() {
            let allAccounts = await Accounts.all(0);
            allAccounts[0].lastCheckDate.should.eql(new Date(world.operations[6].date));
        });

        it('The lastCheckDate property of an account should be ~now if missing & no operations', async function() {
            await cleanAll();

            let data = newWorld();
            delete data.operations;

            await importData(0, data);

            let allAccounts = await Accounts.all(0);
            allAccounts[0].lastCheckDate.should.be.a.Date();
        });

        it('The lastCheckDate property of an account should not be modified if defined in the import data', async function() {
            await cleanAll();

            let data = newWorld();
            const lastCheckDate = '2019-07-31T00:00:00.000Z';
            data.accounts[0].lastCheckDate = lastCheckDate;

            await importData(0, data);

            let allAccounts = await Accounts.all(0);
            allAccounts[0].lastCheckDate.should.eql(new Date(lastCheckDate));
        });
    });

    describe('label & rawLabel', () => {
        it('The label should be used to fill the rawLabel field if missing', async function() {
            let allData = await Transactions.all(0);
            let label = world.operations[5].label;
            let transaction = allData.find(t => t.label === label);
            transaction.rawLabel.should.equal(label);
        });

        it('The rawLabel should be used to fill the label field if missing', async function() {
            let allData = await Transactions.all(0);
            let rawLabel = world.operations[6].rawLabel;
            let transaction = allData.find(t => t.rawLabel === rawLabel);
            transaction.label.should.equal(rawLabel);
        });

        it('Transactions without labels & rawLabel should be ignored', async function() {
            let operations = newWorld()
                .operations.filter(
                    op => typeof op.label !== 'undefined' || typeof op.rawLabel !== 'undefined'
                )
                .map(op => {
                    // Import ids are remapped.
                    delete op.accountId;
                    delete op.categoryId;
                    return op;
                });
            let actualTransactions = await Transactions.all(0);
            actualTransactions.length.should.equal(7);
            actualTransactions.should.containDeep(operations);
        });
    });

    describe('should apply renamings when importing', () => {
        it('should successfully import Settings with the old format', async function() {
            await cleanAll();
            let data = newWorld();
            data.settings = [
                {
                    name: 'budget-display-percent',
                    value: 'true'
                }
            ];
            await importData(0, data);
        });

        it('should have renamed Settings.name into Settings.key', async function() {
            let settings = await Settings.allWithoutGhost(0);
            // Add "locale" and "migration-version".
            settings.length.should.equal(3);
            settings.should.containDeep([
                {
                    key: 'budget-display-percent',
                    value: 'true'
                }
            ]);
        });

        it('should successfully import Settings with the new format', async function() {
            await cleanAll();
            let data = newWorld();
            data.settings = [
                {
                    key: 'budget-display-percent',
                    value: 'true'
                }
            ];
            await importData(0, data);
        });

        it('should have kept Settings.key', async function() {
            let settings = await Settings.allWithoutGhost(0);
            // Add "locale" and "migration-version".
            settings.length.should.equal(3);
            settings.should.containDeep([
                {
                    key: 'budget-display-percent',
                    value: 'true'
                }
            ]);
        });

        it('should successfully do several renamings if needed', async function() {
            await cleanAll();

            let data = newWorld();
            let newTransaction = cleanUndefined(
                Transactions.cast({
                    accountId: 0,
                    categoryId: 0,
                    type: 'type.card',
                    title: 'Mystery transaction',
                    raw: 'card 07/07/2019 mystery',
                    customLabel: 'Surprise',
                    date: '2019-07-07T00:00:00.000Z',
                    dateImport: '2019-07-07T00:00:00.000Z',
                    amount: -13.37
                })
            );

            data.operations.push(newTransaction);
            await importData(0, data);
        });

        it('should have applied the renamings in database', async function() {
            let transactions = await Transactions.all(0);

            // Only 7 transactions were valid in the initial batch.
            transactions.length.should.equal(7 + 1);

            let actualTransaction = cleanUndefined(
                Transactions.cast({
                    type: 'type.card',
                    label: 'Mystery transaction',
                    rawLabel: 'card 07/07/2019 mystery',
                    customLabel: 'Surprise',
                    date: '2019-07-07T00:00:00.000Z',
                    importDate: '2019-07-07T00:00:00.000Z',
                    amount: -13.37
                })
            );

            transactions.should.containDeep([actualTransaction]);
        });
    });
});

describe('import OFX', () => {
    let ofx = null;
    let account = null;
    let transactions = null;

    before(async function() {
        await cleanAll();
    });

    it('should run the import properly', async function() {
        let ofxFilePath = path.join(
            path.dirname(fs.realpathSync(__filename)),
            '..',
            'fixtures',
            'checking.ofx'
        );
        ofx = fs.readFileSync(ofxFilePath, { encoding: 'utf8' });

        await importData(0, ofxToKresus(ofx));

        let allData = await Accesses.all(0);
        allData.length.should.equal(1);

        allData = await Accounts.all(0);
        allData.length.should.equal(1);
        account = allData[0];

        allData = await Transactions.all(0);
        allData.length.should.equal(5);
        transactions = allData;
    });

    it('should have detected the right account vendor id, type, initial balance and currency and transactions type', function() {
        account.vendorAccountId.should.equal('1234567-00');

        account.type.should.equal('account-type.savings');
        account.initialBalance.should.equal(12.79);
        account.currency.should.equal('NZD');

        transactions.filter(t => t.type === 'type.bankfee').length.should.equal(1);
        transactions.filter(t => t.type === 'type.card').length.should.equal(4);
    });
});
