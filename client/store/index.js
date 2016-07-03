import { EventEmitter as EE } from 'events';

import { combineReducers, createStore, applyMiddleware } from 'redux';
import reduxThunk from 'redux-thunk';

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

function anotherReducer(state = {}, action) {
    if (action.type === DELETE_CATEGORY) {
        // TODO Update operations
        // let replaceId = action.replace;
        //for (let bank of data.banks.values()) {
            //for (let acc of bank.accounts.values()) {
                //for (let op of acc.operations) {
                    //if (op.categoryId === id) {
                        //op.categoryId = replaceId;
                    //}
                //}
            //}
        //}
        console.log('DO THE HARLEM SHAKE');
    }
    return state;
}

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

// End of redux

export const actions = {
    // *** Banks **************************************************************

    setCurrentAccessId(dispatch, id) {
        assertDefined(dispatch);
        dispatch(Ui.setCurrentAccessId(id));
    },

    setCurrentAccountId(dispatch, id) {
        assertDefined(dispatch);
        dispatch(Ui.setCurrentAccountId(id));
    },

    setOperationCategory(dispatch, operation, catId) {
        assertDefined(dispatch);
        dispatch(Bank.setOperationCategory(operation, catId));
    },

    setOperationType(dispatch, operation, typeId) {
        assertDefined(dispatch);
        dispatch(Bank.setOperationType(operation, typeId));
    },

    runSync(dispatch) {
        assertDefined(dispatch);
        // TODO is there a better way?
        dispatch(Bank.runSync(rx.getState(), get));
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
};

export const get = {
    // *** Banks **************************************************************

    // Access
    currentAccess(state) {
        assertDefined(state);
        let id = this.currentAccessId(state);
        if (id === null) {
            debug('currentAccess: No access set.');
            return null;
        }
        return Bank.accessById(state.banks, id);
    },

    // [Access]
    accesses(state) {
        assertDefined(state);
        return Bank.getAccesses(state.banks);
    },

    // [Account]
    currentAccount(state) {
        assertDefined(state);
        let id = this.currentAccountId(state);
        if (id === null) {
            debug('currentAccount: No account set.');
            return null;
        }
        return Bank.accountById(state.banks, id);
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

    // String
    currentAccountId(state) {
        assertDefined(state);
        return Ui.getCurrentAccountId(state.ui);
    },

    // String
    currentAccessId(state) {
        assertDefined(state);
        return Ui.getCurrentAccessId(state.ui);
    },

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
    }
};

export const store = {};

/*
 * GETTERS
 **/

// instanceof Account
store.getCurrentAccount = function() {
    let accountId = store.getCurrentAccountId();
    if (accountId === null) {
        debug('getCurrentAccount: No current account is set');
        return null;
    }
    return store.getAccount(accountId);
};

// [instanceof Operation]
store.getCurrentOperations = function() {
    let accountId = store.getCurrentAccountId();
    return store.getOperationsByAccountsIds([accountId]);
};

// [{bankId, bankName}]
store.getBanks = function() {
    return Bank.all(rx.getState().banks);
};

store.getAccount = function(id) {
    return Bank.accountById(rx.getState().banks, id);
};

// [{account: instanceof Account, alert: instanceof Alerts}]
store.getAlerts = function(kind) {
    // TODO implement this: there should also be an array of account numbers
    return [];
};

/*
 * BACKEND
 **/

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
        rx.getState().ui = Ui.initialState(state, get);

        if (cb)
            cb();
    })
    .catch(genericErrorHandler);
};

store.importInstance = function(content) {
    backend.importInstance(content).then(() => {
        // Reload all the things!
        flux.dispatch({
            type: Events.server.savedBank
        });
    })
    .catch(genericErrorHandler);
};

// BANKS
store.addBank = function(uuid, id, pwd, maybeCustomFields) {
    backend.addBank(uuid, id, pwd, maybeCustomFields).then(() => {
        flux.dispatch({
            type: Events.server.savedBank
        });
    }).catch(err => {
        // Don't use genericErrorHandler here, because of special handling.
        // TODO fix this ^
        flux.dispatch({
            type: Events.afterSync,
            maybeError: err
        });
    });
};

store.deleteBankFromStore = function(bankId) {
    assert(data.banks.has(bankId), `Deleted bank ${bankId} must exist?`);
    data.banks.delete(bankId);

    // TODO
    assert(false, 'nyi');
    //let previousCurrentBankId = this.getCurrentBankId();
    if (previousCurrentBankId === bankId) {
        let newCurrentBankId = null;
        if (data.banks.size) {
            newCurrentBankId = data.banks.keys().next().value;
        }
        this.setCurrentBankId(newCurrentBankId);

        let newCurrentAccountId = null;
        if (newCurrentBankId && store.getCurrentBank().accounts.size) {
            newCurrentAccountId = store.getCurrentBank().accounts.keys().next().value;
        }
        this.setCurrentAccountId(newCurrentAccountId);
    }

    flux.dispatch({
        type: Events.forward,
        event: State.banks
    });
};

store.deleteBank = function(bankId) {
    backend.deleteBank(bankId).then(() => {
        store.deleteBankFromStore(bankId);
    })
    .catch(genericErrorHandler);
};

// ACCOUNTS
store.deleteAccount = function(accountId) {
    backend.deleteAccount(accountId).then(() => {

        let found = false;
        let bank;
        for (bank of data.banks.values()) {
            if (bank.accounts.has(accountId)) {
                bank.accounts.delete(accountId);
                if (bank.accounts.size === 0) {
                    store.deleteBankFromStore(bank.id);
                }
                found = true;
                break;
            }
        }
        assert(found, 'Deleted account must have been present in the first place');

        // TODO
        assert(false, 'nyi');
        if (store.getCurrentAccountId() === accountId) {
            let newCurrentAccountId = null;
            //if (store.getCurrentBankId() && store.getCurrentBank().accounts.size) {
                //newCurrentAccountId = store.getCurrentBank().accounts.keys().next().value;
            //}
            store.setCurrentAccountId(newCurrentAccountId);
        }

        if (store.getDefaultAccountId() === accountId) {
            // TODO do with a dispatch.
            //data.settings.set('defaultAccountId', '');
        }

        flux.dispatch({
            type: Events.forward,
            event: State.accounts
        });
    })
    .catch(genericErrorHandler);
};

store.fetchAccounts = function(bankId, accountId, accessId) {
    assert(data.banks.has(bankId));

    backend.getNewAccounts(accessId).then(() => {
        let bank = data.banks.get(bankId);
        store.loadAccounts(bank);
        // Retrieve operations of all bank accounts
        for (let acc of bank.accounts.values()) {
            store.loadOperationsFor(bankId, acc.id);
        }
    })
    .catch(err => {
        // Don't use genericErrorHandler, we have a specific error handling
        // TODO fix this ^
        flux.dispatch({
            type: Events.afterSync,
            maybeError: err
        });
    });
};

// OPERATIONS
store.updateCustomLabelForOperation = function(operation, customLabel) {
    backend.setCustomLabel(operation.id, customLabel)
    .then(() => {
        operation.customLabel = customLabel;
        // No need to forward at the moment?
    })
    .catch(genericErrorHandler);
};

store.mergeOperations = function(toKeepId, toRemoveId) {
    backend.mergeOperations(toKeepId, toRemoveId).then(newToKeep => {

        let ops = store.getCurrentOperations();
        let unknownOperationTypeId = store.getUnknownOperationType().id;

        let found = 0;
        let toDeleteIndex = null;
        for (let i = 0; i < ops.length; i++) {
            let op = ops[i];
            if (op.id === toKeepId) {
                ops[i] = new Operation(newToKeep, unknownOperationTypeId);
                if (++found === 2)
                    break;
            } else if (op.id === toRemoveId) {
                toDeleteIndex = i;
                if (++found === 2)
                    break;
            }
        }
        assert(found === 2, 'both operations had to be present');
        assert(toDeleteIndex !== null);

        ops.splice(toDeleteIndex, 1);

        flux.dispatch({
            type: Events.forward,
            event: State.operations
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

// Static information about banks
store.getStaticBanks = function() {
    return StaticBank.all(rx.getState().staticBanks);
};

/*
 * ACTIONS
 **/
export let Actions = {

    // Categories

    createCategory(category) {
        rx.dispatch(Category.create(category));
    },

    updateCategory(category, newCategory) {
        rx.dispatch(Category.update(category, newCategory));
    },

    deleteCategory(category, replace) {
        rx.dispatch(Category.destroy(category, replace));
    },

    // Operation list

    setCustomLabel(operation, customLabel) {
        assert(operation instanceof Operation, 'SetCustomLabel 1st arg must be an Operation');
        assert(typeof customLabel === 'string', 'SetCustomLabel 2nd arg must be a String');
        flux.dispatch({
            type: Events.user.updatedOperationCustomLabel,
            operation,
            customLabel
        });
    },

    fetchAccounts(bank, account) {
        assert(bank instanceof Bank, 'FetchAccounts first arg must be a Bank');
        assert(account instanceof Account, 'FetchAccounts second arg must be an Account');
        flux.dispatch({
            type: Events.user.fetchedAccounts,
            bankId: bank.id,
            accountId: account.id,
            accessId: account.bankAccess
        });
    },

    // Settings
    deleteAccount(account) {
        assert(account instanceof Account, 'DeleteAccount expects an Account');
        flux.dispatch({
            type: Events.user.deletedAccount,
            accountId: account.id
        });
    },

    deleteBank(bank) {
        assert(bank instanceof Bank, 'DeleteBank expects an Bank');
        flux.dispatch({
            type: Events.user.deletedBank,
            bankId: bank.id
        });
    },

    createBank(uuid, login, passwd, customFields) {
        assert(typeof uuid === 'string' && uuid.length, 'uuid must be a non-empty string');
        assert(typeof login === 'string' && login.length, 'login must be a non-empty string');
        assert(typeof passwd === 'string' && passwd.length, 'passwd must be a non-empty string');

        let eventObject = {
            type: Events.user.createdBank,
            bankUuid: uuid,
            id: login,
            pwd: passwd
        };
        if (typeof customFields !== 'undefined')
            eventObject.customFields = customFields;

        flux.dispatch(eventObject);
    },

    changeSetting(key, value) {
        rx.dispatch(Settings.set(key, value));
    },

    changeBoolSetting(key, value) {
        assert(typeof value === 'boolean', 'value must be a boolean');
        this.changeSetting(key, value.toString());
    },

    updateWeboob() {
        rx.dispatch(Settings.updateWeboob());
    },

    updateAccess(account, login, password, customFields) {
        assert(account instanceof Account, 'first param must be an account');
        assert(typeof password === 'string', 'second param must be the password');

        if (typeof login !== 'undefined') {
            assert(typeof login === 'string', 'third param must be the login');
        }

        if (typeof customFields !== 'undefined') {
            assert(customFields instanceof Array &&
                   customFields.every(f => has(f, 'name') && has(f, 'value')),
                   'if not omitted, third param must have the shape [{name, value}]');
        }

        rx.dispatch(Settings.updateAccess(account.bankAccess, login, password, customFields));
    },

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

    // Duplicates
    mergeOperations(toKeep, toRemove) {
        assert(toKeep instanceof Operation &&
               toRemove instanceof Operation,
               'MergeOperation expects two Operation');
        flux.dispatch({
            type: Events.user.mergedOperations,
            toKeepId: toKeep.id,
            toRemoveId: toRemove.id
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
        case Events.user.createdBank:
            has(action, 'bankUuid');
            has(action, 'id');
            has(action, 'pwd');
            store.addBank(action.bankUuid, action.id, action.pwd, action.customFields);
            break;

        case Events.user.deletedAccount:
            has(action, 'accountId');
            store.deleteAccount(action.accountId);
            break;

        case Events.user.deletedAlert:
            has(action, 'alert');
            store.deleteAlert(action.alert);
            break;

        case Events.user.deletedBank:
            has(action, 'bankId');
            store.deleteBank(action.bankId);
            break;

        case Events.user.deletedCategory:
            has(action, 'id');
            has(action, 'replaceByCategoryId');
            store.deleteCategory(action.id, action.replaceByCategoryId);
            break;

        case Events.user.importedInstance:
            has(action, 'content');
            store.importInstance(action.content);
            break;

        case Events.user.mergedOperations:
            has(action, 'toKeepId');
            has(action, 'toRemoveId');
            store.mergeOperations(action.toKeepId, action.toRemoveId);
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
