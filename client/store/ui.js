import u from 'updeep';

import { has, assert, debug, setupTranslator, translate as $t } from '../helpers';

import { createReducerFromMap, makeStatusHandlers, SUCCESS, FAIL } from './helpers';

const uiState = u({
    currentBankId: null,
    currentAccountId: null
});

// Actions
const SET_BANK_ID = "SET_BANK_ID";
const SET_ACCOUNT_ID = "SET_ACCOUNT_ID";
const SET_SEARCH_FIELD = "SET_SEARCH_FIELD";
const RESET_SEARCH = "RESET_SEARCH";

// Basic action creators
const basic = {

    setBankId(id) {
        return {
            type: SET_BANK_ID,
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

export function setCurrentBankId(bankId) {
    return basic.setBankId(bankId);
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
function reduceSetCurrentBankId(state, action) {
    let { id } = action;
    return u({
        currentBankId: id
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
    SET_BANK_ID: reduceSetCurrentBankId,
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
    let currentBankId = null;

    let defaultAccountId = store.getDefaultAccountId();

    let allBanks = store.getBanks();

    out:
    for (let bank of allBanks) {
        for (let account of store.getBankAccounts(bank.uuid)) {

            if (account.id === defaultAccountId) {
                currentAccountId = account.id;
                currentBankId = bank.id;
                break out;
            }

            if (!currentAccountId) {
                currentAccountId = account.id;
                currentBankId = bank.id;
            }
        }
    }

    let search = initialSearch();

    return u({
        currentBankId,
        currentAccountId,
        search
    }, {});
}

// Getters
export function getCurrentBankId(state) {
    return state.currentBankId;
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
