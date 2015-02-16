var EE = require('events').EventEmitter;
var Events = require('./Events');

var Helpers = require('./Helpers');
var assert = Helpers.assert;
var debug = Helpers.debug;
var has = Helpers.has;
var xhrError = Helpers.xhrError;

var Models = require('./Models');
var Account = Models.Account;
var Bank = Models.Bank;
var Category = Models.Category;
var Operation = Models.Operation;

var flux = require('./flux/dispatcher');

// Holds the current bank information
var store = new EE;

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
    $.get('banks', {withAccountOnly:true}, function (data) {

        var banks = {};
        for (var i = 0; i < data.length; i++) {
            var b = new Bank(data[i]);
            banks[b.id] = b;
        }

        flux.dispatch({
            type: Events.server.loaded_banks,
            bankMap: banks
        });

        if (data.length > 0) {
            // Force selection of first bank
            flux.dispatch({
                type: Events.user.selected_bank,
                bankId: data[0].id
            });
        }
    }).fail(xhrError);
}

// ACCOUNTS
// cb(bankId, accounts)
store.loadAccounts = function(bankId, cb) {
    assert(typeof cb !== 'undefined');
    $.get('banks/getAccounts/' + bankId, function (data) {

        var accounts = {};
        for (var i = 0; i < data.length; i++) {
            var acc = new Account(data[i]);
            accounts[acc.id] = acc;
        }

        var firstAccountId = data.length ? data[0].id : -1;

        cb(bankId, accounts, firstAccountId);
    }).fail(xhrError);
}

store.loadAccountsCurrentBank = function () {
    assert(this.currentBankId !== null);
    var self = this;
    this.loadAccounts(this.currentBankId, function(bankId, accounts, firstAccountId) {
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
    $.get('accounts/getOperations/' + accountId, function (data) {

        var operations = [];
        for (var i = 0; i < data.length; i++) {
            var o = new Operation(data[i])
            operations.push(o);
        }

        flux.dispatch({
            type: Events.server.loaded_operations,
            bankId: bankId,
            accountId: accountId,
            operations: operations,
            propagate: propagate
        });
    }).fail(xhrError);
};

store.loadOperationsFor = function(accountId) {
    this.loadOperationsForImpl(this.currentBankId, accountId, /* propagate = */ true);
}

store.fetchOperations = function() {
    assert(this.currentBankId !== null);
    assert(this.currentAccountId !== null);

    var bankId = this.currentBankId;
    var accountId = this.currentAccountId;

    $.get('accounts/retrieveOperations/' + accountId, function (data) {
        store.banks[bankId].accounts[accountId] = new Account(data);
        store.loadOperationsFor(accountId);
    }).fail(xhrError);
};

// CATEGORIES
store.loadCategories = function() {
    $.get('categories', function (data) {
        var categories = []
        for (var i = 0; i < data.length; i++) {
            var c = new Category(data[i]);
            categories.push(c)
        }

        // Sort categories alphabetically
        categories.sort(function(a, b) {
            return a.title.toLowerCase() > b.title.toLowerCase();
        });

        flux.dispatch({
            type: Events.server.loaded_categories,
            categories: categories
        });
    }).fail(xhrError);
};

store.addCategory = function(category) {
    $.post('categories', category, function (data) {
        flux.dispatch({
            type: Events.server.saved_category
        });
    }).fail(xhrError);
}

store.updateCategory = function(id, category) {
    $.ajax({
        url:'categories/' + id,
        type: 'PUT',
        data: category,
        success: function () {
            flux.dispatch({
                type: Events.server.saved_category
            });
        },
        error: xhrError
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
    $.ajax({
        url:'operations/' + operationId,
        type: 'PUT',
        data: {
            categoryId: categoryId
        },
        success: function () {
            flux.dispatch({
                type: Events.server.saved_category_of_operation
            });
        },
        error: xhrError
    });
}

store.deleteOperation = function(operation) {
    assert(operation instanceof Operation);
    $.ajax({
        url: 'operations/' + operation.id,
        type: 'DELETE',
        success: function() {
            flux.dispatch({
                type: Events.server.deleted_operation
            });
        },
        error: xhrError
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
        if (store.currentBankId &&
            store.currentAccountId &&
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
