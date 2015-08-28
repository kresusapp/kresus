import {has, assert, maybeHas, NONE_CATEGORY_ID, NONE_OPERATION_TYPE_ID} from './Helpers';

export class Bank {
    constructor(arg) {
        this.id   = has(arg, 'id')   && arg.id;
        this.name = has(arg, 'name') && arg.name;
        this.uuid = has(arg, 'uuid') && arg.uuid;
        this.websites = arg.websites;

        this.accounts = [];
    }
}

export class Account {
    constructor(arg) {
        this.bank          = has(arg, 'bank') && arg.bank;
        this.bankAccess    = has(arg, 'bankAccess') && arg.bankAccess;
        this.title         = has(arg, 'title') && arg.title;
        this.accountNumber = has(arg, 'accountNumber') && arg.accountNumber;
        this.initialAmount = has(arg, 'initialAmount') && arg.initialAmount;
        this.lastChecked   = has(arg, 'lastChecked') && new Date(arg.lastChecked);
        this.id            = has(arg, 'id') && arg.id;

        this.operations = [];
    }

    mergeOwnProperties(other) {
        assert(this.id === other.id, 'ids of merged accounts must be equal');
        this.bank = other.bank;
        this.bankAccess = other.bankAccess;
        this.title = other.title;
        this.accountNumber = other.accountNumber;
        this.initialAmount = other.initialAmount;
        this.lastChecked = other.lastChecked;
        // No need to merge ids, they're the same
    }
}

export class Operation {
    constructor(arg) {
        this.bankAccount = has(arg, 'bankAccount') && arg.bankAccount;
        this.title       = has(arg, 'title') && arg.title;
        this.date        = has(arg, 'date') && new Date(arg.date);
        this.amount      = has(arg, 'amount') && arg.amount;
        this.binary      = (maybeHas(arg, 'binary') && arg.binary) || null;
        this.raw         = has(arg, 'raw') && arg.raw;
        this.dateImport  = (maybeHas(arg, 'dateImport') && new Date(arg.dateImport)) || 0;
        this.id          = has(arg, 'id') && arg.id;
        this.categoryId  = arg.categoryId || NONE_CATEGORY_ID;
        this.type        = (maybeHas(arg, 'operationTypeID') && arg.operationTypeID) || NONE_OPERATION_TYPE_ID 
    }
}

export class Category {
    constructor(arg) {
        this.title = has(arg, 'title') && arg.title;
        this.id = has(arg, 'id') && arg.id;

        // Optional
        this.parentId = arg.parentId;
    }

    mergeOwnProperties(other) {
        assert(other.id === this.id, `ids of merged categories need to be the same, got ${other.id} and ${this.id}`);
        this.title = other.title;
        this.parentId = other.parentId;
    }
}

export class Setting {
    constructor(arg) {
        this.key = has(arg, 'name') && arg.name;
        this.val = has(arg, 'value') && arg.value;
    }
}

export class OperationType {
    constructor(arg) {
        this.name = has(arg, 'name') && arg.name;
        this.id = has(arg, 'id') && arg.id;
        this.weboobvalue = has(arg, 'weboobvalue') && arg.weboobvalue;
    }
}
