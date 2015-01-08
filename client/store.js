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

store.banks = [];
store.categories = [];
store.categoryLabel = {}; // maps category ids to labels

store.accounts = [];    // for a given bank
store.operations = [];  // for a given account

store.currentBank = null;
store.currentAccount = null;

store.accountOperations = {}; // account -> operations

store.getAllBanks = function() {
    $.get('banks', {withAccountOnly:true}, function (data) {
        var banks = []
        for (var i = 0; i < data.length; i++) {
            var b = new Bank(data[i]);
            banks.push(b);
        }

        flux.dispatch({
            type: Events.server.loaded_banks,
            list: banks
        });

        if (banks.length > 0) {
            flux.dispatch({
                type: Events.SELECTED_BANK_CHANGED,
                bank: banks[0]
            });
        }
    }).fail(xhrError);
}

store.loadAllAccounts = function () {
    has(this, 'currentBank');
    assert(this.currentBank instanceof Bank);

    $.get('banks/getAccounts/' + this.currentBank.id, function (data) {

        var accounts = []
        for (var i = 0; i < data.length; i++) {
            accounts.push(new Account(data[i]));
        }

        flux.dispatch({
            type: Events.server.loaded_accounts,
            accounts: accounts
        });

        if (accounts.length > 0) {
            // Force selection of first account
            flux.dispatch({
                type: Events.user.selected_account,
                account: accounts[0]
            });

            for (var i = 1; i < accounts.length; i++) {
                store.loadOperationsForImpl(accounts[i], /* propagate = */ false);
            }
        }
    }).fail(xhrError);
}

store.loadOperationsForImpl = function(account, propagate) {
    $.get('accounts/getOperations/' + account.id, function (data) {
        var operations = [];
        for (var i = 0; i < data.length; i++) {
            var o = new Operation(data[i])
            operations.push(o);
        }

        store.accountOperations[account.id] = operations;

        if (propagate) {
            flux.dispatch({
                type: Events.server.loaded_operations,
                operations: operations
            });
        }
    }).fail(xhrError);
};

store.loadOperationsFor = function(account) {
    this.loadOperationsForImpl(account, /* propagate = */ true);
}

store.fetchOperations = function() {
    assert(this.currentAccount !== null);
    $.get('accounts/retrieveOperations/' + this.currentAccount.id, function (data) {
        store.currentAccount = new Account(data);
        store.loadOperationsFor(store.currentAccount);
    }).fail(xhrError);
};

store.getCategories = function() {
    $.get('categories', function (data) {
        var categories = []
        for (var i = 0; i < data.length; i++) {
            var c = new Category(data[i]);
            categories.push(c)
        }

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

store.setCategories = function(cat) {
    this.categories = [new Category({id: '-1', title: 'None'})].concat(cat);
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

store.getOperationsOfAllAccounts = function() {
    var ops = [];
    for (var acc in this.accountOperations) {
        ops = ops.concat(this.accountOperations[acc]);
    }
    return ops;
}

flux.register(function(action) {
    switch (action.type) {

      // User events
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

      case Events.user.updated_category_of_operation:
        has(action, 'operationId');
        has(action, 'categoryId');
        store.updateCategoryForOperation(action.operationId, action.categoryId);
        break;

      // Server events
      case Events.server.deleted_operation:
        assert(typeof store.currentAccount !== 'undefined');
        store.loadOperationsFor(store.currentAccount);
        // No need to forward
        break;

      case Events.server.loaded_accounts:
        has(action, 'accounts');
        if (action.accounts.length > 0)
            assert(action.accounts[0] instanceof Account);
        store.accounts = action.accounts;
        store.emit(Events.server.loaded_accounts);
        break;

      case Events.server.loaded_banks:
        has(action, 'list');
        store.banks = action.list;
        store.emit(Events.server.loaded_banks);
        break;

      case Events.server.loaded_categories:
        has(action, 'categories');
        store.setCategories(action.categories);
        store.emit(Events.server.loaded_categories);
        break;

      case Events.server.loaded_operations:
        has(action, 'operations');
        if (action.operations.length > 0)
            assert(action.operations[0] instanceof Operation);
        store.operations = action.operations;
        store.emit(Events.server.loaded_operations);
        break;

      case Events.server.saved_category:
        store.getCategories();
        // No need to forward
        break;

      case Events.server.saved_category_of_operation:
        store.emit(Events.server.saved_category_of_operation);
        break;

      case Events.UPDATE_CATEGORY:
        has(action, 'id');
        has(action, 'category');
        store.updateCategory(action.id, action.category);
        // No need to forward
        break;

      case Events.user.selected_account:
        has(action, 'account');
        assert(action.account instanceof Account);
        store.currentAccount = action.account;
        store.loadOperationsFor(action.account);
        break;

      case Events.SELECTED_BANK_CHANGED:
        has(action, 'bank');
        assert(action.bank instanceof Bank);
        store.currentBank = action.bank;
        store.loadAllAccounts();
        store.emit(Events.SELECTED_BANK_CHANGED);
        break;

    }
});

// Subscribes callback to event, and calls the callback if there's already data.
store.subscribeMaybeGet = function(event, cb) {
    store.on(event, cb);

    switch (event) {

      case Events.server.loaded_operations:
        if (store.currentAccount && store.operations.length > 0)
            cb();
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
