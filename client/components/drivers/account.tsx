import memoize from 'micro-memoize';
import * as BankStore from '../../store/banks';
import { assert } from '../../helpers';

import { Driver, DriverConfig, DriverType } from './base';

const memoizedGetAccount = memoize((state: BankStore.BankState, accountId: number) => {
    return BankStore.accountById(state, accountId);
});

const memoizedGetTransactions = memoize((state: BankStore.BankState, accountId: number) => {
    return BankStore.transactionsByAccountId(state, accountId);
});

const memoizedGetTransactionsIds = memoize((state: BankStore.BankState, accountId: number) => {
    return BankStore.transactionIdsByAccountId(state, accountId);
});

export class DriverAccount extends Driver {
    config: DriverConfig = {
        showSync: true,
        showAddTransaction: true,
        showDuplicates: true,
        showBudget: true,
        showRecurringTransactions: true,
    };

    currentAccountId: number | null;

    constructor(accountId: number | null) {
        super(DriverType.Account, accountId !== null ? accountId.toString() : accountId);
        this.currentAccountId = accountId;
    }

    getAccount(state: BankStore.BankState) {
        assert(this.currentAccountId !== null, 'account id must be defined');
        return memoizedGetAccount(state, this.currentAccountId);
    }

    getCurrencyFormatter(state: BankStore.BankState) {
        const account = this.getAccount(state);
        return account.formatCurrency;
    }

    getTransactions(state: BankStore.BankState) {
        assert(this.currentAccountId !== null, 'account id must be defined');
        return memoizedGetTransactions(state, this.currentAccountId);
    }

    getTransactionsIds(state: BankStore.BankState) {
        assert(this.currentAccountId !== null, 'account id must be defined');
        return memoizedGetTransactionsIds(state, this.currentAccountId);
    }

    getLastCheckDate(state: BankStore.BankState): Date {
        const account = this.getAccount(state);
        return account.lastCheckDate;
    }

    getOutstandingSum(state: BankStore.BankState): number {
        const account = this.getAccount(state);
        return account.outstandingSum;
    }

    getBalance(state: BankStore.BankState): number {
        const account = this.getAccount(state);
        return account.balance;
    }

    getInitialBalance(state: BankStore.BankState): number {
        const account = this.getAccount(state);
        return account.initialBalance;
    }
}
