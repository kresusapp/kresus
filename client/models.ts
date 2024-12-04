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

export type Access = {
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

    // Whether the access should be excluded from automatic polls.
    excludeFromPoll: boolean;
};

export const isManualAccess = (access: Access) => {
    return access.vendorId === MANUAL_BANK_ID;
};

export const createValidAccess = (arg: any, banks: Bank[]): Access => {
    // Keep in sync with `createAccess` reducer.
    assertHas(arg, 'id');
    assertHas(arg, 'vendorId');
    assertHas(arg, 'login');
    assertHas(arg, 'enabled');
    assertHas(arg, 'label');
    assertHas(arg, 'excludeFromPoll');

    // Retrieve bank access' custom fields from the static bank information.
    const staticBank = banks.find(b => b.uuid === arg.vendorId);
    assert(typeof staticBank !== 'undefined', `Unknown bank linked to access: ${arg.vendorId}`);

    assert(
        !maybeHas(arg, 'fields') || arg.fields instanceof Array,
        'custom fields must be an array or not be there at all'
    );

    let accessCustomFields: AccessCustomField[] = [];

    if (maybeHas(arg, 'fields')) {
        const customFields = arg.fields as { name: string; value: string }[];

        // This loop adds the type to the custom field instance.
        const fields: AccessCustomField[] = [];
        for (const field of customFields) {
            const customField: CustomFieldDescriptor | undefined = staticBank.customFields.find(
                f => f.name === field.name
            );
            if (typeof customField === 'undefined') {
                debug(`Custom field ${field.name} isn't needed anymore for bank ${arg.vendorId}`);
                continue;
            }
            fields.push({
                ...field,
                type: customField.type,
            });
        }
        accessCustomFields = fields;
    }

    return {
        id: arg.id,
        vendorId: arg.vendorId,
        login: arg.login,
        enabled: arg.enabled,
        label: arg.label,
        customLabel: (maybeHas(arg, 'customLabel') && arg.customLabel) || null,
        gracePeriod: 0,
        isBankVendorDeprecated: staticBank.deprecated,
        customFields: accessCustomFields,
        fetchStatus: (maybeHas(arg, 'fetchStatus') && arg.fetchStatus) || FETCH_STATUS_SUCCESS,

        // This field will be updated when accounts are attached to the access.
        accountIds: [],
        excludeFromPoll: arg.excludeFromPoll,
    };
};

export type Bank = {
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
};

export const createValidBank = (arg: Record<string, any>): Bank => {
    assertHas(arg, 'name');
    assertHas(arg, 'uuid');
    assertHas(arg, 'deprecated');

    return {
        name: arg.name,
        uuid: arg.uuid,
        id: arg.uuid,
        noCredentials: arg.noCredentials || false,
        deprecated: arg.deprecated,

        // Force a deep copy of the custom fields (see also issue #569).
        customFields: structuredClone(arg.customFields || []),
    };
};

export type Account = {
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
};

export const createValidAccount = (arg: Record<string, any>, defaultCurrency: string): Account => {
    assertHas(arg, 'accessId');
    assertHas(arg, 'label');
    assertHas(arg, 'vendorAccountId');
    assertHas(arg, 'initialBalance');
    assertHas(arg, 'balance');
    assertHas(arg, 'lastCheckDate');
    assertHas(arg, 'id');

    const accountCurrency =
        (maybeHas(arg, 'currency') && currency.isKnown(arg.currency) && arg.currency) ||
        defaultCurrency;

    return {
        accessId: arg.accessId,
        label: arg.label,
        vendorAccountId: arg.vendorAccountId,
        initialBalance: arg.initialBalance,
        balance: arg.balance,
        lastCheckDate: new Date(arg.lastCheckDate),
        id: arg.id,

        iban: (maybeHas(arg, 'iban') && arg.iban) || null,
        currency: accountCurrency,
        type: arg.type || UNKNOWN_ACCOUNT_TYPE,
        formatCurrency: currency.makeFormat(accountCurrency),
        currencySymbol: currency.symbolFor(accountCurrency),
        excludeFromBalance:
            (maybeHas(arg, 'excludeFromBalance') && arg.excludeFromBalance) || false,
        customLabel: (maybeHas(arg, 'customLabel') && arg.customLabel) || null,
        isOrphan: (maybeHas(arg, 'isOrphan') && arg.isOrphan) || false,
        gracePeriod: (maybeHas(arg, 'gracePeriod') && arg.gracePeriod) || 0,

        // These fields will be updated when the transactions are attached to the account.
        // Make sure to update `updateFrom` if you add any fields here.
        transactionIds: [],
        outstandingSum: 0,
    };
};

export const updateAccountFrom = (
    arg: Record<string, any>,
    defaultCurrency: string,
    previousAccount: Account
): Account => {
    const newAccount = createValidAccount(arg, defaultCurrency);

    // Make sure to keep this in sync with the above ctor.
    newAccount.transactionIds = previousAccount.transactionIds;
    newAccount.outstandingSum = previousAccount.outstandingSum;

    return newAccount;
};

export type Transaction = {
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
};

export const createValidTransaction = (arg: Record<string, any>): Transaction => {
    assertHas(arg, 'accountId');
    assertHas(arg, 'label');
    assertHas(arg, 'date');
    assertHas(arg, 'amount');
    assertHas(arg, 'rawLabel');
    assertHas(arg, 'id');

    const transactionDate = new Date(arg.date);

    return {
        accountId: arg.accountId,
        label: arg.label,
        date: transactionDate,
        amount: arg.amount,
        rawLabel: arg.rawLabel,
        id: arg.id,

        importDate: (maybeHas(arg, 'importDate') && new Date(arg.importDate)) || transactionDate,
        categoryId: arg.categoryId || NONE_CATEGORY_ID,
        type: arg.type || UNKNOWN_TRANSACTION_TYPE,
        customLabel: (maybeHas(arg, 'customLabel') && arg.customLabel) || null,
        budgetDate:
            (maybeHas(arg, 'budgetDate') && arg.budgetDate !== null && new Date(arg.budgetDate)) ||
            null,
        debitDate:
            (maybeHas(arg, 'debitDate') && arg.debitDate !== null && new Date(arg.debitDate)) ||
            transactionDate,
        createdByUser: arg.createdByUser,
    };
};

// A twist on Partial<Transaction>: also allow null.
export type PartialTransaction = { [P in keyof Transaction]?: Transaction[P] | null | undefined };

export type Type = {
    // The unique identifier of the type.
    id: string;
    name: string;
};

export const createValidType = (arg: Record<string, any>): Type => {
    assertHas(arg, 'name');

    return {
        name: arg.name,
        id: arg.name,
    };
};

export type Category = {
    // The unique identifier of the category inside Kresus.
    id: number;

    // The description of the category.
    label: string;

    // The color to be used to display the category.
    color: string;
};

export const createValidCategory = (arg: any): Category => {
    assertHas(arg, 'label');
    assertHas(arg, 'id');

    return {
        label: arg.label,
        id: arg.id,
        color: (maybeHas(arg, 'color') && arg.color) || stringToColor(arg.label),
    };
};

export type Budget = {
    // The category attached to this budget item.
    categoryId: number;

    // The amount budgeted for this category. null if no category is set for this category.
    threshold: number | null;

    // The year of the budget item.
    year: number;

    // The month of the budget item.
    month: number;
};

export const createValidBudget = (arg: any): Budget => {
    assertHas(arg, 'categoryId');
    assertHas(arg, 'year');
    assertHas(arg, 'month');

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

    const budget = {
        categoryId: arg.categoryId,
        year: arg.year,
        month: arg.month,
        threshold,
    };

    const validationError = checkBudget(budget);
    assert(!validationError, `${validationError}`);

    return budget;
};

export type Setting = {
    // The identifier of the setting.
    key: string;

    // The value of the setting.
    value: string;
};

export type AlertType = 'report' | 'balance' | 'transaction';

export type Alert = {
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
};

export const createValidAlert = (arg: any): Alert => {
    assertHas(arg, 'id');
    assertHas(arg, 'accountId');
    assertHas(arg, 'type');

    let frequency;
    let limit;
    let order;

    // Data for reports.
    if (arg.type === 'report') {
        assertHas(arg, 'frequency');
        frequency = arg.frequency;
    } else {
        // Data for balance/transaction notifications.
        assertHas(arg, 'limit');
        limit = arg.limit;

        assertHas(arg, 'order');
        order = arg.order;
    }

    const alert: Alert = {
        id: arg.id,
        accountId: arg.accountId,
        type: arg.type,
        frequency,
        limit,
        order,
    };

    const validationError = checkAlert(alert);
    assert(!validationError, `${validationError}`);

    return alert;
};

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

export type Rule = {
    id: number;
    position: number;
    conditions: RuleCondition[];
    actions: RuleAction[];
};

export const createValidRule = (arg: any): Rule => {
    assertHas(arg, 'id');
    assertHas(arg, 'conditions');
    assertHas(arg, 'actions');
    assertHas(arg, 'position');

    return {
        id: arg.id,
        position: arg.position,
        conditions: arg.conditions,
        actions: arg.actions,
    };
};

export type RecurringTransaction = {
    id: number;

    accountId: number;

    type: string;

    label: string;

    amount: number;

    dayOfMonth: number;

    listOfMonths: string;
};

export const createValidRecurringTransaction = (arg: any): RecurringTransaction => {
    assertHas(arg, 'id');
    assertHas(arg, 'accountId');
    assertHas(arg, 'type');
    assertHas(arg, 'label');
    assertHas(arg, 'amount');
    assertHas(arg, 'dayOfMonth');
    assertHas(arg, 'listOfMonths');

    return {
        id: arg.id,
        accountId: arg.accountId,
        type: arg.type,
        label: arg.label,
        amount: arg.amount,
        dayOfMonth: arg.dayOfMonth,
        listOfMonths: arg.listOfMonths,
    };
};
