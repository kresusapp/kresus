import { EventEmitter as EE } from 'events';

import { combineReducers, createStore, applyMiddleware } from 'redux';
import reduxThunk from 'redux-thunk';

import Immutable from 'immutable';

import * as Category from './categories';
import * as OperationType from './operation-types';
import * as StaticBank from './static-banks';

import { assert, debug, maybeHas, has, translate as $t, NONE_CATEGORY_ID,
        setupTranslator, localeComparator } from '../helpers';

import { Account, Alert, Bank, Operation } from '../models';

import { Dispatcher } from 'flux';

import * as backend from './backend';

import { genericErrorHandler } from '../errors';

import DefaultSettings from '../../shared/default-settings';

const events = new EE;
const flux = new Dispatcher;

// Private data
const data = {
    currentBankId: null,
    currentAccountId: null,

    settings: new Map(DefaultSettings),

    // Map of Banks (id -> bank)
    // (Each bank has an "account" field which is a map (id -> account),
    //  each account has an "operation" field which is an array of Operation).
    banks: new Map,

    alerts: [],
};

/*
 * EVENTS
 */
const Events = {
    forward: 'forward',
    // Events emitted by the user: clicks, submitting a form, etc.
    user: {
        changedPassword: 'the user changed the password of a bank access',
        changedSetting: 'the user changed a setting value',
        createdAlert: 'the user submitted an alert creation form',
        createdBank: 'the user submitted an access creation form',
        createdOperation: 'the user created an operation for an account',
        deletedAccount: 'the user clicked in order to delete an account',
        deletedAlert: 'the user clicked in order to delete an alert',
        deletedBank: 'the user clicked in order to delete a bank',
        fetchedAccounts: 'the user clicked in order to fetch new accounts/operations for a bank',
        fetchedOperations: 'the user clicked in order to fetch operations for a bank',
        importedInstance: 'the user sent a file to import a kresus instance',
        mergedOperations: 'the user clicked in order to merge two operations',
        selectedAccount: 'the user clicked in order to select an account',
        selectedBank: 'the user clicked to change the selected bank',
        updatedAlert: 'the user submitted an alert update form',
        updatedOperationCategory: 'the user changed the category of an operation',
        updatedOperationType: 'the user changed the type of an operation',
        updatedOperationCustomLabel: 'the user updated the label of  an operation',
        updatedWeboob: 'the user asked to update weboob modules'
    },
    // Events emitted in an event loop: xhr callback, setTimeout/setInterval etc.
    server: {
        afterSync: 'new operations / accounts were fetched on the server.',
        savedBank: 'a bank access was saved (created or updated) on the server.'
    },
};

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
    categories: Category.reducer,
    // Static information
    staticBanks: (state = {}) => state,
    operationTypes: (state = {}) => state
    //another: anotherReducer
});

// Store
export const rx = createStore(rootReducer, applyMiddleware(reduxThunk));

// End of redux

export const State = {
    alerts: 'alerts state changed',
    banks: 'banks state changed',
    accounts: 'accounts state changed',
    settings: 'settings state changed',
    operations: 'operations state changed',
    categories: 'categories state changed',
    weboob: 'weboob state changed',
    sync: 'sync state changed'
};

// Holds the current bank information
export const store = {};

/*
 * GETTERS
 **/

store.getCurrentBankId = function() {
    return data.currentBankId;
};

store.getCurrentAccountId = function() {
    return data.currentAccountId;
};

store.getDefaultAccountId = function() {
    return data.settings.get('defaultAccountId');
};

// [{bankId, bankName}]
store.getBanks = function() {
    has(data, 'banks');
    let ret = [];
    for (let bank of data.banks.values()) {
        ret.push(bank);
    }
    return ret;
};

store.getBank = function(id) {
    if (!data.banks.has(id))
        return null;
    return data.banks.get(id);
};

store.getAccount = function(id) {
    for (let bank of data.banks.values()) {
        if (bank.accounts.has(id))
            return bank.accounts.get(id);
    }
    return null;
};

// [instanceof Account]
store.getBankAccounts = function(bankId) {
    if (!data.banks.has(bankId)) {
        debug(`getBankAccounts: No bank with id ${bankId} found.`);
        return [];
    }

    let bank = data.banks.get(bankId);
    assert(typeof bank.accounts !== 'undefined', 'bank.accounts must exist');
    assert(bank.accounts instanceof Map, 'bank.accounts must be a Map');

    let ret = [];
    for (let acc of bank.accounts.values()) {
        ret.push(acc);
    }
    return ret;
};

store.getCurrentBankAccounts = function() {
    if (data.currentBankId === null) {
        debug('getCurrentBankAccounts: No current bank set.');
        return [];
    }
    assert(data.banks.has(data.currentBankId));
    return store.getBankAccounts(data.currentBankId);
};

store.getCurrentBank = function() {
    if (data.currentBankId === null) {
        debug('getCurrentBank: No current bank is set');
        return null;
    }
    return data.banks.get(data.currentBankId);
};

// instanceof Account
store.getCurrentAccount = function() {

    let currentBank = store.getCurrentBank();
    let currentBankAccounts = currentBank.accounts;

    if (data.currentAccountId === null) {
        debug('getCurrentAccount: No current account is set');
        return null;
    }

    assert(currentBankAccounts.has(data.currentAccountId));
    return currentBankAccounts.get(data.currentAccountId);
};

// [instanceof Operation]
store.getCurrentOperations = function() {
    let acc = this.getCurrentAccount();
    if (acc === null)
        return [];
    return acc.operations;
};

// [{account: instanceof Account, alert: instanceof Alerts}]
store.getAlerts = function(kind) {

    // TODO need a way to find accounts by accountNumber, or to map alerts to accounts.id
    let accountMap = new Map;
    for (let bank of data.banks.values()) {
        for (let account of bank.accounts.values()) {
            assert(!accountMap.has(account.accountNumber),
                   'accountNumber should be globally unique');
            accountMap.set(account.accountNumber, account);
        }
    }

    let res = [];
    for (let alert of data.alerts.filter(al => al.type === kind)) {
        assert(accountMap.has(alert.bankAccount),
               `Unknown bank account for an alert: ${alert.bankAccount}`);
        res.push({
            account: accountMap.get(alert.bankAccount),
            alert
        });
    }
    return res;
};

// String
store.getSetting = function(key) {
    let dict = data.settings;
    assert(DefaultSettings.has(key),
           `all settings must have default values, but ${key} doesn't have one.`);
    assert(dict.has(key), `setting not set: ${key}`);
    return dict.get(key);
};

// Bool
store.getBoolSetting = function(key) {
    let val = store.getSetting(key);
    assert(val === 'true' || val === 'false', 'A bool setting must be true or false');
    return val === 'true';
};

store.isWeboobInstalled = function() {
    if (!store.getBoolSetting('weboob-installed'))
        return false;

    let version = store.getSetting('weboob-version');
    return version !== '?' && version !== '1.0';
};

/*
 * BACKEND
 **/

function sortOperations(ops) {
    // Sort by -date first, then by +title/customLabel.
    ops.sort((a, b) => {
        let ad = +a.date,
            bd = +b.date;
        if (ad < bd)
            return 1;
        if (ad > bd)
            return -1;
        let ac = a.customLabel && a.customLabel.trim().length ? a.customLabel : a.title;
        let bc = b.customLabel && b.customLabel.trim().length ? b.customLabel : b.title;
        return localeComparator(ac, bc, data.settings.locale);
    });
}

function sortAccounts(accounts) {
    accounts.sort((a, b) => localeComparator(a.title, b.title, data.settings.locale));
}

function getRelatedAccounts(bankId, accounts) {
    return accounts.filter(acc => acc.bank === bankId);
}
function getRelatedOperations(accountNumber, operations) {
    return operations.filter(op => op.bankAccount === accountNumber);
}

function operationFromPOD(unknownOperationTypeId) {
    return op => new Operation(op, unknownOperationTypeId);
}

store.setupKresus = function(cb) {
    backend.init().then(world => {

        has(world, 'settings');
        store.setSettings(world.settings);

        has(world, 'banks');
        rx.getState().staticBanks = StaticBank.initialState(world.banks);

        has(world, 'categories');
        rx.getState().categories = Category.initialState(world.categories);

        has(world, 'operationtypes');
        rx.getState().operationTypes = OperationType.initialState(world.operationtypes);

        let unknownOperationTypeId = store.getUnknownOperationType().id;

        has(world, 'accounts');
        has(world, 'operations');

        let defaultAccountId = store.getDefaultAccountId();

        data.banks = new Map;
        for (let bankPOD of world.banks) {
            let bank = new Bank(bankPOD);

            let accounts = getRelatedAccounts(bank.uuid, world.accounts);
            if (!accounts.length)
                continue;

            // Found a bank with accounts.
            data.banks.set(bank.id, bank);

            sortAccounts(accounts);

            bank.accounts = new Map;
            let defaultCurrency = store.getSetting('defaultCurrency');
            for (let accPOD of accounts) {
                let acc = new Account(accPOD, defaultCurrency);
                bank.accounts.set(acc.id, acc);

                acc.operations = getRelatedOperations(acc.accountNumber, world.operations)
                                 .map(operationFromPOD(unknownOperationTypeId));

                sortOperations(acc.operations);

                if (!data.currentAccountId) {
                    data.currentAccountId = acc.id;
                    data.currentBankId = bank.id;
                }

                if (acc.id === defaultAccountId) {
                    data.currentAccountId = acc.id;
                    data.currentBankId = bank.id;
                }
            }
        }

        if (defaultAccountId)
            assert(data.currentAccountId === defaultAccountId);

        has(world, 'alerts');
        data.alerts = [];
        for (let al of world.alerts) {
            assert(['balance', 'transaction', 'report'].indexOf(al.type) !== -1,
                   `unknown alert type: ${al.type}`);
            data.alerts.push(new Alert(al));
        }

        if (cb)
            cb();
    })
    .catch(genericErrorHandler);
};

store.updateWeboob = () => {
    backend.updateWeboob().then(() => {
        flux.dispatch({
            type: Events.forward,
            event: State.weboob
        });
    })
    .catch(err => {
        genericErrorHandler(err);
        flux.dispatch({
            type: Events.forward,
            event: State.weboob
        });
    });
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

    if (data.currentBankId === bankId) {
        data.currentBankId = null;
        if (data.banks.size) {
            data.currentBankId = data.banks.keys().next().value;
        }
        data.currentAccountId = null;
        if (data.currentBankId && store.getCurrentBank().accounts.size) {
            data.currentAccountId = store.getCurrentBank().accounts.keys().next().value;
        }
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
store.loadAccounts = function({ id: bankId }) {
    let defaultCurrency = store.getSetting('defaultCurrency');
    let accountFromPOD = acc => new Account(acc, defaultCurrency);

    backend.getAccounts(bankId).then(podAccounts => {

        let accounts = podAccounts.map(accountFromPOD);

        let bank = data.banks.get(bankId);
        for (let newacc of accounts) {
            if (bank.accounts.has(newacc.id)) {
                bank.accounts.get(newacc.id).mergeOwnProperties(newacc);
            } else {
                bank.accounts.set(newacc.id, newacc);
            }
        }

        flux.dispatch({
            type: Events.forward,
            event: State.accounts
        });
    })
    .catch(genericErrorHandler);
};

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

        if (data.currentAccountId === accountId) {
            data.currentAccountId = null;
            if (data.currentBankId && store.getCurrentBank().accounts.size) {
                data.currentAccountId = store.getCurrentBank().accounts.keys().next().value;
            }
        }

        if (store.getDefaultAccountId() === accountId) {
            data.settings.set('defaultAccountId', '');
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
store.loadOperationsFor = function(bankId, accountId) {
    backend.getOperations(accountId).then(operations => {

        let bank = data.banks.get(bankId);
        let acc = bank.accounts.get(accountId);
        let unknownOperationTypeId = store.getUnknownOperationType().id;
        acc.operations = operations.map(operationFromPOD(unknownOperationTypeId));

        sortOperations(acc.operations);

        flux.dispatch({
            type: Events.forward,
            event: State.operations
        });
    })
    .catch(genericErrorHandler);
};

store.fetchOperations = function() {
    assert(data.currentBankId !== null);
    assert(data.currentAccountId !== null);

    let accessId = this.getCurrentAccount().bankAccess;
    assert(typeof accessId !== 'undefined', 'Need an access for syncing operations');

    backend.getNewOperations(accessId).then(() => {
        // Reload accounts, for updating the 'last updated' date.
        let currentBank = store.getCurrentBank();
        store.loadAccounts(currentBank);
        // Reload operations, obviously.
        for (let acc of currentBank.accounts.values()) {
            store.loadOperationsFor(currentBank.id, acc.id);
        }
        flux.dispatch({
            type: Events.afterSync
        });
    })
    .catch(err => {
        // Don't use genericErrorHandler here, we have special error handling.
        // TODO fix this ^
        flux.dispatch({
            type: Events.afterSync,
            maybeError: err
        });
    });
};

store.updateCategoryForOperation = function(operation, categoryId) {

    // The server expects an empty string for replacing by none
    let serverCategoryId = categoryId === NONE_CATEGORY_ID ? '' : categoryId;

    backend.setCategoryForOperation(operation.id, serverCategoryId)
    .then(() => {
        operation.categoryId = categoryId;
        // No need to forward at the moment?
    })
    .catch(genericErrorHandler);
};

store.updateTypeForOperation = function(operation, type) {

    assert(type !== null,
           'operations with no type should have been handled in setupKresus');

    backend.setTypeForOperation(operation.id, type)
    .then(() => {
        operation.operationTypeID = type;
        // No need to forward at the moment?
    })
    .catch(genericErrorHandler);
};

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

store.setSettings = function(settings) {
    for (let pair of settings) {
        assert(DefaultSettings.has(pair.name),
               `all settings must have their default value, missing for: ${pair.name}`);
        data.settings.set(pair.name, pair.value);
    }

    assert(data.settings.has('locale'), 'Kresus needs a locale');
    let locale = data.settings.get('locale');
    setupTranslator(locale);
};

store.changeSetting = function(key, value) {
    let previousValue = data.settings.get(key);
    data.settings.set(key, value);
    events.emit(State.settings);

    backend.saveSetting(String(key), String(value))
    .catch(err => {
        genericErrorHandler(err);
        data.settings.set(key, previousValue);

        flux.dispatch({
            type: Events.forward,
            event: State.settings
        });
    });
};

store.changeAccess = function(accessId, login, password, customFields) {
    backend.updateAccess(accessId, { login, password, customFields })
    .then(() => {
        // Nothing to do yet, accesses are not saved locally.
    })
    .catch(genericErrorHandler);
};

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

const globalState = rx.getState();

// Categories
store.getCategoryFromId = function(id) {
    return Category.fromId(globalState.categories, id);
};

store.getCategories = function() {
    return Category.all(globalState.categories);
};

// Operation types
store.getOperationTypes = function() {
    return OperationType.all(globalState.operationTypes);
};

store.operationTypeToLabel = function(id) {
    return OperationType.idToLabel(globalState.operationTypes, id);
};

store.getUnknownOperationType = function() {
    return OperationType.unknown(globalState.operationTypes);
}

// Static information about banks
store.getStaticBanks = function() {
    return StaticBank.all(globalState.staticBanks).toJS();
};

/*
 * ACTIONS
 **/
export let Actions = {

    // Main UI

    selectAccount(account) {
        assert(account instanceof Account, 'SelectAccount expects an Account');
        flux.dispatch({
            type: Events.user.selectedAccount,
            accountId: account.id
        });
    },

    selectBank(bank) {
        assert(bank instanceof Bank, 'SelectBank expects a Bank');
        flux.dispatch({
            type: Events.user.selectedBank,
            bankId: bank.id
        });
    },

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

    setOperationCategory(operation, catId) {
        assert(operation instanceof Operation, 'SetOperationCategory 1st arg must be an Operation');
        assert(typeof catId === 'string', 'SetOperationCategory 2nd arg must be String id');
        flux.dispatch({
            type: Events.user.updatedOperationCategory,
            operation,
            categoryId: catId
        });
    },

    setOperationType(operation, typeId) {
        assert(operation instanceof Operation, 'SetOperationType first arg must be an Operation');
        assert(typeof typeId === 'string', 'SetOperationType second arg must be a String id');
        flux.dispatch({
            type: Events.user.updatedOperationType,
            operation,
            typeId
        });
    },

    setCustomLabel(operation, customLabel) {
        assert(operation instanceof Operation, 'SetCustomLabel 1st arg must be an Operation');
        assert(typeof customLabel === 'string', 'SetCustomLabel 2nd arg must be a String');
        flux.dispatch({
            type: Events.user.updatedOperationCustomLabel,
            operation,
            customLabel
        });
    },

    fetchOperations() {
        flux.dispatch({
            type: Events.user.fetchedOperations
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
        assert(typeof key === 'string', 'key must be a string');
        assert(typeof value === 'string', 'value must be a string');
        assert(key.length + value.length, 'key and value must be non-empty');
        flux.dispatch({
            type: Events.user.changedSetting,
            key,
            value
        });
    },

    changeBoolSetting(key, value) {
        assert(typeof value === 'boolean', 'value must be a boolean');
        this.changeSetting(key, value.toString());
    },

    updateWeboob() {
        flux.dispatch({
            type: Events.user.updatedWeboob
        });
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

        flux.dispatch({
            type: Events.user.changedPassword,
            accessId: account.bankAccess,
            login,
            password,
            customFields
        });
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
        case Events.user.changedPassword:
            has(action, 'accessId');
            has(action, 'password');
            store.changeAccess(action.accessId, action.login, action.password, action.customFields);
            break;

        case Events.user.changedSetting:
            has(action, 'key');
            has(action, 'value');
            store.changeSetting(action.key, action.value);
            break;

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

        case Events.user.fetchedOperations:
            store.fetchOperations();
            break;

        case Events.user.fetchedAccounts:
            has(action, 'bankId');
            has(action, 'accessId');
            has(action, 'accountId');
            store.fetchAccounts(action.bankId, action.accountId, action.accessId);
            break;

        case Events.user.selectedAccount:
            has(action, 'accountId');
            assert(store.getAccount(action.accountId) !== null, 'Selected account must exist');
            data.currentAccountId = action.accountId;
            events.emit(State.accounts);
            break;

        case Events.user.selectedBank: {
            has(action, 'bankId');
            let currentBank = store.getBank(action.bankId);
            assert(currentBank !== null, 'Selected bank must exist');
            data.currentBankId = currentBank.id;
            data.currentAccountId = currentBank.accounts.keys().next().value;
            events.emit(State.banks);
            break;
        }

        case Events.user.createdAlert:
            has(action, 'alert');
            store.createAlert(action.alert);
            break;

        case Events.user.updatedAlert:
            has(action, 'alert');
            has(action, 'attributes');
            store.updateAlert(action.alert, action.attributes);
            break;

        case Events.user.updatedOperationCategory:
            has(action, 'operation');
            has(action, 'categoryId');
            store.updateCategoryForOperation(action.operation, action.categoryId);
            break;

        case Events.user.updatedOperationType:
            has(action, 'operation');
            has(action, 'typeId');
            store.updateTypeForOperation(action.operation, action.typeId);
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

        case Events.user.updatedWeboob:
            store.updateWeboob();
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
