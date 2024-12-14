import * as BankStore from '../../store/banks';
import type { Transaction } from '../../models';

// eslint-disable-next-line no-shadow
export enum DriverType {
    None = 'none',
    Account = 'account',
    Currency = 'currency',
}

export type DriverConfig = {
    showSync: boolean;
    showAddTransaction: boolean;
    showDuplicates: boolean;
    showBudget: boolean;
    showRecurringTransactions: boolean;
};

export class Driver {
    config: DriverConfig = {
        showSync: false,
        showAddTransaction: false,
        showDuplicates: false,
        showBudget: false,
        showRecurringTransactions: false,
    };
    type: DriverType;
    value: DriverValueType;

    currentAccountId: number | null = null;

    constructor(type: DriverType, value: DriverValueType) {
        this.type = type;
        this.value = value;
    }

    getCurrencyFormatter(_state: BankStore.BankState): (_val: number) => string {
        return () => '';
    }

    getTransactions(_state: BankStore.BankState): Transaction[] {
        return [];
    }

    getTransactionsIds(_state: BankStore.BankState): Transaction['id'][] {
        return [];
    }

    getLastCheckDate(_state: BankStore.BankState): Date {
        return new Date();
    }

    getOutstandingSum(_state: BankStore.BankState): number {
        return 0;
    }

    getBalance(_state: BankStore.BankState): number {
        return 0;
    }

    getInitialBalance(_state: BankStore.BankState): number {
        return 0;
    }
}

export type DriverValueType = string | null;

export const NoDriver = new Driver(DriverType.None, '');
