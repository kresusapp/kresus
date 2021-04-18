import { Account, Operation } from '../../models';

import * as BankStore from '../../store/banks';
import { Driver, DriverConfig, DriverType, View } from './base';

export class DriverCurrency extends Driver {
    config: DriverConfig = {
        showSync: false,
        showAddTransaction: false,
        showDuplicates: false,
        showBudget: false,
    };

    currentCurrency: string;

    constructor(currency: string) {
        super(DriverType.Currency, currency);
        this.currentCurrency = currency;
    }

    getView(state: BankStore.BankState): View {
        const accessIds: number[] = BankStore.getAccessIds(state);

        // Can't wait for flatmap!
        const accountIds: number[] = accessIds
            .map(id => {
                return BankStore.accountIdsByAccessId(state, id);
            })
            .reduce((res, sublist) => res.concat(sublist), []);

        const accounts: Account[] = accountIds
            .map(id => {
                return BankStore.accountById(state, id);
            })
            .filter(
                account => !account.excludeFromBalance && account.currency === this.currentCurrency
            );

        let formatCurrency: (amount: number) => string = (amount: number) => {
            return `${amount}`;
        };

        let balance = 0;
        let initialBalance = 0;
        let outstandingSum = 0;
        let lastCheckDate: Date = new Date();
        let isFirst = true;

        let transactionIds: number[] = [];
        for (const account of accounts) {
            if (isFirst) {
                formatCurrency = account.formatCurrency;
                lastCheckDate = account.lastCheckDate as Date;
                isFirst = false;
            } else if (lastCheckDate > account.lastCheckDate) {
                lastCheckDate = account.lastCheckDate as Date;
            }

            balance += account.balance;
            initialBalance += account.initialBalance;
            outstandingSum += account.outstandingSum;
            transactionIds = transactionIds.concat(
                BankStore.operationIdsByAccountId(state, account.id)
            );
        }

        const transactions: Operation[] = transactionIds
            .map(id => BankStore.operationById(state, id))
            .slice()
            .sort((a, b) => +b.date - +a.date);

        transactionIds = transactions.reduce((res, transaction) => {
            res.push(transaction.id);
            return res;
        }, [] as number[]);

        return new View(
            this,
            transactionIds,
            transactions,
            formatCurrency,
            lastCheckDate,
            balance,
            outstandingSum,
            initialBalance
        );
    }
}
