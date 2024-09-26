import {
    debug,
    assertHas,
    assert,
    currency,
    FETCH_STATUS_SUCCESS,
    maybeHas,
    NONE_CATEGORY_ID,
    stringToColor,
    UNKNOWN_ACCOUNT_TYPE,
    UNKNOWN_TRANSACTION_TYPE,
} from './helpers';

import { checkAlert, checkBudget } from '../shared/validators';
import { immerable } from 'immer';
import { TransactionRuleActionType, TransactionRuleConditionType } from '../shared/types';

type CustomField = {
    // A key describing the name of the field.
    name: string;

    // An enum describing the type of field.
    type: 'text' | 'password' | 'select';
};

export interface AccessCustomField extends CustomField {
    // The value set by the user.
    value: string | null;
}

interface SelectCustomFieldDescriptor extends CustomField {
    type: 'select';

    // Optionally, the default value of the select.
    default?: 'string';

    // The list of options.
    values: {
        // The label to be displayed to the user.
        label: string;

        // The select value, to be used programmatically.
        value: string;
    }[];

    // Whether the field is optional.
    optional?: boolean;
}

interface TextCustomFieldDescriptor extends CustomField {
    type: 'text' | 'password';

    // An optional string describing the key to be used to help the user to fill the field.
    placeholderKey?: string;

    // Whether the field is optional.
    optional?: boolean;
}

export type CustomFieldDescriptor = SelectCustomFieldDescriptor | TextCustomFieldDescriptor;

export const MANUAL_BANK_ID = 'manual';

export class Access {
    [immerable] = true;

    // The unique identifier of the Access inside Kresus.
    id: number;

    // Whether the access is enabled or not.
    enabled: boolean;

    // The identifier of the backend provider.
    vendorId: string;

    // Whether the backend provider is deprecated or not.
    isBankVendorDeprecated: boolean;

    // The login to connect to the bank website.
    login: string;

    // The extra fields required to connect to the bank website.
    customFields: AccessCustomField[];

    // A human-readable label, set by the bank's website, to identify the access.
    label: string;

    // An optional label, set by the user, to identify the access.
    customLabel: string | null;

    // Minimum transaction age (in days) to be integrated in the database. This avoids duplicates for some banks which poorly handle details for recent transactions
    gracePeriod: number;

    // The status code of the last fetch.
    fetchStatus: string;

    // The list of accounts attached to this access.
    accountIds: number[];

    constructor(arg: any, banks: Bank[]) {
        assertHas(arg, 'id');
        assertHas(arg, 'vendorId');
        assertHas(arg, 'login');
        assertHas(arg, 'enabled');
        assertHas(arg, 'label');

        // Retrieve bank access' custom fields from the static bank information.
        const staticBank = banks.find(b => b.uuid === arg.vendorId);
        assert(typeof staticBank !== 'undefined', `Unknown bank linked to access: ${arg.vendorId}`);

        this.id = arg.id;
        this.vendorId = arg.vendorId;
        this.login = arg.login;
        this.enabled = arg.enabled;
        this.label = arg.label;
        this.customLabel = (maybeHas(arg, 'customLabel') && arg.customLabel) || null;
        this.gracePeriod = 0;
        this.isBankVendorDeprecated = staticBank.deprecated;

        assert(
            !maybeHas(arg, 'fields') || arg.fields instanceof Array,
            'custom fields must be an array or not be there at all'
        );
        if (maybeHas(arg, 'fields')) {
            const customFields = arg.fields as { name: string; value: string }[];

            // This loop adds the type to the custom field instance.
            const fields: AccessCustomField[] = [];
            for (const field of customFields) {
                const customField: CustomFieldDescriptor | undefined = staticBank.customFields.find(
                    f => f.name === field.name
                );
                if (typeof customField === 'undefined') {
                    debug(
                        `Custom field ${field.name} isn't needed anymore for bank ${this.vendorId}`
                    );
                    continue;
                }
                fields.push({
                    ...field,
                    type: customField.type,
                });
            }
            this.customFields = fields;
        } else {
            this.customFields = [];
        }

        this.fetchStatus =
            (maybeHas(arg, 'fetchStatus') && arg.fetchStatus) || FETCH_STATUS_SUCCESS;

        // This field will be updated when accounts are attached to the access.
        this.accountIds = [];
    }

    isManual() {
        return this.vendorId === MANUAL_BANK_ID;
    }
}

export class Bank {
    // A human readable name for the bank.
    name: string;

    // The unique identifier of the bank.
    id: string;
    uuid: string;

    // Whether the bank is deprecated or not.
    deprecated: boolean;

    // The list of extra fields to be used to connect to the bank.
    customFields: CustomFieldDescriptor[];

    // Whether credentials are not required.
    noCredentials: boolean;

    constructor(arg: Record<string, any>) {
        assertHas(arg, 'name');
        assertHas(arg, 'uuid');
        assertHas(arg, 'deprecated');

        this.name = arg.name;
        this.uuid = arg.uuid;
        this.id = this.uuid;
        this.noCredentials = arg.noCredentials || false;
        this.deprecated = arg.deprecated;

        // Force a deep copy of the custom fields (see also issue #569).
        this.customFields = JSON.parse(JSON.stringify(arg.customFields || []));
    }
}

export class Account {
    [immerable] = true;

    // The account unique identifier inside Kresus.
    id: number;

    // The account identifier returned by the backend provider.
    vendorAccountId: string;

    // An optional string storing the IBAN of the account.
    iban: string | null;

    // The access id to which the account is attached.
    accessId: number;

    // The label describing the account returned by the vendor.
    label: string;

    // An optional label set by the user.
    customLabel: string | null;

    // The type of the account.
    type: string;

    // The currency of the account.
    currency: string;

    // A function to format a number according to the currency standard.
    formatCurrency: (val: number) => string;

    // The symbol to be used for the currency of the account.
    currencySymbol: string;

    // The balance of the account when the account was imported in Kresus.
    initialBalance: number;

    // The current balance of the account.
    balance: number;

    // The sum of transaction values to be included in the balance in the future.
    outstandingSum: number;

    // The list of transactions' identifiers attached to the account.
    transactionIds: number[];

    // The date at which the account was last checked.
    lastCheckDate: Date;

    // Whether the account's balance should be included in the access overall balance.
    excludeFromBalance: boolean;

    // Whether the account couldn't be found in the provider's data, last time we checked it.
    isOrphan: boolean;

    // Grace period between imports
    gracePeriod: number;

    constructor(arg: Record<string, any>, defaultCurrency: string) {
        assertHas(arg, 'accessId');
        assertHas(arg, 'label');
        assertHas(arg, 'vendorAccountId');
        assertHas(arg, 'initialBalance');
        assertHas(arg, 'balance');
        assertHas(arg, 'lastCheckDate');
        assertHas(arg, 'id');

        this.accessId = arg.accessId;
        this.label = arg.label;
        this.vendorAccountId = arg.vendorAccountId;
        this.initialBalance = arg.initialBalance;
        this.balance = arg.balance;
        this.lastCheckDate = new Date(arg.lastCheckDate);
        this.id = arg.id;

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
        this.isOrphan = (maybeHas(arg, 'isOrphan') && arg.isOrphan) || false;
        this.gracePeriod = (maybeHas(arg, 'gracePeriod') && arg.gracePeriod) || 0;

        // These fields will be updated when the transactions are attached to the account.
        // Make sure to update `updateFrom` if you add any fields here.
        this.transactionIds = [];
        this.outstandingSum = 0;
    }

    static updateFrom(
        arg: Record<string, any>,
        defaultCurrency: string,
        previousAccount: Account
    ): Account {
        const newAccount = new Account(arg, defaultCurrency);

        // Make sure to keep this in sync with the above ctor.
        newAccount.transactionIds = previousAccount.transactionIds;
        newAccount.outstandingSum = previousAccount.outstandingSum;

        return newAccount;
    }
}

export class Transaction {
    [immerable] = true;

    // The transaction unique identifier inside Kresus.
    id: number;

    // The account identifier to which the transaction is attached.
    accountId: number;

    // The description of the transaction returned by the vendor.
    label: string;

    // The raw description of the transaction returned by the vendor.
    rawLabel: string;

    // The optional description set by the user.
    customLabel: string | null;

    // The date when the transaction was done.
    date: Date;

    // The date when the transaction will be included in the balance.
    debitDate: Date;

    // The first day of the month for which the transaction should be included in the budget.
    budgetDate: Date | null;

    // The value of the transaction.
    amount: number;

    // The date when the transaction was imported, or 0 when the date is unknown.
    importDate: Date;

    // The identifier of the category in which the transaction is classified.
    categoryId: number;

    // The type of transaction.
    type: string;

    // Whether it was created by the user.
    createdByUser: boolean;

    constructor(arg: Record<string, any>) {
        assertHas(arg, 'accountId');
        assertHas(arg, 'label');
        assertHas(arg, 'date');
        assertHas(arg, 'amount');
        assertHas(arg, 'rawLabel');
        assertHas(arg, 'id');

        this.accountId = arg.accountId;
        this.label = arg.label;
        this.date = new Date(arg.date);
        this.amount = arg.amount;
        this.rawLabel = arg.rawLabel;
        this.id = arg.id;

        this.importDate = (maybeHas(arg, 'importDate') && new Date(arg.importDate)) || this.date;
        this.categoryId = arg.categoryId || NONE_CATEGORY_ID;
        this.type = arg.type || UNKNOWN_TRANSACTION_TYPE;
        this.customLabel = (maybeHas(arg, 'customLabel') && arg.customLabel) || null;
        this.budgetDate =
            (maybeHas(arg, 'budgetDate') && arg.budgetDate !== null && new Date(arg.budgetDate)) ||
            null;
        this.debitDate =
            (maybeHas(arg, 'debitDate') && arg.debitDate !== null && new Date(arg.debitDate)) ||
            this.date;
        this.createdByUser = arg.createdByUser;
    }
}

// A twist on Partial<Transaction>: also allow null.
export type PartialTransaction = { [P in keyof Transaction]?: Transaction[P] | null | undefined };

export class Type {
    // The unique identifier of the type.
    id: string;
    name: string;

    constructor(arg: Record<string, any>) {
        assertHas(arg, 'name');
        this.name = arg.name;
        this.id = this.name;
    }
}

export class Category {
    [immerable] = true;

    // The unique identifier of the category inside Kresus.
    id: number;

    // The description of the category.
    label: string;

    // The color to be used to display the category.
    color: string;

    constructor(arg: any) {
        assertHas(arg, 'label');
        assertHas(arg, 'id');

        this.label = arg.label;
        this.id = arg.id;
        this.color = (maybeHas(arg, 'color') && arg.color) || stringToColor(this.label);
    }
}

export class Budget {
    [immerable] = true;

    // The category attached to this budget item.
    categoryId: number;

    // The amount budgeted for this category. null if no category is set for this category.
    threshold: number | null;

    // The year of the budget item.
    year: number;

    // The month of the budget item.
    month: number;

    constructor(arg: any) {
        assertHas(arg, 'categoryId');
        assertHas(arg, 'year');
        assertHas(arg, 'month');

        this.categoryId = arg.categoryId;
        this.year = arg.year;
        this.month = arg.month;

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

        const validationError = checkBudget(this);
        assert(!validationError, `${validationError}`);
    }
}

export class Setting {
    [immerable] = true;

    // The identifier of the setting.
    key: string;

    // The value of the setting.
    val: string;

    constructor(arg: any) {
        assertHas(arg, 'key');
        assertHas(arg, 'value');
        this.key = arg.key;
        this.val = arg.value;
    }
}

export type AlertType = 'report' | 'balance' | 'transaction';

export class Alert {
    [immerable] = true;

    // The unique id of the alert inside Kresus.
    id: number;

    // The account to which the alert is attached.
    accountId: number;

    // The type of alert.
    type: AlertType;

    // Applicable only for type === 'report'.
    // The frequency of reports.
    frequency?: 'daily' | 'weekly' | 'monthly';

    // Applicable only for type !== 'report'.
    // The limit triggering the alert.
    limit?: number;

    // A qualifier telling whether the alert should be triggered
    // when the amount (transaction) or the balance is greater (gt) or lower
    // (lt) than this.limit.
    order?: 'gt' | 'lt';

    constructor(arg: any) {
        assertHas(arg, 'id');
        assertHas(arg, 'accountId');
        assertHas(arg, 'type');

        this.id = arg.id;
        this.accountId = arg.accountId;
        this.type = arg.type;

        // Data for reports.
        if (this.type === 'report') {
            assertHas(arg, 'frequency');
            this.frequency = arg.frequency;
        }

        // Data for balance/transaction notifications.
        if (this.type !== 'report') {
            assertHas(arg, 'limit');
            this.limit = arg.limit;
            assertHas(arg, 'order');
            this.order = arg.order;
        }

        const validationError = checkAlert(this);
        assert(!validationError, `${validationError}`);
    }
}

export interface RuleCondition {
    id: number;
    type: TransactionRuleConditionType;
    value: string;
}

export interface RuleAction {
    id: number;
    type: TransactionRuleActionType;
    categoryId: number;
}

export class Rule {
    id: number;
    position: number;
    conditions: RuleCondition[];
    actions: RuleAction[];

    constructor(arg: any) {
        assertHas(arg, 'id');
        assertHas(arg, 'conditions');
        assertHas(arg, 'actions');
        assertHas(arg, 'position');

        this.id = arg.id;
        this.position = arg.position;
        this.conditions = arg.conditions;
        this.actions = arg.actions;
    }
}

export class RecurringTransaction {
    id: number;

    accountId: number;

    type: string;

    label: string;

    amount: number;

    dayOfMonth: number;

    listOfMonths: string;

    constructor(arg: any) {
        assertHas(arg, 'id');
        assertHas(arg, 'accountId');
        assertHas(arg, 'type');
        assertHas(arg, 'label');
        assertHas(arg, 'amount');
        assertHas(arg, 'dayOfMonth');
        assertHas(arg, 'listOfMonths');

        this.id = arg.id;
        this.accountId = arg.accountId;
        this.type = arg.type;
        this.label = arg.label;
        this.amount = arg.amount;
        this.dayOfMonth = arg.dayOfMonth;
        this.listOfMonths = arg.listOfMonths;
    }
}
