import {
    assertHas,
    assert,
    currency,
    FETCH_STATUS_SUCCESS,
    maybeHas,
    NONE_CATEGORY_ID,
    stringToColor,
    UNKNOWN_ACCOUNT_TYPE,
    UNKNOWN_OPERATION_TYPE
} from './helpers';

import { checkAlert, checkBudget } from '../shared/validators';

export class Access {
    constructor(arg, banks) {
        this.id = assertHas(arg, 'id') && arg.id;

        this.vendorId = assertHas(arg, 'vendorId') && arg.vendorId;
        this.login = assertHas(arg, 'login') && arg.login;
        this.enabled = assertHas(arg, 'enabled') && arg.enabled;
        this.customLabel = (maybeHas(arg, 'customLabel') && arg.customLabel) || null;

        // Retrieve bank access' name and custom fields from the static bank information.
        let staticBank = banks.find(b => b.uuid === this.vendorId);
        assert(
            typeof staticBank !== 'undefined',
            `Unknown bank linked to access: ${this.vendorId}`
        );
        this.label = staticBank.name;
        this.isBankVendorDeprecated = staticBank.deprecated;

        assert(!maybeHas(arg, 'fields') || arg.fields instanceof Array);
        let customFields = maybeHas(arg, 'fields') && arg.fields.length ? arg.fields : [];
        this.customFields = customFields.map(field => {
            let customField = staticBank.customFields.find(f => f.name === field.name);
            return {
                ...field,
                type: customField.type
            };
        });

        this.fetchStatus =
            (maybeHas(arg, 'fetchStatus') && arg.fetchStatus) || FETCH_STATUS_SUCCESS;

        // This field will be updated when accounts are attached to the access.
        this.accountIds = [];
    }

    get bank() {
        alert(`trying to get deprecated Access.bank property from ${new Error().stack}`);
    }
}

export class Bank {
    constructor(arg) {
        this.name = assertHas(arg, 'name') && arg.name;
        this.uuid = assertHas(arg, 'uuid') && arg.uuid;
        this.id = this.uuid;
        this.deprecated = assertHas(arg, 'deprecated') && arg.deprecated;

        // Force a deep copy of the custom fields (see also issue #569).
        this.customFields = JSON.parse(JSON.stringify(arg.customFields || []));
    }
}

export class Account {
    constructor(arg, defaultCurrency) {
        assert(typeof defaultCurrency === 'string', 'defaultCurrency must be a string');

        this.vendorId = assertHas(arg, 'vendorId') && arg.vendorId;
        this.accessId = assertHas(arg, 'accessId') && arg.accessId;
        this.label = assertHas(arg, 'label') && arg.label;
        this.vendorAccountId = assertHas(arg, 'vendorAccountId') && arg.vendorAccountId;
        this.initialBalance = assertHas(arg, 'initialBalance') && arg.initialBalance;
        this.lastCheckDate = assertHas(arg, 'lastCheckDate') && new Date(arg.lastCheckDate);
        this.id = assertHas(arg, 'id') && arg.id;
        this.iban = (maybeHas(arg, 'iban') && arg.iban) || null;
        this.currency =
            (maybeHas(arg, 'currency') && currency.isKnown(arg.currency) && arg.currency) ||
            defaultCurrency;
        this.type = arg.type || UNKNOWN_ACCOUNT_TYPE;
        this.formatCurrency = currency.makeFormat(this.currency);
        this.currencySymbol = currency.symbolFor(this.currency);
        this.excludeFromBalance =
            (maybeHas(arg, 'excludeFromBalance') && arg.excludeFromBalance) || false;
        this.customLabel = (maybeHas(arg, 'customLabel') && arg.customLabel) || null;

        // These fields will be updated when the operations are attached to the account.
        // Make sure to update `updateFrom` if you add any fields here.
        this.operationIds = [];
        this.balance = this.initialBalance;
        // The sum of the amount of transactions not yet taken into account in the balance.
        this.outstandingSum = 0;
    }

    get bank() {
        alert(`trying to get deprecated Account.bank property from ${new Error().stack}`);
    }

    static updateFrom(arg, defaultCurrency, previousAccount) {
        let newAccount = new Account(arg, defaultCurrency);

        // Make sure to keep this in sync with the above ctor.
        newAccount.operationIds = previousAccount.operationIds;
        newAccount.balance =
            previousAccount.balance - previousAccount.initialBalance + newAccount.initialBalance;
        newAccount.outstandingSum = previousAccount.outstandingSum;

        return newAccount;
    }
}

export class Operation {
    constructor(arg) {
        this.accountId = assertHas(arg, 'accountId') && arg.accountId;
        this.label = assertHas(arg, 'label') && arg.label;
        this.date = assertHas(arg, 'date') && new Date(arg.date);
        this.amount = assertHas(arg, 'amount') && arg.amount;
        this.binary = (maybeHas(arg, 'binary') && arg.binary) || null;
        this.attachments = (maybeHas(arg, 'attachments') && arg.attachments) || null;
        this.rawLabel = assertHas(arg, 'rawLabel') && arg.rawLabel;
        this.importDate = (maybeHas(arg, 'importDate') && new Date(arg.importDate)) || 0;
        this.id = assertHas(arg, 'id') && arg.id;
        this.categoryId = arg.categoryId || NONE_CATEGORY_ID;
        this.type = arg.type || UNKNOWN_OPERATION_TYPE;
        this.customLabel = (maybeHas(arg, 'customLabel') && arg.customLabel) || null;
        this.budgetDate = (maybeHas(arg, 'budgetDate') && new Date(arg.budgetDate)) || this.date;
        this.debitDate = (maybeHas(arg, 'debitDate') && new Date(arg.debitDate)) || this.date;
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
        this.label = assertHas(arg, 'label') && arg.label;
        this.color = (maybeHas(arg, 'color') && arg.color) || stringToColor(this.label);
        this.id = assertHas(arg, 'id') && arg.id;
    }
}

export class Budget {
    constructor(arg) {
        this.categoryId = assertHas(arg, 'categoryId') && arg.categoryId;

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
        this.year = assertHas(arg, 'year') && arg.year;
        this.month = assertHas(arg, 'month') && arg.month;

        assert(!checkBudget(this));
    }
}

export class Setting {
    constructor(arg) {
        this.key = assertHas(arg, 'key') && arg.key;
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
