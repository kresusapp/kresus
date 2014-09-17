// Helpers
//
var EE = require('events').EventEmitter;
var has = require('../Helpers').has;
var Events = require('../Events');

// Global variables
var flux = require('../flux/dispatcher');

// Holds the entire bank list
var bankListStore = new EE;
bankListStore.list = null;
flux.register(function(action) {
    switch (action.type) {
      case Events.BANK_LIST_LOADED:
        has(action, 'list');
        bankListStore.list = action.list;
        bankListStore.emit(Events.BANK_LIST_LOADED);
    }
});

module.exports = bankListStore;
