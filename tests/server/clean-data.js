import should from 'should';

import { cleanData } from '../../server/controllers/helpers';
import DefaultSettings from '../../shared/default-settings';

describe('Ensure settings without default values are removed when exporting data', () => {
    const UNKNOWN_SETTING = 'unknown-setting';
    const KNOWN_SETTING = 'locale';
    const GHOST_SETTING = 'weboob-version'; // legit weboob: ghost setting
    let world = {
        settings: [
            {
                key: UNKNOWN_SETTING,
                value: 'weird value',
                id: '1',
            },
            {
                key: KNOWN_SETTING,
                value: 'en',
                id: '2',
            },
            {
                key: GHOST_SETTING,
                value: '1.3',
            },
        ],
    };
    let all = cleanData(world);
    it('The unknown setting should be removed from the list', () => {
        DefaultSettings.has(UNKNOWN_SETTING).should.equal(false);
        all.settings.some(s => s.key === UNKNOWN_SETTING).should.equal(false);
    });
    it('The known setting should be kept in the list', () => {
        DefaultSettings.has(KNOWN_SETTING).should.equal(true);
        all.settings.some(s => s.key === KNOWN_SETTING).should.equal(true);
    });
    it('The ghost setting should be removed from the list', () => {
        all.settings.some(s => s.key === GHOST_SETTING).should.equal(false);
    });
});

describe('Ensure transaction rules conditions are properly exported', () => {
    let world = {
        transactionRules: [
            {
                actions: [],

                conditions: [
                    {
                        type: 'label_matches_text',
                    },

                    {
                        type: 'label_matches_regexp',
                    },

                    {
                        type: 'amount_equals',
                    },
                ],
            },
        ],
    };

    it('Should not throw if all conditions types are known', () => {
        const func = () => cleanData(world);
        should.doesNotThrow(func);
    });

    it('Should throw if a condition type is unknown', () => {
        const newWorld = JSON.parse(JSON.stringify(world));
        newWorld.transactionRules[0].conditions[0].type = 'UNKNOWN';
        const func = () => cleanData(newWorld);
        should.throws(func);
    });
});

describe('Ensure account ids are properly remapped after re-indexing', () => {
    const world = {
        accesses: [
            {
                id: 0,
                vendorId: 'manual',
            },
        ],
        accounts: [
            {
                id: 10,
                name: 'Account 1',
                balance: 100,
                accessId: 0,
                vendorId: 'manual',
                currency: 'EUR',
            },
            {
                id: 20,
                name: 'Account 2',
                balance: 200,
                accessId: 0,
                vendorId: 'manual',
                currency: 'EUR',
            },
        ],
        views: [
            {
                id: 0,
                name: 'View 1',
                accountIds: [10],
            },
            {
                id: 1,
                name: 'View 2',
                accountIds: [20],
            },
            {
                id: 2,
                name: 'View 3',
                accountIds: [10, 20],
            },
        ],
        transactions: [
            {
                id: 0,
                accountId: 10,
                date: '2020-01-01',
                label: 'Transaction 1',
                amount: -10,
                currency: 'EUR',
            },
            {
                id: 1,
                accountId: 20,
                date: '2020-01-02',
                label: 'Transaction 2',
                amount: -20,
                currency: 'EUR',
            },
        ],
        alerts: [
            {
                frequency: 'daily',
                limit: null,
                order: null,
                lastTriggeredDate: null,
                accountId: 10,
                type: 'report',
            },
            {
                frequency: null,
                limit: 0,
                order: 'gt',
                lastTriggeredDate: null,
                accountId: 20,
                type: 'transaction',
            },
        ],
        recurringTransactions: [
            {
                type: 'type.loan_payment',
                id: 0,
                accountId: 10,
                label: 'Recurring one',
                amount: -123.456,
                dayOfMonth: 15,
                listOfMonths: 'all',
            },
            {
                type: 'type.loan_payment',
                id: 1,
                accountId: 20,
                label: 'Recurring two',
                amount: -789.25,
                dayOfMonth: 15,
                listOfMonths: 'all',
            },
        ],
        appliedRecurringTransactions: [
            {
                recurringTransactionId: 0,
                accountId: 10,
                month: 9,
                year: 2025,
            },
            {
                recurringTransactionId: 1,
                accountId: 20,
                month: 9,
                year: 2025,
            },
        ],
    };

    it('Should be properly remapped in transactions', () => {
        const betterWorld = cleanData(world);
        const accountsIds = betterWorld.accounts.map(a => a.id);
        for (const transaction of betterWorld.transactions) {
            accountsIds.should.containEql(transaction.accountId);
        }
    });

    it('Should be properly remapped in recurring transactions', () => {
        const betterWorld = cleanData(world);
        const accountsIds = betterWorld.accounts.map(a => a.id);
        for (const rt of betterWorld.recurringTransactions) {
            accountsIds.should.containEql(rt.accountId);
        }
    });

    it('Should be properly remapped in applied recurring transactions', () => {
        const betterWorld = cleanData(world);
        const accountsIds = betterWorld.accounts.map(a => a.id);
        for (const art of betterWorld.appliedRecurringTransactions) {
            accountsIds.should.containEql(art.accountId);
        }
    });

    it('Should be properly remapped in alerts', () => {
        const betterWorld = cleanData(world);
        const accountsIds = betterWorld.accounts.map(a => a.id);
        for (const al of betterWorld.alerts) {
            accountsIds.should.containEql(al.accountId);
        }
    });

    it('Should be properly remapped in views', () => {
        const betterWorld = cleanData(world);
        const accountsIds = betterWorld.accounts.map(a => a.id);
        for (const view of betterWorld.views) {
            for (const accountId of view.accountIds) {
                accountsIds.should.containEql(accountId);
            }
        }
    });
});
