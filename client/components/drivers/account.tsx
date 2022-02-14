import * as BankStore from '../../store/banks';
import { assert } from '../../helpers';

import { Driver, DriverConfig, DriverType, View } from './base';

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
        return new View(
            this,
            BankStore.operationIdsByAccountId(state, this.currentAccountId),
            BankStore.operationsByAccountId(state, this.currentAccountId),
            account.formatCurrency,
            account.lastCheckDate,
            account.balance,
            account.outstandingSum,
            account.balance,
            account
        );
    }
}
