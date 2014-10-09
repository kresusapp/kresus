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
    return assert(maybeHas(obj, prop));
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
                React.DOM.button({onClick: this._onClickPosNeg}, "Ins / outs over time")
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
                    React.DOM.h3(null, "Total: ", this.getTotal())
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
            operations.push(o);
        }

        flux.dispatch({
            type: Events.OPERATIONS_LOADED,
            operations: operations
        });
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2Jlbi9jb2RlL2NvenkvZGV2L2tyZXN1cy9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwiL2hvbWUvYmVuL2NvZGUvY296eS9kZXYva3Jlc3VzL2NsaWVudC9FdmVudHMuanMiLCIvaG9tZS9iZW4vY29kZS9jb3p5L2Rldi9rcmVzdXMvY2xpZW50L0hlbHBlcnMuanMiLCIvaG9tZS9iZW4vY29kZS9jb3p5L2Rldi9rcmVzdXMvY2xpZW50L01vZGVscy5qcyIsIi9ob21lL2Jlbi9jb2RlL2NvenkvZGV2L2tyZXN1cy9jbGllbnQvY29tcG9uZW50cy9BY2NvdW50TGlzdENvbXBvbmVudC5qcyIsIi9ob21lL2Jlbi9jb2RlL2NvenkvZGV2L2tyZXN1cy9jbGllbnQvY29tcG9uZW50cy9CYW5rTGlzdENvbXBvbmVudC5qcyIsIi9ob21lL2Jlbi9jb2RlL2NvenkvZGV2L2tyZXN1cy9jbGllbnQvY29tcG9uZW50cy9DYXRlZ29yeUNvbXBvbmVudC5qcyIsIi9ob21lL2Jlbi9jb2RlL2NvenkvZGV2L2tyZXN1cy9jbGllbnQvY29tcG9uZW50cy9DaGFydENvbXBvbmVudC5qcyIsIi9ob21lL2Jlbi9jb2RlL2NvenkvZGV2L2tyZXN1cy9jbGllbnQvY29tcG9uZW50cy9PcGVyYXRpb25MaXN0Q29tcG9uZW50LmpzIiwiL2hvbWUvYmVuL2NvZGUvY296eS9kZXYva3Jlc3VzL2NsaWVudC9jb21wb25lbnRzL1NpbWlsYXJpdHlDb21wb25lbnQuanMiLCIvaG9tZS9iZW4vY29kZS9jb3p5L2Rldi9rcmVzdXMvY2xpZW50L2ZsdXgvZGlzcGF0Y2hlci5qcyIsIi9ob21lL2Jlbi9jb2RlL2NvenkvZGV2L2tyZXN1cy9jbGllbnQvZmx1eC9pbnZhcmlhbnQuanMiLCIvaG9tZS9iZW4vY29kZS9jb3p5L2Rldi9rcmVzdXMvY2xpZW50L21haW4uanMiLCIvaG9tZS9iZW4vY29kZS9jb3p5L2Rldi9rcmVzdXMvY2xpZW50L3N0b3JlLmpzIiwiL2hvbWUvYmVuL2NvZGUvY296eS9kZXYva3Jlc3VzL25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9ldmVudHMvZXZlbnRzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9GQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pXQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMVBBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeFBBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dGhyb3cgbmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKX12YXIgZj1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwoZi5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxmLGYuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwidmFyIEV2ZW50cyA9IG1vZHVsZS5leHBvcnRzID0ge1xuICAgIEFDQ09VTlRTX0xPQURFRDogJ2FjY291bnQgaGF2ZSBqdXN0IGJlZW4gbG9hZGVkJyxcbiAgICBCQU5LX0xJU1RfTE9BREVEOiAnYmFuayBsaXN0IGhhcyBqdXN0IGJlZW4gbG9hZGVkJyxcbiAgICBDQVRFR09SSUVTX0xPQURFRDogJ2NhdGVnb3JpZXMgaGF2ZSBqdXN0IGJlZW4gbG9hZGVkJyxcbiAgICBDQVRFR09SWV9DUkVBVEVEOiAndGhlIHVzZXIgY3JlYXRlZCBhIGNhdGVnb3J5JyxcbiAgICBDQVRFR09SWV9TQVZFRDogJ3RoZSBjYXRlZ29yeSB3YXMgc2F2ZWQgb24gdGhlIHNlcnZlcicsXG4gICAgREVMRVRFX09QRVJBVElPTjogJ3RoZSB1c2VyIGFza2VkIHRvIGRlbGV0ZSBhbiBvcGVyYXRpb24nLFxuICAgIERFTEVURURfT1BFUkFUSU9OOiAnYW4gb3BlcmF0aW9uIGhhcyBqdXN0IGJlZW4gZGVsZXRlZCBvbiB0aGUgc2VydmVyJyxcbiAgICBPUEVSQVRJT05TX0xPQURFRDogJ29wZXJhdGlvbnMgaGF2ZSBiZWVuIGxvYWRlZCcsXG4gICAgT1BFUkFUSU9OX0NBVEVHT1JZX0NIQU5HRUQ6ICd1c2VyIGNoYW5nZWQgdGhlIGNhdGVnb3J5IG9mIGFuIG9wZXJhdGlvbicsXG4gICAgT1BFUkFUSU9OX0NBVEVHT1JZX1NBVkVEOiAndGhlIGNhdGVnb3J5IGZvciBhbiBvcGVyYXRpb24gd2FzIHNldCBvbiB0aGUgc2VydmVyJyxcbiAgICBTRUxFQ1RFRF9BQ0NPVU5UX0NIQU5HRUQ6ICdzb21ldGhpbmcgY2hhbmdlZCB0aGUgc2VsZWN0ZWQgYWNjb3VudCcsXG4gICAgU0VMRUNURURfQkFOS19DSEFOR0VEOiAnc29tZXRoaW5nIGNoYW5nZWQgdGhlIHNlbGVjdGVkIGJhbmsnXG59O1xuIiwiLypcbiAqIEhFTFBFUlNcbiAqL1xuXG5jb25zdCBERUJVRyA9IHRydWU7XG5jb25zdCBBU1NFUlRTID0gdHJ1ZTtcblxudmFyIGRlYnVnID0gZXhwb3J0cy5kZWJ1ZyA9IGZ1bmN0aW9uKCkge1xuICAgIERFQlVHICYmIGNvbnNvbGUubG9nLmFwcGx5KGNvbnNvbGUsIGFyZ3VtZW50cyk7XG59O1xuXG52YXIgYXNzZXJ0ID0gZXhwb3J0cy5hc3NlcnQgPSBmdW5jdGlvbih4LCB3YXQpIHtcbiAgICBpZiAoIXgpIHtcbiAgICAgICAgdmFyIHRleHQgPSAnQXNzZXJ0aW9uIGVycm9yOiAnICsgKHdhdD93YXQ6JycpICsgJ1xcbicgKyBuZXcgRXJyb3IoKS5zdGFjaztcbiAgICAgICAgQVNTRVJUUyAmJiBhbGVydCh0ZXh0KTtcbiAgICAgICAgY29uc29sZS5sb2codGV4dCk7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgcmV0dXJuIHRydWU7XG59O1xuXG52YXIgbWF5YmVIYXMgPSBleHBvcnRzLm1heWJlSGFzID0gZnVuY3Rpb24ob2JqLCBwcm9wKSB7XG4gICAgcmV0dXJuIG9iai5oYXNPd25Qcm9wZXJ0eShwcm9wKTtcbn1cblxuZXhwb3J0cy5oYXMgPSBmdW5jdGlvbiBoYXMob2JqLCBwcm9wKSB7XG4gICAgcmV0dXJuIGFzc2VydChtYXliZUhhcyhvYmosIHByb3ApKTtcbn1cblxuZXhwb3J0cy54aHJFcnJvciA9IGZ1bmN0aW9uIHhockVycm9yKHhociwgdGV4dFN0YXR1cywgZXJyKSB7XG4gICAgYWxlcnQoJ3hociBlcnJvcjogJyArIHRleHRTdGF0dXMgKyAnXFxuJyArIGVycik7XG59XG5cbiIsInZhciBoYXMgPSByZXF1aXJlKCcuL0hlbHBlcnMnKS5oYXM7XG52YXIgbWF5YmVIYXMgPSByZXF1aXJlKCcuL0hlbHBlcnMnKS5tYXliZUhhcztcblxuZXhwb3J0cy5CYW5rID0gZnVuY3Rpb24gQmFuayhhcmcpIHtcbiAgICB0aGlzLmlkICAgPSBoYXMoYXJnLCAnaWQnKSAgICYmIGFyZy5pZDtcbiAgICB0aGlzLm5hbWUgPSBoYXMoYXJnLCAnbmFtZScpICYmIGFyZy5uYW1lO1xuICAgIHRoaXMudXVpZCA9IGhhcyhhcmcsICd1dWlkJykgJiYgYXJnLnV1aWQ7XG59XG5cbmV4cG9ydHMuQWNjb3VudCA9IGZ1bmN0aW9uIEFjY291bnQoYXJnKSB7XG4gICAgdGhpcy5iYW5rICAgICAgICAgID0gaGFzKGFyZywgJ2JhbmsnKSAmJiBhcmcuYmFuaztcbiAgICB0aGlzLmJhbmtBY2Nlc3MgICAgPSBoYXMoYXJnLCAnYmFua0FjY2VzcycpICYmIGFyZy5iYW5rQWNjZXNzO1xuICAgIHRoaXMudGl0bGUgICAgICAgICA9IGhhcyhhcmcsICd0aXRsZScpICYmIGFyZy50aXRsZTtcbiAgICB0aGlzLmFjY291bnROdW1iZXIgPSBoYXMoYXJnLCAnYWNjb3VudE51bWJlcicpICYmIGFyZy5hY2NvdW50TnVtYmVyO1xuICAgIHRoaXMuaW5pdGlhbEFtb3VudCA9IGhhcyhhcmcsICdpbml0aWFsQW1vdW50JykgJiYgYXJnLmluaXRpYWxBbW91bnQ7XG4gICAgdGhpcy5sYXN0Q2hlY2tlZCAgID0gaGFzKGFyZywgJ2xhc3RDaGVja2VkJykgJiYgbmV3IERhdGUoYXJnLmxhc3RDaGVja2VkKTtcbiAgICB0aGlzLmlkICAgICAgICAgICAgPSBoYXMoYXJnLCAnaWQnKSAmJiBhcmcuaWQ7XG4gICAgdGhpcy5hbW91bnQgICAgICAgID0gaGFzKGFyZywgJ2Ftb3VudCcpICYmIGFyZy5hbW91bnQ7XG59XG5cbmZ1bmN0aW9uIE9wZXJhdGlvbihhcmcpIHtcbiAgICB0aGlzLmJhbmtBY2NvdW50ID0gaGFzKGFyZywgJ2JhbmtBY2NvdW50JykgJiYgYXJnLmJhbmtBY2NvdW50O1xuICAgIHRoaXMudGl0bGUgICAgICAgPSBoYXMoYXJnLCAndGl0bGUnKSAmJiBhcmcudGl0bGU7XG4gICAgdGhpcy5kYXRlICAgICAgICA9IGhhcyhhcmcsICdkYXRlJykgJiYgbmV3IERhdGUoYXJnLmRhdGUpO1xuICAgIHRoaXMuYW1vdW50ICAgICAgPSBoYXMoYXJnLCAnYW1vdW50JykgJiYgYXJnLmFtb3VudDtcbiAgICB0aGlzLnJhdyAgICAgICAgID0gaGFzKGFyZywgJ3JhdycpICYmIGFyZy5yYXc7XG4gICAgdGhpcy5kYXRlSW1wb3J0ICA9IChtYXliZUhhcyhhcmcsICdkYXRlSW1wb3J0JykgJiYgbmV3IERhdGUoYXJnLmRhdGVJbXBvcnQpKSB8fCAwO1xuICAgIHRoaXMuaWQgICAgICAgICAgPSBoYXMoYXJnLCAnaWQnKSAmJiBhcmcuaWQ7XG4gICAgdGhpcy5jYXRlZ29yeUlkICA9IGFyZy5jYXRlZ29yeUlkIHx8IC0xO1xufVxuXG5leHBvcnRzLk9wZXJhdGlvbiA9IE9wZXJhdGlvbjtcblxuZnVuY3Rpb24gQ2F0ZWdvcnkoYXJnKSB7XG4gICAgdGhpcy50aXRsZSA9IGhhcyhhcmcsICd0aXRsZScpICYmIGFyZy50aXRsZTtcbiAgICB0aGlzLmlkID0gaGFzKGFyZywgJ2lkJykgJiYgYXJnLmlkO1xuXG4gICAgLy8gT3B0aW9uYWxcbiAgICB0aGlzLnBhcmVudElkID0gYXJnLnBhcmVudElkO1xufVxuXG5leHBvcnRzLkNhdGVnb3J5ID0gQ2F0ZWdvcnk7XG4iLCIvKiogQGpzeCBSZWFjdC5ET00gKi9cblxuLy8gQ29uc3RhbnRzXG52YXIgRXZlbnRzID0gcmVxdWlyZSgnLi4vRXZlbnRzJyk7XG52YXIgZGVidWcgPSByZXF1aXJlKCcuLi9IZWxwZXJzJykuZGVidWc7XG5cbi8vIEdsb2JhbCB2YXJpYWJsZXNcbnZhciBzdG9yZSA9IHJlcXVpcmUoJy4uL3N0b3JlJyk7XG52YXIgZmx1eCA9IHJlcXVpcmUoJy4uL2ZsdXgvZGlzcGF0Y2hlcicpO1xuXG4vLyBQcm9wczogYWNjb3VudDogQWNjb3VudFxudmFyIEFjY291bnRMaXN0SXRlbSA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtkaXNwbGF5TmFtZTogJ0FjY291bnRMaXN0SXRlbScsXG5cbiAgICBfb25DbGljazogZnVuY3Rpb24oKSB7XG4gICAgICAgIGRlYnVnKCdjbGljayBvbiBhIHBhcnRpY3VsYXIgYWNjb3VudCcpO1xuICAgICAgICBmbHV4LmRpc3BhdGNoKHtcbiAgICAgICAgICAgIHR5cGU6IEV2ZW50cy5TRUxFQ1RFRF9BQ0NPVU5UX0NIQU5HRUQsXG4gICAgICAgICAgICBhY2NvdW50OiB0aGlzLnByb3BzLmFjY291bnRcbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIHJlbmRlcjogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICBSZWFjdC5ET00ubGkobnVsbCwgXG4gICAgICAgICAgICAgICAgUmVhY3QuRE9NLmEoe29uQ2xpY2s6IHRoaXMuX29uQ2xpY2t9LCB0aGlzLnByb3BzLmFjY291bnQudGl0bGUpXG4gICAgICAgICAgICApXG4gICAgICAgICk7XG4gICAgfVxufSk7XG5cbi8vIFN0YXRlOiBhY2NvdW50czogW0FjY291bnRdXG52YXIgQWNjb3VudExpc3RDb21wb25lbnQgPSBtb2R1bGUuZXhwb3J0cyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtkaXNwbGF5TmFtZTogJ2V4cG9ydHMnLFxuXG4gICAgZ2V0SW5pdGlhbFN0YXRlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGFjY291bnRzOiBbXVxuICAgICAgICB9O1xuICAgIH0sXG5cbiAgICBfbGlzdGVuZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgIGFjY291bnRzOiBzdG9yZS5hY2NvdW50c1xuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgY29tcG9uZW50RGlkTW91bnQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICBzdG9yZS5vbihFdmVudHMuQUNDT1VOVFNfTE9BREVELCB0aGlzLl9saXN0ZW5lcik7XG4gICAgfSxcblxuICAgIGNvbXBvbmVudFdpbGxVbm1vdW50OiBmdW5jdGlvbigpIHtcbiAgICAgICAgc3RvcmUucmVtb3ZlTGlzdGVuZXIoRXZlbnRzLkFDQ09VTlRTX0xPQURFRCwgdGhpcy5fbGlzdGVuZXIpO1xuICAgIH0sXG5cbiAgICByZW5kZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgYWNjb3VudHMgPSB0aGlzLnN0YXRlLmFjY291bnRzLm1hcChmdW5jdGlvbiAoYSkge1xuICAgICAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgICAgICBBY2NvdW50TGlzdEl0ZW0oe2tleTogYS5pZCwgYWNjb3VudDogYX0pXG4gICAgICAgICAgICApO1xuICAgICAgICB9KTtcblxuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgUmVhY3QuRE9NLmRpdihudWxsLCBcbiAgICAgICAgICAgICAgICBcIkFjY291bnRzXCIsIFxuICAgICAgICAgICAgICAgIFJlYWN0LkRPTS51bCh7Y2xhc3NOYW1lOiBcInJvd1wifSwgXG4gICAgICAgICAgICAgICAgICAgIGFjY291bnRzXG4gICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgKVxuICAgICAgICApO1xuICAgIH1cbn0pO1xuXG4iLCIvKiogQGpzeCBSZWFjdC5ET00gKi9cblxuLy8gQ29uc3RhbnRzXG52YXIgRXZlbnRzID0gcmVxdWlyZSgnLi4vRXZlbnRzJyk7XG52YXIgZGVidWcgPSByZXF1aXJlKCcuLi9IZWxwZXJzJykuZGVidWc7XG5cbi8vIEdsb2JhbCB2YXJpYWJsZXNcbnZhciBzdG9yZSA9IHJlcXVpcmUoJy4uL3N0b3JlJyk7XG52YXIgZmx1eCA9IHJlcXVpcmUoJy4uL2ZsdXgvZGlzcGF0Y2hlcicpO1xuXG4vLyBQcm9wczogYmFuazogQmFua1xudmFyIEJhbmtMaXN0SXRlbUNvbXBvbmVudCA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtkaXNwbGF5TmFtZTogJ0JhbmtMaXN0SXRlbUNvbXBvbmVudCcsXG5cbiAgICBfb25DbGljazogZnVuY3Rpb24oKSB7XG4gICAgICAgIGRlYnVnKCdjbGljayBvbiBhIGJhbmsgaXRlbScpO1xuICAgICAgICBmbHV4LmRpc3BhdGNoKHtcbiAgICAgICAgICAgIHR5cGU6IEV2ZW50cy5TRUxFQ1RFRF9CQU5LX0NIQU5HRUQsXG4gICAgICAgICAgICBiYW5rOiB0aGlzLnByb3BzLmJhbmtcbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIHJlbmRlcjogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICBSZWFjdC5ET00ubGkobnVsbCwgUmVhY3QuRE9NLmEoe29uQ2xpY2s6IHRoaXMuX29uQ2xpY2t9LCB0aGlzLnByb3BzLmJhbmsubmFtZSkpXG4gICAgICAgICk7XG4gICAgfVxufSk7XG5cbi8vIFN0YXRlOiBbYmFua11cbnZhciBCYW5rTGlzdENvbXBvbmVudCA9IG1vZHVsZS5leHBvcnRzID0gUmVhY3QuY3JlYXRlQ2xhc3Moe2Rpc3BsYXlOYW1lOiAnZXhwb3J0cycsXG5cbiAgICBfYmFua0xpc3RMaXN0ZW5lcjogZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgYmFua3M6IHN0b3JlLmJhbmtzXG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICBnZXRJbml0aWFsU3RhdGU6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgYmFua3M6IFtdXG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgY29tcG9uZW50RGlkTW91bnQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICBzdG9yZS5vbihFdmVudHMuQkFOS19MSVNUX0xPQURFRCwgdGhpcy5fYmFua0xpc3RMaXN0ZW5lcik7XG4gICAgfSxcblxuICAgIGNvbXBvbmVudFdpbGxVbm1vdW50OiBmdW5jdGlvbigpIHtcbiAgICAgICAgc3RvcmUucmVtb3ZlTGlzdGVuZXIoRXZlbnRzLkJBTktfTElTVF9MT0FERUQsIHRoaXMuX2JhbmtMaXN0TGlzdGVuZXIpO1xuICAgIH0sXG5cbiAgICByZW5kZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgYmFua3MgPSB0aGlzLnN0YXRlLmJhbmtzLm1hcChmdW5jdGlvbiAoYikge1xuICAgICAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgICAgICBCYW5rTGlzdEl0ZW1Db21wb25lbnQoe2tleTogYi5pZCwgYmFuazogYn0pXG4gICAgICAgICAgICApXG4gICAgICAgIH0pO1xuXG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICBSZWFjdC5ET00uZGl2KG51bGwsIFxuICAgICAgICAgICAgICAgIFwiQmFua3NcIiwgXG4gICAgICAgICAgICAgICAgUmVhY3QuRE9NLnVsKHtjbGFzc05hbWU6IFwicm93XCJ9LCBcbiAgICAgICAgICAgICAgICAgICAgYmFua3NcbiAgICAgICAgICAgICAgICApLCBcbiAgICAgICAgICAgICAgICBSZWFjdC5ET00uaHIobnVsbClcbiAgICAgICAgICAgIClcbiAgICAgICAgKTtcbiAgICB9XG59KTtcbiIsIi8qKiBAanN4IFJlYWN0LkRPTSAqL1xuXG4vLyBDb25zdGFudHNcbnZhciBFdmVudHMgPSByZXF1aXJlKCcuLi9FdmVudHMnKTtcbnZhciBkZWJ1ZyA9IHJlcXVpcmUoJy4uL0hlbHBlcnMnKS5kZWJ1ZztcblxuLy8gR2xvYmFsIHZhcmlhYmxlc1xudmFyIHN0b3JlID0gcmVxdWlyZSgnLi4vc3RvcmUnKTtcbnZhciBmbHV4ID0gcmVxdWlyZSgnLi4vZmx1eC9kaXNwYXRjaGVyJyk7XG5cbnZhciBDYXRlZ29yeUxpc3QgPSBSZWFjdC5jcmVhdGVDbGFzcyh7ZGlzcGxheU5hbWU6ICdDYXRlZ29yeUxpc3QnLFxuXG4gICAgX2xpc3RlbmVyOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICBjYXRlZ29yaWVzOiBzdG9yZS5jYXRlZ29yaWVzXG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICBnZXRJbml0aWFsU3RhdGU6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgY2F0ZWdvcmllczogW11cbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICBjb21wb25lbnREaWRNb3VudDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHN0b3JlLm9uKEV2ZW50cy5DQVRFR09SSUVTX0xPQURFRCwgdGhpcy5fbGlzdGVuZXIpO1xuICAgIH0sXG5cbiAgICBjb21wb25lbnRXaWxsVW5tb3VudDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHN0b3JlLnJlbW92ZUxpc3RlbmVyKEV2ZW50cy5DQVRFR09SSUVTX0xPQURFRCwgdGhpcy5fbGlzdGVuZXIpO1xuICAgIH0sXG5cbiAgICByZW5kZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgaXRlbXMgPSB0aGlzLnN0YXRlLmNhdGVnb3JpZXMubWFwKGZ1bmN0aW9uIChjYXQpIHtcbiAgICAgICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICAgICAgUmVhY3QuRE9NLmxpKHtrZXk6IGNhdC5pZH0sIGNhdC50aXRsZSlcbiAgICAgICAgICAgICk7XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgUmVhY3QuRE9NLnVsKG51bGwsIGl0ZW1zKVxuICAgICAgICApO1xuICAgIH1cbn0pO1xuXG52YXIgQ2F0ZWdvcnlGb3JtID0gUmVhY3QuY3JlYXRlQ2xhc3Moe2Rpc3BsYXlOYW1lOiAnQ2F0ZWdvcnlGb3JtJyxcblxuICAgIG9uU3VibWl0OiBmdW5jdGlvbihlKSB7XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcblxuICAgICAgICB2YXIgbGFiZWwgPSB0aGlzLnJlZnMubGFiZWwuZ2V0RE9NTm9kZSgpLnZhbHVlLnRyaW0oKTtcbiAgICAgICAgaWYgKCFsYWJlbClcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcblxuICAgICAgICB2YXIgY2F0ZWdvcnkgPSB7XG4gICAgICAgICAgICB0aXRsZTogbGFiZWxcbiAgICAgICAgfTtcblxuICAgICAgICBmbHV4LmRpc3BhdGNoKHtcbiAgICAgICAgICAgIHR5cGU6IEV2ZW50cy5DQVRFR09SWV9DUkVBVEVELFxuICAgICAgICAgICAgY2F0ZWdvcnk6IGNhdGVnb3J5XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHRoaXMucmVmcy5sYWJlbC5nZXRET01Ob2RlKCkudmFsdWUgPSAnJztcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH0sXG5cbiAgICByZW5kZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgUmVhY3QuRE9NLmZvcm0oe29uU3VibWl0OiB0aGlzLm9uU3VibWl0fSwgXG4gICAgICAgICAgICAgICAgUmVhY3QuRE9NLmRpdih7Y2xhc3NOYW1lOiBcInJvd1wifSwgXG4gICAgICAgICAgICAgICAgICAgIFJlYWN0LkRPTS5kaXYoe2NsYXNzTmFtZTogXCJzbWFsbC0xMCBjb2x1bW5zXCJ9LCBcbiAgICAgICAgICAgICAgICAgICAgICAgIFJlYWN0LkRPTS5pbnB1dCh7dHlwZTogXCJ0ZXh0XCIsIHBsYWNlaG9sZGVyOiBcIkxhYmVsIG9mIG5ldyBjYXRlZ29yeVwiLCByZWY6IFwibGFiZWxcIn0pXG4gICAgICAgICAgICAgICAgICAgICksIFxuICAgICAgICAgICAgICAgICAgICBSZWFjdC5ET00uZGl2KHtjbGFzc05hbWU6IFwic21hbGwtMiBjb2x1bW5zXCJ9LCBcbiAgICAgICAgICAgICAgICAgICAgICAgIFJlYWN0LkRPTS5pbnB1dCh7dHlwZTogXCJzdWJtaXRcIiwgY2xhc3NOYW1lOiBcImJ1dHRvbiBwb3N0Zml4XCIsIHZhbHVlOiBcIlN1Ym1pdFwifSlcbiAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgIClcbiAgICAgICAgKVxuICAgIH1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtkaXNwbGF5TmFtZTogJ2V4cG9ydHMnLFxuXG4gICAgcmVuZGVyOiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIFJlYWN0LkRPTS5kaXYobnVsbCwgXG4gICAgICAgICAgICAgICAgUmVhY3QuRE9NLmgxKG51bGwsIFwiQ2F0ZWdvcmllc1wiKSwgXG4gICAgICAgICAgICAgICAgQ2F0ZWdvcnlMaXN0KG51bGwpLCBcbiAgICAgICAgICAgICAgICBSZWFjdC5ET00uaDMobnVsbCwgXCJBZGQgYSBjYXRlZ29yeVwiKSwgXG4gICAgICAgICAgICAgICAgQ2F0ZWdvcnlGb3JtKG51bGwpXG4gICAgICAgICAgICApXG4gICAgICAgICk7XG4gICAgfVxufSk7XG4iLCIvKiogQGpzeCBSZWFjdC5ET00gKi9cblxuLy8gQ29uc3RhbnRzXG52YXIgRXZlbnRzID0gcmVxdWlyZSgnLi4vRXZlbnRzJyk7XG52YXIgZGVidWcgPSByZXF1aXJlKCcuLi9IZWxwZXJzJykuZGVidWc7XG5cbi8vIEdsb2JhbCB2YXJpYWJsZXNcbnZhciBzdG9yZSA9IHJlcXVpcmUoJy4uL3N0b3JlJyk7XG5cbnZhciAkY2hhcnQgPSBudWxsO1xuXG5mdW5jdGlvbiBERUJVRyh0ZXh0KSB7XG4gICAgcmV0dXJuIGRlYnVnKCdDaGFydCBDb21wb25lbnQgLSAnICsgdGV4dCk7XG59XG5cbi8vIENvbXBvbmVudHNcbm1vZHVsZS5leHBvcnRzID0gUmVhY3QuY3JlYXRlQ2xhc3Moe2Rpc3BsYXlOYW1lOiAnZXhwb3J0cycsXG5cbiAgICBnZXRJbml0aWFsU3RhdGU6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgYWNjb3VudDogbnVsbCxcbiAgICAgICAgICAgIG9wZXJhdGlvbnM6IFtdLFxuICAgICAgICAgICAgY2F0ZWdvcmllczogW10sXG4gICAgICAgICAgICBraW5kOiAnYWxsJyAgICAgICAgIC8vIHdoaWNoIGNoYXJ0IGFyZSB3ZSBzaG93aW5nP1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIF9yZWxvYWQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICBERUJVRygncmVsb2FkJyk7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgYWNjb3VudDogICAgc3RvcmUuY3VycmVudEFjY291bnQsXG4gICAgICAgICAgICBvcGVyYXRpb25zOiBzdG9yZS5vcGVyYXRpb25zLFxuICAgICAgICAgICAgY2F0ZWdvcmllczogc3RvcmUuY2F0ZWdvcmllc1xuICAgICAgICB9LCB0aGlzLl9yZWRyYXcpO1xuICAgIH0sXG5cbiAgICBjb21wb25lbnREaWRNb3VudDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHN0b3JlLm9uKEV2ZW50cy5PUEVSQVRJT05TX0xPQURFRCwgdGhpcy5fcmVsb2FkKTtcbiAgICAgICAgc3RvcmUub24oRXZlbnRzLkNBVEVHT1JJRVNfTE9BREVELCB0aGlzLl9yZWxvYWQpO1xuICAgICAgICAkY2hhcnQgPSAkKCcjY2hhcnQnKTtcbiAgICB9LFxuXG4gICAgY29tcG9uZW50V2lsbFVubW91bnQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICBzdG9yZS5yZW1vdmVMaXN0ZW5lcihFdmVudHMuT1BFUkFUSU9OU19MT0FERUQsIHRoaXMuX3JlbG9hZCk7XG4gICAgICAgIHN0b3JlLnJlbW92ZUxpc3RlbmVyKEV2ZW50cy5DQVRFR09SSUVTX0xPQURFRCwgdGhpcy5fcmVsb2FkKTtcbiAgICB9LFxuXG4gICAgX3JlZHJhdzogZnVuY3Rpb24oKSB7XG4gICAgICAgIERFQlVHKCdyZWRyYXcnKTtcbiAgICAgICAgc3dpdGNoICh0aGlzLnN0YXRlLmtpbmQpIHtcbiAgICAgICAgICAgIGNhc2UgJ2FsbCc6XG4gICAgICAgICAgICAgICAgQ3JlYXRlQ2hhcnRBbGxCeUNhdGVnb3J5QnlNb250aCh0aGlzLnN0YXRlLm9wZXJhdGlvbnMpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnYmFsYW5jZSc6XG4gICAgICAgICAgICAgICAgQ3JlYXRlQ2hhcnRCYWxhbmNlKHRoaXMuc3RhdGUuYWNjb3VudCwgdGhpcy5zdGF0ZS5vcGVyYXRpb25zKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ2J5LWNhdGVnb3J5JzpcbiAgICAgICAgICAgICAgICB2YXIgdmFsID0gdGhpcy5yZWZzLnNlbGVjdC5nZXRET01Ob2RlKCkudmFsdWU7XG4gICAgICAgICAgICAgICAgQ3JlYXRlQ2hhcnRCeUNhdGVnb3J5QnlNb250aCh2YWwsIHRoaXMuc3RhdGUub3BlcmF0aW9ucyk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICdwb3MtbmVnJzpcbiAgICAgICAgICAgICAgICBDcmVhdGVDaGFydFBvc2l0aXZlTmVnYXRpdmUodGhpcy5zdGF0ZS5vcGVyYXRpb25zKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgYXNzZXJ0KHRydWUgPT09IGZhbHNlLCAndW5leHBlY3RlZCB2YWx1ZSBpbiBfcmVkcmF3OiAnICsgdGhpcy5zdGF0ZS5raW5kKTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICBfY2hhbmdlS2luZDogZnVuY3Rpb24oa2luZCkge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgIGtpbmQ6IGtpbmRcbiAgICAgICAgfSwgdGhpcy5fcmVkcmF3KTtcbiAgICB9LFxuICAgIF9vbkNsaWNrQWxsOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy5fY2hhbmdlS2luZCgnYWxsJyk7XG4gICAgfSxcbiAgICBfb25DbGlja0J5Q2F0ZWdvcnk6IGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLl9jaGFuZ2VLaW5kKCdieS1jYXRlZ29yeScpO1xuICAgIH0sXG4gICAgX29uQ2xpY2tCYWxhbmNlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy5fY2hhbmdlS2luZCgnYmFsYW5jZScpO1xuICAgIH0sXG4gICAgX29uQ2xpY2tQb3NOZWc6IGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLl9jaGFuZ2VLaW5kKCdwb3MtbmVnJyk7XG4gICAgfSxcblxuICAgIHJlbmRlcjogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBjYXRlZ29yeU9wdGlvbnMgPSB0aGlzLnN0YXRlLmNhdGVnb3JpZXMubWFwKGZ1bmN0aW9uIChjKSB7XG4gICAgICAgICAgICByZXR1cm4gKFJlYWN0LkRPTS5vcHRpb24oe2tleTogYy5pZCwgdmFsdWU6IGMuaWR9LCBjLnRpdGxlKSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHZhciBtYXliZVNlbGVjdCA9IHRoaXMuc3RhdGUua2luZCAhPT0gJ2J5LWNhdGVnb3J5JyA/ICcnIDpcbiAgICAgICAgICAgIFJlYWN0LkRPTS5zZWxlY3Qoe29uQ2hhbmdlOiB0aGlzLl9yZWRyYXcsIHJlZjogXCJzZWxlY3RcIn0sIFxuICAgICAgICAgICAgICAgIGNhdGVnb3J5T3B0aW9uc1xuICAgICAgICAgICAgKVxuXG4gICAgICAgIHJldHVybiAoXG4gICAgICAgIFJlYWN0LkRPTS5kaXYobnVsbCwgXG4gICAgICAgICAgICBSZWFjdC5ET00uaDEobnVsbCwgXCJDaGFydHNcIiksIFxuXG4gICAgICAgICAgICBSZWFjdC5ET00uZGl2KG51bGwsIFxuICAgICAgICAgICAgICAgIFJlYWN0LkRPTS5idXR0b24oe29uQ2xpY2s6IHRoaXMuX29uQ2xpY2tBbGx9LCBcIkFsbCBjYXRlZ29yaWVzIGJ5IG1vbnRoXCIpLCBcbiAgICAgICAgICAgICAgICBSZWFjdC5ET00uYnV0dG9uKHtvbkNsaWNrOiB0aGlzLl9vbkNsaWNrQnlDYXRlZ29yeX0sIFwiQnkgY2F0ZWdvcnkgYnkgbW9udGhcIiksIFxuICAgICAgICAgICAgICAgIFJlYWN0LkRPTS5idXR0b24oe29uQ2xpY2s6IHRoaXMuX29uQ2xpY2tCYWxhbmNlfSwgXCJCYWxhbmNlIG92ZXIgdGltZVwiKSwgXG4gICAgICAgICAgICAgICAgUmVhY3QuRE9NLmJ1dHRvbih7b25DbGljazogdGhpcy5fb25DbGlja1Bvc05lZ30sIFwiSW5zIC8gb3V0cyBvdmVyIHRpbWVcIilcbiAgICAgICAgICAgICksIFxuXG4gICAgICAgICAgICBtYXliZVNlbGVjdCwgXG5cbiAgICAgICAgICAgIFJlYWN0LkRPTS5kaXYoe2lkOiBcImNoYXJ0XCJ9KVxuICAgICAgICApXG4gICAgICAgICk7XG4gICAgfVxufSk7XG5cbi8vIENoYXJ0c1xuZnVuY3Rpb24gQ3JlYXRlQ2hhcnRCeUNhdGVnb3J5QnlNb250aChjYXRJZCwgb3BlcmF0aW9ucykge1xuICAgIHZhciBvcHMgPSBvcGVyYXRpb25zLnNsaWNlKCkuZmlsdGVyKGZ1bmN0aW9uKG9wKSB7XG4gICAgICAgIHJldHVybiBvcC5jYXRlZ29yeUlkID09PSBjYXRJZDtcbiAgICB9KTtcbiAgICBDcmVhdGVDaGFydEFsbEJ5Q2F0ZWdvcnlCeU1vbnRoKG9wcyk7XG59XG5cbmZ1bmN0aW9uIENyZWF0ZUNoYXJ0QWxsQnlDYXRlZ29yeUJ5TW9udGgob3BlcmF0aW9ucykge1xuXG4gICAgZnVuY3Rpb24gZGF0ZWtleShvcCkge1xuICAgICAgICB2YXIgZCA9IG9wLmRhdGU7XG4gICAgICAgIHJldHVybiBkLmdldEZ1bGxZZWFyKCkgKyAnLScgKyBkLmdldE1vbnRoKCk7XG4gICAgfVxuXG4gICAgLy8gQ2F0ZWdvcnkgLT4ge01vbnRoIC0+IFtBbW91bnRzXX1cbiAgICB2YXIgbWFwID0ge307XG4gICAgLy8gRGF0ZWtleSAtPiBEYXRlXG4gICAgdmFyIGRhdGVzZXQgPSB7fTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IG9wZXJhdGlvbnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgdmFyIG9wID0gb3BlcmF0aW9uc1tpXTtcbiAgICAgICAgdmFyIGMgPSBzdG9yZS5jYXRlZ29yeVRvTGFiZWwob3AuY2F0ZWdvcnlJZCk7XG4gICAgICAgIG1hcFtjXSA9IG1hcFtjXSB8fCB7fTtcblxuICAgICAgICB2YXIgZGsgPSBkYXRla2V5KG9wKTtcbiAgICAgICAgbWFwW2NdW2RrXSA9IG1hcFtjXVtka10gfHwgW107XG4gICAgICAgIG1hcFtjXVtka10ucHVzaChvcC5hbW91bnQpO1xuICAgICAgICBkYXRlc2V0W2RrXSA9ICtvcC5kYXRlO1xuICAgIH1cblxuICAgIC8vIFNvcnQgZGF0ZSBpbiBhc2NlbmRpbmcgb3JkZXI6IHB1c2ggYWxsIHBhaXJzIG9mIChkYXRla2V5LCBkYXRlKSBpbiBhblxuICAgIC8vIGFycmF5IGFuZCBzb3J0IHRoYXQgYXJyYXkgYnkgdGhlIHNlY29uZCBlbGVtZW50LiBUaGVuIHJlYWQgdGhhdCBhcnJheSBpblxuICAgIC8vIGFzY2VuZGluZyBvcmRlci5cbiAgICB2YXIgZGF0ZXMgPSBbXTtcbiAgICBmb3IgKHZhciBkayBpbiBkYXRlc2V0KSB7XG4gICAgICAgIGRhdGVzLnB1c2goW2RrLCBkYXRlc2V0W2RrXV0pO1xuICAgIH1cbiAgICBkYXRlcy5zb3J0KGZ1bmN0aW9uKGEsIGIpIHtcbiAgICAgICAgcmV0dXJuIGFbMV0gLSBiWzFdO1xuICAgIH0pO1xuXG4gICAgdmFyIHNlcmllcyA9IFtdO1xuICAgIGZvciAodmFyIGMgaW4gbWFwKSB7XG4gICAgICAgIHZhciBkYXRhID0gW107XG5cbiAgICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCBkYXRlcy5sZW5ndGg7IGorKykge1xuICAgICAgICAgICAgdmFyIGRrID0gZGF0ZXNbal1bMF07XG4gICAgICAgICAgICBtYXBbY11bZGtdID0gbWFwW2NdW2RrXSB8fCBbXTtcbiAgICAgICAgICAgIGRhdGEucHVzaChtYXBbY11bZGtdLnJlZHVjZShmdW5jdGlvbihhLCBiKSB7IHJldHVybiBhICsgYiB9LCAwKSk7XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgc2VyaWUgPSB7XG4gICAgICAgICAgICBuYW1lOiBjLFxuICAgICAgICAgICAgZGF0YTogZGF0YVxuICAgICAgICB9O1xuXG4gICAgICAgIHNlcmllcy5wdXNoKHNlcmllKTtcbiAgICB9XG5cbiAgICB2YXIgY2F0ZWdvcmllcyA9IFtdO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZGF0ZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgdmFyIGRhdGUgPSBuZXcgRGF0ZShkYXRlc1tpXVsxXSk7XG4gICAgICAgIHZhciBzdHIgPSBkYXRlLnRvTG9jYWxlRGF0ZVN0cmluZygvKiB1c2UgdGhlIGRlZmF1bHQgbG9jYWxlICovIHVuZGVmaW5lZCwge1xuICAgICAgICAgICAgeWVhcjogJ251bWVyaWMnLFxuICAgICAgICAgICAgbW9udGg6ICdsb25nJ1xuICAgICAgICB9KTtcbiAgICAgICAgY2F0ZWdvcmllcy5wdXNoKHN0cik7XG4gICAgfVxuXG4gICAgdmFyIHRpdGxlID0gJ0J5IGNhdGVnb3J5JztcbiAgICB2YXIgeUF4aXNMZWdlbmQgPSAnQW1vdW50JztcblxuICAgICRjaGFydC5oaWdoY2hhcnRzKHtcbiAgICAgICAgY2hhcnQ6IHtcbiAgICAgICAgICAgIHR5cGU6ICdjb2x1bW4nXG4gICAgICAgIH0sXG4gICAgICAgIHRpdGxlOiB7XG4gICAgICAgICAgICB0ZXh0OiB0aXRsZVxuICAgICAgICB9LFxuICAgICAgICB4QXhpczoge1xuICAgICAgICAgICAgY2F0ZWdvcmllczogY2F0ZWdvcmllc1xuICAgICAgICB9LFxuICAgICAgICB5QXhpczoge1xuICAgICAgICAgICAgdGl0bGU6IHtcbiAgICAgICAgICAgICAgICB0ZXh0OiB5QXhpc0xlZ2VuZFxuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICB0b29sdGlwOiB7XG4gICAgICAgICAgICBoZWFkZXJGb3JtYXQ6ICc8c3BhbiBzdHlsZT1cImZvbnQtc2l6ZToxMHB4XCI+e3BvaW50LmtleX08L3NwYW4+PHRhYmxlPicsXG4gICAgICAgICAgICBwb2ludEZvcm1hdDogJzx0cj48dGQgc3R5bGU9XCJjb2xvcjp7c2VyaWVzLmNvbG9yfTtwYWRkaW5nOjBcIj57c2VyaWVzLm5hbWV9OiA8L3RkPicgK1xuICAgICAgICAgICAgJzx0ZCBzdHlsZT1cInBhZGRpbmc6MFwiPjxiPntwb2ludC55Oi4xZn0gZXVyPC9iPjwvdGQ+PC90cj4nLFxuICAgICAgICAgICAgZm9vdGVyRm9ybWF0OiAnPC90YWJsZT4nLFxuICAgICAgICAgICAgc2hhcmVkOiB0cnVlLFxuICAgICAgICAgICAgdXNlSFRNTDogdHJ1ZVxuICAgICAgICB9LFxuICAgICAgICBwbG90T3B0aW9uczoge1xuICAgICAgICAgICAgY29sdW1uOiB7XG4gICAgICAgICAgICAgICAgcG9pbnRQYWRkaW5nOiAwLjIsXG4gICAgICAgICAgICAgICAgYm9yZGVyV2lkdGg6IDBcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgc2VyaWVzOiBzZXJpZXNcbiAgICB9KTtcbn1cblxuZnVuY3Rpb24gQ3JlYXRlQ2hhcnRCYWxhbmNlKGFjY291bnQsIG9wZXJhdGlvbnMpIHtcblxuICAgIHZhciBvcHMgPSBvcGVyYXRpb25zLnNvcnQoZnVuY3Rpb24gKGEsYikgeyByZXR1cm4gK2EuZGF0ZSAtICtiLmRhdGUgfSk7XG5cbiAgICAvLyBEYXRlIChkYXkpIC0+IHN1bSBhbW91bnRzIG9mIHRoaXMgZGF5IChzY2FsYXIpXG4gICAgdmFyIG9wbWFwID0ge307XG4gICAgb3BzLm1hcChmdW5jdGlvbihvKSB7XG4gICAgICAgIC8vIENvbnZlcnQgZGF0ZSBpbnRvIGEgbnVtYmVyOiBpdCdzIGdvaW5nIHRvIGJlIGNvbnZlcnRlZCBpbnRvIGEgc3RyaW5nXG4gICAgICAgIC8vIHdoZW4gdXNlZCBhcyBhIGtleS5cbiAgICAgICAgdmFyIGEgPSBvLmFtb3VudDtcbiAgICAgICAgdmFyIGQgPSArby5kYXRlO1xuICAgICAgICBvcG1hcFtkXSA9IG9wbWFwW2RdIHx8IDA7XG4gICAgICAgIG9wbWFwW2RdICs9IGE7XG4gICAgfSlcblxuICAgIHZhciBiYWxhbmNlID0gYWNjb3VudC5pbml0aWFsQW1vdW50O1xuICAgIHZhciBiYWwgPSBbXTtcbiAgICBmb3IgKHZhciBkYXRlIGluIG9wbWFwKSB7XG4gICAgICAgIC8vIGRhdGUgaXMgYSBzdHJpbmcgbm93OiBjb252ZXJ0IGl0IGJhY2sgdG8gYSBudW1iZXIgZm9yIGhpZ2hjaGFydHMuXG4gICAgICAgIGJhbGFuY2UgKz0gb3BtYXBbZGF0ZV07XG4gICAgICAgIGJhbC5wdXNoKFsrZGF0ZSwgYmFsYW5jZV0pO1xuICAgIH1cblxuICAgIC8vIENyZWF0ZSB0aGUgY2hhcnRcbiAgICAkY2hhcnQuaGlnaGNoYXJ0cygnU3RvY2tDaGFydCcsIHtcbiAgICAgICAgcmFuZ2VTZWxlY3RvciA6IHtcbiAgICAgICAgICAgIHNlbGVjdGVkIDogMVxuICAgICAgICB9LFxuXG4gICAgICAgIHRpdGxlIDoge1xuICAgICAgICAgICAgdGV4dCA6ICdCYWxhbmNlJ1xuICAgICAgICB9LFxuXG4gICAgICAgIHNlcmllcyA6IFt7XG4gICAgICAgICAgICBuYW1lIDogJ0JhbGFuY2UnLFxuICAgICAgICAgICAgZGF0YSA6IGJhbCxcbiAgICAgICAgICAgIHRvb2x0aXA6IHsgdmFsdWVEZWNpbWFsczogMiB9XG4gICAgICAgIH1dXG4gICAgfSk7XG59XG5cbmZ1bmN0aW9uIENyZWF0ZUNoYXJ0UG9zaXRpdmVOZWdhdGl2ZShvcGVyYXRpb25zKSB7XG5cbiAgICBmdW5jdGlvbiBkYXRla2V5KG9wKSB7XG4gICAgICAgIHZhciBkID0gb3AuZGF0ZTtcbiAgICAgICAgcmV0dXJuIGQuZ2V0RnVsbFllYXIoKSArICctJyArIGQuZ2V0TW9udGgoKTtcbiAgICB9XG5cbiAgICBjb25zdCBQT1MgPSAwLCBORUcgPSAxLCBCQUwgPSAyO1xuXG4gICAgLy8gTW9udGggLT4gW1Bvc2l0aXZlIGFtb3VudCwgTmVnYXRpdmUgYW1vdW50LCBEaWZmXVxuICAgIHZhciBtYXAgPSB7fTtcbiAgICAvLyBEYXRla2V5IC0+IERhdGVcbiAgICB2YXIgZGF0ZXNldCA9IHt9O1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgb3BlcmF0aW9ucy5sZW5ndGg7IGkrKykge1xuICAgICAgICB2YXIgb3AgPSBvcGVyYXRpb25zW2ldO1xuICAgICAgICB2YXIgZGsgPSBkYXRla2V5KG9wKTtcbiAgICAgICAgbWFwW2RrXSA9IG1hcFtka10gfHwgWzAsIDAsIDBdO1xuXG4gICAgICAgIG1hcFtka11bUE9TXSArPSBvcC5hbW91bnQgPiAwID8gb3AuYW1vdW50IDogMDtcbiAgICAgICAgbWFwW2RrXVtORUddICs9IG9wLmFtb3VudCA8IDAgPyAtb3AuYW1vdW50IDogMDtcbiAgICAgICAgbWFwW2RrXVtCQUxdICs9IG9wLmFtb3VudDtcblxuICAgICAgICBkYXRlc2V0W2RrXSA9ICtvcC5kYXRlO1xuICAgIH1cblxuICAgIC8vIFNvcnQgZGF0ZSBpbiBhc2NlbmRpbmcgb3JkZXI6IHB1c2ggYWxsIHBhaXJzIG9mIChkYXRla2V5LCBkYXRlKSBpbiBhblxuICAgIC8vIGFycmF5IGFuZCBzb3J0IHRoYXQgYXJyYXkgYnkgdGhlIHNlY29uZCBlbGVtZW50LiBUaGVuIHJlYWQgdGhhdCBhcnJheSBpblxuICAgIC8vIGFzY2VuZGluZyBvcmRlci5cbiAgICB2YXIgZGF0ZXMgPSBbXTtcbiAgICBmb3IgKHZhciBkayBpbiBkYXRlc2V0KSB7XG4gICAgICAgIGRhdGVzLnB1c2goW2RrLCBkYXRlc2V0W2RrXV0pO1xuICAgIH1cbiAgICBkYXRlcy5zb3J0KGZ1bmN0aW9uKGEsIGIpIHtcbiAgICAgICAgcmV0dXJuIGFbMV0gLSBiWzFdO1xuICAgIH0pO1xuXG4gICAgdmFyIHNlcmllcyA9IFtdO1xuICAgIGZ1bmN0aW9uIGFkZFNlcmllKG5hbWUsIG1hcEluZGV4KSB7XG4gICAgICAgIHZhciBkYXRhID0gW107XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZGF0ZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHZhciBkayA9IGRhdGVzW2ldWzBdO1xuICAgICAgICAgICAgZGF0YS5wdXNoKG1hcFtka11bbWFwSW5kZXhdKTtcbiAgICAgICAgfVxuICAgICAgICB2YXIgc2VyaWUgPSB7XG4gICAgICAgICAgICBuYW1lOiBuYW1lLFxuICAgICAgICAgICAgZGF0YTogZGF0YVxuICAgICAgICB9O1xuICAgICAgICBzZXJpZXMucHVzaChzZXJpZSk7XG4gICAgfVxuXG4gICAgYWRkU2VyaWUoJ1Bvc2l0aXZlJywgUE9TKTtcbiAgICBhZGRTZXJpZSgnTmVnYXRpdmUnLCBORUcpO1xuICAgIGFkZFNlcmllKCdCYWxhbmNlJywgQkFMKTtcblxuICAgIHZhciBjYXRlZ29yaWVzID0gW107XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBkYXRlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICB2YXIgZGF0ZSA9IG5ldyBEYXRlKGRhdGVzW2ldWzFdKTtcbiAgICAgICAgdmFyIHN0ciA9IGRhdGUudG9Mb2NhbGVEYXRlU3RyaW5nKC8qIHVzZSB0aGUgZGVmYXVsdCBsb2NhbGUgKi8gdW5kZWZpbmVkLCB7XG4gICAgICAgICAgICB5ZWFyOiAnbnVtZXJpYycsXG4gICAgICAgICAgICBtb250aDogJ2xvbmcnXG4gICAgICAgIH0pO1xuICAgICAgICBjYXRlZ29yaWVzLnB1c2goc3RyKTtcbiAgICB9XG5cbiAgICB2YXIgdGl0bGUgPSAnUG9zaXRpdmUgLyBOZWdhdGl2ZSBvdmVyIHRpbWUnO1xuICAgIHZhciB5QXhpc0xlZ2VuZCA9ICdBbW91bnQnO1xuXG4gICAgJGNoYXJ0LmhpZ2hjaGFydHMoe1xuICAgICAgICBjaGFydDoge1xuICAgICAgICAgICAgdHlwZTogJ2NvbHVtbidcbiAgICAgICAgfSxcbiAgICAgICAgdGl0bGU6IHtcbiAgICAgICAgICAgIHRleHQ6IHRpdGxlXG4gICAgICAgIH0sXG4gICAgICAgIHhBeGlzOiB7XG4gICAgICAgICAgICBjYXRlZ29yaWVzOiBjYXRlZ29yaWVzXG4gICAgICAgIH0sXG4gICAgICAgIHlBeGlzOiB7XG4gICAgICAgICAgICB0aXRsZToge1xuICAgICAgICAgICAgICAgIHRleHQ6IHlBeGlzTGVnZW5kXG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIHRvb2x0aXA6IHtcbiAgICAgICAgICAgIGhlYWRlckZvcm1hdDogJzxzcGFuIHN0eWxlPVwiZm9udC1zaXplOjEwcHhcIj57cG9pbnQua2V5fTwvc3Bhbj48dGFibGU+JyxcbiAgICAgICAgICAgIHBvaW50Rm9ybWF0OiAnPHRyPjx0ZCBzdHlsZT1cImNvbG9yOntzZXJpZXMuY29sb3J9O3BhZGRpbmc6MFwiPntzZXJpZXMubmFtZX06IDwvdGQ+JyArXG4gICAgICAgICAgICAnPHRkIHN0eWxlPVwicGFkZGluZzowXCI+PGI+e3BvaW50Lnk6LjFmfSBldXI8L2I+PC90ZD48L3RyPicsXG4gICAgICAgICAgICBmb290ZXJGb3JtYXQ6ICc8L3RhYmxlPicsXG4gICAgICAgICAgICBzaGFyZWQ6IHRydWUsXG4gICAgICAgICAgICB1c2VIVE1MOiB0cnVlXG4gICAgICAgIH0sXG4gICAgICAgIHBsb3RPcHRpb25zOiB7XG4gICAgICAgICAgICBjb2x1bW46IHtcbiAgICAgICAgICAgICAgICBwb2ludFBhZGRpbmc6IDAuMixcbiAgICAgICAgICAgICAgICBib3JkZXJXaWR0aDogMFxuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICBzZXJpZXM6IHNlcmllc1xuICAgIH0pO1xufVxuXG4iLCIvKiogQGpzeCBSZWFjdC5ET00gKi9cblxuLy8gQ29uc3RhbnRzXG52YXIgRXZlbnRzID0gcmVxdWlyZSgnLi4vRXZlbnRzJyk7XG52YXIgZGVidWcgPSByZXF1aXJlKCcuLi9IZWxwZXJzJykuZGVidWc7XG5cbi8vIEdsb2JhbCB2YXJpYWJsZXNcbnZhciBzdG9yZSA9IHJlcXVpcmUoJy4uL3N0b3JlJyk7XG52YXIgZmx1eCA9IHJlcXVpcmUoJy4uL2ZsdXgvZGlzcGF0Y2hlcicpO1xuXG4vLyBDb21wb25lbnRzXG52YXIgQ2F0ZWdvcnlTZWxlY3RDb21wb25lbnQgPSBSZWFjdC5jcmVhdGVDbGFzcyh7ZGlzcGxheU5hbWU6ICdDYXRlZ29yeVNlbGVjdENvbXBvbmVudCcsXG5cbiAgICBnZXRJbml0aWFsU3RhdGU6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4geyBlZGl0TW9kZTogZmFsc2UgfVxuICAgIH0sXG5cbiAgICBkb206IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5yZWZzLmNhdC5nZXRET01Ob2RlKCk7XG4gICAgfSxcblxuICAgIG9uQ2hhbmdlOiBmdW5jdGlvbihlKSB7XG4gICAgICAgIHZhciBzZWxlY3RlZElkID0gdGhpcy5kb20oKS52YWx1ZTtcbiAgICAgICAgZmx1eC5kaXNwYXRjaCh7XG4gICAgICAgICAgICB0eXBlOiBFdmVudHMuT1BFUkFUSU9OX0NBVEVHT1JZX0NIQU5HRUQsXG4gICAgICAgICAgICBvcGVyYXRpb25JZDogdGhpcy5wcm9wcy5vcGVyYXRpb24uaWQsXG4gICAgICAgICAgICBjYXRlZ29yeUlkOiBzZWxlY3RlZElkXG4gICAgICAgIH0pO1xuICAgICAgICAvLyBCZSBvcHRpbWlzdGljXG4gICAgICAgIHRoaXMucHJvcHMub3BlcmF0aW9uLmNhdGVnb3J5SWQgPSBzZWxlY3RlZElkO1xuICAgIH0sXG5cbiAgICBzd2l0Y2hUb0VkaXRNb2RlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IGVkaXRNb2RlOiB0cnVlIH0sIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdGhpcy5kb20oKS5mb2N1cygpO1xuICAgICAgICB9KTtcbiAgICB9LFxuICAgIHN3aXRjaFRvU3RhdGljTW9kZTogZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoeyBlZGl0TW9kZTogZmFsc2UgfSk7XG4gICAgfSxcblxuICAgIHJlbmRlcjogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBzZWxlY3RlZElkID0gdGhpcy5wcm9wcy5vcGVyYXRpb24uY2F0ZWdvcnlJZDtcbiAgICAgICAgdmFyIGxhYmVsID0gc3RvcmUuY2F0ZWdvcnlUb0xhYmVsKHNlbGVjdGVkSWQpO1xuXG4gICAgICAgIGlmICghdGhpcy5zdGF0ZS5lZGl0TW9kZSkge1xuICAgICAgICAgICAgcmV0dXJuIChSZWFjdC5ET00uc3Bhbih7b25DbGljazogdGhpcy5zd2l0Y2hUb0VkaXRNb2RlfSwgbGFiZWwpKVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gT24gdGhlIGZpcnN0IGNsaWNrIGluIGVkaXQgbW9kZSwgY2F0ZWdvcmllcyBhcmUgYWxyZWFkeSBsb2FkZWQuXG4gICAgICAgIC8vIEV2ZXJ5IHRpbWUgd2UgcmVsb2FkIGNhdGVnb3JpZXMsIHdlIGNhbid0IGJlIGluIGVkaXQgbW9kZSwgc28gd2UgY2FuXG4gICAgICAgIC8vIGp1c3Qgc3luY2hyb25vdXNseSByZXRyaWV2ZSBjYXRlZ29yaWVzIGFuZCBub3QgbmVlZCB0byBzdWJzY3JpYmUgdG9cbiAgICAgICAgLy8gdGhlbS5cbiAgICAgICAgdmFyIG9wdGlvbnMgPSBzdG9yZS5jYXRlZ29yaWVzLm1hcChmdW5jdGlvbiAoYykge1xuICAgICAgICAgICAgcmV0dXJuIChSZWFjdC5ET00ub3B0aW9uKHtrZXk6IGMuaWQsIHZhbHVlOiBjLmlkfSwgYy50aXRsZSkpXG4gICAgICAgIH0pO1xuXG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICBSZWFjdC5ET00uc2VsZWN0KHtvbkNoYW5nZTogdGhpcy5vbkNoYW5nZSwgb25CbHVyOiB0aGlzLnN3aXRjaFRvU3RhdGljTW9kZSwgZGVmYXVsdFZhbHVlOiBzZWxlY3RlZElkLCByZWY6IFwiY2F0XCJ9LCBcbiAgICAgICAgICAgICAgICBvcHRpb25zXG4gICAgICAgICAgICApXG4gICAgICAgICk7XG4gICAgfVxufSk7XG5cbnZhciBPcGVyYXRpb25Db21wb25lbnQgPSBSZWFjdC5jcmVhdGVDbGFzcyh7ZGlzcGxheU5hbWU6ICdPcGVyYXRpb25Db21wb25lbnQnLFxuXG4gICAgZ2V0SW5pdGlhbFN0YXRlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHsgbW91c2VPbjogZmFsc2UgfTtcbiAgICB9LFxuXG4gICAgb25Nb3VzZUVudGVyOiBmdW5jdGlvbihlKSB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoeyBtb3VzZU9uOiB0cnVlIH0pXG4gICAgfSxcbiAgICBvbk1vdXNlTGVhdmU6IGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IG1vdXNlT246IGZhbHNlIH0pXG4gICAgfSxcblxuICAgIHJlbmRlcjogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBvcCA9IHRoaXMucHJvcHMub3BlcmF0aW9uO1xuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgUmVhY3QuRE9NLnRyKG51bGwsIFxuICAgICAgICAgICAgICAgIFJlYWN0LkRPTS50ZChudWxsLCBvcC5kYXRlLnRvTG9jYWxlRGF0ZVN0cmluZygpKSwgXG4gICAgICAgICAgICAgICAgUmVhY3QuRE9NLnRkKHtvbk1vdXNlRW50ZXI6IHRoaXMub25Nb3VzZUVudGVyLCBvbk1vdXNlTGVhdmU6IHRoaXMub25Nb3VzZUxlYXZlfSwgdGhpcy5zdGF0ZS5tb3VzZU9uID8gb3AucmF3IDogb3AudGl0bGUpLCBcbiAgICAgICAgICAgICAgICBSZWFjdC5ET00udGQobnVsbCwgb3AuYW1vdW50KSwgXG4gICAgICAgICAgICAgICAgUmVhY3QuRE9NLnRkKG51bGwsIFxuICAgICAgICAgICAgICAgICAgICBDYXRlZ29yeVNlbGVjdENvbXBvbmVudCh7b3BlcmF0aW9uOiBvcH0pXG4gICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgKVxuICAgICAgICApO1xuICAgIH1cbn0pO1xuXG52YXIgT3BlcmF0aW9uc0NvbXBvbmVudCA9IG1vZHVsZS5leHBvcnRzID0gUmVhY3QuY3JlYXRlQ2xhc3Moe2Rpc3BsYXlOYW1lOiAnZXhwb3J0cycsXG5cbiAgICBnZXRJbml0aWFsU3RhdGU6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgYWNjb3VudDoge2luaXRpYWxBbW91bnQ6IDB9LFxuICAgICAgICAgICAgb3BlcmF0aW9uczogW11cbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICBfY2I6IGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgIGFjY291bnQ6IHN0b3JlLmN1cnJlbnRBY2NvdW50LFxuICAgICAgICAgICAgb3BlcmF0aW9uczogc3RvcmUub3BlcmF0aW9uc1xuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgY29tcG9uZW50RGlkTW91bnQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICBzdG9yZS5vbihFdmVudHMuT1BFUkFUSU9OU19MT0FERUQsIHRoaXMuX2NiKTtcbiAgICB9LFxuXG4gICAgY29tcG9uZW50V2lsbFVubW91bnQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICBzdG9yZS5yZW1vdmVMaXN0ZW5lcihFdmVudHMuT1BFUkFUSU9OU19MT0FERUQsIHRoaXMuX2NiKTtcbiAgICB9LFxuXG4gICAgZ2V0VG90YWw6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgdG90YWwgPSB0aGlzLnN0YXRlLm9wZXJhdGlvbnMucmVkdWNlKGZ1bmN0aW9uKGEsYikgeyByZXR1cm4gYSArIGIuYW1vdW50IH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5zdGF0ZS5hY2NvdW50LmluaXRpYWxBbW91bnQpO1xuICAgICAgICByZXR1cm4gKHRvdGFsICogMTAwIHwgMCkgLyAxMDA7XG4gICAgfSxcblxuICAgIHJlbmRlcjogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBvcHMgPSB0aGlzLnN0YXRlLm9wZXJhdGlvbnMubWFwKGZ1bmN0aW9uIChvKSB7XG4gICAgICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgICAgIE9wZXJhdGlvbkNvbXBvbmVudCh7a2V5OiBvLmlkLCBvcGVyYXRpb246IG99KVxuICAgICAgICAgICAgKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIFJlYWN0LkRPTS5kaXYobnVsbCwgXG4gICAgICAgICAgICAgICAgUmVhY3QuRE9NLmgxKG51bGwsIFwiT3BlcmF0aW9uc1wiKSwgXG4gICAgICAgICAgICAgICAgUmVhY3QuRE9NLmRpdihudWxsLCBcbiAgICAgICAgICAgICAgICAgICAgUmVhY3QuRE9NLmgzKG51bGwsIFwiVG90YWw6IFwiLCB0aGlzLmdldFRvdGFsKCkpXG4gICAgICAgICAgICAgICAgKSwgXG4gICAgICAgICAgICAgICAgUmVhY3QuRE9NLnRhYmxlKG51bGwsIFxuICAgICAgICAgICAgICAgICAgICBSZWFjdC5ET00udGhlYWQobnVsbCwgXG4gICAgICAgICAgICAgICAgICAgICAgICBSZWFjdC5ET00udHIobnVsbCwgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgUmVhY3QuRE9NLnRoKG51bGwsIFwiRGF0ZVwiKSwgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgUmVhY3QuRE9NLnRoKG51bGwsIFwiVGl0bGVcIiksIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFJlYWN0LkRPTS50aChudWxsLCBcIkFtb3VudFwiKSwgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgUmVhY3QuRE9NLnRoKG51bGwsIFwiQ2F0ZWdvcnlcIilcbiAgICAgICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAgICAgKSwgXG4gICAgICAgICAgICAgICAgICAgIFJlYWN0LkRPTS50Ym9keShudWxsLCBcbiAgICAgICAgICAgICAgICAgICAgICAgIG9wc1xuICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgKVxuICAgICAgICApO1xuICAgIH1cbn0pO1xuXG4iLCIvKiogQGpzeCBSZWFjdC5ET00gKi9cblxuLy8gQ29uc3RhbnRzXG52YXIgRXZlbnRzID0gcmVxdWlyZSgnLi4vRXZlbnRzJyk7XG52YXIgZGVidWcgPSByZXF1aXJlKCcuLi9IZWxwZXJzJykuZGVidWc7XG5cbi8vIEdsb2JhbCB2YXJpYWJsZXNcbnZhciBzdG9yZSA9IHJlcXVpcmUoJy4uL3N0b3JlJyk7XG52YXIgZmx1eCA9IHJlcXVpcmUoJy4uL2ZsdXgvZGlzcGF0Y2hlcicpO1xuXG5mdW5jdGlvbiBERUJVRyh0ZXh0KSB7XG4gICAgcmV0dXJuIGRlYnVnKCdTaW1pbGFyaXR5IENvbXBvbmVudCAtICcgKyB0ZXh0KTtcbn1cblxuLy8gQWxnb3JpdGhtXG5cbi8vIFRPRE8gbWFrZSB0aGlzIHRocmVzaG9sZCBhIHBhcmFtZXRlclxuY29uc3QgVElNRV9TSU1JTEFSX1RIUkVTSE9MRCA9IDEwMDAgKiA2MCAqIDYwICogMjQgKiAyOyAvLyA0OCBob3Vyc1xuZnVuY3Rpb24gZmluZFJlZHVuZGFudFBhaXJzKG9wZXJhdGlvbnMpIHtcbiAgICBERUJVRygnUnVubmluZyBmaW5kUmVkdW5kYW50UGFpcnMgYWxnb3JpdGhtLi4uJyk7XG4gICAgREVCVUcoJ0lucHV0OiAnICsgb3BlcmF0aW9ucy5sZW5ndGggKyAnIG9wZXJhdGlvbnMnKTtcbiAgICB2YXIgc2ltaWxhciA9IFtdO1xuXG4gICAgZnVuY3Rpb24gYXJlU2ltaWxhck9wZXJhdGlvbnMoYSwgYikge1xuICAgICAgICBpZiAoYS5hbW91bnQgIT0gYi5hbW91bnQpXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIHZhciBkYXRlZGlmZiA9IE1hdGguYWJzKCthLmRhdGUgLSArYi5kYXRlKTtcbiAgICAgICAgcmV0dXJuIGRhdGVkaWZmIDw9IFRJTUVfU0lNSUxBUl9USFJFU0hPTEQ7XG4gICAgfVxuXG4gICAgLy8gTyhuIGxvZyBuKVxuICAgIGZ1bmN0aW9uIHNvcnRDcml0ZXJpYShhLGIpIHsgcmV0dXJuIGEuYW1vdW50IC0gYi5hbW91bnQ7IH1cbiAgICB2YXIgc29ydGVkID0gb3BlcmF0aW9ucy5zbGljZSgpLnNvcnQoc29ydENyaXRlcmlhKTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IG9wZXJhdGlvbnMubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgaWYgKGkgKyAxID49IG9wZXJhdGlvbnMubGVuZ3RoKVxuICAgICAgICAgICAgY29udGludWU7XG5cbiAgICAgICAgdmFyIG9wID0gc29ydGVkW2ldO1xuICAgICAgICB2YXIgbmV4dCA9IHNvcnRlZFtpKzFdO1xuICAgICAgICBpZiAoYXJlU2ltaWxhck9wZXJhdGlvbnMob3AsIG5leHQpKVxuICAgICAgICAgICAgc2ltaWxhci5wdXNoKFtvcCwgbmV4dF0pO1xuICAgIH1cblxuICAgIERFQlVHKHNpbWlsYXIubGVuZ3RoICsgJyBwYWlycyBvZiBzaW1pbGFyIG9wZXJhdGlvbnMgZm91bmQnKTtcbiAgICByZXR1cm4gc2ltaWxhcjtcbn1cblxuLy8gQ29tcG9uZW50c1xudmFyIFNpbWlsYXJpdHlJdGVtQ29tcG9uZW50ID0gUmVhY3QuY3JlYXRlQ2xhc3Moe2Rpc3BsYXlOYW1lOiAnU2ltaWxhcml0eUl0ZW1Db21wb25lbnQnLFxuXG4gICAgX2RlbGV0ZU9wZXJhdGlvbjogZnVuY3Rpb24oKSB7XG4gICAgICAgIGZsdXguZGlzcGF0Y2goe1xuICAgICAgICAgICAgdHlwZTogRXZlbnRzLkRFTEVURV9PUEVSQVRJT04sXG4gICAgICAgICAgICBvcGVyYXRpb246IHRoaXMucHJvcHMub3BlcmF0aW9uXG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICByZW5kZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgUmVhY3QuRE9NLnRyKG51bGwsIFxuICAgICAgICAgICAgICAgIFJlYWN0LkRPTS50ZChudWxsLCB0aGlzLnByb3BzLm9wZXJhdGlvbi5kYXRlLnRvU3RyaW5nKCkpLCBcbiAgICAgICAgICAgICAgICBSZWFjdC5ET00udGQobnVsbCwgdGhpcy5wcm9wcy5vcGVyYXRpb24udGl0bGUpLCBcbiAgICAgICAgICAgICAgICBSZWFjdC5ET00udGQobnVsbCwgdGhpcy5wcm9wcy5vcGVyYXRpb24uYW1vdW50KSwgXG4gICAgICAgICAgICAgICAgUmVhY3QuRE9NLnRkKG51bGwsIFJlYWN0LkRPTS5hKHtvbkNsaWNrOiB0aGlzLl9kZWxldGVPcGVyYXRpb259LCBcInhcIikpXG4gICAgICAgICAgICApXG4gICAgICAgICk7XG4gICAgfVxufSk7XG5cbnZhciBTaW1pbGFyaXR5UGFpckNvbXBvbmVudCA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtkaXNwbGF5TmFtZTogJ1NpbWlsYXJpdHlQYWlyQ29tcG9uZW50JyxcblxuICAgIHJlbmRlcjogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICBSZWFjdC5ET00udGFibGUobnVsbCwgXG4gICAgICAgICAgICAgICAgU2ltaWxhcml0eUl0ZW1Db21wb25lbnQoe29wZXJhdGlvbjogdGhpcy5wcm9wcy5hfSksIFxuICAgICAgICAgICAgICAgIFNpbWlsYXJpdHlJdGVtQ29tcG9uZW50KHtvcGVyYXRpb246IHRoaXMucHJvcHMuYn0pXG4gICAgICAgICAgICApXG4gICAgICAgICk7XG4gICAgfVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gUmVhY3QuY3JlYXRlQ2xhc3Moe2Rpc3BsYXlOYW1lOiAnZXhwb3J0cycsXG5cbiAgICBnZXRJbml0aWFsU3RhdGU6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgcGFpcnM6IFtdXG4gICAgICAgIH07XG4gICAgfSxcblxuICAgIF9jYjogZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgcGFpcnM6IGZpbmRSZWR1bmRhbnRQYWlycyhzdG9yZS5vcGVyYXRpb25zKVxuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgY29tcG9uZW50RGlkTW91bnQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICBzdG9yZS5vbihFdmVudHMuT1BFUkFUSU9OU19MT0FERUQsIHRoaXMuX2NiKTtcbiAgICB9LFxuXG4gICAgY29tcG9uZW50V2lsbFVubW91bnQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICBzdG9yZS5yZW1vdmVMaXN0ZW5lcihFdmVudHMuT1BFUkFUSU9OU19MT0FERUQsIHRoaXMuX2NiKTtcbiAgICB9LFxuXG4gICAgcmVuZGVyOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIHBhaXJzID0gdGhpcy5zdGF0ZS5wYWlycztcbiAgICAgICAgaWYgKHBhaXJzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgICAgICBSZWFjdC5ET00uZGl2KG51bGwsIFwiTm8gc2ltaWxhciBvcGVyYXRpb25zIGZvdW5kLlwiKVxuICAgICAgICAgICAgKVxuICAgICAgICB9XG5cbiAgICAgICAgdmFyIHNpbSA9IHBhaXJzLm1hcChmdW5jdGlvbiAocCkge1xuICAgICAgICAgICAgdmFyIGtleSA9IHBbMF0uaWQudG9TdHJpbmcoKSArIHBbMV0uaWQudG9TdHJpbmcoKTtcbiAgICAgICAgICAgIHJldHVybiAoU2ltaWxhcml0eVBhaXJDb21wb25lbnQoe2tleToga2V5LCBhOiBwWzBdLCBiOiBwWzFdfSkpXG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgUmVhY3QuRE9NLmRpdihudWxsLCBcbiAgICAgICAgICAgICAgICBSZWFjdC5ET00uaDEobnVsbCwgXCJTaW1pbGFyaXRpZXNcIiksIFxuICAgICAgICAgICAgICAgIFJlYWN0LkRPTS5kaXYobnVsbCwgXG4gICAgICAgICAgICAgICAgICAgIHNpbVxuICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICkpXG4gICAgfVxufSk7XG5cbiIsIi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIEJTRC1zdHlsZSBsaWNlbnNlIGZvdW5kIGluIHRoZVxuICogTElDRU5TRSBmaWxlIGluIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLiBBbiBhZGRpdGlvbmFsIGdyYW50XG4gKiBvZiBwYXRlbnQgcmlnaHRzIGNhbiBiZSBmb3VuZCBpbiB0aGUgUEFURU5UUyBmaWxlIGluIHRoZSBzYW1lIGRpcmVjdG9yeS5cbiAqXG4gKiBAcHJvdmlkZXNNb2R1bGUgRGlzcGF0Y2hlclxuICogQHR5cGVjaGVja3NcbiAqL1xuXG5cInVzZSBzdHJpY3RcIjtcblxudmFyIGludmFyaWFudCA9IHJlcXVpcmUoJy4vaW52YXJpYW50Jyk7XG5cbnZhciBfbGFzdElEID0gMTtcbnZhciBfcHJlZml4ID0gJ0lEXyc7XG5cbi8qKlxuICogRGlzcGF0Y2hlciBpcyB1c2VkIHRvIGJyb2FkY2FzdCBwYXlsb2FkcyB0byByZWdpc3RlcmVkIGNhbGxiYWNrcy4gVGhpcyBpc1xuICogZGlmZmVyZW50IGZyb20gZ2VuZXJpYyBwdWItc3ViIHN5c3RlbXMgaW4gdHdvIHdheXM6XG4gKlxuICogICAxKSBDYWxsYmFja3MgYXJlIG5vdCBzdWJzY3JpYmVkIHRvIHBhcnRpY3VsYXIgZXZlbnRzLiBFdmVyeSBwYXlsb2FkIGlzXG4gKiAgICAgIGRpc3BhdGNoZWQgdG8gZXZlcnkgcmVnaXN0ZXJlZCBjYWxsYmFjay5cbiAqICAgMikgQ2FsbGJhY2tzIGNhbiBiZSBkZWZlcnJlZCBpbiB3aG9sZSBvciBwYXJ0IHVudGlsIG90aGVyIGNhbGxiYWNrcyBoYXZlXG4gKiAgICAgIGJlZW4gZXhlY3V0ZWQuXG4gKlxuICogRm9yIGV4YW1wbGUsIGNvbnNpZGVyIHRoaXMgaHlwb3RoZXRpY2FsIGZsaWdodCBkZXN0aW5hdGlvbiBmb3JtLCB3aGljaFxuICogc2VsZWN0cyBhIGRlZmF1bHQgY2l0eSB3aGVuIGEgY291bnRyeSBpcyBzZWxlY3RlZDpcbiAqXG4gKiAgIHZhciBmbGlnaHREaXNwYXRjaGVyID0gbmV3IERpc3BhdGNoZXIoKTtcbiAqXG4gKiAgIC8vIEtlZXBzIHRyYWNrIG9mIHdoaWNoIGNvdW50cnkgaXMgc2VsZWN0ZWRcbiAqICAgdmFyIENvdW50cnlTdG9yZSA9IHtjb3VudHJ5OiBudWxsfTtcbiAqXG4gKiAgIC8vIEtlZXBzIHRyYWNrIG9mIHdoaWNoIGNpdHkgaXMgc2VsZWN0ZWRcbiAqICAgdmFyIENpdHlTdG9yZSA9IHtjaXR5OiBudWxsfTtcbiAqXG4gKiAgIC8vIEtlZXBzIHRyYWNrIG9mIHRoZSBiYXNlIGZsaWdodCBwcmljZSBvZiB0aGUgc2VsZWN0ZWQgY2l0eVxuICogICB2YXIgRmxpZ2h0UHJpY2VTdG9yZSA9IHtwcmljZTogbnVsbH1cbiAqXG4gKiBXaGVuIGEgdXNlciBjaGFuZ2VzIHRoZSBzZWxlY3RlZCBjaXR5LCB3ZSBkaXNwYXRjaCB0aGUgcGF5bG9hZDpcbiAqXG4gKiAgIGZsaWdodERpc3BhdGNoZXIuZGlzcGF0Y2goe1xuICogICAgIGFjdGlvblR5cGU6ICdjaXR5LXVwZGF0ZScsXG4gKiAgICAgc2VsZWN0ZWRDaXR5OiAncGFyaXMnXG4gKiAgIH0pO1xuICpcbiAqIFRoaXMgcGF5bG9hZCBpcyBkaWdlc3RlZCBieSBgQ2l0eVN0b3JlYDpcbiAqXG4gKiAgIGZsaWdodERpc3BhdGNoZXIucmVnaXN0ZXIoZnVuY3Rpb24ocGF5bG9hZCkge1xuICogICAgIGlmIChwYXlsb2FkLmFjdGlvblR5cGUgPT09ICdjaXR5LXVwZGF0ZScpIHtcbiAqICAgICAgIENpdHlTdG9yZS5jaXR5ID0gcGF5bG9hZC5zZWxlY3RlZENpdHk7XG4gKiAgICAgfVxuICogICB9KTtcbiAqXG4gKiBXaGVuIHRoZSB1c2VyIHNlbGVjdHMgYSBjb3VudHJ5LCB3ZSBkaXNwYXRjaCB0aGUgcGF5bG9hZDpcbiAqXG4gKiAgIGZsaWdodERpc3BhdGNoZXIuZGlzcGF0Y2goe1xuICogICAgIGFjdGlvblR5cGU6ICdjb3VudHJ5LXVwZGF0ZScsXG4gKiAgICAgc2VsZWN0ZWRDb3VudHJ5OiAnYXVzdHJhbGlhJ1xuICogICB9KTtcbiAqXG4gKiBUaGlzIHBheWxvYWQgaXMgZGlnZXN0ZWQgYnkgYm90aCBzdG9yZXM6XG4gKlxuICogICAgQ291bnRyeVN0b3JlLmRpc3BhdGNoVG9rZW4gPSBmbGlnaHREaXNwYXRjaGVyLnJlZ2lzdGVyKGZ1bmN0aW9uKHBheWxvYWQpIHtcbiAqICAgICBpZiAocGF5bG9hZC5hY3Rpb25UeXBlID09PSAnY291bnRyeS11cGRhdGUnKSB7XG4gKiAgICAgICBDb3VudHJ5U3RvcmUuY291bnRyeSA9IHBheWxvYWQuc2VsZWN0ZWRDb3VudHJ5O1xuICogICAgIH1cbiAqICAgfSk7XG4gKlxuICogV2hlbiB0aGUgY2FsbGJhY2sgdG8gdXBkYXRlIGBDb3VudHJ5U3RvcmVgIGlzIHJlZ2lzdGVyZWQsIHdlIHNhdmUgYSByZWZlcmVuY2VcbiAqIHRvIHRoZSByZXR1cm5lZCB0b2tlbi4gVXNpbmcgdGhpcyB0b2tlbiB3aXRoIGB3YWl0Rm9yKClgLCB3ZSBjYW4gZ3VhcmFudGVlXG4gKiB0aGF0IGBDb3VudHJ5U3RvcmVgIGlzIHVwZGF0ZWQgYmVmb3JlIHRoZSBjYWxsYmFjayB0aGF0IHVwZGF0ZXMgYENpdHlTdG9yZWBcbiAqIG5lZWRzIHRvIHF1ZXJ5IGl0cyBkYXRhLlxuICpcbiAqICAgQ2l0eVN0b3JlLmRpc3BhdGNoVG9rZW4gPSBmbGlnaHREaXNwYXRjaGVyLnJlZ2lzdGVyKGZ1bmN0aW9uKHBheWxvYWQpIHtcbiAqICAgICBpZiAocGF5bG9hZC5hY3Rpb25UeXBlID09PSAnY291bnRyeS11cGRhdGUnKSB7XG4gKiAgICAgICAvLyBgQ291bnRyeVN0b3JlLmNvdW50cnlgIG1heSBub3QgYmUgdXBkYXRlZC5cbiAqICAgICAgIGZsaWdodERpc3BhdGNoZXIud2FpdEZvcihbQ291bnRyeVN0b3JlLmRpc3BhdGNoVG9rZW5dKTtcbiAqICAgICAgIC8vIGBDb3VudHJ5U3RvcmUuY291bnRyeWAgaXMgbm93IGd1YXJhbnRlZWQgdG8gYmUgdXBkYXRlZC5cbiAqXG4gKiAgICAgICAvLyBTZWxlY3QgdGhlIGRlZmF1bHQgY2l0eSBmb3IgdGhlIG5ldyBjb3VudHJ5XG4gKiAgICAgICBDaXR5U3RvcmUuY2l0eSA9IGdldERlZmF1bHRDaXR5Rm9yQ291bnRyeShDb3VudHJ5U3RvcmUuY291bnRyeSk7XG4gKiAgICAgfVxuICogICB9KTtcbiAqXG4gKiBUaGUgdXNhZ2Ugb2YgYHdhaXRGb3IoKWAgY2FuIGJlIGNoYWluZWQsIGZvciBleGFtcGxlOlxuICpcbiAqICAgRmxpZ2h0UHJpY2VTdG9yZS5kaXNwYXRjaFRva2VuID1cbiAqICAgICBmbGlnaHREaXNwYXRjaGVyLnJlZ2lzdGVyKGZ1bmN0aW9uKHBheWxvYWQpIHtcbiAqICAgICAgIHN3aXRjaCAocGF5bG9hZC5hY3Rpb25UeXBlKSB7XG4gKiAgICAgICAgIGNhc2UgJ2NvdW50cnktdXBkYXRlJzpcbiAqICAgICAgICAgICBmbGlnaHREaXNwYXRjaGVyLndhaXRGb3IoW0NpdHlTdG9yZS5kaXNwYXRjaFRva2VuXSk7XG4gKiAgICAgICAgICAgRmxpZ2h0UHJpY2VTdG9yZS5wcmljZSA9XG4gKiAgICAgICAgICAgICBnZXRGbGlnaHRQcmljZVN0b3JlKENvdW50cnlTdG9yZS5jb3VudHJ5LCBDaXR5U3RvcmUuY2l0eSk7XG4gKiAgICAgICAgICAgYnJlYWs7XG4gKlxuICogICAgICAgICBjYXNlICdjaXR5LXVwZGF0ZSc6XG4gKiAgICAgICAgICAgRmxpZ2h0UHJpY2VTdG9yZS5wcmljZSA9XG4gKiAgICAgICAgICAgICBGbGlnaHRQcmljZVN0b3JlKENvdW50cnlTdG9yZS5jb3VudHJ5LCBDaXR5U3RvcmUuY2l0eSk7XG4gKiAgICAgICAgICAgYnJlYWs7XG4gKiAgICAgfVxuICogICB9KTtcbiAqXG4gKiBUaGUgYGNvdW50cnktdXBkYXRlYCBwYXlsb2FkIHdpbGwgYmUgZ3VhcmFudGVlZCB0byBpbnZva2UgdGhlIHN0b3JlcydcbiAqIHJlZ2lzdGVyZWQgY2FsbGJhY2tzIGluIG9yZGVyOiBgQ291bnRyeVN0b3JlYCwgYENpdHlTdG9yZWAsIHRoZW5cbiAqIGBGbGlnaHRQcmljZVN0b3JlYC5cbiAqL1xuXG4gIGZ1bmN0aW9uIERpc3BhdGNoZXIoKSB7XG4gICAgdGhpcy4kRGlzcGF0Y2hlcl9jYWxsYmFja3MgPSB7fTtcbiAgICB0aGlzLiREaXNwYXRjaGVyX2lzUGVuZGluZyA9IHt9O1xuICAgIHRoaXMuJERpc3BhdGNoZXJfaXNIYW5kbGVkID0ge307XG4gICAgdGhpcy4kRGlzcGF0Y2hlcl9pc0Rpc3BhdGNoaW5nID0gZmFsc2U7XG4gICAgdGhpcy4kRGlzcGF0Y2hlcl9wZW5kaW5nUGF5bG9hZCA9IG51bGw7XG4gIH1cblxuICAvKipcbiAgICogUmVnaXN0ZXJzIGEgY2FsbGJhY2sgdG8gYmUgaW52b2tlZCB3aXRoIGV2ZXJ5IGRpc3BhdGNoZWQgcGF5bG9hZC4gUmV0dXJuc1xuICAgKiBhIHRva2VuIHRoYXQgY2FuIGJlIHVzZWQgd2l0aCBgd2FpdEZvcigpYC5cbiAgICpcbiAgICogQHBhcmFtIHtmdW5jdGlvbn0gY2FsbGJhY2tcbiAgICogQHJldHVybiB7c3RyaW5nfVxuICAgKi9cbiAgRGlzcGF0Y2hlci5wcm90b3R5cGUucmVnaXN0ZXI9ZnVuY3Rpb24oY2FsbGJhY2spIHtcbiAgICB2YXIgaWQgPSBfcHJlZml4ICsgX2xhc3RJRCsrO1xuICAgIHRoaXMuJERpc3BhdGNoZXJfY2FsbGJhY2tzW2lkXSA9IGNhbGxiYWNrO1xuICAgIHJldHVybiBpZDtcbiAgfTtcblxuICAvKipcbiAgICogUmVtb3ZlcyBhIGNhbGxiYWNrIGJhc2VkIG9uIGl0cyB0b2tlbi5cbiAgICpcbiAgICogQHBhcmFtIHtzdHJpbmd9IGlkXG4gICAqL1xuICBEaXNwYXRjaGVyLnByb3RvdHlwZS51bnJlZ2lzdGVyPWZ1bmN0aW9uKGlkKSB7XG4gICAgaW52YXJpYW50KFxuICAgICAgdGhpcy4kRGlzcGF0Y2hlcl9jYWxsYmFja3NbaWRdLFxuICAgICAgJ0Rpc3BhdGNoZXIudW5yZWdpc3RlciguLi4pOiBgJXNgIGRvZXMgbm90IG1hcCB0byBhIHJlZ2lzdGVyZWQgY2FsbGJhY2suJyxcbiAgICAgIGlkXG4gICAgKTtcbiAgICBkZWxldGUgdGhpcy4kRGlzcGF0Y2hlcl9jYWxsYmFja3NbaWRdO1xuICB9O1xuXG4gIC8qKlxuICAgKiBXYWl0cyBmb3IgdGhlIGNhbGxiYWNrcyBzcGVjaWZpZWQgdG8gYmUgaW52b2tlZCBiZWZvcmUgY29udGludWluZyBleGVjdXRpb25cbiAgICogb2YgdGhlIGN1cnJlbnQgY2FsbGJhY2suIFRoaXMgbWV0aG9kIHNob3VsZCBvbmx5IGJlIHVzZWQgYnkgYSBjYWxsYmFjayBpblxuICAgKiByZXNwb25zZSB0byBhIGRpc3BhdGNoZWQgcGF5bG9hZC5cbiAgICpcbiAgICogQHBhcmFtIHthcnJheTxzdHJpbmc+fSBpZHNcbiAgICovXG4gIERpc3BhdGNoZXIucHJvdG90eXBlLndhaXRGb3I9ZnVuY3Rpb24oaWRzKSB7XG4gICAgaW52YXJpYW50KFxuICAgICAgdGhpcy4kRGlzcGF0Y2hlcl9pc0Rpc3BhdGNoaW5nLFxuICAgICAgJ0Rpc3BhdGNoZXIud2FpdEZvciguLi4pOiBNdXN0IGJlIGludm9rZWQgd2hpbGUgZGlzcGF0Y2hpbmcuJ1xuICAgICk7XG4gICAgZm9yICh2YXIgaWkgPSAwOyBpaSA8IGlkcy5sZW5ndGg7IGlpKyspIHtcbiAgICAgIHZhciBpZCA9IGlkc1tpaV07XG4gICAgICBpZiAodGhpcy4kRGlzcGF0Y2hlcl9pc1BlbmRpbmdbaWRdKSB7XG4gICAgICAgIGludmFyaWFudChcbiAgICAgICAgICB0aGlzLiREaXNwYXRjaGVyX2lzSGFuZGxlZFtpZF0sXG4gICAgICAgICAgJ0Rpc3BhdGNoZXIud2FpdEZvciguLi4pOiBDaXJjdWxhciBkZXBlbmRlbmN5IGRldGVjdGVkIHdoaWxlICcgK1xuICAgICAgICAgICd3YWl0aW5nIGZvciBgJXNgLicsXG4gICAgICAgICAgaWRcbiAgICAgICAgKTtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG4gICAgICBpbnZhcmlhbnQoXG4gICAgICAgIHRoaXMuJERpc3BhdGNoZXJfY2FsbGJhY2tzW2lkXSxcbiAgICAgICAgJ0Rpc3BhdGNoZXIud2FpdEZvciguLi4pOiBgJXNgIGRvZXMgbm90IG1hcCB0byBhIHJlZ2lzdGVyZWQgY2FsbGJhY2suJyxcbiAgICAgICAgaWRcbiAgICAgICk7XG4gICAgICB0aGlzLiREaXNwYXRjaGVyX2ludm9rZUNhbGxiYWNrKGlkKTtcbiAgICB9XG4gIH07XG5cbiAgLyoqXG4gICAqIERpc3BhdGNoZXMgYSBwYXlsb2FkIHRvIGFsbCByZWdpc3RlcmVkIGNhbGxiYWNrcy5cbiAgICpcbiAgICogQHBhcmFtIHtvYmplY3R9IHBheWxvYWRcbiAgICovXG4gIERpc3BhdGNoZXIucHJvdG90eXBlLmRpc3BhdGNoPWZ1bmN0aW9uKHBheWxvYWQpIHtcbiAgICBpbnZhcmlhbnQoXG4gICAgICAhdGhpcy4kRGlzcGF0Y2hlcl9pc0Rpc3BhdGNoaW5nLFxuICAgICAgJ0Rpc3BhdGNoLmRpc3BhdGNoKC4uLik6IENhbm5vdCBkaXNwYXRjaCBpbiB0aGUgbWlkZGxlIG9mIGEgZGlzcGF0Y2guJ1xuICAgICk7XG4gICAgdGhpcy4kRGlzcGF0Y2hlcl9zdGFydERpc3BhdGNoaW5nKHBheWxvYWQpO1xuICAgIHRyeSB7XG4gICAgICBmb3IgKHZhciBpZCBpbiB0aGlzLiREaXNwYXRjaGVyX2NhbGxiYWNrcykge1xuICAgICAgICBpZiAodGhpcy4kRGlzcGF0Y2hlcl9pc1BlbmRpbmdbaWRdKSB7XG4gICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy4kRGlzcGF0Y2hlcl9pbnZva2VDYWxsYmFjayhpZCk7XG4gICAgICB9XG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIHRoaXMuJERpc3BhdGNoZXJfc3RvcERpc3BhdGNoaW5nKCk7XG4gICAgfVxuICB9O1xuXG4gIC8qKlxuICAgKiBJcyB0aGlzIERpc3BhdGNoZXIgY3VycmVudGx5IGRpc3BhdGNoaW5nLlxuICAgKlxuICAgKiBAcmV0dXJuIHtib29sZWFufVxuICAgKi9cbiAgRGlzcGF0Y2hlci5wcm90b3R5cGUuaXNEaXNwYXRjaGluZz1mdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy4kRGlzcGF0Y2hlcl9pc0Rpc3BhdGNoaW5nO1xuICB9O1xuXG4gIC8qKlxuICAgKiBDYWxsIHRoZSBjYWxsYmFjayBzdG9yZWQgd2l0aCB0aGUgZ2l2ZW4gaWQuIEFsc28gZG8gc29tZSBpbnRlcm5hbFxuICAgKiBib29ra2VlcGluZy5cbiAgICpcbiAgICogQHBhcmFtIHtzdHJpbmd9IGlkXG4gICAqIEBpbnRlcm5hbFxuICAgKi9cbiAgRGlzcGF0Y2hlci5wcm90b3R5cGUuJERpc3BhdGNoZXJfaW52b2tlQ2FsbGJhY2s9ZnVuY3Rpb24oaWQpIHtcbiAgICB0aGlzLiREaXNwYXRjaGVyX2lzUGVuZGluZ1tpZF0gPSB0cnVlO1xuICAgIHRoaXMuJERpc3BhdGNoZXJfY2FsbGJhY2tzW2lkXSh0aGlzLiREaXNwYXRjaGVyX3BlbmRpbmdQYXlsb2FkKTtcbiAgICB0aGlzLiREaXNwYXRjaGVyX2lzSGFuZGxlZFtpZF0gPSB0cnVlO1xuICB9O1xuXG4gIC8qKlxuICAgKiBTZXQgdXAgYm9va2tlZXBpbmcgbmVlZGVkIHdoZW4gZGlzcGF0Y2hpbmcuXG4gICAqXG4gICAqIEBwYXJhbSB7b2JqZWN0fSBwYXlsb2FkXG4gICAqIEBpbnRlcm5hbFxuICAgKi9cbiAgRGlzcGF0Y2hlci5wcm90b3R5cGUuJERpc3BhdGNoZXJfc3RhcnREaXNwYXRjaGluZz1mdW5jdGlvbihwYXlsb2FkKSB7XG4gICAgZm9yICh2YXIgaWQgaW4gdGhpcy4kRGlzcGF0Y2hlcl9jYWxsYmFja3MpIHtcbiAgICAgIHRoaXMuJERpc3BhdGNoZXJfaXNQZW5kaW5nW2lkXSA9IGZhbHNlO1xuICAgICAgdGhpcy4kRGlzcGF0Y2hlcl9pc0hhbmRsZWRbaWRdID0gZmFsc2U7XG4gICAgfVxuICAgIHRoaXMuJERpc3BhdGNoZXJfcGVuZGluZ1BheWxvYWQgPSBwYXlsb2FkO1xuICAgIHRoaXMuJERpc3BhdGNoZXJfaXNEaXNwYXRjaGluZyA9IHRydWU7XG4gIH07XG5cbiAgLyoqXG4gICAqIENsZWFyIGJvb2trZWVwaW5nIHVzZWQgZm9yIGRpc3BhdGNoaW5nLlxuICAgKlxuICAgKiBAaW50ZXJuYWxcbiAgICovXG4gIERpc3BhdGNoZXIucHJvdG90eXBlLiREaXNwYXRjaGVyX3N0b3BEaXNwYXRjaGluZz1mdW5jdGlvbigpIHtcbiAgICB0aGlzLiREaXNwYXRjaGVyX3BlbmRpbmdQYXlsb2FkID0gbnVsbDtcbiAgICB0aGlzLiREaXNwYXRjaGVyX2lzRGlzcGF0Y2hpbmcgPSBmYWxzZTtcbiAgfTtcblxuXG5tb2R1bGUuZXhwb3J0cyA9IG5ldyBEaXNwYXRjaGVyO1xuIiwiLyoqXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIEJTRC1zdHlsZSBsaWNlbnNlIGZvdW5kIGluIHRoZVxuICogTElDRU5TRSBmaWxlIGluIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLiBBbiBhZGRpdGlvbmFsIGdyYW50XG4gKiBvZiBwYXRlbnQgcmlnaHRzIGNhbiBiZSBmb3VuZCBpbiB0aGUgUEFURU5UUyBmaWxlIGluIHRoZSBzYW1lIGRpcmVjdG9yeS5cbiAqXG4gKiBAcHJvdmlkZXNNb2R1bGUgaW52YXJpYW50XG4gKi9cblxuXCJ1c2Ugc3RyaWN0XCI7XG5cbi8qKlxuICogVXNlIGludmFyaWFudCgpIHRvIGFzc2VydCBzdGF0ZSB3aGljaCB5b3VyIHByb2dyYW0gYXNzdW1lcyB0byBiZSB0cnVlLlxuICpcbiAqIFByb3ZpZGUgc3ByaW50Zi1zdHlsZSBmb3JtYXQgKG9ubHkgJXMgaXMgc3VwcG9ydGVkKSBhbmQgYXJndW1lbnRzXG4gKiB0byBwcm92aWRlIGluZm9ybWF0aW9uIGFib3V0IHdoYXQgYnJva2UgYW5kIHdoYXQgeW91IHdlcmVcbiAqIGV4cGVjdGluZy5cbiAqXG4gKiBUaGUgaW52YXJpYW50IG1lc3NhZ2Ugd2lsbCBiZSBzdHJpcHBlZCBpbiBwcm9kdWN0aW9uLCBidXQgdGhlIGludmFyaWFudFxuICogd2lsbCByZW1haW4gdG8gZW5zdXJlIGxvZ2ljIGRvZXMgbm90IGRpZmZlciBpbiBwcm9kdWN0aW9uLlxuICovXG5cbnZhciBpbnZhcmlhbnQgPSBmdW5jdGlvbihjb25kaXRpb24sIGZvcm1hdCwgYSwgYiwgYywgZCwgZSwgZikge1xuICBpZiAoIWNvbmRpdGlvbikge1xuICAgIHZhciBlcnJvcjtcbiAgICBpZiAoZm9ybWF0ID09PSB1bmRlZmluZWQpIHtcbiAgICAgIGVycm9yID0gbmV3IEVycm9yKFxuICAgICAgICAnTWluaWZpZWQgZXhjZXB0aW9uIG9jY3VycmVkOyB1c2UgdGhlIG5vbi1taW5pZmllZCBkZXYgZW52aXJvbm1lbnQgJyArXG4gICAgICAgICdmb3IgdGhlIGZ1bGwgZXJyb3IgbWVzc2FnZSBhbmQgYWRkaXRpb25hbCBoZWxwZnVsIHdhcm5pbmdzLidcbiAgICAgICk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHZhciBhcmdzID0gW2EsIGIsIGMsIGQsIGUsIGZdO1xuICAgICAgdmFyIGFyZ0luZGV4ID0gMDtcbiAgICAgIGVycm9yID0gbmV3IEVycm9yKFxuICAgICAgICAnSW52YXJpYW50IFZpb2xhdGlvbjogJyArXG4gICAgICAgIGZvcm1hdC5yZXBsYWNlKC8lcy9nLCBmdW5jdGlvbigpIHsgcmV0dXJuIGFyZ3NbYXJnSW5kZXgrK107IH0pXG4gICAgICApO1xuICAgIH1cblxuICAgIGVycm9yLmZyYW1lc1RvUG9wID0gMTsgLy8gd2UgZG9uJ3QgY2FyZSBhYm91dCBpbnZhcmlhbnQncyBvd24gZnJhbWVcbiAgICB0aHJvdyBlcnJvcjtcbiAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBpbnZhcmlhbnQ7XG4iLCIvKiogQGpzeCBSZWFjdC5ET00gKi9cblxuLy8gSGVscGVyc1xudmFyIEV2ZW50cyA9IHJlcXVpcmUoJy4vRXZlbnRzJyk7XG5cbi8vIENsYXNzZXNcbnZhciBBY2NvdW50TGlzdENvbXBvbmVudCA9IHJlcXVpcmUoJy4vY29tcG9uZW50cy9BY2NvdW50TGlzdENvbXBvbmVudCcpO1xudmFyIEJhbmtMaXN0Q29tcG9uZW50ID0gcmVxdWlyZSgnLi9jb21wb25lbnRzL0JhbmtMaXN0Q29tcG9uZW50Jyk7XG52YXIgQ2F0ZWdvcnlDb21wb25lbnQgPSByZXF1aXJlKCcuL2NvbXBvbmVudHMvQ2F0ZWdvcnlDb21wb25lbnQnKTtcbnZhciBDaGFydENvbXBvbmVudCA9IHJlcXVpcmUoJy4vY29tcG9uZW50cy9DaGFydENvbXBvbmVudCcpO1xudmFyIE9wZXJhdGlvbkxpc3RDb21wb25lbnQgPSByZXF1aXJlKCcuL2NvbXBvbmVudHMvT3BlcmF0aW9uTGlzdENvbXBvbmVudCcpO1xudmFyIFNpbWlsYXJpdHlDb21wb25lbnQgPSByZXF1aXJlKCcuL2NvbXBvbmVudHMvU2ltaWxhcml0eUNvbXBvbmVudCcpO1xuXG4vLyBHbG9iYWwgdmFyaWFibGVzXG52YXIgc3RvcmUgPSByZXF1aXJlKCcuL3N0b3JlJyk7XG5cbi8vIE5vdyB0aGlzIHJlYWxseSBiZWdpbnMuXG52YXIgS3Jlc3VzID0gUmVhY3QuY3JlYXRlQ2xhc3Moe2Rpc3BsYXlOYW1lOiAnS3Jlc3VzJyxcblxuICAgIGNvbXBvbmVudERpZE1vdW50OiBmdW5jdGlvbigpIHtcbiAgICAgICAgLy8gTGV0J3MgZ28uXG4gICAgICAgIHN0b3JlLmdldENhdGVnb3JpZXMoKTtcbiAgICAgICAgc3RvcmUub25jZShFdmVudHMuQ0FURUdPUklFU19MT0FERUQsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgc3RvcmUuZ2V0QWxsQmFua3MoKTtcbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIHJlbmRlcjogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICBSZWFjdC5ET00uZGl2KHtjbGFzc05hbWU6IFwicm93XCJ9LCBcblxuICAgICAgICAgICAgUmVhY3QuRE9NLmRpdih7Y2xhc3NOYW1lOiBcInBhbmVsIHNtYWxsLTIgY29sdW1uc1wifSwgXG4gICAgICAgICAgICAgICAgQmFua0xpc3RDb21wb25lbnQobnVsbCksIFxuICAgICAgICAgICAgICAgIEFjY291bnRMaXN0Q29tcG9uZW50KG51bGwpXG4gICAgICAgICAgICApLCBcblxuICAgICAgICAgICAgUmVhY3QuRE9NLmRpdih7Y2xhc3NOYW1lOiBcInNtYWxsLTEwIGNvbHVtbnNcIn0sIFxuICAgICAgICAgICAgICAgIFJlYWN0LkRPTS51bCh7Y2xhc3NOYW1lOiBcInRhYnNcIiwgJ2RhdGEtdGFiJzogdHJ1ZX0sIFxuICAgICAgICAgICAgICAgICAgICBSZWFjdC5ET00ubGkoe2NsYXNzTmFtZTogXCJ0YWItdGl0bGUgYWN0aXZlXCJ9LCBSZWFjdC5ET00uYSh7aHJlZjogXCIjcGFuZWwtb3BlcmF0aW9uc1wifSwgXCJPcGVyYXRpb25zXCIpKSwgXG4gICAgICAgICAgICAgICAgICAgIFJlYWN0LkRPTS5saSh7Y2xhc3NOYW1lOiBcInRhYi10aXRsZVwifSwgUmVhY3QuRE9NLmEoe2hyZWY6IFwiI3BhbmVsLWNoYXJ0c1wifSwgXCJDaGFydHNcIikpLCBcbiAgICAgICAgICAgICAgICAgICAgUmVhY3QuRE9NLmxpKHtjbGFzc05hbWU6IFwidGFiLXRpdGxlXCJ9LCBSZWFjdC5ET00uYSh7aHJlZjogXCIjcGFuZWwtc2ltaWxhcml0aWVzXCJ9LCBcIlNpbWlsYXJpdGllc1wiKSksIFxuICAgICAgICAgICAgICAgICAgICBSZWFjdC5ET00ubGkoe2NsYXNzTmFtZTogXCJ0YWItdGl0bGVcIn0sIFJlYWN0LkRPTS5hKHtocmVmOiBcIiNwYW5lbC1jYXRlZ29yaWVzXCJ9LCBcIkNhdGVnb3JpZXNcIikpXG4gICAgICAgICAgICAgICAgKSwgXG5cbiAgICAgICAgICAgICAgICBSZWFjdC5ET00uZGl2KHtjbGFzc05hbWU6IFwidGFicy1jb250ZW50XCJ9LCBcblxuICAgICAgICAgICAgICAgICAgICBSZWFjdC5ET00uZGl2KHtjbGFzc05hbWU6IFwiY29udGVudCBhY3RpdmVcIiwgaWQ6IFwicGFuZWwtb3BlcmF0aW9uc1wifSwgXG4gICAgICAgICAgICAgICAgICAgICAgICBPcGVyYXRpb25MaXN0Q29tcG9uZW50KG51bGwpXG4gICAgICAgICAgICAgICAgICAgICksIFxuXG4gICAgICAgICAgICAgICAgICAgIFJlYWN0LkRPTS5kaXYoe2NsYXNzTmFtZTogXCJjb250ZW50XCIsIGlkOiBcInBhbmVsLXNpbWlsYXJpdGllc1wifSwgXG4gICAgICAgICAgICAgICAgICAgICAgICBTaW1pbGFyaXR5Q29tcG9uZW50KG51bGwpXG4gICAgICAgICAgICAgICAgICAgICksIFxuXG4gICAgICAgICAgICAgICAgICAgIFJlYWN0LkRPTS5kaXYoe2NsYXNzTmFtZTogXCJjb250ZW50XCIsIGlkOiBcInBhbmVsLWNoYXJ0c1wifSwgXG4gICAgICAgICAgICAgICAgICAgICAgICBDaGFydENvbXBvbmVudChudWxsKVxuICAgICAgICAgICAgICAgICAgICApLCBcblxuICAgICAgICAgICAgICAgICAgICBSZWFjdC5ET00uZGl2KHtjbGFzc05hbWU6IFwiY29udGVudFwiLCBpZDogXCJwYW5lbC1jYXRlZ29yaWVzXCJ9LCBcbiAgICAgICAgICAgICAgICAgICAgICAgIENhdGVnb3J5Q29tcG9uZW50KG51bGwpXG4gICAgICAgICAgICAgICAgICAgIClcblxuICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgIClcblxuICAgICAgICAgICAgKVxuICAgICAgICApO1xuICAgIH1cbn0pO1xuXG5SZWFjdC5yZW5kZXJDb21wb25lbnQoS3Jlc3VzKG51bGwpLCBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjbWFpbicpKTtcbiIsInZhciBFRSA9IHJlcXVpcmUoJ2V2ZW50cycpLkV2ZW50RW1pdHRlcjtcbnZhciBFdmVudHMgPSByZXF1aXJlKCcuL0V2ZW50cycpO1xuXG52YXIgSGVscGVycyA9IHJlcXVpcmUoJy4vSGVscGVycycpO1xudmFyIGFzc2VydCA9IEhlbHBlcnMuYXNzZXJ0O1xudmFyIGRlYnVnID0gSGVscGVycy5kZWJ1ZztcbnZhciBoYXMgPSBIZWxwZXJzLmhhcztcbnZhciB4aHJFcnJvciA9IEhlbHBlcnMueGhyRXJyb3I7XG5cbnZhciBNb2RlbHMgPSByZXF1aXJlKCcuL01vZGVscycpO1xudmFyIEFjY291bnQgPSBNb2RlbHMuQWNjb3VudDtcbnZhciBCYW5rID0gTW9kZWxzLkJhbms7XG52YXIgQ2F0ZWdvcnkgPSBNb2RlbHMuQ2F0ZWdvcnk7XG52YXIgT3BlcmF0aW9uID0gTW9kZWxzLk9wZXJhdGlvbjtcblxudmFyIGZsdXggPSByZXF1aXJlKCcuL2ZsdXgvZGlzcGF0Y2hlcicpO1xuXG4vLyBIb2xkcyB0aGUgY3VycmVudCBiYW5rIGluZm9ybWF0aW9uXG52YXIgc3RvcmUgPSBuZXcgRUU7XG5cbnN0b3JlLmJhbmtzID0gW107XG5zdG9yZS5jYXRlZ29yaWVzID0gW107XG5zdG9yZS5jYXRlZ29yeUxhYmVsID0ge307IC8vIG1hcHMgY2F0ZWdvcnkgaWRzIHRvIGxhYmVsc1xuXG5zdG9yZS5hY2NvdW50cyA9IFtdOyAgICAvLyBmb3IgYSBnaXZlbiBiYW5rXG5zdG9yZS5vcGVyYXRpb25zID0gW107ICAvLyBmb3IgYSBnaXZlbiBhY2NvdW50XG5cbnN0b3JlLmN1cnJlbnRCYW5rID0gbnVsbDtcbnN0b3JlLmN1cnJlbnRBY2NvdW50ID0gbnVsbDtcblxuc3RvcmUuZ2V0QWxsQmFua3MgPSBmdW5jdGlvbigpIHtcbiAgICAkLmdldCgnYmFua3MnLCB7d2l0aEFjY291bnRPbmx5OnRydWV9LCBmdW5jdGlvbiAoZGF0YSkge1xuICAgICAgICB2YXIgYmFua3MgPSBbXVxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGRhdGEubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHZhciBiID0gbmV3IEJhbmsoZGF0YVtpXSk7XG4gICAgICAgICAgICBiYW5rcy5wdXNoKGIpO1xuICAgICAgICB9XG5cbiAgICAgICAgZmx1eC5kaXNwYXRjaCh7XG4gICAgICAgICAgICB0eXBlOiBFdmVudHMuQkFOS19MSVNUX0xPQURFRCxcbiAgICAgICAgICAgIGxpc3Q6IGJhbmtzXG4gICAgICAgIH0pO1xuXG4gICAgICAgIGlmIChiYW5rcy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICBmbHV4LmRpc3BhdGNoKHtcbiAgICAgICAgICAgICAgICB0eXBlOiBFdmVudHMuU0VMRUNURURfQkFOS19DSEFOR0VELFxuICAgICAgICAgICAgICAgIGJhbms6IGJhbmtzWzBdXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH0pLmZhaWwoeGhyRXJyb3IpO1xufVxuXG5zdG9yZS5sb2FkQWxsQWNjb3VudHMgPSBmdW5jdGlvbiAoKSB7XG4gICAgaGFzKHRoaXMsICdjdXJyZW50QmFuaycpO1xuICAgIGFzc2VydCh0aGlzLmN1cnJlbnRCYW5rIGluc3RhbmNlb2YgQmFuayk7XG5cbiAgICAkLmdldCgnYmFua3MvZ2V0QWNjb3VudHMvJyArIHRoaXMuY3VycmVudEJhbmsuaWQsIGZ1bmN0aW9uIChkYXRhKSB7XG5cbiAgICAgICAgdmFyIGFjY291bnRzID0gW11cbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBkYXRhLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBhY2NvdW50cy5wdXNoKG5ldyBBY2NvdW50KGRhdGFbaV0pKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGZsdXguZGlzcGF0Y2goe1xuICAgICAgICAgICAgdHlwZTogRXZlbnRzLkFDQ09VTlRTX0xPQURFRCxcbiAgICAgICAgICAgIGFjY291bnRzOiBhY2NvdW50c1xuICAgICAgICB9KTtcblxuICAgICAgICBpZiAoYWNjb3VudHMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgZmx1eC5kaXNwYXRjaCh7XG4gICAgICAgICAgICAgICAgdHlwZTogRXZlbnRzLlNFTEVDVEVEX0FDQ09VTlRfQ0hBTkdFRCxcbiAgICAgICAgICAgICAgICBhY2NvdW50OiBhY2NvdW50c1swXVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9KS5mYWlsKHhockVycm9yKTtcbn1cblxuc3RvcmUubG9hZE9wZXJhdGlvbnNGb3IgPSBmdW5jdGlvbihhY2NvdW50KSB7XG4gICAgJC5nZXQoJ2FjY291bnRzL2dldE9wZXJhdGlvbnMvJyArIGFjY291bnQuaWQsIGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgICAgIHZhciBvcGVyYXRpb25zID0gW107XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZGF0YS5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgdmFyIG8gPSBuZXcgT3BlcmF0aW9uKGRhdGFbaV0pXG4gICAgICAgICAgICBvcGVyYXRpb25zLnB1c2gobyk7XG4gICAgICAgIH1cblxuICAgICAgICBmbHV4LmRpc3BhdGNoKHtcbiAgICAgICAgICAgIHR5cGU6IEV2ZW50cy5PUEVSQVRJT05TX0xPQURFRCxcbiAgICAgICAgICAgIG9wZXJhdGlvbnM6IG9wZXJhdGlvbnNcbiAgICAgICAgfSk7XG4gICAgfSkuZmFpbCh4aHJFcnJvcik7XG59O1xuXG5zdG9yZS5nZXRDYXRlZ29yaWVzID0gZnVuY3Rpb24oKSB7XG4gICAgJC5nZXQoJ2NhdGVnb3JpZXMnLCBmdW5jdGlvbiAoZGF0YSkge1xuICAgICAgICB2YXIgY2F0ZWdvcmllcyA9IFtdXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZGF0YS5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgdmFyIGMgPSBuZXcgQ2F0ZWdvcnkoZGF0YVtpXSk7XG4gICAgICAgICAgICBjYXRlZ29yaWVzLnB1c2goYylcbiAgICAgICAgfVxuXG4gICAgICAgIGZsdXguZGlzcGF0Y2goe1xuICAgICAgICAgICAgdHlwZTogRXZlbnRzLkNBVEVHT1JJRVNfTE9BREVELFxuICAgICAgICAgICAgY2F0ZWdvcmllczogY2F0ZWdvcmllc1xuICAgICAgICB9KTtcbiAgICB9KS5mYWlsKHhockVycm9yKTtcbn07XG5cbnN0b3JlLmFkZENhdGVnb3J5ID0gZnVuY3Rpb24oY2F0ZWdvcnkpIHtcbiAgICAkLnBvc3QoJ2NhdGVnb3JpZXMnLCBjYXRlZ29yeSwgZnVuY3Rpb24gKGRhdGEpIHtcbiAgICAgICAgZmx1eC5kaXNwYXRjaCh7XG4gICAgICAgICAgICB0eXBlOiBFdmVudHMuQ0FURUdPUllfU0FWRURcbiAgICAgICAgfSk7XG4gICAgfSkuZmFpbCh4aHJFcnJvcik7XG59XG5cbnN0b3JlLmNhdGVnb3J5VG9MYWJlbCA9IGZ1bmN0aW9uKGlkKSB7XG4gICAgYXNzZXJ0KHR5cGVvZiB0aGlzLmNhdGVnb3J5TGFiZWxbaWRdICE9PSAndW5kZWZpbmVkJyxcbiAgICAgICAgICAnY2F0ZWdvcnlUb0xhYmVsIGxvb2t1cCBmYWlsZWQgZm9yIGlkOiAnICsgaWQpO1xuICAgIHJldHVybiB0aGlzLmNhdGVnb3J5TGFiZWxbaWRdO1xufVxuXG5zdG9yZS5zZXRDYXRlZ29yaWVzID0gZnVuY3Rpb24oY2F0KSB7XG4gICAgdGhpcy5jYXRlZ29yaWVzID0gW25ldyBDYXRlZ29yeSh7aWQ6ICctMScsIHRpdGxlOiAnTm9uZSd9KV0uY29uY2F0KGNhdCk7XG4gICAgdGhpcy5jYXRlZ29yeUxhYmVsID0ge307XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmNhdGVnb3JpZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgdmFyIGMgPSB0aGlzLmNhdGVnb3JpZXNbaV07XG4gICAgICAgIGhhcyhjLCAnaWQnKTtcbiAgICAgICAgaGFzKGMsICd0aXRsZScpO1xuICAgICAgICB0aGlzLmNhdGVnb3J5TGFiZWxbYy5pZF0gPSBjLnRpdGxlO1xuICAgIH1cbn1cblxuc3RvcmUudXBkYXRlQ2F0ZWdvcnlGb3JPcGVyYXRpb24gPSBmdW5jdGlvbihvcGVyYXRpb25JZCwgY2F0ZWdvcnlJZCkge1xuICAgICQuYWpheCh7XG4gICAgICAgIHVybDonb3BlcmF0aW9ucy8nICsgb3BlcmF0aW9uSWQsXG4gICAgICAgIHR5cGU6ICdQVVQnLFxuICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICBjYXRlZ29yeUlkOiBjYXRlZ29yeUlkXG4gICAgICAgIH0sXG4gICAgICAgIHN1Y2Nlc3M6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGZsdXguZGlzcGF0Y2goe1xuICAgICAgICAgICAgICAgIHR5cGU6IEV2ZW50cy5PUEVSQVRJT05fQ0FURUdPUllfU0FWRURcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9LFxuICAgICAgICBlcnJvcjogeGhyRXJyb3JcbiAgICB9KTtcbn1cblxuc3RvcmUuZGVsZXRlT3BlcmF0aW9uID0gZnVuY3Rpb24ob3BlcmF0aW9uKSB7XG4gICAgYXNzZXJ0KG9wZXJhdGlvbiBpbnN0YW5jZW9mIE9wZXJhdGlvbik7XG4gICAgJC5hamF4KHtcbiAgICAgICAgdXJsOiAnb3BlcmF0aW9ucy8nICsgb3BlcmF0aW9uLmlkLFxuICAgICAgICB0eXBlOiAnREVMRVRFJyxcbiAgICAgICAgc3VjY2VzczogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBmbHV4LmRpc3BhdGNoKHtcbiAgICAgICAgICAgICAgICB0eXBlOiBFdmVudHMuREVMRVRFRF9PUEVSQVRJT05cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9LFxuICAgICAgICBlcnJvcjogeGhyRXJyb3JcbiAgICB9KTtcbn1cblxuZmx1eC5yZWdpc3RlcihmdW5jdGlvbihhY3Rpb24pIHtcbiAgICBzd2l0Y2ggKGFjdGlvbi50eXBlKSB7XG5cbiAgICAgIGNhc2UgRXZlbnRzLkFDQ09VTlRTX0xPQURFRDpcbiAgICAgICAgaGFzKGFjdGlvbiwgJ2FjY291bnRzJyk7XG4gICAgICAgIGlmIChhY3Rpb24uYWNjb3VudHMubGVuZ3RoID4gMClcbiAgICAgICAgICAgIGFzc2VydChhY3Rpb24uYWNjb3VudHNbMF0gaW5zdGFuY2VvZiBBY2NvdW50KTtcbiAgICAgICAgc3RvcmUuYWNjb3VudHMgPSBhY3Rpb24uYWNjb3VudHM7XG4gICAgICAgIHN0b3JlLmVtaXQoRXZlbnRzLkFDQ09VTlRTX0xPQURFRCk7XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBjYXNlIEV2ZW50cy5CQU5LX0xJU1RfTE9BREVEOlxuICAgICAgICBoYXMoYWN0aW9uLCAnbGlzdCcpO1xuICAgICAgICBzdG9yZS5iYW5rcyA9IGFjdGlvbi5saXN0O1xuICAgICAgICBzdG9yZS5lbWl0KEV2ZW50cy5CQU5LX0xJU1RfTE9BREVEKTtcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGNhc2UgRXZlbnRzLkNBVEVHT1JJRVNfTE9BREVEOlxuICAgICAgICBoYXMoYWN0aW9uLCAnY2F0ZWdvcmllcycpO1xuICAgICAgICBzdG9yZS5zZXRDYXRlZ29yaWVzKGFjdGlvbi5jYXRlZ29yaWVzKTtcbiAgICAgICAgc3RvcmUuZW1pdChFdmVudHMuQ0FURUdPUklFU19MT0FERUQpO1xuICAgICAgICBicmVhaztcblxuICAgICAgY2FzZSBFdmVudHMuQ0FURUdPUllfQ1JFQVRFRDpcbiAgICAgICAgaGFzKGFjdGlvbiwgJ2NhdGVnb3J5Jyk7XG4gICAgICAgIHN0b3JlLmFkZENhdGVnb3J5KGFjdGlvbi5jYXRlZ29yeSk7XG4gICAgICAgIC8vIE5vIG5lZWQgdG8gZm9yd2FyZFxuICAgICAgICBicmVhaztcblxuICAgICAgY2FzZSBFdmVudHMuQ0FURUdPUllfU0FWRUQ6XG4gICAgICAgIHN0b3JlLmdldENhdGVnb3JpZXMoKTtcbiAgICAgICAgLy8gTm8gbmVlZCB0byBmb3J3YXJkXG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBjYXNlIEV2ZW50cy5ERUxFVEVfT1BFUkFUSU9OOlxuICAgICAgICBoYXMoYWN0aW9uLCAnb3BlcmF0aW9uJyk7XG4gICAgICAgIGFzc2VydChhY3Rpb24ub3BlcmF0aW9uIGluc3RhbmNlb2YgT3BlcmF0aW9uKTtcbiAgICAgICAgc3RvcmUuZGVsZXRlT3BlcmF0aW9uKGFjdGlvbi5vcGVyYXRpb24pO1xuICAgICAgICAvLyBObyBuZWVkIHRvIGZvcndhcmRcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGNhc2UgRXZlbnRzLkRFTEVURURfT1BFUkFUSU9OOlxuICAgICAgICBhc3NlcnQodHlwZW9mIHN0b3JlLmN1cnJlbnRBY2NvdW50ICE9PSAndW5kZWZpbmVkJyk7XG4gICAgICAgIHN0b3JlLmxvYWRPcGVyYXRpb25zRm9yKHN0b3JlLmN1cnJlbnRBY2NvdW50KTtcbiAgICAgICAgLy8gTm8gbmVlZCB0byBmb3J3YXJkXG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBjYXNlIEV2ZW50cy5PUEVSQVRJT05fQ0FURUdPUllfQ0hBTkdFRDpcbiAgICAgICAgaGFzKGFjdGlvbiwgJ29wZXJhdGlvbklkJyk7XG4gICAgICAgIGhhcyhhY3Rpb24sICdjYXRlZ29yeUlkJyk7XG4gICAgICAgIHN0b3JlLnVwZGF0ZUNhdGVnb3J5Rm9yT3BlcmF0aW9uKGFjdGlvbi5vcGVyYXRpb25JZCwgYWN0aW9uLmNhdGVnb3J5SWQpO1xuICAgICAgICAvLyBObyBuZWVkIHRvIGZvcndhcmRcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGNhc2UgRXZlbnRzLk9QRVJBVElPTl9DQVRFR09SWV9TQVZFRDpcbiAgICAgICAgc3RvcmUuZW1pdChFdmVudHMuT1BFUkFUSU9OX0NBVEVHT1JZX1NBVkVEKTtcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGNhc2UgRXZlbnRzLk9QRVJBVElPTlNfTE9BREVEOlxuICAgICAgICBoYXMoYWN0aW9uLCAnb3BlcmF0aW9ucycpO1xuICAgICAgICBpZiAoYWN0aW9uLm9wZXJhdGlvbnMubGVuZ3RoID4gMClcbiAgICAgICAgICAgIGFzc2VydChhY3Rpb24ub3BlcmF0aW9uc1swXSBpbnN0YW5jZW9mIE9wZXJhdGlvbik7XG4gICAgICAgIHN0b3JlLm9wZXJhdGlvbnMgPSBhY3Rpb24ub3BlcmF0aW9ucztcbiAgICAgICAgc3RvcmUuZW1pdChFdmVudHMuT1BFUkFUSU9OU19MT0FERUQpO1xuICAgICAgICBicmVhaztcblxuICAgICAgY2FzZSBFdmVudHMuU0VMRUNURURfQUNDT1VOVF9DSEFOR0VEOlxuICAgICAgICBoYXMoYWN0aW9uLCAnYWNjb3VudCcpO1xuICAgICAgICBhc3NlcnQoYWN0aW9uLmFjY291bnQgaW5zdGFuY2VvZiBBY2NvdW50KTtcbiAgICAgICAgc3RvcmUuY3VycmVudEFjY291bnQgPSBhY3Rpb24uYWNjb3VudDtcbiAgICAgICAgc3RvcmUubG9hZE9wZXJhdGlvbnNGb3IoYWN0aW9uLmFjY291bnQpO1xuICAgICAgICBzdG9yZS5lbWl0KEV2ZW50cy5TRUxFQ1RFRF9BQ0NPVU5UX0NIQU5HRUQpO1xuICAgICAgICBicmVhaztcblxuICAgICAgY2FzZSBFdmVudHMuU0VMRUNURURfQkFOS19DSEFOR0VEOlxuICAgICAgICBoYXMoYWN0aW9uLCAnYmFuaycpO1xuICAgICAgICBhc3NlcnQoYWN0aW9uLmJhbmsgaW5zdGFuY2VvZiBCYW5rKTtcbiAgICAgICAgc3RvcmUuY3VycmVudEJhbmsgPSBhY3Rpb24uYmFuaztcbiAgICAgICAgc3RvcmUubG9hZEFsbEFjY291bnRzKCk7XG4gICAgICAgIHN0b3JlLmVtaXQoRXZlbnRzLlNFTEVDVEVEX0JBTktfQ0hBTkdFRCk7XG4gICAgICAgIGJyZWFrO1xuXG4gICAgfVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gc3RvcmU7XG4iLCIvLyBDb3B5cmlnaHQgSm95ZW50LCBJbmMuIGFuZCBvdGhlciBOb2RlIGNvbnRyaWJ1dG9ycy5cbi8vXG4vLyBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYVxuLy8gY29weSBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZVxuLy8gXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbCBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nXG4vLyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0cyB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsXG4vLyBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbCBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0XG4vLyBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGVcbi8vIGZvbGxvd2luZyBjb25kaXRpb25zOlxuLy9cbi8vIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkXG4vLyBpbiBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cbi8vXG4vLyBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTXG4vLyBPUiBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GXG4vLyBNRVJDSEFOVEFCSUxJVFksIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOXG4vLyBOTyBFVkVOVCBTSEFMTCBUSEUgQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSxcbi8vIERBTUFHRVMgT1IgT1RIRVIgTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUlxuLy8gT1RIRVJXSVNFLCBBUklTSU5HIEZST00sIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRVxuLy8gVVNFIE9SIE9USEVSIERFQUxJTkdTIElOIFRIRSBTT0ZUV0FSRS5cblxuZnVuY3Rpb24gRXZlbnRFbWl0dGVyKCkge1xuICB0aGlzLl9ldmVudHMgPSB0aGlzLl9ldmVudHMgfHwge307XG4gIHRoaXMuX21heExpc3RlbmVycyA9IHRoaXMuX21heExpc3RlbmVycyB8fCB1bmRlZmluZWQ7XG59XG5tb2R1bGUuZXhwb3J0cyA9IEV2ZW50RW1pdHRlcjtcblxuLy8gQmFja3dhcmRzLWNvbXBhdCB3aXRoIG5vZGUgMC4xMC54XG5FdmVudEVtaXR0ZXIuRXZlbnRFbWl0dGVyID0gRXZlbnRFbWl0dGVyO1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLl9ldmVudHMgPSB1bmRlZmluZWQ7XG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLl9tYXhMaXN0ZW5lcnMgPSB1bmRlZmluZWQ7XG5cbi8vIEJ5IGRlZmF1bHQgRXZlbnRFbWl0dGVycyB3aWxsIHByaW50IGEgd2FybmluZyBpZiBtb3JlIHRoYW4gMTAgbGlzdGVuZXJzIGFyZVxuLy8gYWRkZWQgdG8gaXQuIFRoaXMgaXMgYSB1c2VmdWwgZGVmYXVsdCB3aGljaCBoZWxwcyBmaW5kaW5nIG1lbW9yeSBsZWFrcy5cbkV2ZW50RW1pdHRlci5kZWZhdWx0TWF4TGlzdGVuZXJzID0gMTA7XG5cbi8vIE9idmlvdXNseSBub3QgYWxsIEVtaXR0ZXJzIHNob3VsZCBiZSBsaW1pdGVkIHRvIDEwLiBUaGlzIGZ1bmN0aW9uIGFsbG93c1xuLy8gdGhhdCB0byBiZSBpbmNyZWFzZWQuIFNldCB0byB6ZXJvIGZvciB1bmxpbWl0ZWQuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLnNldE1heExpc3RlbmVycyA9IGZ1bmN0aW9uKG4pIHtcbiAgaWYgKCFpc051bWJlcihuKSB8fCBuIDwgMCB8fCBpc05hTihuKSlcbiAgICB0aHJvdyBUeXBlRXJyb3IoJ24gbXVzdCBiZSBhIHBvc2l0aXZlIG51bWJlcicpO1xuICB0aGlzLl9tYXhMaXN0ZW5lcnMgPSBuO1xuICByZXR1cm4gdGhpcztcbn07XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuZW1pdCA9IGZ1bmN0aW9uKHR5cGUpIHtcbiAgdmFyIGVyLCBoYW5kbGVyLCBsZW4sIGFyZ3MsIGksIGxpc3RlbmVycztcblxuICBpZiAoIXRoaXMuX2V2ZW50cylcbiAgICB0aGlzLl9ldmVudHMgPSB7fTtcblxuICAvLyBJZiB0aGVyZSBpcyBubyAnZXJyb3InIGV2ZW50IGxpc3RlbmVyIHRoZW4gdGhyb3cuXG4gIGlmICh0eXBlID09PSAnZXJyb3InKSB7XG4gICAgaWYgKCF0aGlzLl9ldmVudHMuZXJyb3IgfHxcbiAgICAgICAgKGlzT2JqZWN0KHRoaXMuX2V2ZW50cy5lcnJvcikgJiYgIXRoaXMuX2V2ZW50cy5lcnJvci5sZW5ndGgpKSB7XG4gICAgICBlciA9IGFyZ3VtZW50c1sxXTtcbiAgICAgIGlmIChlciBpbnN0YW5jZW9mIEVycm9yKSB7XG4gICAgICAgIHRocm93IGVyOyAvLyBVbmhhbmRsZWQgJ2Vycm9yJyBldmVudFxuICAgICAgfVxuICAgICAgdGhyb3cgVHlwZUVycm9yKCdVbmNhdWdodCwgdW5zcGVjaWZpZWQgXCJlcnJvclwiIGV2ZW50LicpO1xuICAgIH1cbiAgfVxuXG4gIGhhbmRsZXIgPSB0aGlzLl9ldmVudHNbdHlwZV07XG5cbiAgaWYgKGlzVW5kZWZpbmVkKGhhbmRsZXIpKVxuICAgIHJldHVybiBmYWxzZTtcblxuICBpZiAoaXNGdW5jdGlvbihoYW5kbGVyKSkge1xuICAgIHN3aXRjaCAoYXJndW1lbnRzLmxlbmd0aCkge1xuICAgICAgLy8gZmFzdCBjYXNlc1xuICAgICAgY2FzZSAxOlxuICAgICAgICBoYW5kbGVyLmNhbGwodGhpcyk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAyOlxuICAgICAgICBoYW5kbGVyLmNhbGwodGhpcywgYXJndW1lbnRzWzFdKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIDM6XG4gICAgICAgIGhhbmRsZXIuY2FsbCh0aGlzLCBhcmd1bWVudHNbMV0sIGFyZ3VtZW50c1syXSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgLy8gc2xvd2VyXG4gICAgICBkZWZhdWx0OlxuICAgICAgICBsZW4gPSBhcmd1bWVudHMubGVuZ3RoO1xuICAgICAgICBhcmdzID0gbmV3IEFycmF5KGxlbiAtIDEpO1xuICAgICAgICBmb3IgKGkgPSAxOyBpIDwgbGVuOyBpKyspXG4gICAgICAgICAgYXJnc1tpIC0gMV0gPSBhcmd1bWVudHNbaV07XG4gICAgICAgIGhhbmRsZXIuYXBwbHkodGhpcywgYXJncyk7XG4gICAgfVxuICB9IGVsc2UgaWYgKGlzT2JqZWN0KGhhbmRsZXIpKSB7XG4gICAgbGVuID0gYXJndW1lbnRzLmxlbmd0aDtcbiAgICBhcmdzID0gbmV3IEFycmF5KGxlbiAtIDEpO1xuICAgIGZvciAoaSA9IDE7IGkgPCBsZW47IGkrKylcbiAgICAgIGFyZ3NbaSAtIDFdID0gYXJndW1lbnRzW2ldO1xuXG4gICAgbGlzdGVuZXJzID0gaGFuZGxlci5zbGljZSgpO1xuICAgIGxlbiA9IGxpc3RlbmVycy5sZW5ndGg7XG4gICAgZm9yIChpID0gMDsgaSA8IGxlbjsgaSsrKVxuICAgICAgbGlzdGVuZXJzW2ldLmFwcGx5KHRoaXMsIGFyZ3MpO1xuICB9XG5cbiAgcmV0dXJuIHRydWU7XG59O1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLmFkZExpc3RlbmVyID0gZnVuY3Rpb24odHlwZSwgbGlzdGVuZXIpIHtcbiAgdmFyIG07XG5cbiAgaWYgKCFpc0Z1bmN0aW9uKGxpc3RlbmVyKSlcbiAgICB0aHJvdyBUeXBlRXJyb3IoJ2xpc3RlbmVyIG11c3QgYmUgYSBmdW5jdGlvbicpO1xuXG4gIGlmICghdGhpcy5fZXZlbnRzKVxuICAgIHRoaXMuX2V2ZW50cyA9IHt9O1xuXG4gIC8vIFRvIGF2b2lkIHJlY3Vyc2lvbiBpbiB0aGUgY2FzZSB0aGF0IHR5cGUgPT09IFwibmV3TGlzdGVuZXJcIiEgQmVmb3JlXG4gIC8vIGFkZGluZyBpdCB0byB0aGUgbGlzdGVuZXJzLCBmaXJzdCBlbWl0IFwibmV3TGlzdGVuZXJcIi5cbiAgaWYgKHRoaXMuX2V2ZW50cy5uZXdMaXN0ZW5lcilcbiAgICB0aGlzLmVtaXQoJ25ld0xpc3RlbmVyJywgdHlwZSxcbiAgICAgICAgICAgICAgaXNGdW5jdGlvbihsaXN0ZW5lci5saXN0ZW5lcikgP1xuICAgICAgICAgICAgICBsaXN0ZW5lci5saXN0ZW5lciA6IGxpc3RlbmVyKTtcblxuICBpZiAoIXRoaXMuX2V2ZW50c1t0eXBlXSlcbiAgICAvLyBPcHRpbWl6ZSB0aGUgY2FzZSBvZiBvbmUgbGlzdGVuZXIuIERvbid0IG5lZWQgdGhlIGV4dHJhIGFycmF5IG9iamVjdC5cbiAgICB0aGlzLl9ldmVudHNbdHlwZV0gPSBsaXN0ZW5lcjtcbiAgZWxzZSBpZiAoaXNPYmplY3QodGhpcy5fZXZlbnRzW3R5cGVdKSlcbiAgICAvLyBJZiB3ZSd2ZSBhbHJlYWR5IGdvdCBhbiBhcnJheSwganVzdCBhcHBlbmQuXG4gICAgdGhpcy5fZXZlbnRzW3R5cGVdLnB1c2gobGlzdGVuZXIpO1xuICBlbHNlXG4gICAgLy8gQWRkaW5nIHRoZSBzZWNvbmQgZWxlbWVudCwgbmVlZCB0byBjaGFuZ2UgdG8gYXJyYXkuXG4gICAgdGhpcy5fZXZlbnRzW3R5cGVdID0gW3RoaXMuX2V2ZW50c1t0eXBlXSwgbGlzdGVuZXJdO1xuXG4gIC8vIENoZWNrIGZvciBsaXN0ZW5lciBsZWFrXG4gIGlmIChpc09iamVjdCh0aGlzLl9ldmVudHNbdHlwZV0pICYmICF0aGlzLl9ldmVudHNbdHlwZV0ud2FybmVkKSB7XG4gICAgdmFyIG07XG4gICAgaWYgKCFpc1VuZGVmaW5lZCh0aGlzLl9tYXhMaXN0ZW5lcnMpKSB7XG4gICAgICBtID0gdGhpcy5fbWF4TGlzdGVuZXJzO1xuICAgIH0gZWxzZSB7XG4gICAgICBtID0gRXZlbnRFbWl0dGVyLmRlZmF1bHRNYXhMaXN0ZW5lcnM7XG4gICAgfVxuXG4gICAgaWYgKG0gJiYgbSA+IDAgJiYgdGhpcy5fZXZlbnRzW3R5cGVdLmxlbmd0aCA+IG0pIHtcbiAgICAgIHRoaXMuX2V2ZW50c1t0eXBlXS53YXJuZWQgPSB0cnVlO1xuICAgICAgY29uc29sZS5lcnJvcignKG5vZGUpIHdhcm5pbmc6IHBvc3NpYmxlIEV2ZW50RW1pdHRlciBtZW1vcnkgJyArXG4gICAgICAgICAgICAgICAgICAgICdsZWFrIGRldGVjdGVkLiAlZCBsaXN0ZW5lcnMgYWRkZWQuICcgK1xuICAgICAgICAgICAgICAgICAgICAnVXNlIGVtaXR0ZXIuc2V0TWF4TGlzdGVuZXJzKCkgdG8gaW5jcmVhc2UgbGltaXQuJyxcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fZXZlbnRzW3R5cGVdLmxlbmd0aCk7XG4gICAgICBpZiAodHlwZW9mIGNvbnNvbGUudHJhY2UgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgLy8gbm90IHN1cHBvcnRlZCBpbiBJRSAxMFxuICAgICAgICBjb25zb2xlLnRyYWNlKCk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLm9uID0gRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5hZGRMaXN0ZW5lcjtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5vbmNlID0gZnVuY3Rpb24odHlwZSwgbGlzdGVuZXIpIHtcbiAgaWYgKCFpc0Z1bmN0aW9uKGxpc3RlbmVyKSlcbiAgICB0aHJvdyBUeXBlRXJyb3IoJ2xpc3RlbmVyIG11c3QgYmUgYSBmdW5jdGlvbicpO1xuXG4gIHZhciBmaXJlZCA9IGZhbHNlO1xuXG4gIGZ1bmN0aW9uIGcoKSB7XG4gICAgdGhpcy5yZW1vdmVMaXN0ZW5lcih0eXBlLCBnKTtcblxuICAgIGlmICghZmlyZWQpIHtcbiAgICAgIGZpcmVkID0gdHJ1ZTtcbiAgICAgIGxpc3RlbmVyLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgfVxuICB9XG5cbiAgZy5saXN0ZW5lciA9IGxpc3RlbmVyO1xuICB0aGlzLm9uKHR5cGUsIGcpO1xuXG4gIHJldHVybiB0aGlzO1xufTtcblxuLy8gZW1pdHMgYSAncmVtb3ZlTGlzdGVuZXInIGV2ZW50IGlmZiB0aGUgbGlzdGVuZXIgd2FzIHJlbW92ZWRcbkV2ZW50RW1pdHRlci5wcm90b3R5cGUucmVtb3ZlTGlzdGVuZXIgPSBmdW5jdGlvbih0eXBlLCBsaXN0ZW5lcikge1xuICB2YXIgbGlzdCwgcG9zaXRpb24sIGxlbmd0aCwgaTtcblxuICBpZiAoIWlzRnVuY3Rpb24obGlzdGVuZXIpKVxuICAgIHRocm93IFR5cGVFcnJvcignbGlzdGVuZXIgbXVzdCBiZSBhIGZ1bmN0aW9uJyk7XG5cbiAgaWYgKCF0aGlzLl9ldmVudHMgfHwgIXRoaXMuX2V2ZW50c1t0eXBlXSlcbiAgICByZXR1cm4gdGhpcztcblxuICBsaXN0ID0gdGhpcy5fZXZlbnRzW3R5cGVdO1xuICBsZW5ndGggPSBsaXN0Lmxlbmd0aDtcbiAgcG9zaXRpb24gPSAtMTtcblxuICBpZiAobGlzdCA9PT0gbGlzdGVuZXIgfHxcbiAgICAgIChpc0Z1bmN0aW9uKGxpc3QubGlzdGVuZXIpICYmIGxpc3QubGlzdGVuZXIgPT09IGxpc3RlbmVyKSkge1xuICAgIGRlbGV0ZSB0aGlzLl9ldmVudHNbdHlwZV07XG4gICAgaWYgKHRoaXMuX2V2ZW50cy5yZW1vdmVMaXN0ZW5lcilcbiAgICAgIHRoaXMuZW1pdCgncmVtb3ZlTGlzdGVuZXInLCB0eXBlLCBsaXN0ZW5lcik7XG5cbiAgfSBlbHNlIGlmIChpc09iamVjdChsaXN0KSkge1xuICAgIGZvciAoaSA9IGxlbmd0aDsgaS0tID4gMDspIHtcbiAgICAgIGlmIChsaXN0W2ldID09PSBsaXN0ZW5lciB8fFxuICAgICAgICAgIChsaXN0W2ldLmxpc3RlbmVyICYmIGxpc3RbaV0ubGlzdGVuZXIgPT09IGxpc3RlbmVyKSkge1xuICAgICAgICBwb3NpdGlvbiA9IGk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChwb3NpdGlvbiA8IDApXG4gICAgICByZXR1cm4gdGhpcztcblxuICAgIGlmIChsaXN0Lmxlbmd0aCA9PT0gMSkge1xuICAgICAgbGlzdC5sZW5ndGggPSAwO1xuICAgICAgZGVsZXRlIHRoaXMuX2V2ZW50c1t0eXBlXTtcbiAgICB9IGVsc2Uge1xuICAgICAgbGlzdC5zcGxpY2UocG9zaXRpb24sIDEpO1xuICAgIH1cblxuICAgIGlmICh0aGlzLl9ldmVudHMucmVtb3ZlTGlzdGVuZXIpXG4gICAgICB0aGlzLmVtaXQoJ3JlbW92ZUxpc3RlbmVyJywgdHlwZSwgbGlzdGVuZXIpO1xuICB9XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLnJlbW92ZUFsbExpc3RlbmVycyA9IGZ1bmN0aW9uKHR5cGUpIHtcbiAgdmFyIGtleSwgbGlzdGVuZXJzO1xuXG4gIGlmICghdGhpcy5fZXZlbnRzKVxuICAgIHJldHVybiB0aGlzO1xuXG4gIC8vIG5vdCBsaXN0ZW5pbmcgZm9yIHJlbW92ZUxpc3RlbmVyLCBubyBuZWVkIHRvIGVtaXRcbiAgaWYgKCF0aGlzLl9ldmVudHMucmVtb3ZlTGlzdGVuZXIpIHtcbiAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMClcbiAgICAgIHRoaXMuX2V2ZW50cyA9IHt9O1xuICAgIGVsc2UgaWYgKHRoaXMuX2V2ZW50c1t0eXBlXSlcbiAgICAgIGRlbGV0ZSB0aGlzLl9ldmVudHNbdHlwZV07XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvLyBlbWl0IHJlbW92ZUxpc3RlbmVyIGZvciBhbGwgbGlzdGVuZXJzIG9uIGFsbCBldmVudHNcbiAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDApIHtcbiAgICBmb3IgKGtleSBpbiB0aGlzLl9ldmVudHMpIHtcbiAgICAgIGlmIChrZXkgPT09ICdyZW1vdmVMaXN0ZW5lcicpIGNvbnRpbnVlO1xuICAgICAgdGhpcy5yZW1vdmVBbGxMaXN0ZW5lcnMoa2V5KTtcbiAgICB9XG4gICAgdGhpcy5yZW1vdmVBbGxMaXN0ZW5lcnMoJ3JlbW92ZUxpc3RlbmVyJyk7XG4gICAgdGhpcy5fZXZlbnRzID0ge307XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBsaXN0ZW5lcnMgPSB0aGlzLl9ldmVudHNbdHlwZV07XG5cbiAgaWYgKGlzRnVuY3Rpb24obGlzdGVuZXJzKSkge1xuICAgIHRoaXMucmVtb3ZlTGlzdGVuZXIodHlwZSwgbGlzdGVuZXJzKTtcbiAgfSBlbHNlIHtcbiAgICAvLyBMSUZPIG9yZGVyXG4gICAgd2hpbGUgKGxpc3RlbmVycy5sZW5ndGgpXG4gICAgICB0aGlzLnJlbW92ZUxpc3RlbmVyKHR5cGUsIGxpc3RlbmVyc1tsaXN0ZW5lcnMubGVuZ3RoIC0gMV0pO1xuICB9XG4gIGRlbGV0ZSB0aGlzLl9ldmVudHNbdHlwZV07XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLmxpc3RlbmVycyA9IGZ1bmN0aW9uKHR5cGUpIHtcbiAgdmFyIHJldDtcbiAgaWYgKCF0aGlzLl9ldmVudHMgfHwgIXRoaXMuX2V2ZW50c1t0eXBlXSlcbiAgICByZXQgPSBbXTtcbiAgZWxzZSBpZiAoaXNGdW5jdGlvbih0aGlzLl9ldmVudHNbdHlwZV0pKVxuICAgIHJldCA9IFt0aGlzLl9ldmVudHNbdHlwZV1dO1xuICBlbHNlXG4gICAgcmV0ID0gdGhpcy5fZXZlbnRzW3R5cGVdLnNsaWNlKCk7XG4gIHJldHVybiByZXQ7XG59O1xuXG5FdmVudEVtaXR0ZXIubGlzdGVuZXJDb3VudCA9IGZ1bmN0aW9uKGVtaXR0ZXIsIHR5cGUpIHtcbiAgdmFyIHJldDtcbiAgaWYgKCFlbWl0dGVyLl9ldmVudHMgfHwgIWVtaXR0ZXIuX2V2ZW50c1t0eXBlXSlcbiAgICByZXQgPSAwO1xuICBlbHNlIGlmIChpc0Z1bmN0aW9uKGVtaXR0ZXIuX2V2ZW50c1t0eXBlXSkpXG4gICAgcmV0ID0gMTtcbiAgZWxzZVxuICAgIHJldCA9IGVtaXR0ZXIuX2V2ZW50c1t0eXBlXS5sZW5ndGg7XG4gIHJldHVybiByZXQ7XG59O1xuXG5mdW5jdGlvbiBpc0Z1bmN0aW9uKGFyZykge1xuICByZXR1cm4gdHlwZW9mIGFyZyA9PT0gJ2Z1bmN0aW9uJztcbn1cblxuZnVuY3Rpb24gaXNOdW1iZXIoYXJnKSB7XG4gIHJldHVybiB0eXBlb2YgYXJnID09PSAnbnVtYmVyJztcbn1cblxuZnVuY3Rpb24gaXNPYmplY3QoYXJnKSB7XG4gIHJldHVybiB0eXBlb2YgYXJnID09PSAnb2JqZWN0JyAmJiBhcmcgIT09IG51bGw7XG59XG5cbmZ1bmN0aW9uIGlzVW5kZWZpbmVkKGFyZykge1xuICByZXR1cm4gYXJnID09PSB2b2lkIDA7XG59XG4iXX0=
