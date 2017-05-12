import u from 'updeep';

import { createReducerFromMap } from './helpers';

import {
    SET_SEARCH_FIELD,
    SET_SEARCH_FIELDS,
    RESET_SEARCH,
    TOGGLE_SEARCH_DETAILS
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

    setSearchFields(fieldsMap) {
        return {
            type: SET_SEARCH_FIELDS,
            fieldsMap
        };
    },

    resetSearch(showDetails) {
        return {
            type: RESET_SEARCH,
            showDetails
        };
    },

    toggleSearchDetails(show) {
        return {
            type: TOGGLE_SEARCH_DETAILS,
            show
        };
    }
};

export function setSearchField(field, value) {
    return basic.setSearchField(field, value);
}
export function setSearchFields(fieldsMap) {
    return basic.setSearchFields(fieldsMap);
}
export function resetSearch(showDetails) {
    return basic.resetSearch(showDetails);
}
export function toggleSearchDetails(show) {
    return basic.toggleSearchDetails(show);
}

// Reducers
function reduceSetSearchField(state, action) {
    let { field, value } = action;
    return u.updateIn(['search', field], value, state);
}

function reduceSetSearchFields(state, action) {
    return u.updateIn(['search'], action.fieldsMap, state);
}

function reduceToggleSearchDetails(state, action) {
    let { show } = action;
    if (typeof show !== 'boolean')
        show = !getDisplaySearchDetails(state);
    return u.updateIn('displaySearchDetails', show, state);
}

function reduceResetSearch(state, action) {
    let { showDetails } = action;
    return u({
        search: initialSearch(showDetails)
    }, state);
}

const reducers = {
    SET_SEARCH_FIELD: reduceSetSearchField,
    SET_SEARCH_FIELDS: reduceSetSearchFields,
    RESET_SEARCH: reduceResetSearch,
    TOGGLE_SEARCH_DETAILS: reduceToggleSearchDetails
};

const uiState = u({
    search: {},
    displaySearchDetails: false
});

export const reducer = createReducerFromMap(uiState, reducers);

// Initial state
function initialSearch() {
    return {
        keywords: [],
        categoryId: '',
        type: '',
        amountLow: null,
        amountHigh: null,
        dateLow: null,
        dateHigh: null
    };
}

export function initialState() {
    let search = initialSearch();
    return u({
        search,
        displaySearchDetails: false
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
           search.amountLow !== null ||
           search.amountHigh !== null ||
           search.dateLow !== null ||
           search.dateHigh !== null;
}

export function getDisplaySearchDetails(state) {
    return state.displaySearchDetails;
}
