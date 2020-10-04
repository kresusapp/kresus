import { assert } from '../../helpers';
import { drivers, driverFactory, DriverType, DriverConfig, Driver, View } from '.';
import { Account, Operation } from '../../models';

import * as Bank from '../../store/banks';

export class DriverCurrency extends Driver {
    config: DriverConfig = {
        showSync: false,
        showAddOperation: false,
        showSubMenu: true,
        showDuplicates: false,
        showBudget: true,
    };
    currentCurrency: string;
    constructor(currency: string) {
        super(drivers.CURRENCY, currency);
        this.currentCurrency = currency;
    }
    getView(state: any): View {
        assert(state, 'missing state');
        const accessIds: number[] = Bank.getAccessIds(state);
        const accountIds: number[] = accessIds
            .map(id => {
                return Bank.accountIdsByAccessId(state, id);
            })
            .reduce((res, sublist) => {
                return res.concat(sublist);
            }, []);
        const accounts: Account[] = accountIds
            .map(id => {
                return Bank.accountById(state, id);
            })
            .filter(
                account => !account.excludeFromBalance && account.currency === this.currentCurrency
            );

        let operationIds: number[] = [];
        let balance = 0;
        let initialBalance = 0;
        let outstandingSum = 0;
        let formatCurrency: (amount: number) => string = (amount: number) => {
            return `${amount}`;
        };
        let lastCheckDate: Date = new Date();
        let isFirst = true;

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
            operationIds = operationIds.concat(Bank.operationIdsByAccountId(state, account.id));
        }
        const operations: Operation[] = operationIds
            .map(id => Bank.operationById(state, id))
            .slice()
            .sort((a, b) => +b.date - +a.date);
        operationIds = operations.reduce((res, sublist) => {
            return res.concat(sublist.id);
        }, []);
        return new View(
            this,
            operationIds,
            operations,
            formatCurrency,
            lastCheckDate,
            balance,
            outstandingSum,
            initialBalance
        );
    }
}

drivers.CURRENCY = 'currency' as DriverType;
driverFactory[drivers.CURRENCY] = (value: string) => {
    return new DriverCurrency(value);
};
