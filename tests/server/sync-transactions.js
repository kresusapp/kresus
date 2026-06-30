import assert from 'node:assert';
import { mock } from 'node:test';

import accountsManager from '../../server/lib/accounts-manager';
import { importData } from '../../server/controllers/all';
import * as demoProvider from '../../server/providers/demo';

import {
    Access,
    Account,
    Setting,
    Transaction,
    RecurringTransaction,
    AppliedRecurringTransaction,
    User,
} from '../../server/models';

import { DUPLICATE_LAX_MODE } from '../../shared/settings';
import { TRANSACTION_CARD_TYPE } from '../../server/helpers';

async function cleanAll(userId) {
    await Access.destroyAll(userId);
    await Account.destroyAll(userId);
    await Setting.destroyAll(userId);
    await Transaction.destroyAll(userId);
    await RecurringTransaction.destroyAll(userId);
    await AppliedRecurringTransaction.destroyAll(userId);
}

// Gap date of 1 day.
const KNOWN_DATE = new Date('2020-05-04T00:00:00.000Z');
const PROVIDED_DATE = new Date('2020-05-05T00:00:00.000Z');

const world = {
    accesses: [
        {
            id: 0,
            vendorId: 'demo',
            login: 'whatever',
            password: 'whatever',
        },
    ],
    accounts: [
        {
            id: 0,
            accessId: 0,
            vendorAccountId: 'sync-test-account',
            type: 'account-type.checking',
            initialBalance: 0,
            balance: 0,
            label: 'Compte test',
            currency: 'EUR',
            importDate: new Date('2020-01-01T00:00:00.000Z'),
        },
    ],
    transactions: [
        {
            accountId: 0,
            type: 'type.card',
            label: 'Loyer',
            rawLabel: 'Loyer',
            amount: -300,
            date: KNOWN_DATE,
            importDate: new Date('2020-01-01T00:00:00.000Z'),
        },
    ],
};

let USER_ID = null;
before(async () => {
    // Reload the USER_ID from the database, since process.kresus.defaultUser.id
    // might have been clobbered by another test.
    const users = await User.all();
    if (!users.length) {
        throw new Error('user should have been created!');
    }
    USER_ID = users[0].id;
    if (typeof USER_ID !== 'number') {
        throw new Error('missing user id in test.');
    }
});

describe('syncTransactions and the duplicate lax mode', () => {
    // Stub the demo provider so the bank "returns" a single transaction that is
    // a near-duplicate (one day off) of the known one.
    let access = null;
    let account = null;

    beforeEach(async () => {
        await cleanAll(USER_ID);

        await importData(USER_ID, structuredClone(world));

        account = (await Account.all(USER_ID))[0];
        access = await Access.find(USER_ID, account.accessId);

        mock.method(demoProvider, 'fetchTransactions', () =>
            Promise.resolve({
                kind: 'values',
                values: [
                    {
                        account: account.vendorAccountId,
                        amount: '-300',
                        label: 'Loyer',
                        rawLabel: 'Loyer',
                        date: PROVIDED_DATE,
                        type: TRANSACTION_CARD_TYPE.woob_id,
                    },
                ],
            })
        );
    });

    afterEach(() => {
        mock.reset();
    });

    async function runSync() {
        const accountInfoMap = new Map();
        accountInfoMap.set(account.id, { account, balanceOffset: 0 });

        const result = await accountsManager.syncTransactions(
            USER_ID,
            access,
            accountInfoMap,
            /* ignoreLastFetchDate */ true,
            /* isInteractive */ false,
            /* userActionFields */ null
        );

        assert.strictEqual(result.kind, 'value');
        return result.value;
    }

    it('should create the near-duplicate transaction when lax mode is disabled', async () => {
        const { createdTransactions } = await runSync();

        assert.strictEqual(createdTransactions.length, 1);

        const transactions = await Transaction.byAccount(USER_ID, account.id);
        assert.strictEqual(transactions.length, 2);
    });

    it('should ignore the near-duplicate transaction when lax mode is enabled', async () => {
        await Setting.updateByKey(USER_ID, DUPLICATE_LAX_MODE, 'true');

        const { createdTransactions } = await runSync();

        assert.strictEqual(createdTransactions.length, 0);

        const transactions = await Transaction.byAccount(USER_ID, account.id);
        assert.strictEqual(transactions.length, 1);
    });
});
