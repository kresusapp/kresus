import u from 'updeep';

import { createReducerFromMap,
         SUCCESS, FAIL } from './helpers';

import {
    SET_SEARCH_FIELD,
    RESET_SEARCH,
} from './actions';

// Basic action creators
const basic = {

    setSearchField(field, value) {
        return {
            type: SET_SEARCH_FIELD,
            field,
            value
        };
    },

    resetSearch() {
        return {
            type: RESET_SEARCH
        };
    }

};

export function setSearchField(field, value) {
    return basic.setSearchField(field, value);
}
export function resetSearch() {
    return basic.resetSearch();
}

// Reducers
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

const reducers = {
    SET_SEARCH_FIELD: reduceSetSearchField,
    RESET_SEARCH: reduceResetSearch,
    RUN_SYNC: reduceRunSync
};

const uiState = u({
    search: {},
    isSynchronizing: false
});

export let reducer = createReducerFromMap(uiState, reducers);

// Initial state
function initialSearch() {
    return {
        keywords: [],
        categoryId: '',
        type: '',
        amountLow: '',
        amountHigh: '',
        dateLow: null,
        dateHigh: null
    };
}

export function initialState() {
    let search = initialSearch();
    return u({
        search,
        isSynchronizing: false
    }, {});
}

// Getters
export function getSearchFields(state) {
    return state.search;
}
export function hasSearchFields(state) {
    // Keep in sync with initialSearch();
    let { search } = state;
    return search.keywords.length ||
           search.categoryId !== '' ||
           search.type !== '' ||
           search.amountLow !== '' ||
           search.amountHigh !== '' ||
           search.dateLow !== null ||
           search.dateHigh !== null;
}

export function isSynchronizing(state) {
    return state.isSynchronizing;
}
