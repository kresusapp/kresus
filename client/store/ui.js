import u from 'updeep';

import { createReducerFromMap } from './helpers';

import {
    SET_SCREEN_WIDTH,
    SET_SEARCH_FIELD,
    SET_SEARCH_FIELDS,
    RESET_SEARCH,
    TOGGLE_SEARCH_DETAILS
} from './actions';

const SMALL_SCREEN_MAX_WIDTH = 768;

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

    setScreenWidth(width) {
        return {
            type: SET_SCREEN_WIDTH,
            width
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
export function setScreenWidth(width) {
    return basic.setScreenWidth(width);
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
    show = show || !getDisplaySearchDetails(state);
    return u.updateIn('displaySearchDetails', show, state);
}

function reduceResetSearch(state, action) {
    let { showDetails } = action;
    return u({
        search: initialSearch(showDetails)
    }, state);
}

function computeIsSmallScreen(width = null) {
    let actualWidth = width;
    if (width === null) {
        // Mocha does not know window, tests fail without testing window != undefined.
        actualWidth = typeof window !== 'undefined' ? window.innerWidth : +Infinity;
    }
    return actualWidth <= SMALL_SCREEN_MAX_WIDTH;
}

function reduceSetScreenWidth(state, action) {
    return u({
        isSmallScreen: computeIsSmallScreen(action.width)
    }, state);
}

const reducers = {
    SET_SEARCH_FIELD: reduceSetSearchField,
    SET_SEARCH_FIELDS: reduceSetSearchFields,
    RESET_SEARCH: reduceResetSearch,
    TOGGLE_SEARCH_DETAILS: reduceToggleSearchDetails,
    SET_SCREEN_WIDTH: reduceSetScreenWidth
};

const uiState = u({
    search: {},
    displaySearchDetails: false,
    isSmallScreen: computeIsSmallScreen()
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
        displaySearchDetails: false,
        isSmallScreen: computeIsSmallScreen()
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

export function isSmallScreen(state) {
    return state.isSmallScreen;
}
