(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var Events = module.exports = {
    ACCOUNTS_LOADED: 'account have just been loaded',
    BANK_LIST_LOADED: 'bank list has just been loaded',
    CATEGORIES_LOADED: 'categories have just been loaded',
    CATEGORY_CREATED: 'the user created a category',
    CATEGORY_SAVED: 'the category was saved on the server',
    DELETE_OPERATION: 'the user asked to delete an operation',
    DELETED_OPERATION: 'an operation has just been deleted on the server',
    OPERATIONS_LOADED: 'operations have been loaded',
    OPERATION_CATEGORY_CHANGED: 'user changed the category of an operation',
    OPERATION_CATEGORY_SAVED: 'the category for an operation was set on the server',
    RETRIEVE_OPERATIONS_QUERIED: 'the user clicked on retrieve operations for a bank account',
    SELECTED_ACCOUNT_CHANGED: 'something changed the selected account',
    SELECTED_BANK_CHANGED: 'something changed the selected bank'
};

},{}],2:[function(require,module,exports){
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
        var text = 'Assertion error: ' + (wat?wat:'') + '\n' + new Error().stack;
        ASSERTS && alert(text);
        console.log(text);
        return false;
    }
    return true;
};

var maybeHas = exports.maybeHas = function(obj, prop) {
    return obj.hasOwnProperty(prop);
}

exports.has = function has(obj, prop) {
    return assert(maybeHas(obj, prop), 'object should have property ' + prop);
}

exports.xhrError = function xhrError(xhr, textStatus, err) {
    alert('xhr error: ' + textStatus + '\n' + err);
}


},{}],3:[function(require,module,exports){
var has = require('./Helpers').has;
var maybeHas = require('./Helpers').maybeHas;

exports.Bank = function Bank(arg) {
    this.id   = has(arg, 'id')   && arg.id;
    this.name = has(arg, 'name') && arg.name;
    this.uuid = has(arg, 'uuid') && arg.uuid;
}

exports.Account = function Account(arg) {
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
    this.categoryId  = arg.categoryId || -1;
}

exports.Operation = Operation;

function Category(arg) {
    this.title = has(arg, 'title') && arg.title;
    this.id = has(arg, 'id') && arg.id;

    // Optional
    this.parentId = arg.parentId;
}

exports.Category = Category;

},{"./Helpers":2}],4:[function(require,module,exports){
/** @jsx React.DOM */

// Constants
var Events = require('../Events');
var debug = require('../Helpers').debug;

// Global variables
var store = require('../store');
var flux = require('../flux/dispatcher');

// Props: account: Account
var AccountListItem = React.createClass({displayName: 'AccountListItem',

    _onClick: function() {
        debug('click on a particular account');
        flux.dispatch({
            type: Events.SELECTED_ACCOUNT_CHANGED,
            account: this.props.account
        });
    },

    render: function() {
        return (
            React.DOM.li(null, 
                React.DOM.a({onClick: this._onClick}, this.props.account.title)
            )
        );
    }
});

// State: accounts: [Account]
var AccountListComponent = module.exports = React.createClass({displayName: 'exports',

    getInitialState: function() {
        return {
            accounts: []
        };
    },

    _listener: function() {
        this.setState({
            accounts: store.accounts
        });
    },

    componentDidMount: function() {
        store.on(Events.ACCOUNTS_LOADED, this._listener);
    },

    componentWillUnmount: function() {
        store.removeListener(Events.ACCOUNTS_LOADED, this._listener);
    },

    render: function() {
        var accounts = this.state.accounts.map(function (a) {
            return (
                AccountListItem({key: a.id, account: a})
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


},{"../Events":1,"../Helpers":2,"../flux/dispatcher":10,"../store":13}],5:[function(require,module,exports){
/** @jsx React.DOM */

// Constants
var Events = require('../Events');
var debug = require('../Helpers').debug;

// Global variables
var store = require('../store');
var flux = require('../flux/dispatcher');

// Props: bank: Bank
var BankListItemComponent = React.createClass({displayName: 'BankListItemComponent',

    _onClick: function() {
        debug('click on a bank item');
        flux.dispatch({
            type: Events.SELECTED_BANK_CHANGED,
            bank: this.props.bank
        });
    },

    render: function() {
        return (
            React.DOM.li(null, React.DOM.a({onClick: this._onClick}, this.props.bank.name))
        );
    }
});

// State: [bank]
var BankListComponent = module.exports = React.createClass({displayName: 'exports',

    _bankListListener: function() {
        this.setState({
            banks: store.banks
        });
    },

    getInitialState: function() {
        return {
            banks: []
        }
    },

    componentDidMount: function() {
        store.on(Events.BANK_LIST_LOADED, this._bankListListener);
    },

    componentWillUnmount: function() {
        store.removeListener(Events.BANK_LIST_LOADED, this._bankListListener);
    },

    render: function() {
        var banks = this.state.banks.map(function (b) {
            return (
                BankListItemComponent({key: b.id, bank: b})
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

},{"../Events":1,"../Helpers":2,"../flux/dispatcher":10,"../store":13}],6:[function(require,module,exports){
/** @jsx React.DOM */

// Constants
var Events = require('../Events');
var debug = require('../Helpers').debug;

// Global variables
var store = require('../store');
var flux = require('../flux/dispatcher');

var CategoryList = React.createClass({displayName: 'CategoryList',

    _listener: function() {
        this.setState({
            categories: store.categories
        });
    },

    getInitialState: function() {
        return {
            categories: []
        }
    },

    componentDidMount: function() {
        store.on(Events.CATEGORIES_LOADED, this._listener);
    },

    componentWillUnmount: function() {
        store.removeListener(Events.CATEGORIES_LOADED, this._listener);
    },

    render: function() {
        var items = this.state.categories.map(function (cat) {
            return (
                React.DOM.li({key: cat.id}, cat.title)
            );
        });
        return (
            React.DOM.ul(null, items)
        );
    }
});

var CategoryForm = React.createClass({displayName: 'CategoryForm',

    onSubmit: function(e) {
        e.preventDefault();

        var label = this.refs.label.getDOMNode().value.trim();
        if (!label)
            return false;

        var category = {
            title: label
        };

        flux.dispatch({
            type: Events.CATEGORY_CREATED,
            category: category
        });

        this.refs.label.getDOMNode().value = '';
        return false;
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

module.exports = React.createClass({displayName: 'exports',

    render: function() {
        return (
            React.DOM.div(null, 
                React.DOM.h1(null, "Categories"), 
                CategoryList(null), 
                React.DOM.h3(null, "Add a category"), 
                CategoryForm(null)
            )
        );
    }
});

},{"../Events":1,"../Helpers":2,"../flux/dispatcher":10,"../store":13}],7:[function(require,module,exports){
/** @jsx React.DOM */

// Constants
var Events = require('../Events');
var debug = require('../Helpers').debug;

// Global variables
var store = require('../store');

var $chart = null;

function DEBUG(text) {
    return debug('Chart Component - ' + text);
}

// Components
module.exports = React.createClass({displayName: 'exports',

    getInitialState: function() {
        return {
            account: null,
            operations: [],
            categories: [],
            kind: 'all'         // which chart are we showing?
        }
    },

    _reload: function() {
        DEBUG('reload');
        this.setState({
            account:    store.currentAccount,
            operations: store.operations,
            categories: store.categories
        }, this._redraw);
    },

    componentDidMount: function() {
        store.on(Events.OPERATIONS_LOADED, this._reload);
        store.on(Events.CATEGORIES_LOADED, this._reload);
        $chart = $('#chart');
    },

    componentWillUnmount: function() {
        store.removeListener(Events.OPERATIONS_LOADED, this._reload);
        store.removeListener(Events.CATEGORIES_LOADED, this._reload);
    },

    _redraw: function() {
        DEBUG('redraw');
        switch (this.state.kind) {
            case 'all':
                CreateChartAllByCategoryByMonth(this.state.operations);
                break;
            case 'balance':
                CreateChartBalance(this.state.account, this.state.operations);
                break;
            case 'by-category':
                var val = this.refs.select.getDOMNode().value;
                CreateChartByCategoryByMonth(val, this.state.operations);
                break;
            case 'pos-neg':
                CreateChartPositiveNegative(this.state.operations);
                break;
            case 'global-pos-neg':
                CreateChartPositiveNegative(store.getOperationsOfAllAccounts());
                break;
            default:
                assert(true === false, 'unexpected value in _redraw: ' + this.state.kind);
        }
    },

    _changeKind: function(kind) {
        this.setState({
            kind: kind
        }, this._redraw);
    },
    _onClickAll: function() {
        this._changeKind('all');
    },
    _onClickByCategory: function() {
        this._changeKind('by-category');
    },
    _onClickBalance: function() {
        this._changeKind('balance');
    },
    _onClickPosNeg: function() {
        this._changeKind('pos-neg');
    },
    _onClickGlobalPosNeg: function() {
        this._changeKind('global-pos-neg');
    },

    render: function() {
        var categoryOptions = this.state.categories.map(function (c) {
            return (React.DOM.option({key: c.id, value: c.id}, c.title));
        });

        var maybeSelect = this.state.kind !== 'by-category' ? '' :
            React.DOM.select({onChange: this._redraw, ref: "select"}, 
                categoryOptions
            )

        return (
        React.DOM.div(null, 
            React.DOM.h1(null, "Charts"), 

            React.DOM.div(null, 
                React.DOM.button({onClick: this._onClickAll}, "All categories by month"), 
                React.DOM.button({onClick: this._onClickByCategory}, "By category by month"), 
                React.DOM.button({onClick: this._onClickBalance}, "Balance over time"), 
                React.DOM.button({onClick: this._onClickPosNeg}, "Ins / outs over time (this account)"), 
                React.DOM.button({onClick: this._onClickGlobalPosNeg}, "Ins / outs over time (all accounts)")
            ), 

            maybeSelect, 

            React.DOM.div({id: "chart"})
        )
        );
    }
});

// Charts
function CreateChartByCategoryByMonth(catId, operations) {
    var ops = operations.slice().filter(function(op) {
        return op.categoryId === catId;
    });
    CreateChartAllByCategoryByMonth(ops);
}

function CreateChartAllByCategoryByMonth(operations) {

    function datekey(op) {
        var d = op.date;
        return d.getFullYear() + '-' + d.getMonth();
    }

    // Category -> {Month -> [Amounts]}
    var map = {};
    // Datekey -> Date
    var dateset = {};
    for (var i = 0; i < operations.length; i++) {
        var op = operations[i];
        var c = store.categoryToLabel(op.categoryId);
        map[c] = map[c] || {};

        var dk = datekey(op);
        map[c][dk] = map[c][dk] || [];
        map[c][dk].push(op.amount);
        dateset[dk] = +op.date;
    }

    // Sort date in ascending order: push all pairs of (datekey, date) in an
    // array and sort that array by the second element. Then read that array in
    // ascending order.
    var dates = [];
    for (var dk in dateset) {
        dates.push([dk, dateset[dk]]);
    }
    dates.sort(function(a, b) {
        return a[1] - b[1];
    });

    var series = [];
    for (var c in map) {
        var data = [];

        for (var j = 0; j < dates.length; j++) {
            var dk = dates[j][0];
            map[c][dk] = map[c][dk] || [];
            data.push(map[c][dk].reduce(function(a, b) { return a + b }, 0));
        }

        var serie = {
            name: c,
            data: data
        };

        series.push(serie);
    }

    var categories = [];
    for (var i = 0; i < dates.length; i++) {
        var date = new Date(dates[i][1]);
        var str = date.toLocaleDateString(/* use the default locale */ undefined, {
            year: 'numeric',
            month: 'long'
        });
        categories.push(str);
    }

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

function CreateChartBalance(account, operations) {

    var ops = operations.sort(function (a,b) { return +a.date - +b.date });

    // Date (day) -> sum amounts of this day (scalar)
    var opmap = {};
    ops.map(function(o) {
        // Convert date into a number: it's going to be converted into a string
        // when used as a key.
        var a = o.amount;
        var d = +o.date;
        opmap[d] = opmap[d] || 0;
        opmap[d] += a;
    })

    var balance = account.initialAmount;
    var bal = [];
    for (var date in opmap) {
        // date is a string now: convert it back to a number for highcharts.
        balance += opmap[date];
        bal.push([+date, balance]);
    }

    // Create the chart
    $chart.highcharts('StockChart', {
        rangeSelector : {
            selected : 1
        },

        title : {
            text : 'Balance'
        },

        series : [{
            name : 'Balance',
            data : bal,
            tooltip: { valueDecimals: 2 }
        }]
    });
}

function CreateChartPositiveNegative(operations) {

    function datekey(op) {
        var d = op.date;
        return d.getFullYear() + '-' + d.getMonth();
    }

    const POS = 0, NEG = 1, BAL = 2;

    // Month -> [Positive amount, Negative amount, Diff]
    var map = {};
    // Datekey -> Date
    var dateset = {};
    for (var i = 0; i < operations.length; i++) {
        var op = operations[i];
        var dk = datekey(op);
        map[dk] = map[dk] || [0, 0, 0];

        map[dk][POS] += op.amount > 0 ? op.amount : 0;
        map[dk][NEG] += op.amount < 0 ? -op.amount : 0;
        map[dk][BAL] += op.amount;

        dateset[dk] = +op.date;
    }

    // Sort date in ascending order: push all pairs of (datekey, date) in an
    // array and sort that array by the second element. Then read that array in
    // ascending order.
    var dates = [];
    for (var dk in dateset) {
        dates.push([dk, dateset[dk]]);
    }
    dates.sort(function(a, b) {
        return a[1] - b[1];
    });

    var series = [];
    function addSerie(name, mapIndex) {
        var data = [];
        for (var i = 0; i < dates.length; i++) {
            var dk = dates[i][0];
            data.push(map[dk][mapIndex]);
        }
        var serie = {
            name: name,
            data: data
        };
        series.push(serie);
    }

    addSerie('Positive', POS);
    addSerie('Negative', NEG);
    addSerie('Balance', BAL);

    var categories = [];
    for (var i = 0; i < dates.length; i++) {
        var date = new Date(dates[i][1]);
        var str = date.toLocaleDateString(/* use the default locale */ undefined, {
            year: 'numeric',
            month: 'long'
        });
        categories.push(str);
    }

    var title = 'Positive / Negative over time';
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


},{"../Events":1,"../Helpers":2,"../store":13}],8:[function(require,module,exports){
/** @jsx React.DOM */

// Constants
var Events = require('../Events');
var debug = require('../Helpers').debug;

// Global variables
var store = require('../store');
var flux = require('../flux/dispatcher');

// Components
var CategorySelectComponent = React.createClass({displayName: 'CategorySelectComponent',

    getInitialState: function() {
        return { editMode: false }
    },

    dom: function() {
        return this.refs.cat.getDOMNode();
    },

    onChange: function(e) {
        var selectedId = this.dom().value;
        flux.dispatch({
            type: Events.OPERATION_CATEGORY_CHANGED,
            operationId: this.props.operation.id,
            categoryId: selectedId
        });
        // Be optimistic
        this.props.operation.categoryId = selectedId;
    },

    switchToEditMode: function() {
        this.setState({ editMode: true }, function() {
            this.dom().focus();
        });
    },
    switchToStaticMode: function() {
        this.setState({ editMode: false });
    },

    render: function() {
        var selectedId = this.props.operation.categoryId;
        var label = store.categoryToLabel(selectedId);

        if (!this.state.editMode) {
            return (React.DOM.span({onClick: this.switchToEditMode}, label))
        }

        // On the first click in edit mode, categories are already loaded.
        // Every time we reload categories, we can't be in edit mode, so we can
        // just synchronously retrieve categories and not need to subscribe to
        // them.
        var options = store.categories.map(function (c) {
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
                React.DOM.td(null, op.date.toLocaleDateString()), 
                React.DOM.td({onMouseEnter: this.onMouseEnter, onMouseLeave: this.onMouseLeave}, this.state.mouseOn ? op.raw : op.title), 
                React.DOM.td(null, op.amount), 
                React.DOM.td(null, 
                    CategorySelectComponent({operation: op})
                )
            )
        );
    }
});

var OperationsComponent = module.exports = React.createClass({displayName: 'exports',

    getInitialState: function() {
        return {
            account: {initialAmount: 0},
            operations: []
        }
    },

    _cb: function() {
        this.setState({
            account: store.currentAccount,
            operations: store.operations
        });
    },

    componentDidMount: function() {
        store.on(Events.OPERATIONS_LOADED, this._cb);
    },

    componentWillUnmount: function() {
        store.removeListener(Events.OPERATIONS_LOADED, this._cb);
    },

    getTotal: function() {
        var total = this.state.operations.reduce(function(a,b) { return a + b.amount },
                                                 this.state.account.initialAmount);
        return (total * 100 | 0) / 100;
    },

    onRetrieveOperations_: function() {
        flux.dispatch({
            type: Events.RETRIEVE_OPERATIONS_QUERIED
        });
    },

    render: function() {
        var ops = this.state.operations.map(function (o) {
            return (
                OperationComponent({key: o.id, operation: o})
            );
        });

        return (
            React.DOM.div(null, 
                React.DOM.h1(null, "Operations"), 
                React.DOM.div(null, 
                    React.DOM.h3(null, "Total: ", this.getTotal()), 
                    React.DOM.a({onClick: this.onRetrieveOperations_}, "Retrieve operations")
                ), 
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


},{"../Events":1,"../Helpers":2,"../flux/dispatcher":10,"../store":13}],9:[function(require,module,exports){
/** @jsx React.DOM */

// Constants
var Events = require('../Events');
var debug = require('../Helpers').debug;

// Global variables
var store = require('../store');
var flux = require('../flux/dispatcher');

function DEBUG(text) {
    return debug('Similarity Component - ' + text);
}

// Algorithm

// TODO make this threshold a parameter
const TIME_SIMILAR_THRESHOLD = 1000 * 60 * 60 * 24 * 2; // 48 hours
function findRedundantPairs(operations) {
    DEBUG('Running findRedundantPairs algorithm...');
    DEBUG('Input: ' + operations.length + ' operations');
    var similar = [];

    function areSimilarOperations(a, b) {
        if (a.amount != b.amount)
            return false;
        var datediff = Math.abs(+a.date - +b.date);
        return datediff <= TIME_SIMILAR_THRESHOLD;
    }

    // O(n log n)
    function sortCriteria(a,b) { return a.amount - b.amount; }
    var sorted = operations.slice().sort(sortCriteria);
    for (var i = 0; i < operations.length; ++i) {
        if (i + 1 >= operations.length)
            continue;

        var op = sorted[i];
        var next = sorted[i+1];
        if (areSimilarOperations(op, next))
            similar.push([op, next]);
    }

    DEBUG(similar.length + ' pairs of similar operations found');
    return similar;
}

// Components
var SimilarityItemComponent = React.createClass({displayName: 'SimilarityItemComponent',

    _deleteOperation: function() {
        flux.dispatch({
            type: Events.DELETE_OPERATION,
            operation: this.props.operation
        });
    },

    render: function() {
        return (
            React.DOM.tr(null, 
                React.DOM.td(null, this.props.operation.date.toString()), 
                React.DOM.td(null, this.props.operation.title), 
                React.DOM.td(null, this.props.operation.amount), 
                React.DOM.td(null, React.DOM.a({onClick: this._deleteOperation}, "x"))
            )
        );
    }
});

var SimilarityPairComponent = React.createClass({displayName: 'SimilarityPairComponent',

    render: function() {
        return (
            React.DOM.table(null, 
                SimilarityItemComponent({operation: this.props.a}), 
                SimilarityItemComponent({operation: this.props.b})
            )
        );
    }
});

module.exports = React.createClass({displayName: 'exports',

    getInitialState: function() {
        return {
            pairs: []
        };
    },

    _cb: function() {
        this.setState({
            pairs: findRedundantPairs(store.operations)
        });
    },

    componentDidMount: function() {
        store.on(Events.OPERATIONS_LOADED, this._cb);
    },

    componentWillUnmount: function() {
        store.removeListener(Events.OPERATIONS_LOADED, this._cb);
    },

    render: function() {
        var pairs = this.state.pairs;
        if (pairs.length === 0) {
            return (
                React.DOM.div(null, "No similar operations found.")
            )
        }

        var sim = pairs.map(function (p) {
            var key = p[0].id.toString() + p[1].id.toString();
            return (SimilarityPairComponent({key: key, a: p[0], b: p[1]}))
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


},{"../Events":1,"../Helpers":2,"../flux/dispatcher":10,"../store":13}],10:[function(require,module,exports){
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


module.exports = new Dispatcher;

},{"./invariant":11}],11:[function(require,module,exports){
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

},{}],12:[function(require,module,exports){
/** @jsx React.DOM */

// Helpers
var Events = require('./Events');

// Classes
var AccountListComponent = require('./components/AccountListComponent');
var BankListComponent = require('./components/BankListComponent');
var CategoryComponent = require('./components/CategoryComponent');
var ChartComponent = require('./components/ChartComponent');
var OperationListComponent = require('./components/OperationListComponent');
var SimilarityComponent = require('./components/SimilarityComponent');

// Global variables
var store = require('./store');

// Now this really begins.
var Kresus = React.createClass({displayName: 'Kresus',

    componentDidMount: function() {
        // Let's go.
        store.getCategories();
        store.once(Events.CATEGORIES_LOADED, function() {
            store.getAllBanks();
        });
    },

    render: function() {
        return (
            React.DOM.div({className: "row"}, 

            React.DOM.div({className: "panel small-2 columns"}, 
                BankListComponent(null), 
                AccountListComponent(null)
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
                        OperationListComponent(null)
                    ), 

                    React.DOM.div({className: "content", id: "panel-similarities"}, 
                        SimilarityComponent(null)
                    ), 

                    React.DOM.div({className: "content", id: "panel-charts"}, 
                        ChartComponent(null)
                    ), 

                    React.DOM.div({className: "content", id: "panel-categories"}, 
                        CategoryComponent(null)
                    )

                )
            )

            )
        );
    }
});

React.renderComponent(Kresus(null), document.querySelector('#main'));

},{"./Events":1,"./components/AccountListComponent":4,"./components/BankListComponent":5,"./components/CategoryComponent":6,"./components/ChartComponent":7,"./components/OperationListComponent":8,"./components/SimilarityComponent":9,"./store":13}],13:[function(require,module,exports){
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

},{"./Events":1,"./Helpers":2,"./Models":3,"./flux/dispatcher":10,"events":14}],14:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

function EventEmitter() {
  this._events = this._events || {};
  this._maxListeners = this._maxListeners || undefined;
}
module.exports = EventEmitter;

// Backwards-compat with node 0.10.x
EventEmitter.EventEmitter = EventEmitter;

EventEmitter.prototype._events = undefined;
EventEmitter.prototype._maxListeners = undefined;

// By default EventEmitters will print a warning if more than 10 listeners are
// added to it. This is a useful default which helps finding memory leaks.
EventEmitter.defaultMaxListeners = 10;

// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
EventEmitter.prototype.setMaxListeners = function(n) {
  if (!isNumber(n) || n < 0 || isNaN(n))
    throw TypeError('n must be a positive number');
  this._maxListeners = n;
  return this;
};

EventEmitter.prototype.emit = function(type) {
  var er, handler, len, args, i, listeners;

  if (!this._events)
    this._events = {};

  // If there is no 'error' event listener then throw.
  if (type === 'error') {
    if (!this._events.error ||
        (isObject(this._events.error) && !this._events.error.length)) {
      er = arguments[1];
      if (er instanceof Error) {
        throw er; // Unhandled 'error' event
      }
      throw TypeError('Uncaught, unspecified "error" event.');
    }
  }

  handler = this._events[type];

  if (isUndefined(handler))
    return false;

  if (isFunction(handler)) {
    switch (arguments.length) {
      // fast cases
      case 1:
        handler.call(this);
        break;
      case 2:
        handler.call(this, arguments[1]);
        break;
      case 3:
        handler.call(this, arguments[1], arguments[2]);
        break;
      // slower
      default:
        len = arguments.length;
        args = new Array(len - 1);
        for (i = 1; i < len; i++)
          args[i - 1] = arguments[i];
        handler.apply(this, args);
    }
  } else if (isObject(handler)) {
    len = arguments.length;
    args = new Array(len - 1);
    for (i = 1; i < len; i++)
      args[i - 1] = arguments[i];

    listeners = handler.slice();
    len = listeners.length;
    for (i = 0; i < len; i++)
      listeners[i].apply(this, args);
  }

  return true;
};

EventEmitter.prototype.addListener = function(type, listener) {
  var m;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events)
    this._events = {};

  // To avoid recursion in the case that type === "newListener"! Before
  // adding it to the listeners, first emit "newListener".
  if (this._events.newListener)
    this.emit('newListener', type,
              isFunction(listener.listener) ?
              listener.listener : listener);

  if (!this._events[type])
    // Optimize the case of one listener. Don't need the extra array object.
    this._events[type] = listener;
  else if (isObject(this._events[type]))
    // If we've already got an array, just append.
    this._events[type].push(listener);
  else
    // Adding the second element, need to change to array.
    this._events[type] = [this._events[type], listener];

  // Check for listener leak
  if (isObject(this._events[type]) && !this._events[type].warned) {
    var m;
    if (!isUndefined(this._maxListeners)) {
      m = this._maxListeners;
    } else {
      m = EventEmitter.defaultMaxListeners;
    }

    if (m && m > 0 && this._events[type].length > m) {
      this._events[type].warned = true;
      console.error('(node) warning: possible EventEmitter memory ' +
                    'leak detected. %d listeners added. ' +
                    'Use emitter.setMaxListeners() to increase limit.',
                    this._events[type].length);
      if (typeof console.trace === 'function') {
        // not supported in IE 10
        console.trace();
      }
    }
  }

  return this;
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.once = function(type, listener) {
  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  var fired = false;

  function g() {
    this.removeListener(type, g);

    if (!fired) {
      fired = true;
      listener.apply(this, arguments);
    }
  }

  g.listener = listener;
  this.on(type, g);

  return this;
};

// emits a 'removeListener' event iff the listener was removed
EventEmitter.prototype.removeListener = function(type, listener) {
  var list, position, length, i;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events || !this._events[type])
    return this;

  list = this._events[type];
  length = list.length;
  position = -1;

  if (list === listener ||
      (isFunction(list.listener) && list.listener === listener)) {
    delete this._events[type];
    if (this._events.removeListener)
      this.emit('removeListener', type, listener);

  } else if (isObject(list)) {
    for (i = length; i-- > 0;) {
      if (list[i] === listener ||
          (list[i].listener && list[i].listener === listener)) {
        position = i;
        break;
      }
    }

    if (position < 0)
      return this;

    if (list.length === 1) {
      list.length = 0;
      delete this._events[type];
    } else {
      list.splice(position, 1);
    }

    if (this._events.removeListener)
      this.emit('removeListener', type, listener);
  }

  return this;
};

EventEmitter.prototype.removeAllListeners = function(type) {
  var key, listeners;

  if (!this._events)
    return this;

  // not listening for removeListener, no need to emit
  if (!this._events.removeListener) {
    if (arguments.length === 0)
      this._events = {};
    else if (this._events[type])
      delete this._events[type];
    return this;
  }

  // emit removeListener for all listeners on all events
  if (arguments.length === 0) {
    for (key in this._events) {
      if (key === 'removeListener') continue;
      this.removeAllListeners(key);
    }
    this.removeAllListeners('removeListener');
    this._events = {};
    return this;
  }

  listeners = this._events[type];

  if (isFunction(listeners)) {
    this.removeListener(type, listeners);
  } else {
    // LIFO order
    while (listeners.length)
      this.removeListener(type, listeners[listeners.length - 1]);
  }
  delete this._events[type];

  return this;
};

EventEmitter.prototype.listeners = function(type) {
  var ret;
  if (!this._events || !this._events[type])
    ret = [];
  else if (isFunction(this._events[type]))
    ret = [this._events[type]];
  else
    ret = this._events[type].slice();
  return ret;
};

EventEmitter.listenerCount = function(emitter, type) {
  var ret;
  if (!emitter._events || !emitter._events[type])
    ret = 0;
  else if (isFunction(emitter._events[type]))
    ret = 1;
  else
    ret = emitter._events[type].length;
  return ret;
};

function isFunction(arg) {
  return typeof arg === 'function';
}

function isNumber(arg) {
  return typeof arg === 'number';
}

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}

function isUndefined(arg) {
  return arg === void 0;
}

},{}]},{},[12])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2Jlbi9jb2RlL2NvenkvZGV2L2tyZXN1cy9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwiL2hvbWUvYmVuL2NvZGUvY296eS9kZXYva3Jlc3VzL2NsaWVudC9FdmVudHMuanMiLCIvaG9tZS9iZW4vY29kZS9jb3p5L2Rldi9rcmVzdXMvY2xpZW50L0hlbHBlcnMuanMiLCIvaG9tZS9iZW4vY29kZS9jb3p5L2Rldi9rcmVzdXMvY2xpZW50L01vZGVscy5qcyIsIi9ob21lL2Jlbi9jb2RlL2NvenkvZGV2L2tyZXN1cy9jbGllbnQvY29tcG9uZW50cy9BY2NvdW50TGlzdENvbXBvbmVudC5qcyIsIi9ob21lL2Jlbi9jb2RlL2NvenkvZGV2L2tyZXN1cy9jbGllbnQvY29tcG9uZW50cy9CYW5rTGlzdENvbXBvbmVudC5qcyIsIi9ob21lL2Jlbi9jb2RlL2NvenkvZGV2L2tyZXN1cy9jbGllbnQvY29tcG9uZW50cy9DYXRlZ29yeUNvbXBvbmVudC5qcyIsIi9ob21lL2Jlbi9jb2RlL2NvenkvZGV2L2tyZXN1cy9jbGllbnQvY29tcG9uZW50cy9DaGFydENvbXBvbmVudC5qcyIsIi9ob21lL2Jlbi9jb2RlL2NvenkvZGV2L2tyZXN1cy9jbGllbnQvY29tcG9uZW50cy9PcGVyYXRpb25MaXN0Q29tcG9uZW50LmpzIiwiL2hvbWUvYmVuL2NvZGUvY296eS9kZXYva3Jlc3VzL2NsaWVudC9jb21wb25lbnRzL1NpbWlsYXJpdHlDb21wb25lbnQuanMiLCIvaG9tZS9iZW4vY29kZS9jb3p5L2Rldi9rcmVzdXMvY2xpZW50L2ZsdXgvZGlzcGF0Y2hlci5qcyIsIi9ob21lL2Jlbi9jb2RlL2NvenkvZGV2L2tyZXN1cy9jbGllbnQvZmx1eC9pbnZhcmlhbnQuanMiLCIvaG9tZS9iZW4vY29kZS9jb3p5L2Rldi9rcmVzdXMvY2xpZW50L21haW4uanMiLCIvaG9tZS9iZW4vY29kZS9jb3p5L2Rldi9rcmVzdXMvY2xpZW50L3N0b3JlLmpzIiwiL2hvbWUvYmVuL2NvZGUvY296eS9kZXYva3Jlc3VzL25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9ldmVudHMvZXZlbnRzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDZkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoWEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pLQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMVBBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDelJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dGhyb3cgbmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKX12YXIgZj1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwoZi5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxmLGYuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwidmFyIEV2ZW50cyA9IG1vZHVsZS5leHBvcnRzID0ge1xuICAgIEFDQ09VTlRTX0xPQURFRDogJ2FjY291bnQgaGF2ZSBqdXN0IGJlZW4gbG9hZGVkJyxcbiAgICBCQU5LX0xJU1RfTE9BREVEOiAnYmFuayBsaXN0IGhhcyBqdXN0IGJlZW4gbG9hZGVkJyxcbiAgICBDQVRFR09SSUVTX0xPQURFRDogJ2NhdGVnb3JpZXMgaGF2ZSBqdXN0IGJlZW4gbG9hZGVkJyxcbiAgICBDQVRFR09SWV9DUkVBVEVEOiAndGhlIHVzZXIgY3JlYXRlZCBhIGNhdGVnb3J5JyxcbiAgICBDQVRFR09SWV9TQVZFRDogJ3RoZSBjYXRlZ29yeSB3YXMgc2F2ZWQgb24gdGhlIHNlcnZlcicsXG4gICAgREVMRVRFX09QRVJBVElPTjogJ3RoZSB1c2VyIGFza2VkIHRvIGRlbGV0ZSBhbiBvcGVyYXRpb24nLFxuICAgIERFTEVURURfT1BFUkFUSU9OOiAnYW4gb3BlcmF0aW9uIGhhcyBqdXN0IGJlZW4gZGVsZXRlZCBvbiB0aGUgc2VydmVyJyxcbiAgICBPUEVSQVRJT05TX0xPQURFRDogJ29wZXJhdGlvbnMgaGF2ZSBiZWVuIGxvYWRlZCcsXG4gICAgT1BFUkFUSU9OX0NBVEVHT1JZX0NIQU5HRUQ6ICd1c2VyIGNoYW5nZWQgdGhlIGNhdGVnb3J5IG9mIGFuIG9wZXJhdGlvbicsXG4gICAgT1BFUkFUSU9OX0NBVEVHT1JZX1NBVkVEOiAndGhlIGNhdGVnb3J5IGZvciBhbiBvcGVyYXRpb24gd2FzIHNldCBvbiB0aGUgc2VydmVyJyxcbiAgICBSRVRSSUVWRV9PUEVSQVRJT05TX1FVRVJJRUQ6ICd0aGUgdXNlciBjbGlja2VkIG9uIHJldHJpZXZlIG9wZXJhdGlvbnMgZm9yIGEgYmFuayBhY2NvdW50JyxcbiAgICBTRUxFQ1RFRF9BQ0NPVU5UX0NIQU5HRUQ6ICdzb21ldGhpbmcgY2hhbmdlZCB0aGUgc2VsZWN0ZWQgYWNjb3VudCcsXG4gICAgU0VMRUNURURfQkFOS19DSEFOR0VEOiAnc29tZXRoaW5nIGNoYW5nZWQgdGhlIHNlbGVjdGVkIGJhbmsnXG59O1xuIiwiLypcbiAqIEhFTFBFUlNcbiAqL1xuXG5jb25zdCBERUJVRyA9IHRydWU7XG5jb25zdCBBU1NFUlRTID0gdHJ1ZTtcblxudmFyIGRlYnVnID0gZXhwb3J0cy5kZWJ1ZyA9IGZ1bmN0aW9uKCkge1xuICAgIERFQlVHICYmIGNvbnNvbGUubG9nLmFwcGx5KGNvbnNvbGUsIGFyZ3VtZW50cyk7XG59O1xuXG52YXIgYXNzZXJ0ID0gZXhwb3J0cy5hc3NlcnQgPSBmdW5jdGlvbih4LCB3YXQpIHtcbiAgICBpZiAoIXgpIHtcbiAgICAgICAgdmFyIHRleHQgPSAnQXNzZXJ0aW9uIGVycm9yOiAnICsgKHdhdD93YXQ6JycpICsgJ1xcbicgKyBuZXcgRXJyb3IoKS5zdGFjaztcbiAgICAgICAgQVNTRVJUUyAmJiBhbGVydCh0ZXh0KTtcbiAgICAgICAgY29uc29sZS5sb2codGV4dCk7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgcmV0dXJuIHRydWU7XG59O1xuXG52YXIgbWF5YmVIYXMgPSBleHBvcnRzLm1heWJlSGFzID0gZnVuY3Rpb24ob2JqLCBwcm9wKSB7XG4gICAgcmV0dXJuIG9iai5oYXNPd25Qcm9wZXJ0eShwcm9wKTtcbn1cblxuZXhwb3J0cy5oYXMgPSBmdW5jdGlvbiBoYXMob2JqLCBwcm9wKSB7XG4gICAgcmV0dXJuIGFzc2VydChtYXliZUhhcyhvYmosIHByb3ApLCAnb2JqZWN0IHNob3VsZCBoYXZlIHByb3BlcnR5ICcgKyBwcm9wKTtcbn1cblxuZXhwb3J0cy54aHJFcnJvciA9IGZ1bmN0aW9uIHhockVycm9yKHhociwgdGV4dFN0YXR1cywgZXJyKSB7XG4gICAgYWxlcnQoJ3hociBlcnJvcjogJyArIHRleHRTdGF0dXMgKyAnXFxuJyArIGVycik7XG59XG5cbiIsInZhciBoYXMgPSByZXF1aXJlKCcuL0hlbHBlcnMnKS5oYXM7XG52YXIgbWF5YmVIYXMgPSByZXF1aXJlKCcuL0hlbHBlcnMnKS5tYXliZUhhcztcblxuZXhwb3J0cy5CYW5rID0gZnVuY3Rpb24gQmFuayhhcmcpIHtcbiAgICB0aGlzLmlkICAgPSBoYXMoYXJnLCAnaWQnKSAgICYmIGFyZy5pZDtcbiAgICB0aGlzLm5hbWUgPSBoYXMoYXJnLCAnbmFtZScpICYmIGFyZy5uYW1lO1xuICAgIHRoaXMudXVpZCA9IGhhcyhhcmcsICd1dWlkJykgJiYgYXJnLnV1aWQ7XG59XG5cbmV4cG9ydHMuQWNjb3VudCA9IGZ1bmN0aW9uIEFjY291bnQoYXJnKSB7XG4gICAgdGhpcy5iYW5rICAgICAgICAgID0gaGFzKGFyZywgJ2JhbmsnKSAmJiBhcmcuYmFuaztcbiAgICB0aGlzLmJhbmtBY2Nlc3MgICAgPSBoYXMoYXJnLCAnYmFua0FjY2VzcycpICYmIGFyZy5iYW5rQWNjZXNzO1xuICAgIHRoaXMudGl0bGUgICAgICAgICA9IGhhcyhhcmcsICd0aXRsZScpICYmIGFyZy50aXRsZTtcbiAgICB0aGlzLmFjY291bnROdW1iZXIgPSBoYXMoYXJnLCAnYWNjb3VudE51bWJlcicpICYmIGFyZy5hY2NvdW50TnVtYmVyO1xuICAgIHRoaXMuaW5pdGlhbEFtb3VudCA9IGhhcyhhcmcsICdpbml0aWFsQW1vdW50JykgJiYgYXJnLmluaXRpYWxBbW91bnQ7XG4gICAgdGhpcy5sYXN0Q2hlY2tlZCAgID0gaGFzKGFyZywgJ2xhc3RDaGVja2VkJykgJiYgbmV3IERhdGUoYXJnLmxhc3RDaGVja2VkKTtcbiAgICB0aGlzLmlkICAgICAgICAgICAgPSBoYXMoYXJnLCAnaWQnKSAmJiBhcmcuaWQ7XG4gICAgdGhpcy5hbW91bnQgICAgICAgID0gaGFzKGFyZywgJ2Ftb3VudCcpICYmIGFyZy5hbW91bnQ7XG59XG5cbmZ1bmN0aW9uIE9wZXJhdGlvbihhcmcpIHtcbiAgICB0aGlzLmJhbmtBY2NvdW50ID0gaGFzKGFyZywgJ2JhbmtBY2NvdW50JykgJiYgYXJnLmJhbmtBY2NvdW50O1xuICAgIHRoaXMudGl0bGUgICAgICAgPSBoYXMoYXJnLCAndGl0bGUnKSAmJiBhcmcudGl0bGU7XG4gICAgdGhpcy5kYXRlICAgICAgICA9IGhhcyhhcmcsICdkYXRlJykgJiYgbmV3IERhdGUoYXJnLmRhdGUpO1xuICAgIHRoaXMuYW1vdW50ICAgICAgPSBoYXMoYXJnLCAnYW1vdW50JykgJiYgYXJnLmFtb3VudDtcbiAgICB0aGlzLnJhdyAgICAgICAgID0gaGFzKGFyZywgJ3JhdycpICYmIGFyZy5yYXc7XG4gICAgdGhpcy5kYXRlSW1wb3J0ICA9IChtYXliZUhhcyhhcmcsICdkYXRlSW1wb3J0JykgJiYgbmV3IERhdGUoYXJnLmRhdGVJbXBvcnQpKSB8fCAwO1xuICAgIHRoaXMuaWQgICAgICAgICAgPSBoYXMoYXJnLCAnaWQnKSAmJiBhcmcuaWQ7XG4gICAgdGhpcy5jYXRlZ29yeUlkICA9IGFyZy5jYXRlZ29yeUlkIHx8IC0xO1xufVxuXG5leHBvcnRzLk9wZXJhdGlvbiA9IE9wZXJhdGlvbjtcblxuZnVuY3Rpb24gQ2F0ZWdvcnkoYXJnKSB7XG4gICAgdGhpcy50aXRsZSA9IGhhcyhhcmcsICd0aXRsZScpICYmIGFyZy50aXRsZTtcbiAgICB0aGlzLmlkID0gaGFzKGFyZywgJ2lkJykgJiYgYXJnLmlkO1xuXG4gICAgLy8gT3B0aW9uYWxcbiAgICB0aGlzLnBhcmVudElkID0gYXJnLnBhcmVudElkO1xufVxuXG5leHBvcnRzLkNhdGVnb3J5ID0gQ2F0ZWdvcnk7XG4iLCIvKiogQGpzeCBSZWFjdC5ET00gKi9cblxuLy8gQ29uc3RhbnRzXG52YXIgRXZlbnRzID0gcmVxdWlyZSgnLi4vRXZlbnRzJyk7XG52YXIgZGVidWcgPSByZXF1aXJlKCcuLi9IZWxwZXJzJykuZGVidWc7XG5cbi8vIEdsb2JhbCB2YXJpYWJsZXNcbnZhciBzdG9yZSA9IHJlcXVpcmUoJy4uL3N0b3JlJyk7XG52YXIgZmx1eCA9IHJlcXVpcmUoJy4uL2ZsdXgvZGlzcGF0Y2hlcicpO1xuXG4vLyBQcm9wczogYWNjb3VudDogQWNjb3VudFxudmFyIEFjY291bnRMaXN0SXRlbSA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtkaXNwbGF5TmFtZTogJ0FjY291bnRMaXN0SXRlbScsXG5cbiAgICBfb25DbGljazogZnVuY3Rpb24oKSB7XG4gICAgICAgIGRlYnVnKCdjbGljayBvbiBhIHBhcnRpY3VsYXIgYWNjb3VudCcpO1xuICAgICAgICBmbHV4LmRpc3BhdGNoKHtcbiAgICAgICAgICAgIHR5cGU6IEV2ZW50cy5TRUxFQ1RFRF9BQ0NPVU5UX0NIQU5HRUQsXG4gICAgICAgICAgICBhY2NvdW50OiB0aGlzLnByb3BzLmFjY291bnRcbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIHJlbmRlcjogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICBSZWFjdC5ET00ubGkobnVsbCwgXG4gICAgICAgICAgICAgICAgUmVhY3QuRE9NLmEoe29uQ2xpY2s6IHRoaXMuX29uQ2xpY2t9LCB0aGlzLnByb3BzLmFjY291bnQudGl0bGUpXG4gICAgICAgICAgICApXG4gICAgICAgICk7XG4gICAgfVxufSk7XG5cbi8vIFN0YXRlOiBhY2NvdW50czogW0FjY291bnRdXG52YXIgQWNjb3VudExpc3RDb21wb25lbnQgPSBtb2R1bGUuZXhwb3J0cyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtkaXNwbGF5TmFtZTogJ2V4cG9ydHMnLFxuXG4gICAgZ2V0SW5pdGlhbFN0YXRlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGFjY291bnRzOiBbXVxuICAgICAgICB9O1xuICAgIH0sXG5cbiAgICBfbGlzdGVuZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgIGFjY291bnRzOiBzdG9yZS5hY2NvdW50c1xuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgY29tcG9uZW50RGlkTW91bnQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICBzdG9yZS5vbihFdmVudHMuQUNDT1VOVFNfTE9BREVELCB0aGlzLl9saXN0ZW5lcik7XG4gICAgfSxcblxuICAgIGNvbXBvbmVudFdpbGxVbm1vdW50OiBmdW5jdGlvbigpIHtcbiAgICAgICAgc3RvcmUucmVtb3ZlTGlzdGVuZXIoRXZlbnRzLkFDQ09VTlRTX0xPQURFRCwgdGhpcy5fbGlzdGVuZXIpO1xuICAgIH0sXG5cbiAgICByZW5kZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgYWNjb3VudHMgPSB0aGlzLnN0YXRlLmFjY291bnRzLm1hcChmdW5jdGlvbiAoYSkge1xuICAgICAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgICAgICBBY2NvdW50TGlzdEl0ZW0oe2tleTogYS5pZCwgYWNjb3VudDogYX0pXG4gICAgICAgICAgICApO1xuICAgICAgICB9KTtcblxuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgUmVhY3QuRE9NLmRpdihudWxsLCBcbiAgICAgICAgICAgICAgICBcIkFjY291bnRzXCIsIFxuICAgICAgICAgICAgICAgIFJlYWN0LkRPTS51bCh7Y2xhc3NOYW1lOiBcInJvd1wifSwgXG4gICAgICAgICAgICAgICAgICAgIGFjY291bnRzXG4gICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgKVxuICAgICAgICApO1xuICAgIH1cbn0pO1xuXG4iLCIvKiogQGpzeCBSZWFjdC5ET00gKi9cblxuLy8gQ29uc3RhbnRzXG52YXIgRXZlbnRzID0gcmVxdWlyZSgnLi4vRXZlbnRzJyk7XG52YXIgZGVidWcgPSByZXF1aXJlKCcuLi9IZWxwZXJzJykuZGVidWc7XG5cbi8vIEdsb2JhbCB2YXJpYWJsZXNcbnZhciBzdG9yZSA9IHJlcXVpcmUoJy4uL3N0b3JlJyk7XG52YXIgZmx1eCA9IHJlcXVpcmUoJy4uL2ZsdXgvZGlzcGF0Y2hlcicpO1xuXG4vLyBQcm9wczogYmFuazogQmFua1xudmFyIEJhbmtMaXN0SXRlbUNvbXBvbmVudCA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtkaXNwbGF5TmFtZTogJ0JhbmtMaXN0SXRlbUNvbXBvbmVudCcsXG5cbiAgICBfb25DbGljazogZnVuY3Rpb24oKSB7XG4gICAgICAgIGRlYnVnKCdjbGljayBvbiBhIGJhbmsgaXRlbScpO1xuICAgICAgICBmbHV4LmRpc3BhdGNoKHtcbiAgICAgICAgICAgIHR5cGU6IEV2ZW50cy5TRUxFQ1RFRF9CQU5LX0NIQU5HRUQsXG4gICAgICAgICAgICBiYW5rOiB0aGlzLnByb3BzLmJhbmtcbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIHJlbmRlcjogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICBSZWFjdC5ET00ubGkobnVsbCwgUmVhY3QuRE9NLmEoe29uQ2xpY2s6IHRoaXMuX29uQ2xpY2t9LCB0aGlzLnByb3BzLmJhbmsubmFtZSkpXG4gICAgICAgICk7XG4gICAgfVxufSk7XG5cbi8vIFN0YXRlOiBbYmFua11cbnZhciBCYW5rTGlzdENvbXBvbmVudCA9IG1vZHVsZS5leHBvcnRzID0gUmVhY3QuY3JlYXRlQ2xhc3Moe2Rpc3BsYXlOYW1lOiAnZXhwb3J0cycsXG5cbiAgICBfYmFua0xpc3RMaXN0ZW5lcjogZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgYmFua3M6IHN0b3JlLmJhbmtzXG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICBnZXRJbml0aWFsU3RhdGU6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgYmFua3M6IFtdXG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgY29tcG9uZW50RGlkTW91bnQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICBzdG9yZS5vbihFdmVudHMuQkFOS19MSVNUX0xPQURFRCwgdGhpcy5fYmFua0xpc3RMaXN0ZW5lcik7XG4gICAgfSxcblxuICAgIGNvbXBvbmVudFdpbGxVbm1vdW50OiBmdW5jdGlvbigpIHtcbiAgICAgICAgc3RvcmUucmVtb3ZlTGlzdGVuZXIoRXZlbnRzLkJBTktfTElTVF9MT0FERUQsIHRoaXMuX2JhbmtMaXN0TGlzdGVuZXIpO1xuICAgIH0sXG5cbiAgICByZW5kZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgYmFua3MgPSB0aGlzLnN0YXRlLmJhbmtzLm1hcChmdW5jdGlvbiAoYikge1xuICAgICAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgICAgICBCYW5rTGlzdEl0ZW1Db21wb25lbnQoe2tleTogYi5pZCwgYmFuazogYn0pXG4gICAgICAgICAgICApXG4gICAgICAgIH0pO1xuXG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICBSZWFjdC5ET00uZGl2KG51bGwsIFxuICAgICAgICAgICAgICAgIFwiQmFua3NcIiwgXG4gICAgICAgICAgICAgICAgUmVhY3QuRE9NLnVsKHtjbGFzc05hbWU6IFwicm93XCJ9LCBcbiAgICAgICAgICAgICAgICAgICAgYmFua3NcbiAgICAgICAgICAgICAgICApLCBcbiAgICAgICAgICAgICAgICBSZWFjdC5ET00uaHIobnVsbClcbiAgICAgICAgICAgIClcbiAgICAgICAgKTtcbiAgICB9XG59KTtcbiIsIi8qKiBAanN4IFJlYWN0LkRPTSAqL1xuXG4vLyBDb25zdGFudHNcbnZhciBFdmVudHMgPSByZXF1aXJlKCcuLi9FdmVudHMnKTtcbnZhciBkZWJ1ZyA9IHJlcXVpcmUoJy4uL0hlbHBlcnMnKS5kZWJ1ZztcblxuLy8gR2xvYmFsIHZhcmlhYmxlc1xudmFyIHN0b3JlID0gcmVxdWlyZSgnLi4vc3RvcmUnKTtcbnZhciBmbHV4ID0gcmVxdWlyZSgnLi4vZmx1eC9kaXNwYXRjaGVyJyk7XG5cbnZhciBDYXRlZ29yeUxpc3QgPSBSZWFjdC5jcmVhdGVDbGFzcyh7ZGlzcGxheU5hbWU6ICdDYXRlZ29yeUxpc3QnLFxuXG4gICAgX2xpc3RlbmVyOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICBjYXRlZ29yaWVzOiBzdG9yZS5jYXRlZ29yaWVzXG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICBnZXRJbml0aWFsU3RhdGU6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgY2F0ZWdvcmllczogW11cbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICBjb21wb25lbnREaWRNb3VudDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHN0b3JlLm9uKEV2ZW50cy5DQVRFR09SSUVTX0xPQURFRCwgdGhpcy5fbGlzdGVuZXIpO1xuICAgIH0sXG5cbiAgICBjb21wb25lbnRXaWxsVW5tb3VudDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHN0b3JlLnJlbW92ZUxpc3RlbmVyKEV2ZW50cy5DQVRFR09SSUVTX0xPQURFRCwgdGhpcy5fbGlzdGVuZXIpO1xuICAgIH0sXG5cbiAgICByZW5kZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgaXRlbXMgPSB0aGlzLnN0YXRlLmNhdGVnb3JpZXMubWFwKGZ1bmN0aW9uIChjYXQpIHtcbiAgICAgICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICAgICAgUmVhY3QuRE9NLmxpKHtrZXk6IGNhdC5pZH0sIGNhdC50aXRsZSlcbiAgICAgICAgICAgICk7XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgUmVhY3QuRE9NLnVsKG51bGwsIGl0ZW1zKVxuICAgICAgICApO1xuICAgIH1cbn0pO1xuXG52YXIgQ2F0ZWdvcnlGb3JtID0gUmVhY3QuY3JlYXRlQ2xhc3Moe2Rpc3BsYXlOYW1lOiAnQ2F0ZWdvcnlGb3JtJyxcblxuICAgIG9uU3VibWl0OiBmdW5jdGlvbihlKSB7XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcblxuICAgICAgICB2YXIgbGFiZWwgPSB0aGlzLnJlZnMubGFiZWwuZ2V0RE9NTm9kZSgpLnZhbHVlLnRyaW0oKTtcbiAgICAgICAgaWYgKCFsYWJlbClcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcblxuICAgICAgICB2YXIgY2F0ZWdvcnkgPSB7XG4gICAgICAgICAgICB0aXRsZTogbGFiZWxcbiAgICAgICAgfTtcblxuICAgICAgICBmbHV4LmRpc3BhdGNoKHtcbiAgICAgICAgICAgIHR5cGU6IEV2ZW50cy5DQVRFR09SWV9DUkVBVEVELFxuICAgICAgICAgICAgY2F0ZWdvcnk6IGNhdGVnb3J5XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHRoaXMucmVmcy5sYWJlbC5nZXRET01Ob2RlKCkudmFsdWUgPSAnJztcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH0sXG5cbiAgICByZW5kZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgUmVhY3QuRE9NLmZvcm0oe29uU3VibWl0OiB0aGlzLm9uU3VibWl0fSwgXG4gICAgICAgICAgICAgICAgUmVhY3QuRE9NLmRpdih7Y2xhc3NOYW1lOiBcInJvd1wifSwgXG4gICAgICAgICAgICAgICAgICAgIFJlYWN0LkRPTS5kaXYoe2NsYXNzTmFtZTogXCJzbWFsbC0xMCBjb2x1bW5zXCJ9LCBcbiAgICAgICAgICAgICAgICAgICAgICAgIFJlYWN0LkRPTS5pbnB1dCh7dHlwZTogXCJ0ZXh0XCIsIHBsYWNlaG9sZGVyOiBcIkxhYmVsIG9mIG5ldyBjYXRlZ29yeVwiLCByZWY6IFwibGFiZWxcIn0pXG4gICAgICAgICAgICAgICAgICAgICksIFxuICAgICAgICAgICAgICAgICAgICBSZWFjdC5ET00uZGl2KHtjbGFzc05hbWU6IFwic21hbGwtMiBjb2x1bW5zXCJ9LCBcbiAgICAgICAgICAgICAgICAgICAgICAgIFJlYWN0LkRPTS5pbnB1dCh7dHlwZTogXCJzdWJtaXRcIiwgY2xhc3NOYW1lOiBcImJ1dHRvbiBwb3N0Zml4XCIsIHZhbHVlOiBcIlN1Ym1pdFwifSlcbiAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgIClcbiAgICAgICAgKVxuICAgIH1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtkaXNwbGF5TmFtZTogJ2V4cG9ydHMnLFxuXG4gICAgcmVuZGVyOiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIFJlYWN0LkRPTS5kaXYobnVsbCwgXG4gICAgICAgICAgICAgICAgUmVhY3QuRE9NLmgxKG51bGwsIFwiQ2F0ZWdvcmllc1wiKSwgXG4gICAgICAgICAgICAgICAgQ2F0ZWdvcnlMaXN0KG51bGwpLCBcbiAgICAgICAgICAgICAgICBSZWFjdC5ET00uaDMobnVsbCwgXCJBZGQgYSBjYXRlZ29yeVwiKSwgXG4gICAgICAgICAgICAgICAgQ2F0ZWdvcnlGb3JtKG51bGwpXG4gICAgICAgICAgICApXG4gICAgICAgICk7XG4gICAgfVxufSk7XG4iLCIvKiogQGpzeCBSZWFjdC5ET00gKi9cblxuLy8gQ29uc3RhbnRzXG52YXIgRXZlbnRzID0gcmVxdWlyZSgnLi4vRXZlbnRzJyk7XG52YXIgZGVidWcgPSByZXF1aXJlKCcuLi9IZWxwZXJzJykuZGVidWc7XG5cbi8vIEdsb2JhbCB2YXJpYWJsZXNcbnZhciBzdG9yZSA9IHJlcXVpcmUoJy4uL3N0b3JlJyk7XG5cbnZhciAkY2hhcnQgPSBudWxsO1xuXG5mdW5jdGlvbiBERUJVRyh0ZXh0KSB7XG4gICAgcmV0dXJuIGRlYnVnKCdDaGFydCBDb21wb25lbnQgLSAnICsgdGV4dCk7XG59XG5cbi8vIENvbXBvbmVudHNcbm1vZHVsZS5leHBvcnRzID0gUmVhY3QuY3JlYXRlQ2xhc3Moe2Rpc3BsYXlOYW1lOiAnZXhwb3J0cycsXG5cbiAgICBnZXRJbml0aWFsU3RhdGU6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgYWNjb3VudDogbnVsbCxcbiAgICAgICAgICAgIG9wZXJhdGlvbnM6IFtdLFxuICAgICAgICAgICAgY2F0ZWdvcmllczogW10sXG4gICAgICAgICAgICBraW5kOiAnYWxsJyAgICAgICAgIC8vIHdoaWNoIGNoYXJ0IGFyZSB3ZSBzaG93aW5nP1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIF9yZWxvYWQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICBERUJVRygncmVsb2FkJyk7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgYWNjb3VudDogICAgc3RvcmUuY3VycmVudEFjY291bnQsXG4gICAgICAgICAgICBvcGVyYXRpb25zOiBzdG9yZS5vcGVyYXRpb25zLFxuICAgICAgICAgICAgY2F0ZWdvcmllczogc3RvcmUuY2F0ZWdvcmllc1xuICAgICAgICB9LCB0aGlzLl9yZWRyYXcpO1xuICAgIH0sXG5cbiAgICBjb21wb25lbnREaWRNb3VudDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHN0b3JlLm9uKEV2ZW50cy5PUEVSQVRJT05TX0xPQURFRCwgdGhpcy5fcmVsb2FkKTtcbiAgICAgICAgc3RvcmUub24oRXZlbnRzLkNBVEVHT1JJRVNfTE9BREVELCB0aGlzLl9yZWxvYWQpO1xuICAgICAgICAkY2hhcnQgPSAkKCcjY2hhcnQnKTtcbiAgICB9LFxuXG4gICAgY29tcG9uZW50V2lsbFVubW91bnQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICBzdG9yZS5yZW1vdmVMaXN0ZW5lcihFdmVudHMuT1BFUkFUSU9OU19MT0FERUQsIHRoaXMuX3JlbG9hZCk7XG4gICAgICAgIHN0b3JlLnJlbW92ZUxpc3RlbmVyKEV2ZW50cy5DQVRFR09SSUVTX0xPQURFRCwgdGhpcy5fcmVsb2FkKTtcbiAgICB9LFxuXG4gICAgX3JlZHJhdzogZnVuY3Rpb24oKSB7XG4gICAgICAgIERFQlVHKCdyZWRyYXcnKTtcbiAgICAgICAgc3dpdGNoICh0aGlzLnN0YXRlLmtpbmQpIHtcbiAgICAgICAgICAgIGNhc2UgJ2FsbCc6XG4gICAgICAgICAgICAgICAgQ3JlYXRlQ2hhcnRBbGxCeUNhdGVnb3J5QnlNb250aCh0aGlzLnN0YXRlLm9wZXJhdGlvbnMpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnYmFsYW5jZSc6XG4gICAgICAgICAgICAgICAgQ3JlYXRlQ2hhcnRCYWxhbmNlKHRoaXMuc3RhdGUuYWNjb3VudCwgdGhpcy5zdGF0ZS5vcGVyYXRpb25zKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ2J5LWNhdGVnb3J5JzpcbiAgICAgICAgICAgICAgICB2YXIgdmFsID0gdGhpcy5yZWZzLnNlbGVjdC5nZXRET01Ob2RlKCkudmFsdWU7XG4gICAgICAgICAgICAgICAgQ3JlYXRlQ2hhcnRCeUNhdGVnb3J5QnlNb250aCh2YWwsIHRoaXMuc3RhdGUub3BlcmF0aW9ucyk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICdwb3MtbmVnJzpcbiAgICAgICAgICAgICAgICBDcmVhdGVDaGFydFBvc2l0aXZlTmVnYXRpdmUodGhpcy5zdGF0ZS5vcGVyYXRpb25zKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ2dsb2JhbC1wb3MtbmVnJzpcbiAgICAgICAgICAgICAgICBDcmVhdGVDaGFydFBvc2l0aXZlTmVnYXRpdmUoc3RvcmUuZ2V0T3BlcmF0aW9uc09mQWxsQWNjb3VudHMoKSk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgIGFzc2VydCh0cnVlID09PSBmYWxzZSwgJ3VuZXhwZWN0ZWQgdmFsdWUgaW4gX3JlZHJhdzogJyArIHRoaXMuc3RhdGUua2luZCk7XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgX2NoYW5nZUtpbmQ6IGZ1bmN0aW9uKGtpbmQpIHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICBraW5kOiBraW5kXG4gICAgICAgIH0sIHRoaXMuX3JlZHJhdyk7XG4gICAgfSxcbiAgICBfb25DbGlja0FsbDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoaXMuX2NoYW5nZUtpbmQoJ2FsbCcpO1xuICAgIH0sXG4gICAgX29uQ2xpY2tCeUNhdGVnb3J5OiBmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy5fY2hhbmdlS2luZCgnYnktY2F0ZWdvcnknKTtcbiAgICB9LFxuICAgIF9vbkNsaWNrQmFsYW5jZTogZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoaXMuX2NoYW5nZUtpbmQoJ2JhbGFuY2UnKTtcbiAgICB9LFxuICAgIF9vbkNsaWNrUG9zTmVnOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy5fY2hhbmdlS2luZCgncG9zLW5lZycpO1xuICAgIH0sXG4gICAgX29uQ2xpY2tHbG9iYWxQb3NOZWc6IGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLl9jaGFuZ2VLaW5kKCdnbG9iYWwtcG9zLW5lZycpO1xuICAgIH0sXG5cbiAgICByZW5kZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgY2F0ZWdvcnlPcHRpb25zID0gdGhpcy5zdGF0ZS5jYXRlZ29yaWVzLm1hcChmdW5jdGlvbiAoYykge1xuICAgICAgICAgICAgcmV0dXJuIChSZWFjdC5ET00ub3B0aW9uKHtrZXk6IGMuaWQsIHZhbHVlOiBjLmlkfSwgYy50aXRsZSkpO1xuICAgICAgICB9KTtcblxuICAgICAgICB2YXIgbWF5YmVTZWxlY3QgPSB0aGlzLnN0YXRlLmtpbmQgIT09ICdieS1jYXRlZ29yeScgPyAnJyA6XG4gICAgICAgICAgICBSZWFjdC5ET00uc2VsZWN0KHtvbkNoYW5nZTogdGhpcy5fcmVkcmF3LCByZWY6IFwic2VsZWN0XCJ9LCBcbiAgICAgICAgICAgICAgICBjYXRlZ29yeU9wdGlvbnNcbiAgICAgICAgICAgIClcblxuICAgICAgICByZXR1cm4gKFxuICAgICAgICBSZWFjdC5ET00uZGl2KG51bGwsIFxuICAgICAgICAgICAgUmVhY3QuRE9NLmgxKG51bGwsIFwiQ2hhcnRzXCIpLCBcblxuICAgICAgICAgICAgUmVhY3QuRE9NLmRpdihudWxsLCBcbiAgICAgICAgICAgICAgICBSZWFjdC5ET00uYnV0dG9uKHtvbkNsaWNrOiB0aGlzLl9vbkNsaWNrQWxsfSwgXCJBbGwgY2F0ZWdvcmllcyBieSBtb250aFwiKSwgXG4gICAgICAgICAgICAgICAgUmVhY3QuRE9NLmJ1dHRvbih7b25DbGljazogdGhpcy5fb25DbGlja0J5Q2F0ZWdvcnl9LCBcIkJ5IGNhdGVnb3J5IGJ5IG1vbnRoXCIpLCBcbiAgICAgICAgICAgICAgICBSZWFjdC5ET00uYnV0dG9uKHtvbkNsaWNrOiB0aGlzLl9vbkNsaWNrQmFsYW5jZX0sIFwiQmFsYW5jZSBvdmVyIHRpbWVcIiksIFxuICAgICAgICAgICAgICAgIFJlYWN0LkRPTS5idXR0b24oe29uQ2xpY2s6IHRoaXMuX29uQ2xpY2tQb3NOZWd9LCBcIklucyAvIG91dHMgb3ZlciB0aW1lICh0aGlzIGFjY291bnQpXCIpLCBcbiAgICAgICAgICAgICAgICBSZWFjdC5ET00uYnV0dG9uKHtvbkNsaWNrOiB0aGlzLl9vbkNsaWNrR2xvYmFsUG9zTmVnfSwgXCJJbnMgLyBvdXRzIG92ZXIgdGltZSAoYWxsIGFjY291bnRzKVwiKVxuICAgICAgICAgICAgKSwgXG5cbiAgICAgICAgICAgIG1heWJlU2VsZWN0LCBcblxuICAgICAgICAgICAgUmVhY3QuRE9NLmRpdih7aWQ6IFwiY2hhcnRcIn0pXG4gICAgICAgIClcbiAgICAgICAgKTtcbiAgICB9XG59KTtcblxuLy8gQ2hhcnRzXG5mdW5jdGlvbiBDcmVhdGVDaGFydEJ5Q2F0ZWdvcnlCeU1vbnRoKGNhdElkLCBvcGVyYXRpb25zKSB7XG4gICAgdmFyIG9wcyA9IG9wZXJhdGlvbnMuc2xpY2UoKS5maWx0ZXIoZnVuY3Rpb24ob3ApIHtcbiAgICAgICAgcmV0dXJuIG9wLmNhdGVnb3J5SWQgPT09IGNhdElkO1xuICAgIH0pO1xuICAgIENyZWF0ZUNoYXJ0QWxsQnlDYXRlZ29yeUJ5TW9udGgob3BzKTtcbn1cblxuZnVuY3Rpb24gQ3JlYXRlQ2hhcnRBbGxCeUNhdGVnb3J5QnlNb250aChvcGVyYXRpb25zKSB7XG5cbiAgICBmdW5jdGlvbiBkYXRla2V5KG9wKSB7XG4gICAgICAgIHZhciBkID0gb3AuZGF0ZTtcbiAgICAgICAgcmV0dXJuIGQuZ2V0RnVsbFllYXIoKSArICctJyArIGQuZ2V0TW9udGgoKTtcbiAgICB9XG5cbiAgICAvLyBDYXRlZ29yeSAtPiB7TW9udGggLT4gW0Ftb3VudHNdfVxuICAgIHZhciBtYXAgPSB7fTtcbiAgICAvLyBEYXRla2V5IC0+IERhdGVcbiAgICB2YXIgZGF0ZXNldCA9IHt9O1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgb3BlcmF0aW9ucy5sZW5ndGg7IGkrKykge1xuICAgICAgICB2YXIgb3AgPSBvcGVyYXRpb25zW2ldO1xuICAgICAgICB2YXIgYyA9IHN0b3JlLmNhdGVnb3J5VG9MYWJlbChvcC5jYXRlZ29yeUlkKTtcbiAgICAgICAgbWFwW2NdID0gbWFwW2NdIHx8IHt9O1xuXG4gICAgICAgIHZhciBkayA9IGRhdGVrZXkob3ApO1xuICAgICAgICBtYXBbY11bZGtdID0gbWFwW2NdW2RrXSB8fCBbXTtcbiAgICAgICAgbWFwW2NdW2RrXS5wdXNoKG9wLmFtb3VudCk7XG4gICAgICAgIGRhdGVzZXRbZGtdID0gK29wLmRhdGU7XG4gICAgfVxuXG4gICAgLy8gU29ydCBkYXRlIGluIGFzY2VuZGluZyBvcmRlcjogcHVzaCBhbGwgcGFpcnMgb2YgKGRhdGVrZXksIGRhdGUpIGluIGFuXG4gICAgLy8gYXJyYXkgYW5kIHNvcnQgdGhhdCBhcnJheSBieSB0aGUgc2Vjb25kIGVsZW1lbnQuIFRoZW4gcmVhZCB0aGF0IGFycmF5IGluXG4gICAgLy8gYXNjZW5kaW5nIG9yZGVyLlxuICAgIHZhciBkYXRlcyA9IFtdO1xuICAgIGZvciAodmFyIGRrIGluIGRhdGVzZXQpIHtcbiAgICAgICAgZGF0ZXMucHVzaChbZGssIGRhdGVzZXRbZGtdXSk7XG4gICAgfVxuICAgIGRhdGVzLnNvcnQoZnVuY3Rpb24oYSwgYikge1xuICAgICAgICByZXR1cm4gYVsxXSAtIGJbMV07XG4gICAgfSk7XG5cbiAgICB2YXIgc2VyaWVzID0gW107XG4gICAgZm9yICh2YXIgYyBpbiBtYXApIHtcbiAgICAgICAgdmFyIGRhdGEgPSBbXTtcblxuICAgICAgICBmb3IgKHZhciBqID0gMDsgaiA8IGRhdGVzLmxlbmd0aDsgaisrKSB7XG4gICAgICAgICAgICB2YXIgZGsgPSBkYXRlc1tqXVswXTtcbiAgICAgICAgICAgIG1hcFtjXVtka10gPSBtYXBbY11bZGtdIHx8IFtdO1xuICAgICAgICAgICAgZGF0YS5wdXNoKG1hcFtjXVtka10ucmVkdWNlKGZ1bmN0aW9uKGEsIGIpIHsgcmV0dXJuIGEgKyBiIH0sIDApKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBzZXJpZSA9IHtcbiAgICAgICAgICAgIG5hbWU6IGMsXG4gICAgICAgICAgICBkYXRhOiBkYXRhXG4gICAgICAgIH07XG5cbiAgICAgICAgc2VyaWVzLnB1c2goc2VyaWUpO1xuICAgIH1cblxuICAgIHZhciBjYXRlZ29yaWVzID0gW107XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBkYXRlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICB2YXIgZGF0ZSA9IG5ldyBEYXRlKGRhdGVzW2ldWzFdKTtcbiAgICAgICAgdmFyIHN0ciA9IGRhdGUudG9Mb2NhbGVEYXRlU3RyaW5nKC8qIHVzZSB0aGUgZGVmYXVsdCBsb2NhbGUgKi8gdW5kZWZpbmVkLCB7XG4gICAgICAgICAgICB5ZWFyOiAnbnVtZXJpYycsXG4gICAgICAgICAgICBtb250aDogJ2xvbmcnXG4gICAgICAgIH0pO1xuICAgICAgICBjYXRlZ29yaWVzLnB1c2goc3RyKTtcbiAgICB9XG5cbiAgICB2YXIgdGl0bGUgPSAnQnkgY2F0ZWdvcnknO1xuICAgIHZhciB5QXhpc0xlZ2VuZCA9ICdBbW91bnQnO1xuXG4gICAgJGNoYXJ0LmhpZ2hjaGFydHMoe1xuICAgICAgICBjaGFydDoge1xuICAgICAgICAgICAgdHlwZTogJ2NvbHVtbidcbiAgICAgICAgfSxcbiAgICAgICAgdGl0bGU6IHtcbiAgICAgICAgICAgIHRleHQ6IHRpdGxlXG4gICAgICAgIH0sXG4gICAgICAgIHhBeGlzOiB7XG4gICAgICAgICAgICBjYXRlZ29yaWVzOiBjYXRlZ29yaWVzXG4gICAgICAgIH0sXG4gICAgICAgIHlBeGlzOiB7XG4gICAgICAgICAgICB0aXRsZToge1xuICAgICAgICAgICAgICAgIHRleHQ6IHlBeGlzTGVnZW5kXG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIHRvb2x0aXA6IHtcbiAgICAgICAgICAgIGhlYWRlckZvcm1hdDogJzxzcGFuIHN0eWxlPVwiZm9udC1zaXplOjEwcHhcIj57cG9pbnQua2V5fTwvc3Bhbj48dGFibGU+JyxcbiAgICAgICAgICAgIHBvaW50Rm9ybWF0OiAnPHRyPjx0ZCBzdHlsZT1cImNvbG9yOntzZXJpZXMuY29sb3J9O3BhZGRpbmc6MFwiPntzZXJpZXMubmFtZX06IDwvdGQ+JyArXG4gICAgICAgICAgICAnPHRkIHN0eWxlPVwicGFkZGluZzowXCI+PGI+e3BvaW50Lnk6LjFmfSBldXI8L2I+PC90ZD48L3RyPicsXG4gICAgICAgICAgICBmb290ZXJGb3JtYXQ6ICc8L3RhYmxlPicsXG4gICAgICAgICAgICBzaGFyZWQ6IHRydWUsXG4gICAgICAgICAgICB1c2VIVE1MOiB0cnVlXG4gICAgICAgIH0sXG4gICAgICAgIHBsb3RPcHRpb25zOiB7XG4gICAgICAgICAgICBjb2x1bW46IHtcbiAgICAgICAgICAgICAgICBwb2ludFBhZGRpbmc6IDAuMixcbiAgICAgICAgICAgICAgICBib3JkZXJXaWR0aDogMFxuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICBzZXJpZXM6IHNlcmllc1xuICAgIH0pO1xufVxuXG5mdW5jdGlvbiBDcmVhdGVDaGFydEJhbGFuY2UoYWNjb3VudCwgb3BlcmF0aW9ucykge1xuXG4gICAgdmFyIG9wcyA9IG9wZXJhdGlvbnMuc29ydChmdW5jdGlvbiAoYSxiKSB7IHJldHVybiArYS5kYXRlIC0gK2IuZGF0ZSB9KTtcblxuICAgIC8vIERhdGUgKGRheSkgLT4gc3VtIGFtb3VudHMgb2YgdGhpcyBkYXkgKHNjYWxhcilcbiAgICB2YXIgb3BtYXAgPSB7fTtcbiAgICBvcHMubWFwKGZ1bmN0aW9uKG8pIHtcbiAgICAgICAgLy8gQ29udmVydCBkYXRlIGludG8gYSBudW1iZXI6IGl0J3MgZ29pbmcgdG8gYmUgY29udmVydGVkIGludG8gYSBzdHJpbmdcbiAgICAgICAgLy8gd2hlbiB1c2VkIGFzIGEga2V5LlxuICAgICAgICB2YXIgYSA9IG8uYW1vdW50O1xuICAgICAgICB2YXIgZCA9ICtvLmRhdGU7XG4gICAgICAgIG9wbWFwW2RdID0gb3BtYXBbZF0gfHwgMDtcbiAgICAgICAgb3BtYXBbZF0gKz0gYTtcbiAgICB9KVxuXG4gICAgdmFyIGJhbGFuY2UgPSBhY2NvdW50LmluaXRpYWxBbW91bnQ7XG4gICAgdmFyIGJhbCA9IFtdO1xuICAgIGZvciAodmFyIGRhdGUgaW4gb3BtYXApIHtcbiAgICAgICAgLy8gZGF0ZSBpcyBhIHN0cmluZyBub3c6IGNvbnZlcnQgaXQgYmFjayB0byBhIG51bWJlciBmb3IgaGlnaGNoYXJ0cy5cbiAgICAgICAgYmFsYW5jZSArPSBvcG1hcFtkYXRlXTtcbiAgICAgICAgYmFsLnB1c2goWytkYXRlLCBiYWxhbmNlXSk7XG4gICAgfVxuXG4gICAgLy8gQ3JlYXRlIHRoZSBjaGFydFxuICAgICRjaGFydC5oaWdoY2hhcnRzKCdTdG9ja0NoYXJ0Jywge1xuICAgICAgICByYW5nZVNlbGVjdG9yIDoge1xuICAgICAgICAgICAgc2VsZWN0ZWQgOiAxXG4gICAgICAgIH0sXG5cbiAgICAgICAgdGl0bGUgOiB7XG4gICAgICAgICAgICB0ZXh0IDogJ0JhbGFuY2UnXG4gICAgICAgIH0sXG5cbiAgICAgICAgc2VyaWVzIDogW3tcbiAgICAgICAgICAgIG5hbWUgOiAnQmFsYW5jZScsXG4gICAgICAgICAgICBkYXRhIDogYmFsLFxuICAgICAgICAgICAgdG9vbHRpcDogeyB2YWx1ZURlY2ltYWxzOiAyIH1cbiAgICAgICAgfV1cbiAgICB9KTtcbn1cblxuZnVuY3Rpb24gQ3JlYXRlQ2hhcnRQb3NpdGl2ZU5lZ2F0aXZlKG9wZXJhdGlvbnMpIHtcblxuICAgIGZ1bmN0aW9uIGRhdGVrZXkob3ApIHtcbiAgICAgICAgdmFyIGQgPSBvcC5kYXRlO1xuICAgICAgICByZXR1cm4gZC5nZXRGdWxsWWVhcigpICsgJy0nICsgZC5nZXRNb250aCgpO1xuICAgIH1cblxuICAgIGNvbnN0IFBPUyA9IDAsIE5FRyA9IDEsIEJBTCA9IDI7XG5cbiAgICAvLyBNb250aCAtPiBbUG9zaXRpdmUgYW1vdW50LCBOZWdhdGl2ZSBhbW91bnQsIERpZmZdXG4gICAgdmFyIG1hcCA9IHt9O1xuICAgIC8vIERhdGVrZXkgLT4gRGF0ZVxuICAgIHZhciBkYXRlc2V0ID0ge307XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBvcGVyYXRpb25zLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHZhciBvcCA9IG9wZXJhdGlvbnNbaV07XG4gICAgICAgIHZhciBkayA9IGRhdGVrZXkob3ApO1xuICAgICAgICBtYXBbZGtdID0gbWFwW2RrXSB8fCBbMCwgMCwgMF07XG5cbiAgICAgICAgbWFwW2RrXVtQT1NdICs9IG9wLmFtb3VudCA+IDAgPyBvcC5hbW91bnQgOiAwO1xuICAgICAgICBtYXBbZGtdW05FR10gKz0gb3AuYW1vdW50IDwgMCA/IC1vcC5hbW91bnQgOiAwO1xuICAgICAgICBtYXBbZGtdW0JBTF0gKz0gb3AuYW1vdW50O1xuXG4gICAgICAgIGRhdGVzZXRbZGtdID0gK29wLmRhdGU7XG4gICAgfVxuXG4gICAgLy8gU29ydCBkYXRlIGluIGFzY2VuZGluZyBvcmRlcjogcHVzaCBhbGwgcGFpcnMgb2YgKGRhdGVrZXksIGRhdGUpIGluIGFuXG4gICAgLy8gYXJyYXkgYW5kIHNvcnQgdGhhdCBhcnJheSBieSB0aGUgc2Vjb25kIGVsZW1lbnQuIFRoZW4gcmVhZCB0aGF0IGFycmF5IGluXG4gICAgLy8gYXNjZW5kaW5nIG9yZGVyLlxuICAgIHZhciBkYXRlcyA9IFtdO1xuICAgIGZvciAodmFyIGRrIGluIGRhdGVzZXQpIHtcbiAgICAgICAgZGF0ZXMucHVzaChbZGssIGRhdGVzZXRbZGtdXSk7XG4gICAgfVxuICAgIGRhdGVzLnNvcnQoZnVuY3Rpb24oYSwgYikge1xuICAgICAgICByZXR1cm4gYVsxXSAtIGJbMV07XG4gICAgfSk7XG5cbiAgICB2YXIgc2VyaWVzID0gW107XG4gICAgZnVuY3Rpb24gYWRkU2VyaWUobmFtZSwgbWFwSW5kZXgpIHtcbiAgICAgICAgdmFyIGRhdGEgPSBbXTtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBkYXRlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgdmFyIGRrID0gZGF0ZXNbaV1bMF07XG4gICAgICAgICAgICBkYXRhLnB1c2gobWFwW2RrXVttYXBJbmRleF0pO1xuICAgICAgICB9XG4gICAgICAgIHZhciBzZXJpZSA9IHtcbiAgICAgICAgICAgIG5hbWU6IG5hbWUsXG4gICAgICAgICAgICBkYXRhOiBkYXRhXG4gICAgICAgIH07XG4gICAgICAgIHNlcmllcy5wdXNoKHNlcmllKTtcbiAgICB9XG5cbiAgICBhZGRTZXJpZSgnUG9zaXRpdmUnLCBQT1MpO1xuICAgIGFkZFNlcmllKCdOZWdhdGl2ZScsIE5FRyk7XG4gICAgYWRkU2VyaWUoJ0JhbGFuY2UnLCBCQUwpO1xuXG4gICAgdmFyIGNhdGVnb3JpZXMgPSBbXTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGRhdGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHZhciBkYXRlID0gbmV3IERhdGUoZGF0ZXNbaV1bMV0pO1xuICAgICAgICB2YXIgc3RyID0gZGF0ZS50b0xvY2FsZURhdGVTdHJpbmcoLyogdXNlIHRoZSBkZWZhdWx0IGxvY2FsZSAqLyB1bmRlZmluZWQsIHtcbiAgICAgICAgICAgIHllYXI6ICdudW1lcmljJyxcbiAgICAgICAgICAgIG1vbnRoOiAnbG9uZydcbiAgICAgICAgfSk7XG4gICAgICAgIGNhdGVnb3JpZXMucHVzaChzdHIpO1xuICAgIH1cblxuICAgIHZhciB0aXRsZSA9ICdQb3NpdGl2ZSAvIE5lZ2F0aXZlIG92ZXIgdGltZSc7XG4gICAgdmFyIHlBeGlzTGVnZW5kID0gJ0Ftb3VudCc7XG5cbiAgICAkY2hhcnQuaGlnaGNoYXJ0cyh7XG4gICAgICAgIGNoYXJ0OiB7XG4gICAgICAgICAgICB0eXBlOiAnY29sdW1uJ1xuICAgICAgICB9LFxuICAgICAgICB0aXRsZToge1xuICAgICAgICAgICAgdGV4dDogdGl0bGVcbiAgICAgICAgfSxcbiAgICAgICAgeEF4aXM6IHtcbiAgICAgICAgICAgIGNhdGVnb3JpZXM6IGNhdGVnb3JpZXNcbiAgICAgICAgfSxcbiAgICAgICAgeUF4aXM6IHtcbiAgICAgICAgICAgIHRpdGxlOiB7XG4gICAgICAgICAgICAgICAgdGV4dDogeUF4aXNMZWdlbmRcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgdG9vbHRpcDoge1xuICAgICAgICAgICAgaGVhZGVyRm9ybWF0OiAnPHNwYW4gc3R5bGU9XCJmb250LXNpemU6MTBweFwiPntwb2ludC5rZXl9PC9zcGFuPjx0YWJsZT4nLFxuICAgICAgICAgICAgcG9pbnRGb3JtYXQ6ICc8dHI+PHRkIHN0eWxlPVwiY29sb3I6e3Nlcmllcy5jb2xvcn07cGFkZGluZzowXCI+e3Nlcmllcy5uYW1lfTogPC90ZD4nICtcbiAgICAgICAgICAgICc8dGQgc3R5bGU9XCJwYWRkaW5nOjBcIj48Yj57cG9pbnQueTouMWZ9IGV1cjwvYj48L3RkPjwvdHI+JyxcbiAgICAgICAgICAgIGZvb3RlckZvcm1hdDogJzwvdGFibGU+JyxcbiAgICAgICAgICAgIHNoYXJlZDogdHJ1ZSxcbiAgICAgICAgICAgIHVzZUhUTUw6IHRydWVcbiAgICAgICAgfSxcbiAgICAgICAgcGxvdE9wdGlvbnM6IHtcbiAgICAgICAgICAgIGNvbHVtbjoge1xuICAgICAgICAgICAgICAgIHBvaW50UGFkZGluZzogMC4yLFxuICAgICAgICAgICAgICAgIGJvcmRlcldpZHRoOiAwXG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIHNlcmllczogc2VyaWVzXG4gICAgfSk7XG59XG5cbiIsIi8qKiBAanN4IFJlYWN0LkRPTSAqL1xuXG4vLyBDb25zdGFudHNcbnZhciBFdmVudHMgPSByZXF1aXJlKCcuLi9FdmVudHMnKTtcbnZhciBkZWJ1ZyA9IHJlcXVpcmUoJy4uL0hlbHBlcnMnKS5kZWJ1ZztcblxuLy8gR2xvYmFsIHZhcmlhYmxlc1xudmFyIHN0b3JlID0gcmVxdWlyZSgnLi4vc3RvcmUnKTtcbnZhciBmbHV4ID0gcmVxdWlyZSgnLi4vZmx1eC9kaXNwYXRjaGVyJyk7XG5cbi8vIENvbXBvbmVudHNcbnZhciBDYXRlZ29yeVNlbGVjdENvbXBvbmVudCA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtkaXNwbGF5TmFtZTogJ0NhdGVnb3J5U2VsZWN0Q29tcG9uZW50JyxcblxuICAgIGdldEluaXRpYWxTdGF0ZTogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB7IGVkaXRNb2RlOiBmYWxzZSB9XG4gICAgfSxcblxuICAgIGRvbTogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnJlZnMuY2F0LmdldERPTU5vZGUoKTtcbiAgICB9LFxuXG4gICAgb25DaGFuZ2U6IGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgdmFyIHNlbGVjdGVkSWQgPSB0aGlzLmRvbSgpLnZhbHVlO1xuICAgICAgICBmbHV4LmRpc3BhdGNoKHtcbiAgICAgICAgICAgIHR5cGU6IEV2ZW50cy5PUEVSQVRJT05fQ0FURUdPUllfQ0hBTkdFRCxcbiAgICAgICAgICAgIG9wZXJhdGlvbklkOiB0aGlzLnByb3BzLm9wZXJhdGlvbi5pZCxcbiAgICAgICAgICAgIGNhdGVnb3J5SWQ6IHNlbGVjdGVkSWRcbiAgICAgICAgfSk7XG4gICAgICAgIC8vIEJlIG9wdGltaXN0aWNcbiAgICAgICAgdGhpcy5wcm9wcy5vcGVyYXRpb24uY2F0ZWdvcnlJZCA9IHNlbGVjdGVkSWQ7XG4gICAgfSxcblxuICAgIHN3aXRjaFRvRWRpdE1vZGU6IGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHsgZWRpdE1vZGU6IHRydWUgfSwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB0aGlzLmRvbSgpLmZvY3VzKCk7XG4gICAgICAgIH0pO1xuICAgIH0sXG4gICAgc3dpdGNoVG9TdGF0aWNNb2RlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IGVkaXRNb2RlOiBmYWxzZSB9KTtcbiAgICB9LFxuXG4gICAgcmVuZGVyOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIHNlbGVjdGVkSWQgPSB0aGlzLnByb3BzLm9wZXJhdGlvbi5jYXRlZ29yeUlkO1xuICAgICAgICB2YXIgbGFiZWwgPSBzdG9yZS5jYXRlZ29yeVRvTGFiZWwoc2VsZWN0ZWRJZCk7XG5cbiAgICAgICAgaWYgKCF0aGlzLnN0YXRlLmVkaXRNb2RlKSB7XG4gICAgICAgICAgICByZXR1cm4gKFJlYWN0LkRPTS5zcGFuKHtvbkNsaWNrOiB0aGlzLnN3aXRjaFRvRWRpdE1vZGV9LCBsYWJlbCkpXG4gICAgICAgIH1cblxuICAgICAgICAvLyBPbiB0aGUgZmlyc3QgY2xpY2sgaW4gZWRpdCBtb2RlLCBjYXRlZ29yaWVzIGFyZSBhbHJlYWR5IGxvYWRlZC5cbiAgICAgICAgLy8gRXZlcnkgdGltZSB3ZSByZWxvYWQgY2F0ZWdvcmllcywgd2UgY2FuJ3QgYmUgaW4gZWRpdCBtb2RlLCBzbyB3ZSBjYW5cbiAgICAgICAgLy8ganVzdCBzeW5jaHJvbm91c2x5IHJldHJpZXZlIGNhdGVnb3JpZXMgYW5kIG5vdCBuZWVkIHRvIHN1YnNjcmliZSB0b1xuICAgICAgICAvLyB0aGVtLlxuICAgICAgICB2YXIgb3B0aW9ucyA9IHN0b3JlLmNhdGVnb3JpZXMubWFwKGZ1bmN0aW9uIChjKSB7XG4gICAgICAgICAgICByZXR1cm4gKFJlYWN0LkRPTS5vcHRpb24oe2tleTogYy5pZCwgdmFsdWU6IGMuaWR9LCBjLnRpdGxlKSlcbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIFJlYWN0LkRPTS5zZWxlY3Qoe29uQ2hhbmdlOiB0aGlzLm9uQ2hhbmdlLCBvbkJsdXI6IHRoaXMuc3dpdGNoVG9TdGF0aWNNb2RlLCBkZWZhdWx0VmFsdWU6IHNlbGVjdGVkSWQsIHJlZjogXCJjYXRcIn0sIFxuICAgICAgICAgICAgICAgIG9wdGlvbnNcbiAgICAgICAgICAgIClcbiAgICAgICAgKTtcbiAgICB9XG59KTtcblxudmFyIE9wZXJhdGlvbkNvbXBvbmVudCA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtkaXNwbGF5TmFtZTogJ09wZXJhdGlvbkNvbXBvbmVudCcsXG5cbiAgICBnZXRJbml0aWFsU3RhdGU6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4geyBtb3VzZU9uOiBmYWxzZSB9O1xuICAgIH0sXG5cbiAgICBvbk1vdXNlRW50ZXI6IGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IG1vdXNlT246IHRydWUgfSlcbiAgICB9LFxuICAgIG9uTW91c2VMZWF2ZTogZnVuY3Rpb24oZSkge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHsgbW91c2VPbjogZmFsc2UgfSlcbiAgICB9LFxuXG4gICAgcmVuZGVyOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIG9wID0gdGhpcy5wcm9wcy5vcGVyYXRpb247XG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICBSZWFjdC5ET00udHIobnVsbCwgXG4gICAgICAgICAgICAgICAgUmVhY3QuRE9NLnRkKG51bGwsIG9wLmRhdGUudG9Mb2NhbGVEYXRlU3RyaW5nKCkpLCBcbiAgICAgICAgICAgICAgICBSZWFjdC5ET00udGQoe29uTW91c2VFbnRlcjogdGhpcy5vbk1vdXNlRW50ZXIsIG9uTW91c2VMZWF2ZTogdGhpcy5vbk1vdXNlTGVhdmV9LCB0aGlzLnN0YXRlLm1vdXNlT24gPyBvcC5yYXcgOiBvcC50aXRsZSksIFxuICAgICAgICAgICAgICAgIFJlYWN0LkRPTS50ZChudWxsLCBvcC5hbW91bnQpLCBcbiAgICAgICAgICAgICAgICBSZWFjdC5ET00udGQobnVsbCwgXG4gICAgICAgICAgICAgICAgICAgIENhdGVnb3J5U2VsZWN0Q29tcG9uZW50KHtvcGVyYXRpb246IG9wfSlcbiAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICApXG4gICAgICAgICk7XG4gICAgfVxufSk7XG5cbnZhciBPcGVyYXRpb25zQ29tcG9uZW50ID0gbW9kdWxlLmV4cG9ydHMgPSBSZWFjdC5jcmVhdGVDbGFzcyh7ZGlzcGxheU5hbWU6ICdleHBvcnRzJyxcblxuICAgIGdldEluaXRpYWxTdGF0ZTogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBhY2NvdW50OiB7aW5pdGlhbEFtb3VudDogMH0sXG4gICAgICAgICAgICBvcGVyYXRpb25zOiBbXVxuICAgICAgICB9XG4gICAgfSxcblxuICAgIF9jYjogZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgYWNjb3VudDogc3RvcmUuY3VycmVudEFjY291bnQsXG4gICAgICAgICAgICBvcGVyYXRpb25zOiBzdG9yZS5vcGVyYXRpb25zXG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICBjb21wb25lbnREaWRNb3VudDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHN0b3JlLm9uKEV2ZW50cy5PUEVSQVRJT05TX0xPQURFRCwgdGhpcy5fY2IpO1xuICAgIH0sXG5cbiAgICBjb21wb25lbnRXaWxsVW5tb3VudDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHN0b3JlLnJlbW92ZUxpc3RlbmVyKEV2ZW50cy5PUEVSQVRJT05TX0xPQURFRCwgdGhpcy5fY2IpO1xuICAgIH0sXG5cbiAgICBnZXRUb3RhbDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciB0b3RhbCA9IHRoaXMuc3RhdGUub3BlcmF0aW9ucy5yZWR1Y2UoZnVuY3Rpb24oYSxiKSB7IHJldHVybiBhICsgYi5hbW91bnQgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnN0YXRlLmFjY291bnQuaW5pdGlhbEFtb3VudCk7XG4gICAgICAgIHJldHVybiAodG90YWwgKiAxMDAgfCAwKSAvIDEwMDtcbiAgICB9LFxuXG4gICAgb25SZXRyaWV2ZU9wZXJhdGlvbnNfOiBmdW5jdGlvbigpIHtcbiAgICAgICAgZmx1eC5kaXNwYXRjaCh7XG4gICAgICAgICAgICB0eXBlOiBFdmVudHMuUkVUUklFVkVfT1BFUkFUSU9OU19RVUVSSUVEXG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICByZW5kZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgb3BzID0gdGhpcy5zdGF0ZS5vcGVyYXRpb25zLm1hcChmdW5jdGlvbiAobykge1xuICAgICAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgICAgICBPcGVyYXRpb25Db21wb25lbnQoe2tleTogby5pZCwgb3BlcmF0aW9uOiBvfSlcbiAgICAgICAgICAgICk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICBSZWFjdC5ET00uZGl2KG51bGwsIFxuICAgICAgICAgICAgICAgIFJlYWN0LkRPTS5oMShudWxsLCBcIk9wZXJhdGlvbnNcIiksIFxuICAgICAgICAgICAgICAgIFJlYWN0LkRPTS5kaXYobnVsbCwgXG4gICAgICAgICAgICAgICAgICAgIFJlYWN0LkRPTS5oMyhudWxsLCBcIlRvdGFsOiBcIiwgdGhpcy5nZXRUb3RhbCgpKSwgXG4gICAgICAgICAgICAgICAgICAgIFJlYWN0LkRPTS5hKHtvbkNsaWNrOiB0aGlzLm9uUmV0cmlldmVPcGVyYXRpb25zX30sIFwiUmV0cmlldmUgb3BlcmF0aW9uc1wiKVxuICAgICAgICAgICAgICAgICksIFxuICAgICAgICAgICAgICAgIFJlYWN0LkRPTS50YWJsZShudWxsLCBcbiAgICAgICAgICAgICAgICAgICAgUmVhY3QuRE9NLnRoZWFkKG51bGwsIFxuICAgICAgICAgICAgICAgICAgICAgICAgUmVhY3QuRE9NLnRyKG51bGwsIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFJlYWN0LkRPTS50aChudWxsLCBcIkRhdGVcIiksIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFJlYWN0LkRPTS50aChudWxsLCBcIlRpdGxlXCIpLCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBSZWFjdC5ET00udGgobnVsbCwgXCJBbW91bnRcIiksIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFJlYWN0LkRPTS50aChudWxsLCBcIkNhdGVnb3J5XCIpXG4gICAgICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgICksIFxuICAgICAgICAgICAgICAgICAgICBSZWFjdC5ET00udGJvZHkobnVsbCwgXG4gICAgICAgICAgICAgICAgICAgICAgICBvcHNcbiAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgIClcbiAgICAgICAgKTtcbiAgICB9XG59KTtcblxuIiwiLyoqIEBqc3ggUmVhY3QuRE9NICovXG5cbi8vIENvbnN0YW50c1xudmFyIEV2ZW50cyA9IHJlcXVpcmUoJy4uL0V2ZW50cycpO1xudmFyIGRlYnVnID0gcmVxdWlyZSgnLi4vSGVscGVycycpLmRlYnVnO1xuXG4vLyBHbG9iYWwgdmFyaWFibGVzXG52YXIgc3RvcmUgPSByZXF1aXJlKCcuLi9zdG9yZScpO1xudmFyIGZsdXggPSByZXF1aXJlKCcuLi9mbHV4L2Rpc3BhdGNoZXInKTtcblxuZnVuY3Rpb24gREVCVUcodGV4dCkge1xuICAgIHJldHVybiBkZWJ1ZygnU2ltaWxhcml0eSBDb21wb25lbnQgLSAnICsgdGV4dCk7XG59XG5cbi8vIEFsZ29yaXRobVxuXG4vLyBUT0RPIG1ha2UgdGhpcyB0aHJlc2hvbGQgYSBwYXJhbWV0ZXJcbmNvbnN0IFRJTUVfU0lNSUxBUl9USFJFU0hPTEQgPSAxMDAwICogNjAgKiA2MCAqIDI0ICogMjsgLy8gNDggaG91cnNcbmZ1bmN0aW9uIGZpbmRSZWR1bmRhbnRQYWlycyhvcGVyYXRpb25zKSB7XG4gICAgREVCVUcoJ1J1bm5pbmcgZmluZFJlZHVuZGFudFBhaXJzIGFsZ29yaXRobS4uLicpO1xuICAgIERFQlVHKCdJbnB1dDogJyArIG9wZXJhdGlvbnMubGVuZ3RoICsgJyBvcGVyYXRpb25zJyk7XG4gICAgdmFyIHNpbWlsYXIgPSBbXTtcblxuICAgIGZ1bmN0aW9uIGFyZVNpbWlsYXJPcGVyYXRpb25zKGEsIGIpIHtcbiAgICAgICAgaWYgKGEuYW1vdW50ICE9IGIuYW1vdW50KVxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB2YXIgZGF0ZWRpZmYgPSBNYXRoLmFicygrYS5kYXRlIC0gK2IuZGF0ZSk7XG4gICAgICAgIHJldHVybiBkYXRlZGlmZiA8PSBUSU1FX1NJTUlMQVJfVEhSRVNIT0xEO1xuICAgIH1cblxuICAgIC8vIE8obiBsb2cgbilcbiAgICBmdW5jdGlvbiBzb3J0Q3JpdGVyaWEoYSxiKSB7IHJldHVybiBhLmFtb3VudCAtIGIuYW1vdW50OyB9XG4gICAgdmFyIHNvcnRlZCA9IG9wZXJhdGlvbnMuc2xpY2UoKS5zb3J0KHNvcnRDcml0ZXJpYSk7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBvcGVyYXRpb25zLmxlbmd0aDsgKytpKSB7XG4gICAgICAgIGlmIChpICsgMSA+PSBvcGVyYXRpb25zLmxlbmd0aClcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuXG4gICAgICAgIHZhciBvcCA9IHNvcnRlZFtpXTtcbiAgICAgICAgdmFyIG5leHQgPSBzb3J0ZWRbaSsxXTtcbiAgICAgICAgaWYgKGFyZVNpbWlsYXJPcGVyYXRpb25zKG9wLCBuZXh0KSlcbiAgICAgICAgICAgIHNpbWlsYXIucHVzaChbb3AsIG5leHRdKTtcbiAgICB9XG5cbiAgICBERUJVRyhzaW1pbGFyLmxlbmd0aCArICcgcGFpcnMgb2Ygc2ltaWxhciBvcGVyYXRpb25zIGZvdW5kJyk7XG4gICAgcmV0dXJuIHNpbWlsYXI7XG59XG5cbi8vIENvbXBvbmVudHNcbnZhciBTaW1pbGFyaXR5SXRlbUNvbXBvbmVudCA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtkaXNwbGF5TmFtZTogJ1NpbWlsYXJpdHlJdGVtQ29tcG9uZW50JyxcblxuICAgIF9kZWxldGVPcGVyYXRpb246IGZ1bmN0aW9uKCkge1xuICAgICAgICBmbHV4LmRpc3BhdGNoKHtcbiAgICAgICAgICAgIHR5cGU6IEV2ZW50cy5ERUxFVEVfT1BFUkFUSU9OLFxuICAgICAgICAgICAgb3BlcmF0aW9uOiB0aGlzLnByb3BzLm9wZXJhdGlvblxuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgcmVuZGVyOiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIFJlYWN0LkRPTS50cihudWxsLCBcbiAgICAgICAgICAgICAgICBSZWFjdC5ET00udGQobnVsbCwgdGhpcy5wcm9wcy5vcGVyYXRpb24uZGF0ZS50b1N0cmluZygpKSwgXG4gICAgICAgICAgICAgICAgUmVhY3QuRE9NLnRkKG51bGwsIHRoaXMucHJvcHMub3BlcmF0aW9uLnRpdGxlKSwgXG4gICAgICAgICAgICAgICAgUmVhY3QuRE9NLnRkKG51bGwsIHRoaXMucHJvcHMub3BlcmF0aW9uLmFtb3VudCksIFxuICAgICAgICAgICAgICAgIFJlYWN0LkRPTS50ZChudWxsLCBSZWFjdC5ET00uYSh7b25DbGljazogdGhpcy5fZGVsZXRlT3BlcmF0aW9ufSwgXCJ4XCIpKVxuICAgICAgICAgICAgKVxuICAgICAgICApO1xuICAgIH1cbn0pO1xuXG52YXIgU2ltaWxhcml0eVBhaXJDb21wb25lbnQgPSBSZWFjdC5jcmVhdGVDbGFzcyh7ZGlzcGxheU5hbWU6ICdTaW1pbGFyaXR5UGFpckNvbXBvbmVudCcsXG5cbiAgICByZW5kZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgUmVhY3QuRE9NLnRhYmxlKG51bGwsIFxuICAgICAgICAgICAgICAgIFNpbWlsYXJpdHlJdGVtQ29tcG9uZW50KHtvcGVyYXRpb246IHRoaXMucHJvcHMuYX0pLCBcbiAgICAgICAgICAgICAgICBTaW1pbGFyaXR5SXRlbUNvbXBvbmVudCh7b3BlcmF0aW9uOiB0aGlzLnByb3BzLmJ9KVxuICAgICAgICAgICAgKVxuICAgICAgICApO1xuICAgIH1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtkaXNwbGF5TmFtZTogJ2V4cG9ydHMnLFxuXG4gICAgZ2V0SW5pdGlhbFN0YXRlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHBhaXJzOiBbXVxuICAgICAgICB9O1xuICAgIH0sXG5cbiAgICBfY2I6IGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgIHBhaXJzOiBmaW5kUmVkdW5kYW50UGFpcnMoc3RvcmUub3BlcmF0aW9ucylcbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIGNvbXBvbmVudERpZE1vdW50OiBmdW5jdGlvbigpIHtcbiAgICAgICAgc3RvcmUub24oRXZlbnRzLk9QRVJBVElPTlNfTE9BREVELCB0aGlzLl9jYik7XG4gICAgfSxcblxuICAgIGNvbXBvbmVudFdpbGxVbm1vdW50OiBmdW5jdGlvbigpIHtcbiAgICAgICAgc3RvcmUucmVtb3ZlTGlzdGVuZXIoRXZlbnRzLk9QRVJBVElPTlNfTE9BREVELCB0aGlzLl9jYik7XG4gICAgfSxcblxuICAgIHJlbmRlcjogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBwYWlycyA9IHRoaXMuc3RhdGUucGFpcnM7XG4gICAgICAgIGlmIChwYWlycy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICAgICAgUmVhY3QuRE9NLmRpdihudWxsLCBcIk5vIHNpbWlsYXIgb3BlcmF0aW9ucyBmb3VuZC5cIilcbiAgICAgICAgICAgIClcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBzaW0gPSBwYWlycy5tYXAoZnVuY3Rpb24gKHApIHtcbiAgICAgICAgICAgIHZhciBrZXkgPSBwWzBdLmlkLnRvU3RyaW5nKCkgKyBwWzFdLmlkLnRvU3RyaW5nKCk7XG4gICAgICAgICAgICByZXR1cm4gKFNpbWlsYXJpdHlQYWlyQ29tcG9uZW50KHtrZXk6IGtleSwgYTogcFswXSwgYjogcFsxXX0pKVxuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIFJlYWN0LkRPTS5kaXYobnVsbCwgXG4gICAgICAgICAgICAgICAgUmVhY3QuRE9NLmgxKG51bGwsIFwiU2ltaWxhcml0aWVzXCIpLCBcbiAgICAgICAgICAgICAgICBSZWFjdC5ET00uZGl2KG51bGwsIFxuICAgICAgICAgICAgICAgICAgICBzaW1cbiAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICApKVxuICAgIH1cbn0pO1xuXG4iLCIvKlxuICogQ29weXJpZ2h0IChjKSAyMDE0LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBCU0Qtc3R5bGUgbGljZW5zZSBmb3VuZCBpbiB0aGVcbiAqIExJQ0VOU0UgZmlsZSBpbiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS4gQW4gYWRkaXRpb25hbCBncmFudFxuICogb2YgcGF0ZW50IHJpZ2h0cyBjYW4gYmUgZm91bmQgaW4gdGhlIFBBVEVOVFMgZmlsZSBpbiB0aGUgc2FtZSBkaXJlY3RvcnkuXG4gKlxuICogQHByb3ZpZGVzTW9kdWxlIERpc3BhdGNoZXJcbiAqIEB0eXBlY2hlY2tzXG4gKi9cblxuXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBpbnZhcmlhbnQgPSByZXF1aXJlKCcuL2ludmFyaWFudCcpO1xuXG52YXIgX2xhc3RJRCA9IDE7XG52YXIgX3ByZWZpeCA9ICdJRF8nO1xuXG4vKipcbiAqIERpc3BhdGNoZXIgaXMgdXNlZCB0byBicm9hZGNhc3QgcGF5bG9hZHMgdG8gcmVnaXN0ZXJlZCBjYWxsYmFja3MuIFRoaXMgaXNcbiAqIGRpZmZlcmVudCBmcm9tIGdlbmVyaWMgcHViLXN1YiBzeXN0ZW1zIGluIHR3byB3YXlzOlxuICpcbiAqICAgMSkgQ2FsbGJhY2tzIGFyZSBub3Qgc3Vic2NyaWJlZCB0byBwYXJ0aWN1bGFyIGV2ZW50cy4gRXZlcnkgcGF5bG9hZCBpc1xuICogICAgICBkaXNwYXRjaGVkIHRvIGV2ZXJ5IHJlZ2lzdGVyZWQgY2FsbGJhY2suXG4gKiAgIDIpIENhbGxiYWNrcyBjYW4gYmUgZGVmZXJyZWQgaW4gd2hvbGUgb3IgcGFydCB1bnRpbCBvdGhlciBjYWxsYmFja3MgaGF2ZVxuICogICAgICBiZWVuIGV4ZWN1dGVkLlxuICpcbiAqIEZvciBleGFtcGxlLCBjb25zaWRlciB0aGlzIGh5cG90aGV0aWNhbCBmbGlnaHQgZGVzdGluYXRpb24gZm9ybSwgd2hpY2hcbiAqIHNlbGVjdHMgYSBkZWZhdWx0IGNpdHkgd2hlbiBhIGNvdW50cnkgaXMgc2VsZWN0ZWQ6XG4gKlxuICogICB2YXIgZmxpZ2h0RGlzcGF0Y2hlciA9IG5ldyBEaXNwYXRjaGVyKCk7XG4gKlxuICogICAvLyBLZWVwcyB0cmFjayBvZiB3aGljaCBjb3VudHJ5IGlzIHNlbGVjdGVkXG4gKiAgIHZhciBDb3VudHJ5U3RvcmUgPSB7Y291bnRyeTogbnVsbH07XG4gKlxuICogICAvLyBLZWVwcyB0cmFjayBvZiB3aGljaCBjaXR5IGlzIHNlbGVjdGVkXG4gKiAgIHZhciBDaXR5U3RvcmUgPSB7Y2l0eTogbnVsbH07XG4gKlxuICogICAvLyBLZWVwcyB0cmFjayBvZiB0aGUgYmFzZSBmbGlnaHQgcHJpY2Ugb2YgdGhlIHNlbGVjdGVkIGNpdHlcbiAqICAgdmFyIEZsaWdodFByaWNlU3RvcmUgPSB7cHJpY2U6IG51bGx9XG4gKlxuICogV2hlbiBhIHVzZXIgY2hhbmdlcyB0aGUgc2VsZWN0ZWQgY2l0eSwgd2UgZGlzcGF0Y2ggdGhlIHBheWxvYWQ6XG4gKlxuICogICBmbGlnaHREaXNwYXRjaGVyLmRpc3BhdGNoKHtcbiAqICAgICBhY3Rpb25UeXBlOiAnY2l0eS11cGRhdGUnLFxuICogICAgIHNlbGVjdGVkQ2l0eTogJ3BhcmlzJ1xuICogICB9KTtcbiAqXG4gKiBUaGlzIHBheWxvYWQgaXMgZGlnZXN0ZWQgYnkgYENpdHlTdG9yZWA6XG4gKlxuICogICBmbGlnaHREaXNwYXRjaGVyLnJlZ2lzdGVyKGZ1bmN0aW9uKHBheWxvYWQpIHtcbiAqICAgICBpZiAocGF5bG9hZC5hY3Rpb25UeXBlID09PSAnY2l0eS11cGRhdGUnKSB7XG4gKiAgICAgICBDaXR5U3RvcmUuY2l0eSA9IHBheWxvYWQuc2VsZWN0ZWRDaXR5O1xuICogICAgIH1cbiAqICAgfSk7XG4gKlxuICogV2hlbiB0aGUgdXNlciBzZWxlY3RzIGEgY291bnRyeSwgd2UgZGlzcGF0Y2ggdGhlIHBheWxvYWQ6XG4gKlxuICogICBmbGlnaHREaXNwYXRjaGVyLmRpc3BhdGNoKHtcbiAqICAgICBhY3Rpb25UeXBlOiAnY291bnRyeS11cGRhdGUnLFxuICogICAgIHNlbGVjdGVkQ291bnRyeTogJ2F1c3RyYWxpYSdcbiAqICAgfSk7XG4gKlxuICogVGhpcyBwYXlsb2FkIGlzIGRpZ2VzdGVkIGJ5IGJvdGggc3RvcmVzOlxuICpcbiAqICAgIENvdW50cnlTdG9yZS5kaXNwYXRjaFRva2VuID0gZmxpZ2h0RGlzcGF0Y2hlci5yZWdpc3RlcihmdW5jdGlvbihwYXlsb2FkKSB7XG4gKiAgICAgaWYgKHBheWxvYWQuYWN0aW9uVHlwZSA9PT0gJ2NvdW50cnktdXBkYXRlJykge1xuICogICAgICAgQ291bnRyeVN0b3JlLmNvdW50cnkgPSBwYXlsb2FkLnNlbGVjdGVkQ291bnRyeTtcbiAqICAgICB9XG4gKiAgIH0pO1xuICpcbiAqIFdoZW4gdGhlIGNhbGxiYWNrIHRvIHVwZGF0ZSBgQ291bnRyeVN0b3JlYCBpcyByZWdpc3RlcmVkLCB3ZSBzYXZlIGEgcmVmZXJlbmNlXG4gKiB0byB0aGUgcmV0dXJuZWQgdG9rZW4uIFVzaW5nIHRoaXMgdG9rZW4gd2l0aCBgd2FpdEZvcigpYCwgd2UgY2FuIGd1YXJhbnRlZVxuICogdGhhdCBgQ291bnRyeVN0b3JlYCBpcyB1cGRhdGVkIGJlZm9yZSB0aGUgY2FsbGJhY2sgdGhhdCB1cGRhdGVzIGBDaXR5U3RvcmVgXG4gKiBuZWVkcyB0byBxdWVyeSBpdHMgZGF0YS5cbiAqXG4gKiAgIENpdHlTdG9yZS5kaXNwYXRjaFRva2VuID0gZmxpZ2h0RGlzcGF0Y2hlci5yZWdpc3RlcihmdW5jdGlvbihwYXlsb2FkKSB7XG4gKiAgICAgaWYgKHBheWxvYWQuYWN0aW9uVHlwZSA9PT0gJ2NvdW50cnktdXBkYXRlJykge1xuICogICAgICAgLy8gYENvdW50cnlTdG9yZS5jb3VudHJ5YCBtYXkgbm90IGJlIHVwZGF0ZWQuXG4gKiAgICAgICBmbGlnaHREaXNwYXRjaGVyLndhaXRGb3IoW0NvdW50cnlTdG9yZS5kaXNwYXRjaFRva2VuXSk7XG4gKiAgICAgICAvLyBgQ291bnRyeVN0b3JlLmNvdW50cnlgIGlzIG5vdyBndWFyYW50ZWVkIHRvIGJlIHVwZGF0ZWQuXG4gKlxuICogICAgICAgLy8gU2VsZWN0IHRoZSBkZWZhdWx0IGNpdHkgZm9yIHRoZSBuZXcgY291bnRyeVxuICogICAgICAgQ2l0eVN0b3JlLmNpdHkgPSBnZXREZWZhdWx0Q2l0eUZvckNvdW50cnkoQ291bnRyeVN0b3JlLmNvdW50cnkpO1xuICogICAgIH1cbiAqICAgfSk7XG4gKlxuICogVGhlIHVzYWdlIG9mIGB3YWl0Rm9yKClgIGNhbiBiZSBjaGFpbmVkLCBmb3IgZXhhbXBsZTpcbiAqXG4gKiAgIEZsaWdodFByaWNlU3RvcmUuZGlzcGF0Y2hUb2tlbiA9XG4gKiAgICAgZmxpZ2h0RGlzcGF0Y2hlci5yZWdpc3RlcihmdW5jdGlvbihwYXlsb2FkKSB7XG4gKiAgICAgICBzd2l0Y2ggKHBheWxvYWQuYWN0aW9uVHlwZSkge1xuICogICAgICAgICBjYXNlICdjb3VudHJ5LXVwZGF0ZSc6XG4gKiAgICAgICAgICAgZmxpZ2h0RGlzcGF0Y2hlci53YWl0Rm9yKFtDaXR5U3RvcmUuZGlzcGF0Y2hUb2tlbl0pO1xuICogICAgICAgICAgIEZsaWdodFByaWNlU3RvcmUucHJpY2UgPVxuICogICAgICAgICAgICAgZ2V0RmxpZ2h0UHJpY2VTdG9yZShDb3VudHJ5U3RvcmUuY291bnRyeSwgQ2l0eVN0b3JlLmNpdHkpO1xuICogICAgICAgICAgIGJyZWFrO1xuICpcbiAqICAgICAgICAgY2FzZSAnY2l0eS11cGRhdGUnOlxuICogICAgICAgICAgIEZsaWdodFByaWNlU3RvcmUucHJpY2UgPVxuICogICAgICAgICAgICAgRmxpZ2h0UHJpY2VTdG9yZShDb3VudHJ5U3RvcmUuY291bnRyeSwgQ2l0eVN0b3JlLmNpdHkpO1xuICogICAgICAgICAgIGJyZWFrO1xuICogICAgIH1cbiAqICAgfSk7XG4gKlxuICogVGhlIGBjb3VudHJ5LXVwZGF0ZWAgcGF5bG9hZCB3aWxsIGJlIGd1YXJhbnRlZWQgdG8gaW52b2tlIHRoZSBzdG9yZXMnXG4gKiByZWdpc3RlcmVkIGNhbGxiYWNrcyBpbiBvcmRlcjogYENvdW50cnlTdG9yZWAsIGBDaXR5U3RvcmVgLCB0aGVuXG4gKiBgRmxpZ2h0UHJpY2VTdG9yZWAuXG4gKi9cblxuICBmdW5jdGlvbiBEaXNwYXRjaGVyKCkge1xuICAgIHRoaXMuJERpc3BhdGNoZXJfY2FsbGJhY2tzID0ge307XG4gICAgdGhpcy4kRGlzcGF0Y2hlcl9pc1BlbmRpbmcgPSB7fTtcbiAgICB0aGlzLiREaXNwYXRjaGVyX2lzSGFuZGxlZCA9IHt9O1xuICAgIHRoaXMuJERpc3BhdGNoZXJfaXNEaXNwYXRjaGluZyA9IGZhbHNlO1xuICAgIHRoaXMuJERpc3BhdGNoZXJfcGVuZGluZ1BheWxvYWQgPSBudWxsO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlZ2lzdGVycyBhIGNhbGxiYWNrIHRvIGJlIGludm9rZWQgd2l0aCBldmVyeSBkaXNwYXRjaGVkIHBheWxvYWQuIFJldHVybnNcbiAgICogYSB0b2tlbiB0aGF0IGNhbiBiZSB1c2VkIHdpdGggYHdhaXRGb3IoKWAuXG4gICAqXG4gICAqIEBwYXJhbSB7ZnVuY3Rpb259IGNhbGxiYWNrXG4gICAqIEByZXR1cm4ge3N0cmluZ31cbiAgICovXG4gIERpc3BhdGNoZXIucHJvdG90eXBlLnJlZ2lzdGVyPWZ1bmN0aW9uKGNhbGxiYWNrKSB7XG4gICAgdmFyIGlkID0gX3ByZWZpeCArIF9sYXN0SUQrKztcbiAgICB0aGlzLiREaXNwYXRjaGVyX2NhbGxiYWNrc1tpZF0gPSBjYWxsYmFjaztcbiAgICByZXR1cm4gaWQ7XG4gIH07XG5cbiAgLyoqXG4gICAqIFJlbW92ZXMgYSBjYWxsYmFjayBiYXNlZCBvbiBpdHMgdG9rZW4uXG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBpZFxuICAgKi9cbiAgRGlzcGF0Y2hlci5wcm90b3R5cGUudW5yZWdpc3Rlcj1mdW5jdGlvbihpZCkge1xuICAgIGludmFyaWFudChcbiAgICAgIHRoaXMuJERpc3BhdGNoZXJfY2FsbGJhY2tzW2lkXSxcbiAgICAgICdEaXNwYXRjaGVyLnVucmVnaXN0ZXIoLi4uKTogYCVzYCBkb2VzIG5vdCBtYXAgdG8gYSByZWdpc3RlcmVkIGNhbGxiYWNrLicsXG4gICAgICBpZFxuICAgICk7XG4gICAgZGVsZXRlIHRoaXMuJERpc3BhdGNoZXJfY2FsbGJhY2tzW2lkXTtcbiAgfTtcblxuICAvKipcbiAgICogV2FpdHMgZm9yIHRoZSBjYWxsYmFja3Mgc3BlY2lmaWVkIHRvIGJlIGludm9rZWQgYmVmb3JlIGNvbnRpbnVpbmcgZXhlY3V0aW9uXG4gICAqIG9mIHRoZSBjdXJyZW50IGNhbGxiYWNrLiBUaGlzIG1ldGhvZCBzaG91bGQgb25seSBiZSB1c2VkIGJ5IGEgY2FsbGJhY2sgaW5cbiAgICogcmVzcG9uc2UgdG8gYSBkaXNwYXRjaGVkIHBheWxvYWQuXG4gICAqXG4gICAqIEBwYXJhbSB7YXJyYXk8c3RyaW5nPn0gaWRzXG4gICAqL1xuICBEaXNwYXRjaGVyLnByb3RvdHlwZS53YWl0Rm9yPWZ1bmN0aW9uKGlkcykge1xuICAgIGludmFyaWFudChcbiAgICAgIHRoaXMuJERpc3BhdGNoZXJfaXNEaXNwYXRjaGluZyxcbiAgICAgICdEaXNwYXRjaGVyLndhaXRGb3IoLi4uKTogTXVzdCBiZSBpbnZva2VkIHdoaWxlIGRpc3BhdGNoaW5nLidcbiAgICApO1xuICAgIGZvciAodmFyIGlpID0gMDsgaWkgPCBpZHMubGVuZ3RoOyBpaSsrKSB7XG4gICAgICB2YXIgaWQgPSBpZHNbaWldO1xuICAgICAgaWYgKHRoaXMuJERpc3BhdGNoZXJfaXNQZW5kaW5nW2lkXSkge1xuICAgICAgICBpbnZhcmlhbnQoXG4gICAgICAgICAgdGhpcy4kRGlzcGF0Y2hlcl9pc0hhbmRsZWRbaWRdLFxuICAgICAgICAgICdEaXNwYXRjaGVyLndhaXRGb3IoLi4uKTogQ2lyY3VsYXIgZGVwZW5kZW5jeSBkZXRlY3RlZCB3aGlsZSAnICtcbiAgICAgICAgICAnd2FpdGluZyBmb3IgYCVzYC4nLFxuICAgICAgICAgIGlkXG4gICAgICAgICk7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuICAgICAgaW52YXJpYW50KFxuICAgICAgICB0aGlzLiREaXNwYXRjaGVyX2NhbGxiYWNrc1tpZF0sXG4gICAgICAgICdEaXNwYXRjaGVyLndhaXRGb3IoLi4uKTogYCVzYCBkb2VzIG5vdCBtYXAgdG8gYSByZWdpc3RlcmVkIGNhbGxiYWNrLicsXG4gICAgICAgIGlkXG4gICAgICApO1xuICAgICAgdGhpcy4kRGlzcGF0Y2hlcl9pbnZva2VDYWxsYmFjayhpZCk7XG4gICAgfVxuICB9O1xuXG4gIC8qKlxuICAgKiBEaXNwYXRjaGVzIGEgcGF5bG9hZCB0byBhbGwgcmVnaXN0ZXJlZCBjYWxsYmFja3MuXG4gICAqXG4gICAqIEBwYXJhbSB7b2JqZWN0fSBwYXlsb2FkXG4gICAqL1xuICBEaXNwYXRjaGVyLnByb3RvdHlwZS5kaXNwYXRjaD1mdW5jdGlvbihwYXlsb2FkKSB7XG4gICAgaW52YXJpYW50KFxuICAgICAgIXRoaXMuJERpc3BhdGNoZXJfaXNEaXNwYXRjaGluZyxcbiAgICAgICdEaXNwYXRjaC5kaXNwYXRjaCguLi4pOiBDYW5ub3QgZGlzcGF0Y2ggaW4gdGhlIG1pZGRsZSBvZiBhIGRpc3BhdGNoLidcbiAgICApO1xuICAgIHRoaXMuJERpc3BhdGNoZXJfc3RhcnREaXNwYXRjaGluZyhwYXlsb2FkKTtcbiAgICB0cnkge1xuICAgICAgZm9yICh2YXIgaWQgaW4gdGhpcy4kRGlzcGF0Y2hlcl9jYWxsYmFja3MpIHtcbiAgICAgICAgaWYgKHRoaXMuJERpc3BhdGNoZXJfaXNQZW5kaW5nW2lkXSkge1xuICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuJERpc3BhdGNoZXJfaW52b2tlQ2FsbGJhY2soaWQpO1xuICAgICAgfVxuICAgIH0gZmluYWxseSB7XG4gICAgICB0aGlzLiREaXNwYXRjaGVyX3N0b3BEaXNwYXRjaGluZygpO1xuICAgIH1cbiAgfTtcblxuICAvKipcbiAgICogSXMgdGhpcyBEaXNwYXRjaGVyIGN1cnJlbnRseSBkaXNwYXRjaGluZy5cbiAgICpcbiAgICogQHJldHVybiB7Ym9vbGVhbn1cbiAgICovXG4gIERpc3BhdGNoZXIucHJvdG90eXBlLmlzRGlzcGF0Y2hpbmc9ZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMuJERpc3BhdGNoZXJfaXNEaXNwYXRjaGluZztcbiAgfTtcblxuICAvKipcbiAgICogQ2FsbCB0aGUgY2FsbGJhY2sgc3RvcmVkIHdpdGggdGhlIGdpdmVuIGlkLiBBbHNvIGRvIHNvbWUgaW50ZXJuYWxcbiAgICogYm9va2tlZXBpbmcuXG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBpZFxuICAgKiBAaW50ZXJuYWxcbiAgICovXG4gIERpc3BhdGNoZXIucHJvdG90eXBlLiREaXNwYXRjaGVyX2ludm9rZUNhbGxiYWNrPWZ1bmN0aW9uKGlkKSB7XG4gICAgdGhpcy4kRGlzcGF0Y2hlcl9pc1BlbmRpbmdbaWRdID0gdHJ1ZTtcbiAgICB0aGlzLiREaXNwYXRjaGVyX2NhbGxiYWNrc1tpZF0odGhpcy4kRGlzcGF0Y2hlcl9wZW5kaW5nUGF5bG9hZCk7XG4gICAgdGhpcy4kRGlzcGF0Y2hlcl9pc0hhbmRsZWRbaWRdID0gdHJ1ZTtcbiAgfTtcblxuICAvKipcbiAgICogU2V0IHVwIGJvb2trZWVwaW5nIG5lZWRlZCB3aGVuIGRpc3BhdGNoaW5nLlxuICAgKlxuICAgKiBAcGFyYW0ge29iamVjdH0gcGF5bG9hZFxuICAgKiBAaW50ZXJuYWxcbiAgICovXG4gIERpc3BhdGNoZXIucHJvdG90eXBlLiREaXNwYXRjaGVyX3N0YXJ0RGlzcGF0Y2hpbmc9ZnVuY3Rpb24ocGF5bG9hZCkge1xuICAgIGZvciAodmFyIGlkIGluIHRoaXMuJERpc3BhdGNoZXJfY2FsbGJhY2tzKSB7XG4gICAgICB0aGlzLiREaXNwYXRjaGVyX2lzUGVuZGluZ1tpZF0gPSBmYWxzZTtcbiAgICAgIHRoaXMuJERpc3BhdGNoZXJfaXNIYW5kbGVkW2lkXSA9IGZhbHNlO1xuICAgIH1cbiAgICB0aGlzLiREaXNwYXRjaGVyX3BlbmRpbmdQYXlsb2FkID0gcGF5bG9hZDtcbiAgICB0aGlzLiREaXNwYXRjaGVyX2lzRGlzcGF0Y2hpbmcgPSB0cnVlO1xuICB9O1xuXG4gIC8qKlxuICAgKiBDbGVhciBib29ra2VlcGluZyB1c2VkIGZvciBkaXNwYXRjaGluZy5cbiAgICpcbiAgICogQGludGVybmFsXG4gICAqL1xuICBEaXNwYXRjaGVyLnByb3RvdHlwZS4kRGlzcGF0Y2hlcl9zdG9wRGlzcGF0Y2hpbmc9ZnVuY3Rpb24oKSB7XG4gICAgdGhpcy4kRGlzcGF0Y2hlcl9wZW5kaW5nUGF5bG9hZCA9IG51bGw7XG4gICAgdGhpcy4kRGlzcGF0Y2hlcl9pc0Rpc3BhdGNoaW5nID0gZmFsc2U7XG4gIH07XG5cblxubW9kdWxlLmV4cG9ydHMgPSBuZXcgRGlzcGF0Y2hlcjtcbiIsIi8qKlxuICogQ29weXJpZ2h0IChjKSAyMDE0LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBCU0Qtc3R5bGUgbGljZW5zZSBmb3VuZCBpbiB0aGVcbiAqIExJQ0VOU0UgZmlsZSBpbiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS4gQW4gYWRkaXRpb25hbCBncmFudFxuICogb2YgcGF0ZW50IHJpZ2h0cyBjYW4gYmUgZm91bmQgaW4gdGhlIFBBVEVOVFMgZmlsZSBpbiB0aGUgc2FtZSBkaXJlY3RvcnkuXG4gKlxuICogQHByb3ZpZGVzTW9kdWxlIGludmFyaWFudFxuICovXG5cblwidXNlIHN0cmljdFwiO1xuXG4vKipcbiAqIFVzZSBpbnZhcmlhbnQoKSB0byBhc3NlcnQgc3RhdGUgd2hpY2ggeW91ciBwcm9ncmFtIGFzc3VtZXMgdG8gYmUgdHJ1ZS5cbiAqXG4gKiBQcm92aWRlIHNwcmludGYtc3R5bGUgZm9ybWF0IChvbmx5ICVzIGlzIHN1cHBvcnRlZCkgYW5kIGFyZ3VtZW50c1xuICogdG8gcHJvdmlkZSBpbmZvcm1hdGlvbiBhYm91dCB3aGF0IGJyb2tlIGFuZCB3aGF0IHlvdSB3ZXJlXG4gKiBleHBlY3RpbmcuXG4gKlxuICogVGhlIGludmFyaWFudCBtZXNzYWdlIHdpbGwgYmUgc3RyaXBwZWQgaW4gcHJvZHVjdGlvbiwgYnV0IHRoZSBpbnZhcmlhbnRcbiAqIHdpbGwgcmVtYWluIHRvIGVuc3VyZSBsb2dpYyBkb2VzIG5vdCBkaWZmZXIgaW4gcHJvZHVjdGlvbi5cbiAqL1xuXG52YXIgaW52YXJpYW50ID0gZnVuY3Rpb24oY29uZGl0aW9uLCBmb3JtYXQsIGEsIGIsIGMsIGQsIGUsIGYpIHtcbiAgaWYgKCFjb25kaXRpb24pIHtcbiAgICB2YXIgZXJyb3I7XG4gICAgaWYgKGZvcm1hdCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICBlcnJvciA9IG5ldyBFcnJvcihcbiAgICAgICAgJ01pbmlmaWVkIGV4Y2VwdGlvbiBvY2N1cnJlZDsgdXNlIHRoZSBub24tbWluaWZpZWQgZGV2IGVudmlyb25tZW50ICcgK1xuICAgICAgICAnZm9yIHRoZSBmdWxsIGVycm9yIG1lc3NhZ2UgYW5kIGFkZGl0aW9uYWwgaGVscGZ1bCB3YXJuaW5ncy4nXG4gICAgICApO1xuICAgIH0gZWxzZSB7XG4gICAgICB2YXIgYXJncyA9IFthLCBiLCBjLCBkLCBlLCBmXTtcbiAgICAgIHZhciBhcmdJbmRleCA9IDA7XG4gICAgICBlcnJvciA9IG5ldyBFcnJvcihcbiAgICAgICAgJ0ludmFyaWFudCBWaW9sYXRpb246ICcgK1xuICAgICAgICBmb3JtYXQucmVwbGFjZSgvJXMvZywgZnVuY3Rpb24oKSB7IHJldHVybiBhcmdzW2FyZ0luZGV4KytdOyB9KVxuICAgICAgKTtcbiAgICB9XG5cbiAgICBlcnJvci5mcmFtZXNUb1BvcCA9IDE7IC8vIHdlIGRvbid0IGNhcmUgYWJvdXQgaW52YXJpYW50J3Mgb3duIGZyYW1lXG4gICAgdGhyb3cgZXJyb3I7XG4gIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gaW52YXJpYW50O1xuIiwiLyoqIEBqc3ggUmVhY3QuRE9NICovXG5cbi8vIEhlbHBlcnNcbnZhciBFdmVudHMgPSByZXF1aXJlKCcuL0V2ZW50cycpO1xuXG4vLyBDbGFzc2VzXG52YXIgQWNjb3VudExpc3RDb21wb25lbnQgPSByZXF1aXJlKCcuL2NvbXBvbmVudHMvQWNjb3VudExpc3RDb21wb25lbnQnKTtcbnZhciBCYW5rTGlzdENvbXBvbmVudCA9IHJlcXVpcmUoJy4vY29tcG9uZW50cy9CYW5rTGlzdENvbXBvbmVudCcpO1xudmFyIENhdGVnb3J5Q29tcG9uZW50ID0gcmVxdWlyZSgnLi9jb21wb25lbnRzL0NhdGVnb3J5Q29tcG9uZW50Jyk7XG52YXIgQ2hhcnRDb21wb25lbnQgPSByZXF1aXJlKCcuL2NvbXBvbmVudHMvQ2hhcnRDb21wb25lbnQnKTtcbnZhciBPcGVyYXRpb25MaXN0Q29tcG9uZW50ID0gcmVxdWlyZSgnLi9jb21wb25lbnRzL09wZXJhdGlvbkxpc3RDb21wb25lbnQnKTtcbnZhciBTaW1pbGFyaXR5Q29tcG9uZW50ID0gcmVxdWlyZSgnLi9jb21wb25lbnRzL1NpbWlsYXJpdHlDb21wb25lbnQnKTtcblxuLy8gR2xvYmFsIHZhcmlhYmxlc1xudmFyIHN0b3JlID0gcmVxdWlyZSgnLi9zdG9yZScpO1xuXG4vLyBOb3cgdGhpcyByZWFsbHkgYmVnaW5zLlxudmFyIEtyZXN1cyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtkaXNwbGF5TmFtZTogJ0tyZXN1cycsXG5cbiAgICBjb21wb25lbnREaWRNb3VudDogZnVuY3Rpb24oKSB7XG4gICAgICAgIC8vIExldCdzIGdvLlxuICAgICAgICBzdG9yZS5nZXRDYXRlZ29yaWVzKCk7XG4gICAgICAgIHN0b3JlLm9uY2UoRXZlbnRzLkNBVEVHT1JJRVNfTE9BREVELCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHN0b3JlLmdldEFsbEJhbmtzKCk7XG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICByZW5kZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgUmVhY3QuRE9NLmRpdih7Y2xhc3NOYW1lOiBcInJvd1wifSwgXG5cbiAgICAgICAgICAgIFJlYWN0LkRPTS5kaXYoe2NsYXNzTmFtZTogXCJwYW5lbCBzbWFsbC0yIGNvbHVtbnNcIn0sIFxuICAgICAgICAgICAgICAgIEJhbmtMaXN0Q29tcG9uZW50KG51bGwpLCBcbiAgICAgICAgICAgICAgICBBY2NvdW50TGlzdENvbXBvbmVudChudWxsKVxuICAgICAgICAgICAgKSwgXG5cbiAgICAgICAgICAgIFJlYWN0LkRPTS5kaXYoe2NsYXNzTmFtZTogXCJzbWFsbC0xMCBjb2x1bW5zXCJ9LCBcbiAgICAgICAgICAgICAgICBSZWFjdC5ET00udWwoe2NsYXNzTmFtZTogXCJ0YWJzXCIsICdkYXRhLXRhYic6IHRydWV9LCBcbiAgICAgICAgICAgICAgICAgICAgUmVhY3QuRE9NLmxpKHtjbGFzc05hbWU6IFwidGFiLXRpdGxlIGFjdGl2ZVwifSwgUmVhY3QuRE9NLmEoe2hyZWY6IFwiI3BhbmVsLW9wZXJhdGlvbnNcIn0sIFwiT3BlcmF0aW9uc1wiKSksIFxuICAgICAgICAgICAgICAgICAgICBSZWFjdC5ET00ubGkoe2NsYXNzTmFtZTogXCJ0YWItdGl0bGVcIn0sIFJlYWN0LkRPTS5hKHtocmVmOiBcIiNwYW5lbC1jaGFydHNcIn0sIFwiQ2hhcnRzXCIpKSwgXG4gICAgICAgICAgICAgICAgICAgIFJlYWN0LkRPTS5saSh7Y2xhc3NOYW1lOiBcInRhYi10aXRsZVwifSwgUmVhY3QuRE9NLmEoe2hyZWY6IFwiI3BhbmVsLXNpbWlsYXJpdGllc1wifSwgXCJTaW1pbGFyaXRpZXNcIikpLCBcbiAgICAgICAgICAgICAgICAgICAgUmVhY3QuRE9NLmxpKHtjbGFzc05hbWU6IFwidGFiLXRpdGxlXCJ9LCBSZWFjdC5ET00uYSh7aHJlZjogXCIjcGFuZWwtY2F0ZWdvcmllc1wifSwgXCJDYXRlZ29yaWVzXCIpKVxuICAgICAgICAgICAgICAgICksIFxuXG4gICAgICAgICAgICAgICAgUmVhY3QuRE9NLmRpdih7Y2xhc3NOYW1lOiBcInRhYnMtY29udGVudFwifSwgXG5cbiAgICAgICAgICAgICAgICAgICAgUmVhY3QuRE9NLmRpdih7Y2xhc3NOYW1lOiBcImNvbnRlbnQgYWN0aXZlXCIsIGlkOiBcInBhbmVsLW9wZXJhdGlvbnNcIn0sIFxuICAgICAgICAgICAgICAgICAgICAgICAgT3BlcmF0aW9uTGlzdENvbXBvbmVudChudWxsKVxuICAgICAgICAgICAgICAgICAgICApLCBcblxuICAgICAgICAgICAgICAgICAgICBSZWFjdC5ET00uZGl2KHtjbGFzc05hbWU6IFwiY29udGVudFwiLCBpZDogXCJwYW5lbC1zaW1pbGFyaXRpZXNcIn0sIFxuICAgICAgICAgICAgICAgICAgICAgICAgU2ltaWxhcml0eUNvbXBvbmVudChudWxsKVxuICAgICAgICAgICAgICAgICAgICApLCBcblxuICAgICAgICAgICAgICAgICAgICBSZWFjdC5ET00uZGl2KHtjbGFzc05hbWU6IFwiY29udGVudFwiLCBpZDogXCJwYW5lbC1jaGFydHNcIn0sIFxuICAgICAgICAgICAgICAgICAgICAgICAgQ2hhcnRDb21wb25lbnQobnVsbClcbiAgICAgICAgICAgICAgICAgICAgKSwgXG5cbiAgICAgICAgICAgICAgICAgICAgUmVhY3QuRE9NLmRpdih7Y2xhc3NOYW1lOiBcImNvbnRlbnRcIiwgaWQ6IFwicGFuZWwtY2F0ZWdvcmllc1wifSwgXG4gICAgICAgICAgICAgICAgICAgICAgICBDYXRlZ29yeUNvbXBvbmVudChudWxsKVxuICAgICAgICAgICAgICAgICAgICApXG5cbiAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICApXG5cbiAgICAgICAgICAgIClcbiAgICAgICAgKTtcbiAgICB9XG59KTtcblxuUmVhY3QucmVuZGVyQ29tcG9uZW50KEtyZXN1cyhudWxsKSwgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI21haW4nKSk7XG4iLCJ2YXIgRUUgPSByZXF1aXJlKCdldmVudHMnKS5FdmVudEVtaXR0ZXI7XG52YXIgRXZlbnRzID0gcmVxdWlyZSgnLi9FdmVudHMnKTtcblxudmFyIEhlbHBlcnMgPSByZXF1aXJlKCcuL0hlbHBlcnMnKTtcbnZhciBhc3NlcnQgPSBIZWxwZXJzLmFzc2VydDtcbnZhciBkZWJ1ZyA9IEhlbHBlcnMuZGVidWc7XG52YXIgaGFzID0gSGVscGVycy5oYXM7XG52YXIgeGhyRXJyb3IgPSBIZWxwZXJzLnhockVycm9yO1xuXG52YXIgTW9kZWxzID0gcmVxdWlyZSgnLi9Nb2RlbHMnKTtcbnZhciBBY2NvdW50ID0gTW9kZWxzLkFjY291bnQ7XG52YXIgQmFuayA9IE1vZGVscy5CYW5rO1xudmFyIENhdGVnb3J5ID0gTW9kZWxzLkNhdGVnb3J5O1xudmFyIE9wZXJhdGlvbiA9IE1vZGVscy5PcGVyYXRpb247XG5cbnZhciBmbHV4ID0gcmVxdWlyZSgnLi9mbHV4L2Rpc3BhdGNoZXInKTtcblxuLy8gSG9sZHMgdGhlIGN1cnJlbnQgYmFuayBpbmZvcm1hdGlvblxudmFyIHN0b3JlID0gbmV3IEVFO1xuXG5zdG9yZS5iYW5rcyA9IFtdO1xuc3RvcmUuY2F0ZWdvcmllcyA9IFtdO1xuc3RvcmUuY2F0ZWdvcnlMYWJlbCA9IHt9OyAvLyBtYXBzIGNhdGVnb3J5IGlkcyB0byBsYWJlbHNcblxuc3RvcmUuYWNjb3VudHMgPSBbXTsgICAgLy8gZm9yIGEgZ2l2ZW4gYmFua1xuc3RvcmUub3BlcmF0aW9ucyA9IFtdOyAgLy8gZm9yIGEgZ2l2ZW4gYWNjb3VudFxuXG5zdG9yZS5jdXJyZW50QmFuayA9IG51bGw7XG5zdG9yZS5jdXJyZW50QWNjb3VudCA9IG51bGw7XG5cbnN0b3JlLmFjY291bnRPcGVyYXRpb25zID0ge307IC8vIGFjY291bnQgLT4gb3BlcmF0aW9uc1xuXG5zdG9yZS5nZXRBbGxCYW5rcyA9IGZ1bmN0aW9uKCkge1xuICAgICQuZ2V0KCdiYW5rcycsIHt3aXRoQWNjb3VudE9ubHk6dHJ1ZX0sIGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgICAgIHZhciBiYW5rcyA9IFtdXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZGF0YS5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgdmFyIGIgPSBuZXcgQmFuayhkYXRhW2ldKTtcbiAgICAgICAgICAgIGJhbmtzLnB1c2goYik7XG4gICAgICAgIH1cblxuICAgICAgICBmbHV4LmRpc3BhdGNoKHtcbiAgICAgICAgICAgIHR5cGU6IEV2ZW50cy5CQU5LX0xJU1RfTE9BREVELFxuICAgICAgICAgICAgbGlzdDogYmFua3NcbiAgICAgICAgfSk7XG5cbiAgICAgICAgaWYgKGJhbmtzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIGZsdXguZGlzcGF0Y2goe1xuICAgICAgICAgICAgICAgIHR5cGU6IEV2ZW50cy5TRUxFQ1RFRF9CQU5LX0NIQU5HRUQsXG4gICAgICAgICAgICAgICAgYmFuazogYmFua3NbMF1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfSkuZmFpbCh4aHJFcnJvcik7XG59XG5cbnN0b3JlLmxvYWRBbGxBY2NvdW50cyA9IGZ1bmN0aW9uICgpIHtcbiAgICBoYXModGhpcywgJ2N1cnJlbnRCYW5rJyk7XG4gICAgYXNzZXJ0KHRoaXMuY3VycmVudEJhbmsgaW5zdGFuY2VvZiBCYW5rKTtcblxuICAgICQuZ2V0KCdiYW5rcy9nZXRBY2NvdW50cy8nICsgdGhpcy5jdXJyZW50QmFuay5pZCwgZnVuY3Rpb24gKGRhdGEpIHtcblxuICAgICAgICB2YXIgYWNjb3VudHMgPSBbXVxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGRhdGEubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGFjY291bnRzLnB1c2gobmV3IEFjY291bnQoZGF0YVtpXSkpO1xuICAgICAgICB9XG5cbiAgICAgICAgZmx1eC5kaXNwYXRjaCh7XG4gICAgICAgICAgICB0eXBlOiBFdmVudHMuQUNDT1VOVFNfTE9BREVELFxuICAgICAgICAgICAgYWNjb3VudHM6IGFjY291bnRzXG4gICAgICAgIH0pO1xuXG4gICAgICAgIGlmIChhY2NvdW50cy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICBmbHV4LmRpc3BhdGNoKHtcbiAgICAgICAgICAgICAgICB0eXBlOiBFdmVudHMuU0VMRUNURURfQUNDT1VOVF9DSEFOR0VELFxuICAgICAgICAgICAgICAgIGFjY291bnQ6IGFjY291bnRzWzBdXG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDE7IGkgPCBhY2NvdW50cy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIHN0b3JlLmxvYWRPcGVyYXRpb25zRm9ySW1wbChhY2NvdW50c1tpXSwgLyogcHJvcGFnYXRlID0gKi8gZmFsc2UpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSkuZmFpbCh4aHJFcnJvcik7XG59XG5cbnN0b3JlLmxvYWRPcGVyYXRpb25zRm9ySW1wbCA9IGZ1bmN0aW9uKGFjY291bnQsIHByb3BhZ2F0ZSkge1xuICAgICQuZ2V0KCdhY2NvdW50cy9nZXRPcGVyYXRpb25zLycgKyBhY2NvdW50LmlkLCBmdW5jdGlvbiAoZGF0YSkge1xuICAgICAgICB2YXIgb3BlcmF0aW9ucyA9IFtdO1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGRhdGEubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHZhciBvID0gbmV3IE9wZXJhdGlvbihkYXRhW2ldKVxuICAgICAgICAgICAgb3BlcmF0aW9ucy5wdXNoKG8pO1xuICAgICAgICB9XG5cbiAgICAgICAgc3RvcmUuYWNjb3VudE9wZXJhdGlvbnNbYWNjb3VudC5pZF0gPSBvcGVyYXRpb25zO1xuXG4gICAgICAgIGlmIChwcm9wYWdhdGUpIHtcbiAgICAgICAgICAgIGZsdXguZGlzcGF0Y2goe1xuICAgICAgICAgICAgICAgIHR5cGU6IEV2ZW50cy5PUEVSQVRJT05TX0xPQURFRCxcbiAgICAgICAgICAgICAgICBvcGVyYXRpb25zOiBvcGVyYXRpb25zXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH0pLmZhaWwoeGhyRXJyb3IpO1xufTtcblxuc3RvcmUubG9hZE9wZXJhdGlvbnNGb3IgPSBmdW5jdGlvbihhY2NvdW50KSB7XG4gICAgdGhpcy5sb2FkT3BlcmF0aW9uc0ZvckltcGwoYWNjb3VudCwgLyogcHJvcGFnYXRlID0gKi8gdHJ1ZSk7XG59XG5cbnN0b3JlLmZldGNoT3BlcmF0aW9ucyA9IGZ1bmN0aW9uKCkge1xuICAgIGFzc2VydCh0aGlzLmN1cnJlbnRBY2NvdW50ICE9PSBudWxsKTtcbiAgICAkLmdldCgnYWNjb3VudHMvcmV0cmlldmVPcGVyYXRpb25zLycgKyB0aGlzLmN1cnJlbnRBY2NvdW50LmlkLCBmdW5jdGlvbiAoZGF0YSkge1xuICAgICAgICBzdG9yZS5jdXJyZW50QWNjb3VudCA9IG5ldyBBY2NvdW50KGRhdGEpO1xuICAgICAgICBzdG9yZS5sb2FkT3BlcmF0aW9uc0ZvcihzdG9yZS5jdXJyZW50QWNjb3VudCk7XG4gICAgfSkuZmFpbCh4aHJFcnJvcik7XG59O1xuXG5zdG9yZS5nZXRDYXRlZ29yaWVzID0gZnVuY3Rpb24oKSB7XG4gICAgJC5nZXQoJ2NhdGVnb3JpZXMnLCBmdW5jdGlvbiAoZGF0YSkge1xuICAgICAgICB2YXIgY2F0ZWdvcmllcyA9IFtdXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZGF0YS5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgdmFyIGMgPSBuZXcgQ2F0ZWdvcnkoZGF0YVtpXSk7XG4gICAgICAgICAgICBjYXRlZ29yaWVzLnB1c2goYylcbiAgICAgICAgfVxuXG4gICAgICAgIGZsdXguZGlzcGF0Y2goe1xuICAgICAgICAgICAgdHlwZTogRXZlbnRzLkNBVEVHT1JJRVNfTE9BREVELFxuICAgICAgICAgICAgY2F0ZWdvcmllczogY2F0ZWdvcmllc1xuICAgICAgICB9KTtcbiAgICB9KS5mYWlsKHhockVycm9yKTtcbn07XG5cbnN0b3JlLmFkZENhdGVnb3J5ID0gZnVuY3Rpb24oY2F0ZWdvcnkpIHtcbiAgICAkLnBvc3QoJ2NhdGVnb3JpZXMnLCBjYXRlZ29yeSwgZnVuY3Rpb24gKGRhdGEpIHtcbiAgICAgICAgZmx1eC5kaXNwYXRjaCh7XG4gICAgICAgICAgICB0eXBlOiBFdmVudHMuQ0FURUdPUllfU0FWRURcbiAgICAgICAgfSk7XG4gICAgfSkuZmFpbCh4aHJFcnJvcik7XG59XG5cbnN0b3JlLmNhdGVnb3J5VG9MYWJlbCA9IGZ1bmN0aW9uKGlkKSB7XG4gICAgYXNzZXJ0KHR5cGVvZiB0aGlzLmNhdGVnb3J5TGFiZWxbaWRdICE9PSAndW5kZWZpbmVkJyxcbiAgICAgICAgICAnY2F0ZWdvcnlUb0xhYmVsIGxvb2t1cCBmYWlsZWQgZm9yIGlkOiAnICsgaWQpO1xuICAgIHJldHVybiB0aGlzLmNhdGVnb3J5TGFiZWxbaWRdO1xufVxuXG5zdG9yZS5zZXRDYXRlZ29yaWVzID0gZnVuY3Rpb24oY2F0KSB7XG4gICAgdGhpcy5jYXRlZ29yaWVzID0gW25ldyBDYXRlZ29yeSh7aWQ6ICctMScsIHRpdGxlOiAnTm9uZSd9KV0uY29uY2F0KGNhdCk7XG4gICAgdGhpcy5jYXRlZ29yeUxhYmVsID0ge307XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmNhdGVnb3JpZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgdmFyIGMgPSB0aGlzLmNhdGVnb3JpZXNbaV07XG4gICAgICAgIGhhcyhjLCAnaWQnKTtcbiAgICAgICAgaGFzKGMsICd0aXRsZScpO1xuICAgICAgICB0aGlzLmNhdGVnb3J5TGFiZWxbYy5pZF0gPSBjLnRpdGxlO1xuICAgIH1cbn1cblxuc3RvcmUudXBkYXRlQ2F0ZWdvcnlGb3JPcGVyYXRpb24gPSBmdW5jdGlvbihvcGVyYXRpb25JZCwgY2F0ZWdvcnlJZCkge1xuICAgICQuYWpheCh7XG4gICAgICAgIHVybDonb3BlcmF0aW9ucy8nICsgb3BlcmF0aW9uSWQsXG4gICAgICAgIHR5cGU6ICdQVVQnLFxuICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICBjYXRlZ29yeUlkOiBjYXRlZ29yeUlkXG4gICAgICAgIH0sXG4gICAgICAgIHN1Y2Nlc3M6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGZsdXguZGlzcGF0Y2goe1xuICAgICAgICAgICAgICAgIHR5cGU6IEV2ZW50cy5PUEVSQVRJT05fQ0FURUdPUllfU0FWRURcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9LFxuICAgICAgICBlcnJvcjogeGhyRXJyb3JcbiAgICB9KTtcbn1cblxuc3RvcmUuZGVsZXRlT3BlcmF0aW9uID0gZnVuY3Rpb24ob3BlcmF0aW9uKSB7XG4gICAgYXNzZXJ0KG9wZXJhdGlvbiBpbnN0YW5jZW9mIE9wZXJhdGlvbik7XG4gICAgJC5hamF4KHtcbiAgICAgICAgdXJsOiAnb3BlcmF0aW9ucy8nICsgb3BlcmF0aW9uLmlkLFxuICAgICAgICB0eXBlOiAnREVMRVRFJyxcbiAgICAgICAgc3VjY2VzczogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBmbHV4LmRpc3BhdGNoKHtcbiAgICAgICAgICAgICAgICB0eXBlOiBFdmVudHMuREVMRVRFRF9PUEVSQVRJT05cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9LFxuICAgICAgICBlcnJvcjogeGhyRXJyb3JcbiAgICB9KTtcbn1cblxuc3RvcmUuZ2V0T3BlcmF0aW9uc09mQWxsQWNjb3VudHMgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgb3BzID0gW107XG4gICAgZm9yICh2YXIgYWNjIGluIHRoaXMuYWNjb3VudE9wZXJhdGlvbnMpIHtcbiAgICAgICAgb3BzID0gb3BzLmNvbmNhdCh0aGlzLmFjY291bnRPcGVyYXRpb25zW2FjY10pO1xuICAgIH1cbiAgICByZXR1cm4gb3BzO1xufVxuXG5mbHV4LnJlZ2lzdGVyKGZ1bmN0aW9uKGFjdGlvbikge1xuICAgIHN3aXRjaCAoYWN0aW9uLnR5cGUpIHtcblxuICAgICAgY2FzZSBFdmVudHMuQUNDT1VOVFNfTE9BREVEOlxuICAgICAgICBoYXMoYWN0aW9uLCAnYWNjb3VudHMnKTtcbiAgICAgICAgaWYgKGFjdGlvbi5hY2NvdW50cy5sZW5ndGggPiAwKVxuICAgICAgICAgICAgYXNzZXJ0KGFjdGlvbi5hY2NvdW50c1swXSBpbnN0YW5jZW9mIEFjY291bnQpO1xuICAgICAgICBzdG9yZS5hY2NvdW50cyA9IGFjdGlvbi5hY2NvdW50cztcbiAgICAgICAgc3RvcmUuZW1pdChFdmVudHMuQUNDT1VOVFNfTE9BREVEKTtcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGNhc2UgRXZlbnRzLkJBTktfTElTVF9MT0FERUQ6XG4gICAgICAgIGhhcyhhY3Rpb24sICdsaXN0Jyk7XG4gICAgICAgIHN0b3JlLmJhbmtzID0gYWN0aW9uLmxpc3Q7XG4gICAgICAgIHN0b3JlLmVtaXQoRXZlbnRzLkJBTktfTElTVF9MT0FERUQpO1xuICAgICAgICBicmVhaztcblxuICAgICAgY2FzZSBFdmVudHMuQ0FURUdPUklFU19MT0FERUQ6XG4gICAgICAgIGhhcyhhY3Rpb24sICdjYXRlZ29yaWVzJyk7XG4gICAgICAgIHN0b3JlLnNldENhdGVnb3JpZXMoYWN0aW9uLmNhdGVnb3JpZXMpO1xuICAgICAgICBzdG9yZS5lbWl0KEV2ZW50cy5DQVRFR09SSUVTX0xPQURFRCk7XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBjYXNlIEV2ZW50cy5DQVRFR09SWV9DUkVBVEVEOlxuICAgICAgICBoYXMoYWN0aW9uLCAnY2F0ZWdvcnknKTtcbiAgICAgICAgc3RvcmUuYWRkQ2F0ZWdvcnkoYWN0aW9uLmNhdGVnb3J5KTtcbiAgICAgICAgLy8gTm8gbmVlZCB0byBmb3J3YXJkXG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBjYXNlIEV2ZW50cy5DQVRFR09SWV9TQVZFRDpcbiAgICAgICAgc3RvcmUuZ2V0Q2F0ZWdvcmllcygpO1xuICAgICAgICAvLyBObyBuZWVkIHRvIGZvcndhcmRcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGNhc2UgRXZlbnRzLkRFTEVURV9PUEVSQVRJT046XG4gICAgICAgIGhhcyhhY3Rpb24sICdvcGVyYXRpb24nKTtcbiAgICAgICAgYXNzZXJ0KGFjdGlvbi5vcGVyYXRpb24gaW5zdGFuY2VvZiBPcGVyYXRpb24pO1xuICAgICAgICBzdG9yZS5kZWxldGVPcGVyYXRpb24oYWN0aW9uLm9wZXJhdGlvbik7XG4gICAgICAgIC8vIE5vIG5lZWQgdG8gZm9yd2FyZFxuICAgICAgICBicmVhaztcblxuICAgICAgY2FzZSBFdmVudHMuREVMRVRFRF9PUEVSQVRJT046XG4gICAgICAgIGFzc2VydCh0eXBlb2Ygc3RvcmUuY3VycmVudEFjY291bnQgIT09ICd1bmRlZmluZWQnKTtcbiAgICAgICAgc3RvcmUubG9hZE9wZXJhdGlvbnNGb3Ioc3RvcmUuY3VycmVudEFjY291bnQpO1xuICAgICAgICAvLyBObyBuZWVkIHRvIGZvcndhcmRcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGNhc2UgRXZlbnRzLk9QRVJBVElPTl9DQVRFR09SWV9DSEFOR0VEOlxuICAgICAgICBoYXMoYWN0aW9uLCAnb3BlcmF0aW9uSWQnKTtcbiAgICAgICAgaGFzKGFjdGlvbiwgJ2NhdGVnb3J5SWQnKTtcbiAgICAgICAgc3RvcmUudXBkYXRlQ2F0ZWdvcnlGb3JPcGVyYXRpb24oYWN0aW9uLm9wZXJhdGlvbklkLCBhY3Rpb24uY2F0ZWdvcnlJZCk7XG4gICAgICAgIC8vIE5vIG5lZWQgdG8gZm9yd2FyZFxuICAgICAgICBicmVhaztcblxuICAgICAgY2FzZSBFdmVudHMuT1BFUkFUSU9OX0NBVEVHT1JZX1NBVkVEOlxuICAgICAgICBzdG9yZS5lbWl0KEV2ZW50cy5PUEVSQVRJT05fQ0FURUdPUllfU0FWRUQpO1xuICAgICAgICBicmVhaztcblxuICAgICAgY2FzZSBFdmVudHMuT1BFUkFUSU9OU19MT0FERUQ6XG4gICAgICAgIGhhcyhhY3Rpb24sICdvcGVyYXRpb25zJyk7XG4gICAgICAgIGlmIChhY3Rpb24ub3BlcmF0aW9ucy5sZW5ndGggPiAwKVxuICAgICAgICAgICAgYXNzZXJ0KGFjdGlvbi5vcGVyYXRpb25zWzBdIGluc3RhbmNlb2YgT3BlcmF0aW9uKTtcbiAgICAgICAgc3RvcmUub3BlcmF0aW9ucyA9IGFjdGlvbi5vcGVyYXRpb25zO1xuICAgICAgICBzdG9yZS5lbWl0KEV2ZW50cy5PUEVSQVRJT05TX0xPQURFRCk7XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBjYXNlIEV2ZW50cy5SRVRSSUVWRV9PUEVSQVRJT05TX1FVRVJJRUQ6XG4gICAgICAgIHN0b3JlLmZldGNoT3BlcmF0aW9ucygpO1xuICAgICAgICBicmVhaztcblxuICAgICAgY2FzZSBFdmVudHMuU0VMRUNURURfQUNDT1VOVF9DSEFOR0VEOlxuICAgICAgICBoYXMoYWN0aW9uLCAnYWNjb3VudCcpO1xuICAgICAgICBhc3NlcnQoYWN0aW9uLmFjY291bnQgaW5zdGFuY2VvZiBBY2NvdW50KTtcbiAgICAgICAgc3RvcmUuY3VycmVudEFjY291bnQgPSBhY3Rpb24uYWNjb3VudDtcbiAgICAgICAgc3RvcmUubG9hZE9wZXJhdGlvbnNGb3IoYWN0aW9uLmFjY291bnQpO1xuICAgICAgICBicmVhaztcblxuICAgICAgY2FzZSBFdmVudHMuU0VMRUNURURfQkFOS19DSEFOR0VEOlxuICAgICAgICBoYXMoYWN0aW9uLCAnYmFuaycpO1xuICAgICAgICBhc3NlcnQoYWN0aW9uLmJhbmsgaW5zdGFuY2VvZiBCYW5rKTtcbiAgICAgICAgc3RvcmUuY3VycmVudEJhbmsgPSBhY3Rpb24uYmFuaztcbiAgICAgICAgc3RvcmUubG9hZEFsbEFjY291bnRzKCk7XG4gICAgICAgIHN0b3JlLmVtaXQoRXZlbnRzLlNFTEVDVEVEX0JBTktfQ0hBTkdFRCk7XG4gICAgICAgIGJyZWFrO1xuXG4gICAgfVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gc3RvcmU7XG4iLCIvLyBDb3B5cmlnaHQgSm95ZW50LCBJbmMuIGFuZCBvdGhlciBOb2RlIGNvbnRyaWJ1dG9ycy5cbi8vXG4vLyBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYVxuLy8gY29weSBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZVxuLy8gXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbCBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nXG4vLyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0cyB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsXG4vLyBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbCBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0XG4vLyBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGVcbi8vIGZvbGxvd2luZyBjb25kaXRpb25zOlxuLy9cbi8vIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkXG4vLyBpbiBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cbi8vXG4vLyBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTXG4vLyBPUiBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GXG4vLyBNRVJDSEFOVEFCSUxJVFksIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOXG4vLyBOTyBFVkVOVCBTSEFMTCBUSEUgQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSxcbi8vIERBTUFHRVMgT1IgT1RIRVIgTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUlxuLy8gT1RIRVJXSVNFLCBBUklTSU5HIEZST00sIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRVxuLy8gVVNFIE9SIE9USEVSIERFQUxJTkdTIElOIFRIRSBTT0ZUV0FSRS5cblxuZnVuY3Rpb24gRXZlbnRFbWl0dGVyKCkge1xuICB0aGlzLl9ldmVudHMgPSB0aGlzLl9ldmVudHMgfHwge307XG4gIHRoaXMuX21heExpc3RlbmVycyA9IHRoaXMuX21heExpc3RlbmVycyB8fCB1bmRlZmluZWQ7XG59XG5tb2R1bGUuZXhwb3J0cyA9IEV2ZW50RW1pdHRlcjtcblxuLy8gQmFja3dhcmRzLWNvbXBhdCB3aXRoIG5vZGUgMC4xMC54XG5FdmVudEVtaXR0ZXIuRXZlbnRFbWl0dGVyID0gRXZlbnRFbWl0dGVyO1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLl9ldmVudHMgPSB1bmRlZmluZWQ7XG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLl9tYXhMaXN0ZW5lcnMgPSB1bmRlZmluZWQ7XG5cbi8vIEJ5IGRlZmF1bHQgRXZlbnRFbWl0dGVycyB3aWxsIHByaW50IGEgd2FybmluZyBpZiBtb3JlIHRoYW4gMTAgbGlzdGVuZXJzIGFyZVxuLy8gYWRkZWQgdG8gaXQuIFRoaXMgaXMgYSB1c2VmdWwgZGVmYXVsdCB3aGljaCBoZWxwcyBmaW5kaW5nIG1lbW9yeSBsZWFrcy5cbkV2ZW50RW1pdHRlci5kZWZhdWx0TWF4TGlzdGVuZXJzID0gMTA7XG5cbi8vIE9idmlvdXNseSBub3QgYWxsIEVtaXR0ZXJzIHNob3VsZCBiZSBsaW1pdGVkIHRvIDEwLiBUaGlzIGZ1bmN0aW9uIGFsbG93c1xuLy8gdGhhdCB0byBiZSBpbmNyZWFzZWQuIFNldCB0byB6ZXJvIGZvciB1bmxpbWl0ZWQuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLnNldE1heExpc3RlbmVycyA9IGZ1bmN0aW9uKG4pIHtcbiAgaWYgKCFpc051bWJlcihuKSB8fCBuIDwgMCB8fCBpc05hTihuKSlcbiAgICB0aHJvdyBUeXBlRXJyb3IoJ24gbXVzdCBiZSBhIHBvc2l0aXZlIG51bWJlcicpO1xuICB0aGlzLl9tYXhMaXN0ZW5lcnMgPSBuO1xuICByZXR1cm4gdGhpcztcbn07XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuZW1pdCA9IGZ1bmN0aW9uKHR5cGUpIHtcbiAgdmFyIGVyLCBoYW5kbGVyLCBsZW4sIGFyZ3MsIGksIGxpc3RlbmVycztcblxuICBpZiAoIXRoaXMuX2V2ZW50cylcbiAgICB0aGlzLl9ldmVudHMgPSB7fTtcblxuICAvLyBJZiB0aGVyZSBpcyBubyAnZXJyb3InIGV2ZW50IGxpc3RlbmVyIHRoZW4gdGhyb3cuXG4gIGlmICh0eXBlID09PSAnZXJyb3InKSB7XG4gICAgaWYgKCF0aGlzLl9ldmVudHMuZXJyb3IgfHxcbiAgICAgICAgKGlzT2JqZWN0KHRoaXMuX2V2ZW50cy5lcnJvcikgJiYgIXRoaXMuX2V2ZW50cy5lcnJvci5sZW5ndGgpKSB7XG4gICAgICBlciA9IGFyZ3VtZW50c1sxXTtcbiAgICAgIGlmIChlciBpbnN0YW5jZW9mIEVycm9yKSB7XG4gICAgICAgIHRocm93IGVyOyAvLyBVbmhhbmRsZWQgJ2Vycm9yJyBldmVudFxuICAgICAgfVxuICAgICAgdGhyb3cgVHlwZUVycm9yKCdVbmNhdWdodCwgdW5zcGVjaWZpZWQgXCJlcnJvclwiIGV2ZW50LicpO1xuICAgIH1cbiAgfVxuXG4gIGhhbmRsZXIgPSB0aGlzLl9ldmVudHNbdHlwZV07XG5cbiAgaWYgKGlzVW5kZWZpbmVkKGhhbmRsZXIpKVxuICAgIHJldHVybiBmYWxzZTtcblxuICBpZiAoaXNGdW5jdGlvbihoYW5kbGVyKSkge1xuICAgIHN3aXRjaCAoYXJndW1lbnRzLmxlbmd0aCkge1xuICAgICAgLy8gZmFzdCBjYXNlc1xuICAgICAgY2FzZSAxOlxuICAgICAgICBoYW5kbGVyLmNhbGwodGhpcyk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAyOlxuICAgICAgICBoYW5kbGVyLmNhbGwodGhpcywgYXJndW1lbnRzWzFdKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIDM6XG4gICAgICAgIGhhbmRsZXIuY2FsbCh0aGlzLCBhcmd1bWVudHNbMV0sIGFyZ3VtZW50c1syXSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgLy8gc2xvd2VyXG4gICAgICBkZWZhdWx0OlxuICAgICAgICBsZW4gPSBhcmd1bWVudHMubGVuZ3RoO1xuICAgICAgICBhcmdzID0gbmV3IEFycmF5KGxlbiAtIDEpO1xuICAgICAgICBmb3IgKGkgPSAxOyBpIDwgbGVuOyBpKyspXG4gICAgICAgICAgYXJnc1tpIC0gMV0gPSBhcmd1bWVudHNbaV07XG4gICAgICAgIGhhbmRsZXIuYXBwbHkodGhpcywgYXJncyk7XG4gICAgfVxuICB9IGVsc2UgaWYgKGlzT2JqZWN0KGhhbmRsZXIpKSB7XG4gICAgbGVuID0gYXJndW1lbnRzLmxlbmd0aDtcbiAgICBhcmdzID0gbmV3IEFycmF5KGxlbiAtIDEpO1xuICAgIGZvciAoaSA9IDE7IGkgPCBsZW47IGkrKylcbiAgICAgIGFyZ3NbaSAtIDFdID0gYXJndW1lbnRzW2ldO1xuXG4gICAgbGlzdGVuZXJzID0gaGFuZGxlci5zbGljZSgpO1xuICAgIGxlbiA9IGxpc3RlbmVycy5sZW5ndGg7XG4gICAgZm9yIChpID0gMDsgaSA8IGxlbjsgaSsrKVxuICAgICAgbGlzdGVuZXJzW2ldLmFwcGx5KHRoaXMsIGFyZ3MpO1xuICB9XG5cbiAgcmV0dXJuIHRydWU7XG59O1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLmFkZExpc3RlbmVyID0gZnVuY3Rpb24odHlwZSwgbGlzdGVuZXIpIHtcbiAgdmFyIG07XG5cbiAgaWYgKCFpc0Z1bmN0aW9uKGxpc3RlbmVyKSlcbiAgICB0aHJvdyBUeXBlRXJyb3IoJ2xpc3RlbmVyIG11c3QgYmUgYSBmdW5jdGlvbicpO1xuXG4gIGlmICghdGhpcy5fZXZlbnRzKVxuICAgIHRoaXMuX2V2ZW50cyA9IHt9O1xuXG4gIC8vIFRvIGF2b2lkIHJlY3Vyc2lvbiBpbiB0aGUgY2FzZSB0aGF0IHR5cGUgPT09IFwibmV3TGlzdGVuZXJcIiEgQmVmb3JlXG4gIC8vIGFkZGluZyBpdCB0byB0aGUgbGlzdGVuZXJzLCBmaXJzdCBlbWl0IFwibmV3TGlzdGVuZXJcIi5cbiAgaWYgKHRoaXMuX2V2ZW50cy5uZXdMaXN0ZW5lcilcbiAgICB0aGlzLmVtaXQoJ25ld0xpc3RlbmVyJywgdHlwZSxcbiAgICAgICAgICAgICAgaXNGdW5jdGlvbihsaXN0ZW5lci5saXN0ZW5lcikgP1xuICAgICAgICAgICAgICBsaXN0ZW5lci5saXN0ZW5lciA6IGxpc3RlbmVyKTtcblxuICBpZiAoIXRoaXMuX2V2ZW50c1t0eXBlXSlcbiAgICAvLyBPcHRpbWl6ZSB0aGUgY2FzZSBvZiBvbmUgbGlzdGVuZXIuIERvbid0IG5lZWQgdGhlIGV4dHJhIGFycmF5IG9iamVjdC5cbiAgICB0aGlzLl9ldmVudHNbdHlwZV0gPSBsaXN0ZW5lcjtcbiAgZWxzZSBpZiAoaXNPYmplY3QodGhpcy5fZXZlbnRzW3R5cGVdKSlcbiAgICAvLyBJZiB3ZSd2ZSBhbHJlYWR5IGdvdCBhbiBhcnJheSwganVzdCBhcHBlbmQuXG4gICAgdGhpcy5fZXZlbnRzW3R5cGVdLnB1c2gobGlzdGVuZXIpO1xuICBlbHNlXG4gICAgLy8gQWRkaW5nIHRoZSBzZWNvbmQgZWxlbWVudCwgbmVlZCB0byBjaGFuZ2UgdG8gYXJyYXkuXG4gICAgdGhpcy5fZXZlbnRzW3R5cGVdID0gW3RoaXMuX2V2ZW50c1t0eXBlXSwgbGlzdGVuZXJdO1xuXG4gIC8vIENoZWNrIGZvciBsaXN0ZW5lciBsZWFrXG4gIGlmIChpc09iamVjdCh0aGlzLl9ldmVudHNbdHlwZV0pICYmICF0aGlzLl9ldmVudHNbdHlwZV0ud2FybmVkKSB7XG4gICAgdmFyIG07XG4gICAgaWYgKCFpc1VuZGVmaW5lZCh0aGlzLl9tYXhMaXN0ZW5lcnMpKSB7XG4gICAgICBtID0gdGhpcy5fbWF4TGlzdGVuZXJzO1xuICAgIH0gZWxzZSB7XG4gICAgICBtID0gRXZlbnRFbWl0dGVyLmRlZmF1bHRNYXhMaXN0ZW5lcnM7XG4gICAgfVxuXG4gICAgaWYgKG0gJiYgbSA+IDAgJiYgdGhpcy5fZXZlbnRzW3R5cGVdLmxlbmd0aCA+IG0pIHtcbiAgICAgIHRoaXMuX2V2ZW50c1t0eXBlXS53YXJuZWQgPSB0cnVlO1xuICAgICAgY29uc29sZS5lcnJvcignKG5vZGUpIHdhcm5pbmc6IHBvc3NpYmxlIEV2ZW50RW1pdHRlciBtZW1vcnkgJyArXG4gICAgICAgICAgICAgICAgICAgICdsZWFrIGRldGVjdGVkLiAlZCBsaXN0ZW5lcnMgYWRkZWQuICcgK1xuICAgICAgICAgICAgICAgICAgICAnVXNlIGVtaXR0ZXIuc2V0TWF4TGlzdGVuZXJzKCkgdG8gaW5jcmVhc2UgbGltaXQuJyxcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fZXZlbnRzW3R5cGVdLmxlbmd0aCk7XG4gICAgICBpZiAodHlwZW9mIGNvbnNvbGUudHJhY2UgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgLy8gbm90IHN1cHBvcnRlZCBpbiBJRSAxMFxuICAgICAgICBjb25zb2xlLnRyYWNlKCk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLm9uID0gRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5hZGRMaXN0ZW5lcjtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5vbmNlID0gZnVuY3Rpb24odHlwZSwgbGlzdGVuZXIpIHtcbiAgaWYgKCFpc0Z1bmN0aW9uKGxpc3RlbmVyKSlcbiAgICB0aHJvdyBUeXBlRXJyb3IoJ2xpc3RlbmVyIG11c3QgYmUgYSBmdW5jdGlvbicpO1xuXG4gIHZhciBmaXJlZCA9IGZhbHNlO1xuXG4gIGZ1bmN0aW9uIGcoKSB7XG4gICAgdGhpcy5yZW1vdmVMaXN0ZW5lcih0eXBlLCBnKTtcblxuICAgIGlmICghZmlyZWQpIHtcbiAgICAgIGZpcmVkID0gdHJ1ZTtcbiAgICAgIGxpc3RlbmVyLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgfVxuICB9XG5cbiAgZy5saXN0ZW5lciA9IGxpc3RlbmVyO1xuICB0aGlzLm9uKHR5cGUsIGcpO1xuXG4gIHJldHVybiB0aGlzO1xufTtcblxuLy8gZW1pdHMgYSAncmVtb3ZlTGlzdGVuZXInIGV2ZW50IGlmZiB0aGUgbGlzdGVuZXIgd2FzIHJlbW92ZWRcbkV2ZW50RW1pdHRlci5wcm90b3R5cGUucmVtb3ZlTGlzdGVuZXIgPSBmdW5jdGlvbih0eXBlLCBsaXN0ZW5lcikge1xuICB2YXIgbGlzdCwgcG9zaXRpb24sIGxlbmd0aCwgaTtcblxuICBpZiAoIWlzRnVuY3Rpb24obGlzdGVuZXIpKVxuICAgIHRocm93IFR5cGVFcnJvcignbGlzdGVuZXIgbXVzdCBiZSBhIGZ1bmN0aW9uJyk7XG5cbiAgaWYgKCF0aGlzLl9ldmVudHMgfHwgIXRoaXMuX2V2ZW50c1t0eXBlXSlcbiAgICByZXR1cm4gdGhpcztcblxuICBsaXN0ID0gdGhpcy5fZXZlbnRzW3R5cGVdO1xuICBsZW5ndGggPSBsaXN0Lmxlbmd0aDtcbiAgcG9zaXRpb24gPSAtMTtcblxuICBpZiAobGlzdCA9PT0gbGlzdGVuZXIgfHxcbiAgICAgIChpc0Z1bmN0aW9uKGxpc3QubGlzdGVuZXIpICYmIGxpc3QubGlzdGVuZXIgPT09IGxpc3RlbmVyKSkge1xuICAgIGRlbGV0ZSB0aGlzLl9ldmVudHNbdHlwZV07XG4gICAgaWYgKHRoaXMuX2V2ZW50cy5yZW1vdmVMaXN0ZW5lcilcbiAgICAgIHRoaXMuZW1pdCgncmVtb3ZlTGlzdGVuZXInLCB0eXBlLCBsaXN0ZW5lcik7XG5cbiAgfSBlbHNlIGlmIChpc09iamVjdChsaXN0KSkge1xuICAgIGZvciAoaSA9IGxlbmd0aDsgaS0tID4gMDspIHtcbiAgICAgIGlmIChsaXN0W2ldID09PSBsaXN0ZW5lciB8fFxuICAgICAgICAgIChsaXN0W2ldLmxpc3RlbmVyICYmIGxpc3RbaV0ubGlzdGVuZXIgPT09IGxpc3RlbmVyKSkge1xuICAgICAgICBwb3NpdGlvbiA9IGk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChwb3NpdGlvbiA8IDApXG4gICAgICByZXR1cm4gdGhpcztcblxuICAgIGlmIChsaXN0Lmxlbmd0aCA9PT0gMSkge1xuICAgICAgbGlzdC5sZW5ndGggPSAwO1xuICAgICAgZGVsZXRlIHRoaXMuX2V2ZW50c1t0eXBlXTtcbiAgICB9IGVsc2Uge1xuICAgICAgbGlzdC5zcGxpY2UocG9zaXRpb24sIDEpO1xuICAgIH1cblxuICAgIGlmICh0aGlzLl9ldmVudHMucmVtb3ZlTGlzdGVuZXIpXG4gICAgICB0aGlzLmVtaXQoJ3JlbW92ZUxpc3RlbmVyJywgdHlwZSwgbGlzdGVuZXIpO1xuICB9XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLnJlbW92ZUFsbExpc3RlbmVycyA9IGZ1bmN0aW9uKHR5cGUpIHtcbiAgdmFyIGtleSwgbGlzdGVuZXJzO1xuXG4gIGlmICghdGhpcy5fZXZlbnRzKVxuICAgIHJldHVybiB0aGlzO1xuXG4gIC8vIG5vdCBsaXN0ZW5pbmcgZm9yIHJlbW92ZUxpc3RlbmVyLCBubyBuZWVkIHRvIGVtaXRcbiAgaWYgKCF0aGlzLl9ldmVudHMucmVtb3ZlTGlzdGVuZXIpIHtcbiAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMClcbiAgICAgIHRoaXMuX2V2ZW50cyA9IHt9O1xuICAgIGVsc2UgaWYgKHRoaXMuX2V2ZW50c1t0eXBlXSlcbiAgICAgIGRlbGV0ZSB0aGlzLl9ldmVudHNbdHlwZV07XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvLyBlbWl0IHJlbW92ZUxpc3RlbmVyIGZvciBhbGwgbGlzdGVuZXJzIG9uIGFsbCBldmVudHNcbiAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDApIHtcbiAgICBmb3IgKGtleSBpbiB0aGlzLl9ldmVudHMpIHtcbiAgICAgIGlmIChrZXkgPT09ICdyZW1vdmVMaXN0ZW5lcicpIGNvbnRpbnVlO1xuICAgICAgdGhpcy5yZW1vdmVBbGxMaXN0ZW5lcnMoa2V5KTtcbiAgICB9XG4gICAgdGhpcy5yZW1vdmVBbGxMaXN0ZW5lcnMoJ3JlbW92ZUxpc3RlbmVyJyk7XG4gICAgdGhpcy5fZXZlbnRzID0ge307XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBsaXN0ZW5lcnMgPSB0aGlzLl9ldmVudHNbdHlwZV07XG5cbiAgaWYgKGlzRnVuY3Rpb24obGlzdGVuZXJzKSkge1xuICAgIHRoaXMucmVtb3ZlTGlzdGVuZXIodHlwZSwgbGlzdGVuZXJzKTtcbiAgfSBlbHNlIHtcbiAgICAvLyBMSUZPIG9yZGVyXG4gICAgd2hpbGUgKGxpc3RlbmVycy5sZW5ndGgpXG4gICAgICB0aGlzLnJlbW92ZUxpc3RlbmVyKHR5cGUsIGxpc3RlbmVyc1tsaXN0ZW5lcnMubGVuZ3RoIC0gMV0pO1xuICB9XG4gIGRlbGV0ZSB0aGlzLl9ldmVudHNbdHlwZV07XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLmxpc3RlbmVycyA9IGZ1bmN0aW9uKHR5cGUpIHtcbiAgdmFyIHJldDtcbiAgaWYgKCF0aGlzLl9ldmVudHMgfHwgIXRoaXMuX2V2ZW50c1t0eXBlXSlcbiAgICByZXQgPSBbXTtcbiAgZWxzZSBpZiAoaXNGdW5jdGlvbih0aGlzLl9ldmVudHNbdHlwZV0pKVxuICAgIHJldCA9IFt0aGlzLl9ldmVudHNbdHlwZV1dO1xuICBlbHNlXG4gICAgcmV0ID0gdGhpcy5fZXZlbnRzW3R5cGVdLnNsaWNlKCk7XG4gIHJldHVybiByZXQ7XG59O1xuXG5FdmVudEVtaXR0ZXIubGlzdGVuZXJDb3VudCA9IGZ1bmN0aW9uKGVtaXR0ZXIsIHR5cGUpIHtcbiAgdmFyIHJldDtcbiAgaWYgKCFlbWl0dGVyLl9ldmVudHMgfHwgIWVtaXR0ZXIuX2V2ZW50c1t0eXBlXSlcbiAgICByZXQgPSAwO1xuICBlbHNlIGlmIChpc0Z1bmN0aW9uKGVtaXR0ZXIuX2V2ZW50c1t0eXBlXSkpXG4gICAgcmV0ID0gMTtcbiAgZWxzZVxuICAgIHJldCA9IGVtaXR0ZXIuX2V2ZW50c1t0eXBlXS5sZW5ndGg7XG4gIHJldHVybiByZXQ7XG59O1xuXG5mdW5jdGlvbiBpc0Z1bmN0aW9uKGFyZykge1xuICByZXR1cm4gdHlwZW9mIGFyZyA9PT0gJ2Z1bmN0aW9uJztcbn1cblxuZnVuY3Rpb24gaXNOdW1iZXIoYXJnKSB7XG4gIHJldHVybiB0eXBlb2YgYXJnID09PSAnbnVtYmVyJztcbn1cblxuZnVuY3Rpb24gaXNPYmplY3QoYXJnKSB7XG4gIHJldHVybiB0eXBlb2YgYXJnID09PSAnb2JqZWN0JyAmJiBhcmcgIT09IG51bGw7XG59XG5cbmZ1bmN0aW9uIGlzVW5kZWZpbmVkKGFyZykge1xuICByZXR1cm4gYXJnID09PSB2b2lkIDA7XG59XG4iXX0=
