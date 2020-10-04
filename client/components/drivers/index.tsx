import { assert } from '../../helpers';
import { Operation } from '../../models';
import { BankState } from '../../store/banks';

export type DriverConfig = {
    showSync: boolean;
    showAddOperation: boolean;
    showSubMenu: boolean;
    showDuplicates: boolean;
    showBudget: boolean;
};

export type DriverType = string;
export type DriverValueType = string | number | null;

export class View {
    driver: Driver;
    operationIds: number[];
    operations: Operation[];
    formatCurrency: (amount: number) => string;
    lastCheckDate: Date;
    balance: number;
    outstandingSum: number;
    initialBalance: number;
    constructor(
        driver: Driver,
        operationIds: number[],
        operations: Operation[],
        formatCurrency: (amount: number) => string,
        lastCheckDate: Date,
        balance: number,
        outstandingSum: number,
        initialBalance: number
    ) {
        this.driver = driver;
        this.operationIds = operationIds;
        this.operations = operations;
        this.formatCurrency = formatCurrency;
        this.lastCheckDate = lastCheckDate;
        this.balance = balance;
        this.outstandingSum = outstandingSum;
        this.initialBalance = initialBalance;
    }
}

export class Driver {
    config: DriverConfig = {
        showSync: false,
        showAddOperation: false,
        showSubMenu: false,
        showDuplicates: false,
        showBudget: false,
    };
    type: DriverType;
    value: DriverValueType;
    constructor(type: DriverType, value: DriverValueType) {
        this.type = type;
        this.value = value;
    }
    getView(state: BankState): View {
        assert(state, 'missing state');
        return new View(
            this,
            [],
            [],
            () => {
                return '';
            },
            new Date(),
            0,
            0,
            0
        );
    }
    isEqual(other: Driver): boolean {
        return this.type === other.type && this.value === other.value;
    }
}

export const noDriver = new Driver('', null);

export function getDriver(
    driverType: DriverType | null,
    driverValue: DriverValueType | null
): Driver {
    if (!driverType || driverType === '') {
        // console.warn('no driver defined');
        return noDriver;
    }
    assert(driverType in driverFactory, `[${driverType}] unknown driver type`);
    return driverFactory[driverType](driverValue);
}

interface Dictionary<T> {
    [Key: string]: T;
}

export const drivers: Dictionary<DriverType> = {};
export const driverFactory: Dictionary<(value: DriverValueType) => Driver> = {};
