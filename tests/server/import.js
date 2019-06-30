// There's a bug between eslint and prettier with spacing around async arrow
// functions, so we need to explicitly use async functions instead.
/* eslint-disable prefer-arrow-callback */
import should from 'should';

import { clear } from '../database/helpers';

let Accesses = null;
let Accounts = null;
let Categories = null;
let Transactions = null;
let importData = null;

before(async function() {
    Accesses = require('../../server/models/accesses');
    Accounts = require('../../server/models/accounts');
    Categories = require('../../server/models/categories');
    Transactions = require('../../server/models/transactions');
    importData = require('../../server/controllers/v1/all').importData;
});

async function cleanAll() {
    await clear(Accesses);
    await clear(Accounts);
    await clear(Categories);
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

    it('should run the import properly', async function() {
        // Make a deep copy to avoid modifications on the root object.
        let data = JSON.parse(JSON.stringify(world));
        await importData(0, data);

        let allData = await Accesses.all(0);
        allData.length.should.equal(data.accesses.length);

        allData = await Accounts.all(0);
        allData.length.should.equal(data.accounts.length);

        allData = await Categories.all(0);
        allData.length.should.equal(data.categories.length);
    });

    describe('lastCheckDate', () => {
        it('The lastCheckDate property of an account should equal the date of the latest operation if missing', async function() {
            let allAccounts = await Accounts.all(0);
            allAccounts[0].lastCheckDate.should.eql(new Date(world.operations[6].date));
        });

        it('The lastCheckDate property of an account should be ~now if missing & no operations', async function() {
            await cleanAll();

            // Make a deep copy to avoid modifications on the root object.
            let data = JSON.parse(JSON.stringify(world));
            delete data.operations;

            await importData(0, data);

            let allAccounts = await Accounts.all(0);
            allAccounts[0].lastCheckDate.should.be.a.Date();
        });

        it('The lastCheckDate property of an account should not be modified if defined in the import data', async function() {
            await cleanAll();

            // Make a deep copy to avoid modifications on the root object.
            let data = JSON.parse(JSON.stringify(world));
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
            let allData = await Transactions.all(0);
            allData.length.should.equal(7);
        });
    });
});
