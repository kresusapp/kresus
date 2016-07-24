import u from 'updeep';

import { has, assert, assertDefined, debug, setupTranslator, translate as $t } from '../helpers';

import { createReducerFromMap,
         SUCCESS, FAIL } from './helpers';

import {
    DELETE_ACCESS,
    DELETE_ACCOUNT,
    LOAD_ACCOUNTS,
    SET_ACCESS_ID,
    SET_ACCOUNT_ID,
    SET_SEARCH_FIELD,
    RESET_SEARCH,
    RUN_SYNC
} from './actions';

const uiState = u({
    currentAccessId: null,
    currentAccountId: null
});

// Basic action creators
const basic = {

    setAccessId(id) {
        return {
            type: SET_ACCESS_ID,
            id
        }
    },

    setAccountId(id) {
        return {
            type: SET_ACCOUNT_ID,
            id
        }
    },

    setSearchField(field, value) {
        return {
            type: SET_SEARCH_FIELD,
            field,
            value
        }
    },

    resetSearch() {
        return {
            type: RESET_SEARCH
        }
    }

};

export function setCurrentAccessId(accessId) {
    return basic.setAccessId(accessId);
}
export function setCurrentAccountId(accountId) {
    return basic.setAccountId(accountId);
}
export function setSearchField(field, value) {
    return basic.setSearchField(field, value);
}
export function resetSearch() {
    return basic.resetSearch();
}

// Reducers
function reduceSetCurrentAccessId(state, action) {
    let { id } = action;
    return u({
        currentAccessId: id
    }, state);
}

function reduceSetCurrentAccountId(state, action) {
    let { id } = action;
    return u({
        currentAccountId: id
    }, state);
}

function reduceSetSearchField(state, action) {
    let { field, value } = action;
    return u.updateIn(['search', field], value, state);
}

function reduceResetSearch(state) {
    return u({
        search: initialSearch()
    }, state);
}

function reduceRunSync(state, action) {
    let { status } = action;

    if (status === FAIL || status === SUCCESS) {
        return u({ isSynchronizing: false }, state);
    }

    return u({ isSynchronizing: true }, state);
}

function reduceDeleteAccount(state, action) {
    let { status } = action;

    if (status !== SUCCESS) {
        return state;
    }

    if (getCurrentAccountId(state) !== action.accountId) {
        return state;
    }

    let { otherAccess, otherAccount } = action;

    // If this was the last account bound to the access, then there'll be
    // another access and related account.
    if (otherAccess) {
        return u({
            currentAccessId: otherAccess.id,
            currentAccountId: otherAccount.id
        }, state);
    }

    // If there was no other access and no other account, then there is nothing
    // left and the user must create a new access.
    if (!otherAccount) {
        return u({
            currentAccessId: null,
            currentAccountId: null
        }, state);
    }

    // Otherwise, there'll be another account.
    return u({
        currentAccountId: otherAccount.id
    }, state);
}

function reduceDeleteAccess(state, action) {
    let { status } = action;

    if (status !== SUCCESS) {
        return state;
    }

    if (getCurrentAccessId(state) !== action.accessId) {
        return state;
    }

    let { otherAccess, otherAccount } = action;

    // If there is not other access, then the user must create a new access.
    if (!otherAccess) {
        return u({
            currentAccessId: null,
            currentAccountId: null
        }, state);
    }

    assertDefined(otherAccount, "can't have an access that has no tied accounts");

    return u({
        currentAccessId: otherAccess.id,
        currentAccountId: otherAccount.id
    }, state);
}

function reduceLoadAccounts(state, action) {
    let { status } = action;

    if (status !== SUCCESS) {
        return state;
    }

    if (getCurrentAccountId(state) !== null) {
        return state;
    }

    let { accessId, accounts } = action;

    if (!accounts.length) {
        debug('Unexpected: an access should be bound to a least one account.');
        return state;
    }

    return u({
        currentAccessId: accessId,
        currentAccountId: accounts[0].id
    }, state);
}

const reducers = {
    DELETE_ACCESS: reduceDeleteAccess,
    DELETE_ACCOUNT: reduceDeleteAccount,
    LOAD_ACCOUNTS: reduceLoadAccounts,
    SET_ACCESS_ID: reduceSetCurrentAccessId,
    SET_ACCOUNT_ID: reduceSetCurrentAccountId,
    SET_SEARCH_FIELD: reduceSetSearchField,
    RESET_SEARCH: reduceResetSearch,
    RUN_SYNC: reduceRunSync
};

export let reducer = createReducerFromMap(uiState, reducers);

// Initial state
function initialSearch() {
    return {
        keywords: [],
        categoryId: '',
        typeId: '',
        amountLow: '',
        amountHigh: '',
        dateLow: null,
        dateHigh: null
    };
}

export function initialState(state, get) {

    let currentAccountId = null;
    let currentAccessId = null;

    let defaultAccountId = get.defaultAccountId(state);

    let allAccesses = get.accesses(state);

    out:
    for (let access of allAccesses) {
        for (let account of get.accountsByAccessId(state, access.id)) {

            if (account.id === defaultAccountId) {
                currentAccountId = account.id;
                currentAccessId = account.bankAccess;
                break out;
            }

            if (!currentAccountId) {
                currentAccountId = account.id;
                currentAccessId = account.bankAccess;
            }
        }
    }

    let search = initialSearch();

    return u({
        currentAccessId,
        currentAccountId,
        search,
        isSynchronizing: false
    }, {});
}

// Getters
export function getCurrentAccessId(state) {
    return state.currentAccessId;
}

export function getCurrentAccountId(state) {
    return state.currentAccountId;
}

export function getSearchFields(state) {
    return state.search;
}
export function hasSearchFields(state) {
    // Keep in sync with initialSearch();
    let { search } = state;
    return search.keywords.length ||
           search.categoryId !== '' ||
           search.typeId !== '' ||
           search.amountLow !== '' ||
           search.amountHigh !== '' ||
           search.dateLow !== null ||
           search.dateHigh !== null;
}

export function isSynchronizing(state) {
    return state.isSynchronizing;
}
