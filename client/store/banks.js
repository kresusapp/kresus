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

// Actions
const SET_OPERATION_TYPE = "SET_OPERATION_TYPE";
const SET_OPERATION_CATEGORY = "SET_OPERATION_CATEGORY";

// Basic actions creators
const basic = {

    setOperationCategory(operation, categoryId) {
        return {
            type: SET_OPERATION_CATEGORY,
            operation,
            categoryId
        };
    },

    setOperationType(operation, typeId) {
        return {
            type: SET_OPERATION_TYPE,
            operation,
            typeId
        };
    }

}

const [ failSetOperationType, successSetOperationType ] = makeStatusHandlers(basic.setOperationType);
const [ failSetOperationCategory, successSetOperationCategory ] =
    makeStatusHandlers(basic.setOperationCategory);

export function setOperationType(operation, typeId) {
    assert(typeof operation.id === 'string', 'SetOperationType first arg must have an id');
    assert(typeof typeId === 'string', 'SetOperationType second arg must be a String id');

    return dispatch => {
        dispatch(basic.setOperationType(operation, typeId));
        backend.setTypeForOperation(operation.id, typeId).then(_ => {
            dispatch(successSetOperationType(operation, typeId));
        }).catch(err => {
            dispatch(failSetOperationType(err, operation, typeId));
        });
    };
}

export function setOperationCategory(operation, categoryId) {
    assert(typeof operation.id === 'string', 'SetOperationCategory first arg must have an id');
    assert(typeof categoryId === 'string', 'SetOperationCategory 2nd arg must be String id');

    // The server expects an empty string for replacing by none
    categoryId = categoryId === NONE_CATEGORY_ID ? '' : categoryId;

    return dispatch => {
        dispatch(basic.setOperationCategory(operation, categoryId));
        backend.setCategoryForOperation(operation.id, categoryId).then(_ => {
            dispatch(successSetOperationCategory(operation, categoryId));
        }).catch(err => {
            dispatch(failSetOperationCategory(err, operation, categoryId));
        });
    };
}

// Reducers
function reduceSetOperationCategory(state, action) {
    let { status } = action;

    if (status === SUCCESS) {
        debug("Operation's category successfully set");

        let bankIndex = null;
        let accountIndex = null;
        let operationIndex = null;

        // TODO FIXME this is terrible
        for (let i = 0; i < state.banks.length; i++) {
            let accounts = state.banks[i].accounts;
            for (let j = 0; j < accounts.length; j++) {
                if (accounts[j].accountNumber === action.operation.bankAccount) {
                    bankIndex = i;
                    accountIndex = j;
                    for (let k = 0; k < accounts[j].operations.length; k++) {
                        if (accounts[j].operations[k].id === action.operation.id) {
                            operationIndex = k;
                            break;
                        }
                    }
                }
            }
        }

        let path =`banks.${bankIndex}.accounts.${accountIndex}.operations.${operationIndex}`;
        return u.updateIn(path, { categoryId: action.categoryId }, state);
    }

    if (status === FAIL) {
        debug("Error when setting category for an operation", action.error);
    } else {
        debug('Starting settings category for an operation...');
    }

    return state;
}

function reduceSetOperationType(state) {
    // TODO
    return state;
}

const bankState = u({
    // A list of the banks.
    banks: [],
}, {});

const reducers = {
    SET_OPERATION_TYPE: reduceSetOperationType,
    SET_OPERATION_CATEGORY: reduceSetOperationCategory,
};

export let reducer = createReducerFromMap(bankState, reducers);

// States
/*
[
    {
        bankId,
        bankMetadata,
        accounts: [
            {
                accountId,
                accountMetadata,
                operations: [
                    { operation }
                ],
                alerts: [
                    { alert }
                ]
            }
        ]
    }
]
*/

// Initial state
function getRelatedAccounts(bankId, accounts) {
    // Return a map of accessId -> [accounts] for this given bankId.
    let unclusterized = accounts.filter(acc => acc.bank === bankId);
    let clusters = {};
    for (let account of unclusterized) {
        let cluster = clusters[account.bankAccess] = clusters[account.bankAccess] || [];
        cluster.push(account);
    }
    return clusters;
}

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

export function initialState(store, allBanks, allAccounts, allOperations, allAlerts) {

    let unknownOperationTypeId = store.getUnknownOperationType().id;
    let defaultCurrency = store.getSetting('defaultCurrency');

    let banks = [];
    for (let bankPOD of allBanks) {
        let bank = new Bank(bankPOD);

        let clusters = getRelatedAccounts(bank.uuid, allAccounts);
        if (!Object.keys(clusters).length)
            continue;

        // Found a bank with accounts.
        for (let i in clusters) {
            let accounts = clusters[i];

            banks.push(bank);

            sortAccounts(accounts);

            bank.accounts = [];
            for (let accPOD of accounts) {
                let acc = new Account(accPOD, defaultCurrency);

                bank.accounts.push(acc);

                acc.operations = getRelatedOperations(acc.accountNumber, allOperations)
                                 .map(operationFromPOD(unknownOperationTypeId));

                sortOperations(acc.operations);

                acc.alerts = getRelatedAlerts(acc.accountNumber, allAlerts)
                             .map(al => new Alert(al));
            }
        }
    }

    return u({ banks }, {});
};

// Getters
export function all(state) {
    return state.banks;
}

export function byId(state, bankId) {
    let found = state.banks.filter(bank => bank.id === bankId);
    return found.length ? found[0] : null;
}

export function accountById(state, accountId) {
    let account = null;
    for (let bank of state.banks) {
        let found = bank.accounts.filter(acc => acc.id === accountId);
        if (found.length) {
            account = found[0];
            break;
        }
    }
    return account;
}

export function accountsByBankId(state, bankId) {
    // TODO this won't handle correctly multiple accounts at the same bank
    // => add a "cluster index" parameter.
    let bank = byId(state, bankId);
    if (!bank)
        return null;
    return bank.accounts;
}
