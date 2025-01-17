import memoize from 'micro-memoize';

import * as BankStore from '../../store/banks';
import * as ViewStore from '../../store/views';

import { assert, currency } from '../../helpers';

import type { GlobalState } from '../../store';
import type { Account, Transaction, View } from '../../models';

export enum DriverType {
    None = 'none',
    Account = 'account',
    Currency = 'currency',
}

export type DriverConfig = {
    showAddTransaction: boolean;
    showDuplicates: boolean;
    showBudget: boolean;
    showRecurringTransactions: boolean;
};

const memoizedGetTransactions = memoize((state: BankStore.BankState, accounts: number[]) => {
    return BankStore.transactionsByAccountIds(state, accounts);
});

const memoizedGetTransactionsIds = memoize((state: BankStore.BankState, accounts: number[]) => {
    return BankStore.transactionIdsByAccountIds(state, accounts);
});

const memoizedGetAccounts = memoize((state: BankStore.BankState, accountIds: number[]) => {
    return accountIds.map(accountId => BankStore.accountById(state, accountId));
});

const memoizeGetOutstandingSum = memoize((accounts: Account[]) =>
    accounts
        .filter(account => !account.excludeFromBalance)
        .reduce((a, b) => a + b.outstandingSum, 0)
);

const memoizedGetBalance = memoize((accounts: Account[]) =>
    accounts.filter(account => !account.excludeFromBalance).reduce((a, b) => a + b.balance, 0)
);

const memoizedGetInitialBalance = memoize((accounts: Account[]) =>
    accounts
        .filter(account => !account.excludeFromBalance)
        .reduce((a, b) => a + b.initialBalance, 0)
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

export class Driver {
    config: DriverConfig = {
        showAddTransaction: false,
        showDuplicates: false,
        showBudget: false,
        showRecurringTransactions: false,
    };
    type: DriverType;
    value: DriverValueType;

    constructor(type: DriverType, value: DriverValueType) {
        this.type = type;
        this.value = value;
    }

    getView(_state: ViewStore.ViewState): View | null {
        return null;
    }

    getAccounts(state: GlobalState) {
        const view = this.getView(state.views);
        assert(view !== null, 'view must exist');
        return memoizedGetAccounts(state.banks, view.accounts);
    }

    getCurrencyFormatter(state: GlobalState) {
        const view = this.getView(state.views);
        assert(view !== null, 'view must exist');

        const accounts = this.getAccounts(state);
        if (accounts.length) {
            return currency.makeFormat(accounts[0].currency);
        }

        return Number.toString;
    }

    getTransactions(state: GlobalState): Transaction[] {
        const view = this.getView(state.views);
        assert(view !== null, 'view must exist');
        return memoizedGetTransactions(state.banks, view.accounts);
    }

    getTransactionsIds(state: GlobalState): Transaction['id'][] {
        const view = this.getView(state.views);
        assert(view !== null, 'view must exist');
        return memoizedGetTransactionsIds(state.banks, view.accounts);
    }

    getLastCheckDate(state: GlobalState): Date {
        const accounts = this.getAccounts(state);
        return memoizedGetLastCheckDate(accounts);
    }

    getOutstandingSum(state: GlobalState): number {
        const accounts = this.getAccounts(state);
        return memoizeGetOutstandingSum(accounts);
    }

    getBalance(state: GlobalState): number {
        const accounts = this.getAccounts(state);
        return memoizedGetBalance(accounts);
    }

    getInitialBalance(state: GlobalState): number {
        const accounts = this.getAccounts(state);
        return memoizedGetInitialBalance(accounts);
    }
}

export type DriverValueType = string | null;

export const NoDriver = new Driver(DriverType.None, '');
