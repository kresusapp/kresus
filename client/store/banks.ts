import { PayloadAction } from '@reduxjs/toolkit';
import { produce } from 'immer';

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

import * as Ui from './ui';
import * as backend from './backend';
import * as CategoriesStore from './categories';
import * as SettingsStore from './settings';

import {
    createReducerFromMap,
    SUCCESS,
    FAIL,
    createActionCreator,
    actionStatus,
    Action,
    mergeInArray,
    removeInArrayById,
    mergeInObject,
    removeInArray,
} from './helpers';

import {
    CREATE_ACCESS,
    CREATE_ALERT,
    CREATE_TRANSACTION,
    DELETE_ACCESS,
    UPDATE_ACCOUNT,
    DELETE_ACCOUNT,
    DELETE_ALERT,
    DELETE_TRANSACTION,
    MERGE_TRANSACTIONS,
    SET_DEFAULT_ACCOUNT,
    SET_TRANSACTION_CATEGORY,
    SET_TRANSACTION_CUSTOM_LABEL,
    SET_TRANSACTION_TYPE,
    SET_TRANSACTION_DATE,
    SET_TRANSACTION_BUDGET_DATE,
    RUN_ACCOUNTS_SYNC,
    RUN_BALANCE_RESYNC,
    RUN_TRANSACTIONS_SYNC,
    RUN_APPLY_BULKEDIT,
    UPDATE_ALERT,
    UPDATE_ACCESS_AND_FETCH,
    UPDATE_ACCESS,
} from './actions';

import StaticBanks from '../../shared/banks.json';
import { DEFAULT_ACCOUNT_ID, LIMIT_ONGOING_TO_CURRENT_MONTH } from '../../shared/settings';
import { Dispatch } from 'redux';
import { BatchResponse, BatchStatus } from '../../shared/api/batch';
import { batch, BatchParams } from './batch';

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

// A small wrapper to force creating a mutable state from a given state, and
// use the `produce` helper only once.
class MutableState {
    state: BankState;
    constructor(state: BankState) {
        this.state = state;
    }
}

function mutateState(state: BankState, func: (prevState: MutableState) => void): BankState {
    return produce(state, draft => {
        const mutable = new MutableState(draft);
        func(mutable);
        return mutable.state;
    });
}

type SyncResult = {
    accounts?: Account[];
    newTransactions?: Transaction[];
};

// Set a transaction's category.
export function setTransactionCategory(
    transactionId: number,
    categoryId: number,
    formerCategoryId: number
) {
    const serverCategoryId = categoryId === NONE_CATEGORY_ID ? null : categoryId;
    return async (dispatch: Dispatch) => {
        const action = setTransactionCategoryAction({
            transactionId,
            categoryId,
            formerCategoryId,
        });
        dispatch(action);
        try {
            await backend.setCategoryForTransaction(transactionId, serverCategoryId);
            dispatch(actionStatus.ok(action));
        } catch (err) {
            dispatch(actionStatus.err(action, err));
            throw err;
        }
    };
}

type SetTransactionCategoryParams = {
    transactionId: number;
    categoryId: number;
    formerCategoryId: number;
};
const setTransactionCategoryAction =
    createActionCreator<SetTransactionCategoryParams>(SET_TRANSACTION_CATEGORY);

function reduceSetTransactionCategory(
    state: BankState,
    action: Action<SetTransactionCategoryParams>
) {
    if (action.status === SUCCESS) {
        return state;
    }
    // Optimistic update.
    const categoryId = action.status === FAIL ? action.formerCategoryId : action.categoryId;
    return mutateState(state, mut => {
        mergeInObject(mut.state.transactionMap, action.transactionId, { categoryId });
    });
}

// Set a transaction's type.
export function setTransactionType(transactionId: number, newType: string, formerType: string) {
    return async (dispatch: Dispatch) => {
        const action = setTransactionTypeAction({
            transactionId,
            newType,
            formerType,
        });
        dispatch(action);
        try {
            await backend.setTypeForTransaction(transactionId, newType);
            dispatch(actionStatus.ok(action));
        } catch (err) {
            dispatch(actionStatus.err(action, err));
        }
    };
}

type SetTransactionTypeParams = {
    transactionId: number;
    newType: string;
    formerType: string;
};
const setTransactionTypeAction =
    createActionCreator<SetTransactionTypeParams>(SET_TRANSACTION_TYPE);

function reduceSetTransactionType(state: BankState, action: Action<SetTransactionTypeParams>) {
    const { status } = action;
    if (status === SUCCESS) {
        return state;
    }
    // Optimistic update.
    const type = status === FAIL ? action.formerType : action.newType;
    return mutateState(state, mut => {
        mergeInObject(mut.state.transactionMap, action.transactionId, { type });
    });
}

// Set a transaction's custom label.
export function setTransactionCustomLabel(transaction: Transaction, customLabel: string) {
    // The server expects an empty string for deleting the custom label.
    const serverCustomLabel = !customLabel ? '' : customLabel;
    const formerCustomLabel = transaction.customLabel;
    return async (dispatch: Dispatch) => {
        const action = setTransactionCustomLabelAction({
            transactionId: transaction.id,
            customLabel,
            formerCustomLabel,
        });
        dispatch(action);
        try {
            await backend.setCustomLabel(transaction.id, serverCustomLabel);
            dispatch(actionStatus.ok(action));
        } catch (err) {
            dispatch(actionStatus.err(action, err));
        }
    };
}

type SetTransactionCustomLabelParams = {
    transactionId: number;
    customLabel: string;
    formerCustomLabel: string | null;
};
const setTransactionCustomLabelAction = createActionCreator<SetTransactionCustomLabelParams>(
    SET_TRANSACTION_CUSTOM_LABEL
);

function reduceSetTransactionCustomLabel(
    state: BankState,
    action: Action<SetTransactionCustomLabelParams>
) {
    const { status } = action;
    if (status === SUCCESS) {
        return state;
    }
    // Optimistic update.
    const customLabel = status === FAIL ? action.formerCustomLabel : action.customLabel;
    return mutateState(state, mut => {
        mergeInObject(mut.state.transactionMap, action.transactionId, { customLabel });
    });
}

// Set a transaction's date.
export function setTransactionDate(
    transaction: Transaction,
    date: Date | null,
    budgetDate: Date | null
) {
    return async (dispatch: Dispatch) => {
        const action = setTransactionDateAction({
            transactionId: transaction.id,
            date: date || transaction.date,
            // Keep debitDate synchronized with the date.
            debitDate: date || transaction.date,
            budgetDate: budgetDate || transaction.budgetDate,
            formerDate: transaction.date,
            formerBudgetDate: transaction.budgetDate,
        });
        dispatch(action);
        try {
            await backend.setTransactionDate(transaction.id, date, budgetDate);
            dispatch(actionStatus.ok(action));
        } catch (err) {
            dispatch(actionStatus.err(action, err));
        }
    };
}

// Set a transaction's budget date.
export function setTransactionBudgetDate(transaction: Transaction, budgetDate: Date | null) {
    return async (dispatch: Dispatch) => {
        const action = setTransactionBudgetDateAction({
            transactionId: transaction.id,
            budgetDate,
            formerBudgetDate: transaction.budgetDate,
        });
        dispatch(action);
        try {
            await backend.setTransactionBudgetDate(transaction.id, budgetDate);
            dispatch(actionStatus.ok(action));
        } catch (err) {
            dispatch(actionStatus.err(action, err));
        }
    };
}

type SetTransactionDateParams = {
    transactionId: number;
    date: Date;
    debitDate: Date;
    budgetDate: Date | null;
    formerDate: Date;
    formerBudgetDate: Date | null;
};
const setTransactionDateAction =
    createActionCreator<SetTransactionDateParams>(SET_TRANSACTION_DATE);

function reduceSetTransactionDate(state: BankState, action: Action<SetTransactionDateParams>) {
    const { status } = action;
    if (status === SUCCESS) {
        return state;
    }
    // Optimistic update.
    const date: Date = status === FAIL ? action.formerDate : action.date;
    const budgetDate: Date | null = status === FAIL ? action.formerBudgetDate : action.budgetDate;
    return mutateState(state, mut => {
        mergeInObject(mut.state.transactionMap, action.transactionId, {
            date,
            debitDate: date,
            budgetDate,
        });

        // Make sure the account's transactions are still sorted.
        const comparator = makeCompareTransactionByIds(mut.state);

        const tr = transactionById(mut.state, action.transactionId);
        const account = accountById(mut.state, tr.accountId);
        account.transactionIds.sort(comparator);

        // Make sure the ongoing amount is still right.
        const doLimit = mut.state.isOngoingLimitedToCurrentMonth;
        const onGoingTransactions = transactionsByAccountId(mut.state, account.id).filter(
            transaction => shouldIncludeInOutstandingSum(transaction, doLimit)
        );
        account.outstandingSum = onGoingTransactions.reduce((a, b) => a + b.amount, 0);
    });
}

type SetTransactionBudgetDateParams = {
    transactionId: number;
    budgetDate: Date | null;
    formerBudgetDate: Date | null;
};
const setTransactionBudgetDateAction = createActionCreator<SetTransactionBudgetDateParams>(
    SET_TRANSACTION_BUDGET_DATE
);

function reduceSetTransactionBudgetDate(
    state: BankState,
    action: Action<SetTransactionBudgetDateParams>
) {
    const { status } = action;
    if (status === SUCCESS) {
        return state;
    }
    // Optimistic update.
    const budgetDate: Date | null = status === FAIL ? action.formerBudgetDate : action.budgetDate;
    return mutateState(state, mut => {
        mergeInObject(mut.state.transactionMap, action.transactionId, { budgetDate });
    });
}

// Fetches all the transactions for the given access through the bank's
// provider.
export function runTransactionsSync(
    accessId: number,
    userActionFields: FinishUserActionFields | null = null
) {
    return async (dispatch: Dispatch) => {
        const action = syncTransactionsAction({
            accessId,
        });
        dispatch(action);
        try {
            const results = await backend.getNewTransactions(accessId, userActionFields);
            if (
                maybeHandleUserAction(dispatch, results, (fields: FinishUserActionFields) =>
                    runTransactionsSync(accessId, fields)
                )
            ) {
                return;
            }
            action.results = results;
            dispatch(actionStatus.ok(action));
        } catch (err) {
            dispatch(actionStatus.err(action, err));
            throw err;
        }
    };
}

type SyncTransactionsParams = {
    accessId: number;
    results?: SyncResult;
};
const syncTransactionsAction = createActionCreator<SyncTransactionsParams>(RUN_TRANSACTIONS_SYNC);

function reduceRunTransactionsSync(state: BankState, action: Action<SyncTransactionsParams>) {
    if (action.status === SUCCESS) {
        const { results, accessId } = action;
        return mutateState(state, mut => {
            assertDefined(results);
            finishSync(mut, accessId, results);
        });
    }
    if (action.status === FAIL) {
        const { err, accessId } = action;
        return mutateState(state, mut => {
            updateAccessFetchStatus(mut, accessId, err.code);
        });
    }
    return state;
}

// Fetches the accounts and transactions for a given access.
export function runAccountsSync(
    accessId: number,
    userActionFields: FinishUserActionFields | null = null
) {
    return async (dispatch: Dispatch) => {
        const action = syncAccountsAction({ accessId });
        dispatch(action);
        try {
            const results = await backend.getNewAccounts(accessId, userActionFields);
            if (
                maybeHandleUserAction(dispatch, results, fields =>
                    runAccountsSync(accessId, fields)
                )
            ) {
                return;
            }
            action.results = results;
            dispatch(actionStatus.ok(action));
        } catch (err) {
            dispatch(actionStatus.err(action, err));
            throw err;
        }
    };
}

type SyncAccountsParams = {
    accessId: number;
    results?: SyncResult;
};
const syncAccountsAction = createActionCreator<SyncAccountsParams>(RUN_ACCOUNTS_SYNC);

function reduceRunAccountsSync(state: BankState, action: Action<SyncAccountsParams>) {
    if (action.status === SUCCESS) {
        const { accessId, results } = action;
        assertDefined(results);
        return mutateState(state, mut => {
            finishSync(mut, accessId, results);
        });
    }
    if (action.status === FAIL) {
        const { err, accessId } = action;
        return mutateState(state, mut => {
            updateAccessFetchStatus(mut, accessId, err.code);
        });
    }
    return state;
}

// Apply a bulk edit to a group of transactions.
export function applyBulkEdit(newFields: BulkEditFields, transactionIds: number[]) {
    const serverNewFields: {
        customLabel?: string | null;
        categoryId?: number | null;
        type?: string;
    } = { ...newFields };
    serverNewFields.categoryId =
        serverNewFields.categoryId === NONE_CATEGORY_ID ? null : serverNewFields.categoryId;

    return async (dispatch: Dispatch) => {
        const action = bulkEditAction({ transactionIds, fields: newFields });
        dispatch(action);
        try {
            await Promise.all(
                transactionIds.map(id => backend.updateTransaction(id, serverNewFields))
            );
            dispatch(actionStatus.ok(action));
        } catch (err) {
            dispatch(actionStatus.err(action, err));
            throw err;
        }
    };
}

export type BulkEditFields = {
    customLabel?: string | null;
    categoryId?: number;
    type?: string;
};

type BulkEditParams = {
    fields: BulkEditFields;
    transactionIds: number[];
};
const bulkEditAction = createActionCreator<BulkEditParams>(RUN_APPLY_BULKEDIT);

function reduceRunApplyBulkEdit(state: BankState, action: Action<BulkEditParams>) {
    const { status } = action;
    if (status === SUCCESS) {
        const { transactionIds, fields } = action;
        return mutateState(state, mut => {
            for (const id of transactionIds) {
                mergeInObject(mut.state.transactionMap, id, fields);
            }
        });
    }
    return state;
}

// Creates a new transaction.
export function createTransaction(transaction: Partial<Transaction>) {
    let serverTransaction: PartialTransaction = transaction;
    if (transaction.categoryId === NONE_CATEGORY_ID) {
        serverTransaction = { ...transaction, categoryId: null };
    }

    return async (dispatch: Dispatch) => {
        const action = createTransactionAction({});
        dispatch(action);
        try {
            action.created = await backend.createTransaction(serverTransaction);
            dispatch(actionStatus.ok(action));
        } catch (err) {
            dispatch(actionStatus.err(action, err));
            throw err;
        }
    };
}

type CreateTransactionParams = {
    created?: {
        transaction: Transaction;
        accountBalance: number;
        accountId: number;
    };
};
const createTransactionAction = createActionCreator<CreateTransactionParams>(CREATE_TRANSACTION);

function reduceCreateTransaction(state: BankState, action: Action<CreateTransactionParams>) {
    const { status } = action;
    if (status === SUCCESS) {
        const { created } = action;
        assertDefined(created);
        return mutateState(state, mut => {
            addTransactions(mut, [created.transaction]);
            updateAccountBalance(mut, created.accountId, created.accountBalance);
        });
    }
    return state;
}

// Deletes a given transaction.
export function deleteTransaction(transactionId: number) {
    return async (dispatch: Dispatch) => {
        const action = deleteTransactionAction({});
        dispatch(action);
        try {
            action.deleted = await backend.deleteTransaction(transactionId);
            if (action.deleted) {
                action.deleted.transactionId = transactionId;
            }
            dispatch(actionStatus.ok(action));
        } catch (err) {
            dispatch(actionStatus.err(action, err));
            throw err;
        }
    };
}

type DeleteTransactionParams = {
    deleted?: {
        transactionId: number;
        accountBalance?: number;
        accountId: number;
    };
};
const deleteTransactionAction = createActionCreator<DeleteTransactionParams>(DELETE_TRANSACTION);

function reduceDeleteTransaction(state: BankState, action: Action<DeleteTransactionParams>) {
    const { status } = action;
    if (status === SUCCESS) {
        const { deleted } = action;
        assertDefined(deleted);

        return mutateState(state, mut => {
            removeTransaction(mut, deleted.transactionId);

            if (typeof deleted.accountBalance === 'number') {
                updateAccountBalance(mut, deleted.accountId, deleted.accountBalance);
            }
        });
    }
    return state;
}

// Merges two transactions together.
export function mergeTransactions(toKeep: Transaction, toRemove: Transaction) {
    return async (dispatch: Dispatch) => {
        const action = mergeTransactionAction({ toKeep, toRemove });
        dispatch(action);
        try {
            const {
                transaction: newToKeep,
                accountId,
                accountBalance,
            } = await backend.mergeTransactions(toKeep.id, toRemove.id);
            action.toKeep = newToKeep;
            action.accountId = accountId;
            action.accountBalance = accountBalance;
            dispatch(actionStatus.ok(action));
        } catch (err) {
            dispatch(actionStatus.err(action, err));
            throw err;
        }
    };
}

type MergeTransactionParams = {
    toKeep: Transaction;
    toRemove: Transaction;
    accountBalance?: number;
    accountId?: number;
};
const mergeTransactionAction = createActionCreator<MergeTransactionParams>(MERGE_TRANSACTIONS);

function reduceMergeTransactions(state: BankState, action: Action<MergeTransactionParams>) {
    const { status } = action;
    if (status === SUCCESS) {
        return mutateState(state, mut => {
            // Remove the former transaction:
            removeTransaction(mut, action.toRemove.id);
            // Replace the kept one:
            const newKept = new Transaction(action.toKeep);
            mergeInObject(mut.state.transactionMap, action.toKeep.id, newKept);

            if (action.accountId && typeof action.accountBalance === 'number') {
                updateAccountBalance(mut, action.accountId, action.accountBalance);
            }
        });
    }
    return state;
}

// Creates a new access.
export function createAccess(
    {
        uuid,
        login,
        password,
        fields,
        customLabel,
        shouldCreateDefaultAlerts,
    }: {
        uuid: string;
        login: string;
        password: string;
        fields: AccessCustomField[];
        customLabel: string | null;
        shouldCreateDefaultAlerts: boolean;
    },
    userActionFields: FinishUserActionFields | null = null
) {
    return async (dispatch: Dispatch) => {
        const action = createAccessAction({
            uuid,
            login,
            fields,
            customLabel,
        });
        dispatch(action);

        try {
            const results = await backend.createAccess(
                uuid,
                login,
                password,
                fields,
                customLabel,
                userActionFields
            );

            if (
                maybeHandleUserAction(dispatch, results, filledActionFields =>
                    createAccess(
                        {
                            uuid,
                            login,
                            password,
                            fields,
                            customLabel,
                            shouldCreateDefaultAlerts,
                        },
                        filledActionFields
                    )
                )
            ) {
                return;
            }

            action.results = results;
            dispatch(actionStatus.ok(action));
            if (shouldCreateDefaultAlerts) {
                await createDefaultAlerts(results.accounts)(dispatch);
            }
        } catch (err) {
            dispatch(actionStatus.err(action, err));
            throw err;
        }
    };
}

type CreateAccessParams = {
    uuid: string;
    login: string;
    fields: AccessCustomField[];
    customLabel: string | null;
    results?: SyncResult & { accessId: number; label: string };
};
const createAccessAction = createActionCreator<CreateAccessParams>(CREATE_ACCESS);

function reduceCreateAccess(state: BankState, action: Action<CreateAccessParams>) {
    const { status } = action;
    if (status === SUCCESS) {
        const { results, uuid, login, fields, customLabel } = action;
        assertDefined(results);

        return mutateState(state, mut => {
            const access = {
                id: results.accessId,
                vendorId: uuid,
                login,
                fields,
                label: results.label,
                customLabel,
                enabled: true,
            };

            const { accounts, newTransactions } = results;

            // A new access must have an account and a transaction array (even
            // if it's empty).
            assertDefined(accounts);
            assertDefined(newTransactions);

            addAccesses(mut, [access], accounts, newTransactions);
        });
    }
    return state;
}

// Deletes the given access.
export function deleteAccess(accessId: number) {
    return async (dispatch: Dispatch) => {
        const action = deleteAccessAction({ accessId });
        dispatch(action);
        try {
            await backend.deleteAccess(accessId);
            dispatch(actionStatus.ok(action));
        } catch (err) {
            dispatch(actionStatus.err(action, err));
            throw err;
        }
    };
}

type DeleteAccessParams = {
    accessId: number;
};
const deleteAccessAction = createActionCreator<DeleteAccessParams>(DELETE_ACCESS);

function reduceDeleteAccess(state: BankState, action: Action<DeleteAccessParams>) {
    const { accessId, status } = action;
    if (status === SUCCESS) {
        return mutateState(state, mut => {
            removeAccess(mut, accessId);
        });
    }
    return state;
}

// Resyncs the balance of the given account according to the real balance read
// from a provider.
export function resyncBalance(
    accountId: number,
    userActionFields: FinishUserActionFields | null = null
) {
    return async (dispatch: Dispatch) => {
        const action = resyncBalanceAction({ accountId });
        dispatch(action);
        try {
            const results = await backend.resyncBalance(accountId, userActionFields);
            if (
                maybeHandleUserAction(dispatch, results, fields => resyncBalance(accountId, fields))
            ) {
                return;
            }
            action.initialBalance = results.initialBalance;
            action.balance = results.balance;
            dispatch(actionStatus.ok(action));
        } catch (err) {
            dispatch(actionStatus.err(action, err));
        }
    };
}

type ResyncBalanceParams = { accountId: number; initialBalance?: number; balance?: number };
const resyncBalanceAction = createActionCreator<ResyncBalanceParams>(RUN_BALANCE_RESYNC);

function reduceResyncBalance(state: BankState, action: Action<ResyncBalanceParams>) {
    if (action.status === SUCCESS) {
        const { accountId, initialBalance, balance } = action;
        assertDefined(initialBalance);
        return mutateState(state, mut => {
            mergeInObject(mut.state.accountMap, accountId, { initialBalance, balance });
        });
    }

    if (action.status === FAIL) {
        const { accountId, err } = action;
        return mutateState(state, mut => {
            const access = accessByAccountId(mut.state, accountId);
            assertNotNull(access);
            const { id: accessId } = access;
            updateAccessFetchStatus(mut, accessId, err.code);
        });
    }

    return state;
}

// Updates the account with the given fields.
// Does not trigger a sync.
export function updateAccount(
    accountId: number,
    newFields: Partial<Account>,
    prevFields: Partial<Account>
) {
    return async (dispatch: Dispatch) => {
        const action = updateAccountAction({
            accountId,
            newFields,
            prevFields,
        });
        dispatch(action);
        try {
            const updated = await backend.updateAccount(accountId, newFields);
            action.newFields = updated;
            dispatch(actionStatus.ok(action));
        } catch (err) {
            dispatch(actionStatus.err(action, err));
            throw err;
        }
    };
}

type UpdateAccountParams = {
    accountId: number;
    newFields: Partial<Account>;
    prevFields: Partial<Account>;
};
const updateAccountAction = createActionCreator<UpdateAccountParams>(UPDATE_ACCOUNT);

function reduceUpdateAccount(state: BankState, action: Action<UpdateAccountParams>) {
    const { status, newFields, prevFields, accountId } = action;

    // Optimistic update.
    if (status === SUCCESS) {
        return state;
    }

    const fields = status === FAIL ? prevFields : newFields;

    return mutateState(state, mut => {
        // Update fields in the object.
        mergeInObject(mut.state.accountMap, accountId, fields);

        // Ensure accounts are still sorted.
        const access = accessByAccountId(mut.state, accountId);
        access.accountIds.sort(makeCompareAccountIds(mut.state));
    });
}

// Deletes an account and all its transactions.
export function deleteAccount(accountId: number) {
    return async (dispatch: Dispatch) => {
        const action = deleteAccountAction({ accountId });
        dispatch(action);
        try {
            await backend.deleteAccount(accountId);
            dispatch(actionStatus.ok(action));
        } catch (err) {
            dispatch(actionStatus.err(action, err));
            throw err;
        }
    };
}

type DeleteAccountParams = {
    accountId: number;
};
const deleteAccountAction = createActionCreator<DeleteAccountParams>(DELETE_ACCOUNT);

function reduceDeleteAccount(state: BankState, action: Action<DeleteAccountParams>) {
    const { accountId, status } = action;
    if (status === SUCCESS) {
        return mutateState(state, mut => {
            removeAccount(mut, accountId);
        });
    }
    return state;
}

// Creates a new alert.
export function createAlert(newAlert: Partial<Alert>) {
    return async (dispatch: Dispatch) => {
        const action = createAlertAction({ alert: newAlert });
        dispatch(action);
        try {
            const created = await backend.createAlert(newAlert);
            action.alert = created;
            dispatch(actionStatus.ok(action));
        } catch (err) {
            dispatch(actionStatus.err(action, err));
            throw err;
        }
    };
}

type CreateAlertParams = {
    alert: Partial<Alert>;
};
const createAlertAction = createActionCreator<CreateAlertParams>(CREATE_ALERT);

function reduceCreateAlert(state: BankState, action: Action<CreateAlertParams>) {
    const { status } = action;
    if (status === SUCCESS) {
        const a = new Alert(action.alert);
        return mutateState(state, mut => {
            mut.state.alerts.push(a);
        });
    }
    return state;
}

// Updates an alert's fields.
export function updateAlert(alertId: number, fields: Partial<Alert>) {
    return async (dispatch: Dispatch) => {
        const action = updateAlertAction({
            alertId,
            fields,
        });
        dispatch(action);
        try {
            await backend.updateAlert(alertId, fields);
            dispatch(actionStatus.ok(action));
        } catch (err) {
            dispatch(actionStatus.err(action, err));
            throw err;
        }
    };
}

type UpdateAlertParams = {
    alertId: number;
    fields: Partial<Alert>;
};
const updateAlertAction = createActionCreator<UpdateAlertParams>(UPDATE_ALERT);

function reduceUpdateAlert(state: BankState, action: Action<UpdateAlertParams>) {
    const { status } = action;
    if (status === SUCCESS) {
        const { fields, alertId } = action;
        return mutateState(state, mut => {
            mergeInArray(mut.state.alerts, alertId, fields);
        });
    }
    return state;
}

// Deletes an alert.
export function deleteAlert(alertId: number) {
    return async (dispatch: Dispatch) => {
        const action = deleteAlertAction({ alertId });
        dispatch(action);
        try {
            await backend.deleteAlert(alertId);
            dispatch(actionStatus.ok(action));
        } catch (err) {
            dispatch(actionStatus.err(action, err));
            throw err;
        }
    };
}

type DeleteAlertParams = {
    alertId: number;
};
const deleteAlertAction = createActionCreator<DeleteAlertParams>(DELETE_ALERT);

function reduceDeleteAlert(state: BankState, action: Action<DeleteAlertParams>) {
    const { status } = action;
    if (status === SUCCESS) {
        const { alertId } = action;
        return mutateState(state, mut => {
            removeInArrayById(mut.state.alerts, alertId);
        });
    }
    return state;
}

// Sets the default account to the given account id.
export function setDefaultAccountId(accountId: number | null) {
    return async (dispatch: Dispatch) => {
        const action = setDefaultAccountAction({ accountId });
        dispatch(action);
        try {
            await backend.saveSetting(
                DEFAULT_ACCOUNT_ID,
                accountId !== null ? accountId.toString() : null
            );
            dispatch(actionStatus.ok(action));
        } catch (err) {
            dispatch(actionStatus.err(action, err));
            throw err;
        }
    };
}

type SetDefaultAccountParams = {
    accountId: number | null;
};
const setDefaultAccountAction = createActionCreator<SetDefaultAccountParams>(SET_DEFAULT_ACCOUNT);

function reduceSetDefaultAccount(state: BankState, action: Action<SetDefaultAccountParams>) {
    if (action.status === SUCCESS) {
        return mutateState(state, mut => {
            mut.state.defaultAccountId = action.accountId;
            sortAccesses(mut);
        });
    }
    return state;
}

// Sets whether the ongoing balance should be limited to the current month.
function reduceSetIsOngoingLimitedToCurrentMonth(
    state: BankState,
    action: PayloadAction<SettingsStore.KeyValue>
) {
    const { key, value } = action.payload;
    if (key === LIMIT_ONGOING_TO_CURRENT_MONTH) {
        return mutateState(state, mut => {
            const doLimit = value === 'true';
            mut.state.isOngoingLimitedToCurrentMonth = doLimit;

            // Recompute ongoing balance.
            for (const accountId in mut.state.accountMap) {
                if (!mut.state.accountMap.hasOwnProperty(accountId)) {
                    continue;
                }

                const account = mut.state.accountMap[accountId];
                const onGoingTransactions = transactionsByAccountId(state, account.id).filter(
                    transaction => shouldIncludeInOutstandingSum(transaction, doLimit)
                );
                account.outstandingSum = onGoingTransactions.reduce((a, b) => a + b.amount, 0);
            }
        });
    }
    return state;
}

// Updates the access' fields and runs a sync. Must be used when the login,
// password, custom fields have changed.
export function updateAndFetchAccess(
    accessId: number,
    login: string,
    password: string,
    customFields: AccessCustomField[],
    userActionFields: FinishUserActionFields | null = null
) {
    const newFields = {
        login,
        customFields,
    };

    return async (dispatch: Dispatch) => {
        const action = updateFetchAccessAction({ accessId, newFields });
        dispatch(action);
        try {
            const results = await backend.updateAndFetchAccess(
                accessId,
                { password, ...newFields },
                userActionFields
            );

            if (
                maybeHandleUserAction(dispatch, results, fields =>
                    updateAndFetchAccess(accessId, login, password, customFields, fields)
                )
            ) {
                return;
            }

            results.accessId = accessId;

            action.newFields.enabled = true;
            action.results = results;
            dispatch(actionStatus.ok(action));
        } catch (err) {
            dispatch(actionStatus.err(action, err));
            throw err;
        }
    };
}

type UpdateFetchAccessParams = {
    accessId: number;
    newFields: Partial<Access>;
    results?: SyncResult;
};
const updateFetchAccessAction =
    createActionCreator<UpdateFetchAccessParams>(UPDATE_ACCESS_AND_FETCH);

function reduceUpdateAccessAndFetch(state: BankState, action: Action<UpdateFetchAccessParams>) {
    if (action.status === SUCCESS) {
        const { accessId, newFields, results } = action;
        assertDefined(results);
        return mutateState(state, mut => {
            // Remove all the custom fields which have been set to null.
            if (newFields.customFields) {
                newFields.customFields = newFields.customFields.filter(
                    field => field.value !== null
                );
            }

            mergeInObject(mut.state.accessMap, accessId, newFields);

            finishSync(mut, accessId, results);

            // Sort accesses in case an access has been re-enabled.
            sortAccesses(mut);
        });
    }

    if (action.status === FAIL) {
        const { accessId, err } = action;
        return mutateState(state, mut => {
            updateAccessFetchStatus(mut, accessId, err.code);
        });
    }

    return state;
}

// Updates some access' fields without retriggering a sync.
export function updateAccess(
    accessId: number,
    newFields: Partial<Access>,
    prevFields: Partial<Access>
) {
    return async (dispatch: Dispatch) => {
        const action = updateAccessAction({ accessId, newFields });
        dispatch(action);
        try {
            await backend.updateAccess(accessId, newFields);
            dispatch(actionStatus.ok(action));
        } catch (err) {
            action.newFields = prevFields;
            dispatch(actionStatus.err(action, err));
        }
    };
}

export function disableAccess(accessId: number) {
    return updateAccess(accessId, { enabled: false }, { enabled: true });
}

type UpdateAccessParams = {
    accessId: number;
    newFields: Partial<Access>;
};
const updateAccessAction = createActionCreator<UpdateAccessParams>(UPDATE_ACCESS);

function reduceUpdateAccess(state: BankState, action: Action<UpdateAccessParams>) {
    const { status } = action;
    // Optimistic update.
    if (status === SUCCESS) {
        return state;
    }
    const { accessId, newFields } = action;
    return mutateState(state, mut => {
        mergeInObject(mut.state.accessMap, accessId, newFields);
        sortAccesses(mut);
    });
}

function createDefaultAlerts(accounts: Account[]) {
    return async (dispatch: Dispatch) => {
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
                    return createAlert(merged)(dispatch);
                })
            );
        }
    };
}

export type FinishUserActionFields = Record<string, string>;
export type FinishUserAction = (
    fields: FinishUserActionFields
) => (dispatch: Dispatch) => Promise<void>;

function maybeHandleUserAction(
    dispatch: Dispatch,
    results: UserActionResponse | { kind: undefined },
    finishAction: FinishUserAction
) {
    if (typeof results.kind === 'undefined') {
        return false;
    }
    assert(results.kind === 'user_action', 'must have thrown a user action');
    switch (results.actionKind) {
        case 'decoupled_validation':
            assertDefined(results.message);
            dispatch(Ui.requestUserAction(finishAction, results.message, null));
            break;
        case 'browser_question':
            assertDefined(results.fields);
            dispatch(Ui.requestUserAction(finishAction, null, results.fields));
            break;
        default:
            assert(false, `unknown user action ${results.actionKind}`);
    }
    return true;
}

// State mutators.

function finishSync(mut: MutableState, accessId: number, results: SyncResult): void {
    const { accounts = [], newTransactions = [] } = results;

    // If finishSync is called, everything went well.
    updateAccessFetchStatus(mut, accessId, FETCH_STATUS_SUCCESS);

    if (accounts.length) {
        // addAccounts also handles transactions.
        addAccounts(mut, accounts, newTransactions);
    } else {
        addTransactions(mut, newTransactions);
    }
}

function updateAccessFetchStatus(
    mut: MutableState,
    accessId: number,
    errCode: string | null = null
): void {
    // If the errCode is null, this means this is not a fetchStatus.
    if (errCode !== null) {
        mergeInObject(mut.state.accessMap, accessId, { fetchStatus: errCode });
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

function updateAccountBalance(mut: MutableState, accountId: number, accountBalance: number): void {
    mergeInObject(mut.state.accountMap, accountId, { balance: accountBalance });
}

function addTransactions(mut: MutableState, transactions: Partial<Transaction>[]): void {
    const accountsToSort = new Set<Account>();
    const limitOngoingToCurrentMonth = mut.state.isOngoingLimitedToCurrentMonth;

    for (const tr of transactions) {
        const transaction = new Transaction(tr);

        const account = accountById(mut.state, transaction.accountId);
        accountsToSort.add(account);

        account.transactionIds.push(transaction.id);

        // Do not include it in the balance, this should be computed by the server.

        if (shouldIncludeInOutstandingSum(transaction, limitOngoingToCurrentMonth)) {
            account.outstandingSum += transaction.amount;
        }

        mut.state.transactionMap[transaction.id] = transaction;
    }

    // Ensure transactions are still sorted.
    const comparator = makeCompareTransactionByIds(mut.state);
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

function setCurrentAccount(mut: MutableState): void {
    const defaultAccountId = getDefaultAccountId(mut.state);

    // The initial account id is:
    // 1. the current account id, if defined.
    // 2. the first account of the first access, if it exists.
    // 3. null otherwise
    let current;
    if (defaultAccountId !== null) {
        current = defaultAccountId;
    } else if (mut.state.accessIds.length > 0) {
        current = accountIdsByAccessId(mut.state, mut.state.accessIds[0])[0];
    } else {
        current = null;
    }

    mut.state.currentAccountId = current;
}

function addAccounts(
    mut: MutableState,
    accounts: Partial<Account>[],
    transactions: Partial<Transaction>[]
): void {
    if (accounts.length === 0) {
        return;
    }

    const defaultCurrency = mut.state.defaultCurrency;

    const accessesToSort = new Set<Access>();

    for (const account of accounts) {
        assertDefined(account.accessId);
        assertDefined(account.id);

        // Only add account to the access list if it does not already exist.
        const access = accessById(mut.state, account.accessId);
        if (!access.accountIds.includes(account.id)) {
            access.accountIds.push(account.id);
            accessesToSort.add(access);
        }

        // Always update the account content.
        const prevAccount = mut.state.accountMap[account.id];
        if (typeof prevAccount === 'undefined') {
            mut.state.accountMap[account.id] = new Account(account, defaultCurrency);
        } else {
            mergeInObject(
                mut.state.accountMap,
                account.id,
                Account.updateFrom(account, defaultCurrency, prevAccount)
            );
        }
    }

    // Ensure accounts are still sorted in each access.
    const comparator = makeCompareAccountIds(mut.state);
    for (const access of accessesToSort) {
        access.accountIds.sort(comparator);
    }

    // If there was no current account id, set one.
    if (getCurrentAccountId(mut.state) === null) {
        setCurrentAccount(mut);
    }

    addTransactions(mut, transactions);
}

function sortAccesses(mut: MutableState): void {
    const accessIds = getAccessIds(mut.state);

    const defaultAccountId = getDefaultAccountId(mut.state);
    const defaultAccessId =
        defaultAccountId === null ? null : accessByAccountId(mut.state, defaultAccountId).id;

    accessIds.sort((ida: number, idb: number) => {
        const a = accessById(mut.state, ida);
        const b = accessById(mut.state, idb);

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
    mut: MutableState,
    accesses: Partial<Access>[],
    accounts: Partial<Account>[],
    transactions: Partial<Transaction>[]
): void {
    const bankDescs = mut.state.banks;
    for (const partialAccess of accesses) {
        const access = new Access(partialAccess, bankDescs);
        mut.state.accessMap[access.id] = access;
        mut.state.accessIds.push(access.id);
    }

    addAccounts(mut, accounts, transactions);

    sortAccesses(mut);
}

function removeAccess(mut: MutableState, accessId: number): void {
    const access = accessById(mut.state, accessId);

    assert(access.accountIds.length > 0, 'access should have at least one account');

    // First remove all the accounts attached to the access.
    //
    // Copy the items to avoid iterating on an array that's being mutated under
    // the rug.
    const accountIds = access.accountIds.slice();
    for (const accountId of accountIds) {
        removeAccount(mut, accountId);
    }

    assert(
        typeof mut.state.accessMap[accessId] === 'undefined',
        'last removeAccount should have removed the access (accessMap)'
    );
    assert(
        !mut.state.accessIds.includes(accessId),
        'last removeAccount should have removed the access (accessIds)'
    );
}

function removeAccount(mut: MutableState, accountId: number): void {
    const account = accountById(mut.state, accountId);

    // First remove the attached transactions from the transaction map.
    for (const id of account.transactionIds) {
        assertDefined(mut.state.transactionMap[id]);
        delete mut.state.transactionMap[id];
    }

    // Then remove the account from the access.
    const access = accessById(mut.state, account.accessId);
    removeInArray(access.accountIds, accountId);

    // Reset the defaultAccountId if we just deleted it.
    if (getDefaultAccountId(mut.state) === accountId) {
        mut.state.defaultAccountId = null;
    }

    // Remove access if there's no accounts in the access.
    if (access.accountIds.length === 0) {
        assertDefined(mut.state.accessMap[account.accessId]);
        delete mut.state.accessMap[account.accessId];
        removeInArray(mut.state.accessIds, account.accessId);
        // Sort accesses in case the default account has been deleted.
        sortAccesses(mut);
    }

    // Reset the current account id if we just deleted it.
    if (getCurrentAccountId(mut.state) === accountId) {
        setCurrentAccount(mut);
    }

    // Remove alerts attached to the account.
    mut.state.alerts = mut.state.alerts.filter((alert: Alert) => alert.accountId !== accountId);

    // Finally, remove the account from the accounts map.
    delete mut.state.accountMap[accountId];
}

function removeTransaction(mut: MutableState, transactionId: number): void {
    const tr = transactionById(mut.state, transactionId);
    const account = accountById(mut.state, tr.accountId);
    const limitOngoingToCurrentMonth = mut.state.isOngoingLimitedToCurrentMonth;

    let { outstandingSum } = account;

    // Do not remove it from the balance, this should be computed by the server.

    if (shouldIncludeInOutstandingSum(tr, limitOngoingToCurrentMonth)) {
        outstandingSum -= tr.amount;
    }

    mergeInObject(mut.state.accountMap, account.id, {
        transactionIds: account.transactionIds.filter(id => id !== transactionId),
        outstandingSum,
    });

    delete mut.state.transactionMap[transactionId];
}

// Reducers on external actions.
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

function reduceDeleteCategory(
    state: BankState,
    action: PayloadAction<CategoriesStore.DeleteCategoryParams>
) {
    const { id: formerCategoryId, replaceById } = action.payload;
    return mutateState(state, mut => {
        replaceCategoryId(mut.state, formerCategoryId, replaceById);
    });
}

function reduceBatch(
    state: BankState,
    action: PayloadAction<BatchResponse, string, { arg: BatchParams }>
) {
    return mutateState(state, mut => {
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
                    const [formerCategoryId, replaceById] = action.meta.arg.categories.toDelete[i];
                    replaceCategoryId(mut.state, formerCategoryId, replaceById);
                }
            }
        }
    });
}

// Mapping of actions => reducers.
const reducers = {
    [CREATE_ACCESS]: reduceCreateAccess,
    [CREATE_ALERT]: reduceCreateAlert,
    [CREATE_TRANSACTION]: reduceCreateTransaction,
    [DELETE_ACCESS]: reduceDeleteAccess,
    [DELETE_ACCOUNT]: reduceDeleteAccount,
    [DELETE_ALERT]: reduceDeleteAlert,
    [CategoriesStore.destroy.fulfilled.toString()]: reduceDeleteCategory,
    [batch.fulfilled.toString()]: reduceBatch,
    [DELETE_TRANSACTION]: reduceDeleteTransaction,
    [MERGE_TRANSACTIONS]: reduceMergeTransactions,
    [RUN_ACCOUNTS_SYNC]: reduceRunAccountsSync,
    [RUN_APPLY_BULKEDIT]: reduceRunApplyBulkEdit,
    [RUN_BALANCE_RESYNC]: reduceResyncBalance,
    [RUN_TRANSACTIONS_SYNC]: reduceRunTransactionsSync,
    [SET_DEFAULT_ACCOUNT]: reduceSetDefaultAccount,
    [SettingsStore.setPair.fulfilled.toString()]: reduceSetIsOngoingLimitedToCurrentMonth,
    [SET_TRANSACTION_DATE]: reduceSetTransactionDate,
    [SET_TRANSACTION_BUDGET_DATE]: reduceSetTransactionBudgetDate,
    [SET_TRANSACTION_CATEGORY]: reduceSetTransactionCategory,
    [SET_TRANSACTION_CUSTOM_LABEL]: reduceSetTransactionCustomLabel,
    [SET_TRANSACTION_TYPE]: reduceSetTransactionType,
    [UPDATE_ACCESS]: reduceUpdateAccess,
    [UPDATE_ACCESS_AND_FETCH]: reduceUpdateAccessAndFetch,
    [UPDATE_ACCOUNT]: reduceUpdateAccount,
    [UPDATE_ALERT]: reduceUpdateAlert,
};

export const reducer = createReducerFromMap(reducers);

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

// Initial state.
export function initialState(
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
        alerts: [],

        currentAccountId: null,
        defaultAccountId,

        defaultCurrency,
        transactionTypes,

        isOngoingLimitedToCurrentMonth: limitOngoing,
    };

    const mut = new MutableState(state);
    addAccesses(mut, allAccesses, allAccounts, allTransactions);
    setCurrentAccount(mut);
    mut.state.alerts = allAlerts.map(al => new Alert(al));

    return mut.state;
}

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
