import memoize from 'micro-memoize';
import { Account, Transaction } from '../../models';
import { currency } from '../../helpers';

import * as BankStore from '../../store/banks';
import { Driver, DriverConfig, DriverType } from './base';

const memoizedGetAccounts = memoize(
    (state: BankStore.BankState, currencyFilter: string): Account[] => {
        return BankStore.getAccessIds(state)
            .flatMap(accessId => {
                return BankStore.accountIdsByAccessId(state, accessId);
            })
            .map(accountId => BankStore.accountById(state, accountId))
            .filter(account => !account.excludeFromBalance && account.currency === currencyFilter);
    }
);

const memoizedGetTransactions = memoize((state: BankStore.BankState, accounts: Account[]) => {
    return accounts
        .flatMap(acc => BankStore.transactionIdsByAccountId(state, acc.id))
        .map(trId => BankStore.transactionById(state, trId))
        .slice()
        .sort((a, b) => +b.date - +a.date);
});

const memoizeGetOutstandingSum = memoize((accounts: Account[]) =>
    accounts.reduce((a, b) => a + b.outstandingSum, 0)
);

const memoizedGetBalance = memoize((accounts: Account[]) =>
    accounts.reduce((a, b) => a + b.balance, 0)
);

const memoizedGetInitialBalance = memoize((accounts: Account[]) =>
    accounts.reduce((a, b) => a + b.initialBalance, 0)
);

const memoizedGetLastCheckDate = memoize((accounts: Account[]) => {
    let lastCheckDate: Date = new Date();
    let isFirst = true;

    for (const account of accounts) {
        if (isFirst) {
            lastCheckDate = account.lastCheckDate as Date;
            isFirst = false;
        } else if (lastCheckDate > account.lastCheckDate) {
            lastCheckDate = account.lastCheckDate as Date;
        }
    }

    return lastCheckDate;
});

export class DriverCurrency extends Driver {
    config: DriverConfig = {
        showSync: false,
        showAddTransaction: false,
        showDuplicates: false,
        showBudget: false,
        showRecurringTransactions: false,
    };

    currentCurrency: string;

    constructor(driverCurrency: string) {
        super(DriverType.Currency, driverCurrency);
        this.currentCurrency = driverCurrency;
    }

    getCurrencyFormatter(state: BankStore.BankState) {
        const accounts = memoizedGetAccounts(state, this.currentCurrency);
        if (accounts.length) {
            return currency.makeFormat(accounts[0].currency);
        }

        return Number.toString;
    }

    getTransactions(state: BankStore.BankState): Transaction[] {
        const accounts = memoizedGetAccounts(state, this.currentCurrency);
        return memoizedGetTransactions(state, accounts);
    }

    getTransactionsIds(state: BankStore.BankState): Transaction['id'][] {
        return this.getTransactions(state).map(tr => tr.id);
    }

    getLastCheckDate(state: BankStore.BankState): Date {
        const accounts = memoizedGetAccounts(state, this.currentCurrency);
        return memoizedGetLastCheckDate(accounts);
    }

    getOutstandingSum(state: BankStore.BankState): number {
        const accounts = memoizedGetAccounts(state, this.currentCurrency);
        return memoizeGetOutstandingSum(accounts);
    }

    getBalance(state: BankStore.BankState): number {
        const accounts = memoizedGetAccounts(state, this.currentCurrency);
        return memoizedGetBalance(accounts);
    }

    getInitialBalance(state: BankStore.BankState): number {
        const accounts = memoizedGetAccounts(state, this.currentCurrency);
        return memoizedGetInitialBalance(accounts);
    }
}
