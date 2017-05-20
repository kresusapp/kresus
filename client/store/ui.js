import u from 'updeep';

import { createReducerFromMap } from './helpers';

import {
    SET_SEARCH_FIELD,
    SET_SEARCH_FIELDS,
    RESET_SEARCH,
    TOGGLE_SEARCH_DETAILS,
    SET_IS_SMALL_SCREEN
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

    setIsSmallScreen(width) {
        return {
            type: SET_IS_SMALL_SCREEN,
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
export function setIsSmallScreen(width) {
    return basic.setIsSmallScreen(width);
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

function reduceSetIsSmallScreen(state, action) {
    return u({
        isSmallScreen: action.width < SMALL_SCREEN_MAX_WIDTH
    }, state);
}

const reducers = {
    SET_SEARCH_FIELD: reduceSetSearchField,
    SET_SEARCH_FIELDS: reduceSetSearchFields,
    RESET_SEARCH: reduceResetSearch,
    TOGGLE_SEARCH_DETAILS: reduceToggleSearchDetails,
    SET_IS_SMALL_SCREEN: reduceSetIsSmallScreen
};

const SMALL_SCREEN_MAX_WIDTH = 768;

// Mocha does not know window, tests fail without testing window != undefined.
let isSmallScreenBool = false;
if (typeof window !== 'undefined') {
    isSmallScreenBool = window.innerWidth <= SMALL_SCREEN_MAX_WIDTH;
}

const uiState = u({
    search: {},
    displaySearchDetails: false,
    isSmallScreen: isSmallScreenBool
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
        isSmallScreen: isSmallScreenBool
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
