var EE = require('events').EventEmitter;
var Events = require('../Events');
var has = require('../Helpers').has;

var flux = require('../flux/dispatcher');

// Holds the current bank information
var bankStore = new EE;

bankStore.current = null;
bankStore.accounts = [];

flux.register(function(action) {
    switch (action.type) {
      case Events.SELETED_BANK_CHANGED:
        has(action, 'bank');
        bankStore.current = action.bank;
        bankStore.emit(Events.SELECTED_BANK_CHANGED);
        break;
      case Events.ACCOUNTS_LOADED:
        has(action, 'accounts');
        bankStore.accounts = action.accounts;
        bankStore.emit(Events.ACCOUNTS_LOADED);
        break;
    }
});

module.exports = bankStore;
