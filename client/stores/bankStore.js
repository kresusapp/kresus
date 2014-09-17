var EE = require('events').EventEmitter;
var Events = require('../Events');

var Helpers = require('../Helpers');
var assert = Helpers.assert;
var has = Helpers.has;
var xhrError = Helpers.xhrError;

var Models = require('../Models');
var Account = Models.Account;
var Bank = Models.Bank;

var flux = require('../flux/dispatcher');

// Holds the current bank information
var bankStore = new EE;

bankStore.current = null;
bankStore.accounts = [];
bankStore.selectedAccount = null;

bankStore.loadAllAccounts = function () {
    $.get('banks/getAccounts/' + this.current.id, function (data) {

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

flux.register(function(action) {
    switch (action.type) {
      case Events.SELECTED_BANK_CHANGED:
        has(action, 'bank');
        assert(action.bank instanceof Bank);

        bankStore.current = action.bank;
        bankStore.loadAllAccounts();
        bankStore.emit(Events.SELECTED_BANK_CHANGED);
        break;
      case Events.ACCOUNTS_LOADED:
        has(action, 'accounts');
        if (action.accounts.length > 0)
            assert(action.accounts[0] instanceof Account);

        bankStore.accounts = action.accounts;
        bankStore.emit(Events.ACCOUNTS_LOADED);
        break;
      case Events.SELECTED_ACCOUNT_CHANGED:
        has(action, 'account');
        assert(action.account instanceof Account);

        bankStore.selectedAccount = action.account;
        bankStore.emit(Events.SELECTED_ACCOUNT_CHANGED);
        break;
    }
});

module.exports = bankStore;
