import u from 'updeep';

import { assert,
         assertHas,
         debug,
         has,
         localeComparator,
         NONE_CATEGORY_ID,
         translate as $t } from '../helpers';

import { Account, Alert, Bank, Operation } from '../models';

import Errors, { genericErrorHandler } from '../errors';

import * as backend from './backend';

import { compose,
         createReducerFromMap,
         fillOutcomeHandlers,
         updateMapIf,
         SUCCESS, FAIL } from './helpers';

import {
    CREATE_ACCESS,
    DELETE_ACCESS,
    DELETE_ACCOUNT,
    DELETE_CATEGORY,
    LOAD_ACCOUNTS,
    LOAD_OPERATIONS,
    MERGE_OPERATIONS,
    SET_OPERATION_TYPE,
    SET_OPERATION_CATEGORY,
    RUN_SYNC
} from './actions';

// Basic actions creators
const basic = {

    setOperationCategory(operation, categoryId, formerCategoryId) {
        return {
            type: SET_OPERATION_CATEGORY,
            operation,
            categoryId,
            formerCategoryId
        };
    },

    setOperationType(operation, typeId, formerTypeId) {
        return {
            type: SET_OPERATION_TYPE,
            operation,
            typeId,
            formerTypeId
        };
    },

    runSync() {
        return {
            type: RUN_SYNC
        }
    },

    loadAccounts(accessId, accounts = []) {
        return {
            type: LOAD_ACCOUNTS,
            accessId,
            accounts
        }
    },

    loadOperations(accountId, operations = []) {
        return {
            type: LOAD_OPERATIONS,
            accountId,
            operations
        }
    },

    mergeOperations(toKeep, toRemove) {
        return {
            type: MERGE_OPERATIONS,
            toKeep,
            toRemove
        }
    },

    createAccess(uuid, login, password, fields, access = {}) {
        return {
            type: CREATE_ACCESS,
            uuid,
            login,
            password,
            fields,
            access
        };
    },

    deleteAccess(accessId, otherAccess = null, otherAccount = null) {
        return {
            type: DELETE_ACCESS,
            accessId,
            otherAccess,
            otherAccount
        }
    },

    deleteAccount(accountId, otherAccess = null, otherAccount = null) {
        return {
            type: DELETE_ACCOUNT,
            accountId,
            otherAccess,
            otherAccount
        }
    },

}

const fail = {}, success = {};
fillOutcomeHandlers(basic, fail, success);

export function setOperationType(operation, typeId) {
    assert(typeof operation.id === 'string', 'SetOperationType first arg must have an id');
    assert(typeof typeId === 'string', 'SetOperationType second arg must be a String id');

    let formerTypeId = operation.operationTypeID;

    return dispatch => {
        dispatch(basic.setOperationType(operation, typeId, formerTypeId));
        backend.setTypeForOperation(operation.id, typeId)
        .then(_ => {
            dispatch(success.setOperationType(operation, typeId, formerTypeId));
        }).catch(err => {
            dispatch(fail.setOperationType(err, operation, typeId, formerTypeId));
        });
    };
}

export function setOperationCategory(operation, categoryId) {
    assert(typeof operation.id === 'string', 'SetOperationCategory first arg must have an id');
    assert(typeof categoryId === 'string', 'SetOperationCategory 2nd arg must be String id');

    // The server expects an empty string for replacing by none
    let serverCategoryId = categoryId === NONE_CATEGORY_ID ? '' : categoryId;
    let formerCategoryId = operation.categoryId;

    return dispatch => {
        dispatch(basic.setOperationCategory(operation, categoryId, formerCategoryId));
        backend.setCategoryForOperation(operation.id, serverCategoryId)
        .then(_ => {
            dispatch(success.setOperationCategory(operation, categoryId, formerCategoryId));
        }).catch(err => {
            dispatch(fail.setOperationCategory(err, operation, categoryId, formerCategoryId));
        });
    };
}

export function mergeOperations(toKeep, toRemove) {
    assertHas(toKeep, 'id');
    assertHas(toRemove, 'id');

    return dispatch => {
        dispatch(basic.mergeOperations(toKeep, toRemove));
        backend.mergeOperations(toKeep.id, toRemove.id)
        .then(newToKeep => {
            dispatch(success.mergeOperations(newToKeep, toRemove));
        }).catch(err => {
            dispatch(fail.mergeOperations(err, toKeep, toRemove));
        });
    }
}

export function deleteAccess(accessId) {
    assert(typeof accessId === 'string', 'deleteAccess expects a string id');

    return (dispatch, getState) => {
        // Propose alternative accesses/accounts to external listeners.
        // TODO here and in deleteAccount, `.banks` should not leak.
        let state = getState().banks;

        let otherAccesses = getAccesses(state).filter(a => a.id !== accessId);
        let otherAccess = otherAccesses.length ? otherAccesses[0] : null;

        let otherAccounts = otherAccess ? accountsByAccessId(state, otherAccess.id) : [];
        let otherAccount = otherAccounts.length ? otherAccounts[0] : null;

        dispatch(basic.deleteAccess(accessId));
        backend.deleteAccess(accessId)
        .then(() => {
            dispatch(success.deleteAccess(accessId, otherAccess, otherAccount));
        }).catch(err => {
            dispatch(fail.deleteAccess(err, accessId));
        });
    }
}

export function deleteAccount(accountId) {
    assert(typeof accountId === 'string', 'deleteAccount expects a string id');

    return (dispatch, getState) => {

        // Propose alternative accesses/accounts to external listeners.
        // TODO see comment in deleteAccess.
        let state = getState().banks;

        let { bankAccess: accessId } = accountById(state, accountId);
        let otherAccounts = accountsByAccessId(state, accessId).filter(a => a.id !== accountId);
        let otherAccount = otherAccounts.length ? otherAccounts[0] : null;

        let otherAccess = null;
        if (!otherAccount) {
            let otherAccesses = getAccesses(state).filter(a => a.id !== accessId);
            otherAccess = otherAccesses.length ? otherAccesses[0] : null;
            otherAccounts = otherAccess ? accountsByAccessId(state, otherAccess.id) : [];
            otherAccount = otherAccounts.length ? otherAccounts[0] : null;
        }

        dispatch(basic.deleteAccount(accountId));
        backend.deleteAccount(accountId)
        .then(() => {
            dispatch(success.deleteAccount(accountId, otherAccess, otherAccount));
        }).catch(err => {
            dispatch(fail.deleteAccount(err, accountId));
        });
    }
}

function loadAccounts(accessId) {
    return dispatch => {
        dispatch(basic.loadAccounts(accessId));
        backend.getAccounts(accessId)
        .then(accounts => {
            dispatch(success.loadAccounts(accessId, accounts));
            // Reload operations.
            for (let account of accounts) {
                dispatch(loadOperations(account.id));
            }
        }).catch(err => {
            dispatch(fail.loadAccounts(err, accessId, []));
        });
    }
}

function loadOperations(accountId) {
    return dispatch => {
        dispatch(basic.loadOperations(accountId));
        backend.getOperations(accountId)
        .then(operations => {
            dispatch(success.loadOperations(accountId, operations));
        })
        .catch(err => {
            dispatch(fail.loadOperations(err, accountId, []));
        });
    }
};

export function runSync(get) {
    return (dispatch, getState) => {
        let access = get.currentAccess(getState());
        dispatch(basic.runSync());
        backend.getNewOperations(access.id).then(() => {
            dispatch(success.runSync());
            // Reload accounts, for updating the 'last updated' date.
            dispatch(loadAccounts(access.id));
        })
        .catch(err => {
            dispatch(fail.runSync(err));
        });
    }
}

// Reducers

// Handle sync errors on the first synchronization, when a new access is
// created.
function handleFirstSyncError(err) {
    switch (err.code) {
        case Errors.INVALID_PASSWORD:
            alert($t('client.sync.first_time_wrong_password'));
            break;
        case Errors.INVALID_PARAMETERS:
            alert($t('client.sync.invalid_parameters', { content: err.content || '?' }));
            break;
        case Errors.EXPIRED_PASSWORD:
            alert($t('client.sync.expired_password'));
            break;
        case Errors.UNKNOWN_MODULE:
            alert($t('client.sync.unknown_module'));
            break;
        default:
            genericErrorHandler(err);
            break;
    }
}

export function createAccess(get, uuid, login, password, fields) {
    return (dispatch, getState) => {

        let allBanks = get.banks(getState());
        let access = createAccessFromBankUUID(allBanks, uuid);

        dispatch(basic.createAccess(uuid, login, password, fields));
        backend.createAccess(uuid, login, password, fields)
        .then(accessId => {
            access.id = accessId;
            dispatch(success.createAccess(uuid, login, password, fields, access));
            // Load accounts for this new access.
            dispatch(loadAccounts(accessId));
        })
        .catch(err => {
            dispatch(fail.createAccess(err, uuid, login, password, fields));
        });
    }
}

function reduceSetOperationCategory(state, action) {
    let { status } = action;

    if (status === SUCCESS) {
        debug("Operation's category successfully set");
        return state;
    }

    // Optimistic update.
    let categoryId;

    if (status === FAIL) {
        debug("Error when setting category for an operation", action.error);
        categoryId = action.formerCategoryId;
    } else {
        debug('Starting setting category for an operation...');
        categoryId = action.categoryId;
    }

    return u.updateIn('operations',
                      updateMapIf('id', action.operation.id, { categoryId }),
                      state);
}

function reduceSetOperationType(state, action) {
    let { status } = action;

    if (status === SUCCESS) {
        debug("Operation's type successfully set");
        return state;
    }

    // Optimistic update.
    let operationTypeID;

    if (status === FAIL) {
        debug("Error when setting type for an operation", action.error);
        operationTypeID = action.formerTypeId;
    } else {
        debug('Starting setting type for an operation...');
        operationTypeID = action.typeId;
    }

    return u.updateIn('operations',
                      updateMapIf('id', action.operation.id, { operationTypeID }),
                      state);
}

// Handle any synchronization error, after the first one.
function handleSyncError(err) {
    switch (err.code) {
        case Errors.INVALID_PASSWORD:
            alert($t('client.sync.wrong_password'));
            break;
        case Errors.EXPIRED_PASSWORD:
            alert($t('client.sync.expired_password'));
            break;
        case Errors.UNKNOWN_MODULE:
            alert($t('client.sync.unknown_module'));
            break;
        case Errors.NO_PASSWORD:
            alert($t('client.sync.no_password'));
            break;
        default:
            genericErrorHandler(err);
            break;
    }
}

function reduceRunSync(state, action) {
    let { status } = action;

    if (status === SUCCESS) {
        debug('Sync successfully terminated.');
        return state;
    }

    if (status === FAIL) {
        debug('Sync error:', action.error);
        handleSyncError(action.error);
        return state;
    }

    debug('Starting sync...');
    return state;
}

function reduceLoadAccounts(state, action) {
    let { status } = action;

    if (status === SUCCESS) {
        let { accessId, accounts } = action;
        debug('Successfully loaded accounts.');

        // Create the new accounts.
        accounts = accounts.map(a => new Account(a, state.constants.defaultCurrency));

        // Remove former accounts, add result to the new ones:
        let unrelated = state.accounts.filter(a => a.bankAccess !== accessId);
        accounts = unrelated.concat(accounts);

        sortAccounts(accounts);

        return u.updateIn('accounts', () => accounts, state);
    }

    if (status === FAIL) {
        debug('Failure when reloading accounts:', action.error);
        return state;
    }

    debug('Loading accounts...');
    return state;
}

function reduceLoadOperations(state, action) {
    let { status } = action;

    if (status === SUCCESS) {
        let { accountId, operations } = action;
        let { accountNumber } = accountById(state, accountId);
        debug('Successfully loaded operations.');

        // Create the new operations.
        operations = operations.map(o => new Operation(o, state.constants.unknownOperationTypeId));

        // Remove former operations, add the result to the new ones:
        let unrelated = state.operations.filter(o => o.bankAccount !== accountNumber);
        operations = unrelated.concat(operations);

        sortOperations(operations);

        return u.updateIn('operations', () => operations, state);
    }

    if (status === FAIL) {
        debug('Failure when reloading operations:', action.error);
        return state;
    }

    debug('Loading operations...');
    return state;
}

function reduceMergeOperations(state, action) {
    let { status } = action;

    if (status === SUCCESS) {
        // Remove the former operation:
        let ret = u.updateIn('operations', u.reject(o => o.id === action.toRemove.id), state);

        // Replace the kept one:
        let unknownOperationTypeId = state.constants.unknownOperationTypeId;
        let newKept = new Operation(action.toKeep, unknownOperationTypeId);
        return u.updateIn('operations',
                          updateMapIf('id', action.toKeep.id, newKept),
                          ret);
    }

    if (status === FAIL) {
        debug('Failure when merging operations:', action.error);
        return state;
    }

    debug('Merging operations...');
    return state;
}

function reduceDeleteAccountInternal(state, accountId) {
    let { accountNumber, bankAccess } = accountById(state, accountId);

    // Remove account:
    let ret = u.updateIn('accounts', u.reject(a => a.id === accountId), state);

    // Remove operations:
    ret = u.updateIn('operations', u.reject(o => o.bankAccount === accountNumber), ret);

    // Remove alerts:
    ret = u.updateIn('alerts', u.reject(a => a.bankAccount === accountNumber), ret);

    // If this was the last account of the access, remove the access too:
    if (accountsByAccessId(state, bankAccess).length == 1) {
        ret = u.updateIn('accesses', u.reject(a => a.id === bankAccess), ret);
    }

    return ret;
}

function reduceDeleteAccount(state, action) {
    let { accountId, status } = action;

    if (status === SUCCESS) {
        debug('Successfully deleted account.');
        return reduceDeleteAccountInternal(state, accountId);
    }

    if (status === FAIL) {
        debug('Failure when deleting account:', action.error);
        return state;
    }

    debug('Deleting account...');
    return state;
}

function reduceDeleteAccess(state, action) {
    let { accessId, status } = action;

    if (status === SUCCESS) {
        debug('Successfully deleted access.');

        // Remove associated accounts.
        let ret = state;
        for (let account of accountsByAccessId(state, accessId)) {
            ret = reduceDeleteAccountInternal(ret, account.id);
        }

        // Remove access itself.
        ret = u.updateIn('accesses', u.reject(a => a.id === accessId), ret);

        return ret;
    }

    if (status === FAIL) {
        debug('Failure when deleting access:', action.error);
        return state;
    }

    debug('Deleting access...');
    return state;
}

function reduceCreateAccess(state, action) {
    let { status } = action;

    if (status === SUCCESS) {
        debug('Successfully created access.');
        return u({
            accesses: state.accesses.concat(action.access)
        }, state);
    }

    if (status === FAIL) {
        debug('Failure when creating access:', action.error);
        handleFirstSyncError(action.error);
        return state;
    }

    debug('Creating access...');
    return state;
}

// Reducers on external actions.
function reduceDeleteCategory(state, action) {
    if (action.status !== SUCCESS)
        return state;

    let { id, replaceByCategoryId } = action;

    return u.updateIn('operations',
                      updateMapIf('categoryId', id, { categoryId: replaceByCategoryId }),
                      state);
}

// Initial state.
const bankState = u({
    // A list of the banks.
    banks: [],
    accesses: [],
    accounts: [],
    operations: [],
    alerts: []
}, {});

// Mapping of actions => reducers.
const reducers = {
    CREATE_ACCESS: reduceCreateAccess,
    DELETE_ACCESS: reduceDeleteAccess,
    DELETE_ACCOUNT: reduceDeleteAccount,
    DELETE_CATEGORY: reduceDeleteCategory,
    LOAD_ACCOUNTS: reduceLoadAccounts,
    LOAD_OPERATIONS: reduceLoadOperations,
    MERGE_OPERATIONS: reduceMergeOperations,
    RUN_SYNC: reduceRunSync,
    SET_OPERATION_TYPE: reduceSetOperationType,
    SET_OPERATION_CATEGORY: reduceSetOperationCategory,
};

export let reducer = createReducerFromMap(bankState, reducers);

// Helpers.
function getRelatedOperations(accountNumber, operations) {
    return operations.filter(op => op.bankAccount === accountNumber);
}

function getRelatedAlerts(accountNumber, alerts) {
    return alerts.filter(al => al.bankAccount === accountNumber);
}

function sortAccounts(accounts) {
    accounts.sort((a, b) => localeComparator(a.title, b.title));
}

function sortOperations(ops) {
    // Sort by -date first, then by +title/customLabel.
    ops.sort((a, b) => {
        let ad = +a.date,
            bd = +b.date;
        if (ad < bd)
            return 1;
        if (ad > bd)
            return -1;
        let ac = a.customLabel && a.customLabel.trim().length ? a.customLabel : a.title;
        let bc = b.customLabel && b.customLabel.trim().length ? b.customLabel : b.title;
        return localeComparator(ac, bc);
    });
}

function operationFromPOD(unknownOperationTypeId) {
    return op => new Operation(op, unknownOperationTypeId);
}

function createAccessFromBankUUID(allBanks, uuid) {
    let bank = allBanks.filter(b => b.uuid === uuid);

    let name = '?';
    let customFields = {};
    if (bank.length) {
        let b = bank[0];
        name = b.name;
        customFields = b.customFields;
    }

    return {
        uuid,
        name,
        customFields
    };
}

// Initial state.
export function initialState(state, get, allBanks, allAccounts, allOperations, allAlerts) {

    let unknownOperationTypeId = get.unknownOperationType(state).id;
    let defaultCurrency = get.setting(state, 'defaultCurrency');

    let banks = allBanks.map(b => new Bank(b));

    let accounts = allAccounts.map(a => new Account(a, defaultCurrency));
    sortAccounts(accounts);

    let accessMap = new Map;
    for (let a of allAccounts) {
        if (!accessMap.has(a.bankAccess)) {
            let access = createAccessFromBankUUID(allBanks, a.bank, a.bankAccess);
            access.id = a.bankAccess;
            accessMap.set(a.bankAccess, access);
        }
    }
    let accesses = Array.from(accessMap.values());

    let operations = allOperations.map(op => new Operation(op, unknownOperationTypeId));
    sortOperations(operations);

    let alerts = allAlerts.map(al => new Alert(al));

    return u({
        banks,
        accesses,
        accounts,
        operations,
        alerts,
        constants: {
            defaultCurrency,
            unknownOperationTypeId
        }
    }, {});
};

// Getters
export function all(state) {
    return state.banks;
}

export function getAccesses(state) {
    return state.accesses;
}

export function accessById(state, accessId) {
    return state.accesses.filter(access => access.id === accessId)[0];
}

export function byUuid(state, uuid) {
    let candidates = state.banks.filter(bank => bank.uuid === uuid);
    return candidates.length ? candidates[0] : null;
}

export function accountById(state, accountId) {
    let candidates = state.accounts.filter(account => account.id === accountId);
    return candidates.length ? candidates[0] : null;
}

export function accountsByAccessId(state, accessId) {
    return state.accounts.filter(acc => acc.bankAccess === accessId);
}

export function operationsByAccountId(state, accountId) {
    let { accountNumber } = accountById(state, accountId);
    return state.operations.filter(op => op.bankAccount === accountNumber);
}
