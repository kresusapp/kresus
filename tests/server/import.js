// There's a bug between eslint and prettier with spacing around async arrow
// functions, so we need to explicitly use async functions instead.
/* eslint-disable prefer-arrow-callback */
import should from 'should';
import fs from 'fs';
import path from 'path';
import moment from 'moment';

import { Accesses, Accounts, Categories, Settings, Transactions, Users } from '../../server/models';
import { testing, importData } from '../../server/controllers/v1/all';

let { ofxToKresus } = testing;

async function cleanAll(userId) {
    await Accesses.destroyAll(userId);
    await Accounts.destroyAll(userId);
    await Categories.destroyAll(userId);
    await Settings.destroyAll(userId);
    await Transactions.destroyAll(userId);
}

let USER_ID = null;
before(async () => {
    // Reload the USER_ID from the database, since process.kresus.user.id which
    // might have been clobbered by another test.
    // TODO: this is bad for testing and we should fix this properly later.
    let user = await Users.find();
    if (!user) {
        throw new Error('user should have been created!');
    }
    USER_ID = user.id;
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
                importDate: Date.parse('2019-01-01:00:00.000Z')
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
                date: Date.parse('2019-07-07T00:00:00.000Z'),
                importDate: Date.parse('2019-01-01:00:00.000Z'),
                amount: -83.8
            },
            {
                accountId: 0,
                categoryId: 0,
                type: 'type.card',
                label: 'Wholemart',
                rawLabel: 'card 09/07/2019 wholemart',
                customLabel: 'Food & stuff',
                date: Date.parse('2019-07-09T00:00:00.000Z'),
                importDate: Date.parse('2019-01-01:00:00.000Z'),
                amount: -60.8
            },
            {
                accountId: 0,
                categoryId: 1,
                type: 'type.card',
                label: 'amazon payments',
                rawLabel: 'carte 19/07/2019 amazon payments',
                customLabel: '1984 - George Orwell',
                date: Date.parse('2019-07-19T00:00:00.000Z'),
                importDate: Date.parse('2019-01-01:00:00.000Z'),
                amount: -20
            },
            {
                accountId: 0,
                type: 'type.transfer',
                label: 'SEPA m. john doe 123457689 rent',
                rawLabel: 'transfer to m. john doe 123457689 rent',
                date: Date.parse('2019-07-27T00:00:00.000Z'),
                importDate: Date.parse('2019-01-01:00:00.000Z'),
                amount: -500
            },
            {
                accountId: 0,
                categoryId: 2,
                type: 'type.order',
                label: 'taxes public department: fr123abc456',
                rawLabel: 'direct debit sepa taxes public department: fr123abc456',
                date: Date.parse('2019-08-17T00:00:00.000Z'),
                importDate: Date.parse('2019-01-01:00:00.000Z'),
                amount: -150
            },
            {
                accountId: 0,
                categoryId: 3,
                type: 'type.withdrawal',
                label: 'ATM my pretty town center',
                date: Date.parse('2019-08-19T00:00:00.000Z'),
                importDate: Date.parse('2019-01-01:00:00.000Z'),
                amount: -20
            },
            {
                accountId: 0,
                type: 'type.bankfee',
                rawLabel: 'commission on non euro buy 0.65eur',
                date: Date.parse('2019-08-22T00:00:00.000Z'),
                importDate: Date.parse('2019-01-01:00:00.000Z'),
                amount: -0.65
            },
            {
                // This one misses the importDate. The import should not fail but the importDate
                // should be set to a default value (~now).
                accountId: 0,
                type: 'type.card',
                label: 'Debit Transfer: Postage',
                rawLabel: 'Transfer',
                date: Date.parse('2012-09-06T22:00:00.000Z'),
                debitDate: Date.parse('2012-09-06T22:00:00.000Z'),
                amount: -71.99
            },
            {
                // This last one is invalid, because it doesn't have a label.
                accountId: 0,
                type: 'type.bankfee',
                date: Date.parse('2019-08-22T00:00:00.000Z'),
                importDate: Date.parse('2019-01-01:00:00.000Z'),
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
        let result = { ...world };
        result.accesses = result.accesses.map(access => Accesses.cast(access)).map(cleanUndefined);
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
        await importData(USER_ID, data);

        let actualAccessses = await Accesses.all(USER_ID);
        actualAccessses.length.should.equal(data.accesses.length);
        actualAccessses.should.containDeep(data.accesses);

        let actualAccounts = await Accounts.all(USER_ID);
        actualAccounts.length.should.equal(data.accounts.length);
        actualAccounts.should.containDeep(data.accounts);

        let actualCategories = await Categories.all(USER_ID);
        actualCategories.length.should.equal(data.categories.length);
        actualCategories.should.containDeep(data.categories);

        // Test for transactions is done below.
    });

    describe('lastCheckDate', () => {
        it('The lastCheckDate property of an account should equal the date of the latest operation if missing', async function() {
            let allAccounts = await Accounts.all(USER_ID);
            moment(allAccounts[0].lastCheckDate).should.eql(moment(world.operations[6].date));
        });

        it('The lastCheckDate property of an account should be ~now if missing & no operations', async function() {
            await cleanAll(USER_ID);

            let data = newWorld();
            delete data.operations;

            await importData(USER_ID, data);

            let allAccounts = await Accounts.all(USER_ID);
            allAccounts[0].lastCheckDate.should.be.a.Date();
        });

        it('The lastCheckDate property of an account should not be modified if defined in the import data', async function() {
            await cleanAll(USER_ID);

            let data = newWorld();
            const lastCheckDate = '2019-07-31T00:00:00.000Z';
            data.accounts[0].lastCheckDate = lastCheckDate;

            await importData(USER_ID, data);

            let allAccounts = await Accounts.all(USER_ID);
            allAccounts[0].lastCheckDate.should.eql(new Date(lastCheckDate));
        });
    });

    describe('label & rawLabel', () => {
        it('The label should be used to fill the rawLabel field if missing', async function() {
            let allData = await Transactions.all(USER_ID);
            let label = world.operations[5].label;
            let transaction = allData.find(t => t.label === label);
            transaction.rawLabel.should.equal(label);
        });

        it('The rawLabel should be used to fill the label field if missing', async function() {
            let allData = await Transactions.all(USER_ID);
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
            let actualTransactions = await Transactions.all(USER_ID);
            actualTransactions.length.should.equal(8);
            actualTransactions.should.containDeep(operations);
        });
    });

    describe('importDate', () => {
        it('should be set to now if missing', async function() {
            let allData = await Transactions.all(USER_ID);
            allData[7].importDate.should.be.a.Date();
        });
    });

    describe('should apply renamings when importing', () => {
        it('should successfully import Settings with the old format', async function() {
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

        it('should have renamed Settings.name into Settings.key', async function() {
            let settings = await Settings.allWithoutGhost(USER_ID);
            // Add "locale".
            settings.length.should.equal(2);
            settings.should.containDeep([
                {
                    key: 'budget-display-percent',
                    value: 'true'
                }
            ]);
        });

        it('should successfully import Settings with the new format', async function() {
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

        it('should have kept Settings.key', async function() {
            let settings = await Settings.allWithoutGhost(USER_ID);
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
            let transactions = await Transactions.all(USER_ID);

            // Only 8 transactions were valid in the initial batch.
            transactions.length.should.equal(8 + 1);

            let actualTransaction = cleanUndefined(
                Transactions.cast({
                    type: 'type.card',
                    label: 'Mystery transaction',
                    rawLabel: 'card 07/07/2019 mystery',
                    customLabel: 'Surprise',
                    date: moment('2019-07-07').toDate(),
                    importDate: moment('2019-07-07T00:00:00.000Z').toDate(),
                    amount: -13.37
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
});

describe('import OFX', () => {
    let ofx = null;
    let account = null;
    let transactions = null;

    before(async function() {
        await cleanAll(USER_ID);
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

        let allData = await Accesses.all(USER_ID);
        allData.length.should.equal(1);

        allData = await Accounts.all(USER_ID);
        allData.length.should.equal(1);
        account = allData[0];

        allData = await Transactions.all(USER_ID);
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
