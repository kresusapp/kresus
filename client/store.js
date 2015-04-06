// Locales
// Force importing locales here, so that the module system loads them ahead
// of time.
import './locales/en';
import './locales/fr';

import {EventEmitter as EE} from 'events';
import Events from './Events';

import {assert, debug, has, translate as t, NONE_CATEGORY_ID, setTranslator} from './Helpers';
import {Account, Bank, Category, Operation} from './Models';

import flux from './flux/dispatcher';

// Holds the current bank information
var store = {};
export default store;

import backend from './backends/http';
import DefaultSettings from './DefaultSettings';

var events = new EE;

// Private data
var data = {
    categories: [],
    categoryLabel: new Map(), // maps category ids to labels
    currentBankId: null,
    currentAccountId: null,
    weboob: {
        installed: false,
        log: ''
    },
    // TODO get default settings from the server
    settings: DefaultSettings,

    /*
    {
        'bankId': {
            name: 'blabla',
            accounts: {
                'accountId1': {
                    name: 'something',
                    id: 'accountId1',
                    operations: [instanceof Operation]
                },
                'accountId2': {
                }
            }
        },
        'anotherBankId': {
            // ...
        }
    }
    */
    banks: new Map(),

    /* Contains static information about banks (name/uuid) */
    StaticBanks: {}
};

/*
 * GETTERS
 **/

store.getCurrentBankId = function() {
    return data.currentBankId;
}

store.getCurrentAccountId = function() {
    return data.currentAccountId;
}

// [{bankId, bankName}]
store.getStaticBanks = function() {
    has(data, 'StaticBanks');
    assert(data.StaticBanks !== null);
    var banks = [];
    for (var id in data.StaticBanks) {
        var b = data.StaticBanks[id];
        banks.push({
            id: b.id,
            name: b.name,
            uuid: b.uuid,
            websites: b.websites
        });
    }
    return banks;
}

// [{bankId, bankName}]
store.getBanks = function() {
    has(data, 'banks');

    let ret = [];
    for (let bank of data.banks.values()) {
        ret.push(bank);
    }
    return ret;
}

// [instanceof Account]
store.getBankAccounts = function(bankId) {
    if (!data.banks.has(bankId)) {
        debug('getBankAccounts: No bank with id ' + bankId + ' found.');
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
}

store.getCurrentBankAccounts = function() {
    if (data.currentBankId === null) {
        debug('getCurrentBankAccounts: No current bank set.');
        return [];
    }
    assert(data.banks.has(data.currentBankId));
    return store.getBankAccounts(data.currentBankId);
}

// instanceof Account
store.getCurrentAccount = function() {

    if (data.currentBankId === null) {
        debug('getCurrentAccount: No current bank is set');
        return null;
    }

    if (data.currentAccountId === null) {
        debug('getCurrentAccount: No current account is set');
        return null;
    }

    let currentBank = data.banks.get(data.currentBankId);
    let currentBankAccounts = currentBank.accounts;
    assert(currentBankAccounts.has(data.currentAccountId));
    return currentBankAccounts.get(data.currentAccountId);
}

// [instanceof Operation]
store.getCurrentOperations = function() {
    var acc = this.getCurrentAccount();
    if (acc === null)
        return [];
    return acc.operations;
}

// [instanceof Category]
store.getCategories = function() {
    return data.categories;
}

// String
store.getSetting = function(key) {
    var dict = data.settings;
    assert(typeof dict[key] !== 'undefined', 'setting not set: ' + key);
    return dict[key];
}

/*
 * BACKEND
 **/

store.setupKresus = function(cb) {
    backend.getLocale().then(function(locale) {
        var p = new Polyglot();
        var locales;
        try {
            locales = require('./locales/' + locale);
        } catch (e) {
            console.log(e);
            locales = require('./locales/en');
        }
        p.extend(locales);
        setTranslator(p);

        return backend.getWeboobStatus();
    }).then(function(weboobData) {
        data.weboob.installed = weboobData.isInstalled;
        data.weboob.log = weboobData.log;
        cb();
    }).catch((err) => {
        alert('Error when setting up Kresus: ' + err.toString());
    });
}

store.isWeboobInstalled = function() {
    return data.weboob.installed;
}

store.updateWeboob = function() {
    backend.updateWeboob().then(function(weboobData) {
        data.weboob.installed = weboobData.isInstalled;
        data.weboob.log = weboobData.log;
        flux.dispatch({
            type: Events.server.updated_weboob
        });
    }).catch((err) => {
        alert('Error when updating weboob: ' + err.toString());
        flux.dispatch({
            type: Events.server.updated_weboob
        });
    });
}

// BANKS
store.addBank = function(uuid, id, pwd, maybeWebsite) {
    backend.addBank(uuid, id, pwd, maybeWebsite, function() {
        flux.dispatch({
            type: Events.server.saved_bank
        });
    });
}

store.loadStaticBanks = function() {
    backend.getStaticBanks(function (banks) {
        data.StaticBanks = banks;
    });
}

store.loadUserBanks = function() {

    data.currentBankId = null;
    data.currentAccountId = null;

    backend.getBanks(function (banks, firstBankId) {

        let bankMap = new Map;
        for (var id in banks) {
            banks[id].accounts = new Map;
            bankMap.set(id, banks[id]);
        }

        flux.dispatch({
            type: Events.server.loaded_banks,
            bankMap: bankMap
        });

        if (firstBankId !== null) {
            // Force selection of first bank
            flux.dispatch({
                type: Events.user.selected_bank,
                bankId: firstBankId
            });
        } else {
            // Having no banks means having no accounts, so let accounts
            // subscribers know about this.
            flux.dispatch({
                type: Events.forward,
                event: Events.state.accounts
            });
        }
    });
}

store.deleteBank = function(bank) {
    backend.deleteBank(bank.id, function() {
        flux.dispatch({
            type: Events.server.deleted_bank
        });
    });
}

// ACCOUNTS
store.loadAccountsAnyBank = function(bank) {
    backend.getAccounts(bank.id, function(bankId, accounts) {
        let accountMap = new Map;
        for (var id in accounts) {
            accountMap.set(id, accounts[id]);
        }
        flux.dispatch({
            type: Events.server.loaded_accounts_any_bank,
            bankId: bankId,
            accountMap: accountMap
        });
    });
}

store.loadAccountsCurrentBank = function () {
    assert(data.currentBankId !== null);
    backend.getAccounts(data.currentBankId, function(bankId, accounts, firstAccountId) {
        data.currentAccountId = null;

        let accountMap = new Map();
        for (var id in accounts) {
            accountMap.set(id, accounts[id]);
        }

        flux.dispatch({
            type: Events.server.loaded_accounts_current_bank,
            bankId: data.currentBankId,
            accountMap: accountMap
        });

        if (firstAccountId !== -1) {
            // Force selection of first account
            flux.dispatch({
                type: Events.user.selected_account,
                accountId: firstAccountId
            });

            // Force loading of all operations
            for (var id in accounts) {
                store.loadOperationsForImpl(bankId, id, /* propagate = */ false);
            }
        }
    });
}

store.deleteAccount = function(account) {
    backend.deleteAccount(account.id, function() {
        flux.dispatch({
            type: Events.server.deleted_account
        });
    });
}

// OPERATIONS
store.loadOperationsForImpl = function(bankId, accountId, propagate) {
    backend.getOperations(accountId, function(operations) {
        flux.dispatch({
            type: Events.server.loaded_operations,
            bankId: bankId,
            accountId: accountId,
            operations: operations,
            propagate: propagate
        });
    });
};

store.loadOperationsFor = function(accountId) {
    this.loadOperationsForImpl(data.currentBankId, accountId, /* propagate = */ true);
}

store.fetchOperations = function() {
    assert(data.currentBankId !== null);
    assert(data.currentAccountId !== null);

    var bankId = data.currentBankId;
    var accountId = data.currentAccountId;
    backend.getNewOperations(accountId, function(account) {
        assert(data.banks.has(bankId));
        let bank = data.banks.get(bankId);
        let accounts = bank.accounts;
        accounts.set(accountId, account);
        store.loadOperationsFor(accountId);
    });
};

// CATEGORIES
store.loadCategories = function() {
    backend.getCategories(function(categories) {
        // Sort categories alphabetically
        categories.sort(function(a, b) {
            return a.title.toLowerCase() > b.title.toLowerCase();
        });

        flux.dispatch({
            type: Events.server.loaded_categories,
            categories: categories
        });
    });
};

store.addCategory = function(category) {
    backend.addCategory(category, function () {
        flux.dispatch({
            type: Events.server.saved_category
        });
    });
}

store.updateCategory = function(id, category) {
    backend.updateCategory(id, category, function () {
        flux.dispatch({
            type: Events.server.saved_category
        });
    });
}

store.deleteCategory = function(id, replaceBy) {
    assert(typeof replaceBy !== 'undefined');
    backend.deleteCategory(id, replaceBy, function () {
        flux.dispatch({
            type: Events.server.deleted_category
        });
    });
}

store.categoryToLabel = function(id) {
    assert(data.categoryLabel.has(id),
           'categoryToLabel lookup failed for id: ' + id);
    return data.categoryLabel.get(id);
}

store.setCategories = function(cat) {
    var NONE_CATEGORY = new Category({
        id: NONE_CATEGORY_ID,
        title: t('none_category')
    });

    data.categories = [NONE_CATEGORY].concat(cat);
    data.categoryLabel = new Map();
    for (var i = 0; i < data.categories.length; i++) {
        var c = data.categories[i];
        has(c, 'id');
        has(c, 'title');
        data.categoryLabel.set(c.id, c.title);
    }
}

store.updateCategoryForOperation = function(operationId, categoryId) {
    backend.setCategoryForOperation(operationId, categoryId, function () {
        // No need to forward, at the moment (?)
    });
}

store.deleteOperation = function(operation) {
    assert(operation instanceof Operation);
    backend.deleteOperation(operation.id, function() {
        flux.dispatch({
            type: Events.server.deleted_operation
        });
    });
}

store.changeSetting = function(action) {
    data.settings[action.key] = action.value;
    // TODO rest call
}

flux.register(function(action) {
    switch (action.type) {

      // User events
      case Events.user.changed_setting:
        has(action, 'key');
        has(action, 'value');
        store.changeSetting(action);
        break;

      case Events.user.created_bank:
        has(action, 'bankUuid');
        has(action, 'id');
        has(action, 'pwd');
        store.addBank(action.bankUuid, action.id, action.pwd, action.website);
        break;

      case Events.user.created_category:
        has(action, 'category');
        store.addCategory(action.category);
        break;

      case Events.user.deleted_account:
        has(action, 'account');
        assert(action.account instanceof Account);
        store.deleteAccount(action.account);
        break;

      case Events.user.deleted_bank:
        has(action, 'bank');
        assert(action.bank instanceof Bank);
        store.deleteBank(action.bank);
        break;

      case Events.user.deleted_category:
        has(action, 'id');
        has(action, 'replaceByCategoryId');
        store.deleteCategory(action.id, action.replaceByCategoryId);
        break;

      case Events.user.deleted_operation:
        has(action, 'operation');
        assert(action.operation instanceof Operation);
        store.deleteOperation(action.operation);
        break;

      case Events.user.fetched_operations:
        store.fetchOperations();
        break;

      case Events.user.selected_account:
        has(action, 'accountId');
        data.currentAccountId = action.accountId;
        store.loadOperationsFor(data.currentAccountId);
        events.emit(Events.state.accounts);
        break;

      case Events.user.selected_bank:
        has(action, 'bankId');
        assert(data.banks.has(action.bankId));
        data.currentBankId = action.bankId;
        store.loadAccountsCurrentBank();
        events.emit(Events.state.banks);
        break;

      case Events.user.updated_category:
        has(action, 'id');
        has(action, 'category');
        store.updateCategory(action.id, action.category);
        break;

      case Events.user.updated_category_of_operation:
        has(action, 'operationId');
        has(action, 'categoryId');
        store.updateCategoryForOperation(action.operationId, action.categoryId);
        break;

      case Events.user.updated_weboob:
        store.updateWeboob();
        break;

      // Server events
      case Events.server.deleted_account:
      case Events.server.deleted_bank:
      case Events.server.saved_bank:
        store.loadUserBanks();
        // No need to forward
        break;

      case Events.server.deleted_operation:
        assert(typeof data.currentAccountId !== 'undefined');
        store.loadOperationsFor(data.currentAccountId);
        // No need to forward
        break;

      case Events.server.deleted_category:
        store.loadCategories();
        // Deleting a category will change operations affected to that category
        if (data.currentBankId !== null)
            store.loadAccountsCurrentBank();
        break;

      case Events.server.loaded_accounts_current_bank:
        has(action, 'accountMap');
        has(action, 'bankId');
        assert(data.banks.has(action.bankId));
        let bank = data.banks.get(action.bankId);
        bank.accounts = action.accountMap;
        events.emit(Events.state.accounts);
        break;

      case Events.server.loaded_accounts_any_bank:
        has(action, 'accountMap');
        has(action, 'bankId');

        // Don't clobber current values!
        for (let [id, newAcc] of action.accountMap) {
            let bank = data.banks.get(action.bankId);
            let accs = bank.accounts;

            assert(typeof accs !== 'undefined', 'bank.accounts must exist');
            assert(accs instanceof Map, 'bank.accounts must be a Map');

            if (accs.has(id))
                accs.get(id).mergeOwnProperties(newAcc);
            else
                accs.set(id, newAcc);
        }

        events.emit(Events.state.accounts);
        break;

      case Events.server.loaded_banks:
        has(action, 'bankMap');
        data.banks = action.bankMap;
        events.emit(Events.state.banks);
        break;

      case Events.server.loaded_categories:
        has(action, 'categories');
        store.setCategories(action.categories);
        events.emit(Events.state.categories);
        break;

      case Events.server.loaded_operations:
        has(action, 'bankId');
        has(action, 'accountId');
        has(action, 'operations');
        if (action.operations.length > 0)
            assert(action.operations[0] instanceof Operation);

        data.banks.get(action.bankId)
                  .accounts.get(action.accountId)
                  .operations            = action.operations;

        if (action.propagate)
            events.emit(Events.state.operations);
        break;

      case Events.server.saved_category:
        store.loadCategories();
        // No need to forward
        break;

      case Events.server.updated_weboob:
        events.emit(Events.state.weboob);
        break;

      case Events.forward:
        has(action, 'event');
        events.emit(action.event);
        break;

      default:
        assert(true == false, "unhandled event in store switch: " + action.type);
    }
});

function CheckEvent(event) {
    assert(event == Events.state.banks ||
           event == Events.state.accounts ||
           event == Events.state.operations ||
           event == Events.state.categories ||
           event == Events.state.weboob,
           'component subscribed to an unknown / forbidden event:' + event);
}

store.on = function(event, cb) {
    CheckEvent(event);
    events.on(event, cb);
}

store.once = function(event, cb) {
    CheckEvent(event);
    events.once(event, cb);
}

store.removeListener = function(event, cb) {
    events.removeListener(event, cb);
}

// Subscribes callback to event, and calls the callback if there's already data.
store.subscribeMaybeGet = function(event, cb) {
    store.on(event, cb);

    switch (event) {

      case Events.state.banks:
        if (data.banks.size > 0) {
            debug('Store - cache hit for banks');
            cb();
        }
        break;

      case Events.state.accounts:
        if (data.currentBankId !== null) {
            debug('Store - cache hit for accounts');
            cb();
        }
        break;

      case Events.state.operations:
        if (data.currentBankId !== null &&
            data.currentAccountId !== null) {
            debug('Store - cache hit for operations');
            cb();
        }
        break;

      case Events.state.categories:
        if (data.categories.length > 0) {
            debug('Store - cache hit for categories');
            cb();
        }
        break;

      default:
        assert(false, "default case of subscribeMaybeGet shouldn't ever be reached");
        break;
    }
};
