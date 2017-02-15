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

    toggleSearchDetails() {
        return {
            type: TOGGLE_SEARCH_DETAILS
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

export function toggleSearchDetails() {
    return basic.toggleSearchDetails();
}

// Reducers
function reduceSetSearchField(state, action) {
    let { field, value } = action;
    return u.updateIn(['search', field], value, state);
}

function reduceSetSearchFields(state, action) {
    return u.updateIn(['search'], action.fieldsMap, state);
}

function reduceToggleSearchDetails(state) {
    let value = !getSearchFields(state).showDetails;
    return reduceSetSearchField(state, { field: 'showDetails', value });
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
    TOGGLE_SEARCH_DETAILS: reduceToggleSearchDetails,
    RESET_SEARCH: reduceResetSearch
};

const uiState = u({
    search: {}
});

export const reducer = createReducerFromMap(uiState, reducers);

// Initial state
function initialSearch(showDetails) {
    return {
        keywords: [],
        categoryId: '',
        type: '',
        amountLow: null,
        amountHigh: null,
        dateLow: null,
        dateHigh: null,
        showDetails
    };
}

export function initialState() {
    let search = initialSearch(false);
    return u({
        search
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
