/* eslint-disable no-console */

// There's a bug between eslint and prettier with spacing around async arrow
// functions, so we need to explicitly use async functions instead.
/* eslint-disable prefer-arrow-callback */

import PouchDB from 'pouchdb';

import { apply as applyConfig } from '../../server/config';
// eslint-disable-next-line import/named
import { testing as serverTesting } from '../../server';

process.on('unhandledRejection', (reason, promise) => {
    promise.catch(err => {
        console.error('Reason: ', reason);
        console.error('Promise stack trace: ', err.stack || err);
    });
    throw new Error(`Unhandled promise rejection (promise stack trace is in the logs): ${reason}`);
});

let Categories = null;
let Settings = null;
let Transactions = null;

let MIGRATIONS = null;

before(async function() {
    // Set process.kresus.user for models.
    applyConfig({
        kresus: {
            salt: 'pepper is even better than salt amirite'
        }
    });

    // Set a temporary database for testing.
    let options = {
        dbName: '/tmp/kresus-test-db'
    };
    options.db = new PouchDB(options.dbName, { auto_compaction: true });
    await serverTesting.configureCozyDB(options);

    // Initialize models.
    let initModels = require('../../server/models');
    await initModels();

    Categories = require('../../server/models/categories');
    Settings = require('../../server/models/settings');
    Transactions = require('../../server/models/transactions');

    MIGRATIONS = require('../../server/models/migrations').testing.migrations;
});

async function clear(Model) {
    let all = await Model.all(0);
    for (let i of all) {
        if (typeof i.id !== 'undefined') {
            await Model.destroy(0, i.id);
        }
    }
}

describe('Test migration 0', () => {
    before(async function() {
        await clear(Settings);
    });

    it('should insert new config in the DB', async function() {
        await Settings.create(0, {
            name: 'weboob-log',
            value: 'Some value'
        });

        await Settings.create(0, {
            name: 'another-setting',
            value: 'Another value'
        });

        let allConfigs = await Settings.allWithoutGhost(0);

        allConfigs.length.should.equal(3);

        allConfigs.should.containDeep([
            {
                name: 'locale'
            },
            {
                name: 'another-setting',
                value: 'Another value'
            },
            {
                name: 'weboob-log',
                value: 'Some value'
            }
        ]);
    });

    it('should run migration 0 correctly', async function() {
        let m0 = MIGRATIONS[0];

        let cache = {};
        let result = await m0(cache, 0);
        result.should.equal(true);
    });

    it('should have removed the weboob-log key', async function() {
        let allConfigs = await Settings.allWithoutGhost(0);

        allConfigs.length.should.equal(2);

        allConfigs.should.not.containDeep([
            {
                name: 'weboob-log',
                value: 'Some value'
            }
        ]);

        allConfigs.should.containDeep([
            {
                name: 'locale'
            },
            {
                name: 'another-setting',
                value: 'Another value'
            }
        ]);
    });
});

describe('Test migration 1', () => {
    let categoryFields = {
        title: 'expenses',
        color: '#ff00ff'
    };

    let op1fields = {
        categoryId: null,
        title: 'has existing category',
        raw: 'has existing category'
    };

    let op2fields = {
        title: 'no category',
        raw: 'no category'
    };

    let op3fields = {
        categoryId: null,
        title: 'nonexistant category',
        raw: 'nonexistant category'
    };

    before(async function() {
        await clear(Transactions);
        await clear(Categories);
    });

    it('should insert new operations and category in the DB', async function() {
        let expensesCat = await Categories.create(0, categoryFields);

        op1fields.categoryId = String(expensesCat.id);
        await Transactions.create(0, op1fields);

        await Transactions.create(0, op2fields);

        let nonexistentCategoryId = expensesCat.id === '42' ? 43 : 42;
        op3fields.categoryId = String(nonexistentCategoryId);
        await Transactions.create(0, op3fields);

        let allCat = await Categories.all(0);
        allCat.length.should.equal(1);
        allCat.should.containDeepOrdered([categoryFields]);

        let allOp = await Transactions.all(0);
        allOp.length.should.equal(3);
        allOp.should.containDeep([op1fields, op2fields, op3fields]);
    });

    it('should run migration m1 correctly', async function() {
        let m1 = MIGRATIONS[1];
        let cache = {};
        let result = await m1(cache, 0);
        result.should.equal(true);
    });

    it("should have removed one transaction's category", async function() {
        let allCat = await Categories.all(0);
        allCat.length.should.equal(1);
        allCat.should.containDeepOrdered([categoryFields]);

        let new3 = Object.assign({}, op3fields);
        delete new3.categoryId;

        let allOp = await Transactions.all(0);
        allOp.length.should.equal(3);
        allOp.should.containDeep([op1fields, op2fields, new3]);
    });
});

describe('Test migration 2', () => {
    let categoryFields = {
        title: 'expenses',
        color: '#ff00ff'
    };

    let transaction1fields = {
        categoryId: '-1',
        title: 'has no category',
        raw: 'has no category'
    };

    let transaction2fields = {
        title: 'has a category',
        raw: 'has a category'
    };

    before(async function() {
        await clear(Categories);
        await clear(Transactions);
    });

    it('should insert new operations and category in the DB', async function() {
        await Transactions.create(0, transaction1fields);

        let expensesCat = await Categories.create(0, categoryFields);
        transaction2fields.categoryId = String(expensesCat.id);
        await Transactions.create(0, transaction2fields);

        let allTransactions = await Transactions.all(0);
        allTransactions.length.should.equal(2);
        allTransactions.should.containDeep([transaction1fields, transaction2fields]);
    });

    it('should run migration m2 correctly', async function() {
        let m2 = MIGRATIONS[2];
        let cache = {};
        let result = await m2(cache, 0);
        result.should.equal(true);
    });

    it('should have removed the categoryId when equal to NONE_CATEGORY_ID', async function() {
        let allTransactions = await Transactions.all(0);

        /* eslint-disable no-unused-expressions */
        let firstTransaction = allTransactions.find(t => t.raw === transaction1fields.raw);
        should(firstTransaction.categoryId).be.undefined;
        /* eslint-enable no-unused-expressions */
    });

    it('should have kept the categoryId if not equal to NONE_CATEGORY_ID', async function() {
        let allTransactions = await Transactions.all(0);
        let allCat = await Categories.all(0);

        let secondTransaction = allTransactions.find(t => t.raw === transaction2fields.raw);
        secondTransaction.categoryId.should.equal(allCat[0].id);
    });
});
