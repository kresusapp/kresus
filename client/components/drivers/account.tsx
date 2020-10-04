import { drivers, driverFactory, DriverConfig, Driver, View } from '.';
import { Account, Operation } from '../../models';

import * as Bank from '../../store/banks';

class AccountView extends View {
    account: Account;
    constructor(
        driver: Driver,
        operationIds: number[],
        operations: Operation[],
        formatCurrency: (amount: number) => string,
        lastCheckDate: Date,
        balance: number,
        outstandingSum: number,
        initialBalance: number,
        a: Account
    ) {
        super(
            driver,
            operationIds,
            operations,
            formatCurrency,
            lastCheckDate,
            balance,
            outstandingSum,
            initialBalance
        );
        this.account = a;
    }
}

export class DriverAccount extends Driver {
    config: DriverConfig = {
        showSync: true,
        showAddOperation: true,
        showSubMenu: true,
        showDuplicates: true,
        showBudget: true,
    };
    currentAccountId: number;
    constructor(accountId: number) {
        super(drivers.ACCOUNT, accountId);
        this.currentAccountId = accountId;
    }
    getView(state: Bank.BankState): View {
        const account = Bank.accountById(state, this.currentAccountId);
        return new AccountView(
            this,
            Bank.operationIdsByAccountId(state, this.currentAccountId),
            Bank.operationsByAccountId(state, this.currentAccountId),
            account.formatCurrency,
            account.lastCheckDate,
            account.balance,
            account.outstandingSum,
            account.initialBalance,
            account
        );
    }
}

drivers.ACCOUNT = 'account';
driverFactory[drivers.ACCOUNT] = (value: string) => {
    const currentAccountId: number = Number.parseInt(value, 10);
    return new DriverAccount(currentAccountId);
};
