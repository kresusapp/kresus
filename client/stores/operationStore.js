var EE = require('events').EventEmitter;
var Events = require('../Events');

var Helpers = require('../Helpers');
var assert = Helpers.assert;
var has = Helpers.has;
var xhrError = Helpers.xhrError;

var Models = require('../Models');
var Operation = Models.Operation;
var Account = Models.Account;

var bankStore = require('./bankStore');
var flux = require('../flux/dispatcher');

// Holds the current bank information
var store = new EE;

store.operations = [];

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
      case Events.OPERATIONS_LOADED:
        has(action, 'operations');
        if (action.operations.length > 0)
            assert(action.operations[0] instanceof Operation);

        store.operations = action.operations;
        store.emit(Events.OPERATIONS_LOADED);
        break;
      case Events.SELECTED_ACCOUNT_CHANGED:
      case Events.DELETED_OPERATION:
        has(bankStore, 'selectedAccount');
        assert(bankStore.selectedAccount instanceof Account);
        store.loadOperationsFor(bankStore.selectedAccount);
        break;
    }
});

module.exports = store;
