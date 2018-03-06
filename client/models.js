import {
    assertHas,
    assert,
    currency,
    maybeHas,
    NONE_CATEGORY_ID,
    stringToColor,
    UNKNOWN_OPERATION_TYPE
} from './helpers';

import { checkAlert } from '../shared/validators';

export class Access {
    constructor(arg, banks) {
        this.id = assertHas(arg, 'id') && arg.id;

        // The bank unique identifier to which the access is attached.
        this.bank = assertHas(arg, 'bank') && arg.bank;

        this.enabled = assertHas(arg, 'enabled') && arg.enabled;

        this.login = assertHas(arg, 'login') && arg.login;

        // Retrieve bank access' name and custom fields from the static bank information.
        let staticBank = banks.find(b => b.uuid === this.bank);
        assert(typeof staticBank !== 'undefined', `Unknown bank linked to access: ${this.bank}`);

        this.name = staticBank.name;

        assert(!maybeHas(arg, 'customFields') || arg.customFields instanceof Array);
        let customFields =
            maybeHas(arg, 'customFields') && arg.customFields.length ? arg.customFields : [];

        this.customFields = customFields.map(field => {
            let customField = staticBank.customFields.find(f => f.name === field.name);
            return {
                ...field,
                type: customField.type
            };
        });
    }
}

export class Bank {
    constructor(arg) {
        this.name = assertHas(arg, 'name') && arg.name;
        this.uuid = assertHas(arg, 'uuid') && arg.uuid;
        this.id = this.uuid;

        // Force a deep copy of the custom fields (see also issue #569).
        this.customFields = JSON.parse(JSON.stringify(arg.customFields || []));
    }
}

export class Account {
    constructor(arg, defaultCurrency) {
        assert(typeof defaultCurrency === 'string', 'defaultCurrency must be a string');

        this.bank = assertHas(arg, 'bank') && arg.bank;
        this.bankAccess = assertHas(arg, 'bankAccess') && arg.bankAccess;
        this.title = assertHas(arg, 'title') && arg.title;
        this.accountNumber = assertHas(arg, 'accountNumber') && arg.accountNumber;
        this.initialAmount = assertHas(arg, 'initialAmount') && arg.initialAmount;
        this.lastChecked = assertHas(arg, 'lastChecked') && new Date(arg.lastChecked);
        this.id = assertHas(arg, 'id') && arg.id;
        this.iban = (maybeHas(arg, 'iban') && arg.iban) || null;
        this.currency =
            (maybeHas(arg, 'currency') && currency.isKnown(arg.currency) && arg.currency) ||
            defaultCurrency;
        this.formatCurrency = currency.makeFormat(this.currency);
        this.currencySymbol = currency.symbolFor(this.currency);
        this.excludeFromBalance =
            (maybeHas(arg, 'excludeFromBalance') && arg.excludeFromBalance) || false;
    }
}

export class Operation {
    constructor(arg) {
        this.accountId = assertHas(arg, 'accountId') && arg.accountId;
        this.title = assertHas(arg, 'title') && arg.title;
        this.date = assertHas(arg, 'date') && new Date(arg.date);
        this.amount = assertHas(arg, 'amount') && arg.amount;
        this.binary = (maybeHas(arg, 'binary') && arg.binary) || null;
        this.attachments = (maybeHas(arg, 'attachments') && arg.attachments) || null;
        this.raw = assertHas(arg, 'raw') && arg.raw;
        this.dateImport = (maybeHas(arg, 'dateImport') && new Date(arg.dateImport)) || 0;
        this.id = assertHas(arg, 'id') && arg.id;
        this.categoryId = arg.categoryId || NONE_CATEGORY_ID;
        this.type = arg.type || UNKNOWN_OPERATION_TYPE;
        this.customLabel = (maybeHas(arg, 'customLabel') && arg.customLabel) || null;
        this.budgetDate = (maybeHas(arg, 'budgetDate') && new Date(arg.budgetDate)) || this.date;
    }
}

export class Type {
    constructor(arg) {
        this.name = assertHas(arg, 'name') && arg.name;
        this.id = this.name;
    }
}

export class Category {
    constructor(arg) {
        this.title = assertHas(arg, 'title') && arg.title;
        this.color = (maybeHas(arg, 'color') && arg.color) || stringToColor(this.title);
        let threshold = 0;
        if (maybeHas(arg, 'threshold')) {
            threshold = arg.threshold;
            if (typeof threshold === 'string') {
                threshold = parseFloat(threshold);
                if (isNaN(threshold)) {
                    threshold = 0;
                }
            }
        }
        this.threshold = threshold;
        this.id = assertHas(arg, 'id') && arg.id;
        // Optional
        this.parentId = arg.parentId;
    }
}

export class Setting {
    constructor(arg) {
        this.key = assertHas(arg, 'name') && arg.name;
        this.val = assertHas(arg, 'value') && arg.value;
    }
}

export class Alert {
    constructor(arg) {
        this.id = assertHas(arg, 'id') && arg.id;
        this.accountId = assertHas(arg, 'accountId') && arg.accountId;

        this.type = assertHas(arg, 'type') && arg.type;

        // Data for reports
        this.frequency = arg.type === 'report' && assertHas(arg, 'frequency') && arg.frequency;

        // Data for balance/operation notifications
        this.limit = arg.type !== 'report' && assertHas(arg, 'limit') && arg.limit;
        this.order = arg.type !== 'report' && assertHas(arg, 'order') && arg.order;

        let validationError = checkAlert(this);
        assert(!validationError);
    }
}
