// Helpers
var EE = require('events').EventEmitter;
var Helpers = require('../Helpers');
var xhrError = Helpers.xhrError;
var has = Helpers.has;
var Events = require('../Events');

var Bank = require('../Models').Bank;

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

bankListStore.getAllBanks = function() {
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

module.exports = bankListStore;
