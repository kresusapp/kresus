import u from 'updeep';

import * as backend from './backend';
import {
    createReducerFromMap,
    fillOutcomeHandlers,
    SUCCESS,
    FAIL
} from './helpers';

import {
    SEND_TEST_EMAIL,
    SET_SEARCH_FIELD,
    SET_SEARCH_FIELDS,
    RESET_SEARCH,
    TOGGLE_SEARCH_DETAILS,
    UPDATE_WEBOOB
} from './actions';

// Basic action creators
const basic = {
    sendTestEmail() {
        return {
            type: SEND_TEST_EMAIL
        };
    },

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
    },

    updateWeboob() {
        return {
            type: UPDATE_WEBOOB
        };
    }
};

const fail = {}, success = {};
fillOutcomeHandlers(basic, fail, success);

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

export function updateWeboob() {
    return dispatch => {
        dispatch(basic.updateWeboob());
        backend.updateWeboob().then(() => {
            dispatch(success.updateWeboob());
        }).catch(err => {
            dispatch(fail.updateWeboob(err));
        });
    };
}

export function sendTestEmail(config) {
    return dispatch => {
        dispatch(basic.sendTestEmail());
        backend.sendTestEmail(config)
        .then(() => {
            dispatch(success.sendTestEmail());
        }).catch(err => {
            dispatch(fail.sendTestEmail(err));
        });
    };
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

function reduceUpdateWeboob(state, action) {
    let { status } = action;

    if (status === SUCCESS) {
        return u({ updatingWeboob: false }, state);
    }

    if (status === FAIL) {
        if (action.error && typeof action.error.message === 'string') {
            alert(action.error.message);
        }

        return u({ updatingWeboob: false }, state);
    }

    return u({ updatingWeboob: true }, state);
}

function reduceSendTestEmail(state, action) {
    let { status } = action;

    if (status === SUCCESS) {
        return u({ sendingTestEmail: false }, state);
    }

    if (status === FAIL) {
        if (action.error.message) {
            alert(`Error when trying to send test email: ${action.error.message}`);
        }

        return u({ sendingTestEmail: false }, state);
    }

    return u({ sendingTestEmail: true }, state);
}

const reducers = {
    IMPORT_INSTANCE: makeReducer('client.spinner.import'),
    CREATE_ACCESS: makeReducer('client.spinner.fetch_account'),
    DELETE_ACCESS: makeReducer('client.spinner.delete_account'),
    DELETE_ACCOUNT: makeReducer('client.spinner.delete_account'),
    RESET_SEARCH: reduceResetSearch,
    RUN_ACCOUNTS_SYNC: makeReducer('client.spinner.sync'),
    RUN_BALANCE_RESYNC: makeReducer('client.spinner.balance_resync'),
    RUN_OPERATIONS_SYNC: makeReducer('client.spinner.sync'),
    SEND_TEST_EMAIL: reduceSendTestEmail,
    SET_SEARCH_FIELD: reduceSetSearchField,
    SET_SEARCH_FIELDS: reduceSetSearchFields,
    TOGGLE_SEARCH_DETAILS: reduceToggleSearchDetails,
    UPDATE_ACCESS: makeReducer('client.spinner.fetch_account'),
    UPDATE_WEBOOB: reduceUpdateWeboob
};

const uiState = u({
    search: {},
    displaySearchDetails: false,
    processingReason: null,
    updatingWeboob: false,
    sendingTestEmail: false
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
        processingReason: null
    }, {});
}

// Generate the reducer to display or not the spinner.
function makeReducer(processingReason) {
    return function(state, action) {
        let { status } = action;

        if (status === FAIL || status === SUCCESS) {
            return u({ processingReason: null }, state);
        }

        return u({ processingReason }, state);
    };
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

export function getProcessingReason(state) {
    return state.processingReason;
}

export function isWeboobUpdating(state) {
    return state.updatingWeboob;
}

export function isSendingTestEmail(state) {
    return state.sendingTestEmail;
}
