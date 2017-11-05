import u from 'updeep';

import { createReducerFromMap, fillOutcomeHandlers, SUCCESS, FAIL } from './helpers';

import {
    SET_SEARCH_FIELD,
    SET_SEARCH_FIELDS,
    RESET_SEARCH,
    TOGGLE_SEARCH_DETAILS,
    LOAD_THEME,
    UPDATE_MODAL
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
    },

    setThemeLoadStatus(status) {
        return {
            type: LOAD_THEME,
            status
        };
    },

    showModal(slug, modalState) {
        return {
            type: UPDATE_MODAL,
            show: true,
            slug,
            modalState
        };
    },

    hideModal() {
        return {
            type: UPDATE_MODAL,
            show: false,
            slug: null,
            modalState: null
        };
    }
};

const fail = {},
    success = {};
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

export function startThemeLoad() {
    return basic.setThemeLoadStatus();
}

export function finishThemeLoad(status) {
    if (status) {
        return success.setThemeLoadStatus();
    }
    return fail.setThemeLoadStatus();
}

export function showModal(slug, modalState) {
    return basic.showModal(slug, modalState);
}

export function hideModal() {
    return basic.hideModal();
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
    if (typeof show !== 'boolean') {
        show = !getDisplaySearchDetails(state);
    }
    return u.updateIn('displaySearchDetails', show, state);
}

function reduceResetSearch(state, action) {
    let { showDetails } = action;
    return u(
        {
            search: initialSearch(showDetails)
        },
        state
    );
}

function reduceUpdateWeboob(state, action) {
    let { status } = action;

    if (status === SUCCESS) {
        return u({ updatingWeboob: false }, state);
    }

    if (status === FAIL) {
        if (action.error && typeof action.error.message === 'string') {
            alert(`Error when updating weboob: ${action.error.message}`);
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
        if (action.error && typeof action.error.message === 'string') {
            alert(`Error when trying to send test email: ${action.error.message}`);
        }

        return u({ sendingTestEmail: false }, state);
    }

    return u({ sendingTestEmail: true }, state);
}

function reduceExportInstance(state, action) {
    let { status } = action;

    if (status === SUCCESS || status === FAIL) {
        return u({ isExporting: false }, state);
    }

    return u({ isExporting: true }, state);
}

function reduceUpdateModal(state, action) {
    let { show } = action;
    let update = { isOpen: show };

    if (show) {
        update.slug = action.slug;
        update.state = action.modalState;
    }

    return u({ modal: update }, state);
}

function reduceSetSetting(state, action) {
    // Hide the modal only if save setting succeeded, and for the appropriate setting.
    if (action.key === 'duplicateThreshold') {
        return reduceHideModalOnSuccess(state, action);
    }
    return state;
}

function reduceHideModalOnSuccess(state, action) {
    if (action.status === SUCCESS) {
        return u({ modal: { isOpen: false, slug: null, state: null } }, state);
    }
    return state;
}

// Generate the reducer to display or not the spinner, and hide or not the modal on success.
function makeProcessingReasonReducer(processingReason, hideModalOnSuccess) {
    return function(state, action) {
        let { status } = action;

        let newState = hideModalOnSuccess ? reduceHideModalOnSuccess(state, action) : state;

        if (status === FAIL || status === SUCCESS) {
            return u({ processingReason: null }, newState);
        }

        return u({ processingReason }, newState);
    };
}

const reducers = {
    IMPORT_INSTANCE: makeProcessingReasonReducer('client.spinner.import'),
    CREATE_ACCESS: makeProcessingReasonReducer('client.spinner.fetch_account'),
    DELETE_ACCESS: makeProcessingReasonReducer('client.spinner.delete_account'),
    DELETE_ACCOUNT: makeProcessingReasonReducer('client.spinner.delete_account'),
    DISABLE_ACCESS: reduceHideModalOnSuccess,
    RESET_SEARCH: reduceResetSearch,
    RUN_ACCOUNTS_SYNC: makeProcessingReasonReducer('client.spinner.sync'),
    RUN_BALANCE_RESYNC: makeProcessingReasonReducer('client.spinner.balance_resync', true),
    RUN_OPERATIONS_SYNC: makeProcessingReasonReducer('client.spinner.sync'),
    SEND_TEST_EMAIL: reduceSendTestEmail,
    SET_SEARCH_FIELD: reduceSetSearchField,
    SET_SEARCH_FIELDS: reduceSetSearchFields,
    SET_SETTING: reduceSetSetting,
    TOGGLE_SEARCH_DETAILS: reduceToggleSearchDetails,
    LOAD_THEME: makeProcessingReasonReducer('client.general.loading_assets'),
    UPDATE_ACCESS: makeProcessingReasonReducer('client.spinner.fetch_account'),
    UPDATE_MODAL: reduceUpdateModal,
    UPDATE_WEBOOB: reduceUpdateWeboob,
    EXPORT_INSTANCE: reduceExportInstance
};

const uiState = u({
    search: {},
    displaySearchDetails: false,
    processingReason: 'client.general.loading_assets',
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
    return u(
        {
            search,
            displaySearchDetails: false,
            processingReason: 'client.general.loading_assets',
            updatingWeboob: false,
            sendingTestEmail: false,
            isExporting: false,
            modal: {
                isOpen: false,
                slug: null,
                state: null
            }
        },
        {}
    );
}

// Getters
export function getSearchFields(state) {
    return state.search;
}
export function hasSearchFields(state) {
    // Keep in sync with initialSearch();
    let { search } = state;
    return (
        search.keywords.length ||
        search.categoryId !== '' ||
        search.type !== '' ||
        search.amountLow !== null ||
        search.amountHigh !== null ||
        search.dateLow !== null ||
        search.dateHigh !== null
    );
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

export function isExporting(state) {
    return state.isExporting;
}

export function getModal(state) {
    return state.modal;
}
