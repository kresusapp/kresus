import u from 'updeep';

import { createReducerFromMap, fillOutcomeHandlers, SUCCESS, FAIL } from './helpers';

import {
    SET_IS_SMALL_SCREEN,
    SET_SEARCH_FIELD,
    SET_SEARCH_FIELDS,
    RESET_SEARCH,
    TOGGLE_SEARCH_DETAILS,
    LOAD_THEME,
    UPDATE_MODAL,
    TOGGLE_MENU,
    ENABLE_DEMO_MODE,
    DISABLE_DEMO_MODE
} from './actions';

import { translate as $t, computeIsSmallScreen, notify } from '../helpers';
import { get as getErrorCode, genericErrorHandler } from '../errors';

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

    resetSearch() {
        return {
            type: RESET_SEARCH
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

    setIsSmallScreen(isSmall) {
        return {
            type: SET_IS_SMALL_SCREEN,
            isSmall
        };
    },

    showModal(slug, modalState) {
        return {
            type: UPDATE_MODAL,
            slug,
            modalState
        };
    },

    hideModal() {
        return {
            type: UPDATE_MODAL,
            slug: null,
            modalState: null
        };
    },

    toggleMenu(hideMenu) {
        return {
            type: TOGGLE_MENU,
            hideMenu
        };
    },

    enableDemo() {
        return {
            type: ENABLE_DEMO_MODE
        };
    },

    disableDemo() {
        return {
            type: DISABLE_DEMO_MODE
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
export function resetSearch() {
    return basic.resetSearch();
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

export function setIsSmallScreen(isSmall) {
    return basic.setIsSmallScreen(isSmall);
}

export function showModal(slug, modalState) {
    return basic.showModal(slug, modalState);
}

export function hideModal() {
    return basic.hideModal();
}

export function toggleMenu(hideMenu) {
    return basic.toggleMenu(hideMenu);
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
    return u({ displaySearchDetails: show }, state);
}

function reduceResetSearch(state) {
    return u(
        {
            search: initialSearch()
        },
        state
    );
}

function reduceUpdateWeboob(state, action) {
    let { status } = action;

    if (status === SUCCESS) {
        notify.success($t('client.settings.update_weboob_success'));
        return u({ updatingWeboob: false }, state);
    }

    if (status === FAIL) {
        if (action.error && typeof action.error.message === 'string') {
            notify.error(
                $t('client.settings.update_weboob_error', { error: action.error.message })
            );
        }

        return u({ updatingWeboob: false }, state);
    }

    return u({ updatingWeboob: true }, state);
}

function reduceSendTestEmail(state, action) {
    let { status } = action;

    if (status === SUCCESS) {
        notify.success($t('client.settings.emails.send_test_email_success'));
        return u({ sendingTestEmail: false }, state);
    }

    if (status === FAIL) {
        if (action.error && typeof action.error.message === 'string') {
            notify.error(
                $t('client.settings.emails.send_test_email_error', { error: action.error.message })
            );
        }

        return u({ sendingTestEmail: false }, state);
    }

    return u({ sendingTestEmail: true }, state);
}

function reduceExportInstance(state, action) {
    let { status } = action;

    if (status === SUCCESS) {
        return u({ isExporting: false }, state);
    }

    if (status === FAIL) {
        notify.error(action.error && action.error.message);
        return u({ isExporting: false }, state);
    }

    return u({ isExporting: true }, state);
}

function reduceSetIsSmallScreen(state, action) {
    let { isSmall } = action;
    return u({ isSmallScreen: isSmall }, state);
}

function reduceUpdateModal(state, action) {
    let { slug, modalState } = action;
    return u({ modal: { slug, state: modalState } }, state);
}

function makeHideModalOnSuccess(reducer = null) {
    return function(state, action) {
        let newState = state;
        if (reducer !== null) {
            newState = reducer(state, action);
        }
        if (action.status === SUCCESS) {
            return reduceUpdateModal(newState, { slug: null, modalState: null });
        }
        return newState;
    };
}

const hideModalOnSuccess = makeHideModalOnSuccess();

// Generates the reducer to display or not the spinner.
function makeProcessingReasonReducer(processingReason) {
    return function(state, action) {
        let { status } = action;
        if (status === FAIL || status === SUCCESS) {
            return u({ processingReason: null }, state);
        }
        return u({ processingReason }, state);
    };
}

const spinOnImport = makeProcessingReasonReducer('client.spinner.import');

function reduceImport(state, action) {
    let newState = spinOnImport(state, action);

    let { status } = action;
    if (status === FAIL) {
        let { error } = action;
        switch (error.errCode) {
            case getErrorCode('INVALID_ENCRYPTED_EXPORT'):
                notify.error($t('client.settings.invalid_encrypted_export'));
                break;
            case getErrorCode('INVALID_PASSWORD_JSON_EXPORT'):
                notify.error($t('client.settings.invalid_password_json_export'));
                break;
            default:
                genericErrorHandler(error);
                break;
        }
    } else if (status === SUCCESS) {
        notify.success($t('client.settings.successful_import'));
    }

    return newState;
}

function reduceToggleMenu(state, action) {
    let { hideMenu } = action;
    if (typeof hideMenu !== 'undefined') {
        return u({ isMenuHidden: hideMenu }, state);
    }
    return u({ isMenuHidden: !isMenuHidden(state) }, state);
}

const reducers = {
    IMPORT_INSTANCE: reduceImport,
    CREATE_ACCESS: makeProcessingReasonReducer('client.spinner.fetch_account'),
    DELETE_ACCESS: makeHideModalOnSuccess(
        makeProcessingReasonReducer('client.spinner.delete_account')
    ),
    DELETE_ACCOUNT: makeHideModalOnSuccess(
        makeProcessingReasonReducer('client.spinner.delete_account')
    ),
    DELETE_ALERT: hideModalOnSuccess,
    DELETE_CATEGORY: hideModalOnSuccess,
    DELETE_OPERATION: hideModalOnSuccess,
    RESET_SEARCH: reduceResetSearch,
    RUN_ACCOUNTS_SYNC: makeProcessingReasonReducer('client.spinner.sync'),
    RUN_BALANCE_RESYNC: makeProcessingReasonReducer('client.spinner.balance_resync'),
    RUN_OPERATIONS_SYNC: makeProcessingReasonReducer('client.spinner.sync'),
    SEND_TEST_EMAIL: reduceSendTestEmail,
    SET_SEARCH_FIELD: reduceSetSearchField,
    SET_SEARCH_FIELDS: reduceSetSearchFields,
    TOGGLE_SEARCH_DETAILS: reduceToggleSearchDetails,
    LOAD_THEME: makeProcessingReasonReducer('client.general.loading_assets'),
    UPDATE_ACCESS_AND_FETCH: makeProcessingReasonReducer('client.spinner.fetch_account'),
    UPDATE_MODAL: reduceUpdateModal,
    UPDATE_WEBOOB: reduceUpdateWeboob,
    EXPORT_INSTANCE: reduceExportInstance,
    SET_IS_SMALL_SCREEN: reduceSetIsSmallScreen,
    TOGGLE_MENU: reduceToggleMenu,
    ENABLE_DEMO_MODE: makeProcessingReasonReducer('client.demo.enabling'),
    DISABLE_DEMO_MODE: makeProcessingReasonReducer('client.demo.disabling')
};

const uiState = u({
    search: {},
    displaySearchDetails: false,
    processingReason: 'client.general.loading_assets',
    updatingWeboob: false,
    sendingTestEmail: false,
    isDemoMode: false
});

export const reducer = createReducerFromMap(uiState, reducers);

// Initial state
function initialSearch() {
    return {
        keywords: [],
        categoryIds: [],
        type: '',
        amountLow: null,
        amountHigh: null,
        dateLow: null,
        dateHigh: null
    };
}

export function initialState(isDemoEnabled) {
    let search = initialSearch();
    return u(
        {
            search,
            displaySearchDetails: false,
            processingReason: 'client.general.loading_assets',
            updatingWeboob: false,
            sendingTestEmail: false,
            isDemoMode: isDemoEnabled,
            isExporting: false,
            isSmallScreen: computeIsSmallScreen(),
            modal: {
                slug: null,
                state: null
            },
            isMenuHidden: computeIsSmallScreen()
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
        search.categoryIds.length > 0 ||
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

export function isSmallScreen(state) {
    return state.isSmallScreen;
}

export function getModal(state) {
    return state.modal;
}

export function isMenuHidden(state) {
    return state.isMenuHidden;
}

export function isDemoMode(state) {
    return state.isDemoMode;
}
