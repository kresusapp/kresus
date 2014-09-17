(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/*
 * Copyright (c) 2014, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule Dispatcher
 * @typechecks
 */

"use strict";

var invariant = require('./invariant');

var _lastID = 1;
var _prefix = 'ID_';

/**
 * Dispatcher is used to broadcast payloads to registered callbacks. This is
 * different from generic pub-sub systems in two ways:
 *
 *   1) Callbacks are not subscribed to particular events. Every payload is
 *      dispatched to every registered callback.
 *   2) Callbacks can be deferred in whole or part until other callbacks have
 *      been executed.
 *
 * For example, consider this hypothetical flight destination form, which
 * selects a default city when a country is selected:
 *
 *   var flightDispatcher = new Dispatcher();
 *
 *   // Keeps track of which country is selected
 *   var CountryStore = {country: null};
 *
 *   // Keeps track of which city is selected
 *   var CityStore = {city: null};
 *
 *   // Keeps track of the base flight price of the selected city
 *   var FlightPriceStore = {price: null}
 *
 * When a user changes the selected city, we dispatch the payload:
 *
 *   flightDispatcher.dispatch({
 *     actionType: 'city-update',
 *     selectedCity: 'paris'
 *   });
 *
 * This payload is digested by `CityStore`:
 *
 *   flightDispatcher.register(function(payload) {
 *     if (payload.actionType === 'city-update') {
 *       CityStore.city = payload.selectedCity;
 *     }
 *   });
 *
 * When the user selects a country, we dispatch the payload:
 *
 *   flightDispatcher.dispatch({
 *     actionType: 'country-update',
 *     selectedCountry: 'australia'
 *   });
 *
 * This payload is digested by both stores:
 *
 *    CountryStore.dispatchToken = flightDispatcher.register(function(payload) {
 *     if (payload.actionType === 'country-update') {
 *       CountryStore.country = payload.selectedCountry;
 *     }
 *   });
 *
 * When the callback to update `CountryStore` is registered, we save a reference
 * to the returned token. Using this token with `waitFor()`, we can guarantee
 * that `CountryStore` is updated before the callback that updates `CityStore`
 * needs to query its data.
 *
 *   CityStore.dispatchToken = flightDispatcher.register(function(payload) {
 *     if (payload.actionType === 'country-update') {
 *       // `CountryStore.country` may not be updated.
 *       flightDispatcher.waitFor([CountryStore.dispatchToken]);
 *       // `CountryStore.country` is now guaranteed to be updated.
 *
 *       // Select the default city for the new country
 *       CityStore.city = getDefaultCityForCountry(CountryStore.country);
 *     }
 *   });
 *
 * The usage of `waitFor()` can be chained, for example:
 *
 *   FlightPriceStore.dispatchToken =
 *     flightDispatcher.register(function(payload) {
 *       switch (payload.actionType) {
 *         case 'country-update':
 *           flightDispatcher.waitFor([CityStore.dispatchToken]);
 *           FlightPriceStore.price =
 *             getFlightPriceStore(CountryStore.country, CityStore.city);
 *           break;
 *
 *         case 'city-update':
 *           FlightPriceStore.price =
 *             FlightPriceStore(CountryStore.country, CityStore.city);
 *           break;
 *     }
 *   });
 *
 * The `country-update` payload will be guaranteed to invoke the stores'
 * registered callbacks in order: `CountryStore`, `CityStore`, then
 * `FlightPriceStore`.
 */

  function Dispatcher() {
    this.$Dispatcher_callbacks = {};
    this.$Dispatcher_isPending = {};
    this.$Dispatcher_isHandled = {};
    this.$Dispatcher_isDispatching = false;
    this.$Dispatcher_pendingPayload = null;
  }

  /**
   * Registers a callback to be invoked with every dispatched payload. Returns
   * a token that can be used with `waitFor()`.
   *
   * @param {function} callback
   * @return {string}
   */
  Dispatcher.prototype.register=function(callback) {
    var id = _prefix + _lastID++;
    this.$Dispatcher_callbacks[id] = callback;
    return id;
  };

  /**
   * Removes a callback based on its token.
   *
   * @param {string} id
   */
  Dispatcher.prototype.unregister=function(id) {
    invariant(
      this.$Dispatcher_callbacks[id],
      'Dispatcher.unregister(...): `%s` does not map to a registered callback.',
      id
    );
    delete this.$Dispatcher_callbacks[id];
  };

  /**
   * Waits for the callbacks specified to be invoked before continuing execution
   * of the current callback. This method should only be used by a callback in
   * response to a dispatched payload.
   *
   * @param {array<string>} ids
   */
  Dispatcher.prototype.waitFor=function(ids) {
    invariant(
      this.$Dispatcher_isDispatching,
      'Dispatcher.waitFor(...): Must be invoked while dispatching.'
    );
    for (var ii = 0; ii < ids.length; ii++) {
      var id = ids[ii];
      if (this.$Dispatcher_isPending[id]) {
        invariant(
          this.$Dispatcher_isHandled[id],
          'Dispatcher.waitFor(...): Circular dependency detected while ' +
          'waiting for `%s`.',
          id
        );
        continue;
      }
      invariant(
        this.$Dispatcher_callbacks[id],
        'Dispatcher.waitFor(...): `%s` does not map to a registered callback.',
        id
      );
      this.$Dispatcher_invokeCallback(id);
    }
  };

  /**
   * Dispatches a payload to all registered callbacks.
   *
   * @param {object} payload
   */
  Dispatcher.prototype.dispatch=function(payload) {
    invariant(
      !this.$Dispatcher_isDispatching,
      'Dispatch.dispatch(...): Cannot dispatch in the middle of a dispatch.'
    );
    this.$Dispatcher_startDispatching(payload);
    try {
      for (var id in this.$Dispatcher_callbacks) {
        if (this.$Dispatcher_isPending[id]) {
          continue;
        }
        this.$Dispatcher_invokeCallback(id);
      }
    } finally {
      this.$Dispatcher_stopDispatching();
    }
  };

  /**
   * Is this Dispatcher currently dispatching.
   *
   * @return {boolean}
   */
  Dispatcher.prototype.isDispatching=function() {
    return this.$Dispatcher_isDispatching;
  };

  /**
   * Call the callback stored with the given id. Also do some internal
   * bookkeeping.
   *
   * @param {string} id
   * @internal
   */
  Dispatcher.prototype.$Dispatcher_invokeCallback=function(id) {
    this.$Dispatcher_isPending[id] = true;
    this.$Dispatcher_callbacks[id](this.$Dispatcher_pendingPayload);
    this.$Dispatcher_isHandled[id] = true;
  };

  /**
   * Set up bookkeeping needed when dispatching.
   *
   * @param {object} payload
   * @internal
   */
  Dispatcher.prototype.$Dispatcher_startDispatching=function(payload) {
    for (var id in this.$Dispatcher_callbacks) {
      this.$Dispatcher_isPending[id] = false;
      this.$Dispatcher_isHandled[id] = false;
    }
    this.$Dispatcher_pendingPayload = payload;
    this.$Dispatcher_isDispatching = true;
  };

  /**
   * Clear bookkeeping used for dispatching.
   *
   * @internal
   */
  Dispatcher.prototype.$Dispatcher_stopDispatching=function() {
    this.$Dispatcher_pendingPayload = null;
    this.$Dispatcher_isDispatching = false;
  };


module.exports = Dispatcher;

},{"./invariant":2}],2:[function(require,module,exports){
/**
 * Copyright (c) 2014, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule invariant
 */

"use strict";

/**
 * Use invariant() to assert state which your program assumes to be true.
 *
 * Provide sprintf-style format (only %s is supported) and arguments
 * to provide information about what broke and what you were
 * expecting.
 *
 * The invariant message will be stripped in production, but the invariant
 * will remain to ensure logic does not differ in production.
 */

var invariant = function(condition, format, a, b, c, d, e, f) {
  if (!condition) {
    var error;
    if (format === undefined) {
      error = new Error(
        'Minified exception occurred; use the non-minified dev environment ' +
        'for the full error message and additional helpful warnings.'
      );
    } else {
      var args = [a, b, c, d, e, f];
      var argIndex = 0;
      error = new Error(
        'Invariant Violation: ' +
        format.replace(/%s/g, function() { return args[argIndex++]; })
      );
    }

    error.framesToPop = 1; // we don't care about invariant's own frame
    throw error;
  }
};

module.exports = invariant;

},{}],3:[function(require,module,exports){
/*
 * HELPERS
 */

const DEBUG = true;
const ASSERTS = true;

var debug = exports.debug = function() {
    DEBUG && console.log.apply(console, arguments);
};

var assert = exports.assert = function(x, wat) {
    if (!x) {
        ASSERTS && alert('assertion error: ' + (wat?wat+'\n':'') + new Error().stack);
        return false;
    }
    return true;
};

var maybeHas = exports.maybeHas = function(obj, prop) {
    return obj.hasOwnProperty(prop);
}

exports.has = function has(obj, prop) {
    return assert(maybeHas(obj, prop));
}

},{}],4:[function(require,module,exports){
/** @jsx React.DOM */

var Helpers = require('./helpers');
var Dispatcher = require('./flux');

var debug = Helpers.debug;
var assert = Helpers.assert;
var maybeHas = Helpers.maybeHas;
var has = Helpers.has;

function xhrError(xhr, textStatus, err) {
    alert('xhr error: ' + textStatus + '\n' + err);
}

/*
 * MODELS
 */
function Bank(arg) {
    this.id   = has(arg, 'id')   && arg.id;
    this.name = has(arg, 'name') && arg.name;
    this.uuid = has(arg, 'uuid') && arg.uuid;
}

function Account(arg) {
    this.bank          = has(arg, 'bank') && arg.bank;
    this.bankAccess    = has(arg, 'bankAccess') && arg.bankAccess;
    this.title         = has(arg, 'title') && arg.title;
    this.accountNumber = has(arg, 'accountNumber') && arg.accountNumber;
    this.initialAmount = has(arg, 'initialAmount') && arg.initialAmount;
    this.lastChecked   = has(arg, 'lastChecked') && new Date(arg.lastChecked);
    this.id            = has(arg, 'id') && arg.id;
    this.amount        = has(arg, 'amount') && arg.amount;
}

function Operation(arg) {
    this.bankAccount = has(arg, 'bankAccount') && arg.bankAccount;
    this.title       = has(arg, 'title') && arg.title;
    this.date        = has(arg, 'date') && new Date(arg.date);
    this.amount      = has(arg, 'amount') && arg.amount;
    this.raw         = has(arg, 'raw') && arg.raw;
    this.dateImport  = (maybeHas(arg, 'dateImport') && new Date(arg.dateImport)) || 0;
    this.id          = has(arg, 'id') && arg.id;

    // Optional
    this.updateLabel(arg.categoryId || -1);
}

Operation.prototype.updateLabel = function(id) {
    this.categoryId = id;
    if (typeof CategoryMap !== 'undefined' &&
        typeof CategoryMap[id] !== 'undefined') {
        this.categoryLabel = CategoryMap[id];
    } else {
        this.categoryLabel = 'None';
    }
}

function Category(arg) {
    this.title = has(arg, 'title') && arg.title;
    this.id = has(arg, 'id') && arg.id;

    // Optional
    this.parentId = arg.parentId;
}

/*
 * React Components
 */

var CategoryItem = React.createClass({displayName: 'CategoryItem',

    render: function() {
        return (
            React.DOM.li(null, this.props.title)
        );
    }
});

var CategoryList = React.createClass({displayName: 'CategoryList',

    render: function() {
        var items = this.props.categories.map(function (cat) {
            return (
                CategoryItem({key: cat.id, title: cat.title})
            );
        });
        return (
            React.DOM.ul(null, items)
        );
    }
});

var CategoryForm = React.createClass({displayName: 'CategoryForm',

    onSubmit: function() {
        var label = this.refs.label.getDOMNode().value.trim();
        if (!label)
            return false;

        var catPod = {title: label};
        this.props.onSubmit(catPod);
        this.refs.label.getDOMNode().value = '';
    },

    render: function() {
        return (
            React.DOM.form({onSubmit: this.onSubmit}, 
                React.DOM.div({className: "row"}, 
                    React.DOM.div({className: "small-10 columns"}, 
                        React.DOM.input({type: "text", placeholder: "Label of new category", ref: "label"})
                    ), 
                    React.DOM.div({className: "small-2 columns"}, 
                        React.DOM.input({type: "submit", className: "button postfix", value: "Submit"})
                    )
                )
            )
        )
    }
});

var CategoryComponent = React.createClass({displayName: 'CategoryComponent',

    render: function() {
        return (
            React.DOM.div(null, 
                React.DOM.h1(null, "Categories"), 
                CategoryList({categories: this.props.categories}), 
                React.DOM.h3(null, "Add a category"), 
                CategoryForm({onSubmit: this.props.onCategoryFormSubmit})
            )
        );
    }
});

// Props: setCurrentBank: function(bank){}, bank: Bank
var BankListItemComponent = React.createClass({displayName: 'BankListItemComponent',

    onClick: function() {
        this.props.setCurrentBank(this.props.bank);
    },

    render: function() {
        return (
            React.DOM.li(null, React.DOM.a({onClick: this.onClick}, this.props.bank.name))
        );
    }
});

// Props: setCurrentBank: function(bank){}, banks: [Bank]
var BankListComponent = React.createClass({displayName: 'BankListComponent',

    render: function() {
        var setCurrentBank = this.props.setCurrentBank;
        var banks = this.props.banks.map(function (b) {
            return (
                BankListItemComponent({key: b.id, bank: b, setCurrentBank: setCurrentBank})
            )
        });

        return (
            React.DOM.div(null, 
                "Banks", 
                React.DOM.ul({className: "row"}, 
                    banks
                ), 
                React.DOM.hr(null)
            )
        );
    }
});

// Props: setCurrentAccount: function(account){}, account: Account
var AccountsListItem = React.createClass({displayName: 'AccountsListItem',

    onClick: function() {
        this.props.setCurrentAccount(this.props.account);
    },

    render: function() {
        return (
            React.DOM.li(null, 
                React.DOM.a({onClick: this.onClick}, this.props.account.title)
            )
        );
    }
});

// Props: setCurrentAccount: function(account) {}, accounts: [Account]
var AccountsListComponent = React.createClass({displayName: 'AccountsListComponent',

    render: function() {
        var setCurrentAccount = this.props.setCurrentAccount;
        var accounts = this.props.accounts.map(function (a) {
            return (
                AccountsListItem({key: a.id, account: a, setCurrentAccount: setCurrentAccount})
            );
        });

        return (
            React.DOM.div(null, 
                "Accounts", 
                React.DOM.ul({className: "row"}, 
                    accounts
                )
            )
        );
    }
});

var CategorySelectComponent = React.createClass({displayName: 'CategorySelectComponent',

    getInitialState: function() {
        return { editMode: false }
    },

    onChange: function(e) {
        var selected = this.refs.cat.getDOMNode().value;
        this.props.updateOperationCategory(this.props.operation, selected);
    },

    switchToEditMode: function() {
        this.setState({ editMode: true }, function() {
            this.refs.cat.getDOMNode().focus();
        });
    },
    switchToStaticMode: function() {
        this.setState({ editMode: false });
    },

    render: function() {
        var label = this.props.operation.categoryLabel;
        var selectedId = this.props.operation.categoryId;

        if (!this.state.editMode) {
            return (React.DOM.span({onClick: this.switchToEditMode}, label))
        }

        var categories = [new Category({title: 'None', id: '-1'})].concat(this.props.categories);
        var options = categories.map(function (c) {
            return (React.DOM.option({key: c.id, value: c.id}, c.title))
        });
        return (
            React.DOM.select({onChange: this.onChange, onBlur: this.switchToStaticMode, defaultValue: selectedId, ref: "cat"}, 
                options
            )
        );
    }
});

var OperationComponent = React.createClass({displayName: 'OperationComponent',

    getInitialState: function() {
        return { mouseOn: false };
    },

    onMouseEnter: function(e) {
        this.setState({ mouseOn: true })
    },
    onMouseLeave: function(e) {
        this.setState({ mouseOn: false })
    },

    render: function() {
        var op = this.props.operation;
        return (
            React.DOM.tr(null, 
                React.DOM.td(null, op.date.toString()), 
                React.DOM.td({onMouseEnter: this.onMouseEnter, onMouseLeave: this.onMouseLeave}, this.state.mouseOn ? op.raw : op.title), 
                React.DOM.td(null, op.amount), 
                React.DOM.td(null, 
                    CategorySelectComponent({operation: op, categories: this.props.categories, 
                        updateOperationCategory: this.props.updateOperationCategory})
                )
            )
        );
    }
});

var OperationsComponent = React.createClass({displayName: 'OperationsComponent',

    render: function() {
        var categories = this.props.categories;
        var updateOperationCategory = this.props.updateOperationCategory;
        var ops = this.props.operations.map(function (o) {
            return (
                OperationComponent({key: o.id, operation: o, categories: categories, updateOperationCategory: updateOperationCategory})
            );
        });

        return (
            React.DOM.div(null, 
                React.DOM.h1(null, "Operations"), 
                React.DOM.table(null, 
                    React.DOM.thead(null, 
                        React.DOM.tr(null, 
                            React.DOM.th(null, "Date"), 
                            React.DOM.th(null, "Title"), 
                            React.DOM.th(null, "Amount"), 
                            React.DOM.th(null, "Category")
                        )
                    ), 
                    React.DOM.tbody(null, 
                        ops
                    )
                )
            )
        );
    }
});

var SimilarityItemComponent = React.createClass({displayName: 'SimilarityItemComponent',

    deleteOperation: function() {
        this.props.deleteOperation(this.props.op);
    },

    render: function() {
        return (
            React.DOM.tr(null, 
                React.DOM.td(null, this.props.op.date.toString()), 
                React.DOM.td(null, this.props.op.title), 
                React.DOM.td(null, this.props.op.amount), 
                React.DOM.td(null, React.DOM.a({onClick: this.deleteOperation}, "x"))
            )
        );
    }
});

var SimilarityPairComponent = React.createClass({displayName: 'SimilarityPairComponent',

    render: function() {
        return (
            React.DOM.table(null, 
                SimilarityItemComponent({op: this.props.a, deleteOperation: this.props.deleteOperation}), 
                SimilarityItemComponent({op: this.props.b, deleteOperation: this.props.deleteOperation})
            )
        );
    }
});

// Props: pairs: [[Operation, Operation]], deleteOperation: function(Operation){}
var SimilarityComponent = React.createClass({displayName: 'SimilarityComponent',

    render: function() {
        var pairs = this.props.pairs;
        if (pairs.length === 0) {
            return (
                React.DOM.div(null, "No similar operations found.")
            )
        }

        var deleteOperation = this.props.deleteOperation;
        var sim = pairs.map(function (p) {
            var key = p[0].id.toString() + p[1].id.toString();
            return (SimilarityPairComponent({key: key, a: p[0], b: p[1], deleteOperation: deleteOperation}))
        });
        return (
            React.DOM.div(null, 
                React.DOM.h1(null, "Similarities"), 
                React.DOM.div(null, 
                    sim
                )
            ))
    }
});

// Props: operations, categories
var ChartComponent = React.createClass({displayName: 'ChartComponent',

    _onChange: function() {
        var val = this.refs.select.getDOMNode().value;
        if (val === 'all') {
            CreateChartAllByCategoryByMonth(this.props.operations);
            return;
        }

        var c = CategoryMap[val];
        CreateChartByCategoryByMonth(val, this.props.operations);
    },

    render: function() {
        var categoryOptions = this.props.categories.map(function (c) {
            return (React.DOM.option({key: c.id, value: c.id}, c.title));
        });

        return (
        React.DOM.div(null, 
            React.DOM.h1(null, "Charts"), 
            React.DOM.select({onChange: this._onChange, defaultValue: "all", ref: "select"}, 
                React.DOM.option({value: "all"}, "All"), 
                categoryOptions
            ), 
            React.DOM.div({id: "chart"})
        )
        );
    }
});

var CategoryMap = {};

var Kresus = React.createClass({displayName: 'Kresus',

    getInitialState: function() {
        return {
            // All banks
            banks: [],
            categories: [],
            // Current bank
            currentBank: null,
            accounts: [],
            // Current account
            currentAccount: null,
            operations: [],
            redundantPairs: []
        }
    },

    loadOperations: function() {
        if (!this.state.currentAccount)
            return;

        var that = this;
        var account = this.state.currentAccount;
        $.get('accounts/getOperations/' + account.id, function (data) {
            var operations = [];
            for (var i = 0; i < data.length; i++) {
                var o = new Operation(data[i])
                o.updateLabel(o.categoryId);
                operations.push(o);
            }

            var redundantPairs = findRedundantAlgorithm(operations);
            that.setState({
                operations: operations,
                redundantPairs: redundantPairs
            });

            // Not racy: only uses formal arguments, no state.
            //CreateChartAllOperations(account, operations);
            CreateChartAllByCategoryByMonth(operations);
        }).fail(xhrError);
    },

    setCurrentAccount: function(account) {
        if (!account) {
            debug('setCurrentAccount: no parameter');
            return;
        }

        assert(account instanceof Account);
        if (this.state.currentAccount && account.id === this.state.currentAccount.id)
            return;

        this.setState({
            currentAccount: account || null
        }, this.loadOperations)
    },

    loadAccounts: function() {
        var that = this;
        if (!this.state.currentBank)
            return;

        $.get('banks/getAccounts/' + this.state.currentBank.id, function (data) {
            var accounts = []
            for (var i = 0; i < data.length; i++) {
                accounts.push(new Account(data[i]));
            }

            that.setState({
                accounts: accounts,
            }, function() {
                that.setCurrentAccount(accounts[0] || null);
            });
        }).fail(xhrError);
    },

    setCurrentBank: function(bank) {
        if (!bank)
            return;

        assert(bank instanceof Bank);
        if (this.state.currentBank && bank.id === this.state.currentBank.id)
            return;

        this.setState({
            currentBank: bank
        }, this.loadAccounts);
    },

    deleteOperation: function(operation) {
        if (!operation)
            return;
        assert(operation instanceof Operation);

        var that = this;
        $.ajax({
            url: 'operations/' + operation.id,
            type: 'DELETE',
            success: that.loadOperations,
            error: xhrError
        });
    },

    loadCategories: function(cb) {
        var that = this;
        $.get('categories', function (data) {
            var categories = []
            for (var i = 0; i < data.length; i++) {
                var c = new Category(data[i]);
                CategoryMap[c.id] = c.title;
                categories.push(c)
            }
            that.setState({categories: categories}, cb);
        });
    },

    addCategory: function(newcat) {
        // Do the request
        var that = this;
        $.post('categories', newcat, function (data) {
            that.loadCategories();
        }).fail(xhrError);
    },

    updateOperationCategory: function(op, catId) {
        assert(op instanceof Operation);
        var data = {
            categoryId: catId
        }

        $.ajax({
            url:'operations/' + op.id,
            type: 'PUT',
            data: data,
            success: function () {
                op.updateLabel(catId)
            },
            error: xhrError
        });
    },

    componentDidMount: function() {
        var that = this;
        $.get('banks', {withAccountOnly:true}, function (data) {
            var banks = []
            for (var i = 0; i < data.length; i++) {
                var b = new Bank(data[i]);
                banks.push(b);
            }

            that.setState({
                banks: banks,
            }, function() {
                that.loadCategories(function() {
                    that.setCurrentBank(banks[0] || null);
                });
            });
        }).fail(xhrError);
    },

    render: function() {
        return (
            React.DOM.div({className: "row"}, 

            React.DOM.div({className: "panel small-2 columns"}, 
                BankListComponent({
                    banks: this.state.banks, 
                    setCurrentBank: this.setCurrentBank}
                ), 
                AccountsListComponent({
                    accounts: this.state.accounts, 
                    setCurrentAccount: this.setCurrentAccount}
                )
            ), 

            React.DOM.div({className: "small-10 columns"}, 
                React.DOM.ul({className: "tabs", 'data-tab': true}, 
                    React.DOM.li({className: "tab-title active"}, React.DOM.a({href: "#panel-operations"}, "Operations")), 
                    React.DOM.li({className: "tab-title"}, React.DOM.a({href: "#panel-charts"}, "Charts")), 
                    React.DOM.li({className: "tab-title"}, React.DOM.a({href: "#panel-similarities"}, "Similarities")), 
                    React.DOM.li({className: "tab-title"}, React.DOM.a({href: "#panel-categories"}, "Categories"))
                ), 

                React.DOM.div({className: "tabs-content"}, 

                    React.DOM.div({className: "content active", id: "panel-operations"}, 
                        OperationsComponent({
                            operations: this.state.operations, 
                            categories: this.state.categories, 
                            updateOperationCategory: this.updateOperationCategory}
                        )
                    ), 

                    React.DOM.div({className: "content", id: "panel-similarities"}, 
                        SimilarityComponent({
                            pairs: this.state.redundantPairs, 
                            deleteOperation: this.deleteOperation}
                        )
                    ), 

                    React.DOM.div({className: "content", id: "panel-charts"}, 
                        ChartComponent({
                            account: this.state.currentAccount, 
                            operations: this.state.operations, 
                            categories: this.state.categories}
                        )
                    ), 

                    React.DOM.div({className: "content", id: "panel-categories"}, 
                        CategoryComponent({
                            categories: this.state.categories, 
                            onCategoryFormSubmit: this.addCategory}
                        )
                    )

                )
            )

            )
        );
    }
});

var S = document.querySelector.bind(document);
React.renderComponent(Kresus(null), S('#main'));

/*
 * ALGORITHMS
 */
const TIME_SIMILAR_THRESHOLD = 1000 * 60 * 60 * 24 * 2; // 48 hours
function findRedundantAlgorithm(operations) {
    var similar = [];

    // O(n log n)
    function sortCriteria(a,b) { return a.amount - b.amount; }
    var sorted = operations.slice().sort(sortCriteria);
    for (var i = 0; i < operations.length; ++i) {
        if (i + 1 >= operations.length)
            continue;
        var op = sorted[i];
        var next = sorted[i+1];
        if (op.amount == next.amount) {
            var datediff = +op.date - +next.date;
            if (datediff <= TIME_SIMILAR_THRESHOLD)
                similar.push([op, next]);
        }
    }

    return similar;
}

/*
 * CHARTS
 */

$chart = $('#chart');

function CreateChartByCategoryByMonth(catId, operations) {
    var ops = [];
    for (var i = 0; i < operations.length; i++) {
        var op = operations[i];
        if (op.categoryId === catId)
            ops.push(op);
    }
    CreateChartAllByCategoryByMonth(ops);
}

function CreateChartAllByCategoryByMonth(operations) {
    function datekey(op) {
        var d = op.date;
        return d.getFullYear() + '-' + d.getMonth();
    }

    var map = {};
    var dateset = {};
    for (var i = 0; i < operations.length; i++) {
        var op = operations[i];
        var c = op.categoryLabel;
        map[c] = map[c] || {};

        var dk = datekey(op);
        map[c][dk] = map[c][dk] || [];
        map[c][dk].push(op.amount);
        dateset[dk] = true;
    }

    var series = [];
    for (var c in map) {
        var data = [];

        for (var dk in dateset) {
            map[c][dk] = map[c][dk] || [];
            var s = 0;
            var arr = map[c][dk];
            for (var i = 0; i < arr.length; i++)
                s += arr[i];
            data.push(s);
        }

        var serie = {
            name: c,
            data: data
        };

        series.push(serie);
    }

    var categories = [];
    for (var dk in dateset)
        categories.push(dk);

    var title = 'By category';
    var yAxisLegend = 'Amount';

    $chart.highcharts({
        chart: {
            type: 'column'
        },
        title: {
            text: title
        },
        xAxis: {
            categories: categories
        },
        yAxis: {
            title: {
                text: yAxisLegend
            }
        },
        tooltip: {
            headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
            pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
            '<td style="padding:0"><b>{point.y:.1f} eur</b></td></tr>',
            footerFormat: '</table>',
            shared: true,
            useHTML: true
        },
        plotOptions: {
            column: {
                pointPadding: 0.2,
                borderWidth: 0
            }
        },
        series: series
    });
}

// TODO unused right now
function CreateChartAllOperations(account, operations) {
    createChart(account.initialAmount, operations.slice(), account.title);
}

function CreateChartByCategory(catId, catLabel, operations) {
    var ops = operations.slice().filter(function(x) {
        return x.categoryId == catId;
    });

    createChart(0, ops, catLabel);
}

function createChart(initialAmount, operations, title) {
    if (operations.length === 0)
        return;

    var ops = operations.sort(function (a,b) { return +a.date - +b.date });
    var cumulativeAmount = initialAmount;
    // Must contain array pairs [+date, value]
    var positive = (initialAmount > 0) ? initialAmount : 0;
    var negative = (initialAmount < 0) ? -initialAmount : 0;
    var balance = initialAmount;

    var posd = [];
    var negd = [];
    var bald = [];

    var opmap = {};
    var posmap = {};
    var negmap = {};

    ops.map(function(o) {
        // Convert date into a number: it's going to be converted into a string
        // when used as a key.
        var a = o.amount;
        var d = +o.date;
        opmap[d] = opmap[d] || 0;
        opmap[d] += a;

        if (a < 0) {
            negmap[d] = negmap[d] || 0;
            negmap[d] += -a;
        } else if (a > 0) {
            posmap[d] = posmap[d] || 0;
            posmap[d] += a;
        }
    })

    for (var date in opmap) {
        // date is a string now: convert it back to a number for highcharts.
        balance += opmap[date];
        bald.push([+date, balance]);

        if (posmap[date]) {
            positive += posmap[date];
        }
        if (negmap[date]) {
            negative += negmap[date];
        }
        posd.push([+date, positive]);
        negd.push([+date, negative]);
    }

    // Create the chart
    $chart.highcharts('StockChart', {
        rangeSelector : {
            selected : 1,
            inputEnabled: $chart.width() > 480
        },

        title : {
            text : title
        },

        series : [{
            name : 'Balance',
            data : bald,
            tooltip: { valueDecimals: 2 }
        }, {
            name: 'Credit',
            data: posd,
            tooltip: { valueDecimals: 2 }
        }, {
            name: 'Debit',
            data: negd,
            tooltip: { valueDecimals: 2 }
        }]
    });
}


},{"./flux":1,"./helpers":3}]},{},[4])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2Jlbi9jb2RlL2NvenkvZGV2L2tyZXN1cy9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwiL2hvbWUvYmVuL2NvZGUvY296eS9kZXYva3Jlc3VzL2NsaWVudC9mbHV4L2luZGV4LmpzIiwiL2hvbWUvYmVuL2NvZGUvY296eS9kZXYva3Jlc3VzL2NsaWVudC9mbHV4L2ludmFyaWFudC5qcyIsIi9ob21lL2Jlbi9jb2RlL2NvenkvZGV2L2tyZXN1cy9jbGllbnQvaGVscGVycy5qcyIsIi9ob21lL2Jlbi9jb2RlL2NvenkvZGV2L2tyZXN1cy9jbGllbnQvbWFpbi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMVBBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dGhyb3cgbmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKX12YXIgZj1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwoZi5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxmLGYuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiLypcbiAqIENvcHlyaWdodCAoYykgMjAxNCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgQlNELXN0eWxlIGxpY2Vuc2UgZm91bmQgaW4gdGhlXG4gKiBMSUNFTlNFIGZpbGUgaW4gdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuIEFuIGFkZGl0aW9uYWwgZ3JhbnRcbiAqIG9mIHBhdGVudCByaWdodHMgY2FuIGJlIGZvdW5kIGluIHRoZSBQQVRFTlRTIGZpbGUgaW4gdGhlIHNhbWUgZGlyZWN0b3J5LlxuICpcbiAqIEBwcm92aWRlc01vZHVsZSBEaXNwYXRjaGVyXG4gKiBAdHlwZWNoZWNrc1xuICovXG5cblwidXNlIHN0cmljdFwiO1xuXG52YXIgaW52YXJpYW50ID0gcmVxdWlyZSgnLi9pbnZhcmlhbnQnKTtcblxudmFyIF9sYXN0SUQgPSAxO1xudmFyIF9wcmVmaXggPSAnSURfJztcblxuLyoqXG4gKiBEaXNwYXRjaGVyIGlzIHVzZWQgdG8gYnJvYWRjYXN0IHBheWxvYWRzIHRvIHJlZ2lzdGVyZWQgY2FsbGJhY2tzLiBUaGlzIGlzXG4gKiBkaWZmZXJlbnQgZnJvbSBnZW5lcmljIHB1Yi1zdWIgc3lzdGVtcyBpbiB0d28gd2F5czpcbiAqXG4gKiAgIDEpIENhbGxiYWNrcyBhcmUgbm90IHN1YnNjcmliZWQgdG8gcGFydGljdWxhciBldmVudHMuIEV2ZXJ5IHBheWxvYWQgaXNcbiAqICAgICAgZGlzcGF0Y2hlZCB0byBldmVyeSByZWdpc3RlcmVkIGNhbGxiYWNrLlxuICogICAyKSBDYWxsYmFja3MgY2FuIGJlIGRlZmVycmVkIGluIHdob2xlIG9yIHBhcnQgdW50aWwgb3RoZXIgY2FsbGJhY2tzIGhhdmVcbiAqICAgICAgYmVlbiBleGVjdXRlZC5cbiAqXG4gKiBGb3IgZXhhbXBsZSwgY29uc2lkZXIgdGhpcyBoeXBvdGhldGljYWwgZmxpZ2h0IGRlc3RpbmF0aW9uIGZvcm0sIHdoaWNoXG4gKiBzZWxlY3RzIGEgZGVmYXVsdCBjaXR5IHdoZW4gYSBjb3VudHJ5IGlzIHNlbGVjdGVkOlxuICpcbiAqICAgdmFyIGZsaWdodERpc3BhdGNoZXIgPSBuZXcgRGlzcGF0Y2hlcigpO1xuICpcbiAqICAgLy8gS2VlcHMgdHJhY2sgb2Ygd2hpY2ggY291bnRyeSBpcyBzZWxlY3RlZFxuICogICB2YXIgQ291bnRyeVN0b3JlID0ge2NvdW50cnk6IG51bGx9O1xuICpcbiAqICAgLy8gS2VlcHMgdHJhY2sgb2Ygd2hpY2ggY2l0eSBpcyBzZWxlY3RlZFxuICogICB2YXIgQ2l0eVN0b3JlID0ge2NpdHk6IG51bGx9O1xuICpcbiAqICAgLy8gS2VlcHMgdHJhY2sgb2YgdGhlIGJhc2UgZmxpZ2h0IHByaWNlIG9mIHRoZSBzZWxlY3RlZCBjaXR5XG4gKiAgIHZhciBGbGlnaHRQcmljZVN0b3JlID0ge3ByaWNlOiBudWxsfVxuICpcbiAqIFdoZW4gYSB1c2VyIGNoYW5nZXMgdGhlIHNlbGVjdGVkIGNpdHksIHdlIGRpc3BhdGNoIHRoZSBwYXlsb2FkOlxuICpcbiAqICAgZmxpZ2h0RGlzcGF0Y2hlci5kaXNwYXRjaCh7XG4gKiAgICAgYWN0aW9uVHlwZTogJ2NpdHktdXBkYXRlJyxcbiAqICAgICBzZWxlY3RlZENpdHk6ICdwYXJpcydcbiAqICAgfSk7XG4gKlxuICogVGhpcyBwYXlsb2FkIGlzIGRpZ2VzdGVkIGJ5IGBDaXR5U3RvcmVgOlxuICpcbiAqICAgZmxpZ2h0RGlzcGF0Y2hlci5yZWdpc3RlcihmdW5jdGlvbihwYXlsb2FkKSB7XG4gKiAgICAgaWYgKHBheWxvYWQuYWN0aW9uVHlwZSA9PT0gJ2NpdHktdXBkYXRlJykge1xuICogICAgICAgQ2l0eVN0b3JlLmNpdHkgPSBwYXlsb2FkLnNlbGVjdGVkQ2l0eTtcbiAqICAgICB9XG4gKiAgIH0pO1xuICpcbiAqIFdoZW4gdGhlIHVzZXIgc2VsZWN0cyBhIGNvdW50cnksIHdlIGRpc3BhdGNoIHRoZSBwYXlsb2FkOlxuICpcbiAqICAgZmxpZ2h0RGlzcGF0Y2hlci5kaXNwYXRjaCh7XG4gKiAgICAgYWN0aW9uVHlwZTogJ2NvdW50cnktdXBkYXRlJyxcbiAqICAgICBzZWxlY3RlZENvdW50cnk6ICdhdXN0cmFsaWEnXG4gKiAgIH0pO1xuICpcbiAqIFRoaXMgcGF5bG9hZCBpcyBkaWdlc3RlZCBieSBib3RoIHN0b3JlczpcbiAqXG4gKiAgICBDb3VudHJ5U3RvcmUuZGlzcGF0Y2hUb2tlbiA9IGZsaWdodERpc3BhdGNoZXIucmVnaXN0ZXIoZnVuY3Rpb24ocGF5bG9hZCkge1xuICogICAgIGlmIChwYXlsb2FkLmFjdGlvblR5cGUgPT09ICdjb3VudHJ5LXVwZGF0ZScpIHtcbiAqICAgICAgIENvdW50cnlTdG9yZS5jb3VudHJ5ID0gcGF5bG9hZC5zZWxlY3RlZENvdW50cnk7XG4gKiAgICAgfVxuICogICB9KTtcbiAqXG4gKiBXaGVuIHRoZSBjYWxsYmFjayB0byB1cGRhdGUgYENvdW50cnlTdG9yZWAgaXMgcmVnaXN0ZXJlZCwgd2Ugc2F2ZSBhIHJlZmVyZW5jZVxuICogdG8gdGhlIHJldHVybmVkIHRva2VuLiBVc2luZyB0aGlzIHRva2VuIHdpdGggYHdhaXRGb3IoKWAsIHdlIGNhbiBndWFyYW50ZWVcbiAqIHRoYXQgYENvdW50cnlTdG9yZWAgaXMgdXBkYXRlZCBiZWZvcmUgdGhlIGNhbGxiYWNrIHRoYXQgdXBkYXRlcyBgQ2l0eVN0b3JlYFxuICogbmVlZHMgdG8gcXVlcnkgaXRzIGRhdGEuXG4gKlxuICogICBDaXR5U3RvcmUuZGlzcGF0Y2hUb2tlbiA9IGZsaWdodERpc3BhdGNoZXIucmVnaXN0ZXIoZnVuY3Rpb24ocGF5bG9hZCkge1xuICogICAgIGlmIChwYXlsb2FkLmFjdGlvblR5cGUgPT09ICdjb3VudHJ5LXVwZGF0ZScpIHtcbiAqICAgICAgIC8vIGBDb3VudHJ5U3RvcmUuY291bnRyeWAgbWF5IG5vdCBiZSB1cGRhdGVkLlxuICogICAgICAgZmxpZ2h0RGlzcGF0Y2hlci53YWl0Rm9yKFtDb3VudHJ5U3RvcmUuZGlzcGF0Y2hUb2tlbl0pO1xuICogICAgICAgLy8gYENvdW50cnlTdG9yZS5jb3VudHJ5YCBpcyBub3cgZ3VhcmFudGVlZCB0byBiZSB1cGRhdGVkLlxuICpcbiAqICAgICAgIC8vIFNlbGVjdCB0aGUgZGVmYXVsdCBjaXR5IGZvciB0aGUgbmV3IGNvdW50cnlcbiAqICAgICAgIENpdHlTdG9yZS5jaXR5ID0gZ2V0RGVmYXVsdENpdHlGb3JDb3VudHJ5KENvdW50cnlTdG9yZS5jb3VudHJ5KTtcbiAqICAgICB9XG4gKiAgIH0pO1xuICpcbiAqIFRoZSB1c2FnZSBvZiBgd2FpdEZvcigpYCBjYW4gYmUgY2hhaW5lZCwgZm9yIGV4YW1wbGU6XG4gKlxuICogICBGbGlnaHRQcmljZVN0b3JlLmRpc3BhdGNoVG9rZW4gPVxuICogICAgIGZsaWdodERpc3BhdGNoZXIucmVnaXN0ZXIoZnVuY3Rpb24ocGF5bG9hZCkge1xuICogICAgICAgc3dpdGNoIChwYXlsb2FkLmFjdGlvblR5cGUpIHtcbiAqICAgICAgICAgY2FzZSAnY291bnRyeS11cGRhdGUnOlxuICogICAgICAgICAgIGZsaWdodERpc3BhdGNoZXIud2FpdEZvcihbQ2l0eVN0b3JlLmRpc3BhdGNoVG9rZW5dKTtcbiAqICAgICAgICAgICBGbGlnaHRQcmljZVN0b3JlLnByaWNlID1cbiAqICAgICAgICAgICAgIGdldEZsaWdodFByaWNlU3RvcmUoQ291bnRyeVN0b3JlLmNvdW50cnksIENpdHlTdG9yZS5jaXR5KTtcbiAqICAgICAgICAgICBicmVhaztcbiAqXG4gKiAgICAgICAgIGNhc2UgJ2NpdHktdXBkYXRlJzpcbiAqICAgICAgICAgICBGbGlnaHRQcmljZVN0b3JlLnByaWNlID1cbiAqICAgICAgICAgICAgIEZsaWdodFByaWNlU3RvcmUoQ291bnRyeVN0b3JlLmNvdW50cnksIENpdHlTdG9yZS5jaXR5KTtcbiAqICAgICAgICAgICBicmVhaztcbiAqICAgICB9XG4gKiAgIH0pO1xuICpcbiAqIFRoZSBgY291bnRyeS11cGRhdGVgIHBheWxvYWQgd2lsbCBiZSBndWFyYW50ZWVkIHRvIGludm9rZSB0aGUgc3RvcmVzJ1xuICogcmVnaXN0ZXJlZCBjYWxsYmFja3MgaW4gb3JkZXI6IGBDb3VudHJ5U3RvcmVgLCBgQ2l0eVN0b3JlYCwgdGhlblxuICogYEZsaWdodFByaWNlU3RvcmVgLlxuICovXG5cbiAgZnVuY3Rpb24gRGlzcGF0Y2hlcigpIHtcbiAgICB0aGlzLiREaXNwYXRjaGVyX2NhbGxiYWNrcyA9IHt9O1xuICAgIHRoaXMuJERpc3BhdGNoZXJfaXNQZW5kaW5nID0ge307XG4gICAgdGhpcy4kRGlzcGF0Y2hlcl9pc0hhbmRsZWQgPSB7fTtcbiAgICB0aGlzLiREaXNwYXRjaGVyX2lzRGlzcGF0Y2hpbmcgPSBmYWxzZTtcbiAgICB0aGlzLiREaXNwYXRjaGVyX3BlbmRpbmdQYXlsb2FkID0gbnVsbDtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZWdpc3RlcnMgYSBjYWxsYmFjayB0byBiZSBpbnZva2VkIHdpdGggZXZlcnkgZGlzcGF0Y2hlZCBwYXlsb2FkLiBSZXR1cm5zXG4gICAqIGEgdG9rZW4gdGhhdCBjYW4gYmUgdXNlZCB3aXRoIGB3YWl0Rm9yKClgLlxuICAgKlxuICAgKiBAcGFyYW0ge2Z1bmN0aW9ufSBjYWxsYmFja1xuICAgKiBAcmV0dXJuIHtzdHJpbmd9XG4gICAqL1xuICBEaXNwYXRjaGVyLnByb3RvdHlwZS5yZWdpc3Rlcj1mdW5jdGlvbihjYWxsYmFjaykge1xuICAgIHZhciBpZCA9IF9wcmVmaXggKyBfbGFzdElEKys7XG4gICAgdGhpcy4kRGlzcGF0Y2hlcl9jYWxsYmFja3NbaWRdID0gY2FsbGJhY2s7XG4gICAgcmV0dXJuIGlkO1xuICB9O1xuXG4gIC8qKlxuICAgKiBSZW1vdmVzIGEgY2FsbGJhY2sgYmFzZWQgb24gaXRzIHRva2VuLlxuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gaWRcbiAgICovXG4gIERpc3BhdGNoZXIucHJvdG90eXBlLnVucmVnaXN0ZXI9ZnVuY3Rpb24oaWQpIHtcbiAgICBpbnZhcmlhbnQoXG4gICAgICB0aGlzLiREaXNwYXRjaGVyX2NhbGxiYWNrc1tpZF0sXG4gICAgICAnRGlzcGF0Y2hlci51bnJlZ2lzdGVyKC4uLik6IGAlc2AgZG9lcyBub3QgbWFwIHRvIGEgcmVnaXN0ZXJlZCBjYWxsYmFjay4nLFxuICAgICAgaWRcbiAgICApO1xuICAgIGRlbGV0ZSB0aGlzLiREaXNwYXRjaGVyX2NhbGxiYWNrc1tpZF07XG4gIH07XG5cbiAgLyoqXG4gICAqIFdhaXRzIGZvciB0aGUgY2FsbGJhY2tzIHNwZWNpZmllZCB0byBiZSBpbnZva2VkIGJlZm9yZSBjb250aW51aW5nIGV4ZWN1dGlvblxuICAgKiBvZiB0aGUgY3VycmVudCBjYWxsYmFjay4gVGhpcyBtZXRob2Qgc2hvdWxkIG9ubHkgYmUgdXNlZCBieSBhIGNhbGxiYWNrIGluXG4gICAqIHJlc3BvbnNlIHRvIGEgZGlzcGF0Y2hlZCBwYXlsb2FkLlxuICAgKlxuICAgKiBAcGFyYW0ge2FycmF5PHN0cmluZz59IGlkc1xuICAgKi9cbiAgRGlzcGF0Y2hlci5wcm90b3R5cGUud2FpdEZvcj1mdW5jdGlvbihpZHMpIHtcbiAgICBpbnZhcmlhbnQoXG4gICAgICB0aGlzLiREaXNwYXRjaGVyX2lzRGlzcGF0Y2hpbmcsXG4gICAgICAnRGlzcGF0Y2hlci53YWl0Rm9yKC4uLik6IE11c3QgYmUgaW52b2tlZCB3aGlsZSBkaXNwYXRjaGluZy4nXG4gICAgKTtcbiAgICBmb3IgKHZhciBpaSA9IDA7IGlpIDwgaWRzLmxlbmd0aDsgaWkrKykge1xuICAgICAgdmFyIGlkID0gaWRzW2lpXTtcbiAgICAgIGlmICh0aGlzLiREaXNwYXRjaGVyX2lzUGVuZGluZ1tpZF0pIHtcbiAgICAgICAgaW52YXJpYW50KFxuICAgICAgICAgIHRoaXMuJERpc3BhdGNoZXJfaXNIYW5kbGVkW2lkXSxcbiAgICAgICAgICAnRGlzcGF0Y2hlci53YWl0Rm9yKC4uLik6IENpcmN1bGFyIGRlcGVuZGVuY3kgZGV0ZWN0ZWQgd2hpbGUgJyArXG4gICAgICAgICAgJ3dhaXRpbmcgZm9yIGAlc2AuJyxcbiAgICAgICAgICBpZFxuICAgICAgICApO1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cbiAgICAgIGludmFyaWFudChcbiAgICAgICAgdGhpcy4kRGlzcGF0Y2hlcl9jYWxsYmFja3NbaWRdLFxuICAgICAgICAnRGlzcGF0Y2hlci53YWl0Rm9yKC4uLik6IGAlc2AgZG9lcyBub3QgbWFwIHRvIGEgcmVnaXN0ZXJlZCBjYWxsYmFjay4nLFxuICAgICAgICBpZFxuICAgICAgKTtcbiAgICAgIHRoaXMuJERpc3BhdGNoZXJfaW52b2tlQ2FsbGJhY2soaWQpO1xuICAgIH1cbiAgfTtcblxuICAvKipcbiAgICogRGlzcGF0Y2hlcyBhIHBheWxvYWQgdG8gYWxsIHJlZ2lzdGVyZWQgY2FsbGJhY2tzLlxuICAgKlxuICAgKiBAcGFyYW0ge29iamVjdH0gcGF5bG9hZFxuICAgKi9cbiAgRGlzcGF0Y2hlci5wcm90b3R5cGUuZGlzcGF0Y2g9ZnVuY3Rpb24ocGF5bG9hZCkge1xuICAgIGludmFyaWFudChcbiAgICAgICF0aGlzLiREaXNwYXRjaGVyX2lzRGlzcGF0Y2hpbmcsXG4gICAgICAnRGlzcGF0Y2guZGlzcGF0Y2goLi4uKTogQ2Fubm90IGRpc3BhdGNoIGluIHRoZSBtaWRkbGUgb2YgYSBkaXNwYXRjaC4nXG4gICAgKTtcbiAgICB0aGlzLiREaXNwYXRjaGVyX3N0YXJ0RGlzcGF0Y2hpbmcocGF5bG9hZCk7XG4gICAgdHJ5IHtcbiAgICAgIGZvciAodmFyIGlkIGluIHRoaXMuJERpc3BhdGNoZXJfY2FsbGJhY2tzKSB7XG4gICAgICAgIGlmICh0aGlzLiREaXNwYXRjaGVyX2lzUGVuZGluZ1tpZF0pIHtcbiAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLiREaXNwYXRjaGVyX2ludm9rZUNhbGxiYWNrKGlkKTtcbiAgICAgIH1cbiAgICB9IGZpbmFsbHkge1xuICAgICAgdGhpcy4kRGlzcGF0Y2hlcl9zdG9wRGlzcGF0Y2hpbmcoKTtcbiAgICB9XG4gIH07XG5cbiAgLyoqXG4gICAqIElzIHRoaXMgRGlzcGF0Y2hlciBjdXJyZW50bHkgZGlzcGF0Y2hpbmcuXG4gICAqXG4gICAqIEByZXR1cm4ge2Jvb2xlYW59XG4gICAqL1xuICBEaXNwYXRjaGVyLnByb3RvdHlwZS5pc0Rpc3BhdGNoaW5nPWZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLiREaXNwYXRjaGVyX2lzRGlzcGF0Y2hpbmc7XG4gIH07XG5cbiAgLyoqXG4gICAqIENhbGwgdGhlIGNhbGxiYWNrIHN0b3JlZCB3aXRoIHRoZSBnaXZlbiBpZC4gQWxzbyBkbyBzb21lIGludGVybmFsXG4gICAqIGJvb2trZWVwaW5nLlxuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gaWRcbiAgICogQGludGVybmFsXG4gICAqL1xuICBEaXNwYXRjaGVyLnByb3RvdHlwZS4kRGlzcGF0Y2hlcl9pbnZva2VDYWxsYmFjaz1mdW5jdGlvbihpZCkge1xuICAgIHRoaXMuJERpc3BhdGNoZXJfaXNQZW5kaW5nW2lkXSA9IHRydWU7XG4gICAgdGhpcy4kRGlzcGF0Y2hlcl9jYWxsYmFja3NbaWRdKHRoaXMuJERpc3BhdGNoZXJfcGVuZGluZ1BheWxvYWQpO1xuICAgIHRoaXMuJERpc3BhdGNoZXJfaXNIYW5kbGVkW2lkXSA9IHRydWU7XG4gIH07XG5cbiAgLyoqXG4gICAqIFNldCB1cCBib29ra2VlcGluZyBuZWVkZWQgd2hlbiBkaXNwYXRjaGluZy5cbiAgICpcbiAgICogQHBhcmFtIHtvYmplY3R9IHBheWxvYWRcbiAgICogQGludGVybmFsXG4gICAqL1xuICBEaXNwYXRjaGVyLnByb3RvdHlwZS4kRGlzcGF0Y2hlcl9zdGFydERpc3BhdGNoaW5nPWZ1bmN0aW9uKHBheWxvYWQpIHtcbiAgICBmb3IgKHZhciBpZCBpbiB0aGlzLiREaXNwYXRjaGVyX2NhbGxiYWNrcykge1xuICAgICAgdGhpcy4kRGlzcGF0Y2hlcl9pc1BlbmRpbmdbaWRdID0gZmFsc2U7XG4gICAgICB0aGlzLiREaXNwYXRjaGVyX2lzSGFuZGxlZFtpZF0gPSBmYWxzZTtcbiAgICB9XG4gICAgdGhpcy4kRGlzcGF0Y2hlcl9wZW5kaW5nUGF5bG9hZCA9IHBheWxvYWQ7XG4gICAgdGhpcy4kRGlzcGF0Y2hlcl9pc0Rpc3BhdGNoaW5nID0gdHJ1ZTtcbiAgfTtcblxuICAvKipcbiAgICogQ2xlYXIgYm9va2tlZXBpbmcgdXNlZCBmb3IgZGlzcGF0Y2hpbmcuXG4gICAqXG4gICAqIEBpbnRlcm5hbFxuICAgKi9cbiAgRGlzcGF0Y2hlci5wcm90b3R5cGUuJERpc3BhdGNoZXJfc3RvcERpc3BhdGNoaW5nPWZ1bmN0aW9uKCkge1xuICAgIHRoaXMuJERpc3BhdGNoZXJfcGVuZGluZ1BheWxvYWQgPSBudWxsO1xuICAgIHRoaXMuJERpc3BhdGNoZXJfaXNEaXNwYXRjaGluZyA9IGZhbHNlO1xuICB9O1xuXG5cbm1vZHVsZS5leHBvcnRzID0gRGlzcGF0Y2hlcjtcbiIsIi8qKlxuICogQ29weXJpZ2h0IChjKSAyMDE0LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBCU0Qtc3R5bGUgbGljZW5zZSBmb3VuZCBpbiB0aGVcbiAqIExJQ0VOU0UgZmlsZSBpbiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS4gQW4gYWRkaXRpb25hbCBncmFudFxuICogb2YgcGF0ZW50IHJpZ2h0cyBjYW4gYmUgZm91bmQgaW4gdGhlIFBBVEVOVFMgZmlsZSBpbiB0aGUgc2FtZSBkaXJlY3RvcnkuXG4gKlxuICogQHByb3ZpZGVzTW9kdWxlIGludmFyaWFudFxuICovXG5cblwidXNlIHN0cmljdFwiO1xuXG4vKipcbiAqIFVzZSBpbnZhcmlhbnQoKSB0byBhc3NlcnQgc3RhdGUgd2hpY2ggeW91ciBwcm9ncmFtIGFzc3VtZXMgdG8gYmUgdHJ1ZS5cbiAqXG4gKiBQcm92aWRlIHNwcmludGYtc3R5bGUgZm9ybWF0IChvbmx5ICVzIGlzIHN1cHBvcnRlZCkgYW5kIGFyZ3VtZW50c1xuICogdG8gcHJvdmlkZSBpbmZvcm1hdGlvbiBhYm91dCB3aGF0IGJyb2tlIGFuZCB3aGF0IHlvdSB3ZXJlXG4gKiBleHBlY3RpbmcuXG4gKlxuICogVGhlIGludmFyaWFudCBtZXNzYWdlIHdpbGwgYmUgc3RyaXBwZWQgaW4gcHJvZHVjdGlvbiwgYnV0IHRoZSBpbnZhcmlhbnRcbiAqIHdpbGwgcmVtYWluIHRvIGVuc3VyZSBsb2dpYyBkb2VzIG5vdCBkaWZmZXIgaW4gcHJvZHVjdGlvbi5cbiAqL1xuXG52YXIgaW52YXJpYW50ID0gZnVuY3Rpb24oY29uZGl0aW9uLCBmb3JtYXQsIGEsIGIsIGMsIGQsIGUsIGYpIHtcbiAgaWYgKCFjb25kaXRpb24pIHtcbiAgICB2YXIgZXJyb3I7XG4gICAgaWYgKGZvcm1hdCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICBlcnJvciA9IG5ldyBFcnJvcihcbiAgICAgICAgJ01pbmlmaWVkIGV4Y2VwdGlvbiBvY2N1cnJlZDsgdXNlIHRoZSBub24tbWluaWZpZWQgZGV2IGVudmlyb25tZW50ICcgK1xuICAgICAgICAnZm9yIHRoZSBmdWxsIGVycm9yIG1lc3NhZ2UgYW5kIGFkZGl0aW9uYWwgaGVscGZ1bCB3YXJuaW5ncy4nXG4gICAgICApO1xuICAgIH0gZWxzZSB7XG4gICAgICB2YXIgYXJncyA9IFthLCBiLCBjLCBkLCBlLCBmXTtcbiAgICAgIHZhciBhcmdJbmRleCA9IDA7XG4gICAgICBlcnJvciA9IG5ldyBFcnJvcihcbiAgICAgICAgJ0ludmFyaWFudCBWaW9sYXRpb246ICcgK1xuICAgICAgICBmb3JtYXQucmVwbGFjZSgvJXMvZywgZnVuY3Rpb24oKSB7IHJldHVybiBhcmdzW2FyZ0luZGV4KytdOyB9KVxuICAgICAgKTtcbiAgICB9XG5cbiAgICBlcnJvci5mcmFtZXNUb1BvcCA9IDE7IC8vIHdlIGRvbid0IGNhcmUgYWJvdXQgaW52YXJpYW50J3Mgb3duIGZyYW1lXG4gICAgdGhyb3cgZXJyb3I7XG4gIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gaW52YXJpYW50O1xuIiwiLypcbiAqIEhFTFBFUlNcbiAqL1xuXG5jb25zdCBERUJVRyA9IHRydWU7XG5jb25zdCBBU1NFUlRTID0gdHJ1ZTtcblxudmFyIGRlYnVnID0gZXhwb3J0cy5kZWJ1ZyA9IGZ1bmN0aW9uKCkge1xuICAgIERFQlVHICYmIGNvbnNvbGUubG9nLmFwcGx5KGNvbnNvbGUsIGFyZ3VtZW50cyk7XG59O1xuXG52YXIgYXNzZXJ0ID0gZXhwb3J0cy5hc3NlcnQgPSBmdW5jdGlvbih4LCB3YXQpIHtcbiAgICBpZiAoIXgpIHtcbiAgICAgICAgQVNTRVJUUyAmJiBhbGVydCgnYXNzZXJ0aW9uIGVycm9yOiAnICsgKHdhdD93YXQrJ1xcbic6JycpICsgbmV3IEVycm9yKCkuc3RhY2spO1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIHJldHVybiB0cnVlO1xufTtcblxudmFyIG1heWJlSGFzID0gZXhwb3J0cy5tYXliZUhhcyA9IGZ1bmN0aW9uKG9iaiwgcHJvcCkge1xuICAgIHJldHVybiBvYmouaGFzT3duUHJvcGVydHkocHJvcCk7XG59XG5cbmV4cG9ydHMuaGFzID0gZnVuY3Rpb24gaGFzKG9iaiwgcHJvcCkge1xuICAgIHJldHVybiBhc3NlcnQobWF5YmVIYXMob2JqLCBwcm9wKSk7XG59XG4iLCIvKiogQGpzeCBSZWFjdC5ET00gKi9cblxudmFyIEhlbHBlcnMgPSByZXF1aXJlKCcuL2hlbHBlcnMnKTtcbnZhciBEaXNwYXRjaGVyID0gcmVxdWlyZSgnLi9mbHV4Jyk7XG5cbnZhciBkZWJ1ZyA9IEhlbHBlcnMuZGVidWc7XG52YXIgYXNzZXJ0ID0gSGVscGVycy5hc3NlcnQ7XG52YXIgbWF5YmVIYXMgPSBIZWxwZXJzLm1heWJlSGFzO1xudmFyIGhhcyA9IEhlbHBlcnMuaGFzO1xuXG5mdW5jdGlvbiB4aHJFcnJvcih4aHIsIHRleHRTdGF0dXMsIGVycikge1xuICAgIGFsZXJ0KCd4aHIgZXJyb3I6ICcgKyB0ZXh0U3RhdHVzICsgJ1xcbicgKyBlcnIpO1xufVxuXG4vKlxuICogTU9ERUxTXG4gKi9cbmZ1bmN0aW9uIEJhbmsoYXJnKSB7XG4gICAgdGhpcy5pZCAgID0gaGFzKGFyZywgJ2lkJykgICAmJiBhcmcuaWQ7XG4gICAgdGhpcy5uYW1lID0gaGFzKGFyZywgJ25hbWUnKSAmJiBhcmcubmFtZTtcbiAgICB0aGlzLnV1aWQgPSBoYXMoYXJnLCAndXVpZCcpICYmIGFyZy51dWlkO1xufVxuXG5mdW5jdGlvbiBBY2NvdW50KGFyZykge1xuICAgIHRoaXMuYmFuayAgICAgICAgICA9IGhhcyhhcmcsICdiYW5rJykgJiYgYXJnLmJhbms7XG4gICAgdGhpcy5iYW5rQWNjZXNzICAgID0gaGFzKGFyZywgJ2JhbmtBY2Nlc3MnKSAmJiBhcmcuYmFua0FjY2VzcztcbiAgICB0aGlzLnRpdGxlICAgICAgICAgPSBoYXMoYXJnLCAndGl0bGUnKSAmJiBhcmcudGl0bGU7XG4gICAgdGhpcy5hY2NvdW50TnVtYmVyID0gaGFzKGFyZywgJ2FjY291bnROdW1iZXInKSAmJiBhcmcuYWNjb3VudE51bWJlcjtcbiAgICB0aGlzLmluaXRpYWxBbW91bnQgPSBoYXMoYXJnLCAnaW5pdGlhbEFtb3VudCcpICYmIGFyZy5pbml0aWFsQW1vdW50O1xuICAgIHRoaXMubGFzdENoZWNrZWQgICA9IGhhcyhhcmcsICdsYXN0Q2hlY2tlZCcpICYmIG5ldyBEYXRlKGFyZy5sYXN0Q2hlY2tlZCk7XG4gICAgdGhpcy5pZCAgICAgICAgICAgID0gaGFzKGFyZywgJ2lkJykgJiYgYXJnLmlkO1xuICAgIHRoaXMuYW1vdW50ICAgICAgICA9IGhhcyhhcmcsICdhbW91bnQnKSAmJiBhcmcuYW1vdW50O1xufVxuXG5mdW5jdGlvbiBPcGVyYXRpb24oYXJnKSB7XG4gICAgdGhpcy5iYW5rQWNjb3VudCA9IGhhcyhhcmcsICdiYW5rQWNjb3VudCcpICYmIGFyZy5iYW5rQWNjb3VudDtcbiAgICB0aGlzLnRpdGxlICAgICAgID0gaGFzKGFyZywgJ3RpdGxlJykgJiYgYXJnLnRpdGxlO1xuICAgIHRoaXMuZGF0ZSAgICAgICAgPSBoYXMoYXJnLCAnZGF0ZScpICYmIG5ldyBEYXRlKGFyZy5kYXRlKTtcbiAgICB0aGlzLmFtb3VudCAgICAgID0gaGFzKGFyZywgJ2Ftb3VudCcpICYmIGFyZy5hbW91bnQ7XG4gICAgdGhpcy5yYXcgICAgICAgICA9IGhhcyhhcmcsICdyYXcnKSAmJiBhcmcucmF3O1xuICAgIHRoaXMuZGF0ZUltcG9ydCAgPSAobWF5YmVIYXMoYXJnLCAnZGF0ZUltcG9ydCcpICYmIG5ldyBEYXRlKGFyZy5kYXRlSW1wb3J0KSkgfHwgMDtcbiAgICB0aGlzLmlkICAgICAgICAgID0gaGFzKGFyZywgJ2lkJykgJiYgYXJnLmlkO1xuXG4gICAgLy8gT3B0aW9uYWxcbiAgICB0aGlzLnVwZGF0ZUxhYmVsKGFyZy5jYXRlZ29yeUlkIHx8IC0xKTtcbn1cblxuT3BlcmF0aW9uLnByb3RvdHlwZS51cGRhdGVMYWJlbCA9IGZ1bmN0aW9uKGlkKSB7XG4gICAgdGhpcy5jYXRlZ29yeUlkID0gaWQ7XG4gICAgaWYgKHR5cGVvZiBDYXRlZ29yeU1hcCAhPT0gJ3VuZGVmaW5lZCcgJiZcbiAgICAgICAgdHlwZW9mIENhdGVnb3J5TWFwW2lkXSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgdGhpcy5jYXRlZ29yeUxhYmVsID0gQ2F0ZWdvcnlNYXBbaWRdO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuY2F0ZWdvcnlMYWJlbCA9ICdOb25lJztcbiAgICB9XG59XG5cbmZ1bmN0aW9uIENhdGVnb3J5KGFyZykge1xuICAgIHRoaXMudGl0bGUgPSBoYXMoYXJnLCAndGl0bGUnKSAmJiBhcmcudGl0bGU7XG4gICAgdGhpcy5pZCA9IGhhcyhhcmcsICdpZCcpICYmIGFyZy5pZDtcblxuICAgIC8vIE9wdGlvbmFsXG4gICAgdGhpcy5wYXJlbnRJZCA9IGFyZy5wYXJlbnRJZDtcbn1cblxuLypcbiAqIFJlYWN0IENvbXBvbmVudHNcbiAqL1xuXG52YXIgQ2F0ZWdvcnlJdGVtID0gUmVhY3QuY3JlYXRlQ2xhc3Moe2Rpc3BsYXlOYW1lOiAnQ2F0ZWdvcnlJdGVtJyxcblxuICAgIHJlbmRlcjogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICBSZWFjdC5ET00ubGkobnVsbCwgdGhpcy5wcm9wcy50aXRsZSlcbiAgICAgICAgKTtcbiAgICB9XG59KTtcblxudmFyIENhdGVnb3J5TGlzdCA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtkaXNwbGF5TmFtZTogJ0NhdGVnb3J5TGlzdCcsXG5cbiAgICByZW5kZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgaXRlbXMgPSB0aGlzLnByb3BzLmNhdGVnb3JpZXMubWFwKGZ1bmN0aW9uIChjYXQpIHtcbiAgICAgICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICAgICAgQ2F0ZWdvcnlJdGVtKHtrZXk6IGNhdC5pZCwgdGl0bGU6IGNhdC50aXRsZX0pXG4gICAgICAgICAgICApO1xuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIFJlYWN0LkRPTS51bChudWxsLCBpdGVtcylcbiAgICAgICAgKTtcbiAgICB9XG59KTtcblxudmFyIENhdGVnb3J5Rm9ybSA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtkaXNwbGF5TmFtZTogJ0NhdGVnb3J5Rm9ybScsXG5cbiAgICBvblN1Ym1pdDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBsYWJlbCA9IHRoaXMucmVmcy5sYWJlbC5nZXRET01Ob2RlKCkudmFsdWUudHJpbSgpO1xuICAgICAgICBpZiAoIWxhYmVsKVxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuXG4gICAgICAgIHZhciBjYXRQb2QgPSB7dGl0bGU6IGxhYmVsfTtcbiAgICAgICAgdGhpcy5wcm9wcy5vblN1Ym1pdChjYXRQb2QpO1xuICAgICAgICB0aGlzLnJlZnMubGFiZWwuZ2V0RE9NTm9kZSgpLnZhbHVlID0gJyc7XG4gICAgfSxcblxuICAgIHJlbmRlcjogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICBSZWFjdC5ET00uZm9ybSh7b25TdWJtaXQ6IHRoaXMub25TdWJtaXR9LCBcbiAgICAgICAgICAgICAgICBSZWFjdC5ET00uZGl2KHtjbGFzc05hbWU6IFwicm93XCJ9LCBcbiAgICAgICAgICAgICAgICAgICAgUmVhY3QuRE9NLmRpdih7Y2xhc3NOYW1lOiBcInNtYWxsLTEwIGNvbHVtbnNcIn0sIFxuICAgICAgICAgICAgICAgICAgICAgICAgUmVhY3QuRE9NLmlucHV0KHt0eXBlOiBcInRleHRcIiwgcGxhY2Vob2xkZXI6IFwiTGFiZWwgb2YgbmV3IGNhdGVnb3J5XCIsIHJlZjogXCJsYWJlbFwifSlcbiAgICAgICAgICAgICAgICAgICAgKSwgXG4gICAgICAgICAgICAgICAgICAgIFJlYWN0LkRPTS5kaXYoe2NsYXNzTmFtZTogXCJzbWFsbC0yIGNvbHVtbnNcIn0sIFxuICAgICAgICAgICAgICAgICAgICAgICAgUmVhY3QuRE9NLmlucHV0KHt0eXBlOiBcInN1Ym1pdFwiLCBjbGFzc05hbWU6IFwiYnV0dG9uIHBvc3RmaXhcIiwgdmFsdWU6IFwiU3VibWl0XCJ9KVxuICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgKVxuICAgICAgICApXG4gICAgfVxufSk7XG5cbnZhciBDYXRlZ29yeUNvbXBvbmVudCA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtkaXNwbGF5TmFtZTogJ0NhdGVnb3J5Q29tcG9uZW50JyxcblxuICAgIHJlbmRlcjogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICBSZWFjdC5ET00uZGl2KG51bGwsIFxuICAgICAgICAgICAgICAgIFJlYWN0LkRPTS5oMShudWxsLCBcIkNhdGVnb3JpZXNcIiksIFxuICAgICAgICAgICAgICAgIENhdGVnb3J5TGlzdCh7Y2F0ZWdvcmllczogdGhpcy5wcm9wcy5jYXRlZ29yaWVzfSksIFxuICAgICAgICAgICAgICAgIFJlYWN0LkRPTS5oMyhudWxsLCBcIkFkZCBhIGNhdGVnb3J5XCIpLCBcbiAgICAgICAgICAgICAgICBDYXRlZ29yeUZvcm0oe29uU3VibWl0OiB0aGlzLnByb3BzLm9uQ2F0ZWdvcnlGb3JtU3VibWl0fSlcbiAgICAgICAgICAgIClcbiAgICAgICAgKTtcbiAgICB9XG59KTtcblxuLy8gUHJvcHM6IHNldEN1cnJlbnRCYW5rOiBmdW5jdGlvbihiYW5rKXt9LCBiYW5rOiBCYW5rXG52YXIgQmFua0xpc3RJdGVtQ29tcG9uZW50ID0gUmVhY3QuY3JlYXRlQ2xhc3Moe2Rpc3BsYXlOYW1lOiAnQmFua0xpc3RJdGVtQ29tcG9uZW50JyxcblxuICAgIG9uQ2xpY2s6IGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLnByb3BzLnNldEN1cnJlbnRCYW5rKHRoaXMucHJvcHMuYmFuayk7XG4gICAgfSxcblxuICAgIHJlbmRlcjogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICBSZWFjdC5ET00ubGkobnVsbCwgUmVhY3QuRE9NLmEoe29uQ2xpY2s6IHRoaXMub25DbGlja30sIHRoaXMucHJvcHMuYmFuay5uYW1lKSlcbiAgICAgICAgKTtcbiAgICB9XG59KTtcblxuLy8gUHJvcHM6IHNldEN1cnJlbnRCYW5rOiBmdW5jdGlvbihiYW5rKXt9LCBiYW5rczogW0JhbmtdXG52YXIgQmFua0xpc3RDb21wb25lbnQgPSBSZWFjdC5jcmVhdGVDbGFzcyh7ZGlzcGxheU5hbWU6ICdCYW5rTGlzdENvbXBvbmVudCcsXG5cbiAgICByZW5kZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgc2V0Q3VycmVudEJhbmsgPSB0aGlzLnByb3BzLnNldEN1cnJlbnRCYW5rO1xuICAgICAgICB2YXIgYmFua3MgPSB0aGlzLnByb3BzLmJhbmtzLm1hcChmdW5jdGlvbiAoYikge1xuICAgICAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgICAgICBCYW5rTGlzdEl0ZW1Db21wb25lbnQoe2tleTogYi5pZCwgYmFuazogYiwgc2V0Q3VycmVudEJhbms6IHNldEN1cnJlbnRCYW5rfSlcbiAgICAgICAgICAgIClcbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIFJlYWN0LkRPTS5kaXYobnVsbCwgXG4gICAgICAgICAgICAgICAgXCJCYW5rc1wiLCBcbiAgICAgICAgICAgICAgICBSZWFjdC5ET00udWwoe2NsYXNzTmFtZTogXCJyb3dcIn0sIFxuICAgICAgICAgICAgICAgICAgICBiYW5rc1xuICAgICAgICAgICAgICAgICksIFxuICAgICAgICAgICAgICAgIFJlYWN0LkRPTS5ocihudWxsKVxuICAgICAgICAgICAgKVxuICAgICAgICApO1xuICAgIH1cbn0pO1xuXG4vLyBQcm9wczogc2V0Q3VycmVudEFjY291bnQ6IGZ1bmN0aW9uKGFjY291bnQpe30sIGFjY291bnQ6IEFjY291bnRcbnZhciBBY2NvdW50c0xpc3RJdGVtID0gUmVhY3QuY3JlYXRlQ2xhc3Moe2Rpc3BsYXlOYW1lOiAnQWNjb3VudHNMaXN0SXRlbScsXG5cbiAgICBvbkNsaWNrOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy5wcm9wcy5zZXRDdXJyZW50QWNjb3VudCh0aGlzLnByb3BzLmFjY291bnQpO1xuICAgIH0sXG5cbiAgICByZW5kZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgUmVhY3QuRE9NLmxpKG51bGwsIFxuICAgICAgICAgICAgICAgIFJlYWN0LkRPTS5hKHtvbkNsaWNrOiB0aGlzLm9uQ2xpY2t9LCB0aGlzLnByb3BzLmFjY291bnQudGl0bGUpXG4gICAgICAgICAgICApXG4gICAgICAgICk7XG4gICAgfVxufSk7XG5cbi8vIFByb3BzOiBzZXRDdXJyZW50QWNjb3VudDogZnVuY3Rpb24oYWNjb3VudCkge30sIGFjY291bnRzOiBbQWNjb3VudF1cbnZhciBBY2NvdW50c0xpc3RDb21wb25lbnQgPSBSZWFjdC5jcmVhdGVDbGFzcyh7ZGlzcGxheU5hbWU6ICdBY2NvdW50c0xpc3RDb21wb25lbnQnLFxuXG4gICAgcmVuZGVyOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIHNldEN1cnJlbnRBY2NvdW50ID0gdGhpcy5wcm9wcy5zZXRDdXJyZW50QWNjb3VudDtcbiAgICAgICAgdmFyIGFjY291bnRzID0gdGhpcy5wcm9wcy5hY2NvdW50cy5tYXAoZnVuY3Rpb24gKGEpIHtcbiAgICAgICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICAgICAgQWNjb3VudHNMaXN0SXRlbSh7a2V5OiBhLmlkLCBhY2NvdW50OiBhLCBzZXRDdXJyZW50QWNjb3VudDogc2V0Q3VycmVudEFjY291bnR9KVxuICAgICAgICAgICAgKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIFJlYWN0LkRPTS5kaXYobnVsbCwgXG4gICAgICAgICAgICAgICAgXCJBY2NvdW50c1wiLCBcbiAgICAgICAgICAgICAgICBSZWFjdC5ET00udWwoe2NsYXNzTmFtZTogXCJyb3dcIn0sIFxuICAgICAgICAgICAgICAgICAgICBhY2NvdW50c1xuICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgIClcbiAgICAgICAgKTtcbiAgICB9XG59KTtcblxudmFyIENhdGVnb3J5U2VsZWN0Q29tcG9uZW50ID0gUmVhY3QuY3JlYXRlQ2xhc3Moe2Rpc3BsYXlOYW1lOiAnQ2F0ZWdvcnlTZWxlY3RDb21wb25lbnQnLFxuXG4gICAgZ2V0SW5pdGlhbFN0YXRlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHsgZWRpdE1vZGU6IGZhbHNlIH1cbiAgICB9LFxuXG4gICAgb25DaGFuZ2U6IGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgdmFyIHNlbGVjdGVkID0gdGhpcy5yZWZzLmNhdC5nZXRET01Ob2RlKCkudmFsdWU7XG4gICAgICAgIHRoaXMucHJvcHMudXBkYXRlT3BlcmF0aW9uQ2F0ZWdvcnkodGhpcy5wcm9wcy5vcGVyYXRpb24sIHNlbGVjdGVkKTtcbiAgICB9LFxuXG4gICAgc3dpdGNoVG9FZGl0TW9kZTogZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoeyBlZGl0TW9kZTogdHJ1ZSB9LCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHRoaXMucmVmcy5jYXQuZ2V0RE9NTm9kZSgpLmZvY3VzKCk7XG4gICAgICAgIH0pO1xuICAgIH0sXG4gICAgc3dpdGNoVG9TdGF0aWNNb2RlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IGVkaXRNb2RlOiBmYWxzZSB9KTtcbiAgICB9LFxuXG4gICAgcmVuZGVyOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGxhYmVsID0gdGhpcy5wcm9wcy5vcGVyYXRpb24uY2F0ZWdvcnlMYWJlbDtcbiAgICAgICAgdmFyIHNlbGVjdGVkSWQgPSB0aGlzLnByb3BzLm9wZXJhdGlvbi5jYXRlZ29yeUlkO1xuXG4gICAgICAgIGlmICghdGhpcy5zdGF0ZS5lZGl0TW9kZSkge1xuICAgICAgICAgICAgcmV0dXJuIChSZWFjdC5ET00uc3Bhbih7b25DbGljazogdGhpcy5zd2l0Y2hUb0VkaXRNb2RlfSwgbGFiZWwpKVxuICAgICAgICB9XG5cbiAgICAgICAgdmFyIGNhdGVnb3JpZXMgPSBbbmV3IENhdGVnb3J5KHt0aXRsZTogJ05vbmUnLCBpZDogJy0xJ30pXS5jb25jYXQodGhpcy5wcm9wcy5jYXRlZ29yaWVzKTtcbiAgICAgICAgdmFyIG9wdGlvbnMgPSBjYXRlZ29yaWVzLm1hcChmdW5jdGlvbiAoYykge1xuICAgICAgICAgICAgcmV0dXJuIChSZWFjdC5ET00ub3B0aW9uKHtrZXk6IGMuaWQsIHZhbHVlOiBjLmlkfSwgYy50aXRsZSkpXG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgUmVhY3QuRE9NLnNlbGVjdCh7b25DaGFuZ2U6IHRoaXMub25DaGFuZ2UsIG9uQmx1cjogdGhpcy5zd2l0Y2hUb1N0YXRpY01vZGUsIGRlZmF1bHRWYWx1ZTogc2VsZWN0ZWRJZCwgcmVmOiBcImNhdFwifSwgXG4gICAgICAgICAgICAgICAgb3B0aW9uc1xuICAgICAgICAgICAgKVxuICAgICAgICApO1xuICAgIH1cbn0pO1xuXG52YXIgT3BlcmF0aW9uQ29tcG9uZW50ID0gUmVhY3QuY3JlYXRlQ2xhc3Moe2Rpc3BsYXlOYW1lOiAnT3BlcmF0aW9uQ29tcG9uZW50JyxcblxuICAgIGdldEluaXRpYWxTdGF0ZTogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB7IG1vdXNlT246IGZhbHNlIH07XG4gICAgfSxcblxuICAgIG9uTW91c2VFbnRlcjogZnVuY3Rpb24oZSkge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHsgbW91c2VPbjogdHJ1ZSB9KVxuICAgIH0sXG4gICAgb25Nb3VzZUxlYXZlOiBmdW5jdGlvbihlKSB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoeyBtb3VzZU9uOiBmYWxzZSB9KVxuICAgIH0sXG5cbiAgICByZW5kZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgb3AgPSB0aGlzLnByb3BzLm9wZXJhdGlvbjtcbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIFJlYWN0LkRPTS50cihudWxsLCBcbiAgICAgICAgICAgICAgICBSZWFjdC5ET00udGQobnVsbCwgb3AuZGF0ZS50b1N0cmluZygpKSwgXG4gICAgICAgICAgICAgICAgUmVhY3QuRE9NLnRkKHtvbk1vdXNlRW50ZXI6IHRoaXMub25Nb3VzZUVudGVyLCBvbk1vdXNlTGVhdmU6IHRoaXMub25Nb3VzZUxlYXZlfSwgdGhpcy5zdGF0ZS5tb3VzZU9uID8gb3AucmF3IDogb3AudGl0bGUpLCBcbiAgICAgICAgICAgICAgICBSZWFjdC5ET00udGQobnVsbCwgb3AuYW1vdW50KSwgXG4gICAgICAgICAgICAgICAgUmVhY3QuRE9NLnRkKG51bGwsIFxuICAgICAgICAgICAgICAgICAgICBDYXRlZ29yeVNlbGVjdENvbXBvbmVudCh7b3BlcmF0aW9uOiBvcCwgY2F0ZWdvcmllczogdGhpcy5wcm9wcy5jYXRlZ29yaWVzLCBcbiAgICAgICAgICAgICAgICAgICAgICAgIHVwZGF0ZU9wZXJhdGlvbkNhdGVnb3J5OiB0aGlzLnByb3BzLnVwZGF0ZU9wZXJhdGlvbkNhdGVnb3J5fSlcbiAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICApXG4gICAgICAgICk7XG4gICAgfVxufSk7XG5cbnZhciBPcGVyYXRpb25zQ29tcG9uZW50ID0gUmVhY3QuY3JlYXRlQ2xhc3Moe2Rpc3BsYXlOYW1lOiAnT3BlcmF0aW9uc0NvbXBvbmVudCcsXG5cbiAgICByZW5kZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgY2F0ZWdvcmllcyA9IHRoaXMucHJvcHMuY2F0ZWdvcmllcztcbiAgICAgICAgdmFyIHVwZGF0ZU9wZXJhdGlvbkNhdGVnb3J5ID0gdGhpcy5wcm9wcy51cGRhdGVPcGVyYXRpb25DYXRlZ29yeTtcbiAgICAgICAgdmFyIG9wcyA9IHRoaXMucHJvcHMub3BlcmF0aW9ucy5tYXAoZnVuY3Rpb24gKG8pIHtcbiAgICAgICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICAgICAgT3BlcmF0aW9uQ29tcG9uZW50KHtrZXk6IG8uaWQsIG9wZXJhdGlvbjogbywgY2F0ZWdvcmllczogY2F0ZWdvcmllcywgdXBkYXRlT3BlcmF0aW9uQ2F0ZWdvcnk6IHVwZGF0ZU9wZXJhdGlvbkNhdGVnb3J5fSlcbiAgICAgICAgICAgICk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICBSZWFjdC5ET00uZGl2KG51bGwsIFxuICAgICAgICAgICAgICAgIFJlYWN0LkRPTS5oMShudWxsLCBcIk9wZXJhdGlvbnNcIiksIFxuICAgICAgICAgICAgICAgIFJlYWN0LkRPTS50YWJsZShudWxsLCBcbiAgICAgICAgICAgICAgICAgICAgUmVhY3QuRE9NLnRoZWFkKG51bGwsIFxuICAgICAgICAgICAgICAgICAgICAgICAgUmVhY3QuRE9NLnRyKG51bGwsIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFJlYWN0LkRPTS50aChudWxsLCBcIkRhdGVcIiksIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFJlYWN0LkRPTS50aChudWxsLCBcIlRpdGxlXCIpLCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBSZWFjdC5ET00udGgobnVsbCwgXCJBbW91bnRcIiksIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFJlYWN0LkRPTS50aChudWxsLCBcIkNhdGVnb3J5XCIpXG4gICAgICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgICksIFxuICAgICAgICAgICAgICAgICAgICBSZWFjdC5ET00udGJvZHkobnVsbCwgXG4gICAgICAgICAgICAgICAgICAgICAgICBvcHNcbiAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgIClcbiAgICAgICAgKTtcbiAgICB9XG59KTtcblxudmFyIFNpbWlsYXJpdHlJdGVtQ29tcG9uZW50ID0gUmVhY3QuY3JlYXRlQ2xhc3Moe2Rpc3BsYXlOYW1lOiAnU2ltaWxhcml0eUl0ZW1Db21wb25lbnQnLFxuXG4gICAgZGVsZXRlT3BlcmF0aW9uOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy5wcm9wcy5kZWxldGVPcGVyYXRpb24odGhpcy5wcm9wcy5vcCk7XG4gICAgfSxcblxuICAgIHJlbmRlcjogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICBSZWFjdC5ET00udHIobnVsbCwgXG4gICAgICAgICAgICAgICAgUmVhY3QuRE9NLnRkKG51bGwsIHRoaXMucHJvcHMub3AuZGF0ZS50b1N0cmluZygpKSwgXG4gICAgICAgICAgICAgICAgUmVhY3QuRE9NLnRkKG51bGwsIHRoaXMucHJvcHMub3AudGl0bGUpLCBcbiAgICAgICAgICAgICAgICBSZWFjdC5ET00udGQobnVsbCwgdGhpcy5wcm9wcy5vcC5hbW91bnQpLCBcbiAgICAgICAgICAgICAgICBSZWFjdC5ET00udGQobnVsbCwgUmVhY3QuRE9NLmEoe29uQ2xpY2s6IHRoaXMuZGVsZXRlT3BlcmF0aW9ufSwgXCJ4XCIpKVxuICAgICAgICAgICAgKVxuICAgICAgICApO1xuICAgIH1cbn0pO1xuXG52YXIgU2ltaWxhcml0eVBhaXJDb21wb25lbnQgPSBSZWFjdC5jcmVhdGVDbGFzcyh7ZGlzcGxheU5hbWU6ICdTaW1pbGFyaXR5UGFpckNvbXBvbmVudCcsXG5cbiAgICByZW5kZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgUmVhY3QuRE9NLnRhYmxlKG51bGwsIFxuICAgICAgICAgICAgICAgIFNpbWlsYXJpdHlJdGVtQ29tcG9uZW50KHtvcDogdGhpcy5wcm9wcy5hLCBkZWxldGVPcGVyYXRpb246IHRoaXMucHJvcHMuZGVsZXRlT3BlcmF0aW9ufSksIFxuICAgICAgICAgICAgICAgIFNpbWlsYXJpdHlJdGVtQ29tcG9uZW50KHtvcDogdGhpcy5wcm9wcy5iLCBkZWxldGVPcGVyYXRpb246IHRoaXMucHJvcHMuZGVsZXRlT3BlcmF0aW9ufSlcbiAgICAgICAgICAgIClcbiAgICAgICAgKTtcbiAgICB9XG59KTtcblxuLy8gUHJvcHM6IHBhaXJzOiBbW09wZXJhdGlvbiwgT3BlcmF0aW9uXV0sIGRlbGV0ZU9wZXJhdGlvbjogZnVuY3Rpb24oT3BlcmF0aW9uKXt9XG52YXIgU2ltaWxhcml0eUNvbXBvbmVudCA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtkaXNwbGF5TmFtZTogJ1NpbWlsYXJpdHlDb21wb25lbnQnLFxuXG4gICAgcmVuZGVyOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIHBhaXJzID0gdGhpcy5wcm9wcy5wYWlycztcbiAgICAgICAgaWYgKHBhaXJzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgICAgICBSZWFjdC5ET00uZGl2KG51bGwsIFwiTm8gc2ltaWxhciBvcGVyYXRpb25zIGZvdW5kLlwiKVxuICAgICAgICAgICAgKVxuICAgICAgICB9XG5cbiAgICAgICAgdmFyIGRlbGV0ZU9wZXJhdGlvbiA9IHRoaXMucHJvcHMuZGVsZXRlT3BlcmF0aW9uO1xuICAgICAgICB2YXIgc2ltID0gcGFpcnMubWFwKGZ1bmN0aW9uIChwKSB7XG4gICAgICAgICAgICB2YXIga2V5ID0gcFswXS5pZC50b1N0cmluZygpICsgcFsxXS5pZC50b1N0cmluZygpO1xuICAgICAgICAgICAgcmV0dXJuIChTaW1pbGFyaXR5UGFpckNvbXBvbmVudCh7a2V5OiBrZXksIGE6IHBbMF0sIGI6IHBbMV0sIGRlbGV0ZU9wZXJhdGlvbjogZGVsZXRlT3BlcmF0aW9ufSkpXG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgUmVhY3QuRE9NLmRpdihudWxsLCBcbiAgICAgICAgICAgICAgICBSZWFjdC5ET00uaDEobnVsbCwgXCJTaW1pbGFyaXRpZXNcIiksIFxuICAgICAgICAgICAgICAgIFJlYWN0LkRPTS5kaXYobnVsbCwgXG4gICAgICAgICAgICAgICAgICAgIHNpbVxuICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICkpXG4gICAgfVxufSk7XG5cbi8vIFByb3BzOiBvcGVyYXRpb25zLCBjYXRlZ29yaWVzXG52YXIgQ2hhcnRDb21wb25lbnQgPSBSZWFjdC5jcmVhdGVDbGFzcyh7ZGlzcGxheU5hbWU6ICdDaGFydENvbXBvbmVudCcsXG5cbiAgICBfb25DaGFuZ2U6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgdmFsID0gdGhpcy5yZWZzLnNlbGVjdC5nZXRET01Ob2RlKCkudmFsdWU7XG4gICAgICAgIGlmICh2YWwgPT09ICdhbGwnKSB7XG4gICAgICAgICAgICBDcmVhdGVDaGFydEFsbEJ5Q2F0ZWdvcnlCeU1vbnRoKHRoaXMucHJvcHMub3BlcmF0aW9ucyk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgYyA9IENhdGVnb3J5TWFwW3ZhbF07XG4gICAgICAgIENyZWF0ZUNoYXJ0QnlDYXRlZ29yeUJ5TW9udGgodmFsLCB0aGlzLnByb3BzLm9wZXJhdGlvbnMpO1xuICAgIH0sXG5cbiAgICByZW5kZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgY2F0ZWdvcnlPcHRpb25zID0gdGhpcy5wcm9wcy5jYXRlZ29yaWVzLm1hcChmdW5jdGlvbiAoYykge1xuICAgICAgICAgICAgcmV0dXJuIChSZWFjdC5ET00ub3B0aW9uKHtrZXk6IGMuaWQsIHZhbHVlOiBjLmlkfSwgYy50aXRsZSkpO1xuICAgICAgICB9KTtcblxuICAgICAgICByZXR1cm4gKFxuICAgICAgICBSZWFjdC5ET00uZGl2KG51bGwsIFxuICAgICAgICAgICAgUmVhY3QuRE9NLmgxKG51bGwsIFwiQ2hhcnRzXCIpLCBcbiAgICAgICAgICAgIFJlYWN0LkRPTS5zZWxlY3Qoe29uQ2hhbmdlOiB0aGlzLl9vbkNoYW5nZSwgZGVmYXVsdFZhbHVlOiBcImFsbFwiLCByZWY6IFwic2VsZWN0XCJ9LCBcbiAgICAgICAgICAgICAgICBSZWFjdC5ET00ub3B0aW9uKHt2YWx1ZTogXCJhbGxcIn0sIFwiQWxsXCIpLCBcbiAgICAgICAgICAgICAgICBjYXRlZ29yeU9wdGlvbnNcbiAgICAgICAgICAgICksIFxuICAgICAgICAgICAgUmVhY3QuRE9NLmRpdih7aWQ6IFwiY2hhcnRcIn0pXG4gICAgICAgIClcbiAgICAgICAgKTtcbiAgICB9XG59KTtcblxudmFyIENhdGVnb3J5TWFwID0ge307XG5cbnZhciBLcmVzdXMgPSBSZWFjdC5jcmVhdGVDbGFzcyh7ZGlzcGxheU5hbWU6ICdLcmVzdXMnLFxuXG4gICAgZ2V0SW5pdGlhbFN0YXRlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIC8vIEFsbCBiYW5rc1xuICAgICAgICAgICAgYmFua3M6IFtdLFxuICAgICAgICAgICAgY2F0ZWdvcmllczogW10sXG4gICAgICAgICAgICAvLyBDdXJyZW50IGJhbmtcbiAgICAgICAgICAgIGN1cnJlbnRCYW5rOiBudWxsLFxuICAgICAgICAgICAgYWNjb3VudHM6IFtdLFxuICAgICAgICAgICAgLy8gQ3VycmVudCBhY2NvdW50XG4gICAgICAgICAgICBjdXJyZW50QWNjb3VudDogbnVsbCxcbiAgICAgICAgICAgIG9wZXJhdGlvbnM6IFtdLFxuICAgICAgICAgICAgcmVkdW5kYW50UGFpcnM6IFtdXG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgbG9hZE9wZXJhdGlvbnM6IGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAoIXRoaXMuc3RhdGUuY3VycmVudEFjY291bnQpXG4gICAgICAgICAgICByZXR1cm47XG5cbiAgICAgICAgdmFyIHRoYXQgPSB0aGlzO1xuICAgICAgICB2YXIgYWNjb3VudCA9IHRoaXMuc3RhdGUuY3VycmVudEFjY291bnQ7XG4gICAgICAgICQuZ2V0KCdhY2NvdW50cy9nZXRPcGVyYXRpb25zLycgKyBhY2NvdW50LmlkLCBmdW5jdGlvbiAoZGF0YSkge1xuICAgICAgICAgICAgdmFyIG9wZXJhdGlvbnMgPSBbXTtcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZGF0YS5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIHZhciBvID0gbmV3IE9wZXJhdGlvbihkYXRhW2ldKVxuICAgICAgICAgICAgICAgIG8udXBkYXRlTGFiZWwoby5jYXRlZ29yeUlkKTtcbiAgICAgICAgICAgICAgICBvcGVyYXRpb25zLnB1c2gobyk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHZhciByZWR1bmRhbnRQYWlycyA9IGZpbmRSZWR1bmRhbnRBbGdvcml0aG0ob3BlcmF0aW9ucyk7XG4gICAgICAgICAgICB0aGF0LnNldFN0YXRlKHtcbiAgICAgICAgICAgICAgICBvcGVyYXRpb25zOiBvcGVyYXRpb25zLFxuICAgICAgICAgICAgICAgIHJlZHVuZGFudFBhaXJzOiByZWR1bmRhbnRQYWlyc1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIC8vIE5vdCByYWN5OiBvbmx5IHVzZXMgZm9ybWFsIGFyZ3VtZW50cywgbm8gc3RhdGUuXG4gICAgICAgICAgICAvL0NyZWF0ZUNoYXJ0QWxsT3BlcmF0aW9ucyhhY2NvdW50LCBvcGVyYXRpb25zKTtcbiAgICAgICAgICAgIENyZWF0ZUNoYXJ0QWxsQnlDYXRlZ29yeUJ5TW9udGgob3BlcmF0aW9ucyk7XG4gICAgICAgIH0pLmZhaWwoeGhyRXJyb3IpO1xuICAgIH0sXG5cbiAgICBzZXRDdXJyZW50QWNjb3VudDogZnVuY3Rpb24oYWNjb3VudCkge1xuICAgICAgICBpZiAoIWFjY291bnQpIHtcbiAgICAgICAgICAgIGRlYnVnKCdzZXRDdXJyZW50QWNjb3VudDogbm8gcGFyYW1ldGVyJyk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBhc3NlcnQoYWNjb3VudCBpbnN0YW5jZW9mIEFjY291bnQpO1xuICAgICAgICBpZiAodGhpcy5zdGF0ZS5jdXJyZW50QWNjb3VudCAmJiBhY2NvdW50LmlkID09PSB0aGlzLnN0YXRlLmN1cnJlbnRBY2NvdW50LmlkKVxuICAgICAgICAgICAgcmV0dXJuO1xuXG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgY3VycmVudEFjY291bnQ6IGFjY291bnQgfHwgbnVsbFxuICAgICAgICB9LCB0aGlzLmxvYWRPcGVyYXRpb25zKVxuICAgIH0sXG5cbiAgICBsb2FkQWNjb3VudHM6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgdGhhdCA9IHRoaXM7XG4gICAgICAgIGlmICghdGhpcy5zdGF0ZS5jdXJyZW50QmFuaylcbiAgICAgICAgICAgIHJldHVybjtcblxuICAgICAgICAkLmdldCgnYmFua3MvZ2V0QWNjb3VudHMvJyArIHRoaXMuc3RhdGUuY3VycmVudEJhbmsuaWQsIGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgICAgICAgICB2YXIgYWNjb3VudHMgPSBbXVxuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBkYXRhLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgYWNjb3VudHMucHVzaChuZXcgQWNjb3VudChkYXRhW2ldKSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoYXQuc2V0U3RhdGUoe1xuICAgICAgICAgICAgICAgIGFjY291bnRzOiBhY2NvdW50cyxcbiAgICAgICAgICAgIH0sIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIHRoYXQuc2V0Q3VycmVudEFjY291bnQoYWNjb3VudHNbMF0gfHwgbnVsbCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSkuZmFpbCh4aHJFcnJvcik7XG4gICAgfSxcblxuICAgIHNldEN1cnJlbnRCYW5rOiBmdW5jdGlvbihiYW5rKSB7XG4gICAgICAgIGlmICghYmFuaylcbiAgICAgICAgICAgIHJldHVybjtcblxuICAgICAgICBhc3NlcnQoYmFuayBpbnN0YW5jZW9mIEJhbmspO1xuICAgICAgICBpZiAodGhpcy5zdGF0ZS5jdXJyZW50QmFuayAmJiBiYW5rLmlkID09PSB0aGlzLnN0YXRlLmN1cnJlbnRCYW5rLmlkKVxuICAgICAgICAgICAgcmV0dXJuO1xuXG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgY3VycmVudEJhbms6IGJhbmtcbiAgICAgICAgfSwgdGhpcy5sb2FkQWNjb3VudHMpO1xuICAgIH0sXG5cbiAgICBkZWxldGVPcGVyYXRpb246IGZ1bmN0aW9uKG9wZXJhdGlvbikge1xuICAgICAgICBpZiAoIW9wZXJhdGlvbilcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgYXNzZXJ0KG9wZXJhdGlvbiBpbnN0YW5jZW9mIE9wZXJhdGlvbik7XG5cbiAgICAgICAgdmFyIHRoYXQgPSB0aGlzO1xuICAgICAgICAkLmFqYXgoe1xuICAgICAgICAgICAgdXJsOiAnb3BlcmF0aW9ucy8nICsgb3BlcmF0aW9uLmlkLFxuICAgICAgICAgICAgdHlwZTogJ0RFTEVURScsXG4gICAgICAgICAgICBzdWNjZXNzOiB0aGF0LmxvYWRPcGVyYXRpb25zLFxuICAgICAgICAgICAgZXJyb3I6IHhockVycm9yXG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICBsb2FkQ2F0ZWdvcmllczogZnVuY3Rpb24oY2IpIHtcbiAgICAgICAgdmFyIHRoYXQgPSB0aGlzO1xuICAgICAgICAkLmdldCgnY2F0ZWdvcmllcycsIGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgICAgICAgICB2YXIgY2F0ZWdvcmllcyA9IFtdXG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGRhdGEubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICB2YXIgYyA9IG5ldyBDYXRlZ29yeShkYXRhW2ldKTtcbiAgICAgICAgICAgICAgICBDYXRlZ29yeU1hcFtjLmlkXSA9IGMudGl0bGU7XG4gICAgICAgICAgICAgICAgY2F0ZWdvcmllcy5wdXNoKGMpXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGF0LnNldFN0YXRlKHtjYXRlZ29yaWVzOiBjYXRlZ29yaWVzfSwgY2IpO1xuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgYWRkQ2F0ZWdvcnk6IGZ1bmN0aW9uKG5ld2NhdCkge1xuICAgICAgICAvLyBEbyB0aGUgcmVxdWVzdFxuICAgICAgICB2YXIgdGhhdCA9IHRoaXM7XG4gICAgICAgICQucG9zdCgnY2F0ZWdvcmllcycsIG5ld2NhdCwgZnVuY3Rpb24gKGRhdGEpIHtcbiAgICAgICAgICAgIHRoYXQubG9hZENhdGVnb3JpZXMoKTtcbiAgICAgICAgfSkuZmFpbCh4aHJFcnJvcik7XG4gICAgfSxcblxuICAgIHVwZGF0ZU9wZXJhdGlvbkNhdGVnb3J5OiBmdW5jdGlvbihvcCwgY2F0SWQpIHtcbiAgICAgICAgYXNzZXJ0KG9wIGluc3RhbmNlb2YgT3BlcmF0aW9uKTtcbiAgICAgICAgdmFyIGRhdGEgPSB7XG4gICAgICAgICAgICBjYXRlZ29yeUlkOiBjYXRJZFxuICAgICAgICB9XG5cbiAgICAgICAgJC5hamF4KHtcbiAgICAgICAgICAgIHVybDonb3BlcmF0aW9ucy8nICsgb3AuaWQsXG4gICAgICAgICAgICB0eXBlOiAnUFVUJyxcbiAgICAgICAgICAgIGRhdGE6IGRhdGEsXG4gICAgICAgICAgICBzdWNjZXNzOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgb3AudXBkYXRlTGFiZWwoY2F0SWQpXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZXJyb3I6IHhockVycm9yXG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICBjb21wb25lbnREaWRNb3VudDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciB0aGF0ID0gdGhpcztcbiAgICAgICAgJC5nZXQoJ2JhbmtzJywge3dpdGhBY2NvdW50T25seTp0cnVlfSwgZnVuY3Rpb24gKGRhdGEpIHtcbiAgICAgICAgICAgIHZhciBiYW5rcyA9IFtdXG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGRhdGEubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICB2YXIgYiA9IG5ldyBCYW5rKGRhdGFbaV0pO1xuICAgICAgICAgICAgICAgIGJhbmtzLnB1c2goYik7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoYXQuc2V0U3RhdGUoe1xuICAgICAgICAgICAgICAgIGJhbmtzOiBiYW5rcyxcbiAgICAgICAgICAgIH0sIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIHRoYXQubG9hZENhdGVnb3JpZXMoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoYXQuc2V0Q3VycmVudEJhbmsoYmFua3NbMF0gfHwgbnVsbCk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSkuZmFpbCh4aHJFcnJvcik7XG4gICAgfSxcblxuICAgIHJlbmRlcjogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICBSZWFjdC5ET00uZGl2KHtjbGFzc05hbWU6IFwicm93XCJ9LCBcblxuICAgICAgICAgICAgUmVhY3QuRE9NLmRpdih7Y2xhc3NOYW1lOiBcInBhbmVsIHNtYWxsLTIgY29sdW1uc1wifSwgXG4gICAgICAgICAgICAgICAgQmFua0xpc3RDb21wb25lbnQoe1xuICAgICAgICAgICAgICAgICAgICBiYW5rczogdGhpcy5zdGF0ZS5iYW5rcywgXG4gICAgICAgICAgICAgICAgICAgIHNldEN1cnJlbnRCYW5rOiB0aGlzLnNldEN1cnJlbnRCYW5rfVxuICAgICAgICAgICAgICAgICksIFxuICAgICAgICAgICAgICAgIEFjY291bnRzTGlzdENvbXBvbmVudCh7XG4gICAgICAgICAgICAgICAgICAgIGFjY291bnRzOiB0aGlzLnN0YXRlLmFjY291bnRzLCBcbiAgICAgICAgICAgICAgICAgICAgc2V0Q3VycmVudEFjY291bnQ6IHRoaXMuc2V0Q3VycmVudEFjY291bnR9XG4gICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgKSwgXG5cbiAgICAgICAgICAgIFJlYWN0LkRPTS5kaXYoe2NsYXNzTmFtZTogXCJzbWFsbC0xMCBjb2x1bW5zXCJ9LCBcbiAgICAgICAgICAgICAgICBSZWFjdC5ET00udWwoe2NsYXNzTmFtZTogXCJ0YWJzXCIsICdkYXRhLXRhYic6IHRydWV9LCBcbiAgICAgICAgICAgICAgICAgICAgUmVhY3QuRE9NLmxpKHtjbGFzc05hbWU6IFwidGFiLXRpdGxlIGFjdGl2ZVwifSwgUmVhY3QuRE9NLmEoe2hyZWY6IFwiI3BhbmVsLW9wZXJhdGlvbnNcIn0sIFwiT3BlcmF0aW9uc1wiKSksIFxuICAgICAgICAgICAgICAgICAgICBSZWFjdC5ET00ubGkoe2NsYXNzTmFtZTogXCJ0YWItdGl0bGVcIn0sIFJlYWN0LkRPTS5hKHtocmVmOiBcIiNwYW5lbC1jaGFydHNcIn0sIFwiQ2hhcnRzXCIpKSwgXG4gICAgICAgICAgICAgICAgICAgIFJlYWN0LkRPTS5saSh7Y2xhc3NOYW1lOiBcInRhYi10aXRsZVwifSwgUmVhY3QuRE9NLmEoe2hyZWY6IFwiI3BhbmVsLXNpbWlsYXJpdGllc1wifSwgXCJTaW1pbGFyaXRpZXNcIikpLCBcbiAgICAgICAgICAgICAgICAgICAgUmVhY3QuRE9NLmxpKHtjbGFzc05hbWU6IFwidGFiLXRpdGxlXCJ9LCBSZWFjdC5ET00uYSh7aHJlZjogXCIjcGFuZWwtY2F0ZWdvcmllc1wifSwgXCJDYXRlZ29yaWVzXCIpKVxuICAgICAgICAgICAgICAgICksIFxuXG4gICAgICAgICAgICAgICAgUmVhY3QuRE9NLmRpdih7Y2xhc3NOYW1lOiBcInRhYnMtY29udGVudFwifSwgXG5cbiAgICAgICAgICAgICAgICAgICAgUmVhY3QuRE9NLmRpdih7Y2xhc3NOYW1lOiBcImNvbnRlbnQgYWN0aXZlXCIsIGlkOiBcInBhbmVsLW9wZXJhdGlvbnNcIn0sIFxuICAgICAgICAgICAgICAgICAgICAgICAgT3BlcmF0aW9uc0NvbXBvbmVudCh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb3BlcmF0aW9uczogdGhpcy5zdGF0ZS5vcGVyYXRpb25zLCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXRlZ29yaWVzOiB0aGlzLnN0YXRlLmNhdGVnb3JpZXMsIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVwZGF0ZU9wZXJhdGlvbkNhdGVnb3J5OiB0aGlzLnVwZGF0ZU9wZXJhdGlvbkNhdGVnb3J5fVxuICAgICAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgICApLCBcblxuICAgICAgICAgICAgICAgICAgICBSZWFjdC5ET00uZGl2KHtjbGFzc05hbWU6IFwiY29udGVudFwiLCBpZDogXCJwYW5lbC1zaW1pbGFyaXRpZXNcIn0sIFxuICAgICAgICAgICAgICAgICAgICAgICAgU2ltaWxhcml0eUNvbXBvbmVudCh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFpcnM6IHRoaXMuc3RhdGUucmVkdW5kYW50UGFpcnMsIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlbGV0ZU9wZXJhdGlvbjogdGhpcy5kZWxldGVPcGVyYXRpb259XG4gICAgICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgICksIFxuXG4gICAgICAgICAgICAgICAgICAgIFJlYWN0LkRPTS5kaXYoe2NsYXNzTmFtZTogXCJjb250ZW50XCIsIGlkOiBcInBhbmVsLWNoYXJ0c1wifSwgXG4gICAgICAgICAgICAgICAgICAgICAgICBDaGFydENvbXBvbmVudCh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYWNjb3VudDogdGhpcy5zdGF0ZS5jdXJyZW50QWNjb3VudCwgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb3BlcmF0aW9uczogdGhpcy5zdGF0ZS5vcGVyYXRpb25zLCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXRlZ29yaWVzOiB0aGlzLnN0YXRlLmNhdGVnb3JpZXN9XG4gICAgICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgICksIFxuXG4gICAgICAgICAgICAgICAgICAgIFJlYWN0LkRPTS5kaXYoe2NsYXNzTmFtZTogXCJjb250ZW50XCIsIGlkOiBcInBhbmVsLWNhdGVnb3JpZXNcIn0sIFxuICAgICAgICAgICAgICAgICAgICAgICAgQ2F0ZWdvcnlDb21wb25lbnQoe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhdGVnb3JpZXM6IHRoaXMuc3RhdGUuY2F0ZWdvcmllcywgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb25DYXRlZ29yeUZvcm1TdWJtaXQ6IHRoaXMuYWRkQ2F0ZWdvcnl9XG4gICAgICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgIClcblxuICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgIClcblxuICAgICAgICAgICAgKVxuICAgICAgICApO1xuICAgIH1cbn0pO1xuXG52YXIgUyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IuYmluZChkb2N1bWVudCk7XG5SZWFjdC5yZW5kZXJDb21wb25lbnQoS3Jlc3VzKG51bGwpLCBTKCcjbWFpbicpKTtcblxuLypcbiAqIEFMR09SSVRITVNcbiAqL1xuY29uc3QgVElNRV9TSU1JTEFSX1RIUkVTSE9MRCA9IDEwMDAgKiA2MCAqIDYwICogMjQgKiAyOyAvLyA0OCBob3Vyc1xuZnVuY3Rpb24gZmluZFJlZHVuZGFudEFsZ29yaXRobShvcGVyYXRpb25zKSB7XG4gICAgdmFyIHNpbWlsYXIgPSBbXTtcblxuICAgIC8vIE8obiBsb2cgbilcbiAgICBmdW5jdGlvbiBzb3J0Q3JpdGVyaWEoYSxiKSB7IHJldHVybiBhLmFtb3VudCAtIGIuYW1vdW50OyB9XG4gICAgdmFyIHNvcnRlZCA9IG9wZXJhdGlvbnMuc2xpY2UoKS5zb3J0KHNvcnRDcml0ZXJpYSk7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBvcGVyYXRpb25zLmxlbmd0aDsgKytpKSB7XG4gICAgICAgIGlmIChpICsgMSA+PSBvcGVyYXRpb25zLmxlbmd0aClcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB2YXIgb3AgPSBzb3J0ZWRbaV07XG4gICAgICAgIHZhciBuZXh0ID0gc29ydGVkW2krMV07XG4gICAgICAgIGlmIChvcC5hbW91bnQgPT0gbmV4dC5hbW91bnQpIHtcbiAgICAgICAgICAgIHZhciBkYXRlZGlmZiA9ICtvcC5kYXRlIC0gK25leHQuZGF0ZTtcbiAgICAgICAgICAgIGlmIChkYXRlZGlmZiA8PSBUSU1FX1NJTUlMQVJfVEhSRVNIT0xEKVxuICAgICAgICAgICAgICAgIHNpbWlsYXIucHVzaChbb3AsIG5leHRdKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBzaW1pbGFyO1xufVxuXG4vKlxuICogQ0hBUlRTXG4gKi9cblxuJGNoYXJ0ID0gJCgnI2NoYXJ0Jyk7XG5cbmZ1bmN0aW9uIENyZWF0ZUNoYXJ0QnlDYXRlZ29yeUJ5TW9udGgoY2F0SWQsIG9wZXJhdGlvbnMpIHtcbiAgICB2YXIgb3BzID0gW107XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBvcGVyYXRpb25zLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHZhciBvcCA9IG9wZXJhdGlvbnNbaV07XG4gICAgICAgIGlmIChvcC5jYXRlZ29yeUlkID09PSBjYXRJZClcbiAgICAgICAgICAgIG9wcy5wdXNoKG9wKTtcbiAgICB9XG4gICAgQ3JlYXRlQ2hhcnRBbGxCeUNhdGVnb3J5QnlNb250aChvcHMpO1xufVxuXG5mdW5jdGlvbiBDcmVhdGVDaGFydEFsbEJ5Q2F0ZWdvcnlCeU1vbnRoKG9wZXJhdGlvbnMpIHtcbiAgICBmdW5jdGlvbiBkYXRla2V5KG9wKSB7XG4gICAgICAgIHZhciBkID0gb3AuZGF0ZTtcbiAgICAgICAgcmV0dXJuIGQuZ2V0RnVsbFllYXIoKSArICctJyArIGQuZ2V0TW9udGgoKTtcbiAgICB9XG5cbiAgICB2YXIgbWFwID0ge307XG4gICAgdmFyIGRhdGVzZXQgPSB7fTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IG9wZXJhdGlvbnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgdmFyIG9wID0gb3BlcmF0aW9uc1tpXTtcbiAgICAgICAgdmFyIGMgPSBvcC5jYXRlZ29yeUxhYmVsO1xuICAgICAgICBtYXBbY10gPSBtYXBbY10gfHwge307XG5cbiAgICAgICAgdmFyIGRrID0gZGF0ZWtleShvcCk7XG4gICAgICAgIG1hcFtjXVtka10gPSBtYXBbY11bZGtdIHx8IFtdO1xuICAgICAgICBtYXBbY11bZGtdLnB1c2gob3AuYW1vdW50KTtcbiAgICAgICAgZGF0ZXNldFtka10gPSB0cnVlO1xuICAgIH1cblxuICAgIHZhciBzZXJpZXMgPSBbXTtcbiAgICBmb3IgKHZhciBjIGluIG1hcCkge1xuICAgICAgICB2YXIgZGF0YSA9IFtdO1xuXG4gICAgICAgIGZvciAodmFyIGRrIGluIGRhdGVzZXQpIHtcbiAgICAgICAgICAgIG1hcFtjXVtka10gPSBtYXBbY11bZGtdIHx8IFtdO1xuICAgICAgICAgICAgdmFyIHMgPSAwO1xuICAgICAgICAgICAgdmFyIGFyciA9IG1hcFtjXVtka107XG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGFyci5sZW5ndGg7IGkrKylcbiAgICAgICAgICAgICAgICBzICs9IGFycltpXTtcbiAgICAgICAgICAgIGRhdGEucHVzaChzKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBzZXJpZSA9IHtcbiAgICAgICAgICAgIG5hbWU6IGMsXG4gICAgICAgICAgICBkYXRhOiBkYXRhXG4gICAgICAgIH07XG5cbiAgICAgICAgc2VyaWVzLnB1c2goc2VyaWUpO1xuICAgIH1cblxuICAgIHZhciBjYXRlZ29yaWVzID0gW107XG4gICAgZm9yICh2YXIgZGsgaW4gZGF0ZXNldClcbiAgICAgICAgY2F0ZWdvcmllcy5wdXNoKGRrKTtcblxuICAgIHZhciB0aXRsZSA9ICdCeSBjYXRlZ29yeSc7XG4gICAgdmFyIHlBeGlzTGVnZW5kID0gJ0Ftb3VudCc7XG5cbiAgICAkY2hhcnQuaGlnaGNoYXJ0cyh7XG4gICAgICAgIGNoYXJ0OiB7XG4gICAgICAgICAgICB0eXBlOiAnY29sdW1uJ1xuICAgICAgICB9LFxuICAgICAgICB0aXRsZToge1xuICAgICAgICAgICAgdGV4dDogdGl0bGVcbiAgICAgICAgfSxcbiAgICAgICAgeEF4aXM6IHtcbiAgICAgICAgICAgIGNhdGVnb3JpZXM6IGNhdGVnb3JpZXNcbiAgICAgICAgfSxcbiAgICAgICAgeUF4aXM6IHtcbiAgICAgICAgICAgIHRpdGxlOiB7XG4gICAgICAgICAgICAgICAgdGV4dDogeUF4aXNMZWdlbmRcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgdG9vbHRpcDoge1xuICAgICAgICAgICAgaGVhZGVyRm9ybWF0OiAnPHNwYW4gc3R5bGU9XCJmb250LXNpemU6MTBweFwiPntwb2ludC5rZXl9PC9zcGFuPjx0YWJsZT4nLFxuICAgICAgICAgICAgcG9pbnRGb3JtYXQ6ICc8dHI+PHRkIHN0eWxlPVwiY29sb3I6e3Nlcmllcy5jb2xvcn07cGFkZGluZzowXCI+e3Nlcmllcy5uYW1lfTogPC90ZD4nICtcbiAgICAgICAgICAgICc8dGQgc3R5bGU9XCJwYWRkaW5nOjBcIj48Yj57cG9pbnQueTouMWZ9IGV1cjwvYj48L3RkPjwvdHI+JyxcbiAgICAgICAgICAgIGZvb3RlckZvcm1hdDogJzwvdGFibGU+JyxcbiAgICAgICAgICAgIHNoYXJlZDogdHJ1ZSxcbiAgICAgICAgICAgIHVzZUhUTUw6IHRydWVcbiAgICAgICAgfSxcbiAgICAgICAgcGxvdE9wdGlvbnM6IHtcbiAgICAgICAgICAgIGNvbHVtbjoge1xuICAgICAgICAgICAgICAgIHBvaW50UGFkZGluZzogMC4yLFxuICAgICAgICAgICAgICAgIGJvcmRlcldpZHRoOiAwXG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIHNlcmllczogc2VyaWVzXG4gICAgfSk7XG59XG5cbi8vIFRPRE8gdW51c2VkIHJpZ2h0IG5vd1xuZnVuY3Rpb24gQ3JlYXRlQ2hhcnRBbGxPcGVyYXRpb25zKGFjY291bnQsIG9wZXJhdGlvbnMpIHtcbiAgICBjcmVhdGVDaGFydChhY2NvdW50LmluaXRpYWxBbW91bnQsIG9wZXJhdGlvbnMuc2xpY2UoKSwgYWNjb3VudC50aXRsZSk7XG59XG5cbmZ1bmN0aW9uIENyZWF0ZUNoYXJ0QnlDYXRlZ29yeShjYXRJZCwgY2F0TGFiZWwsIG9wZXJhdGlvbnMpIHtcbiAgICB2YXIgb3BzID0gb3BlcmF0aW9ucy5zbGljZSgpLmZpbHRlcihmdW5jdGlvbih4KSB7XG4gICAgICAgIHJldHVybiB4LmNhdGVnb3J5SWQgPT0gY2F0SWQ7XG4gICAgfSk7XG5cbiAgICBjcmVhdGVDaGFydCgwLCBvcHMsIGNhdExhYmVsKTtcbn1cblxuZnVuY3Rpb24gY3JlYXRlQ2hhcnQoaW5pdGlhbEFtb3VudCwgb3BlcmF0aW9ucywgdGl0bGUpIHtcbiAgICBpZiAob3BlcmF0aW9ucy5sZW5ndGggPT09IDApXG4gICAgICAgIHJldHVybjtcblxuICAgIHZhciBvcHMgPSBvcGVyYXRpb25zLnNvcnQoZnVuY3Rpb24gKGEsYikgeyByZXR1cm4gK2EuZGF0ZSAtICtiLmRhdGUgfSk7XG4gICAgdmFyIGN1bXVsYXRpdmVBbW91bnQgPSBpbml0aWFsQW1vdW50O1xuICAgIC8vIE11c3QgY29udGFpbiBhcnJheSBwYWlycyBbK2RhdGUsIHZhbHVlXVxuICAgIHZhciBwb3NpdGl2ZSA9IChpbml0aWFsQW1vdW50ID4gMCkgPyBpbml0aWFsQW1vdW50IDogMDtcbiAgICB2YXIgbmVnYXRpdmUgPSAoaW5pdGlhbEFtb3VudCA8IDApID8gLWluaXRpYWxBbW91bnQgOiAwO1xuICAgIHZhciBiYWxhbmNlID0gaW5pdGlhbEFtb3VudDtcblxuICAgIHZhciBwb3NkID0gW107XG4gICAgdmFyIG5lZ2QgPSBbXTtcbiAgICB2YXIgYmFsZCA9IFtdO1xuXG4gICAgdmFyIG9wbWFwID0ge307XG4gICAgdmFyIHBvc21hcCA9IHt9O1xuICAgIHZhciBuZWdtYXAgPSB7fTtcblxuICAgIG9wcy5tYXAoZnVuY3Rpb24obykge1xuICAgICAgICAvLyBDb252ZXJ0IGRhdGUgaW50byBhIG51bWJlcjogaXQncyBnb2luZyB0byBiZSBjb252ZXJ0ZWQgaW50byBhIHN0cmluZ1xuICAgICAgICAvLyB3aGVuIHVzZWQgYXMgYSBrZXkuXG4gICAgICAgIHZhciBhID0gby5hbW91bnQ7XG4gICAgICAgIHZhciBkID0gK28uZGF0ZTtcbiAgICAgICAgb3BtYXBbZF0gPSBvcG1hcFtkXSB8fCAwO1xuICAgICAgICBvcG1hcFtkXSArPSBhO1xuXG4gICAgICAgIGlmIChhIDwgMCkge1xuICAgICAgICAgICAgbmVnbWFwW2RdID0gbmVnbWFwW2RdIHx8IDA7XG4gICAgICAgICAgICBuZWdtYXBbZF0gKz0gLWE7XG4gICAgICAgIH0gZWxzZSBpZiAoYSA+IDApIHtcbiAgICAgICAgICAgIHBvc21hcFtkXSA9IHBvc21hcFtkXSB8fCAwO1xuICAgICAgICAgICAgcG9zbWFwW2RdICs9IGE7XG4gICAgICAgIH1cbiAgICB9KVxuXG4gICAgZm9yICh2YXIgZGF0ZSBpbiBvcG1hcCkge1xuICAgICAgICAvLyBkYXRlIGlzIGEgc3RyaW5nIG5vdzogY29udmVydCBpdCBiYWNrIHRvIGEgbnVtYmVyIGZvciBoaWdoY2hhcnRzLlxuICAgICAgICBiYWxhbmNlICs9IG9wbWFwW2RhdGVdO1xuICAgICAgICBiYWxkLnB1c2goWytkYXRlLCBiYWxhbmNlXSk7XG5cbiAgICAgICAgaWYgKHBvc21hcFtkYXRlXSkge1xuICAgICAgICAgICAgcG9zaXRpdmUgKz0gcG9zbWFwW2RhdGVdO1xuICAgICAgICB9XG4gICAgICAgIGlmIChuZWdtYXBbZGF0ZV0pIHtcbiAgICAgICAgICAgIG5lZ2F0aXZlICs9IG5lZ21hcFtkYXRlXTtcbiAgICAgICAgfVxuICAgICAgICBwb3NkLnB1c2goWytkYXRlLCBwb3NpdGl2ZV0pO1xuICAgICAgICBuZWdkLnB1c2goWytkYXRlLCBuZWdhdGl2ZV0pO1xuICAgIH1cblxuICAgIC8vIENyZWF0ZSB0aGUgY2hhcnRcbiAgICAkY2hhcnQuaGlnaGNoYXJ0cygnU3RvY2tDaGFydCcsIHtcbiAgICAgICAgcmFuZ2VTZWxlY3RvciA6IHtcbiAgICAgICAgICAgIHNlbGVjdGVkIDogMSxcbiAgICAgICAgICAgIGlucHV0RW5hYmxlZDogJGNoYXJ0LndpZHRoKCkgPiA0ODBcbiAgICAgICAgfSxcblxuICAgICAgICB0aXRsZSA6IHtcbiAgICAgICAgICAgIHRleHQgOiB0aXRsZVxuICAgICAgICB9LFxuXG4gICAgICAgIHNlcmllcyA6IFt7XG4gICAgICAgICAgICBuYW1lIDogJ0JhbGFuY2UnLFxuICAgICAgICAgICAgZGF0YSA6IGJhbGQsXG4gICAgICAgICAgICB0b29sdGlwOiB7IHZhbHVlRGVjaW1hbHM6IDIgfVxuICAgICAgICB9LCB7XG4gICAgICAgICAgICBuYW1lOiAnQ3JlZGl0JyxcbiAgICAgICAgICAgIGRhdGE6IHBvc2QsXG4gICAgICAgICAgICB0b29sdGlwOiB7IHZhbHVlRGVjaW1hbHM6IDIgfVxuICAgICAgICB9LCB7XG4gICAgICAgICAgICBuYW1lOiAnRGViaXQnLFxuICAgICAgICAgICAgZGF0YTogbmVnZCxcbiAgICAgICAgICAgIHRvb2x0aXA6IHsgdmFsdWVEZWNpbWFsczogMiB9XG4gICAgICAgIH1dXG4gICAgfSk7XG59XG5cbiJdfQ==
