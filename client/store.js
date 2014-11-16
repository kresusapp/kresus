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
            type: Events.BANK_LIST_LOADED,
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
            type: Events.ACCOUNTS_LOADED,
            accounts: accounts
        });

        if (accounts.length > 0) {
            flux.dispatch({
                type: Events.SELECTED_ACCOUNT_CHANGED,
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
                type: Events.OPERATIONS_LOADED,
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
            type: Events.CATEGORIES_LOADED,
            categories: categories
        });
    }).fail(xhrError);
};

store.addCategory = function(category) {
    $.post('categories', category, function (data) {
        flux.dispatch({
            type: Events.CATEGORY_SAVED
        });
    }).fail(xhrError);
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
                type: Events.OPERATION_CATEGORY_SAVED
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
                type: Events.DELETED_OPERATION
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

      case Events.ACCOUNTS_LOADED:
        has(action, 'accounts');
        if (action.accounts.length > 0)
            assert(action.accounts[0] instanceof Account);
        store.accounts = action.accounts;
        store.emit(Events.ACCOUNTS_LOADED);
        break;

      case Events.BANK_LIST_LOADED:
        has(action, 'list');
        store.banks = action.list;
        store.emit(Events.BANK_LIST_LOADED);
        break;

      case Events.CATEGORIES_LOADED:
        has(action, 'categories');
        store.setCategories(action.categories);
        store.emit(Events.CATEGORIES_LOADED);
        break;

      case Events.CATEGORY_CREATED:
        has(action, 'category');
        store.addCategory(action.category);
        // No need to forward
        break;

      case Events.CATEGORY_SAVED:
        store.getCategories();
        // No need to forward
        break;

      case Events.DELETE_OPERATION:
        has(action, 'operation');
        assert(action.operation instanceof Operation);
        store.deleteOperation(action.operation);
        // No need to forward
        break;

      case Events.DELETED_OPERATION:
        assert(typeof store.currentAccount !== 'undefined');
        store.loadOperationsFor(store.currentAccount);
        // No need to forward
        break;

      case Events.OPERATION_CATEGORY_CHANGED:
        has(action, 'operationId');
        has(action, 'categoryId');
        store.updateCategoryForOperation(action.operationId, action.categoryId);
        // No need to forward
        break;

      case Events.OPERATION_CATEGORY_SAVED:
        store.emit(Events.OPERATION_CATEGORY_SAVED);
        break;

      case Events.OPERATIONS_LOADED:
        has(action, 'operations');
        if (action.operations.length > 0)
            assert(action.operations[0] instanceof Operation);
        store.operations = action.operations;
        store.emit(Events.OPERATIONS_LOADED);
        break;

      case Events.RETRIEVE_OPERATIONS_QUERIED:
        store.fetchOperations();
        break;

      case Events.SELECTED_ACCOUNT_CHANGED:
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

module.exports = store;
