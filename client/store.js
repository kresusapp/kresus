// Locales
// Force importing locales here, so that the module system loads them ahead
// of time.
import './locales/fr';

import {EventEmitter as EE} from 'events';

import {assert, debug, has, translate as t, NONE_CATEGORY_ID,
        setTranslator, setTranslatorAlertMissing} from './Helpers';
import {Account, Bank, Category, Operation} from './Models';

import flux from './flux/dispatcher';

import backend from './backends/http';
import DefaultSettings from './DefaultSettings';

var events = new EE;

// Private data
var data = {
    categories: [],
    categoryLabel: new Map(), // maps category ids to labels
    currentBankId: null,
    currentAccountId: null,
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

// Holds the current bank information
export var store = {};

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

        let p = new Polyglot({allowMissing: true});
        let found = false;

        try {
            p.extend(require('./locales/' + locale));
            found = true;
        } catch (e) {
            console.log(e);
        }

        setTranslator(p);
        // only alert for missing translations in the case of the non default locale
        setTranslatorAlertMissing(found);

        return backend.getSettings();
    }).then(function(settings) {

        for (let pair of settings) {
            data.settings[pair.key] = pair.val;
        }

        cb();
    }).catch((err) => {
        alert('Error when setting up Kresus: ' + err.toString());
    });
}

store.isWeboobInstalled = function() {
    return store.getSetting('weboob-installed') == 'true';
}

store.getWeboobLog = function() {
    return store.getSetting('weboob-log');
}

store.updateWeboob = function() {
    backend.updateWeboob().then(function(weboobData) {
        data.settings['weboob-installed'] = weboobData.isInstalled;
        data.settings['weboob-log'] = weboobData.log;
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
                event: State.accounts
            });
        }
    });
}

store.deleteBank = function(bankId) {
    backend.deleteBank(bankId, function() {
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

store.deleteAccount = function(accountId) {
    backend.deleteAccount(accountId, function() {
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
        title: t('category.none') || 'None'
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

store.deleteOperation = function(operationId) {
    backend.deleteOperation(operationId, function() {
        flux.dispatch({
            type: Events.server.deleted_operation
        });
    });
}

store.changeSetting = function(action) {
    backend.saveSetting(String(action.key), String(action.value))
    .then(() => {
        data.settings[action.key] = action.value;
        // No need to forward
    });
}

/*
 * EVENTS
 */
var Events = {
    forward: 'forward',
    // Events emitted by the user: clicks, submitting a form, etc.
    user: {
        changed_setting: 'the user changed a setting value',
        created_bank: 'the user submitted a bank access creation form',
        created_category: 'the user submitted a category creation form',
        deleted_account: 'the user clicked in order to delete an account',
        deleted_bank: 'the user clicked in order to delete a bank',
        deleted_category: 'the user clicked in order to delete a category',
        deleted_operation: 'the user clicked in order to delete an operation',
        fetched_operations: 'the user clicked in order to fetch operations for a specific bank account',
        selected_account: 'the user clicked to change the selected account, or a callback forced selection of an account',
        selected_bank: 'the user clicked to change the selected bank, or a callback forced selection of a bank',
        updated_category: 'the user submitted a category update form',
        updated_category_of_operation: 'the user changed the category of an operation in the select list',
        updated_weboob: 'the user asked to update weboob'
    },
    // Events emitted in an event loop: xhr callback, setTimeout/setInterval etc.
    server: {
        deleted_account: 'an account has just been deleted on the server',
        deleted_bank: 'a bank has just been deleted on the server',
        deleted_category: 'a category has just been deleted on the server',
        deleted_operation: 'an operation has just been deleted on the server',
        loaded_accounts_any_bank: 'accounts from a particular given bank have been loaded from the server',
        loaded_accounts_current_bank: 'accounts from the current bank have been loaded from the server',
        loaded_banks: 'bank list has been loaded from the server',
        loaded_categories: 'category list has been loaded from the server',
        loaded_operations: 'operation list has been loaded from the server',
        saved_bank: 'a bank access was saved (created or updated) on the server.',
        saved_category: 'a category was saved (created or updated) on the server.',
        updated_weboob: 'weboob got updated on the server',
    },
};

export let State = {
    banks: 'banks state changed',
    accounts: 'accounts state changed',
    operations: 'operations state changed',
    categories: 'categories state changed',
    weboob: 'weboob state changed'
}

/*
 * ACTIONS
 **/
export let Actions = {

    // Main UI

    SelectAccount(account) {
        assert(account instanceof Account, 'SelectAccount expects an Account');
        flux.dispatch({
            type: Events.user.selected_account,
            accountId: account.id
        })
    },

    SelectBank(bank) {
        assert(bank instanceof Bank, 'SelectBank expects a Bank');
        flux.dispatch({
            type: Events.user.selected_bank,
            bankId: bank.id
        });
    },

    // Categories

    CreateCategory(category) {
        has(category, 'title', 'CreateCategory expects an object that has a title field');
        flux.dispatch({
            type: Events.user.created_category,
            category: category
        });
    },

    UpdateCategory(category, newCategory) {
        assert(category instanceof Category, 'UpdateCategory expects a Category as the first argument');
        has(newCategory, 'title', 'UpdateCategory expects a second argument that has a title field');
        flux.dispatch({
            type: Events.user.updated_category,
            id: category.id,
            category: newCategory
        });
    },

    DeleteCategory(category, replace) {
        assert(category instanceof Category, 'DeleteCategory expects a Category as the first argument');
        assert(typeof replace === 'string', 'DeleteCategory expects a String as the second argument');
        flux.dispatch({
            type: Events.user.deleted_category,
            id: category.id,
            replaceByCategoryId: replace
        });
    },

    // Operation list

    SetOperationCategory(operation, catId) {
        assert(operation instanceof Operation, 'SetOperationCategory expects an Operation as the first argument');
        assert(typeof catId === 'string', 'SetOperationCategory expects a String category id as the second argument');
        flux.dispatch({
            type: Events.user.updated_category_of_operation,
            operationId: operation.id,
            categoryId: catId
        });
    },

    FetchOperations() {
        flux.dispatch({
            type: Events.user.fetched_operations
        });
    },

    // Settings

    DeleteAccount(account) {
        assert(account instanceof Account, 'DeleteAccount expects an Account');
        flux.dispatch({
            type: Events.user.deleted_account,
            accountId: account.id
        });
    },

    DeleteBank(bank) {
        assert(bank instanceof Bank, 'DeleteBank expects an Bank');
        flux.dispatch({
            type: Events.user.deleted_bank,
            bankId: bank.id
        });
    },

    CreateBank(uuid, login, passwd, website) {
        assert(typeof uuid === 'string' && uuid.length, 'uuid must be a non-empty string');
        assert(typeof login === 'string' && login.length, 'login must be a non-empty string');
        assert(typeof passwd === 'string' && passwd.length, 'passwd must be a non-empty string');
        var eventObject = {
            type: Events.user.created_bank,
            bankUuid: uuid,
            id: login,
            pwd: passwd
        };
        if (typeof website !== 'undefined')
            eventObject.website = website;
        flux.dispatch(eventObject);
    },

    ChangeSetting(key, val) {
        assert(typeof key === 'string', 'key must be a string');
        assert(typeof val === 'string', 'value must be a string');
        assert(key.length + val.length, 'key and value must be non-empty');
        flux.dispatch({
            type: Events.user.changed_setting,
            key: key,
            value: val
        });
    },

    UpdateWeboob() {
        flux.dispatch({
            type: Events.user.updated_weboob
        });
    },

    // Duplicates

    DeleteOperation(operation) {
        assert(operation instanceof Operation, 'DeleteOperation expects an Operation');
        flux.dispatch({
            type: Events.user.deleted_operation,
            operationId: operation.id
        });
    }
};

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
        has(action, 'accountId');
        store.deleteAccount(action.accountId);
        break;

      case Events.user.deleted_bank:
        has(action, 'bankId');
        store.deleteBank(action.bankId);
        break;

      case Events.user.deleted_category:
        has(action, 'id');
        has(action, 'replaceByCategoryId');
        store.deleteCategory(action.id, action.replaceByCategoryId);
        break;

      case Events.user.deleted_operation:
        has(action, 'operationId');
        store.deleteOperation(action.operationId);
        break;

      case Events.user.fetched_operations:
        store.fetchOperations();
        break;

      case Events.user.selected_account:
        has(action, 'accountId');
        data.currentAccountId = action.accountId;
        store.loadOperationsFor(data.currentAccountId);
        events.emit(State.accounts);
        break;

      case Events.user.selected_bank:
        has(action, 'bankId');
        assert(data.banks.has(action.bankId));
        data.currentBankId = action.bankId;
        store.loadAccountsCurrentBank();
        events.emit(State.banks);
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
        events.emit(State.accounts);
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

        events.emit(State.accounts);
        break;

      case Events.server.loaded_banks:
        has(action, 'bankMap');
        data.banks = action.bankMap;
        events.emit(State.banks);
        break;

      case Events.server.loaded_categories:
        has(action, 'categories');
        store.setCategories(action.categories);
        events.emit(State.categories);
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
            events.emit(State.operations);
        break;

      case Events.server.saved_category:
        store.loadCategories();
        // No need to forward
        break;

      case Events.server.updated_weboob:
        events.emit(State.weboob);
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
    assert(event == State.banks ||
           event == State.accounts ||
           event == State.operations ||
           event == State.categories ||
           event == State.weboob,
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

      case State.banks:
        if (data.banks.size > 0) {
            debug('Store - cache hit for banks');
            cb();
        }
        break;

      case State.accounts:
        if (data.currentBankId !== null) {
            debug('Store - cache hit for accounts');
            cb();
        }
        break;

      case State.operations:
        if (data.currentBankId !== null &&
            data.currentAccountId !== null) {
            debug('Store - cache hit for operations');
            cb();
        }
        break;

      case State.categories:
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
