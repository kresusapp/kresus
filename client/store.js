var EE = require('events').EventEmitter;
var Events = require('./Events');

var Helpers = require('./Helpers');
var assert = Helpers.assert;
var debug = Helpers.debug;
var has = Helpers.has;

var Models = require('./Models');
var Category = Models.Category;
var Operation = Models.Operation;

var flux = require('./flux/dispatcher');

// Holds the current bank information
var store = new EE;
var backend = require('./backends/http');

store.categories = [];
store.categoryLabel = {}; // maps category ids to labels

store.currentBankId = null;
store.currentAccountId = null;

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
store.banks = {};

// TODO get default settings from the server
store.settings = require('./DefaultSettings');

/*
 * GETTERS
 **/

// [{bankId, bankName}]
store.getBanks = function() {
    has(this, 'banks');
    var banks = [];
    for (var id in this.banks) {
        var b = this.banks[id];
        banks.push({
            id: b.id,
            name: b.name
        });
    }
    return banks;
}

// [instanceof Account]
store.getCurrentBankAccounts = function() {
    assert(typeof this.currentBankId !== null);
    has(this.banks, this.currentBankId);
    has(this.banks[this.currentBankId], 'accounts');
    var accounts = [];
    for (var id in this.banks[this.currentBankId].accounts) {
        var acc = this.banks[this.currentBankId].accounts[id];
        accounts.push(acc);
    }
    return accounts;
}

// instanceof Account
store.getCurrentAccount = function() {
    assert(typeof this.currentBankId !== null);
    assert(typeof this.currentAccountId !== null);
    has(this.banks[this.currentBankId], 'accounts');
    has(this.banks[this.currentBankId].accounts, this.currentAccountId);
    return this.banks[this.currentBankId].accounts[this.currentAccountId];
}

// [instanceof Operation]
store.getCurrentOperations = function() {
    return store.getCurrentAccount().operations;
}

// [instanceof Category]
store.getCategories = function() {
    return this.categories;
}

// String
store.getSetting = function(key) {
    var dict = store.settings;
    assert(typeof dict[key] !== 'undefined', 'setting not set: ' + key);
    return dict[key];
}

/*
 * BACKEND
 **/

// BANKS
store.loadAllBanks = function() {
    backend.getBanks(function (banks, firstBankId) {
        flux.dispatch({
            type: Events.server.loaded_banks,
            bankMap: banks
        });

        if (firstBankId !== null) {
            // Force selection of first bank
            flux.dispatch({
                type: Events.user.selected_bank,
                bankId: firstBankId
            });
        }
    });
}

// ACCOUNTS
// cb(bankId, accounts)
store.loadAccountsCurrentBank = function () {
    assert(this.currentBankId !== null);
    var self = this;
    backend.getAccounts(this.currentBankId, function(bankId, accounts, firstAccountId) {
        flux.dispatch({
            type: Events.server.loaded_accounts,
            accountMap: accounts,
            bankId: self.currentBankId
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
    this.loadOperationsForImpl(this.currentBankId, accountId, /* propagate = */ true);
}

store.fetchOperations = function() {
    assert(this.currentBankId !== null);
    assert(this.currentAccountId !== null);

    var bankId = this.currentBankId;
    var accountId = this.currentAccountId;
    backend.getNewOperations(accountId, function(account) {
        store.banks[bankId].accounts[accountId] = account;
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

store.categoryToLabel = function(id) {
    assert(typeof this.categoryLabel[id] !== 'undefined',
          'categoryToLabel lookup failed for id: ' + id);
    return this.categoryLabel[id];
}

var NONE_CATEGORY = new Category({
    id: Helpers.NONE_CATEGORY_ID,
    title: Helpers.NONE_CATEGORY_TITLE
});

store.setCategories = function(cat) {
    this.categories = [NONE_CATEGORY].concat(cat);
    this.categoryLabel = {};
    for (var i = 0; i < this.categories.length; i++) {
        var c = this.categories[i];
        has(c, 'id');
        has(c, 'title');
        this.categoryLabel[c.id] = c.title;
    }
}

store.updateCategoryForOperation = function(operationId, categoryId) {
    backend.setCategoryForOperation(operationId, categoryId, function () {
        flux.dispatch({
            type: Events.server.saved_category_of_operation
        });
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
    store.settings[action.key] = action.value;
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

      case Events.user.created_category:
        has(action, 'category');
        store.addCategory(action.category);
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
        store.currentAccountId = action.accountId;
        store.loadOperationsFor(store.currentAccountId);
        break;

      case Events.user.selected_bank:
        has(action, 'bankId');
        has(store.banks, action.bankId);
        store.currentBankId = action.bankId;
        store.loadAccountsCurrentBank();
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

      // Server events
      case Events.server.deleted_operation:
        assert(typeof store.currentAccountId !== 'undefined');
        store.loadOperationsFor(store.currentAccountId);
        // No need to forward
        break;

      case Events.server.loaded_accounts:
        has(action, 'accountMap');
        has(action, 'bankId');
        store.banks[action.bankId].accounts = action.accountMap;
        store.emit(Events.server.loaded_accounts);
        break;

      case Events.server.loaded_banks:
        has(action, 'bankMap');
        store.banks = action.bankMap;
        store.emit(Events.server.loaded_banks);
        break;

      case Events.server.loaded_categories:
        has(action, 'categories');
        store.setCategories(action.categories);
        store.emit(Events.server.loaded_categories);
        break;

      case Events.server.loaded_operations:
        has(action, 'bankId');
        has(action, 'accountId');
        has(action, 'operations');
        if (action.operations.length > 0)
            assert(action.operations[0] instanceof Operation);

        store.banks[action.bankId].accounts[action.accountId].operations = action.operations;

        if (action.propagate)
            store.emit(Events.server.loaded_operations);
        break;

      case Events.server.saved_category:
        store.loadCategories();
        // No need to forward
        break;

      case Events.server.saved_category_of_operation:
        store.emit(Events.server.saved_category_of_operation);
        break;

    }
});

// Subscribes callback to event, and calls the callback if there's already data.
store.subscribeMaybeGet = function(event, cb) {
    store.on(event, cb);

    switch (event) {

      case Events.server.loaded_operations:
        if (store.currentBankId !== null &&
            store.currentAccountId !== null &&
            store.banks[store.currentBankId].accounts[store.currentAccountId].operations.length > 0) {
            cb();
        }
        break;

      case Events.server.loaded_categories:
        if (store.categories.length > 0)
            cb();
        break;

      default:
        assert(false, "default case of subscribeMaybeGet shouldn't ever be reached");
        break;
    }
};

module.exports = store;
