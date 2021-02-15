import { Account, Operation } from '../../models';
import * as BankStore from '../../store/banks';
import { assert } from '../../helpers';

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

    currentAccountId: number | null;

    constructor(accountId: number | null) {
        super(DriverType.Account, accountId !== null ? accountId.toString() : accountId);
        this.currentAccountId = accountId;
    }

    getView(state: BankStore.BankState): View {
        assert(this.currentAccountId !== null, 'account id must be defined');
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
