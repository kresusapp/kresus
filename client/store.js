// Locales
// Force importing locales here, so that the module system loads them ahead
// of time.
import './locales/fr';

import {EventEmitter as EE} from 'events';

import {assert, debug, maybeHas, has, translate as t, NONE_CATEGORY_ID, NONE_OPERATION_TYPE_ID,
        setTranslator, setTranslatorAlertMissing, DEFAULT_TYPE_LABELS} from './Helpers';
import {Account, Bank, Category, Operation, OperationType} from './Models';

import flux from './flux/dispatcher';

import backend from './backend';
import DefaultSettings from './DefaultSettings';

var events = new EE;

// Private data
var data = {
    categories: [],
    categoryLabel: new Map(), // maps category ids to labels
    currentBankId: null,
    currentAccountId: null,
    settings: new Map(DefaultSettings),

    // Map of Banks (id -> bank)
    // (Each bank has an "account" field which is a map (id -> account),
    //  each account has an "operation" field which is an array of Operation).
    banks: new Map,
    operationtypes: [],
    operationTypesLabel: new Map(), // Maps operation types to labels
    /* Contains static information about banks (name/uuid) */
    StaticBanks: []
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

// [instanceof Bank]
store.getStaticBanks = function() {
    has(data, 'StaticBanks');
    assert(data.StaticBanks !== null);
    return data.StaticBanks.slice();
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

store.getBank = function(id) {
    if (!data.banks.has(id))
        return null;
    return data.banks.get(id);
}

store.getAccount = function(id) {
    for (let bank of data.banks.values()) {
        if (bank.accounts.has(id))
            return bank.accounts.get(id);
    }
    return null;
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

store.getCurrentBank = function() {
    if (data.currentBankId === null) {
        debug('getCurrentBank: No current bank is set');
        return null;
    }
    return data.banks.get(data.currentBankId);
}

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

// [instanceof OperationType]
store.getOperationTypes = function() {
    return data.operationtypes;
}

// String
store.getSetting = function(key) {
    let dict = data.settings;
    assert(DefaultSettings.has(key), `all settings must have default values, but ${key} doesn't have one.`);
    assert(dict.has(key), `setting not set: ${key}`);
    return dict.get(key);
}

// Bool
store.isWeboobInstalled = function() {
    return store.getSetting('weboob-installed').toString() === 'true';
}

// String
store.getWeboobLog = function() {
    return store.getSetting('weboob-log');
}

/*
 * BACKEND
 **/

function sortOperations(ops) {
    // Sort by -date first, then by +title.
    ops.sort((a, b) => {
        let ad = +a.date,
            bd = +b.date;
        if (ad < bd)
            return 1;
        if (ad > bd)
            return -1;

        let at = a.title,
            bt = b.title;
        if (at > bt)
            return -1;
        if (at < bt)
            return 1;
        return 0;
    });
}

store.setupKresus = function(cb) {
    backend.init().then((world) => {

        has(world, 'settings');
        store.setSettings(world.settings, world.cozy);

        has(world, 'banks');
        world.banks.sort((a, b) => {
            let an = a.name.toLowerCase();
            let bn = b.name.toLowerCase();
            if (an < bn) return -1;
            if (an > bn) return 1;
            return 0;
        });
        data.StaticBanks = world.banks;

        has(world, 'accounts');
        has(world, 'operations');
        data.banks = new Map;
        for (let bankPOD of world.banks) {
            let bank = new Bank(bankPOD);
            let accounts = world.accounts.filter((acc) => acc.bank === bank.uuid);
            if (accounts.length) {
                // Found a bank with accounts.
                data.banks.set(bank.id, bank);

                accounts.sort((a, b) => a.title.toLowerCase() > b.title.toLowerCase());

                bank.accounts = new Map;
                for (let accPOD of accounts) {
                    let acc = new Account(accPOD);
                    bank.accounts.set(acc.id, acc);

                    acc.operations = world.operations
                        .filter((op) => op.bankAccount === acc.accountNumber)
                        .map((op) => new Operation(op));

                    sortOperations(acc.operations);

                    if (!data.currentAccountId) {
                        data.currentAccountId = acc.id;
                    }
                }

                if (!data.currentBankId) {
                    data.currentBankId = bank.id;
                }
            }
        }

        has(world, 'categories');
        store.setCategories(world.categories);
        has(world, 'operationtypes');
        store.setOperationTypes(world.operationtypes);
        cb && cb();
    }).catch((err) => {
        alert('Error when setting up Kresus: ' + err.toString());
    });
}

store.updateWeboob = function(which) {
    backend.updateWeboob(which).then(function(weboobData) {
        data.settings.set('weboob-installed', weboobData.isInstalled);
        data.settings.set('weboob-log', weboobData.log);
        flux.dispatch({
            type: Events.forward,
            event: State.weboob
        });
    }).catch((err) => {
        alert('Error when updating weboob: ' + err.toString());
        flux.dispatch({
            type: Events.forward,
            event: State.weboob
        });
    });
}

store.importInstance = function(content) {
    backend.importInstance(content).then(() => {
        // Reload all the things!
        flux.dispatch({
            type: Events.server.saved_bank
        });
    }).catch((err) => {
        alert('Error when importing instance: ' + err.toString());
    })
}

// BANKS
store.addBank = function(uuid, id, pwd, maybeWebsite) {
    backend.addBank(uuid, id, pwd, maybeWebsite).then(() => {
        flux.dispatch({
            type: Events.server.saved_bank
        });
    }).catch((err) => {
        flux.dispatch({
            type: Events.after_sync,
            maybeError: err
        });
    });
}

store.deleteBank = function(bankId) {
    backend.deleteBank(bankId, function() {

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
    });
}

// ACCOUNTS
store.loadAccounts = function(bank) {
    let bankId = bank.id;
    backend.getAccounts(bankId, function(bankId, accounts) {

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
    });
}

store.deleteAccount = function(accountId) {
    backend.deleteAccount(accountId, function() {

        let found = false;
        for (let bank of data.banks.values()) {
            if (bank.accounts.has(accountId)) {
                bank.accounts.delete(accountId);
                found = true;
                break;
            }
        }
        assert(found, "Deleted account must have been present in the first place");

        if (data.currentAccountId === accountId) {
            data.currentAccountId = null;
            if (data.currentBankId && store.getCurrentBank().accounts.size) {
                data.currentAccountId = store.getCurrentBank().accounts.keys().next().value;
            }
        }

        flux.dispatch({
            type: Events.forward,
            event: State.accounts
        });
    });
}

store.fetchAccounts = function(bankId, accountId, accessId) {
    assert(data.banks.has(bankId));

    backend.getNewAccounts(accessId).then(() => {
        let bank = data.banks.get(bankId);
        store.loadAccounts(bank);
        // Retrieve operations of all bank accounts
        for (let acc of bank.accounts.values()) {
            store.loadOperationsFor(bankId, acc.id);
        }
    }).catch((err) => {
        flux.dispatch({
            type: Events.after_sync,
            maybeError: err
        });
    });
};

// OPERATIONS
store.loadOperationsFor = function(bankId, accountId) {
    backend.getOperations(accountId, function(operations) {

        let bank = data.banks.get(bankId);
        let acc = bank.accounts.get(accountId);
        acc.operations = operations;
        sortOperations(acc.operations);

        flux.dispatch({
            type: Events.forward,
            event: State.operations
        });
    });
}

store.fetchOperations = function() {
    assert(data.currentBankId !== null);
    assert(data.currentAccountId !== null);

    let accountId = data.currentAccountId;
    var accessId = this.getCurrentAccount().bankAccess;
    assert(typeof accessId !== 'undefined', 'Need an access for syncing operations');

    backend.getNewOperations(accessId).then(function() {
        // Reload accounts, for updating the 'last updated' date.
        let currentBank = store.getCurrentBank();
        store.loadAccounts(currentBank);
        // Reload operations, obviously.
        for (let acc of currentBank.accounts.values()) {
            store.loadOperationsFor(currentBank.id, acc.id);
        }
        flux.dispatch({
            type: Events.after_sync
        });
    }).catch((err) => {
        flux.dispatch({
            type: Events.after_sync,
            maybeError: err
        });
    });
};

store.updateCategoryForOperation = function(operation, categoryId) {
    backend.setCategoryForOperation(operation.id, categoryId)
    .then(() => {
        operation.categoryId = categoryId;
        // No need to forward at the moment?
    })
    .catch((err) => {
        // TODO better error message, also cancel optimistic updates
        alert("An error occurred when updating the category: ", err.xhrText, err.xhrError);
    });
}

store.updateTypeForOperation = function(operation, type) {
    backend.setTypeForOperation(operation.id, type)
    .then(() => {
        operation.type = type;
        // No need to forward at the moment?
    })
    .catch((err) => {
        // TODO see also updateCategoryForOperation
        alert("An error occurred when updating the type: ", err.xhrText, err.xhrError);
    });
}

store.mergeOperations = function(toKeepId, toRemoveId) {
    backend.mergeOperations(toKeepId, toRemoveId).then(function(newToKeep) {

        let ops = store.getCurrentOperations();

        let found = 0;
        let toDeleteIndex = null;
        for (let i = 0; i < ops.length; i++) {
            let op = ops[i];
            if (op.id === toKeepId) {
                op.categoryId = newToKeep.categoryId || NONE_CATEGORY_ID;
                op.type = newToKeep.type || NONE_OPERATION_TYPE_ID;
                op.binary = newToKeep.binary || null;
                op.attachments = newToKeep.attachments || null;
                if (++found == 2)
                    break;
            } else if (op.id === toRemoveId) {
                toDeleteIndex = i;
                if (++found == 2)
                    break;
            }
        }
        assert(found == 2, "both operations had to be present");
        assert(toDeleteIndex !== null);

        ops.splice(toDeleteIndex, 1);

        flux.dispatch({
            type: Events.forward,
            event: State.operations
        });

    }).catch((err) => {
        alert('Error when merging operations: ' + err.toString());
    });
}

// CATEGORIES
store.addCategory = function(category) {
    backend.addCategory(category, function (created) {

        store.triggerNewCategory(created);

        flux.dispatch({
            type: Events.forward,
            event: State.categories
        });
    });
}

store.updateCategory = function(id, category) {
    backend.updateCategory(id, category, function (newCat) {

        store.triggerUpdateCategory(id, newCat);

        flux.dispatch({
            type: Events.forward,
            event: State.categories
        });
    });
}

store.deleteCategory = function(id, replaceById) {
    assert(typeof replaceById !== 'undefined');
    backend.deleteCategory(id, replaceById, function () {

        store.triggerDeleteCategory(id, replaceById);

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

function resetCategoryMap() {
    data.categories.sort((a, b) => a.title.toLowerCase() > b.title.toLowerCase())
    data.categoryLabel = new Map();
    for (var i = 0; i < data.categories.length; i++) {
        var c = data.categories[i];
        has(c, 'id');
        has(c, 'title');
        data.categoryLabel.set(c.id, c.title);
    }
}

store.setCategories = function(categories) {
    var NONE_CATEGORY = new Category({
        id: NONE_CATEGORY_ID,
        title: t('category.none') || 'None'
    });

    data.categories = [NONE_CATEGORY].concat(categories)
                        .map((cat) => new Category(cat));
    resetCategoryMap();
}

store.triggerNewCategory = function(category) {
    data.categories.push(new Category(category));
    resetCategoryMap();
}

store.triggerUpdateCategory = function(id, updated) {
    for (let cat of data.categories) {
        if (cat.id === id) {
            cat.mergeOwnProperties(updated);
            resetCategoryMap();
            return;
        }
    }
    assert(false, "Didn't find category to update");
}

store.triggerDeleteCategory = function(id, replaceId) {
    let found = false;
    for (let i = 0; i < data.categories.length; i++) {
        let cat = data.categories[i];
        if (cat.id === id) {
            data.categories.splice(i, 1);
            resetCategoryMap();
            found = true;
            break;
        }
    }
    assert(found, "Didn't find category to delete");

    // Update operations
    for (let bank of data.banks.values()) {
        for (let acc of bank.accounts.values()) {
            for (let op of acc.operations) {
                if (op.categoryId === id) {
                    op.categoryId = replaceId;
                }
            }
        }
    }
}

// SETTINGS

store.setSettings = function(settings, cozy) {
    for (let pair of settings) {
        assert(DefaultSettings.has(pair.name),
               'all settings must have their default value, missing for: ' + pair.name);
        data.settings.set(pair.name, pair.value);
    }

    if (!data.settings.has('locale')) {
        if (cozy && cozy.length && cozy[0].locale) {
            data.settings.set('locale', cozy[0].locale);
        } else {
            data.settings.set('locale', 'en');
        }
    }

    assert(data.settings.has('locale'), 'Kresus needs a locale');
    let locale = data.settings.get('locale');
    let p = new Polyglot({allowMissing: true});
    let found = false;
    try {
        p.extend(require('./locales/' + locale));
        found = true;
    } catch (e) {
        // Default locale is 'en', so the error shouldn't be shown in this
        // case.
        if (locale !== 'en') {
            console.log(e);
        }
    }

    setTranslator(p);
    // only alert for missing translations in the case of the non default locale
    setTranslatorAlertMissing(found);
}

store.changeSetting = function(key, value) {
    backend.saveSetting(String(key), String(value))
    .then(() => {
        data.settings.set(key, value);
        // No need to forward
    });
}

store.changeAccessPassword = function(accessId, password) {
    backend.updateAccess(accessId, {password});
}


//OPERATION TYPES
store.setOperationTypes = function(operationtypes){
    var NONE_OPERATION_TYPE = new OperationType({
        id: NONE_OPERATION_TYPE_ID,
        name: 'type.none',
        weboobvalue: 0
    });
    data.operationtypes = [NONE_OPERATION_TYPE]
                            .concat(operationtypes)
                            .map((type) => new OperationType(type));
    resetOperationTypesLabel();
}

function resetOperationTypesLabel(){
    data.operationTypesLabel = new Map();

    for (var i = 0; i < data.operationtypes.length; i++) {
        var c = data.operationtypes[i];
        has(c, 'id');
        has(c, 'name');
        data.operationTypesLabel.set(c.id, t(c.name) || DEFAULT_TYPE_LABELS[c.name]);
    }

    // Sort operation types by names
    data.operationtypes.sort((a, b) => {
        var al = store.operationTypeToLabel(a.id);
        var bl = store.operationTypeToLabel(b.id);
        if (al < bl) return -1;
        if (al > bl) return 1;
        return 0;
    });
}

store.operationTypeToLabel = function(id){
    assert(data.operationTypesLabel.has(id),
           'operationTypeToLabel lookup failed for id: ' + id);
    return data.operationTypesLabel.get(id);
}


/*
 * EVENTS
 */
var Events = {
    forward: 'forward',
    // Events emitted by the user: clicks, submitting a form, etc.
    user: {
        changed_password: 'the user changed the password of a bank access',
        changed_setting: 'the user changed a setting value',
        created_bank: 'the user submitted a bank access creation form',
        created_category: 'the user submitted a category creation form',
        deleted_account: 'the user clicked in order to delete an account',
        deleted_bank: 'the user clicked in order to delete a bank',
        deleted_category: 'the user clicked in order to delete a category',
        fetched_accounts: 'the user clicked in order to fetch new accounts and operations for a bank',
        fetched_operations: 'the user clicked in order to fetch operations for a specific bank account',
        imported_instance: 'the user sent a file to import a kresus instance',
        merged_operations: 'the user clicked in order to merge two operations',
        selected_account: 'the user clicked to change the selected account, or a callback forced selection of an account',
        selected_bank: 'the user clicked to change the selected bank, or a callback forced selection of a bank',
        updated_category: 'the user submitted a category update form',
        updated_category_of_operation: 'the user changed the category of an operation in the select list',
        updated_type_of_operation: 'the user changed the type of an operation in the select list',
        updated_weboob: 'the user asked to update weboob'
    },
    // Events emitted in an event loop: xhr callback, setTimeout/setInterval etc.
    server: {
        deleted_category: 'a category has just been deleted on the server',
        saved_bank: 'a bank access was saved (created or updated) on the server.',
        saved_category: 'a category was saved (created or updated) on the server.',
        after_sync: 'new operations / accounts were fetched on the server.'
    },
};

export let State = {
    banks: 'banks state changed',
    accounts: 'accounts state changed',
    operations: 'operations state changed',
    categories: 'categories state changed',
    weboob: 'weboob state changed',
    sync: 'sync state changed'
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
            operation,
            categoryId: catId
        });
    },

    FetchOperations() {
        flux.dispatch({
            type: Events.user.fetched_operations
        });
    },

    FetchAccounts(bank, account) {
        assert(bank instanceof Bank, 'FetchAccounts expects a Bank instance as the first arg');
        assert(account instanceof Account, 'FetchAccounts expects an Account instance as the second arg');
        flux.dispatch({
            type: Events.user.fetched_accounts,
            bankId: bank.id,
            accountId: account.id,
            accessId: account.bankAccess
        });
    },

    SetOperationType(operation, typeId) {
        assert(operation instanceof Operation, 'SetOperationType expects an Operation as the first argument');
        assert(typeof typeId === 'string', 'SetOperationType expects a String operationtype id as the second argument');
        flux.dispatch({
            type: Events.user.updated_type_of_operation,
            operation,
            typeId: typeId
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

    UpdateWeboob(action) {
        has(action, 'which');
        flux.dispatch({
            type: Events.user.updated_weboob,
            which: action.which
        });
    },

    UpdateAccess(account, password) {
        assert(account instanceof Account, 'first param must be an account');
        assert(typeof password === 'string', 'second param must be the password');
        flux.dispatch({
            type: Events.user.changed_password,
            accessId: account.bankAccess,
            password: password
        });
    },

    ImportInstance(action) {
        has(action, 'content');
        flux.dispatch({
            type: Events.user.imported_instance,
            content: action.content
        });
    },

    // Duplicates

    MergeOperations(toKeep, toRemove) {
        assert(toKeep instanceof Operation && toRemove instanceof Operation,
               'MergeOperation expects two Operation');
        flux.dispatch({
            type: Events.user.merged_operations,
            toKeepId: toKeep.id,
            toRemoveId: toRemove.id
        });
    }
};

flux.register(function(action) {
    switch (action.type) {

      // User events
      case Events.user.changed_password:
        has(action, 'accessId');
        has(action, 'password');
        store.changeAccessPassword(action.accessId, action.password);
        break;

      case Events.user.changed_setting:
        has(action, 'key');
        has(action, 'value');
        store.changeSetting(action.key, action.value);
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

      case Events.user.imported_instance:
        has(action, 'content');
        store.importInstance(action.content);
        break;

      case Events.user.merged_operations:
        has(action, 'toKeepId');
        has(action, 'toRemoveId');
        store.mergeOperations(action.toKeepId, action.toRemoveId);
        break;

      case Events.user.fetched_operations:
        store.fetchOperations();
        break;

      case Events.user.fetched_accounts:
        has(action, 'bankId');
        has(action, 'accessId');
        has(action, 'accountId');
        store.fetchAccounts(action.bankId, action.accountId, action.accessId);
        break;

      case Events.user.selected_account:
        has(action, 'accountId');
        assert(store.getAccount(action.accountId) !== null, 'Selected account must exist');
        data.currentAccountId = action.accountId;
        events.emit(State.accounts);
        break;

      case Events.user.selected_bank:
        has(action, 'bankId');
        let currentBank = store.getBank(action.bankId);
        assert(currentBank !== null, 'Selected bank must exist');
        data.currentBankId = currentBank.id;
        data.currentAccountId = currentBank.accounts.keys().next().value;
        events.emit(State.banks);
        break;

      case Events.user.updated_category:
        has(action, 'id');
        has(action, 'category');
        store.updateCategory(action.id, action.category);
        break;

      case Events.user.updated_category_of_operation:
        has(action, 'operation');
        has(action, 'categoryId');
        store.updateCategoryForOperation(action.operation, action.categoryId);
        break;

      case Events.user.updated_type_of_operation:
        has(action, 'operation');
        has(action, 'typeId');
        store.updateTypeForOperation(action.operation, action.typeId);
        break;

      case Events.user.updated_weboob:
        has(action, 'which');
        store.updateWeboob(action.which);
        break;

      // Server events. Most of these events should be forward events, as the
      // logic on events is handled directly in backend callbacks.
      case Events.server.saved_bank:
        // Should be pretty rare, so we can reload everything.
        store.setupKresus(function() {
            flux.dispatch({
                type: Events.forward,
                event: State.banks
            });
        });
        break;

      case Events.server.deleted_category:
        events.emit(State.categories);
        // Deleting a category will change operations affected to that category
        events.emit(State.operations);
        break;

      case Events.forward:
        has(action, 'event');
        events.emit(action.event);
        break;

      case Events.after_sync:
        events.emit(State.sync, action.maybeError);
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
           event == State.weboob ||
           event == State.sync,
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
