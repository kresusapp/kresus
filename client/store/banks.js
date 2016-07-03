import u from 'updeep';

import { assert,
         debug,
         has,
         localeComparator,
         NONE_CATEGORY_ID,
         translate as $t } from '../helpers';

import { Account, Alert, Bank, Operation } from '../models';

import * as backend from './backend';

import { compose,
         createReducerFromMap,
         makeStatusHandlers,
         SUCCESS, FAIL } from './helpers';

import {
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

    loadOperations(accountId) {
        return {
            type: LOAD_OPERATIONS,
            accountId
        }
    }

}

const [ failSetOperationType, successSetOperationType ] = makeStatusHandlers(basic.setOperationType);
const [ failSetOperationCategory, successSetOperationCategory ] =
    makeStatusHandlers(basic.setOperationCategory);
const [ failRunSync, successRunSync ] = makeStatusHandlers(basic.runSync);
const [ failLoadOperations, successLoadOperations ] = makeStatusHandlers(basic.loadOperations);

export function setOperationType(operation, typeId) {
    assert(typeof operation.id === 'string', 'SetOperationType first arg must have an id');
    assert(typeof typeId === 'string', 'SetOperationType second arg must be a String id');

    let formerTypeId = operation.operationTypeID;

    return dispatch => {
        dispatch(basic.setOperationType(operation, typeId, formerTypeId));
        backend.setTypeForOperation(operation.id, typeId).then(_ => {
            dispatch(successSetOperationType(operation, typeId, formerTypeId));
        }).catch(err => {
            dispatch(failSetOperationType(err, operation, typeId, formerTypeId));
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
        backend.setCategoryForOperation(operation.id, serverCategoryId).then(_ => {
            dispatch(successSetOperationCategory(operation, categoryId, formerCategoryId));
        }).catch(err => {
            dispatch(failSetOperationCategory(err, operation, categoryId, formerCategoryId));
        });
    };
}

function loadAccounts(state, get, bankId) {
    // TODO FIXME XXX this goes under the reducer for loading accounts
    function reduce(podAccounts) {
        let accounts = podAccounts.map(accountFromPOD);

        let bank = data.banks.get(bankId);
        for (let newacc of accounts) {
            if (bank.accounts.has(newacc.id)) {
                bank.accounts.get(newacc.id).mergeOwnProperties(newacc);
            } else {
                bank.accounts.set(newacc.id, newacc);
            }
        }
    }
}

function loadOperations(accountId) {
    return dispatch => {
        dispatch(basic.loadOperations(acc.id));
        backend.getOperations(accountId).then(operations => {

            // TODO FIXME XXX this goes under the reducer*
            let bank = data.banks.get(bankId);
            let acc = bank.accounts.get(accountId);
            let unknownOperationTypeId = store.getUnknownOperationType().id;
            acc.operations = operations.map(operationFromPOD(unknownOperationTypeId));

            sortOperations(acc.operations);
        })
        .catch(genericErrorHandler);
    }
};

export function runSync(state, get) {
    let access = get.currentAccess(state);

    let response = {};

    return dispatch => {
        dispatch(basic.runSync());
        backend.getNewOperations(access.id).then(() => {
            // Reload accounts, for updating the 'last updated' date.
            return backend.getAccounts(access.bankId);
        }).then(podAccounts => {
            // Reload operations asynchroneously.
            // TODO this should not be necessary, the server should return the
            // new operations and updated accounts after getNewOperations.
            let accounts = accountsByAccessId(state, access.id);
            for (let acc of accounts) {
                dispatch(loadOperations(acc.id));
            }
            dispatch(successRunSync(podAccounts));
        })
        .catch(err => {
            // TODO is this the right place?
            maybeHandleSyncError(err);
            dispatch(failRunSync(err));
        });
    }
}

// Helpers
function searchOp(operations, operationId) {
    for (let i = 0; i < operations.length; i++) {
        let op = operations[i];
        if (op.id === operationId)
            return [op, i];
    }
    assert(false);
}

function maybeHandleSyncError(err) {
    if (!err)
        return;

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

// Reducers
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

    let [_, idx] = searchOp(state.operations, action.operation.id);
    return u.updateIn(`operations.${idx}`, { categoryId }, state);
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

    let [_, idx] = searchOp(state.operations, action.operation.id);
    return u.updateIn(`operations.${idx}`, { operationTypeID }, state);
}

// TODO FIXME XXX implement me
function reduceRunSync(state, action) {
    let { status } = action;

    if (status === SUCCESS) {
        debug('Sync successfully terminated.');
        return state;
    }

    if (status === FAIL) {
        debug('Sync error:', action.error);
        return state;
    }

    debug ('Starting sync...');
    return state;
}

// TODO FIXME XXX implement me
function reduceLoadOperations(state, action) {
    return state;
}

const bankState = u({
    // A list of the banks.
    banks: [],
}, {});

const reducers = {
    SET_OPERATION_TYPE: reduceSetOperationType,
    SET_OPERATION_CATEGORY: reduceSetOperationCategory,
    RUN_SYNC: reduceRunSync,
    LOAD_OPERATIONS: reduceLoadOperations
};

export let reducer = createReducerFromMap(bankState, reducers);

// States
/*
{
    banks: [],
    accounts: [],
    operations: [],
    alerts: []
}
*/

// Initial state
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

export function initialState(state, get, allBanks, allAccounts, allOperations, allAlerts) {

    let unknownOperationTypeId = get.unknownOperationType(state).id;
    let defaultCurrency = get.setting(state, 'defaultCurrency');

    let banks = allBanks.map(b => new Bank(b));

    let accounts = allAccounts.map(a => new Account(a, defaultCurrency));
    sortAccounts(accounts);

    let accessMap = new Map;
    for (let a of allAccounts) {
        if (!accessMap.has(a.bankAccess)) {
            let bank = allBanks.filter(b => b.uuid === a.bank);

            // TODO necessary for the loadAccounts request, delete later.
            let bankId = bank.length ? bank[0].id : null;
            let name = bank.length ? bank[0].name : '?';

            let access = {
                id: a.bankAccess,
                uuid: a.bank,
                bankId,
                name
            };
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
        alerts
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
