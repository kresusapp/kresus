import assert from 'node:assert';

import {
    Access,
    Account,
    Alert,
    Transaction,
    User,
    RecurringTransaction,
    AppliedRecurringTransaction,
    Setting,
} from '../../server/models';

import accountsManager from '../../server/lib/accounts-manager';
import { importData } from '../../server/controllers/all';
import { DEFAULT_ACCOUNT_ID } from '../../shared/settings';

async function cleanAll(userId) {
    await Access.destroyAll(userId);
    await Account.destroyAll(userId);
    await Alert.destroyAll(userId);
    await Setting.destroyAll(userId);
    await Transaction.destroyAll(userId);
    await RecurringTransaction.destroyAll(userId);
    await AppliedRecurringTransaction.destroyAll(userId);
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
const genesis = {
    accesses: [
        {
            id: 0,
            vendorId: 'fakewoobbank',
            login: 'whatever-acc--does-not-care',
            customLabel: 'Optional custom label',
        },
    ],

    accounts: [
        {
            id: 0,
            accessId: 0,
            vendorAccountId: 'account-randomid',
            type: 'account-type.checking',
            initialBalance: 0,
            balance: 100,
            label: 'Compte Courant',
            iban: 'FR4830066645148131544778523',
            currency: 'EUR',
            importDate: new Date('2019-01-01:00:00.000Z'),
        },

        {
            id: 1,
            accessId: 0,
            vendorAccountId: 'account-non-randomid',
            type: 'account-type.checking',
            initialBalance: 0,
            balance: 200,
            label: 'Compte pas courant',
            iban: 'FR4830066645148131544778524',
            currency: 'EUR',
            importDate: new Date('2019-01-01:00:00.000Z'),
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
            accountId: 1,
            type: 'type.card',
            rawLabel: 'Whatever transaction second account',
            date: new Date('2023-08-22T00:00:00.000Z'),
            importDate: new Date('2023-01-01:00:00.000Z'),
            amount: -0.65,
        },

        {
            accountId: 1,
            type: 'type.card',
            rawLabel: 'Whatever other transaction second account',
            date: new Date('2023-08-22T00:00:00.000Z'),
            importDate: new Date('2023-01-01:00:00.000Z'),
            amount: -0.65,
        },
    ],

    recurringTransactions: [
        {
            type: 'type.order',
            id: 1,
            userId: 1,
            accountId: 1,
            label: 'PRELEVEMENT ELECTRICITE',
            amount: -100,
            dayOfMonth: 21,
            listOfMonths: 'all',
        },
        {
            type: 'type.loan_payment',
            id: 2,
            userId: 1,
            accountId: 1,
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
            accountId: 1,
            month: now.getMonth(),
            year: now.getFullYear(),
        },
        {
            id: 2,
            userId: 1,
            recurringTransactionId: 2,
            accountId: 1,
            month: 1,
            year: 2000,
        },
    ],

    alerts: [
        {
            accountId: 1,
            type: 'balance',
            frequency: 'daily',
            limit: 10,
            order: 'gt',
        },
    ],
};

function newWorld(world) {
    let result = { ...world };
    result.accesses = result.accesses.map(access => Access.cast(access));
    result.accounts = result.accounts.map(account => Account.cast(account));
    result.transactions = result.transactions.map(transaction => Transaction.cast(transaction));
    result.recurringTransactions = result.recurringTransactions.map(rt =>
        RecurringTransaction.cast(rt)
    );
    result.appliedRecurringTransactions = result.appliedRecurringTransactions.map(art =>
        AppliedRecurringTransaction.cast(art)
    );
    result.alerts = result.alerts.map(al => Alert.cast(al));
    return result;
}

describe('Merging two accounts together', () => {
    beforeEach(async () => {
        await cleanAll(USER_ID);
    });

    it('should delete the source account', async () => {
        await importData(USER_ID, newWorld(genesis));
        let accounts = await Account.all(USER_ID);
        const success = await accountsManager.mergeExistingAccounts(
            USER_ID,
            accounts[1],
            accounts[0]
        );
        assert.strictEqual(success, true);

        accounts = await Account.all(USER_ID);
        assert.strictEqual(accounts.length, 1);
    });

    it('should replace the accountId in every transaction, recurring transaction, applied recurring transaction and alert', async () => {
        await importData(USER_ID, newWorld(genesis));

        const accounts = await Account.all(USER_ID);
        assert.strictEqual(accounts.length, genesis.accounts.length);

        const success = await accountsManager.mergeExistingAccounts(
            USER_ID,
            accounts[1],
            accounts[0]
        );
        assert.strictEqual(success, true);

        const expectedAccountId = accounts[0].id;
        const allTransactions = await Transaction.all(USER_ID);
        assert.strictEqual(allTransactions.length, genesis.transactions.length);
        assert.ok(allTransactions.every(tr => tr.accountId === expectedAccountId));

        const allRecurringTransactions = await RecurringTransaction.all(USER_ID);
        assert.strictEqual(allRecurringTransactions.length, genesis.recurringTransactions.length);
        assert.ok(allRecurringTransactions.every(entry => entry.accountId === expectedAccountId));

        const allAppliedRecurringTransactions = await AppliedRecurringTransaction.all(USER_ID);
        assert.ok(
            allAppliedRecurringTransactions.every(entry => entry.accountId === expectedAccountId)
        );

        const allAlerts = await Alert.all(USER_ID);
        assert.strictEqual(allAlerts.length, genesis.alerts.length);
        assert.ok(allAlerts.every(entry => entry.accountId === expectedAccountId));
    });

    it('should have a null balance for manual access', async () => {
        const manualWorld = structuredClone(genesis);
        manualWorld.accesses[0].vendorId = 'manual';
        manualWorld.accounts.forEach(acc => (acc.balance = null));
        await importData(USER_ID, newWorld(manualWorld));
        let accounts = await Account.all(USER_ID);
        const success = await accountsManager.mergeExistingAccounts(
            USER_ID,
            accounts[1],
            accounts[0]
        );
        assert.strictEqual(success, true);

        accounts = await Account.all(USER_ID, false);
        assert.strictEqual(accounts[0].balance, null);
    });

    it('should use the balance of the account with the latest transaction', async () => {
        await importData(USER_ID, newWorld(genesis));
        let accounts = await Account.all(USER_ID);
        const success = await accountsManager.mergeExistingAccounts(
            USER_ID,
            accounts[1],
            accounts[0]
        );
        assert.strictEqual(success, true);

        // Check
        accounts = await Account.all(USER_ID, false);
        assert.strictEqual(accounts[0].balance, genesis.accounts[1].balance);

        // Edit data so that the first account has the latest transaction
        await cleanAll(USER_ID);
        const reverseWorld = structuredClone(genesis);
        reverseWorld.transactions[0].importDate = new Date();
        await importData(USER_ID, reverseWorld);
        accounts = await Account.all(USER_ID);
        await accountsManager.mergeExistingAccounts(USER_ID, accounts[0], accounts[1]);
        accounts = await Account.all(USER_ID, false);
        assert.strictEqual(accounts[0].balance, genesis.accounts[0].balance);
    });

    it('should use the initialBalance of the account with the furthest transaction', async () => {
        await importData(USER_ID, newWorld(genesis));
        let accounts = await Account.all(USER_ID);
        let success = await accountsManager.mergeExistingAccounts(
            USER_ID,
            accounts[1],
            accounts[0]
        );
        assert.strictEqual(success, true);

        // Check
        accounts = await Account.all(USER_ID, false);
        assert.strictEqual(accounts[0].initialBalance, genesis.accounts[0].initialBalance);

        // Edit data so that the first account has the latest transaction
        await cleanAll(USER_ID);
        const reverseWorld = structuredClone(genesis);
        reverseWorld.transactions[reverseWorld.transactions.length - 1].importDate = new Date(1);
        await importData(USER_ID, reverseWorld);
        accounts = await Account.all(USER_ID);
        success = await accountsManager.mergeExistingAccounts(USER_ID, accounts[0], accounts[1]);
        assert.strictEqual(success, true);
        accounts = await Account.all(USER_ID, false);
        assert.strictEqual(accounts[0].initialBalance, genesis.accounts[1].initialBalance);
    });

    it('should correctly update the default account id, if needs be', async () => {
        await cleanAll(USER_ID);
        await importData(USER_ID, newWorld(genesis));

        let accounts = await Account.all(USER_ID);
        let source = accounts[1];
        let target = accounts[0];

        // Mark the source account as the default.
        await Setting.updateByKey(USER_ID, DEFAULT_ACCOUNT_ID, source.id.toString());

        const success = await accountsManager.mergeExistingAccounts(USER_ID, source, target);
        assert.strictEqual(success, true);

        accounts = await Account.all(USER_ID);
        assert.strictEqual(accounts.length, 1);

        // The default account has been updated.
        let setting = await Setting.byKey(USER_ID, DEFAULT_ACCOUNT_ID);
        assert.strictEqual(setting.value, target.id.toString());
    });
});
