import { produce } from 'immer';

import {
    assert,
    assertNotNull,
    FETCH_STATUS_SUCCESS,
    localeComparator,
    NONE_CATEGORY_ID,
    UNKNOWN_ACCOUNT_TYPE,
    displayLabel,
    shouldIncludeInBalance,
    shouldIncludeInOutstandingSum,
    assertDefined,
    translate as $t,
} from '../helpers';

import {
    Account,
    Access,
    Alert,
    Bank,
    Operation,
    AlertType,
    AccessCustomField,
    CustomFieldDescriptor,
    Type,
} from '../models';

import DefaultAlerts from '../../shared/default-alerts.json';
import DefaultSettings from '../../shared/default-settings';
import { UserActionResponse } from '../../shared/types';
import TransactionTypes from '../../shared/operation-types.json';

import * as Ui from './ui';
import * as backend from './backend';

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
    CREATE_OPERATION,
    DELETE_ACCESS,
    UPDATE_ACCOUNT,
    DELETE_ACCOUNT,
    DELETE_ALERT,
    DELETE_OPERATION,
    MERGE_OPERATIONS,
    SET_DEFAULT_ACCOUNT,
    SET_OPERATION_CATEGORY,
    SET_OPERATION_CUSTOM_LABEL,
    SET_OPERATION_TYPE,
    SET_OPERATION_BUDGET_DATE,
    RUN_ACCOUNTS_SYNC,
    RUN_BALANCE_RESYNC,
    RUN_OPERATIONS_SYNC,
    RUN_APPLY_BULKEDIT,
    UPDATE_ALERT,
    UPDATE_ACCESS_AND_FETCH,
    UPDATE_ACCESS,
    DELETE_CATEGORY,
} from './actions';

import StaticBanks from '../../shared/banks.json';
import { DEFAULT_ACCOUNT_ID } from '../../shared/settings';
import { Dispatch } from 'redux';
import { DeleteCategoryParams } from './categories';
import { KThunkAction } from '.';

export interface BankState {
    // Bank descriptors.
    banks: Bank[];

    // Array of accesses ids.
    accessIds: number[];
    accessMap: Record<number, Access>;

    accountMap: Record<number, Account>;
    transactionMap: Record<number, Operation>;

    alerts: Alert[];

    currentAccountId: number | null;

    // Account id for the default account, or null if it's not defined.
    defaultAccountId: number | null;

    // Constant for the whole lifetime of the web app.
    defaultCurrency: string;
    transactionTypes: Type[];
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
    newOperations?: Operation[];
};

// Set a transaction's category.
export function setOperationCategory(
    operationId: number,
    categoryId: number,
    formerCategoryId: number
) {
    const serverCategoryId = categoryId === NONE_CATEGORY_ID ? null : categoryId;
    return async (dispatch: Dispatch) => {
        const action = setTransactionCategoryAction({ operationId, categoryId, formerCategoryId });
        dispatch(action);
        try {
            await backend.setCategoryForOperation(operationId, serverCategoryId);
            dispatch(actionStatus.ok(action));
        } catch (err) {
            dispatch(actionStatus.err(action, err));
            throw err;
        }
    };
}

type SetTransactionCategoryParams = {
    operationId: number;
    categoryId: number;
    formerCategoryId: number;
};
const setTransactionCategoryAction = createActionCreator<SetTransactionCategoryParams>(
    SET_OPERATION_CATEGORY
);

function reduceSetOperationCategory(
    state: BankState,
    action: Action<SetTransactionCategoryParams>
) {
    if (action.status === SUCCESS) {
        return state;
    }
    // Optimistic update.
    const categoryId = action.status === FAIL ? action.formerCategoryId : action.categoryId;
    return mutateState(state, mut => {
        mergeInObject(mut.state.transactionMap, action.operationId, { categoryId });
    });
}

// Set a transaction's type.
export function setOperationType(operationId: number, newType: string, formerType: string) {
    return async (dispatch: Dispatch) => {
        const action = setTransactionTypeAction({ operationId, newType, formerType });
        dispatch(action);
        try {
            await backend.setTypeForOperation(operationId, newType);
            dispatch(actionStatus.ok(action));
        } catch (err) {
            dispatch(actionStatus.err(action, err));
        }
    };
}

type SetTransactionTypeParams = {
    operationId: number;
    newType: string;
    formerType: string;
};
const setTransactionTypeAction = createActionCreator<SetTransactionTypeParams>(SET_OPERATION_TYPE);

function reduceSetOperationType(state: BankState, action: Action<SetTransactionTypeParams>) {
    const { status } = action;
    if (status === SUCCESS) {
        return state;
    }
    // Optimistic update.
    const type = status === FAIL ? action.formerType : action.newType;
    return mutateState(state, mut => {
        mergeInObject(mut.state.transactionMap, action.operationId, { type });
    });
}

// Set a transaction's custom label.
export function setOperationCustomLabel(operation: Operation, customLabel: string) {
    // The server expects an empty string for deleting the custom label.
    const serverCustomLabel = !customLabel ? '' : customLabel;
    const formerCustomLabel = operation.customLabel;
    return async (dispatch: Dispatch) => {
        const action = setTransactionCustomLabelAction({
            operationId: operation.id,
            customLabel,
            formerCustomLabel,
        });
        dispatch(action);
        try {
            await backend.setCustomLabel(operation.id, serverCustomLabel);
            dispatch(actionStatus.ok(action));
        } catch (err) {
            dispatch(actionStatus.err(action, err));
        }
    };
}

type SetTransactionCustomLabelParams = {
    operationId: number;
    customLabel: string;
    formerCustomLabel: string | null;
};
const setTransactionCustomLabelAction = createActionCreator<SetTransactionCustomLabelParams>(
    SET_OPERATION_CUSTOM_LABEL
);

function reduceSetOperationCustomLabel(
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
        mergeInObject(mut.state.transactionMap, action.operationId, { customLabel });
    });
}

// Set a transaction's budget date.
export function setOperationBudgetDate(operation: Operation, budgetDate: Date | null) {
    return async (dispatch: Dispatch) => {
        const action = setTransactionBudgetDateAction({
            operationId: operation.id,
            budgetDate: budgetDate || operation.date,
            formerBudgetDate: operation.budgetDate,
        });
        dispatch(action);
        try {
            await backend.setOperationBudgetDate(operation.id, budgetDate);
            dispatch(actionStatus.ok(action));
        } catch (err) {
            dispatch(actionStatus.err(action, err));
        }
    };
}

type SetTransactionBudgetDateParams = {
    operationId: number;
    budgetDate: Date;
    formerBudgetDate: Date;
};
const setTransactionBudgetDateAction = createActionCreator<SetTransactionBudgetDateParams>(
    SET_OPERATION_BUDGET_DATE
);

function reduceSetOperationBudgetDate(
    state: BankState,
    action: Action<SetTransactionBudgetDateParams>
) {
    const { status } = action;
    if (status === SUCCESS) {
        return state;
    }
    // Optimistic update.
    const budgetDate: Date = status === FAIL ? action.formerBudgetDate : action.budgetDate;
    return mutateState(state, mut => {
        mergeInObject(mut.state.transactionMap, action.operationId, { budgetDate });
    });
}

// Fetches all the transactions for the given access through the bank's
// provider.
export function runOperationsSync(
    accessId: number,
    userActionFields: FinishUserActionFields | null = null
) {
    return async (dispatch: Dispatch) => {
        const action = syncTransactionsAction({
            accessId,
        });
        dispatch(action);
        try {
            const results = await backend.getNewOperations(accessId, userActionFields);
            if (
                maybeHandleUserAction(dispatch, results, (fields: FinishUserActionFields) =>
                    runOperationsSync(accessId, fields)
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
const syncTransactionsAction = createActionCreator<SyncTransactionsParams>(RUN_OPERATIONS_SYNC);

function reduceRunOperationsSync(state: BankState, action: Action<SyncTransactionsParams>) {
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
                transactionIds.map(id => backend.updateOperation(id, serverNewFields))
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
export function createOperation(operation: Partial<Operation>) {
    let serverOperation: Partial<Operation> | { categoryId?: number | null } = operation;
    if (operation.categoryId === NONE_CATEGORY_ID) {
        serverOperation = { ...operation, categoryId: null };
    }

    return async (dispatch: Dispatch) => {
        const action = createTransactionAction({});
        dispatch(action);
        try {
            const created = await backend.createOperation(serverOperation);
            action.created = created;
            dispatch(actionStatus.ok(action));
        } catch (err) {
            dispatch(actionStatus.err(action, err));
            throw err;
        }
    };
}

type CreateTransactionParams = {
    created?: Operation;
};
const createTransactionAction = createActionCreator<CreateTransactionParams>(CREATE_OPERATION);

function reduceCreateOperation(state: BankState, action: Action<CreateTransactionParams>) {
    const { status } = action;
    if (status === SUCCESS) {
        const { created } = action;
        assertDefined(created);
        return mutateState(state, mut => {
            addOperations(mut, [created]);
        });
    }
    return state;
}

// Deletes a given transaction.
export function deleteOperation(operationId: number) {
    return async (dispatch: Dispatch) => {
        const action = deleteTransactionAction({ operationId });
        dispatch(action);
        try {
            await backend.deleteOperation(operationId);
            dispatch(actionStatus.ok(action));
        } catch (err) {
            dispatch(actionStatus.err(action, err));
        }
    };
}

type DeleteTransactionParams = { operationId: number };
const deleteTransactionAction = createActionCreator<DeleteTransactionParams>(DELETE_OPERATION);

function reduceDeleteOperation(state: BankState, action: Action<DeleteTransactionParams>) {
    const { status } = action;
    if (status === SUCCESS) {
        const { operationId } = action;
        return mutateState(state, mut => {
            removeOperation(mut, operationId);
        });
    }
    return state;
}

// Merges two transactions together.
export function mergeOperations(toKeep: Operation, toRemove: Operation) {
    return async (dispatch: Dispatch) => {
        const action = mergeTransactionAction({ toKeep, toRemove });
        dispatch(action);
        try {
            const newToKeep = await backend.mergeOperations(toKeep.id, toRemove.id);
            action.toKeep = newToKeep;
            dispatch(actionStatus.ok(action));
        } catch (err) {
            dispatch(actionStatus.err(action, err));
            throw err;
        }
    };
}

type MergeTransactionParams = {
    toKeep: Operation;
    toRemove: Operation;
};
const mergeTransactionAction = createActionCreator<MergeTransactionParams>(MERGE_OPERATIONS);

function reduceMergeOperations(state: BankState, action: Action<MergeTransactionParams>) {
    const { status } = action;
    if (status === SUCCESS) {
        return mutateState(state, mut => {
            // Remove the former operation:
            removeOperation(mut, action.toRemove.id);
            // Replace the kept one:
            const newKept = new Operation(action.toKeep);
            mergeInObject(mut.state.transactionMap, action.toKeep.id, newKept);
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
        customLabel: string;
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
    customLabel: string;
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

            const { accounts, newOperations } = results;

            // A new access must have an account and a transaction array (even
            // if it's empty).
            assertDefined(accounts);
            assertDefined(newOperations);

            addAccesses(mut, [access], accounts, newOperations);
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
            dispatch(actionStatus.ok(action));
        } catch (err) {
            dispatch(actionStatus.err(action, err));
        }
    };
}

type ResyncBalanceParams = { accountId: number; initialBalance?: number };
const resyncBalanceAction = createActionCreator<ResyncBalanceParams>(RUN_BALANCE_RESYNC);

function reduceResyncBalance(state: BankState, action: Action<ResyncBalanceParams>) {
    if (action.status === SUCCESS) {
        const { accountId, initialBalance } = action;
        assertDefined(initialBalance);
        return mutateState(state, mut => {
            const account = accountById(mut.state, accountId);
            const balance = account.balance - account.initialBalance + initialBalance;
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
            await backend.saveSetting(DEFAULT_ACCOUNT_ID, accountId);
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
const updateFetchAccessAction = createActionCreator<UpdateFetchAccessParams>(
    UPDATE_ACCESS_AND_FETCH
);

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
export type FinishUserAction = (fields: FinishUserActionFields) => KThunkAction;

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
    const { accounts = [], newOperations = [] } = results;

    // If finishSync is called, everything went well.
    updateAccessFetchStatus(mut, accessId, FETCH_STATUS_SUCCESS);

    if (accounts.length) {
        // addAccounts also handles transactions.
        addAccounts(mut, accounts, newOperations);
    } else {
        addOperations(mut, newOperations);
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
function makeCompareOperationByIds(state: BankState) {
    return function compareOperationIds(id1: number, id2: number) {
        const op1 = operationById(state, id1);
        const op2 = operationById(state, id2);
        assertNotNull(op1);
        assertNotNull(op2);
        const op1date = +op1.date,
            op2date = +op2.date;
        if (op1date < op2date) {
            return 1;
        }
        if (op1date > op2date) {
            return -1;
        }
        const alabel = displayLabel(op1);
        const blabel = displayLabel(op2);
        return localeComparator(alabel, blabel);
    };
}

function addOperations(mut: MutableState, operations: Partial<Operation>[]): void {
    const accountsToSort = new Set<Account>();

    const today = new Date();
    for (const op of operations) {
        const operation = new Operation(op);

        const account = accountById(mut.state, operation.accountId);
        accountsToSort.add(account);

        account.operationIds.push(operation.id);

        if (shouldIncludeInBalance(operation, today, account.type)) {
            account.balance += operation.amount;
        } else if (shouldIncludeInOutstandingSum(operation)) {
            account.outstandingSum += operation.amount;
        }

        mut.state.transactionMap[operation.id] = operation;
    }

    // Ensure operations are still sorted.
    const comparator = makeCompareOperationByIds(mut.state);
    for (const account of accountsToSort) {
        account.operationIds.sort(comparator);
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
    operations: Partial<Operation>[]
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

    addOperations(mut, operations);
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
    operations: Partial<Operation>[]
): void {
    const bankDescs = mut.state.banks;
    for (const partialAccess of accesses) {
        const access = new Access(partialAccess, bankDescs);
        mut.state.accessMap[access.id] = access;
        mut.state.accessIds.push(access.id);
    }

    addAccounts(mut, accounts, operations);

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
    for (const id of account.operationIds) {
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

function removeOperation(mut: MutableState, operationId: number): void {
    const op = operationById(mut.state, operationId);
    const account = accountById(mut.state, op.accountId);

    let { balance, outstandingSum } = account;
    const today = new Date();

    if (shouldIncludeInBalance(op, today, account.type)) {
        balance -= op.amount;
    } else if (shouldIncludeInOutstandingSum(op)) {
        outstandingSum -= op.amount;
    }

    mergeInObject(mut.state.accountMap, account.id, {
        operationIds: account.operationIds.filter(id => id !== operationId),
        balance,
        outstandingSum,
    });

    delete mut.state.transactionMap[operationId];
}

// Reducers on external actions.
function reduceDeleteCategory(state: BankState, action: Action<DeleteCategoryParams>) {
    if (action.status !== SUCCESS) {
        return state;
    }

    const { id: formerCategoryId, replaceById } = action;
    return mutateState(state, mut => {
        for (const id of Object.keys(mut.state.transactionMap)) {
            // Helping TypeScript a bit here: Object.keys return string, we
            // specified a mapping of number -> transactions.
            const t = mut.state.transactionMap[(id as any) as number];
            if (t.categoryId === formerCategoryId) {
                t.categoryId = replaceById;
            }
        }
    });
}

// Mapping of actions => reducers.
const reducers = {
    [CREATE_ACCESS]: reduceCreateAccess,
    [CREATE_ALERT]: reduceCreateAlert,
    [CREATE_OPERATION]: reduceCreateOperation,
    [DELETE_ACCESS]: reduceDeleteAccess,
    [DELETE_ACCOUNT]: reduceDeleteAccount,
    [DELETE_ALERT]: reduceDeleteAlert,
    [DELETE_CATEGORY]: reduceDeleteCategory,
    [DELETE_OPERATION]: reduceDeleteOperation,
    [MERGE_OPERATIONS]: reduceMergeOperations,
    [RUN_ACCOUNTS_SYNC]: reduceRunAccountsSync,
    [RUN_APPLY_BULKEDIT]: reduceRunApplyBulkEdit,
    [RUN_BALANCE_RESYNC]: reduceResyncBalance,
    [RUN_OPERATIONS_SYNC]: reduceRunOperationsSync,
    [SET_DEFAULT_ACCOUNT]: reduceSetDefaultAccount,
    [SET_OPERATION_BUDGET_DATE]: reduceSetOperationBudgetDate,
    [SET_OPERATION_CATEGORY]: reduceSetOperationCategory,
    [SET_OPERATION_CUSTOM_LABEL]: reduceSetOperationCustomLabel,
    [SET_OPERATION_TYPE]: reduceSetOperationType,
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
    },
    allAccesses: Partial<Access>[],
    allAccounts: Partial<Account>[],
    allOperations: Partial<Operation>[],
    allAlerts: Partial<Alert>[]
) {
    // Retrieved from outside.
    const { defaultCurrency, defaultAccountId: defaultAccountIdStr } = external;

    let defaultAccountId: number | null = null;
    if (defaultAccountIdStr !== DefaultSettings.get(DEFAULT_ACCOUNT_ID)) {
        defaultAccountId = parseInt(defaultAccountIdStr, 10);
    }

    const banks = StaticBanks.map(b => new Bank(b));
    sortBanks(banks);

    // TODO Sort is unstable across a language transaction.
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
    };

    const mut = new MutableState(state);
    addAccesses(mut, allAccesses, allAccounts, allOperations);
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

export function accessById(state: BankState, accessId: number): Access {
    const candidate = state.accessMap[accessId];
    assertDefined(candidate);
    return candidate;
}

interface AccessTotal {
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

export function operationById(state: BankState, operationId: number): Operation {
    const transaction = state.transactionMap[operationId];
    assertDefined(transaction);
    return transaction;
}

export function operationIdsByAccountId(state: BankState, accountId: number): number[] {
    return accountById(state, accountId).operationIds;
}

export function operationsByAccountId(state: BankState, accountId: number): Operation[] {
    return operationIdsByAccountId(state, accountId).map(id => {
        const op = operationById(state, id);
        assertNotNull(op);
        return op;
    });
}

export function operationIdsByCategoryId(state: BankState, categoryId: number): number[] {
    return Object.values(state.transactionMap)
        .filter(op => op.categoryId === categoryId)
        .map(op => op.id);
}

export function usedCategoriesSet(state: BankState): Set<number> {
    return new Set(Object.values(state.transactionMap).map(op => op.categoryId));
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

export function deleteAccessSession(accessId: number) {
    return backend.deleteAccessSession(accessId);
}

export const testing = {
    addAccesses,
    removeAccess,
    addAccounts,
    removeAccount,
    addOperations,
    removeOperation,
};
