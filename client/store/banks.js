import u from 'updeep';
import moment from 'moment';

import {
    assert,
    assertHas,
    debug,
    FETCH_STATUS_SUCCESS,
    localeComparator,
    maybeHas,
    NONE_CATEGORY_ID,
    translate as $t,
    UNKNOWN_ACCOUNT_TYPE,
    displayLabel,
    shouldIncludeInBalance,
    shouldIncludeInOutstandingSum,
    notify
} from '../helpers';

import { Account, Access, Alert, Bank, Operation } from '../models';

import DefaultAlerts from '../../shared/default-alerts.json';
import DefaultSettings from '../../shared/default-settings';

import Errors, { genericErrorHandler } from '../errors';

import * as backend from './backend';

import { createReducerFromMap, fillOutcomeHandlers, updateMapIf, SUCCESS, FAIL } from './helpers';

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
    UPDATE_ALERT
} from './actions';

import StaticBanks from '../../shared/banks.json';

// Basic actions creators
const basic = {
    setOperationCategory(operationId, categoryId, formerCategoryId) {
        return {
            type: SET_OPERATION_CATEGORY,
            operationId,
            categoryId,
            formerCategoryId
        };
    },

    setOperationType(operationId, type, formerType) {
        return {
            type: SET_OPERATION_TYPE,
            operationId,
            operationType: type,
            formerType
        };
    },

    setCustomLabel(operation, customLabel, formerCustomLabel) {
        return {
            type: SET_OPERATION_CUSTOM_LABEL,
            operation,
            customLabel,
            formerCustomLabel
        };
    },

    setOperationBudgetDate(operation, budgetDate, formerBudgetDate) {
        return {
            type: SET_OPERATION_BUDGET_DATE,
            operation,
            budgetDate,
            formerBudgetDate
        };
    },

    runOperationsSync(accessId, results = {}) {
        return {
            type: RUN_OPERATIONS_SYNC,
            accessId,
            results
        };
    },

    runAccountsSync(accessId, results = {}) {
        return {
            type: RUN_ACCOUNTS_SYNC,
            accessId,
            results
        };
    },

    createOperation(operation) {
        return {
            type: CREATE_OPERATION,
            operation
        };
    },

    deleteOperation(operationId) {
        return {
            type: DELETE_OPERATION,
            operationId
        };
    },

    mergeOperations(toKeep, toRemove) {
        return {
            type: MERGE_OPERATIONS,
            toKeep,
            toRemove
        };
    },

    createAccess(uuid, login, fields, customLabel, results = {}) {
        return {
            type: CREATE_ACCESS,
            results,
            uuid,
            login,
            fields,
            customLabel
        };
    },

    deleteAccess(accessId) {
        return {
            type: DELETE_ACCESS,
            accessId
        };
    },

    resyncBalance(accountId, initialBalance) {
        return {
            type: RUN_BALANCE_RESYNC,
            accountId,
            initialBalance
        };
    },

    updateAccount(accountId, updated, previousAttributes) {
        return {
            type: UPDATE_ACCOUNT,
            id: accountId,
            updated,
            previousAttributes
        };
    },

    deleteAccount(accountId) {
        return {
            type: DELETE_ACCOUNT,
            accountId
        };
    },

    createAlert(alert) {
        return {
            type: CREATE_ALERT,
            alert
        };
    },

    updateAlert(alertId, attributes) {
        return {
            type: UPDATE_ALERT,
            alertId,
            attributes
        };
    },

    deleteAlert(alertId) {
        return {
            type: DELETE_ALERT,
            alertId
        };
    },

    setDefaultAccountId(accountId) {
        return {
            type: SET_DEFAULT_ACCOUNT,
            accountId
        };
    }
};

const fail = {},
    success = {};
fillOutcomeHandlers(basic, fail, success);

function createDefaultAlerts(accounts) {
    return dispatch => {
        for (let bankAccount of accounts) {
            if (
                !DefaultAlerts.hasOwnProperty(bankAccount.type) &&
                bankAccount.type !== UNKNOWN_ACCOUNT_TYPE
            ) {
                debug(`unknown account type: ${bankAccount.type}`);
                continue;
            }
            for (let alert of DefaultAlerts[bankAccount.type]) {
                dispatch(createAlert(Object.assign({}, alert, { accountId: bankAccount.id })));
            }
        }
    };
}

export function createAccess(
    uuid,
    login,
    password,
    fields,
    customLabel,
    shouldCreateDefaultAlerts
) {
    return dispatch => {
        dispatch(basic.createAccess(uuid, login, fields, customLabel));
        return backend
            .createAccess(uuid, login, password, fields, customLabel)
            .then(results => {
                dispatch(success.createAccess(uuid, login, fields, customLabel, results));
                if (shouldCreateDefaultAlerts) {
                    dispatch(createDefaultAlerts(results.accounts));
                }
            })
            .catch(err => {
                dispatch(fail.createAccess(err));
                throw err;
            });
    };
}

export function createAlert(newAlert) {
    return dispatch => {
        dispatch(basic.createAlert(newAlert));
        return backend
            .createAlert(newAlert)
            .then(created => {
                dispatch(success.createAlert(created));
            })
            .catch(err => {
                dispatch(fail.createAlert(err, newAlert));
                throw err;
            });
    };
}

export function updateAlert(alertId, attributes) {
    return dispatch => {
        dispatch(basic.updateAlert(alertId, attributes));
        backend
            .updateAlert(alertId, attributes)
            .then(() => {
                dispatch(success.updateAlert(alertId, attributes));
            })
            .catch(err => {
                dispatch(fail.updateAlert(err, alertId, attributes));
            });
    };
}

export function deleteAlert(alertId) {
    return dispatch => {
        dispatch(basic.deleteAlert(alertId));
        backend
            .deleteAlert(alertId)
            .then(() => {
                dispatch(success.deleteAlert(alertId));
            })
            .catch(err => {
                dispatch(fail.deleteAlert(err, alertId));
            });
    };
}

export function setOperationType(operationId, type, formerType) {
    assert(typeof operationId === 'string', 'SetOperationType first arg must have an id');
    assert(typeof type === 'string', 'SetOperationType second arg must be a String id');

    return dispatch => {
        dispatch(basic.setOperationType(operationId, type, formerType));
        backend
            .setTypeForOperation(operationId, type)
            .then(() => {
                dispatch(success.setOperationType(operationId, type, formerType));
            })
            .catch(err => {
                dispatch(fail.setOperationType(err, operationId, type, formerType));
            });
    };
}

export function setOperationCategory(operationId, categoryId, formerCatId) {
    assert(typeof operationId === 'string', 'SetOperationCategory first arg must have an id');
    assert(typeof categoryId === 'string', 'SetOperationCategory 2nd arg must be String id');

    let serverCategoryId = categoryId === NONE_CATEGORY_ID ? null : categoryId;

    return dispatch => {
        dispatch(basic.setOperationCategory(operationId, categoryId, formerCatId));
        backend
            .setCategoryForOperation(operationId, serverCategoryId)
            .then(() => {
                dispatch(success.setOperationCategory(operationId, categoryId, formerCatId));
            })
            .catch(err => {
                dispatch(fail.setOperationCategory(err, operationId, categoryId, formerCatId));
            });
    };
}

export function setOperationCustomLabel(operation, customLabel) {
    assert(typeof operation.id === 'string', 'setCustomLabel first arg must have an id');
    assert(typeof customLabel === 'string', 'setCustomLabel 2nd arg must be String id');

    // The server expects an empty string for deleting the custom label.
    let serverCustomLabel = !customLabel ? '' : customLabel;
    let formerCustomLabel = operation.customLabel;

    return dispatch => {
        dispatch(basic.setCustomLabel(operation, customLabel, formerCustomLabel));
        backend
            .setCustomLabel(operation.id, serverCustomLabel)
            .then(() => {
                dispatch(success.setCustomLabel(operation, customLabel));
            })
            .catch(err => {
                dispatch(fail.setCustomLabel(err, operation, customLabel, formerCustomLabel));
            });
    };
}

export function setOperationBudgetDate(operation, budgetDate) {
    assert(typeof operation.id === 'string', 'setOperationBudgetDate first arg must have an id');
    assert(
        budgetDate === null || budgetDate instanceof Date,
        'setOperationBudgetDate 2nd arg must be Date or null'
    );

    return dispatch => {
        dispatch(basic.setOperationBudgetDate(operation, budgetDate, operation.budgetDate));
        backend
            .setOperationBudgetDate(operation.id, budgetDate)
            .then(() => {
                dispatch(success.setOperationBudgetDate(operation, budgetDate));
            })
            .catch(err => {
                dispatch(
                    fail.setOperationBudgetDate(err, operation, budgetDate, operation.budgetDate)
                );
            });
    };
}

export function mergeOperations(toKeep, toRemove) {
    assertHas(toKeep, 'id');
    assertHas(toRemove, 'id');

    return dispatch => {
        dispatch(basic.mergeOperations(toKeep, toRemove));
        return backend
            .mergeOperations(toKeep.id, toRemove.id)
            .then(newToKeep => {
                dispatch(success.mergeOperations(newToKeep, toRemove));
            })
            .catch(err => {
                dispatch(fail.mergeOperations(err, toKeep, toRemove));
                throw err;
            });
    };
}

export function createOperation(operation) {
    let serverOperation = operation;
    if (operation.categoryId === NONE_CATEGORY_ID) {
        serverOperation = Object.assign({}, operation, { categoryId: null });
    }

    return dispatch => {
        dispatch(basic.createOperation(operation));
        return backend
            .createOperation(serverOperation)
            .then(created => {
                dispatch(success.createOperation(created));
            })
            .catch(err => {
                dispatch(fail.createOperation(err, operation));
                throw err;
            });
    };
}

export function deleteOperation(operationId) {
    return dispatch => {
        dispatch(basic.deleteOperation(operationId));
        backend
            .deleteOperation(operationId)
            .then(() => {
                dispatch(success.deleteOperation(operationId));
            })
            .catch(err => {
                dispatch(fail.deleteOperation(err, operationId));
            });
    };
}

export function deleteAccess(accessId) {
    assert(typeof accessId === 'string', 'deleteAccess expects a string id');
    return dispatch => {
        dispatch(basic.deleteAccess(accessId));
        backend
            .deleteAccess(accessId)
            .then(() => {
                dispatch(success.deleteAccess(accessId));
            })
            .catch(err => {
                dispatch(fail.deleteAccess(err, accessId));
            });
    };
}

export function updateAccount(accountId, properties, previousAttributes) {
    assert(typeof accountId === 'string', 'UpdateAccount first arg must be a string id');

    if (typeof properties.excludeFromBalance !== 'undefined') {
        assert(
            typeof properties.excludeFromBalance === 'boolean',
            'UpdateAccount second arg excludeFromBalance field must be a boolean'
        );
    }

    return dispatch => {
        dispatch(basic.updateAccount(accountId, properties, previousAttributes));
        backend
            .updateAccount(accountId, properties)
            .then(updated => {
                dispatch(success.updateAccount(accountId, updated));
            })
            .catch(err => {
                dispatch(fail.updateAccount(err, accountId, properties, previousAttributes));
            });
    };
}

export function deleteAccount(accountId) {
    assert(typeof accountId === 'string', 'deleteAccount expects a string id');

    return dispatch => {
        dispatch(basic.deleteAccount(accountId));
        backend
            .deleteAccount(accountId)
            .then(() => {
                dispatch(success.deleteAccount(accountId));
            })
            .catch(err => {
                dispatch(fail.deleteAccount(err, accountId));
            });
    };
}

export function resyncBalance(accountId) {
    assert(typeof accountId === 'string', 'resyncBalance expects a string id');

    return dispatch => {
        dispatch(basic.resyncBalance(accountId));
        return backend
            .resyncBalance(accountId)
            .then(initialBalance => {
                dispatch(success.resyncBalance(accountId, initialBalance));
            })
            .catch(err => {
                dispatch(fail.resyncBalance(err, accountId));
                throw err;
            });
    };
}

export function runOperationsSync(accessId) {
    return dispatch => {
        dispatch(basic.runOperationsSync());
        backend
            .getNewOperations(accessId)
            .then(results => {
                dispatch(success.runOperationsSync(accessId, results));
            })
            .catch(err => {
                dispatch(fail.runOperationsSync(err, accessId));
            });
    };
}

export function runAccountsSync(accessId) {
    return dispatch => {
        dispatch(basic.runAccountsSync(accessId));
        backend
            .getNewAccounts(accessId)
            .then(results => {
                dispatch(success.runAccountsSync(accessId, results));
            })
            .catch(err => {
                dispatch(fail.runAccountsSync(err, accessId));
            });
    };
}

export function setDefaultAccountId(accountId) {
    assert(typeof accountId === 'string', 'accountId must be a string');
    return dispatch => {
        dispatch(basic.setDefaultAccountId(accountId));
        backend
            .saveSetting('default-account-id', accountId)
            .then(() => {
                dispatch(success.setDefaultAccountId(accountId));
            })
            .catch(err => {
                dispatch(fail.setDefaultAccountId(err, accountId));
            });
    };
}

// Handle sync errors on the first synchronization, when a new access is
// created.
function handleFirstSyncError(err) {
    switch (err.code) {
        case Errors.EXPIRED_PASSWORD:
            notify.error($t('client.sync.expired_password'));
            break;
        case Errors.INVALID_PARAMETERS:
            notify.error($t('client.sync.invalid_parameters', { content: err.content || '?' }));
            break;
        case Errors.INVALID_PASSWORD:
            notify.error($t('client.sync.first_time_wrong_password'));
            break;
        case Errors.NO_ACCOUNTS:
            notify.error($t('client.sync.no_accounts'));
            break;
        case Errors.UNKNOWN_MODULE:
            notify.error($t('client.sync.unknown_module'));
            break;
        case Errors.ACTION_NEEDED:
            notify.error($t('client.sync.action_needed'));
            break;
        case Errors.AUTH_METHOD_NYI:
            notify.error($t('client.sync.auth_method_nyi'));
            break;
        case Errors.BROWSER_QUESTION:
            notify.error($t('client.sync.browser_question'));
            break;
        default:
            genericErrorHandler(err);
            break;
    }
}

// Handle any synchronization error, after the first one.
function handleSyncError(err) {
    switch (err.code) {
        case Errors.INVALID_PASSWORD:
            notify.error($t('client.sync.wrong_password'));
            break;
        case Errors.NO_PASSWORD:
            notify.error($t('client.sync.no_password'));
            break;
        default:
            handleFirstSyncError(err);
            break;
    }
}

// State representation.

const INITIAL_STATE = u(
    {
        // A list of the banks.
        banks: [],
        accessIds: [], // Array of accesses ids
        accessesMap: {}, // { accessId: { ...access, accountIds: [accountId1, accountId2] } }
        accountsMap: {}, // { accountId: { ...account, operationIds: [opId1, opId2] } }
        operationsMap: {}, // { operationId: { ...operation } }
        alerts: [],
        currentAccessId: null,
        currentAccountId: null
    },
    {}
);

// State helpers.

function updateAccessesMap(state, update) {
    return u.updateIn('accessesMap', update, state);
}

function updateAccountsMap(state, update) {
    return u.updateIn('accountsMap', update, state);
}

function updateOperationsMap(state, update) {
    return u.updateIn('operationsMap', update, state);
}

// Field updates.
function updateAccessFields(state, accessId, update) {
    assert(
        typeof accessId === 'string',
        'The second parameter of updateAccessFields should be a string id'
    );
    return updateAccessesMap(state, { [accessId]: update });
}

function updateAccessFetchStatus(state, accessId, errCode = null) {
    assert(
        typeof accessId === 'string',
        'The second parameter of updateAccessFetchStatus should be a string id'
    );
    // If the errCode is null, this means this is not a fetchStatus.
    if (errCode !== null) {
        return updateAccessFields(state, accessId, { fetchStatus: errCode });
    }
    return state;
}

function updateAccountFields(state, accountId, update) {
    assert(
        typeof accountId === 'string',
        'second parameter of updateAccountFields should be a string id'
    );
    return updateAccountsMap(state, { [accountId]: update });
}

function updateOperationFields(state, operationId, update) {
    assert(
        typeof operationId === 'string',
        'second parameter of updateOperationFields should be a string id'
    );
    let op = operationById(state, operationId);
    assert(op !== null, `You are trying to update an unknown operation with id "${operationId}"`);
    return updateOperationsMap(state, { [operationId]: update });
}

// More complex operations.
function makeCompareOperationByIds(state) {
    return function compareOperationIds(id1, id2) {
        let op1 = operationById(state, id1);
        let op2 = operationById(state, id2);
        let op1date = +op1.date,
            op2date = +op2.date;
        if (op1date < op2date) {
            return 1;
        }
        if (op1date > op2date) {
            return -1;
        }
        let alabel = displayLabel(op1);
        let blabel = displayLabel(op2);
        return localeComparator(alabel, blabel);
    };
}

function addOperations(state, pOperations) {
    let operations = pOperations instanceof Array ? pOperations : [pOperations];
    operations.forEach(op => {
        assert(
            typeof op.id === 'string',
            'Each element of "operations" parameter of addOperations must have an id'
        );
    });

    let accountsMapUpdate = {};
    let operationMapUpdate = {};
    let today = moment();
    for (let op of operations) {
        let operation = new Operation(op);
        if (typeof accountsMapUpdate[operation.accountId] === 'undefined') {
            let account = accountById(state, operation.accountId);
            accountsMapUpdate[operation.accountId] = {
                operationIds: account.operationIds.slice(),
                balance: account.balance,
                outstandingSum: account.outstandingSum,
                type: account.type
            };
        }

        let accountUpdate = accountsMapUpdate[operation.accountId];

        if (shouldIncludeInBalance(operation, today, accountUpdate.type)) {
            accountUpdate.balance += operation.amount;
        } else if (shouldIncludeInOutstandingSum(operation)) {
            accountUpdate.outstandingSum += operation.amount;
        }
        accountUpdate.operationIds.push(operation.id);

        operationMapUpdate[operation.id] = operation;
    }

    let newState = updateOperationsMap(state, operationMapUpdate);

    // Ensure operations are still sorted.
    let comparator = makeCompareOperationByIds(newState);
    for (let accountUpdate of Object.values(accountsMapUpdate)) {
        accountUpdate.operationIds.sort(comparator);
    }

    return updateAccountsMap(newState, accountsMapUpdate);
}

function makeCompareAccountIds(state) {
    return function compareAccountIds(id1, id2) {
        let acc1 = accountById(state, id1);
        let acc2 = accountById(state, id2);
        return localeComparator(displayLabel(acc1), displayLabel(acc2));
    };
}

function setCurrentAccessAndAccount(state) {
    let currentAccountId = null;
    let currentAccessId = null;

    let defaultAccountId = getDefaultAccountId(state);
    let defaultAccount = accountById(state, defaultAccountId);

    let accessesIds = getAccessIds(state);
    if (defaultAccountId && defaultAccount) {
        currentAccountId = defaultAccountId;
        currentAccessId = defaultAccount.accessId;
    } else if (accessesIds.length) {
        currentAccessId = accessesIds[0];
        currentAccountId = accountIdsByAccessId(state, currentAccessId)[0];
    }

    return u({ currentAccessId, currentAccountId }, state);
}

function addAccounts(state, pAccounts, operations) {
    let accounts = pAccounts instanceof Array ? pAccounts : [pAccounts];
    accounts.forEach(account => {
        assert(
            typeof account.id === 'string',
            'The second parameter of addAccounts should have a string id'
        );
    });

    let accountsMapUpdate = {};
    let accessesMapUpdate = {};
    for (let account of accounts) {
        // Only add account to the access list if it does not already exist.
        let access = accessById(state, account.accessId);
        if (!access.accountIds.includes(account.id)) {
            if (typeof accessesMapUpdate[account.accessId] === 'undefined') {
                accessesMapUpdate[account.accessId] = {
                    accountIds: access.accountIds.slice()
                };
            }
            accessesMapUpdate[account.accessId].accountIds.push(account.id);
        }

        // Always update the account content.
        let defaultCurrency = getDefaultCurrency(state);

        let newAccount;
        let prevAccount = accountById(state, account.id);
        if (prevAccount) {
            newAccount = Account.updateFrom(account, defaultCurrency, prevAccount);
        } else {
            newAccount = new Account(account, defaultCurrency);
        }

        accountsMapUpdate[account.id] = newAccount;
    }

    let newState = updateAccountsMap(state, accountsMapUpdate);

    // Ensure accounts are still sorted.
    let comparator = makeCompareAccountIds(newState);
    for (let accessUpdate of Object.values(accessesMapUpdate)) {
        accessUpdate.accountIds.sort(comparator);
    }
    newState = updateAccessesMap(newState, accessesMapUpdate);

    // If there was no current account id, set one.
    if (getCurrentAccountId(newState) === null) {
        newState = setCurrentAccessAndAccount(newState);
    }

    return addOperations(newState, operations);
}

function sortAccesses(state) {
    // It is necessary to copy the array, otherwise the sort operation will be applied
    // directly to the state, which is forbidden (raises TypeError).
    let accessIds = getAccessIds(state).slice();
    let defaultAccountId = getDefaultAccountId(state);
    let defaultAccess = accessByAccountId(state, defaultAccountId);
    let defaultAccessId = defaultAccess ? defaultAccess.id : '';
    let sorted = accessIds.sort((ida, idb) => {
        let a = accessById(state, ida);
        let b = accessById(state, idb);
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
    return u({ accessIds: sorted }, state);
}

function addAccesses(state, pAccesses, accounts, operations) {
    let accesses = pAccesses instanceof Array ? pAccesses : [pAccesses];
    accesses.forEach(access => {
        assert(
            typeof access.id === 'string',
            'The second parameter of addAccesses should have a string id'
        );
    });

    let accessesMapUpdate = {};
    for (let access of accesses) {
        accessesMapUpdate[access.id] = new Access(access, all(state));
    }

    let newState = updateAccessesMap(state, accessesMapUpdate);
    newState = u.updateIn(
        'accessIds',
        getAccessIds(newState).concat(accesses.map(access => access.id)),
        newState
    );

    newState = addAccounts(newState, accounts, operations);

    return sortAccesses(newState);
}

function removeAccess(state, accessId) {
    assert(
        typeof accessId === 'string',
        'The second parameter of removeAccess should be a string id'
    );

    // First remove all the accounts attached to the access.
    let newState = state;
    for (let accountId of accountIdsByAccessId(state, accessId)) {
        newState = removeAccount(newState, accountId);
    }

    // Then remove access (should have been done by removeAccount).
    newState = updateAccessesMap(newState, u.omit(accessId));
    newState = u.updateIn('accessIds', u.reject(id => id === accessId), newState);

    // Sort again accesses in case the default account has been deleted.
    return sortAccesses(newState);
}

function removeAccount(state, accountId) {
    assert(
        typeof accountId === 'string',
        'second parameter of removeAccount should be a string id'
    );

    let account = accountById(state, accountId);
    // First remove the attached operations from the operation map.
    let newState = updateOperationsMap(state, u.omit(account.operationIds));

    // Then remove the account from the access.
    newState = updateAccessFields(newState, account.accessId, {
        accountIds: u.reject(id => id === accountId)
    });

    // Remove access if no more accounts in the access.
    newState =
        accountIdsByAccessId(newState, account.accessId).length === 0
            ? removeAccess(newState, account.accessId)
            : newState;

    // Reset the defaultAccountId if we just deleted it.
    if (getDefaultAccountId(newState) === accountId) {
        newState = u({ defaultAccountId: DefaultSettings.get('default-account-id') }, newState);
    }

    // Reset the current account id if we just deleted it.
    if (getCurrentAccountId(newState) === accountId) {
        newState = setCurrentAccessAndAccount(newState);
    }

    // Remove alerts attached to the account.
    newState = u.updateIn('alerts', u.reject(alert => alert.accountId === accountId), newState);

    // Finally, remove the account from the accounts map.
    return updateAccountsMap(newState, u.omit(accountId));
}

function removeOperation(state, operationId) {
    assert(
        typeof operationId === 'string',
        'second parameter of removeOperation should be a string id'
    );

    let op = operationById(state, operationId);
    let account = accountById(state, op.accountId);

    let { balance, outstandingSum } = account;
    let today = moment();

    if (shouldIncludeInBalance(op, today, account.type)) {
        balance -= op.amount;
    } else if (shouldIncludeInOutstandingSum(op)) {
        outstandingSum -= op.amount;
    }

    let newState = updateAccountFields(state, account.id, {
        operationIds: u.reject(id => id === operationId),
        balance,
        outstandingSum
    });

    return updateOperationsMap(newState, u.omit(`${operationId}`));
}

// Reducers
function reduceSetOperationCategory(state, action) {
    let { status } = action;

    if (status === SUCCESS) {
        return state;
    }

    // Optimistic update.
    let categoryId;

    if (status === FAIL) {
        categoryId = action.formerCategoryId;
    } else {
        categoryId = action.categoryId;
    }

    return updateOperationFields(state, action.operationId, { categoryId });
}

function reduceSetOperationType(state, action) {
    let { status } = action;

    if (status === SUCCESS) {
        return state;
    }

    // Optimistic update.
    let type;

    if (status === FAIL) {
        type = action.formerType;
    } else {
        type = action.operationType;
    }

    return updateOperationFields(state, action.operationId, { type });
}

function reduceSetOperationCustomLabel(state, action) {
    let { status } = action;

    if (status === SUCCESS) {
        return state;
    }

    // Optimistic update.
    let customLabel;

    if (status === FAIL) {
        customLabel = action.formerCustomLabel;
    } else {
        customLabel = action.customLabel;
    }

    return updateOperationFields(state, action.operation.id, { customLabel });
}

function reduceSetOperationBudgetDate(state, action) {
    let { status } = action;

    // Optimistic update.
    let budgetDate;

    if (status === FAIL) {
        budgetDate = action.formerBudgetDate;
    } else {
        budgetDate = action.budgetDate || action.operation.date;
    }

    return updateOperationFields(state, action.operation.id, { budgetDate });
}

function finishSync(state, accessId, results) {
    let { accounts = [], newOperations = [] } = results;
    assert(accounts.length || newOperations.length, 'should have something to update');

    // If finishSync is called, everything went well.
    let newState = updateAccessFetchStatus(state, accessId, FETCH_STATUS_SUCCESS);

    if (accounts.length) {
        return addAccounts(newState, accounts, newOperations);
    }
    return addOperations(newState, newOperations);
}

function reduceRunOperationsSync(state, action) {
    let { status } = action;

    if (status === SUCCESS) {
        let { results, accessId } = action;
        return finishSync(state, accessId, results);
    }

    if (status === FAIL) {
        let { error, accessId } = action;
        handleSyncError(error);
        return updateAccessFetchStatus(state, accessId, error.code);
    }

    return state;
}

function reduceRunAccountsSync(state, action) {
    let { status } = action;

    if (status === SUCCESS) {
        let { accessId, results } = action;
        return finishSync(state, accessId, results);
    }

    if (status === FAIL) {
        let { error, accessId } = action;
        handleSyncError(error);
        return updateAccessFetchStatus(state, accessId, error.code);
    }

    return state;
}

function reduceMergeOperations(state, action) {
    let { status } = action;

    if (status === SUCCESS) {
        // Remove the former operation:
        let newState = removeOperation(state, action.toRemove.id);

        // Replace the kept one:
        let newKept = new Operation(action.toKeep);
        return updateOperationFields(newState, action.toKeep.id, newKept);
    }

    return state;
}

function reduceCreateOperation(state, action) {
    let { status } = action;

    if (status === SUCCESS) {
        let { operation } = action;
        return addOperations(state, operation);
    }

    return state;
}

function reduceDeleteOperation(state, action) {
    let { status } = action;

    if (status === SUCCESS) {
        let { operationId } = action;
        return removeOperation(state, operationId);
    }

    return state;
}

function reduceResyncBalance(state, action) {
    let { status, accountId } = action;
    if (status === SUCCESS) {
        let { initialBalance } = action;
        let account = accountById(state, accountId);

        let balance = account.balance - account.initialBalance + initialBalance;
        return updateAccountFields(state, accountId, { initialBalance, balance });
    }

    if (status === FAIL) {
        let { error } = action;
        let { id: accessId } = accessByAccountId(state, accountId);
        handleSyncError(error);
        return updateAccessFetchStatus(state, accessId, error.code);
    }

    return state;
}

function reduceUpdateAccount(state, action) {
    let { status, updated, previousAttributes, id } = action;
    if (status === SUCCESS) {
        return state;
    }
    if (status === FAIL) {
        return updateAccountFields(state, id, previousAttributes);
    }
    return updateAccountFields(state, id, updated);
}

function reduceDeleteAccount(state, action) {
    let { accountId, status } = action;
    if (status === SUCCESS) {
        return removeAccount(state, accountId);
    }
    return state;
}

function reduceDeleteAccess(state, action) {
    let { accessId, status } = action;
    if (status === SUCCESS) {
        return removeAccess(state, accessId);
    }
    return state;
}

function reduceCreateAccess(state, action) {
    let { status } = action;

    if (status === SUCCESS) {
        let { results, uuid, login, fields, customLabel } = action;

        let access = {
            id: results.accessId,
            vendorId: uuid,
            login,
            fields,
            customLabel,
            enabled: true
        };

        let { accounts, newOperations } = results;
        return addAccesses(state, access, accounts, newOperations);
    }

    if (status === FAIL) {
        handleFirstSyncError(action.error);
    }

    return state;
}

function reduceUpdateAccessAndFetch(state, action) {
    let { status, accessId } = action;

    if (status === SUCCESS) {
        let { results } = action;
        assertHas(action, 'newFields');
        let newFields = { ...action.newFields };
        if (newFields.customFields) {
            newFields.customFields = newFields.customFields.filter(field => field.value !== null);
        }

        let newState = updateAccessFields(state, accessId, newFields);

        newState = finishSync(newState, accessId, results);

        // Sort accesses in case an access is enabled.
        return sortAccesses(newState);
    }

    if (status === FAIL) {
        let { error } = action;
        handleSyncError(error);
        return updateAccessFetchStatus(state, accessId, error.code);
    }

    return state;
}

function reduceUpdateAccess(state, action) {
    // Optimistic update.
    if (action.status === SUCCESS) {
        return state;
    }

    let { accessId, newFields } = action;
    return updateAccessFields(state, accessId, newFields);
}

function reduceCreateAlert(state, action) {
    let { status } = action;

    if (status === SUCCESS) {
        let a = new Alert(action.alert);
        return u(
            {
                alerts: [a].concat(state.alerts)
            },
            state
        );
    }

    return state;
}

function reduceUpdateAlert(state, action) {
    let { status } = action;

    if (status === SUCCESS) {
        let { attributes, alertId } = action;
        return u.updateIn('alerts', updateMapIf('id', alertId, u(attributes)), state);
    }

    return state;
}

function reduceDeleteAlert(state, action) {
    let { status } = action;

    if (status === SUCCESS) {
        let { alertId } = action;
        return u(
            {
                alerts: u.reject(a => a.id === alertId)
            },
            state
        );
    }

    return state;
}

// Reducers on external actions.
function reduceDeleteCategory(state, action) {
    if (action.status !== SUCCESS) {
        return state;
    }

    let { id, replaceByCategoryId } = action;
    let operationsMapUpdate = {};
    for (let opId in state.operationsMap) {
        if (operationById(state, opId).categoryId === id) {
            operationsMapUpdate[opId] = { categoryId: replaceByCategoryId };
        }
    }
    return updateOperationsMap(state, operationsMapUpdate);
}

function reduceSetDefaultAccount(state, action) {
    if (action.status === SUCCESS) {
        let newState = u({ defaultAccountId: action.accountId }, state);
        return sortAccesses(newState);
    }

    return state;
}

// Mapping of actions => reducers.
const reducers = {
    CREATE_OPERATION: reduceCreateOperation,
    CREATE_ACCESS: reduceCreateAccess,
    CREATE_ALERT: reduceCreateAlert,
    DELETE_ACCESS: reduceDeleteAccess,
    DELETE_ACCOUNT: reduceDeleteAccount,
    UPDATE_ACCOUNT: reduceUpdateAccount,
    DELETE_ALERT: reduceDeleteAlert,
    DELETE_CATEGORY: reduceDeleteCategory,
    DELETE_OPERATION: reduceDeleteOperation,
    MERGE_OPERATIONS: reduceMergeOperations,
    RUN_ACCOUNTS_SYNC: reduceRunAccountsSync,
    RUN_BALANCE_RESYNC: reduceResyncBalance,
    RUN_OPERATIONS_SYNC: reduceRunOperationsSync,
    SET_DEFAULT_ACCOUNT: reduceSetDefaultAccount,
    SET_OPERATION_CATEGORY: reduceSetOperationCategory,
    SET_OPERATION_CUSTOM_LABEL: reduceSetOperationCustomLabel,
    SET_OPERATION_TYPE: reduceSetOperationType,
    SET_OPERATION_BUDGET_DATE: reduceSetOperationBudgetDate,
    UPDATE_ALERT: reduceUpdateAlert,
    UPDATE_ACCESS: reduceUpdateAccess,
    UPDATE_ACCESS_AND_FETCH: reduceUpdateAccessAndFetch
};

export const reducer = createReducerFromMap(INITIAL_STATE, reducers);

// Helpers.
function sortSelectFields(field) {
    if (maybeHas(field, 'values')) {
        field.values.sort((a, b) => localeComparator(a.label, b.label));
    }
}

function sortBanks(banks) {
    banks.sort((a, b) => localeComparator(a.name, b.name));

    // Sort the selects of customFields by alphabetical order.
    banks.forEach(bank => {
        if (bank.customFields) {
            bank.customFields.forEach(sortSelectFields);
        }
    });
}

// Initial state.
export function initialState(external, allAccesses, allAccounts, allOperations, allAlerts) {
    // Retrieved from outside.
    let { defaultCurrency, defaultAccountId } = external;

    let banks = StaticBanks.map(b => new Bank(b));
    sortBanks(banks);

    let newState = u(
        {
            banks,
            constants: {
                defaultCurrency
            },
            defaultAccountId
        },
        INITIAL_STATE
    );

    newState = addAccesses(newState, allAccesses, allAccounts, allOperations);
    newState = setCurrentAccessAndAccount(newState);

    let alerts = allAlerts.map(al => new Alert(al));

    return u(
        {
            alerts
        },
        newState
    );
}

// Getters

export function getCurrentAccessId(state) {
    return state.currentAccessId;
}

export function getCurrentAccountId(state) {
    return state.currentAccountId;
}

function all(state) {
    return state.banks;
}

export function allActiveStaticBanks(state) {
    return all(state).filter(b => !b.deprecated);
}

export function bankByUuid(state, uuid) {
    let candidate = state.banks.find(bank => bank.uuid === uuid);
    return typeof candidate !== 'undefined' ? candidate : null;
}

export function getAccessIds(state) {
    return state.accessIds;
}

export function accessById(state, accessId) {
    let candidate = state.accessesMap[accessId];
    return typeof candidate !== 'undefined' ? candidate : null;
}

export function accountById(state, accountId) {
    let candidate = state.accountsMap[accountId];
    return typeof candidate !== 'undefined' ? candidate : null;
}

export function accessByAccountId(state, accountId) {
    let account = accountById(state, accountId);
    if (account === null) {
        return null;
    }
    return accessById(state, account.accessId);
}

export function accountIdsByAccessId(state, accessId) {
    let access = accessById(state, accessId);
    return access !== null ? access.accountIds : [];
}

export function operationById(state, operationId) {
    return state.operationsMap[operationId] || null;
}

export function operationIdsByAccountId(state, accountId) {
    let account = accountById(state, accountId);
    return account !== null ? account.operationIds : [];
}

export function operationsByAccountId(state, accountId) {
    return operationIdsByAccountId(state, accountId).map(id => operationById(state, id));
}

export function operationIdsByCategoryId(state, categoryId) {
    return Object.values(state.operationsMap)
        .filter(op => op.categoryId === categoryId)
        .map(op => op.id);
}

export function usedCategoriesSet(state) {
    return new Set(Object.values(state.operationsMap).map(op => op.categoryId));
}

export function alertPairsByType(state, alertType) {
    let pairs = [];

    for (let alert of state.alerts.filter(a => a.type === alertType)) {
        let account = accountById(state, alert.accountId);
        if (account === null) {
            debug('alert tied to no accounts, skipping');
            continue;
        }
        pairs.push({ alert, account });
    }

    return pairs;
}

export function getDefaultAccountId(state) {
    return state.defaultAccountId;
}

function getDefaultCurrency(state) {
    return state.constants.defaultCurrency;
}

export const testing = {
    addAccesses,
    removeAccess,
    updateAccessFields,
    addAccounts,
    removeAccount,
    updateAccountFields,
    addOperations,
    removeOperation,
    updateOperationFields
};
