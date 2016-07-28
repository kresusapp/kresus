import { EventEmitter as EE } from 'events';

import { combineReducers, createStore, applyMiddleware } from 'redux';
import reduxThunk from 'redux-thunk';
import { createSelector } from 'reselect';

import * as Bank from './banks';
import * as Category from './categories';
import * as OperationType from './operation-types';
import * as StaticBank from './static-banks';
import * as Settings from './settings';
import * as Ui from './ui';

import { assert, assertDefined, debug, maybeHas, has, translate as $t, NONE_CATEGORY_ID,
        setupTranslator, localeComparator } from '../helpers';

import { Dispatcher } from 'flux';

import * as backend from './backend';

import { genericErrorHandler } from '../errors';

const events = new EE;
const flux = new Dispatcher;

/*
 * REDUX
 */

const rootReducer = combineReducers({
    banks: Bank.reducer,
    categories: Category.reducer,
    settings: Settings.reducer,
    ui: Ui.reducer,
    // Static information
    staticBanks: (state = {}) => state,
    operationTypes: (state = {}) => state
});

// Store
export const rx = createStore(rootReducer, applyMiddleware(reduxThunk));

export const actions = {

    // *** Banks **************************************************************
    setCurrentAccessId(dispatch, id) {
        assertDefined(dispatch);
        dispatch(Bank.setCurrentAccessId(id));
    },

    setCurrentAccountId(dispatch, id) {
        assertDefined(dispatch);
        dispatch(Bank.setCurrentAccountId(id));
    },

    setOperationCategory(dispatch, operation, catId) {
        assertDefined(dispatch);
        dispatch(Bank.setOperationCategory(operation, catId));
    },

    setOperationType(dispatch, operation, typeId) {
        assertDefined(dispatch);
        dispatch(Bank.setOperationType(operation, typeId));
    },

    setOperationCustomLabel(dispatch, operation, label) {
        assertDefined(dispatch);
        dispatch(Bank.setOperationCustomLabel(operation, label));
    },

    mergeOperations(dispatch, toKeep, toRemove) {
        assertDefined(dispatch);
        dispatch(Bank.mergeOperations(toKeep, toRemove));
    },

    runSync(dispatch) {
        assertDefined(dispatch);
        dispatch(Bank.runSync(get));
    },

    runAccountsSync(dispatch, accessId) {
        assertDefined(dispatch);
        dispatch(Bank.runAccountsSync(accessId));
    },

    createAccess(dispatch, uuid, login, password, fields) {
        assertDefined(dispatch);
        dispatch(Bank.createAccess(get, uuid, login, password, fields));
    },

    deleteAccount(dispatch, accountId) {
        assertDefined(dispatch);
        dispatch(Bank.deleteAccount(accountId));
    },

    updateAccess(dispatch, accessId, login, password, customFields) {
        assertDefined(dispatch);

        assert(typeof accessId === 'string', 'second param accessId must be a string');
        assert(typeof password === 'string', 'third param must be the password');

        if (typeof login !== 'undefined') {
            assert(typeof login === 'string', 'fourth param must be the login');
        }

        if (typeof customFields !== 'undefined') {
            assert(customFields instanceof Array &&
                   customFields.every(f => has(f, 'name') && has(f, 'value')),
                   'if not omitted, third param must have the shape [{name, value}]');
        }

        dispatch(Settings.updateAccess(accessId, login, password, customFields));
    },

    deleteAccess(dispatch, accessId) {
        assertDefined(dispatch);
        dispatch(Bank.deleteAccess(accessId));
    },

    // *** Categories *********************************************************
    createCategory(dispatch, category) {
        assertDefined(dispatch);
        dispatch(Category.create(category));
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

    resetSearch(dispatch) {
        assertDefined(dispatch);
        dispatch(Ui.resetSearch());
    },

    // *** Settings ***********************************************************
    updateWeboob(dispatch) {
        assertDefined(dispatch);
        dispatch(Settings.updateWeboob());
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
};

export const get = {

    // *** Banks **************************************************************
    // [Bank]
    banks(state) {
        assertDefined(state);
        return StaticBank.all(state.staticBanks);
    },

    // String
    currentAccountId(state) {
        assertDefined(state);
        return Bank.getCurrentAccountId(state.banks);
    },

    // String
    currentAccessId(state) {
        assertDefined(state);
        return Bank.getCurrentAccessId(state.banks);
    },

    // Account
    currentAccount: createSelector(
        state => state.banks,
        state => get.currentAccountId(state),
        (banks, accountId) => {
            if (accountId === null) {
                debug('currentAccount: No account set.');
                return null;
            }
            return Bank.accountById(banks, accountId);
        }
    ),

    // Access
    currentAccess: createSelector(
        state => state.banks,
        state => get.currentAccessId(state),
        (banks, accessId) => {
            if (accessId === null) {
                debug('currentAccess: No access set.');
                return null;
            }
            return Bank.accessById(banks, accessId);
        }
    ),

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

    // [Account]
    currentAccounts(state) {
        assertDefined(state);
        let accessId = this.currentAccessId(state);
        if (accessId === null) {
            debug('currentAccounts: No current bank set.');
            return [];
        }
        return this.accountsByAccessId(state, accessId);
    },

    // [Operation]
    operationsByAccountIds(state, accountIds) {
        assertDefined(state);
        if (!(accountIds instanceof Array)) {
            accountIds = [accountIds];
        }
        let operations = [];
        for (let accountId of accountIds) {
            operations = operations.concat(Bank.operationsByAccountId(state.banks, accountId));
        }
        return operations;
    },

    // [Operation]
    currentOperations: createSelector(
        state => state.banks,
        state => get.currentAccountId(state),
        (banks, accountId) => Bank.operationsByAccountId(banks, accountId)
    ),

    // String
    defaultAccountId(state) {
        assertDefined(state);
        return Settings.getDefaultAccountId(state.settings);
    },

    // String
    unknownOperationType(state) {
        assertDefined(state);
        return OperationType.unknown(state.operationTypes);
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

    isSynchronizing(state) {
        assertDefined(state);
        return Ui.isSynchronizing(state.ui);
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

    // *** Operation types ****************************************************
    // [OperationType]
    operationTypes(state) {
        assertDefined(state);
        return OperationType.all(state.operationTypes);
    },

    // String
    labelOfOperationType(state, id) {
        assertDefined(state);
        return OperationType.idToLabel(state.operationTypes, id);
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
        if (!this.boolSetting(state, 'weboob-installed'))
            return false;

        let version = this.setting(state, 'weboob-version');
        return version !== '?' && version !== '1.0';
    },

    isWeboobUpdating(state) {
        assertDefined(state);
        return Settings.isWeboobUpdating(state.settings);
    }
};

export const store = {};

store.setupKresus = function(cb) {
    backend.init().then(world => {

        let state = rx.getState();

        // Settings need to be loaded first, because locale information depends
        // upon them.
        has(world, 'settings');
        state.settings = Settings.initialState(world.settings);

        has(world, 'banks');
        state.staticBanks = StaticBank.initialState(world.banks);

        has(world, 'categories');
        state.categories = Category.initialState(world.categories);

        has(world, 'operationtypes');
        state.operationTypes = OperationType.initialState(world.operationtypes);

        has(world, 'accounts');
        has(world, 'operations');
        has(world, 'alerts');
        state.banks = Bank.initialState(state, get, world.banks, world.accounts, world.operations,
                                        world.alerts);

        // The UI must be computed at the end.
        state.ui = Ui.initialState();

        if (cb)
            cb();
    })
    .catch(genericErrorHandler);
};

// Backend!

store.importInstance = function(content) {
    backend.importInstance(content).then(() => {
        // Reload all the things!
        flux.dispatch({
            type: Events.server.savedBank
        });
    })
    .catch(genericErrorHandler);
};

// SETTINGS

store.createOperationForAccount = function(accountID, operation) {
    backend.createOperation(operation).then(created => {
        let account = store.getAccount(accountID);
        let unknownOperationTypeId = store.getUnknownOperationType().id;
        account.operations.push(new Operation(created, unknownOperationTypeId));
        sortOperations(account.operations);
        flux.dispatch({
            type: Events.forward,
            event: State.operations
        });
    })
    .catch(genericErrorHandler);
};

// ALERTS
function findAlertIndex(al) {
    let arr = data.alerts;
    for (let i = 0; i < arr.length; i++) {
        if (arr[i].id === al.id) {
            return i;
        }
    }
    assert(false, 'impossible to find the alert!');
}

store.createAlert = function(al) {
    backend.createAlert(al).then(createdAlert => {
        data.alerts.push(new Alert(createdAlert));
        flux.dispatch({
            type: Events.forward,
            event: State.alerts
        });
    })
    .catch(genericErrorHandler);
};

store.updateAlert = function(al, attributes) {
    backend.updateAlert(al.id, attributes).then(() => {
        let i = findAlertIndex(al);
        data.alerts[i].merge(attributes);
        flux.dispatch({
            type: Events.forward,
            event: State.alerts
        });
    })
    .catch(genericErrorHandler);
};

store.deleteAlert = function(al) {
    backend.deleteAlert(al.id).then(() => {
        let i = findAlertIndex(al);
        data.alerts.splice(i, 1);
        flux.dispatch({
            type: Events.forward,
            event: State.alerts
        });
    })
    .catch(genericErrorHandler);
};

/*
 * GETTERS
 */

// Operation types
store.getUnknownOperationType = function() {
    return OperationType.unknown(rx.getState().operationTypes);
}

/*
 * ACTIONS
 **/
export let Actions = {

    importInstance(action) {
        has(action, 'content');
        flux.dispatch({
            type: Events.user.importedInstance,
            content: action.content
        });
    },

    createOperation(accountID, operation) {
        assert(typeof accountID === 'string' && accountID.length,
               'createOperation first arg must be a non empty string');
        flux.dispatch({
            type: Events.user.createdOperation,
            operation,
            accountID
        });
    },

    // Alerts
    createAlert(alert) {
        assert(typeof alert === 'object');
        has(alert, 'type');
        has(alert, 'bankAccount');
        flux.dispatch({
            type: Events.user.createdAlert,
            alert
        });
    },

    updateAlert(alert, attributes) {
        assert(alert instanceof Alert, 'UpdateAlert expects an instance of Alert');
        assert(typeof attributes === 'object', 'Second attribute to UpdateAlert must be an object');
        flux.dispatch({
            type: Events.user.updatedAlert,
            alert,
            attributes
        });
    },

    deleteAlert(alert) {
        assert(alert instanceof Alert, 'DeleteAlert expects an instance of Alert');
        flux.dispatch({
            type: Events.user.deletedAlert,
            alert
        });
    },
};

function makeForwardEvent(event) {
    return () => {
        flux.dispatch({
            type: Events.forward,
            event
        });
    };
}

flux.register(action => {
    switch (action.type) {

        // User events
        case Events.user.deletedAlert:
            has(action, 'alert');
            store.deleteAlert(action.alert);
            break;

        case Events.user.importedInstance:
            has(action, 'content');
            store.importInstance(action.content);
            break;

        case Events.user.fetchedAccounts:
            has(action, 'bankId');
            has(action, 'accessId');
            has(action, 'accountId');
            store.fetchAccounts(action.bankId, action.accountId, action.accessId);
            break;

        case Events.user.createdAlert:
            has(action, 'alert');
            store.createAlert(action.alert);
            break;

        case Events.user.updatedAlert:
            has(action, 'alert');
            has(action, 'attributes');
            store.updateAlert(action.alert, action.attributes);
            break;

        case Events.user.updatedOperationCustomLabel:
            has(action, 'operation');
            has(action, 'customLabel');
            store.updateCustomLabelForOperation(action.operation, action.customLabel);
            break;

        case Events.user.createdOperation:
            has(action, 'accountID');
            has(action, 'operation');
            store.createOperationForAccount(action.accountID, action.operation);
            events.emit(State.operations);
            break;

        // Server events. Most of these events should be forward events, as the
        // logic on events is handled directly in backend callbacks.
        case Events.server.savedBank:
            // Should be pretty rare, so we can reload everything.
            store.setupKresus(makeForwardEvent(State.banks));
            break;

        case Events.forward:
            has(action, 'event');
            events.emit(action.event);
            break;

        case Events.afterSync:
            events.emit(State.sync, action.maybeError);
            break;

        default:
            assert(false, `unhandled event in store switch: ${action.type}`);
    }
});

function checkEvent(event) {
    assert(event === State.alerts ||
           event === State.banks ||
           event === State.accounts ||
           event === State.settings ||
           event === State.operations ||
           event === State.categories ||
           event === State.weboob ||
           event === State.sync,
           `component subscribed to an unknown / forbidden event: ${event}`);
}

store.on = function(event, cb) {
    checkEvent(event);
    events.on(event, cb);
};

store.once = function(event, cb) {
    checkEvent(event);
    events.once(event, cb);
};

store.removeListener = function(event, cb) {
    events.removeListener(event, cb);
};
