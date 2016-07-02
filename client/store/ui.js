import u from 'updeep';

import { has, assert, debug, setupTranslator, translate as $t } from '../helpers';

import { createReducerFromMap, makeStatusHandlers, SUCCESS, FAIL } from './helpers';

const uiState = u({
    currentAccessId: null,
    currentAccountId: null
});

// Actions
const SET_ACCESS_ID = "SET_ACCESS_ID";
const SET_ACCOUNT_ID = "SET_ACCOUNT_ID";
const SET_SEARCH_FIELD = "SET_SEARCH_FIELD";
const RESET_SEARCH = "RESET_SEARCH";

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

export function setCurrentAccessId(bankId) {
    return basic.setAccessId(bankId);
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
    debug(`setting ${field} to ${value}`);
    return u.updateIn(['search', field], value, state);
}

function reduceResetSearch(state) {
    debug('resetting search');
    return u({
        search: initialSearch()
    }, state);
}

const reducers = {
    SET_ACCESS_ID: reduceSetCurrentAccessId,
    SET_ACCOUNT_ID: reduceSetCurrentAccountId,
    SET_SEARCH_FIELD: reduceSetSearchField,
    RESET_SEARCH: reduceResetSearch,
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

export function initialState(store) {

    let currentAccountId = null;
    let currentAccessId = null;

    let defaultAccountId = store.getDefaultAccountId();

    let allAccesses = store.getAccesses();

    out:
    for (let access of allAccesses) {
        for (let account of store.accountsByAccessId(access.id)) {

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
        search
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
