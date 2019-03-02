/* eslint-disable no-console */

// There's a bug between eslint and prettier with spacing around async arrow
// functions, so we need to explicitly use async functions instead.
/* eslint-disable prefer-arrow-callback */

// Testing for undefined values is done in a way that makes the linter thinks the line is unused.
/* eslint-disable no-unused-expressions */

import PouchDB from 'pouchdb';

import { apply as applyConfig } from '../../server/config';
// eslint-disable-next-line import/named
import { testing as serverTesting } from '../../server';

import { UNKNOWN_OPERATION_TYPE } from '../../shared/helpers';

process.on('unhandledRejection', (reason, promise) => {
    promise.catch(err => {
        console.error('Reason: ', reason);
        console.error('Promise stack trace: ', err.stack || err);
    });
    throw new Error(`Unhandled promise rejection (promise stack trace is in the logs): ${reason}`);
});

let Accesses = null;
let Accounts = null;
let Alerts = null;
let Banks = null;
let Budgets = null;
let Categories = null;
let GhostSettings = null;
let Settings = null;
let Transactions = null;
let TransactionTypes = null;

let MIGRATIONS = null;

before(async function() {
    // Set process.kresus.user for models.
    applyConfig({});

    // Set a temporary database for testing.
    let options = {
        dbName: '/tmp/kresus-test-db'
    };
    options.db = new PouchDB(options.dbName, { auto_compaction: true });
    await serverTesting.configureCozyDB(options);

    // Initialize models.
    let initModels = require('../../server/models');
    await initModels();

    Accesses = require('../../server/models/accesses');
    Accounts = require('../../server/models/accounts');
    Alerts = require('../../server/models/alerts');
    Banks = require('../../server/models/deprecated-bank');
    Budgets = require('../../server/models/budgets');
    Categories = require('../../server/models/categories');
    Settings = require('../../server/models/settings');
    Transactions = require('../../server/models/transactions');
    TransactionTypes = require('../../server/models/deprecated-operationtype');

    let staticData = require('../../server/models/static-data');
    GhostSettings = staticData.ConfigGhostSettings;

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

async function clearDeprecatedModels(Model) {
    let all = await Model.all();
    for (let m of all) {
        if (typeof m.id !== 'undefined') {
            await Model.destroy(m.id);
        }
    }
}

describe('Test migration 0', () => {
    before(async function() {
        await clear(Settings);
    });

    it('should insert new settings in the DB', async function() {
        await Settings.create(0, {
            name: 'weboob-log',
            value: 'Some value'
        });

        await Settings.create(0, {
            name: 'another-setting',
            value: 'Another value'
        });

        let allSettings = await Settings.allWithoutGhost(0);

        allSettings.length.should.equal(3);

        allSettings.should.containDeep([
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
        let result = await m0(0);
        result.should.equal(true);
    });

    it('should have removed the weboob-log key', async function() {
        let allSettings = await Settings.allWithoutGhost(0);

        allSettings.length.should.equal(2);

        allSettings.should.not.containDeep([
            {
                name: 'weboob-log',
                value: 'Some value'
            }
        ]);

        allSettings.should.containDeep([
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
        title: 'nonexistent category',
        raw: 'nonexistent category'
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
        let result = await m1(0);
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
        let result = await m2(0);
        result.should.equal(true);
    });

    it('should have removed the categoryId when equal to NONE_CATEGORY_ID', async function() {
        let allTransactions = await Transactions.all(0);
        let firstTransaction = allTransactions.find(t => t.raw === transaction1fields.raw);
        should.not.exist(firstTransaction.categoryId);
    });

    it('should have kept the categoryId if not equal to NONE_CATEGORY_ID', async function() {
        let allTransactions = await Transactions.all(0);
        let allCat = await Categories.all(0);

        let secondTransaction = allTransactions.find(t => t.raw === transaction2fields.raw);
        secondTransaction.categoryId.should.equal(allCat[0].id);
    });
});

describe('Test migration 3', () => {
    let hasWebsiteField = {
        bank: 'HAS_WEBSITE',
        website: 'https://kresus.org'
    };

    let hasNoWebsiteField = {
        bank: 'WEBSITE_UNDEFINED'
    };

    let hasEmptyWebsiteField = {
        bank: 'NO_WEBSITE',
        website: ''
    };

    let hasWebsiteFieldAndCustomField = {
        bank: 'HAS_CUSTOMFIELD_WEBSITE',
        website: 'https://framagit.org/kresusapp/kresus',
        customFields: JSON.stringify([
            {
                name: 'website',
                value: 'https://kresus.org'
            }
        ])
    };

    before(async function() {
        await clear(Accesses);
    });

    it('should insert new accesses in the DB', async function() {
        await Accesses.create(0, hasWebsiteField);
        await Accesses.create(0, hasNoWebsiteField);
        await Accesses.create(0, hasEmptyWebsiteField);
        await Accesses.create(0, hasWebsiteFieldAndCustomField);

        let allAccesses = await Accesses.all(0);
        allAccesses.length.should.equal(4);
        allAccesses.should.containDeep([
            hasWebsiteField,
            hasNoWebsiteField,
            hasEmptyWebsiteField,
            hasWebsiteFieldAndCustomField
        ]);
    });

    it('should run migration m3 correctly', async function() {
        let m3 = MIGRATIONS[3];
        let result = await m3(0);
        result.should.equal(true);
    });

    it('should have transformed the website property into a custom field', async function() {
        let allAccesses = await Accesses.all(0);

        let access = allAccesses.find(t => t.bank === hasWebsiteField.bank);
        access.customFields.should.equal(
            JSON.stringify([{ name: 'website', value: hasWebsiteField.website }])
        );
    });

    it('should not have transformed the website property into a custom field if it was empty', async function() {
        let allAccesses = await Accesses.all(0);

        let access = allAccesses.find(t => t.bank === hasNoWebsiteField.bank);
        access.customFields.should.equal('[]');
        should.not.exist(access.website);

        access = allAccesses.find(t => t.bank === hasEmptyWebsiteField.bank);
        access.customFields.should.equal('[]');
    });

    it('should not modify an existing custom field named "website"', async function() {
        let allAccesses = await Accesses.all(0);

        let access = allAccesses.find(t => t.bank === hasWebsiteFieldAndCustomField.bank);
        access.customFields.should.equal(hasWebsiteFieldAndCustomField.customFields);
    });
});

describe('Test migration 4', () => {
    let bnpAccess = {
        bank: 'bnporc',
        login: 'bnporc'
    };

    let bnpAccessWithWebsite = {
        bank: bnpAccess.bank,
        login: 'bnporcwithwebsite',
        customFields: JSON.stringify([
            {
                name: 'website',
                value: 'https://specific.website'
            }
        ])
    };

    let helloBankAccess = {
        bank: 'hellobank',
        login: 'hellobank'
    };

    let helloBankAccount = {
        bank: helloBankAccess.bank
    };

    before(async function() {
        await clear(Accesses);
        await clear(Accounts);
    });

    it('should insert new accesses and accounts in the DB', async function() {
        await Accesses.create(0, bnpAccess);
        await Accesses.create(0, bnpAccessWithWebsite);
        await Accesses.create(0, helloBankAccess);

        await Accounts.create(0, helloBankAccount);

        let allAccesses = await Accesses.all(0);
        allAccesses.length.should.equal(3);
        allAccesses.should.containDeep([bnpAccess, bnpAccessWithWebsite, helloBankAccess]);

        let allAccounts = await Accounts.all(0);
        allAccounts.length.should.equal(1);
        allAccounts.should.containDeep([helloBankAccount]);
    });

    it('should run migration m4 correctly', async function() {
        let m4 = MIGRATIONS[4];
        let result = await m4(0);
        result.should.equal(true);
    });

    it('should have transformed the bank property into the new one', async function() {
        let allAccesses = await Accesses.all(0);

        let access = allAccesses.find(t => t.login === helloBankAccess.login);
        access.bank.should.equal('bnporc');

        let allAccounts = await Accounts.all(0);
        allAccounts[0].bank.should.equal('bnporc');
    });

    it('should have updated the websites custom fields if not already defined', async function() {
        let allAccesses = await Accesses.all(0);

        let access = allAccesses.find(t => t.login === bnpAccess.login);
        access.customFields.should.equal(JSON.stringify([{ name: 'website', value: 'pp' }]));

        access = allAccesses.find(t => t.login === helloBankAccess.login);
        access.customFields.should.equal(JSON.stringify([{ name: 'website', value: 'hbank' }]));
    });

    it('should not have updated the websites custom fields if already defined', async function() {
        let allAccesses = await Accesses.all(0);

        let access = allAccesses.find(t => t.login === bnpAccessWithWebsite.login);
        access.customFields.should.equal(bnpAccessWithWebsite.customFields);
    });
});

describe('Test migration 5', () => {
    let account = {
        bank: 'fakeaccount'
    };

    let accountWithDate = {
        bank: 'withdate',
        importDate: new Date()
    };

    let accountWithOps = {
        bank: 'withops'
    };

    let op1fields = {
        dateImport: new Date('2015-07-31T12:00:00Z')
    };

    let op2fields = {
        dateImport: new Date('2015-10-21T12:00:00Z')
    };

    before(async function() {
        await clear(Accounts);
        await clear(Transactions);
    });

    it('should insert new accounts and operations in the DB', async function() {
        await Accounts.create(0, account);
        await Accounts.create(0, accountWithDate);
        let accWithOps = await Accounts.create(0, accountWithOps);

        op1fields.accountId = accWithOps.id;
        op2fields.accountId = accWithOps.id;

        let allAccounts = await Accounts.all(0);
        allAccounts.length.should.equal(3);
        allAccounts.should.containDeep([account, accountWithDate, accountWithOps]);

        await Transactions.create(0, op1fields);
        await Transactions.create(0, op2fields);

        let allTransactions = await Transactions.all(0);
        allTransactions.length.should.equal(2);
        allTransactions.should.containDeep([op1fields, op2fields]);
    });

    it('should run migration m5 correctly', async function() {
        let m5 = MIGRATIONS[5];
        let result = await m5(0);
        result.should.equal(true);
    });

    it('should have set an import date when missing', async function() {
        let acc = await Accounts.byBank(0, { uuid: account.bank });
        acc[0].importDate.should.Date();
    });

    it('should have set an import date when missing based on the oldest transaction', async function() {
        let acc = await Accounts.byBank(0, { uuid: accountWithOps.bank });
        acc[0].importDate.should.eql(op1fields.dateImport);
    });

    it('should not have modified the importDate if present', async function() {
        let acc = await Accounts.byBank(0, { uuid: accountWithDate.bank });
        acc[0].importDate.should.eql(accountWithDate.importDate);
    });
});

describe('Test migration 6', () => {
    let transactionType = {
        name: 'deprecated'
    };

    let transactionWithTransactionType = {
        title: 'with-transaction-type'
    };

    let transactionWithUnknownTransactionTypeId = {
        title: 'with-unknown-transaction-type',
        operationTypeID: 'WTF'
    };

    let transactionWithType = {
        title: 'with-type',
        type: 'not-deprecated'
    };

    before(async function() {
        await clear(Transactions);
        await clearDeprecatedModels(TransactionTypes);
    });

    it('should insert new transactions and transaction types in the DB', async function() {
        // The transaction types are deprecated and therefore have no knowledge of the user's id.
        let deprecatedType = await TransactionTypes.create(transactionType);
        let allTransactionTypes = await TransactionTypes.all();

        allTransactionTypes.length.should.equal(1);
        allTransactionTypes.should.containDeep([transactionType]);

        transactionWithTransactionType.operationTypeID = deprecatedType.id;

        await Transactions.create(0, transactionWithTransactionType);
        await Transactions.create(0, transactionWithUnknownTransactionTypeId);
        await Transactions.create(0, transactionWithType);

        let allTransactions = await Transactions.all(0);
        allTransactions.length.should.equal(3);
        allTransactions.should.containDeep([
            transactionWithTransactionType,
            transactionWithUnknownTransactionTypeId,
            transactionWithType
        ]);
    });

    it('should run migration m6 correctly', async function() {
        let m6 = MIGRATIONS[6];
        let result = await m6(0);
        result.should.equal(true);
    });

    it('should have replaced the operationTypeID property with a "type" property', async function() {
        let allTransactions = await Transactions.all(0);

        let transaction = allTransactions.find(
            t => t.title === transactionWithTransactionType.title
        );
        transaction.type.should.equal(transactionType.name);
        should.not.exist(transaction.operationTypeID);

        transaction = allTransactions.find(
            t => t.title === transactionWithUnknownTransactionTypeId.title
        );
        transaction.type.should.equal(UNKNOWN_OPERATION_TYPE);
        should.not.exist(transaction.operationTypeID);
    });

    it('should not have modified the transaction type if already existing', async function() {
        let allTransactions = await Transactions.all(0);
        let transaction = allTransactions.find(t => t.title === transactionWithType.title);
        transaction.type.should.equal(transactionWithType.type);
    });

    it('should have destroyed all the types', async function() {
        const types = await TransactionTypes.all();
        types.length.should.equal(0);
    });
});

describe('Test migration 7', () => {
    let account = {
        accountNumber: 'h0ldmyB33r'
    };

    let alertWithInvalidAccount = {
        bankAccount: 'invalid'
    };

    let alertWithAccount = {
        bankAccount: account.accountNumber
    };

    before(async function() {
        await clear(Accounts);
        await clear(Alerts);
    });

    it('should insert new accounts and alerts in the DB', async function() {
        await Accounts.create(0, account);
        await Alerts.create(0, alertWithInvalidAccount);
        await Alerts.create(0, alertWithAccount);

        let allAccounts = await Accounts.all(0);
        allAccounts.length.should.equal(1);
        allAccounts.should.containDeep([account]);

        let allAlerts = await Alerts.all(0);
        allAlerts.length.should.equal(2);
        allAlerts.should.containDeep([alertWithInvalidAccount, alertWithAccount]);
    });

    it('should run migration m7 correctly', async function() {
        let m7 = MIGRATIONS[7];
        let result = await m7(0);
        result.should.equal(true);
    });

    it('should have kept only the alerts with a known account number', async function() {
        let allAlerts = await Alerts.all(0);
        allAlerts.length.should.equal(1);
        allAlerts.should.containDeep([alertWithAccount]);
    });
});

describe('Test migration 8', () => {
    let bankFields = {
        name: 'deprecated'
    };

    before(async function() {
        await clearDeprecatedModels(Banks);
    });

    it('should insert new banks in the DB', async function() {
        // The banks are deprecated and therefore have no knowledge of the user's id.
        await Banks.create(bankFields);
        let allBanks = await Banks.all();

        allBanks.length.should.equal(1);
        allBanks.should.containDeep([bankFields]);
    });

    it('should run migration m8 correctly', async function() {
        let m8 = MIGRATIONS[8];
        let result = await m8(0);
        result.should.equal(true);
    });

    it('should have removed all the banks from the DB', async function() {
        let allBanks = await Banks.all();
        allBanks.length.should.equal(0);
    });
});

describe('Test migration 9', () => {
    // The migration is now a no-op. We only check the result to ensure the next migrations run.
    it('should run migration m9 correctly', async function() {
        let m9 = MIGRATIONS[9];
        let result = await m9(0);
        result.should.equal(true);
    });
});

describe('Test migration 10', () => {
    let bnpere = {
        bank: 's2e',
        customFields: JSON.stringify([
            {
                name: 'website',
                value: 'smartphone.s2e-net.com'
            }
        ])
    };

    let capeasi = {
        bank: 's2e',
        customFields: JSON.stringify([
            {
                name: 'website',
                value: 'mobile.capeasi.com'
            }
        ])
    };

    let esalia = {
        bank: 's2e',
        customFields: JSON.stringify([
            {
                name: 'website',
                value: 'm.esalia.com'
            }
        ])
    };

    let hsbc = {
        bank: 's2e',
        customFields: JSON.stringify([
            {
                name: 'website',
                value: 'mobi.ere.hsbc.fr'
            }
        ])
    };

    let other = {
        bank: 'fakebank',
        customFields: JSON.stringify([
            {
                name: 'website',
                value: 'donttouch.com'
            }
        ])
    };

    before(async function() {
        await clear(Accesses);
    });

    it('should insert new accesses in the DB', async function() {
        await Accesses.create(0, bnpere);
        await Accesses.create(0, capeasi);
        await Accesses.create(0, esalia);
        await Accesses.create(0, hsbc);
        await Accesses.create(0, other);

        let allAccesses = await Accesses.all(0);
        allAccesses.length.should.equal(5);
        allAccesses.should.containDeep([bnpere, capeasi, esalia, hsbc, other]);
    });

    it('should run migration m10 correctly', async function() {
        let m10 = MIGRATIONS[10];
        let result = await m10(0);
        result.should.equal(true);
    });

    it('only hsbc should remain a s2e bank access', async function() {
        let s2eAccesses = await Accesses.byBank(0, { uuid: 's2e' });
        s2eAccesses.length.should.equal(1);
        s2eAccesses.should.containDeep([hsbc]);
    });

    it('should have modified the bank & reset the custom fields for all s2e accesses but hsbc', async function() {
        let allAccesses = await Accesses.all(0);
        allAccesses = allAccesses.filter(a => !['s2e', 'fakebank'].includes(a.bank));
        allAccesses.length.should.equal(3);
        allAccesses.every(a => a.customFields === '[]').should.equal(true);

        allAccesses.should.containDeep([
            { bank: 'bnppere' },
            { bank: 'capeasi' },
            { bank: 'esalia' }
        ]);
    });

    it('should not have transformed any other bank access', async function() {
        let otherAccesses = await Accesses.byBank(0, { uuid: other.bank });
        otherAccesses.length.should.equal(1);
        otherAccesses.should.containDeep([other]);
    });
});

describe('Test migration 11', async function() {
    let accountWithNoneIban = {
        title: 'without-iban',
        iban: 'None'
    };

    let accountWithValidIban = {
        iban: 'valid'
    };

    before(async function() {
        await clear(Accounts);
    });

    it('should insert new accesses in the DB', async function() {
        await Accounts.create(0, accountWithNoneIban);
        await Accounts.create(0, accountWithValidIban);

        let allAccounts = await Accounts.all(0);
        allAccounts.length.should.equal(2);
        allAccounts.should.containDeep([accountWithNoneIban, accountWithValidIban]);
    });

    it('should run migration m11 correctly', async function() {
        let m11 = MIGRATIONS[11];
        let result = await m11(0);
        result.should.equal(true);
    });

    it('should have removed all IBAN if equal to "None"', async function() {
        let allAccounts = await Accounts.all(0);
        let accWithoutIban = allAccounts.find(a => a.title === accountWithNoneIban.title);
        should.exist(accWithoutIban);
        should.not.exist(accWithoutIban.iban);
    });

    it('should not have removed any other IBAN', async function() {
        let allAccounts = await Accounts.all(0);
        let accountsWithIban = allAccounts.filter(a => typeof a.iban !== 'undefined');
        accountsWithIban.length.should.equal(1);
        accountsWithIban.should.containDeep([accountWithValidIban]);
    });
});

describe('Test migration 12', async function() {
    let notAGhost = {
        name: 'not-a-ghost'
    };

    before(async function() {
        await clear(Settings);
    });

    it('should insert new settings in the DB but throw an error when listing all the settings', async function() {
        let settings = Array.from(GhostSettings).map(s => ({ name: s }));

        settings.push(notAGhost);

        for (let s of settings) {
            await Settings.create(0, s);
        }

        // An assert will be triggered due to ghost settings existing in DB.
        await Settings.all(0).should.be.rejected();

        // The 'all' method generates the ghost settings on the fly and returns them even though
        // they are not in DB. To get only settings from the DB we use the old method.
        let allSettings = await Settings.testing.oldAll();
        allSettings.length.should.equal(settings.length);
        allSettings.should.containDeep(settings);
    });

    it('should run migration m12 correctly', async function() {
        let m12 = MIGRATIONS[12];
        let result = await m12(0);
        result.should.equal(true);
    });

    it('should have removed all ghost settings from the DB', async function() {
        // The 'all' method generates the ghost settings on the fly and returns them even though
        // they are not in DB. To get only settings from the DB we use the old method.
        let allSettings = await Settings.testing.oldAll();
        allSettings.length.should.equal(1);
        allSettings.should.containDeep([notAGhost]);
    });
});

describe('Test migration 13', async function() {
    let emailConfigWithoutEmail = {
        name: 'mail-config',
        value: JSON.stringify({})
    };

    let emailConfigWithEmail = {
        name: 'mail-config',
        value: JSON.stringify({
            toEmail: 'roger@rabbit.com'
        })
    };

    before(async function() {
        await clear(Settings);
    });

    it('should insert mail-config setting w/o valid email in the DB', async function() {
        await Settings.create(0, emailConfigWithoutEmail);
        let found = await Settings.byName(0, 'mail-config');
        should.exist(found);
    });

    it('should run migration m13 correctly when no email is provided in config', async function() {
        let m13 = MIGRATIONS[13];
        let result = await m13(0);
        result.should.equal(true);
    });

    it('should have removed mail-config setting without creating email-recipient setting', async function() {
        let found = await Settings.byName(0, 'mail-config');
        should.not.exist(found);

        found = await Settings.byName(0, 'email-recipient');
        should.not.exist(found);
    });

    it('should insert mail-config setting with valid email in the DB', async function() {
        await clear(Settings);

        await Settings.create(0, emailConfigWithEmail);
        let found = await Settings.byName(0, 'mail-config');
        should.exist(found);
    });

    it('should run migration m13 correctly when email is provided in config', async function() {
        let m13 = MIGRATIONS[13];
        let result = await m13(0);
        result.should.equal(true);
    });

    it('should have removed mail-config setting', async function() {
        let found = await Settings.byName(0, 'mail-config');
        should.not.exist(found);
    });

    it('should have inserted email-recipient setting in the DB', async function() {
        let found = await Settings.byName(0, 'email-recipient');
        should.exist(found);
        found.value.should.equal('roger@rabbit.com');
    });
});

describe('Test migration 14', () => {
    let invalidCustomField = {
        bank: 'HAS_INVALID_CUSTOMFIELD',
        customFields: 'INVALID'
    };

    let noCustomField = {
        bank: 'NO_CUSTOM_FIELD'
    };

    let validCustomField = {
        bank: 'HAS_VALID_CUSTOMFIELD',
        customFields: JSON.stringify([
            {
                name: 'website',
                value: 'https://kresus.org'
            }
        ])
    };

    before(async function() {
        await clear(Accesses);
    });

    it('should insert new accesses in the DB', async function() {
        await Accesses.create(0, invalidCustomField);
        await Accesses.create(0, noCustomField);
        await Accesses.create(0, validCustomField);

        let allAccesses = await Accesses.all(0);
        allAccesses.length.should.equal(3);
        allAccesses.should.containDeep([invalidCustomField, noCustomField, validCustomField]);
    });

    it('should run migration m14 correctly', async function() {
        let m14 = MIGRATIONS[14];
        let result = await m14(0);
        result.should.equal(true);
    });

    it('should have replaced invalid or nonexistent custom fields by an empty array', async function() {
        let allAccesses = await Accesses.all(0);
        allAccesses = allAccesses.filter(a => a.bank !== validCustomField.bank);
        allAccesses.length.should.equal(2);
        allAccesses.every(a => a.customFields === '[]').should.equal(true);
    });

    it('should not have modified valid customFields', async function() {
        let allAccesses = await Accesses.all(0);
        let validCustomFiedsAccess = allAccesses.find(a => a.bank === validCustomField.bank);
        validCustomFiedsAccess.customFields.should.equal(validCustomField.customFields);
    });
});

describe('Test migration 15', () => {
    let weboobGhostSetting = {
        name: 'weboob-version'
    };

    before(async function() {
        await clear(Settings);
    });

    it('The ghost settings should have a "weboob-version" key', async function() {
        GhostSettings.has('weboob-version').should.equal(true);
    });

    it('should insert new settings in the DB but throw an error when listing all the settings', async function() {
        await Settings.create(0, weboobGhostSetting);

        // An assert will be triggered due to ghost settings existing in DB.
        await Settings.all(0).should.be.rejected();

        // The 'all' method generates the ghost settings on the fly and returns them even though
        // they are not in DB. To get only settings from the DB we use the old method.
        let allSettings = await Settings.testing.oldAll();
        allSettings.length.should.equal(1);
        allSettings.should.containDeep([weboobGhostSetting]);
    });

    it('should run migration m15 correctly', async function() {
        let m15 = MIGRATIONS[15];
        let result = await m15(0);
        result.should.equal(true);
    });

    it('should have removed all ghost settings from the DB', async function() {
        // The 'all' method generates the ghost settings on the fly and returns them even though
        // they are not in DB. To get only settings from the DB we use the old method.
        let weboobVersionSetting = (await Settings.testing.oldAll()).find(
            s => s.name === weboobGhostSetting.name
        );
        should.not.exist(weboobVersionSetting);
    });
});

describe('Test migration 16', () => {
    let account1Fields = {
        accountNumber: '0123456789'
    };

    let account2Fields = {
        accountNumber: account1Fields.accountNumber
    };

    let transactionFields = {
        bankAccount: account2Fields.accountNumber
    };

    let transactionUnknownAccNum = {
        bankAccount: 'whatever'
    };

    let alertFields = {
        bankAccount: account1Fields.accountNumber
    };

    let alertUnknownAccountNum = {
        bankAccount: 'whatever'
    };

    before(async function() {
        await clear(Accounts);
        await clear(Alerts);
        await clear(Transactions);
    });

    it('should insert accounts, alerts & transactions in the DB', async function() {
        account1Fields.id = (await Accounts.create(0, account1Fields)).id;
        account2Fields.id = (await Accounts.create(0, account2Fields)).id;

        let allAccounts = await Accounts.all(0);
        allAccounts.length.should.equal(2);
        allAccounts.should.containDeep([account1Fields, account2Fields]);

        transactionFields.id = (await Transactions.create(0, transactionFields)).id;
        transactionUnknownAccNum.id = (await Transactions.create(0, transactionUnknownAccNum)).id;
        let allTransactions = await Transactions.all(0);
        allTransactions.length.should.equal(2);
        allTransactions.should.containDeep([transactionFields, transactionUnknownAccNum]);

        alertFields.id = (await Alerts.create(0, alertFields)).id;
        alertUnknownAccountNum.id = (await Alerts.create(0, alertUnknownAccountNum)).id;
        let allALerts = await Alerts.all(0);
        allALerts.length.should.equal(2);
        allALerts.should.containDeep([alertFields, alertUnknownAccountNum]);
    });

    it('should run migration m16 correctly', async function() {
        let m16 = MIGRATIONS[16];
        let result = await m16(0);
        result.should.equal(true);
    });

    it('should have destroyed transactions/alerts with unknown account number', async function() {
        // CozyDB will throw a "missing" error when it does not find anything.
        await Transactions.find(0, transactionUnknownAccNum.id).should.be.rejectedWith(Error, {
            message: 'missing'
        });

        await Alerts.find(0, alertUnknownAccountNum.id).should.be.rejectedWith(Error, {
            message: 'missing'
        });
    });

    it('should have set the accountId to the transactions/alerts and removed the bankAccount property', async function() {
        let found = await Transactions.find(0, transactionFields.id);
        found.should.have.property('accountId');
        should.not.exist(found.bankAccount);

        found = await Alerts.find(0, alertFields.id);
        found.should.have.property('accountId');
        should.not.exist(found.bankAccount);
    });

    it('should have cloned the transactions/alerts if there were two accounts with the same number', async function() {
        delete transactionFields.id;
        delete transactionFields.bankAccount;

        let allTransactions = await Transactions.all(0);
        allTransactions.length.should.equal(2);
        allTransactions.should.containDeep([
            { ...transactionFields, accountId: account1Fields.id },
            { ...transactionFields, accountId: account2Fields.id }
        ]);

        delete alertFields.id;
        delete alertFields.bankAccount;

        let allAlerts = await Alerts.all(0);
        allAlerts.length.should.equal(2);
        allAlerts.should.containDeep([
            { ...alertFields, accountId: account1Fields.id },
            { ...alertFields, accountId: account2Fields.id }
        ]);
    });
});

describe('Test migration 18', async function() {
    before(async function() {
        await clear(Budgets);
        await clear(Categories);
    });

    let categoryWithThreshold = {
        title: 'expenses',
        threshold: 42
    };

    let categoryWithoutThreshold = {
        title: 'earnings',
        threshold: 0
    };

    it('should insert categories in the DB', async function() {
        categoryWithThreshold.id = (await Categories.create(0, categoryWithThreshold)).id;
        await Categories.create(0, categoryWithoutThreshold);

        (await Categories.all(0)).should.containDeep([
            categoryWithThreshold,
            categoryWithoutThreshold
        ]);
    });

    it('should run migration m18 correctly', async function() {
        let m18 = MIGRATIONS[18];
        let result = await m18(0);
        result.should.equal(true);
    });

    it('should have created a budget for the current month/year for each category with a non-zero threshold', async function() {
        const now = new Date();

        let allBudgets = await Budgets.all(0);
        allBudgets.length.should.equal(1);
        allBudgets.should.containDeep([
            {
                categoryId: categoryWithThreshold.id,
                threshold: categoryWithThreshold.threshold,
                month: now.getMonth(),
                year: now.getFullYear()
            }
        ]);
    });

    it('should have reset the categories threshold', async function() {
        let allCategories = await Categories.all(0);
        allCategories.every(c => c.threshold === 0).should.equal(true);
    });
});

describe('Test migration 19', async function() {
    before(async function() {
        await clear(Accesses);
    });

    let cmbAccessToKeep = {
        bank: 'cmb',
        login: 'toto',
        password: 'password',
        customFields: JSON.stringify([{ name: 'website', value: 'pro' }])
    };

    let cmbAccessToChange = {
        bank: 'cmb',
        login: 'toto',
        password: 'password',
        customFields: JSON.stringify([])
    };

    let otherAccessToKeep = {
        bank: 'other',
        login: 'toto',
        password: 'password',
        customFields: JSON.stringify([])
    };

    let cmbAccessToKeepId, cmbAccessToChangeId, otherAccessToKeepId;

    it('should insert accesses in the DB', async function() {
        cmbAccessToKeepId = (await Accesses.create(0, cmbAccessToKeep)).id;
        cmbAccessToChangeId = (await Accesses.create(0, cmbAccessToChange)).id;
        otherAccessToKeepId = (await Accesses.create(0, otherAccessToKeep)).id;

        (await Accesses.all(0)).should.containDeep([
            cmbAccessToChange,
            cmbAccessToKeep,
            otherAccessToKeep
        ]);
    });

    it('should run migration m19 correctly', async function() {
        let m19 = MIGRATIONS[19];
        let result = await m19(0);
        result.should.equal(true);
    });

    it('the access from a bank different from cmb should not be changed', async function() {
        (await Accesses.find(0, otherAccessToKeepId)).should.containDeep(otherAccessToKeep);
    });

    it('the cmb access with an already set website should not be changed', async function() {
        (await Accesses.find(0, cmbAccessToKeepId)).should.containDeep(cmbAccessToKeep);
    });

    it('the cmb access with no website set should be changed', async function() {
        let access = await Accesses.find(0, cmbAccessToChangeId);
        access.should.not.containDeep(cmbAccessToChange);
        cmbAccessToChange.customFields = JSON.stringify([{ name: 'website', value: 'pro' }]);
        access.should.containDeep(cmbAccessToChange);
    });
});

describe('Test migration 20', async function() {
    before(async function() {
        await clear(Settings);
    });

    let names = [
        ['duplicateThreshold', 'duplicate-threshold'],
        ['duplicateIgnoreDifferentCustomFields', 'duplicate-ignore-different-custom-fields'],
        ['defaultChartDisplayType', 'default-chart-display-type'],
        ['defaultChartType', 'default-chart-type'],
        ['defaultChartPeriod', 'default-chart-period'],
        ['defaultAccountId', 'default-account-id'],
        ['defaultCurrency', 'default-currency'],
        ['budgetDisplayPercent', 'budget-display-percent'],
        ['budgetDisplayNoThreshold', 'budget-display-no-threshold']
    ];

    let camelCaseSettings = names.map(([oldName, newName]) => {
        return {
            name: oldName,
            value: newName
        };
    });

    let nonCamelCaseSetting = {
        name: 'another-existing-setting',
        value: 'with some value'
    };

    it('should insert settings in the DB', async function() {
        for (let setting of camelCaseSettings) {
            await Settings.create(0, setting);
        }
        await Settings.create(0, nonCamelCaseSetting);

        let all = await Settings.allWithoutGhost(0);
        all.length.should.equal(camelCaseSettings.length + 1 /* nonCamelCase */ + 1 /* locale */);
        all.should.containDeep([nonCamelCaseSetting].concat(camelCaseSettings));
    });

    it('should run migration m20 correctly', async function() {
        let m20 = MIGRATIONS[20];
        let result = await m20(0);
        result.should.equal(true);
    });

    it('should have migrated settings properly', async function() {
        let all = await Settings.allWithoutGhost(0);

        let newSettings = camelCaseSettings.map(setting => {
            return {
                name: setting.value,
                value: setting.value
            };
        });

        all.should.containDeep([nonCamelCaseSetting].concat(newSettings));

        // Add one for the locale.
        all.length.should.equal(newSettings.length + 1 + 1);
    });
});

const BANQUE_POPULAIRE_WEBSITE_MIGRATIONS = {
    'www.ibps.alpes.banquepopulaire.fr': 'www.ibps.bpaura.banquepopulaire.fr',
    'www.ibps.alsace.banquepopulaire.fr': 'www.ibps.bpalc.banquepopulaire.fr',
    'www.ibps.atlantique.banquepopulaire.fr': 'www.ibps.bpgo.banquepopulaire.fr',
    'www.ibps.bretagnenormandie.cmm.banquepopulaire.fr':
        'www.ibps.cmgo.creditmaritime.groupe.banquepopulaire.fr',
    'www.ibps.cotedazure.banquepopulaire.fr': 'www.ibps.mediterranee.banquepopulaire.fr',
    'www.ibps.loirelyonnais.banquepopulaire.fr': 'www.ibps.bpaura.banquepopulaire.fr',
    'www.ibps.lorrainechampagne.banquepopulaire.fr': 'www.ibps.bpalc.banquepopulaire.fr',
    'www.ibps.massifcentral.banquepopulaire.fr': 'www.ibps.bpaura.banquepopulaire.fr',
    'www.ibps.ouest.banquepopulaire.fr': 'www.ibps.bpgo.banquepopulaire.fr',
    'www.ibps.provencecorse.banquepopulaire.fr': 'www.ibps.mediterranee.banquepopulaire.fr',
    'www.ibps.sudouest.creditmaritime.groupe.banquepopulaire.fr':
        'www.ibps.bpaca.banquepopulaire.fr'
};

describe('Test migration 21', async function() {
    before(async function() {
        await clear(Accesses);
    });

    async function runM21Once(oldSite, newSite) {
        describe(`Test applying M21 for website ${oldSite}`, async function() {
            let bpAccessToChange = {
                bank: 'banquepopulaire',
                login: 'toto',
                password: 'password',
                customFields: JSON.stringify([{ name: 'website', value: oldSite }])
            };

            let accessId;

            it(`The access with website ${oldSite} should be in the database`, async function() {
                let access = await Accesses.create(0, bpAccessToChange);
                accessId = access.id;
                access.should.containDeep(bpAccessToChange);
            });

            it('Migration 21 should run correctly', async function() {
                let m21 = MIGRATIONS[21];
                let result = await m21(0);
                result.should.equal(true);
            });

            it(`Access's website should be changed to ${newSite}`, async function() {
                let access = await Accesses.find(0, accessId);
                delete bpAccessToChange.customFields;
                access.should.containDeep(bpAccessToChange);
                let customFields = JSON.parse(access.customFields);
                customFields.should.containDeep([{ name: 'website', value: newSite }]);
            });
        });
    }

    describe('Testing migration on websites to be migrated', async function() {
        for (let [key, value] of Object.entries(BANQUE_POPULAIRE_WEBSITE_MIGRATIONS)) {
            await runM21Once(key, value);
        }
    });

    describe('Other website should not be changed', async function() {
        let bpAccessToKeep = {
            bank: 'banquepopulaire',
            login: 'toto',
            password: 'password',
            customFields: JSON.stringify([{ name: 'website', value: 'oldSite' }])
        };

        let accessId;

        it('The access with website "oldSite" should be in the database', async function() {
            let access = await Accesses.create(0, bpAccessToKeep);
            accessId = access.id;
            access.should.containDeep(bpAccessToKeep);
        });

        it('Migration 21 should run correctly', async function() {
            let m21 = MIGRATIONS[21];
            let result = await m21(0);
            result.should.equal(true);
        });

        it('Access website should not be changed', async function() {
            let access = await Accesses.find(0, accessId);
            access.should.containDeep(bpAccessToKeep);
            let customFields = JSON.parse(access.customFields);
            customFields.should.containDeep(JSON.parse(bpAccessToKeep.customFields));
        });
    });

    describe('Other customFields should not be changed', async function() {
        let bpAccessToKeep = {
            bank: 'banquepopulaire',
            login: 'toto',
            password: 'password',
            customFields: JSON.stringify([{ name: 'other', value: 'value' }])
        };

        let accessId;

        it('The access should be in the database', async function() {
            let access = await Accesses.create(0, bpAccessToKeep);
            accessId = access.id;
            access.should.containDeep(bpAccessToKeep);
        });

        it('Migration 21 should run correctly', async function() {
            let m21 = MIGRATIONS[21];
            let result = await m21(0);
            result.should.equal(true);
        });

        it('Access customFields should not be changed', async function() {
            let access = await Accesses.find(0, accessId);
            access.should.containDeep(bpAccessToKeep);
            let customFields = JSON.parse(access.customFields);
            customFields.should.containDeep(JSON.parse(bpAccessToKeep.customFields));
        });
    });
});

describe('Test migration 22', async function() {
    before(async function() {
        await clear(Accesses);
    });

    let bnporcAccessToKeep = {
        bank: 'bnporc',
        login: 'toto',
        password: 'password',
        customFields: JSON.stringify([{ name: 'website', value: 'pro' }])
    };

    let bnporcAccessToChange = {
        bank: 'bnporc',
        login: 'toto',
        password: 'password',
        customFields: JSON.stringify([{ name: 'website', value: 'ppold' }])
    };

    let otherAccessToKeep = {
        bank: 'other',
        login: 'toto',
        password: 'password',
        customFields: JSON.stringify([])
    };

    let bnporcAccessToKeepId, bnporcAccessToChangeId, otherAccessToKeepId;

    it('should insert accesses in the DB', async function() {
        bnporcAccessToKeepId = (await Accesses.create(0, bnporcAccessToKeep)).id;
        bnporcAccessToChangeId = (await Accesses.create(0, bnporcAccessToChange)).id;
        otherAccessToKeepId = (await Accesses.create(0, otherAccessToKeep)).id;

        (await Accesses.all(0)).should.containDeep([
            bnporcAccessToChange,
            bnporcAccessToKeep,
            otherAccessToKeep
        ]);
    });

    it('should run migration m22 correctly', async function() {
        let m22 = MIGRATIONS[22];
        let result = await m22(0);
        result.should.equal(true);
    });

    it('the access from a bank different from bnporc should not be changed', async function() {
        (await Accesses.find(0, otherAccessToKeepId)).should.containDeep(otherAccessToKeep);
    });

    it('the bnporc access with a website value different from ppold should not be changed', async function() {
        (await Accesses.find(0, bnporcAccessToKeepId)).should.containDeep(bnporcAccessToKeep);
    });

    it('the bnporc access with ppold website set should be changed', async function() {
        let access = await Accesses.find(0, bnporcAccessToChangeId);
        access.should.not.containDeep(bnporcAccessToChange);
        bnporcAccessToChange.customFields = JSON.stringify([{ name: 'website', value: 'pp' }]);
        access.should.containDeep(bnporcAccessToChange);
    });
});

describe('Test migration 23', async function() {
    before(async function() {
        await clear(Accounts);
    });

    let account = {
        bank: 'lolbank',
        initialAmount: 42
    };

    it('should insert account', async function() {
        await Accounts.create(0, account);
        let all = await Accounts.all(0);
        all.length.should.equal(1);
        all.should.containDeep([account]);
    });

    it('should run migration m23 properly', async function() {
        let m23 = MIGRATIONS[23];
        let result = await m23(0);
        result.should.equal(true);
    });

    it('should have replaced property initialAmount with property initialBalance', async function() {
        let all = await Accounts.all(0);
        all.length.should.equal(1);

        let result = all[0];
        result.bank.should.equal(account.bank);
        result.initialBalance.should.equal(account.initialAmount);
        should.not.exist(result.initialAmount);
    });
});