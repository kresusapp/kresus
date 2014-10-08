var EE = require('events').EventEmitter;
var Events = require('./Events');

var Helpers = require('./Helpers');
var assert = Helpers.assert;
var has = Helpers.has;
var xhrError = Helpers.xhrError;

var Models = require('./Models');
var Account = Models.Account;
var Bank = Models.Bank;
var Operation = Models.Operation;

var flux = require('./flux/dispatcher');

// Holds the current bank information
var store = new EE;

store.banks = [];
store.accounts = [];    // for a given bank
store.operations = [];  // for a given account

store.currentBank = null;
store.currentAccount = null;

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
        }
    }).fail(xhrError);
}

store.loadOperationsFor = function(account) {
    $.get('accounts/getOperations/' + account.id, function (data) {
        var operations = [];
        for (var i = 0; i < data.length; i++) {
            var o = new Operation(data[i])
            o.updateLabel(o.categoryId);
            operations.push(o);
        }

        flux.dispatch({
            type: Events.OPERATIONS_LOADED,
            operations: operations
        });
    }).fail(xhrError);
};

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

      case Events.DELETED_OPERATION:
        has(action, 'account');
        assert(action.account instanceof Account);
        store.loadOperationsFor(action.account);
        break;

      case Events.OPERATIONS_LOADED:
        has(action, 'operations');
        if (action.operations.length > 0)
            assert(action.operations[0] instanceof Operation);
        store.operations = action.operations;
        store.emit(Events.OPERATIONS_LOADED);
        break;

      case Events.SELECTED_ACCOUNT_CHANGED:
        has(action, 'account');
        assert(action.account instanceof Account);
        store.currentAccount = action.account;
        store.loadOperationsFor(action.account);
        store.emit(Events.SELECTED_ACCOUNT_CHANGED);
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
