import { Account, Operation } from '../../models';

import * as BankStore from '../../store/banks';
import { Driver, DriverConfig, DriverType, View } from './base';

class AccountView extends View {
    account: Account;

    constructor(
        driver: Driver,
        transactionIds: number[],
        transactions: Operation[],
        formatCurrency: (amount: number) => string,
        lastCheckDate: Date,
        balance: number,
        outstandingSum: number,
        initialBalance: number,
        account: Account
    ) {
        super(
            driver,
            transactionIds,
            transactions,
            formatCurrency,
            lastCheckDate,
            balance,
            outstandingSum,
            initialBalance
        );
        this.account = account;
    }
}

export class DriverAccount extends Driver {
    config: DriverConfig = {
        showSync: true,
        showAddTransaction: true,
        showDuplicates: true,
        showBudget: true,
    };

    currentAccountId: number;

    constructor(accountId: number) {
        super(DriverType.Account, accountId.toString());
        this.currentAccountId = accountId;
    }

    getView(state: BankStore.BankState): View {
        const account = BankStore.accountById(state, this.currentAccountId);
        return new AccountView(
            this,
            BankStore.operationIdsByAccountId(state, this.currentAccountId),
            BankStore.operationsByAccountId(state, this.currentAccountId),
            account.formatCurrency,
            account.lastCheckDate,
            account.balance,
            account.outstandingSum,
            account.initialBalance,
            account
        );
    }
}
