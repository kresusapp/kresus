import { createSlice, createAsyncThunk, Dispatch, isAnyOf } from '@reduxjs/toolkit';

import {
    assert,
    assertNotNull,
    FETCH_STATUS_SUCCESS,
    localeComparator,
    NONE_CATEGORY_ID,
    UNKNOWN_ACCOUNT_TYPE,
    displayLabel,
    shouldIncludeInOutstandingSum,
    assertDefined,
    translate as $t,
} from '../helpers';

import {
    Account,
    Access,
    Alert,
    Bank,
    Transaction,
    AlertType,
    AccessCustomField,
    CustomFieldDescriptor,
    Type,
    PartialTransaction,
} from '../models';

import DefaultAlerts from '../../shared/default-alerts.json';
import DefaultSettings from '../../shared/default-settings';
import { UserActionResponse } from '../../shared/types';
import TransactionTypes from '../../shared/transaction-types.json';

import * as UiStore from './ui';
import * as backend from './backend';
import * as CategoriesStore from './categories';
import * as SettingsStore from './settings';

import {
    mergeInArray,
    removeInArrayById,
    mergeInObject,
    removeInArray,
    resetStoreReducer,
} from './helpers';

import StaticBanks from '../../shared/banks.json';
import { DEFAULT_ACCOUNT_ID, LIMIT_ONGOING_TO_CURRENT_MONTH } from '../../shared/settings';
import { BatchStatus } from '../../shared/api/batch';
import { batch } from './batch';

export interface BankState {
    // Bank descriptors.
    banks: Bank[];

    // Array of accesses ids.
    accessIds: number[];
    accessMap: Record<number, Access>;

    accountMap: Record<number, Account>;
    transactionMap: Record<number, Transaction>;

    alerts: Alert[];

    currentAccountId: number | null;

    // Account id for the default account, or null if it's not defined.
    defaultAccountId: number | null;

    // Constant for the whole lifetime of the web app.
    defaultCurrency: string;
    transactionTypes: Type[];

    isOngoingLimitedToCurrentMonth: boolean;
}

type SyncResult = {
    accounts?: Account[];
    newTransactions?: Transaction[];
};

// Set a transaction's category.
export const setTransactionCategory = createAsyncThunk(
    'banks/setTransactionCategory',
    async (params: { transactionId: number; categoryId: number; formerCategoryId: number }) => {
        const { transactionId, categoryId } = params;
        const serverCategoryId = categoryId === NONE_CATEGORY_ID ? null : categoryId;
        return await backend.setCategoryForTransaction(transactionId, serverCategoryId);
    }
);

// Set a transaction's type.
export const setTransactionType = createAsyncThunk(
    'banks/setTransactionType',
    async (params: { transactionId: number; newType: string; formerType: string }) => {
        const { transactionId, newType } = params;
        return await backend.setTypeForTransaction(transactionId, newType);
    }
);

// Set a transaction's custom label.
type setTransactionCustomLabelError = { error: unknown; formerCustomLabel: string };
export const setTransactionCustomLabel = createAsyncThunk(
    'banks/setTransactionCustomLabel',
    async (params: { transaction: Transaction; customLabel: string }, { rejectWithValue }) => {
        const { transaction, customLabel } = params;

        // The server expects an empty string for deleting the custom label.
        const formerCustomLabel = transaction.customLabel;
        const serverCustomLabel = !customLabel ? '' : customLabel;

        try {
            return await backend.setCustomLabel(transaction.id, serverCustomLabel);
        } catch (error: unknown) {
            rejectWithValue({
                error,
                formerCustomLabel,
            });
        }
    }
);

// Set a transaction's date.
type setTransactionBudgetDateError = {
    formerBudgetDate: Date | null;
};

type setTransactionDateError = setTransactionBudgetDateError & {
    formerDebitDate: Date | null;
    formerDate: Date | null;
};

export const setTransactionDate = createAsyncThunk(
    'banks/setTransactionDate',
    async (
        params: { transaction: Transaction; date: Date | null; budgetDate: Date | null },
        { rejectWithValue }
    ) => {
        const { transaction, date, budgetDate } = params;

        // Keep debitDate synchronized with the date.
        const formerDebitDate = date || transaction.date;
        const formerDate = transaction.date;
        const formerBudgetDate = transaction.budgetDate;

        try {
            return await backend.setTransactionDate(
                transaction.id,
                date,
                budgetDate || transaction.budgetDate
            );
        } catch (error: unknown) {
            rejectWithValue({
                formerDebitDate,
                formerDate,
                formerBudgetDate,
            });
        }
    }
);

// Set a transaction's budget date.
export const setTransactionBudgetDate = createAsyncThunk(
    'banks/setTransactionBudgetDate',
    async (params: { transaction: Transaction; budgetDate: Date | null }, { rejectWithValue }) => {
        const { transaction, budgetDate } = params;
        const formerBudgetDate = transaction.budgetDate;

        try {
            return await backend.setTransactionBudgetDate(transaction.id, budgetDate);
        } catch (error: unknown) {
            rejectWithValue({
                formerBudgetDate,
            });
        }
    }
);

// Fetches all the transactions for the given access through the bank's
// provider.
export const runTransactionsSync = createAsyncThunk(
    'banks/runTransactionsSync',
    async (
        params: {
            accessId: number;
        },
        { dispatch }
    ) => {
        const { accessId } = params;
        let results = await backend.getNewTransactions(accessId);
        const userAction = maybeGetUserAction(dispatch, results);
        if (userAction) {
            const userActionFields = await userAction;
            results = await backend.getNewTransactions(accessId, userActionFields);
        }

        return { accessId, results };
    }
);

// Fetches the accounts and transactions for a given access.
export const runAccountsSync = createAsyncThunk(
    'banks/runAccountsSync',
    async (params: { accessId: number }, { dispatch }) => {
        const { accessId } = params;
        let results = await backend.getNewAccounts(accessId);
        const userAction = maybeGetUserAction(dispatch, results);

        if (userAction) {
            const userActionFields = await userAction;
            results = await backend.getNewAccounts(accessId, userActionFields);
        }

        return { accessId, results };
    }
);

// Apply a bulk edit to a group of transactions.+
export type BulkEditFields = {
    customLabel?: string | null;
    categoryId?: number;
    type?: string;
};

export const applyBulkEdit = createAsyncThunk(
    'banks/applyBulkEdit',
    async (params: { newFields: BulkEditFields; transactionIds: number[] }) => {
        const { newFields, transactionIds } = params;
        const serverNewFields: {
            customLabel?: string | null;
            categoryId?: number | null;
            type?: string;
        } = { ...newFields };
        serverNewFields.categoryId =
            serverNewFields.categoryId === NONE_CATEGORY_ID ? null : serverNewFields.categoryId;

        await Promise.all(transactionIds.map(id => backend.updateTransaction(id, serverNewFields)));

        return params;
    }
);

// Creates a new transaction.
export const createTransaction = createAsyncThunk(
    'banks/createTransaction',
    async (transaction: Partial<Transaction>) => {
        let serverTransaction: PartialTransaction = transaction;
        if (transaction.categoryId === NONE_CATEGORY_ID) {
            serverTransaction = { ...transaction, categoryId: null };
        }

        const created = await backend.createTransaction(serverTransaction);
        return created;
    }
);

// Deletes a given transaction.
export const deleteTransaction = createAsyncThunk(
    'banks/deleteTransaction',
    async (transactionId: number) => {
        const deleted = await backend.deleteTransaction(transactionId);
        if (deleted) {
            deleted.transactionId = transactionId;
        }

        return deleted;
    }
);

// Merges two transactions together.
export const mergeTransactions = createAsyncThunk(
    'banks/mergeTransaction',
    async (params: { toKeep: Transaction; toRemove: Transaction }) => {
        const { toKeep, toRemove } = params;
        const result = await backend.mergeTransactions(toKeep.id, toRemove.id);

        return {
            toKeep,
            toRemove,
            transaction: result.newToKeep,
            accountId: result.accountId,
            accountBalance: result.accountBalance,
        };
    }
);

// Creates a new access.
type AccessParams = {
    uuid: string;
    login: string;
    password: string;
    fields: AccessCustomField[];
    customLabel: string | null;
    shouldCreateDefaultAlerts: boolean;
};
export const createAccess = createAsyncThunk(
    'banks/createAccess',
    async (params: AccessParams, { dispatch }) => {
        const { uuid, login, password, fields, customLabel } = params;
        let results = await backend.createAccess(uuid, login, password, fields, customLabel);

        const userAction = maybeGetUserAction(dispatch, results);
        if (userAction) {
            const userActionFields = await userAction;
            results = await backend.createAccess(
                uuid,
                login,
                password,
                fields,
                customLabel,
                userActionFields
            );
        }

        if (params.shouldCreateDefaultAlerts) {
            await dispatch(createDefaultAlerts(results.accounts));
        }

        return results;
    }
);

// Deletes the given access.
export const deleteAccess = createAsyncThunk('banks/deleteAccess', async (accessId: number) => {
    await backend.deleteAccess(accessId);
    return accessId;
});

// Resyncs the balance of the given account according to the real balance read
// from a provider.
type ResyncBalanceParams = { accountId: number; initialBalance?: number; balance?: number };
type ResyncBalanceError = { accountId: number; error: unknown };
export const resyncBalance = createAsyncThunk(
    'banks/resyncBalance',
    async (
        params: {
            accountId: number;
            userActionFields?: FinishUserActionFields;
        },
        { dispatch, rejectWithValue }
    ) => {
        const { accountId } = params;
        try {
            let results = await backend.resyncBalance(accountId);

            const userAction = maybeGetUserAction(dispatch, results);
            if (userAction) {
                const userActionFields = await userAction;
                results = await backend.resyncBalance(accountId, userActionFields);
            }

            return results as ResyncBalanceParams;
        } catch (error: unknown) {
            rejectWithValue({
                accountId,
                error,
            } as ResyncBalanceError);
        }

        // We need to return at some point, to please typescript.
        // eslint-disable-next-line no-useless-return
        return;
    }
);

// Updates the account with the given fields.
// Does not trigger a sync.
export const updateAccount = createAsyncThunk(
    'banks/updateAccount',
    async (params: {
        accountId: number;
        newFields: Partial<Account>;
        prevFields: Partial<Account>;
    }) => {
        const { accountId, newFields } = params;
        const updated = await backend.updateAccount(accountId, newFields);
        return updated;
    }
);

// Deletes an account and all its transactions.
export const deleteAccount = createAsyncThunk(
    'banks/deleteAccount',
    async (params: { accountId: number }) => {
        await backend.deleteAccount(params.accountId);
        return params.accountId;
    }
);

// Creates a new alert.
export const createAlert = createAsyncThunk(
    'banks/createAlert',
    async (newAlert: Partial<Alert>) => {
        const created = await backend.createAlert(newAlert);
        return created;
    }
);

// Updates an alert's fields.
export const updateAlert = createAsyncThunk(
    'banks/updateAlert',
    async (params: { alertId: number; fields: Partial<Alert> }) => {
        const { alertId, fields } = params;
        await backend.updateAlert(alertId, fields);
        return params;
    }
);

// Deletes an alert.
export const deleteAlert = createAsyncThunk('banks/deleteAlert', async (alertId: number) => {
    await backend.deleteAlert(alertId);
    return alertId;
});

// Sets the default account to the given account id.
export const setDefaultAccountId = createAsyncThunk(
    'banks/setDefaultAccountId',
    async (accountId: number | null) => {
        return await backend.saveSetting(
            DEFAULT_ACCOUNT_ID,
            accountId !== null ? accountId.toString() : null
        );
    }
);

// Updates the access' fields and runs a sync. Must be used when the login,
// password, custom fields have changed.
export const updateAndFetchAccess = createAsyncThunk(
    'banks/updateAndFetchAccess',
    async (
        params: {
            accessId: number;
            login: string;
            password: string;
            customFields: AccessCustomField[];
        },
        { dispatch }
    ) => {
        const { accessId, login, password, customFields } = params;
        const newFields = {
            login,
            customFields,
        };

        let results = await backend.updateAndFetchAccess(accessId, { password, ...newFields });

        const userAction = maybeGetUserAction(dispatch, results);
        if (userAction) {
            const userActionFields = await userAction;
            results = await backend.updateAndFetchAccess(
                accessId,
                { password, ...newFields },
                userActionFields
            );
        }

        return {
            results: {
                ...results,
                accessId,
            },
            newFields: {
                ...newFields,
                enabled: true,
            },
        };
    }
);

// Updates some access' fields without retriggering a sync.
export const updateAccess = createAsyncThunk(
    'banks/updateAccess',
    async (params: {
        accessId: number;
        newFields: Partial<Access>;
        prevFields: Partial<Access>;
    }) => {
        const { accessId, newFields } = params;
        await backend.updateAccess(accessId, newFields);
        return params;
    }
);

export function disableAccess(accessId: number) {
    return updateAccess({ accessId, newFields: { enabled: false }, prevFields: { enabled: true } });
}

const createDefaultAlerts = createAsyncThunk(
    'banks/createDefaultAlerts',
    async (accounts: Account[], { dispatch }) => {
        for (const account of accounts) {
            if (
                !DefaultAlerts.hasOwnProperty(account.type) &&
                account.type !== UNKNOWN_ACCOUNT_TYPE
            ) {
                continue;
            }

            const key = account.type as keyof typeof DefaultAlerts;

            const defaultAlerts = DefaultAlerts[key] as Partial<Alert>[];
            await Promise.all(
                defaultAlerts.map(al => {
                    const merged = { ...al, accountId: account.id };
                    return dispatch(createAlert(merged));
                })
            );
        }
    }
);

export type FinishUserActionFields = Record<string, string>;
export type FinishUserAction = (fields: FinishUserActionFields) => void;

function maybeGetUserAction(dispatch: Dispatch, results: UserActionResponse | { kind: undefined }) {
    if (typeof results.kind === 'undefined') {
        return null;
    }
    assert(results.kind === 'user_action', 'must have thrown a user action');

    switch (results.actionKind) {
        case 'decoupled_validation':
            assertDefined(results.message);

            return new Promise<FinishUserActionFields>(resolve => {
                dispatch(
                    UiStore.requestUserAction({
                        finish: fields => {
                            resolve(fields);
                            dispatch(UiStore.finishUserAction());
                        },
                        message: results.message,
                        fields: null,
                    })
                );
            });
        case 'browser_question':
            assertDefined(results.fields);

            return new Promise<FinishUserActionFields>(resolve => {
                dispatch(
                    UiStore.requestUserAction({
                        finish: fields => {
                            resolve(fields);
                            dispatch(UiStore.finishUserAction());
                        },
                        message: null,
                        fields: results.fields,
                    })
                );
            });
        default:
            assert(false, `unknown user action ${results.actionKind}`);
    }
}

// State mutators.

function finishSync(state: BankState, accessId: number, results: SyncResult): void {
    const { accounts = [], newTransactions = [] } = results;

    // If finishSync is called, everything went well.
    updateAccessFetchStatus(state, accessId, FETCH_STATUS_SUCCESS);

    if (accounts.length) {
        // addAccounts also handles transactions.
        addAccounts(state, accounts, newTransactions);
    } else {
        addTransactions(state, newTransactions);
    }
}

function updateAccessFetchStatus(
    state: BankState,
    accessId: number,
    errCode: string | null = null
): void {
    // If the errCode is null, this means this is not a fetchStatus.
    if (errCode !== null) {
        mergeInObject(state.accessMap, accessId, { fetchStatus: errCode });
    }
}

// More complex operations.
function makeCompareTransactionByIds(state: BankState) {
    return function compareTransactionIds(id1: number, id2: number) {
        const tr1 = transactionById(state, id1);
        const tr2 = transactionById(state, id2);
        assertNotNull(tr1);
        assertNotNull(tr2);
        const tr1date = +tr1.date,
            tr2date = +tr2.date;
        if (tr1date < tr2date) {
            return 1;
        }
        if (tr1date > tr2date) {
            return -1;
        }
        const alabel = displayLabel(tr1);
        const blabel = displayLabel(tr2);
        return localeComparator(alabel, blabel);
    };
}

function updateAccountBalance(state: BankState, accountId: number, accountBalance: number): void {
    mergeInObject(state.accountMap, accountId, { balance: accountBalance });
}

function addTransactions(state: BankState, transactions: Partial<Transaction>[]): void {
    const accountsToSort = new Set<Account>();
    const limitOngoingToCurrentMonth = state.isOngoingLimitedToCurrentMonth;

    for (const tr of transactions) {
        const transaction = new Transaction(tr);

        const account = accountById(state, transaction.accountId);
        accountsToSort.add(account);

        account.transactionIds.push(transaction.id);

        // Do not include it in the balance, this should be computed by the server.

        if (shouldIncludeInOutstandingSum(transaction, limitOngoingToCurrentMonth)) {
            account.outstandingSum += transaction.amount;
        }

        state.transactionMap[transaction.id] = transaction;
    }

    // Ensure transactions are still sorted.
    const comparator = makeCompareTransactionByIds(state);
    for (const account of accountsToSort) {
        account.transactionIds.sort(comparator);
    }
}

function makeCompareAccountIds(state: BankState) {
    return function compareAccountIds(id1: number, id2: number) {
        const acc1 = accountById(state, id1);
        const acc2 = accountById(state, id2);
        return localeComparator(displayLabel(acc1), displayLabel(acc2));
    };
}

function setCurrentAccount(state: BankState): void {
    const defaultAccountId = getDefaultAccountId(state);

    // The initial account id is:
    // 1. the current account id, if defined.
    // 2. the first account of the first access, if it exists.
    // 3. null otherwise
    let current;
    if (defaultAccountId !== null) {
        current = defaultAccountId;
    } else if (state.accessIds.length > 0) {
        current = accountIdsByAccessId(state, state.accessIds[0])[0];
    } else {
        current = null;
    }

    state.currentAccountId = current;
}

function addAccounts(
    state: BankState,
    accounts: Partial<Account>[],
    transactions: Partial<Transaction>[]
): void {
    if (accounts.length === 0) {
        return;
    }

    const defaultCurrency = state.defaultCurrency;

    const accessesToSort = new Set<Access>();

    for (const account of accounts) {
        assertDefined(account.accessId);
        assertDefined(account.id);

        // Only add account to the access list if it does not already exist.
        const access = accessById(state, account.accessId);
        if (!access.accountIds.includes(account.id)) {
            access.accountIds.push(account.id);
            accessesToSort.add(access);
        }

        // Always update the account content.
        const prevAccount = state.accountMap[account.id];
        if (typeof prevAccount === 'undefined') {
            state.accountMap[account.id] = new Account(account, defaultCurrency);
        } else {
            mergeInObject(
                state.accountMap,
                account.id,
                Account.updateFrom(account, defaultCurrency, prevAccount)
            );
        }
    }

    // Ensure accounts are still sorted in each access.
    const comparator = makeCompareAccountIds(state);
    for (const access of accessesToSort) {
        access.accountIds.sort(comparator);
    }

    // If there was no current account id, set one.
    if (getCurrentAccountId(state) === null) {
        setCurrentAccount(state);
    }

    addTransactions(state, transactions);
}

function sortAccesses(state: BankState): void {
    const accessIds = getAccessIds(state);

    const defaultAccountId = getDefaultAccountId(state);
    const defaultAccessId =
        defaultAccountId === null ? null : accessByAccountId(state, defaultAccountId).id;

    accessIds.sort((ida: number, idb: number) => {
        const a = accessById(state, ida);
        const b = accessById(state, idb);

        // First display the access with default account.
        if (a.id === defaultAccessId) {
            return -1;
        }
        if (b.id === defaultAccessId) {
            return 1;
        }

        // Then display active accounts.
        if (a.enabled !== b.enabled) {
            return a.enabled ? -1 : 1;
        }

        // Finally order accesses by alphabetical order.
        return localeComparator(displayLabel(a).replace(' ', ''), displayLabel(b).replace(' ', ''));
    });
}

function addAccesses(
    state: BankState,
    accesses: Partial<Access>[],
    accounts: Partial<Account>[],
    transactions: Partial<Transaction>[]
): void {
    const bankDescs = state.banks;
    for (const partialAccess of accesses) {
        const access = new Access(partialAccess, bankDescs);
        state.accessMap[access.id] = access;
        state.accessIds.push(access.id);
    }

    addAccounts(state, accounts, transactions);

    sortAccesses(state);
}

function removeAccess(state: BankState, accessId: number): void {
    const access = accessById(state, accessId);

    assert(access.accountIds.length > 0, 'access should have at least one account');

    // First remove all the accounts attached to the access.
    //
    // Copy the items to avoid iterating on an array that's being mutated under
    // the rug.
    const accountIds = access.accountIds.slice();
    for (const accountId of accountIds) {
        removeAccount(state, accountId);
    }

    assert(
        typeof state.accessMap[accessId] === 'undefined',
        'last removeAccount should have removed the access (accessMap)'
    );
    assert(
        !state.accessIds.includes(accessId),
        'last removeAccount should have removed the access (accessIds)'
    );
}

function removeAccount(state: BankState, accountId: number): void {
    const account = accountById(state, accountId);

    // First remove the attached transactions from the transaction map.
    for (const id of account.transactionIds) {
        assertDefined(state.transactionMap[id]);
        delete state.transactionMap[id];
    }

    // Then remove the account from the access.
    const access = accessById(state, account.accessId);
    removeInArray(access.accountIds, accountId);

    // Reset the defaultAccountId if we just deleted it.
    if (getDefaultAccountId(state) === accountId) {
        state.defaultAccountId = null;
    }

    // Remove access if there's no accounts in the access.
    if (access.accountIds.length === 0) {
        assertDefined(state.accessMap[account.accessId]);
        delete state.accessMap[account.accessId];
        removeInArray(state.accessIds, account.accessId);
        // Sort accesses in case the default account has been deleted.
        sortAccesses(state);
    }

    // Reset the current account id if we just deleted it.
    if (getCurrentAccountId(state) === accountId) {
        setCurrentAccount(state);
    }

    // Remove alerts attached to the account.
    state.alerts = state.alerts.filter((alert: Alert) => alert.accountId !== accountId);

    // Finally, remove the account from the accounts map.
    delete state.accountMap[accountId];
}

function removeTransaction(state: BankState, transactionId: number): void {
    const tr = transactionById(state, transactionId);
    const account = accountById(state, tr.accountId);
    const limitOngoingToCurrentMonth = state.isOngoingLimitedToCurrentMonth;

    let { outstandingSum } = account;

    // Do not remove it from the balance, this should be computed by the server.

    if (shouldIncludeInOutstandingSum(tr, limitOngoingToCurrentMonth)) {
        outstandingSum -= tr.amount;
    }

    mergeInObject(state.accountMap, account.id, {
        transactionIds: account.transactionIds.filter(id => id !== transactionId),
        outstandingSum,
    });

    delete state.transactionMap[transactionId];
}

// Helpers.
function sortSelectFields(field: CustomFieldDescriptor) {
    if (field.type === 'select') {
        field.values.sort((a, b) => localeComparator(a.label, b.label));
    }
}

function sortBanks(banks: Bank[]) {
    banks.sort((a, b) => localeComparator(a.name, b.name));

    // Sort the selects of customFields by alphabetical order.
    banks.forEach(bank => {
        if (bank.customFields) {
            bank.customFields.forEach(sortSelectFields);
        }
    });
}

function replaceCategoryId(state: BankState, from: number, to: number) {
    for (const id of Object.keys(state.transactionMap)) {
        // Helping TypeScript a bit here: Object.keys return string, we
        // specified a mapping of number -> transactions.
        const t = state.transactionMap[id as any as number];
        if (t.categoryId === from) {
            t.categoryId = to;
        }
    }
}

// Initial state.
export function makeInitialState(
    external: {
        defaultCurrency: string;
        defaultAccountId: string;
        isOngoingLimitedToCurrentMonth: boolean;
    },
    allAccesses: Partial<Access>[],
    allAccounts: Partial<Account>[],
    allTransactions: Partial<Transaction>[],
    allAlerts: Partial<Alert>[]
) {
    // Retrieved from outside.
    const {
        defaultCurrency,
        defaultAccountId: defaultAccountIdStr,
        isOngoingLimitedToCurrentMonth: limitOngoing,
    } = external;

    let defaultAccountId: number | null = null;
    if (defaultAccountIdStr !== DefaultSettings.get(DEFAULT_ACCOUNT_ID)) {
        defaultAccountId = parseInt(defaultAccountIdStr, 10);
    }

    const banks = StaticBanks.map(b => new Bank(b));
    sortBanks(banks);

    // TODO The sorting order doesn't hold after a i18n language change. Do we care?
    const transactionTypes = TransactionTypes.map(type => new Type(type));
    transactionTypes.sort((type1, type2) => {
        return localeComparator($t(`client.${type1.name}`), $t(`client.${type2.name}`));
    });

    const state: BankState = {
        banks,

        accessIds: [],
        accessMap: {},
        accountMap: {},
        transactionMap: {},
        alerts: allAlerts.map(al => new Alert(al)),

        currentAccountId: null,
        defaultAccountId,

        defaultCurrency,
        transactionTypes,

        isOngoingLimitedToCurrentMonth: limitOngoing,
    };

    addAccesses(state, allAccesses, allAccounts, allTransactions);
    setCurrentAccount(state);

    return state;
}

const recomputeAccountOutstandingSum = (state: BankState, accountId: Account['id']) => {
    const doLimit = state.isOngoingLimitedToCurrentMonth;
    const onGoingTransactions = transactionsByAccountId(state, accountId).filter(tr =>
        shouldIncludeInOutstandingSum(tr, doLimit)
    );
    return onGoingTransactions.reduce((a, b) => a + b.amount, 0);
};

const updateAccountFieldsAndSort = (
    state: BankState,
    accountId: Account['id'],
    fields: Partial<Account>
) => {
    // Update fields in the object.
    mergeInObject(state.accountMap, accountId, fields);

    // Ensure accounts are still sorted.
    const access = accessByAccountId(state, accountId);
    access.accountIds.sort(makeCompareAccountIds(state));
};

const updateAccessFieldsAndSort = (
    state: BankState,
    accessId: Access['id'],
    fields: Partial<Access>
) => {
    mergeInObject(state.accessMap, accessId, fields);
    sortAccesses(state);
};

const banksSlice = createSlice({
    name: 'settings',
    initialState: makeInitialState(
        {
            defaultCurrency: '',
            defaultAccountId: '',
            isOngoingLimitedToCurrentMonth: true,
        },
        [],
        [],
        [],
        []
    ),
    reducers: {
        reset: resetStoreReducer<BankState>,
    },
    extraReducers: builder => {
        builder
            .addCase(createAccess.fulfilled, (state, action) => {
                const { uuid, login, fields, customLabel } = action.meta.arg;
                const { accessId, label, accounts, newTransactions } = action.payload;

                const access = {
                    id: accessId,
                    vendorId: uuid,
                    login,
                    fields,
                    label,
                    customLabel,
                    enabled: true,
                };

                // A new access must have an account and a transaction array (even
                // if it's empty).
                assertDefined(accounts);
                assertDefined(newTransactions);

                addAccesses(state, [access], accounts, newTransactions);
            })
            .addCase(updateAccess.pending, (state, action) => {
                // Optimistic update
                const { accessId, newFields } = action.meta.arg;
                updateAccessFieldsAndSort(state, accessId, newFields);
            })
            .addCase(updateAccess.rejected, (state, action) => {
                // Revert to previous fields
                const { accessId, prevFields } = action.meta.arg;
                updateAccessFieldsAndSort(state, accessId, prevFields);
            })
            .addCase(deleteAccess.fulfilled, (state, action) => {
                const accessId = action.payload;
                removeAccess(state, accessId);
            })
            .addCase(resyncBalance.fulfilled, (state, action) => {
                if (!action.payload) {
                    return;
                }

                const { accountId } = action.meta.arg;
                const { initialBalance, balance } = action.payload;
                assertDefined(initialBalance);
                mergeInObject(state.accountMap, accountId, { initialBalance, balance });
            })
            .addCase(resyncBalance.rejected, (state, action) => {
                const { accountId, error } = action.payload as ResyncBalanceError;

                const access = accessByAccountId(state, accountId);
                assertNotNull(access);
                const { id: accessId } = access;
                updateAccessFetchStatus(state, accessId, (error as any)?.code || null);
            })
            .addCase(createAlert.fulfilled, (state, action) => {
                state.alerts.push(new Alert(action.payload));
            })
            .addCase(updateAlert.fulfilled, (state, action) => {
                const { fields, alertId } = action.payload;
                mergeInArray(state.alerts, alertId, fields);
            })
            .addCase(deleteAlert.fulfilled, (state, action) => {
                const alertId = action.payload;
                removeInArrayById(state.alerts, alertId);
            })
            .addCase(createTransaction.fulfilled, (state, action) => {
                const created = action.payload;
                assertDefined(created);
                addTransactions(state, [created.transaction]);
                updateAccountBalance(state, created.accountId, created.accountBalance);
            })
            .addCase(deleteTransaction.fulfilled, (state, action) => {
                const deleted = action.payload;
                assertDefined(deleted);

                removeTransaction(state, deleted.transactionId);
                if (typeof deleted.accountBalance === 'number') {
                    updateAccountBalance(state, deleted.accountId, deleted.accountBalance);
                }
            })
            .addCase(mergeTransactions.fulfilled, (state, action) => {
                const { accountId, accountBalance, toKeep, toRemove } = action.payload;

                // Remove the former transaction:
                removeTransaction(state, toRemove.id);
                // Replace the kept one:
                const newKept = new Transaction(toKeep);
                mergeInObject(state.transactionMap, toKeep.id, newKept);

                if (accountId && typeof accountBalance === 'number') {
                    updateAccountBalance(state, accountId, accountBalance);
                }
            })
            .addCase(updateAccount.pending, (state, action) => {
                // Optimistic approach
                const { newFields, accountId } = action.meta.arg;

                updateAccountFieldsAndSort(state, accountId, newFields);
            })
            .addCase(updateAccount.rejected, (state, action) => {
                const { prevFields, accountId } = action.meta.arg;

                updateAccountFieldsAndSort(state, accountId, prevFields);
            })
            .addCase(deleteAccount.fulfilled, (state, action) => {
                removeAccount(state, action.payload);
            })
            .addCase(setDefaultAccountId.fulfilled, (state, action) => {
                state.defaultAccountId = action.meta.arg;
                sortAccesses(state);
            })
            .addCase(setTransactionCategory.pending, (state, action) => {
                // Optimistic update.
                const { categoryId, transactionId } = action.meta.arg;
                mergeInObject(state.transactionMap, transactionId, { categoryId });
            })
            .addCase(setTransactionCategory.rejected, (state, action) => {
                const { formerCategoryId, transactionId } = action.meta.arg;
                mergeInObject(state.transactionMap, transactionId, {
                    categoryId: formerCategoryId,
                });
            })
            .addCase(setTransactionType.pending, (state, action) => {
                // Optimistic update.
                const { newType, transactionId } = action.meta.arg;
                mergeInObject(state.transactionMap, transactionId, { type: newType });
            })
            .addCase(setTransactionType.rejected, (state, action) => {
                const { formerType, transactionId } = action.meta.arg;
                mergeInObject(state.transactionMap, transactionId, { type: formerType });
            })
            .addCase(setTransactionCustomLabel.pending, (state, action) => {
                // Optimistic update.
                const { customLabel, transaction } = action.meta.arg;
                mergeInObject(state.transactionMap, transaction.id, { customLabel });
            })
            .addCase(setTransactionCustomLabel.rejected, (state, action) => {
                const { transaction } = action.meta.arg;
                const { formerCustomLabel } = action.payload as setTransactionCustomLabelError;
                mergeInObject(state.transactionMap, transaction.id, {
                    customLabel: formerCustomLabel,
                });
            })
            .addCase(setTransactionDate.pending, (state, action) => {
                // Optimistic update.
                const { date, budgetDate, transaction } = action.meta.arg;

                mergeInObject(state.transactionMap, transaction.id, {
                    date,
                    debitDate: date,
                    budgetDate: budgetDate || transaction.budgetDate,
                });

                // Make sure the account's transactions are still sorted.
                const comparator = makeCompareTransactionByIds(state);

                const account = accountById(state, transaction.accountId);
                account.transactionIds.sort(comparator);

                // Make sure the ongoing amount is still right.
                account.outstandingSum = recomputeAccountOutstandingSum(state, account.id);
            })
            .addCase(setTransactionDate.rejected, (state, action) => {
                // Optimistic update.
                const { transaction } = action.meta.arg;
                const { formerDebitDate, formerDate, formerBudgetDate } =
                    action.payload as setTransactionDateError;

                mergeInObject(state.transactionMap, transaction.id, {
                    date: formerDate,
                    debitDate: formerDebitDate,
                    budgetDate: formerBudgetDate,
                });

                // Make sure the account's transactions are still sorted.
                const comparator = makeCompareTransactionByIds(state);

                const account = accountById(state, transaction.accountId);
                account.transactionIds.sort(comparator);

                // Make sure the ongoing amount is still right.
                account.outstandingSum = recomputeAccountOutstandingSum(state, account.id);
            })
            .addCase(setTransactionBudgetDate.pending, (state, action) => {
                // Optimistic update.
                const { budgetDate, transaction } = action.meta.arg;
                mergeInObject(state.transactionMap, transaction.id, { budgetDate });
            })
            .addCase(setTransactionBudgetDate.rejected, (state, action) => {
                const { transaction } = action.meta.arg;
                const { formerBudgetDate } = action.payload as setTransactionBudgetDateError;

                mergeInObject(state.transactionMap, transaction.id, {
                    budgetDate: formerBudgetDate,
                });
            })
            .addCase(applyBulkEdit.fulfilled, (state, action) => {
                const { transactionIds, newFields } = action.payload;
                for (const id of transactionIds) {
                    mergeInObject(state.transactionMap, id, newFields);
                }
            })
            .addCase(updateAndFetchAccess.fulfilled, (state, action) => {
                const { newFields, results } = action.payload;
                assertDefined(results);

                // Remove all the custom fields which have been set to null.
                if (newFields.customFields) {
                    newFields.customFields = newFields.customFields.filter(
                        field => field.value !== null
                    );
                }

                mergeInObject(state.accessMap, results.accessId, newFields);

                finishSync(state, results.accessId, results);

                // Sort accesses in case an access has been re-enabled.
                sortAccesses(state);
            })
            .addCase(SettingsStore.setPair.fulfilled, (state, action) => {
                // Sets whether the ongoing balance should be limited to the current month.
                const { key, value } = action.payload;
                if (key === LIMIT_ONGOING_TO_CURRENT_MONTH) {
                    const doLimit = value === 'true';
                    state.isOngoingLimitedToCurrentMonth = doLimit;

                    // Recompute ongoing balance.
                    for (const accountId in state.accountMap) {
                        if (!state.accountMap.hasOwnProperty(accountId)) {
                            continue;
                        }

                        const account = state.accountMap[accountId];
                        account.outstandingSum = recomputeAccountOutstandingSum(state, account.id);
                    }
                }
            })
            .addCase(CategoriesStore.destroy.fulfilled, (state, action) => {
                const { id: formerCategoryId, replaceById } = action.payload;
                replaceCategoryId(state, formerCategoryId, replaceById);
            })
            .addCase(batch.fulfilled, (state, action) => {
                if (!action.payload.categories) {
                    return;
                }

                const deleted = action.payload.categories.deleted;
                if (
                    typeof deleted !== 'undefined' &&
                    typeof action.meta.arg.categories?.toDelete !== 'undefined'
                ) {
                    for (let i = 0; i < deleted.length; i++) {
                        if (deleted[i].status === BatchStatus.SUCCESS) {
                            const [formerCategoryId, replaceById] =
                                action.meta.arg.categories.toDelete[i];
                            replaceCategoryId(state, formerCategoryId, replaceById);
                        }
                    }
                }
            })
            .addMatcher(
                isAnyOf(runTransactionsSync.fulfilled, runAccountsSync.fulfilled),
                (state, action) => {
                    const { accessId, results } = action.payload;
                    assertDefined(results);
                    finishSync(state, accessId, results);
                }
            )
            .addMatcher(
                isAnyOf(
                    runTransactionsSync.rejected,
                    runAccountsSync.rejected,
                    updateAndFetchAccess.rejected
                ),
                (state, action) => {
                    const { accessId } = action.meta.arg;
                    updateAccessFetchStatus(state, accessId, action.error.code);
                }
            );
    },
});

export const name = banksSlice.name;

export const actions = banksSlice.actions;

export const reducer = banksSlice.reducer;

// Getters

export function getCurrentAccountId(state: BankState): number | null {
    return state.currentAccountId;
}

export function allActiveStaticBanks(state: BankState): Bank[] {
    return state.banks.filter(b => !b.deprecated);
}

export function bankByUuid(state: BankState, uuid: string): Bank {
    const candidate = state.banks.find(bank => bank.uuid === uuid);
    assertDefined(candidate, `unknown bank with id ${uuid}`);
    return candidate;
}

export function getAccessIds(state: BankState): number[] {
    return state.accessIds;
}

export function getAccessMap(state: BankState) {
    return state.accessMap;
}

export function accessExists(state: BankState, accessId: number): boolean {
    return typeof state.accessMap[accessId] !== 'undefined';
}

export function accessById(state: BankState, accessId: number): Access {
    const candidate = state.accessMap[accessId];
    assertDefined(candidate);
    return candidate;
}

export interface AccessTotal {
    total: number;
    formatCurrency: (amount: number) => string;
}

export function computeAccessTotal(
    state: BankState,
    accessId: number
): Record<string, AccessTotal> {
    const totals: Record<string, AccessTotal> = {};

    const accountIds = accountIdsByAccessId(state, accessId);
    for (const accountId of accountIds) {
        const acc = accountById(state, accountId);
        if (!acc.excludeFromBalance && acc.currency) {
            if (!(acc.currency in totals)) {
                totals[acc.currency] = { total: acc.balance, formatCurrency: acc.formatCurrency };
            } else {
                totals[acc.currency].total += acc.balance;
            }
        }
    }

    return totals;
}

export function accountExists(state: BankState, accountId: number): boolean {
    return typeof state.accountMap[accountId] !== 'undefined';
}

export function accountById(state: BankState, accountId: number): Account {
    const candidate = state.accountMap[accountId];
    assertDefined(candidate);
    return candidate;
}

export function accessByAccountId(state: BankState, accountId: number): Access {
    const account = accountById(state, accountId);
    return accessById(state, account.accessId);
}

export function accountIdsByAccessId(state: BankState, accessId: number): number[] {
    return accessById(state, accessId).accountIds;
}

export function transactionExists(state: BankState, transactionId: number) {
    return typeof state.transactionMap[transactionId] !== 'undefined';
}

export function transactionById(state: BankState, transactionId: number): Transaction {
    const transaction = state.transactionMap[transactionId];
    assertDefined(transaction);
    return transaction;
}

export function transactionIdsByAccountId(state: BankState, accountId: number): number[] {
    return accountById(state, accountId).transactionIds;
}

export function transactionsByAccountId(state: BankState, accountId: number): Transaction[] {
    return transactionIdsByAccountId(state, accountId).map(id => {
        const tr = transactionById(state, id);
        assertNotNull(tr);
        return tr;
    });
}

export function transactionIdsByCategoryId(state: BankState, categoryId: number): number[] {
    return Object.values(state.transactionMap)
        .filter(tr => tr.categoryId === categoryId)
        .map(tr => tr.id);
}

export function usedCategoriesSet(state: BankState): Set<number> {
    return new Set(Object.values(state.transactionMap).map(tr => tr.categoryId));
}

export function alertPairsByType(state: BankState, alertType: AlertType) {
    const pairs = [];
    for (const alert of state.alerts.filter(a => a.type === alertType)) {
        const account = accountById(state, alert.accountId);
        pairs.push({ alert, account });
    }
    return pairs;
}

export function getDefaultAccountId(state: BankState): number | null {
    return state.defaultAccountId;
}

export function allTypes(state: BankState): Type[] {
    return state.transactionTypes;
}

export const testing = {
    addAccesses,
    removeAccess,
    addAccounts,
    removeAccount,
    addTransactions,
    removeTransaction,
};
