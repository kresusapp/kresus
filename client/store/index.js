import { combineReducers, createStore, applyMiddleware } from 'redux';

import reduxThunk from 'redux-thunk';

import * as Bank from './banks';
import * as Category from './categories';
import * as Settings from './settings';
import * as OperationType from './operation-types';
import * as Ui from './ui';

import DefaultSettings from '../../shared/default-settings';

import { FAIL, SUCCESS, fillOutcomeHandlers } from './helpers';

import { IMPORT_INSTANCE } from './actions';

import { assert, assertHas, assertDefined, debug } from '../helpers';

import * as backend from './backend';

import { genericErrorHandler } from '../errors';

// Augment basic reducers so that they can handle state reset:
// - if the event is a state reset (IMPORT_INSTANCE), pass the new sub-state to the reducer.
// - otherwise, apply to the actual reducer.
function augmentReducer(reducer, field) {
    return (state, action) => {
        if (action.type === IMPORT_INSTANCE && action.status === SUCCESS) {
            return reducer(action.state[field], action);
        }
        return reducer(state, action);
    };
}

const rootReducer = combineReducers({
    banks: augmentReducer(Bank.reducer, 'banks'),
    categories: augmentReducer(Category.reducer, 'categories'),
    settings: augmentReducer(Settings.reducer, 'settings'),
    ui: augmentReducer(Ui.reducer, 'ui'),
    // Static information
    types: (state = {}) => state,
    themes: (state = {}) => state
});

// A simple middleware to log which action is called, and its status if applicable.
const logger = () => next => action => {
    let { status } = action;
    if (status === SUCCESS) {
        debug(`Action ${action.type} completed with success.`);
    } else if (status === FAIL) {
        debug(`Action ${action.type} failed with error: `, action.error);
    } else {
        debug(`Action ${action.type} dispatched.`);
        let actionCopy;
        if (typeof action.password !== 'undefined') {
            actionCopy = { ...action };
            delete actionCopy.password;
        } else {
            actionCopy = action;
        }
        debug('Action payload: ', actionCopy);
    }

    return next(action);
};

// Store
export const rx = createStore(rootReducer, applyMiddleware(reduxThunk, logger));

export const get = {
    // *** Banks **************************************************************
    // [Bank]
    banks(state) {
        assertDefined(state);
        return Bank.all(state.banks);
    },

    // Bank
    bankByUuid(state, uuid) {
        assertDefined(state);
        return Bank.bankByUuid(state.banks, uuid);
    },

    // Account
    accountById(state, accountId) {
        assertDefined(state);
        return Bank.accountById(state.banks, accountId);
    },

    accessByAccountId(state, accountId) {
        assertDefined(state);
        return Bank.accessByAccountId(state.banks, accountId);
    },

    initialAccountId(state) {
        assertDefined(state);
        let defaultAccountId = this.defaultAccountId(state);

        if (defaultAccountId === DefaultSettings.get('defaultAccountId')) {
            // Choose the first account of the list
            accountLoop: for (let access of this.accesses(state)) {
                for (let account of this.accountsByAccessId(state, access.id)) {
                    defaultAccountId = account.id;
                    break accountLoop;
                }
            }
        }
        return defaultAccountId;
    },

    accessById(state, accessId) {
        assertDefined(state);
        return Bank.accessById(state.banks, accessId);
    },

    // [Access]
    accesses(state) {
        assertDefined(state);
        return Bank.getAccesses(state.banks);
    },

    // [Account]
    accountsByAccessId(state, accessId) {
        assertDefined(state);
        return Bank.accountsByAccessId(state.banks, accessId);
    },

    // [Operation]
    operationsByAccountIds(state, accountIds) {
        assertDefined(state);

        let accountIdsArray = accountIds;
        if (!(accountIdsArray instanceof Array)) {
            accountIdsArray = [accountIdsArray];
        }

        let operations = [];
        for (let accountId of accountIdsArray) {
            operations = operations.concat(Bank.operationsByAccountId(state.banks, accountId));
        }
        return operations;
    },

    // Operation
    operationById(state, id) {
        assertDefined(state);
        return Bank.operationById(state.banks, id);
    },

    // String
    defaultAccountId(state) {
        assertDefined(state);
        return Bank.getDefaultAccountId(state.banks);
    },

    // [Type]
    types(state) {
        assertDefined(state);
        return OperationType.all(state.types);
    },

    // *** UI *****************************************************************
    // { searchFields } (see ui.js)
    searchFields(state) {
        assertDefined(state);
        return Ui.getSearchFields(state.ui);
    },

    // Bool
    hasSearchFields(state) {
        assertDefined(state);
        return Ui.hasSearchFields(state.ui);
    },

    // Bool
    backgroundProcessingReason(state) {
        assertDefined(state);
        return Ui.getProcessingReason(state.ui);
    },

    // Bool
    displaySearchDetails(state) {
        assertDefined(state);
        return Ui.getDisplaySearchDetails(state.ui);
    },

    // Bool
    isExporting(state) {
        assertDefined(state);
        return Ui.isExporting(state.ui);
    },

    // *** Categories *********************************************************
    // Categories
    categories(state) {
        assertDefined(state);
        return Category.all(state.categories);
    },

    categoriesButNone(state) {
        assertDefined(state);
        return Category.allButNone(state.categories);
    },

    // Category
    categoryById(state, id) {
        assertDefined(state);
        return Category.fromId(state.categories, id);
    },

    // *** Settings ***********************************************************
    // String
    setting(state, key) {
        assertDefined(state);
        return Settings.get(state.settings, key);
    },

    // Bool
    boolSetting(state, key) {
        assertDefined(state);
        let val = this.setting(state, key);
        assert(val === 'true' || val === 'false', 'A bool setting must be true or false');
        return val === 'true';
    },

    // Bool
    isWeboobInstalled(state) {
        assertDefined(state);
        return this.boolSetting(state, 'weboob-installed');
    },

    // Bool
    isWeboobUpdating(state) {
        assertDefined(state);
        return Ui.isWeboobUpdating(state.ui);
    },

    weboobVersion(state) {
        assertDefined(state);
        return Settings.getWeboobVersion(state.settings);
    },

    // Bool
    isSendingTestEmail(state) {
        assertDefined(state);
        return Ui.isSendingTestEmail(state.ui);
    },

    // Returns [{account, alert}] of the given type.
    alerts(state, type) {
        assertDefined(state);
        return Bank.alertPairsByType(state.banks, type);
    },

    // *** Themes *************************************************************
    themes(state) {
        assertDefined(state);
        return state.themes;
    },

    // *** Logs ***************************************************************
    logs(state) {
        assertDefined(state);
        return Settings.getLogs(state.settings);
    }
};

export const actions = {
    // *** Banks **************************************************************
    runOperationsSync(dispatch, accessId) {
        assertDefined(dispatch);
        dispatch(Bank.runOperationsSync(accessId));
    },

    setOperationCategory(dispatch, operationId, catId, formerCatId) {
        assertDefined(dispatch);
        dispatch(Bank.setOperationCategory(operationId, catId, formerCatId));
    },

    setOperationType(dispatch, operationId, type, formerType) {
        assertDefined(dispatch);
        dispatch(Bank.setOperationType(operationId, type, formerType));
    },

    setOperationCustomLabel(dispatch, operation, label) {
        assertDefined(dispatch);
        dispatch(Bank.setOperationCustomLabel(operation, label));
    },

    setOperationBudgetDate(dispatch, operation, budgetDate) {
        assertDefined(dispatch);
        dispatch(Bank.setOperationBudgetDate(operation, budgetDate));
    },

    mergeOperations(dispatch, toKeep, toRemove) {
        assertDefined(dispatch);
        dispatch(Bank.mergeOperations(toKeep, toRemove));
    },

    // *** Categories *********************************************************
    createCategory(dispatch, category) {
        assertDefined(dispatch);
        dispatch(Category.create(category));
    },

    createDefaultCategories(dispatch) {
        assertDefined(dispatch);
        dispatch(Category.createDefault());
    },

    updateCategory(dispatch, former, newer) {
        assertDefined(dispatch);
        dispatch(Category.update(former, newer));
    },

    deleteCategory(dispatch, former, replaceById) {
        assertDefined(dispatch);
        dispatch(Category.destroy(former, replaceById));
    },

    // *** UI *****************************************************************
    setSearchField(dispatch, key, value) {
        assertDefined(dispatch);
        dispatch(Ui.setSearchField(key, value));
    },

    setSearchFields(dispatch, map) {
        assertDefined(dispatch);
        dispatch(Ui.setSearchFields(map));
    },

    resetSearch(dispatch, displaySearch) {
        assertDefined(dispatch);
        dispatch(Ui.resetSearch(displaySearch));
    },

    toggleSearchDetails(dispatch, show) {
        assertDefined(dispatch);
        dispatch(Ui.toggleSearchDetails(show));
    },

    setTheme(dispatch, theme) {
        assertDefined(dispatch);
        dispatch(Ui.startThemeLoad());
        dispatch(Settings.set('theme', theme));
    },

    finishThemeLoad(dispatch, theme, loaded) {
        assertDefined(dispatch);
        if (!loaded && theme !== 'default') {
            debug('Could not load theme, revert to default theme.');
            dispatch(Settings.set('theme', 'default'));
        } else {
            dispatch(Ui.finishThemeLoad(loaded));
        }
    },

    // *** Settings ***********************************************************
    updateWeboob(dispatch) {
        assertDefined(dispatch);
        dispatch(Settings.updateWeboob());
    },

    fetchWeboobVersion(dispatch) {
        assertDefined(dispatch);
        dispatch(Settings.fetchWeboobVersion());
    },

    resetWeboobVersion(dispatch) {
        assertDefined(dispatch);
        dispatch(Settings.resetWeboobVersion());
    },

    setSetting(dispatch, key, value) {
        assertDefined(dispatch);
        dispatch(Settings.set(key, value));
    },

    setBoolSetting(dispatch, key, value) {
        assertDefined(dispatch);
        assert(typeof value === 'boolean', 'value must be a boolean');
        this.setSetting(dispatch, key, value.toString());
    },

    sendTestEmail(dispatch, email) {
        assertDefined(dispatch);
        dispatch(Settings.sendTestEmail(email));
    },

    runAccountsSync(dispatch, accessId) {
        assertDefined(dispatch);
        dispatch(Bank.runAccountsSync(accessId));
    },

    resyncBalance(dispatch, accountId) {
        assertDefined(dispatch);
        dispatch(Bank.resyncBalance(accountId));
    },

    updateAccount(dispatch, accountId, newFields) {
        assertDefined(dispatch);
        dispatch(Bank.updateAccount(accountId, newFields));
    },

    deleteAccount(dispatch, accountId) {
        assertDefined(dispatch);
        dispatch(Bank.deleteAccount(accountId, get));
    },

    createAccess(dispatch, uuid, login, password, fields, createDefaultAlerts) {
        assertDefined(dispatch);
        dispatch(Bank.createAccess(get, uuid, login, password, fields, createDefaultAlerts));
    },

    updateAccess(dispatch, accessId, login, password, customFields) {
        assertDefined(dispatch);

        assert(typeof accessId === 'string', 'second param accessId must be a string');
        assert(typeof password === 'string', 'third param must be the password');

        if (typeof login !== 'undefined') {
            assert(typeof login === 'string', 'fourth param must be the login');
        }

        if (typeof customFields !== 'undefined') {
            assert(
                customFields instanceof Array &&
                    customFields.every(f => assertHas(f, 'name') && assertHas(f, 'value')),
                'if not omitted, third param must have the shape [{name, value}]'
            );
        }

        dispatch(Settings.updateAccess(accessId, login, password, customFields));
    },

    deleteAccess(dispatch, accessId) {
        assertDefined(dispatch);
        dispatch(Bank.deleteAccess(accessId, get));
    },

    disableAccess(dispatch, accessId) {
        assertDefined(dispatch);
        dispatch(Settings.disableAccess(accessId));
    },

    setDefaultAccountId(dispatch, accountId) {
        assertDefined(dispatch);
        dispatch(Bank.setDefaultAccountId(accountId));
    },

    createOperation(dispatch, newOperation) {
        assertDefined(dispatch);
        dispatch(Bank.createOperation(newOperation));
    },

    deleteOperation(dispatch, operationId) {
        assertDefined(dispatch);
        dispatch(Bank.deleteOperation(operationId));
    },

    importInstance(dispatch, content) {
        assertDefined(dispatch);
        dispatch(importInstance(content));
    },

    exportInstance(dispatch, maybePassword) {
        assertDefined(dispatch);
        dispatch(Settings.exportInstance(maybePassword));
    },

    createAlert(dispatch, newAlert) {
        assertDefined(dispatch);
        dispatch(Bank.createAlert(newAlert));
    },

    updateAlert(dispatch, alertId, newFields) {
        assertDefined(dispatch);
        dispatch(Bank.updateAlert(alertId, newFields));
    },

    deleteAlert(dispatch, alertId) {
        assertDefined(dispatch);
        dispatch(Bank.deleteAlert(alertId));
    },

    fetchLogs(dispatch) {
        assertDefined(dispatch);
        dispatch(Settings.fetchLogs());
    },

    resetLogs(dispatch) {
        assertDefined(dispatch);
        dispatch(Settings.resetLogs());
    }
};

export const store = {};

export function init() {
    return backend
        .init()
        .then(world => {
            let state = {};

            // Settings need to be loaded first, because locale information depends
            // upon them.
            assertHas(world, 'settings');
            state.settings = Settings.initialState(world.settings);

            assertHas(world, 'categories');
            state.categories = Category.initialState(world.categories);

            // Define external values for the Bank initialState:
            let external = {
                defaultCurrency: get.setting(state, 'defaultCurrency'),
                defaultAccountId: get.setting(state, 'defaultAccountId')
            };

            assertHas(world, 'accounts');
            assertHas(world, 'accesses');
            assertHas(world, 'operations');
            assertHas(world, 'alerts');

            state.banks = Bank.initialState(
                external,
                world.accesses,
                world.accounts,
                world.operations,
                world.alerts
            );

            state.types = OperationType.initialState();

            assertHas(world, 'themes');
            state.themes = world.themes;

            // The UI must be computed at the end.
            state.ui = Ui.initialState();

            return new Promise(accept => {
                accept(state);
            });
        })
        .catch(err => {
            genericErrorHandler(err);
            throw err;
        });
}

// Basic action creators
const basic = {
    importInstance(content, state) {
        return {
            type: IMPORT_INSTANCE,
            content,
            state
        };
    }
};

const fail = {},
    success = {};
fillOutcomeHandlers(basic, fail, success);

// Actions
function importInstance(content) {
    return dispatch => {
        dispatch(basic.importInstance(content));
        backend
            .importInstance(content)
            .then(() => {
                return init();
            })
            .then(newState => {
                dispatch(success.importInstance(content, newState));
            })
            .catch(err => {
                dispatch(fail.importInstance(err, content));
            });
    };
}
