import * as BankStore from '../../store/banks';
import { Account as AccountModel, Operation } from '../../models';

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
};

export class View {
    // eslint-disable-next-line no-useless-constructor
    constructor(
        public driver: Driver,
        public transactionIds: number[],
        public transactions: Operation[],
        public formatCurrency: (amount: number) => string,
        public lastCheckDate: Date,
        public balance: number,
        public outstandingSum: number,
        public initialBalance: number,
        public account: AccountModel | null = null
    ) {}
}

export class Driver {
    config: DriverConfig = {
        showSync: false,
        showAddTransaction: false,
        showDuplicates: false,
        showBudget: false,
    };
    type: DriverType;
    value: DriverValueType;

    currentAccountId: number | null = null;

    constructor(type: DriverType, value: DriverValueType) {
        this.type = type;
        this.value = value;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    getView(_state: BankStore.BankState): View {
        return DefaultView;
    }

    // TODO is this used?
    isEqual(other: Driver): boolean {
        return this.type === other.type && this.value === other.value;
    }
}

export type DriverValueType = string | null;

export const NoDriver = new Driver(DriverType.None, '');

export const DefaultView: View = new View(
    NoDriver,
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
