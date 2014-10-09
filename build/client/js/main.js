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
    $chart.highcharts('BalanceChart', {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2Jlbi9jb2RlL2NvenkvZGV2L2tyZXN1cy9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwiL2hvbWUvYmVuL2NvZGUvY296eS9kZXYva3Jlc3VzL2NsaWVudC9FdmVudHMuanMiLCIvaG9tZS9iZW4vY29kZS9jb3p5L2Rldi9rcmVzdXMvY2xpZW50L0hlbHBlcnMuanMiLCIvaG9tZS9iZW4vY29kZS9jb3p5L2Rldi9rcmVzdXMvY2xpZW50L01vZGVscy5qcyIsIi9ob21lL2Jlbi9jb2RlL2NvenkvZGV2L2tyZXN1cy9jbGllbnQvY29tcG9uZW50cy9BY2NvdW50TGlzdENvbXBvbmVudC5qcyIsIi9ob21lL2Jlbi9jb2RlL2NvenkvZGV2L2tyZXN1cy9jbGllbnQvY29tcG9uZW50cy9CYW5rTGlzdENvbXBvbmVudC5qcyIsIi9ob21lL2Jlbi9jb2RlL2NvenkvZGV2L2tyZXN1cy9jbGllbnQvY29tcG9uZW50cy9DYXRlZ29yeUNvbXBvbmVudC5qcyIsIi9ob21lL2Jlbi9jb2RlL2NvenkvZGV2L2tyZXN1cy9jbGllbnQvY29tcG9uZW50cy9DaGFydENvbXBvbmVudC5qcyIsIi9ob21lL2Jlbi9jb2RlL2NvenkvZGV2L2tyZXN1cy9jbGllbnQvY29tcG9uZW50cy9PcGVyYXRpb25MaXN0Q29tcG9uZW50LmpzIiwiL2hvbWUvYmVuL2NvZGUvY296eS9kZXYva3Jlc3VzL2NsaWVudC9jb21wb25lbnRzL1NpbWlsYXJpdHlDb21wb25lbnQuanMiLCIvaG9tZS9iZW4vY29kZS9jb3p5L2Rldi9rcmVzdXMvY2xpZW50L2ZsdXgvZGlzcGF0Y2hlci5qcyIsIi9ob21lL2Jlbi9jb2RlL2NvenkvZGV2L2tyZXN1cy9jbGllbnQvZmx1eC9pbnZhcmlhbnQuanMiLCIvaG9tZS9iZW4vY29kZS9jb3p5L2Rldi9rcmVzdXMvY2xpZW50L21haW4uanMiLCIvaG9tZS9iZW4vY29kZS9jb3p5L2Rldi9rcmVzdXMvY2xpZW50L3N0b3JlLmpzIiwiL2hvbWUvYmVuL2NvZGUvY296eS9kZXYva3Jlc3VzL25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9ldmVudHMvZXZlbnRzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9GQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pXQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMVBBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeFBBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dGhyb3cgbmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKX12YXIgZj1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwoZi5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxmLGYuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwidmFyIEV2ZW50cyA9IG1vZHVsZS5leHBvcnRzID0ge1xuICAgIEFDQ09VTlRTX0xPQURFRDogJ2FjY291bnQgaGF2ZSBqdXN0IGJlZW4gbG9hZGVkJyxcbiAgICBCQU5LX0xJU1RfTE9BREVEOiAnYmFuayBsaXN0IGhhcyBqdXN0IGJlZW4gbG9hZGVkJyxcbiAgICBDQVRFR09SSUVTX0xPQURFRDogJ2NhdGVnb3JpZXMgaGF2ZSBqdXN0IGJlZW4gbG9hZGVkJyxcbiAgICBDQVRFR09SWV9DUkVBVEVEOiAndGhlIHVzZXIgY3JlYXRlZCBhIGNhdGVnb3J5JyxcbiAgICBDQVRFR09SWV9TQVZFRDogJ3RoZSBjYXRlZ29yeSB3YXMgc2F2ZWQgb24gdGhlIHNlcnZlcicsXG4gICAgREVMRVRFX09QRVJBVElPTjogJ3RoZSB1c2VyIGFza2VkIHRvIGRlbGV0ZSBhbiBvcGVyYXRpb24nLFxuICAgIERFTEVURURfT1BFUkFUSU9OOiAnYW4gb3BlcmF0aW9uIGhhcyBqdXN0IGJlZW4gZGVsZXRlZCBvbiB0aGUgc2VydmVyJyxcbiAgICBPUEVSQVRJT05TX0xPQURFRDogJ29wZXJhdGlvbnMgaGF2ZSBiZWVuIGxvYWRlZCcsXG4gICAgT1BFUkFUSU9OX0NBVEVHT1JZX0NIQU5HRUQ6ICd1c2VyIGNoYW5nZWQgdGhlIGNhdGVnb3J5IG9mIGFuIG9wZXJhdGlvbicsXG4gICAgT1BFUkFUSU9OX0NBVEVHT1JZX1NBVkVEOiAndGhlIGNhdGVnb3J5IGZvciBhbiBvcGVyYXRpb24gd2FzIHNldCBvbiB0aGUgc2VydmVyJyxcbiAgICBTRUxFQ1RFRF9BQ0NPVU5UX0NIQU5HRUQ6ICdzb21ldGhpbmcgY2hhbmdlZCB0aGUgc2VsZWN0ZWQgYWNjb3VudCcsXG4gICAgU0VMRUNURURfQkFOS19DSEFOR0VEOiAnc29tZXRoaW5nIGNoYW5nZWQgdGhlIHNlbGVjdGVkIGJhbmsnXG59O1xuIiwiLypcbiAqIEhFTFBFUlNcbiAqL1xuXG5jb25zdCBERUJVRyA9IHRydWU7XG5jb25zdCBBU1NFUlRTID0gdHJ1ZTtcblxudmFyIGRlYnVnID0gZXhwb3J0cy5kZWJ1ZyA9IGZ1bmN0aW9uKCkge1xuICAgIERFQlVHICYmIGNvbnNvbGUubG9nLmFwcGx5KGNvbnNvbGUsIGFyZ3VtZW50cyk7XG59O1xuXG52YXIgYXNzZXJ0ID0gZXhwb3J0cy5hc3NlcnQgPSBmdW5jdGlvbih4LCB3YXQpIHtcbiAgICBpZiAoIXgpIHtcbiAgICAgICAgdmFyIHRleHQgPSAnQXNzZXJ0aW9uIGVycm9yOiAnICsgKHdhdD93YXQ6JycpICsgJ1xcbicgKyBuZXcgRXJyb3IoKS5zdGFjaztcbiAgICAgICAgQVNTRVJUUyAmJiBhbGVydCh0ZXh0KTtcbiAgICAgICAgY29uc29sZS5sb2codGV4dCk7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgcmV0dXJuIHRydWU7XG59O1xuXG52YXIgbWF5YmVIYXMgPSBleHBvcnRzLm1heWJlSGFzID0gZnVuY3Rpb24ob2JqLCBwcm9wKSB7XG4gICAgcmV0dXJuIG9iai5oYXNPd25Qcm9wZXJ0eShwcm9wKTtcbn1cblxuZXhwb3J0cy5oYXMgPSBmdW5jdGlvbiBoYXMob2JqLCBwcm9wKSB7XG4gICAgcmV0dXJuIGFzc2VydChtYXliZUhhcyhvYmosIHByb3ApKTtcbn1cblxuZXhwb3J0cy54aHJFcnJvciA9IGZ1bmN0aW9uIHhockVycm9yKHhociwgdGV4dFN0YXR1cywgZXJyKSB7XG4gICAgYWxlcnQoJ3hociBlcnJvcjogJyArIHRleHRTdGF0dXMgKyAnXFxuJyArIGVycik7XG59XG5cbiIsInZhciBoYXMgPSByZXF1aXJlKCcuL0hlbHBlcnMnKS5oYXM7XG52YXIgbWF5YmVIYXMgPSByZXF1aXJlKCcuL0hlbHBlcnMnKS5tYXliZUhhcztcblxuZXhwb3J0cy5CYW5rID0gZnVuY3Rpb24gQmFuayhhcmcpIHtcbiAgICB0aGlzLmlkICAgPSBoYXMoYXJnLCAnaWQnKSAgICYmIGFyZy5pZDtcbiAgICB0aGlzLm5hbWUgPSBoYXMoYXJnLCAnbmFtZScpICYmIGFyZy5uYW1lO1xuICAgIHRoaXMudXVpZCA9IGhhcyhhcmcsICd1dWlkJykgJiYgYXJnLnV1aWQ7XG59XG5cbmV4cG9ydHMuQWNjb3VudCA9IGZ1bmN0aW9uIEFjY291bnQoYXJnKSB7XG4gICAgdGhpcy5iYW5rICAgICAgICAgID0gaGFzKGFyZywgJ2JhbmsnKSAmJiBhcmcuYmFuaztcbiAgICB0aGlzLmJhbmtBY2Nlc3MgICAgPSBoYXMoYXJnLCAnYmFua0FjY2VzcycpICYmIGFyZy5iYW5rQWNjZXNzO1xuICAgIHRoaXMudGl0bGUgICAgICAgICA9IGhhcyhhcmcsICd0aXRsZScpICYmIGFyZy50aXRsZTtcbiAgICB0aGlzLmFjY291bnROdW1iZXIgPSBoYXMoYXJnLCAnYWNjb3VudE51bWJlcicpICYmIGFyZy5hY2NvdW50TnVtYmVyO1xuICAgIHRoaXMuaW5pdGlhbEFtb3VudCA9IGhhcyhhcmcsICdpbml0aWFsQW1vdW50JykgJiYgYXJnLmluaXRpYWxBbW91bnQ7XG4gICAgdGhpcy5sYXN0Q2hlY2tlZCAgID0gaGFzKGFyZywgJ2xhc3RDaGVja2VkJykgJiYgbmV3IERhdGUoYXJnLmxhc3RDaGVja2VkKTtcbiAgICB0aGlzLmlkICAgICAgICAgICAgPSBoYXMoYXJnLCAnaWQnKSAmJiBhcmcuaWQ7XG4gICAgdGhpcy5hbW91bnQgICAgICAgID0gaGFzKGFyZywgJ2Ftb3VudCcpICYmIGFyZy5hbW91bnQ7XG59XG5cbmZ1bmN0aW9uIE9wZXJhdGlvbihhcmcpIHtcbiAgICB0aGlzLmJhbmtBY2NvdW50ID0gaGFzKGFyZywgJ2JhbmtBY2NvdW50JykgJiYgYXJnLmJhbmtBY2NvdW50O1xuICAgIHRoaXMudGl0bGUgICAgICAgPSBoYXMoYXJnLCAndGl0bGUnKSAmJiBhcmcudGl0bGU7XG4gICAgdGhpcy5kYXRlICAgICAgICA9IGhhcyhhcmcsICdkYXRlJykgJiYgbmV3IERhdGUoYXJnLmRhdGUpO1xuICAgIHRoaXMuYW1vdW50ICAgICAgPSBoYXMoYXJnLCAnYW1vdW50JykgJiYgYXJnLmFtb3VudDtcbiAgICB0aGlzLnJhdyAgICAgICAgID0gaGFzKGFyZywgJ3JhdycpICYmIGFyZy5yYXc7XG4gICAgdGhpcy5kYXRlSW1wb3J0ICA9IChtYXliZUhhcyhhcmcsICdkYXRlSW1wb3J0JykgJiYgbmV3IERhdGUoYXJnLmRhdGVJbXBvcnQpKSB8fCAwO1xuICAgIHRoaXMuaWQgICAgICAgICAgPSBoYXMoYXJnLCAnaWQnKSAmJiBhcmcuaWQ7XG4gICAgdGhpcy5jYXRlZ29yeUlkICA9IGFyZy5jYXRlZ29yeUlkIHx8IC0xO1xufVxuXG5leHBvcnRzLk9wZXJhdGlvbiA9IE9wZXJhdGlvbjtcblxuZnVuY3Rpb24gQ2F0ZWdvcnkoYXJnKSB7XG4gICAgdGhpcy50aXRsZSA9IGhhcyhhcmcsICd0aXRsZScpICYmIGFyZy50aXRsZTtcbiAgICB0aGlzLmlkID0gaGFzKGFyZywgJ2lkJykgJiYgYXJnLmlkO1xuXG4gICAgLy8gT3B0aW9uYWxcbiAgICB0aGlzLnBhcmVudElkID0gYXJnLnBhcmVudElkO1xufVxuXG5leHBvcnRzLkNhdGVnb3J5ID0gQ2F0ZWdvcnk7XG4iLCIvKiogQGpzeCBSZWFjdC5ET00gKi9cblxuLy8gQ29uc3RhbnRzXG52YXIgRXZlbnRzID0gcmVxdWlyZSgnLi4vRXZlbnRzJyk7XG52YXIgZGVidWcgPSByZXF1aXJlKCcuLi9IZWxwZXJzJykuZGVidWc7XG5cbi8vIEdsb2JhbCB2YXJpYWJsZXNcbnZhciBzdG9yZSA9IHJlcXVpcmUoJy4uL3N0b3JlJyk7XG52YXIgZmx1eCA9IHJlcXVpcmUoJy4uL2ZsdXgvZGlzcGF0Y2hlcicpO1xuXG4vLyBQcm9wczogYWNjb3VudDogQWNjb3VudFxudmFyIEFjY291bnRMaXN0SXRlbSA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtkaXNwbGF5TmFtZTogJ0FjY291bnRMaXN0SXRlbScsXG5cbiAgICBfb25DbGljazogZnVuY3Rpb24oKSB7XG4gICAgICAgIGRlYnVnKCdjbGljayBvbiBhIHBhcnRpY3VsYXIgYWNjb3VudCcpO1xuICAgICAgICBmbHV4LmRpc3BhdGNoKHtcbiAgICAgICAgICAgIHR5cGU6IEV2ZW50cy5TRUxFQ1RFRF9BQ0NPVU5UX0NIQU5HRUQsXG4gICAgICAgICAgICBhY2NvdW50OiB0aGlzLnByb3BzLmFjY291bnRcbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIHJlbmRlcjogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICBSZWFjdC5ET00ubGkobnVsbCwgXG4gICAgICAgICAgICAgICAgUmVhY3QuRE9NLmEoe29uQ2xpY2s6IHRoaXMuX29uQ2xpY2t9LCB0aGlzLnByb3BzLmFjY291bnQudGl0bGUpXG4gICAgICAgICAgICApXG4gICAgICAgICk7XG4gICAgfVxufSk7XG5cbi8vIFN0YXRlOiBhY2NvdW50czogW0FjY291bnRdXG52YXIgQWNjb3VudExpc3RDb21wb25lbnQgPSBtb2R1bGUuZXhwb3J0cyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtkaXNwbGF5TmFtZTogJ2V4cG9ydHMnLFxuXG4gICAgZ2V0SW5pdGlhbFN0YXRlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGFjY291bnRzOiBbXVxuICAgICAgICB9O1xuICAgIH0sXG5cbiAgICBfbGlzdGVuZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgIGFjY291bnRzOiBzdG9yZS5hY2NvdW50c1xuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgY29tcG9uZW50RGlkTW91bnQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICBzdG9yZS5vbihFdmVudHMuQUNDT1VOVFNfTE9BREVELCB0aGlzLl9saXN0ZW5lcik7XG4gICAgfSxcblxuICAgIGNvbXBvbmVudFdpbGxVbm1vdW50OiBmdW5jdGlvbigpIHtcbiAgICAgICAgc3RvcmUucmVtb3ZlTGlzdGVuZXIoRXZlbnRzLkFDQ09VTlRTX0xPQURFRCwgdGhpcy5fbGlzdGVuZXIpO1xuICAgIH0sXG5cbiAgICByZW5kZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgYWNjb3VudHMgPSB0aGlzLnN0YXRlLmFjY291bnRzLm1hcChmdW5jdGlvbiAoYSkge1xuICAgICAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgICAgICBBY2NvdW50TGlzdEl0ZW0oe2tleTogYS5pZCwgYWNjb3VudDogYX0pXG4gICAgICAgICAgICApO1xuICAgICAgICB9KTtcblxuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgUmVhY3QuRE9NLmRpdihudWxsLCBcbiAgICAgICAgICAgICAgICBcIkFjY291bnRzXCIsIFxuICAgICAgICAgICAgICAgIFJlYWN0LkRPTS51bCh7Y2xhc3NOYW1lOiBcInJvd1wifSwgXG4gICAgICAgICAgICAgICAgICAgIGFjY291bnRzXG4gICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgKVxuICAgICAgICApO1xuICAgIH1cbn0pO1xuXG4iLCIvKiogQGpzeCBSZWFjdC5ET00gKi9cblxuLy8gQ29uc3RhbnRzXG52YXIgRXZlbnRzID0gcmVxdWlyZSgnLi4vRXZlbnRzJyk7XG52YXIgZGVidWcgPSByZXF1aXJlKCcuLi9IZWxwZXJzJykuZGVidWc7XG5cbi8vIEdsb2JhbCB2YXJpYWJsZXNcbnZhciBzdG9yZSA9IHJlcXVpcmUoJy4uL3N0b3JlJyk7XG52YXIgZmx1eCA9IHJlcXVpcmUoJy4uL2ZsdXgvZGlzcGF0Y2hlcicpO1xuXG4vLyBQcm9wczogYmFuazogQmFua1xudmFyIEJhbmtMaXN0SXRlbUNvbXBvbmVudCA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtkaXNwbGF5TmFtZTogJ0JhbmtMaXN0SXRlbUNvbXBvbmVudCcsXG5cbiAgICBfb25DbGljazogZnVuY3Rpb24oKSB7XG4gICAgICAgIGRlYnVnKCdjbGljayBvbiBhIGJhbmsgaXRlbScpO1xuICAgICAgICBmbHV4LmRpc3BhdGNoKHtcbiAgICAgICAgICAgIHR5cGU6IEV2ZW50cy5TRUxFQ1RFRF9CQU5LX0NIQU5HRUQsXG4gICAgICAgICAgICBiYW5rOiB0aGlzLnByb3BzLmJhbmtcbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIHJlbmRlcjogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICBSZWFjdC5ET00ubGkobnVsbCwgUmVhY3QuRE9NLmEoe29uQ2xpY2s6IHRoaXMuX29uQ2xpY2t9LCB0aGlzLnByb3BzLmJhbmsubmFtZSkpXG4gICAgICAgICk7XG4gICAgfVxufSk7XG5cbi8vIFN0YXRlOiBbYmFua11cbnZhciBCYW5rTGlzdENvbXBvbmVudCA9IG1vZHVsZS5leHBvcnRzID0gUmVhY3QuY3JlYXRlQ2xhc3Moe2Rpc3BsYXlOYW1lOiAnZXhwb3J0cycsXG5cbiAgICBfYmFua0xpc3RMaXN0ZW5lcjogZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgYmFua3M6IHN0b3JlLmJhbmtzXG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICBnZXRJbml0aWFsU3RhdGU6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgYmFua3M6IFtdXG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgY29tcG9uZW50RGlkTW91bnQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICBzdG9yZS5vbihFdmVudHMuQkFOS19MSVNUX0xPQURFRCwgdGhpcy5fYmFua0xpc3RMaXN0ZW5lcik7XG4gICAgfSxcblxuICAgIGNvbXBvbmVudFdpbGxVbm1vdW50OiBmdW5jdGlvbigpIHtcbiAgICAgICAgc3RvcmUucmVtb3ZlTGlzdGVuZXIoRXZlbnRzLkJBTktfTElTVF9MT0FERUQsIHRoaXMuX2JhbmtMaXN0TGlzdGVuZXIpO1xuICAgIH0sXG5cbiAgICByZW5kZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgYmFua3MgPSB0aGlzLnN0YXRlLmJhbmtzLm1hcChmdW5jdGlvbiAoYikge1xuICAgICAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgICAgICBCYW5rTGlzdEl0ZW1Db21wb25lbnQoe2tleTogYi5pZCwgYmFuazogYn0pXG4gICAgICAgICAgICApXG4gICAgICAgIH0pO1xuXG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICBSZWFjdC5ET00uZGl2KG51bGwsIFxuICAgICAgICAgICAgICAgIFwiQmFua3NcIiwgXG4gICAgICAgICAgICAgICAgUmVhY3QuRE9NLnVsKHtjbGFzc05hbWU6IFwicm93XCJ9LCBcbiAgICAgICAgICAgICAgICAgICAgYmFua3NcbiAgICAgICAgICAgICAgICApLCBcbiAgICAgICAgICAgICAgICBSZWFjdC5ET00uaHIobnVsbClcbiAgICAgICAgICAgIClcbiAgICAgICAgKTtcbiAgICB9XG59KTtcbiIsIi8qKiBAanN4IFJlYWN0LkRPTSAqL1xuXG4vLyBDb25zdGFudHNcbnZhciBFdmVudHMgPSByZXF1aXJlKCcuLi9FdmVudHMnKTtcbnZhciBkZWJ1ZyA9IHJlcXVpcmUoJy4uL0hlbHBlcnMnKS5kZWJ1ZztcblxuLy8gR2xvYmFsIHZhcmlhYmxlc1xudmFyIHN0b3JlID0gcmVxdWlyZSgnLi4vc3RvcmUnKTtcbnZhciBmbHV4ID0gcmVxdWlyZSgnLi4vZmx1eC9kaXNwYXRjaGVyJyk7XG5cbnZhciBDYXRlZ29yeUxpc3QgPSBSZWFjdC5jcmVhdGVDbGFzcyh7ZGlzcGxheU5hbWU6ICdDYXRlZ29yeUxpc3QnLFxuXG4gICAgX2xpc3RlbmVyOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICBjYXRlZ29yaWVzOiBzdG9yZS5jYXRlZ29yaWVzXG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICBnZXRJbml0aWFsU3RhdGU6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgY2F0ZWdvcmllczogW11cbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICBjb21wb25lbnREaWRNb3VudDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHN0b3JlLm9uKEV2ZW50cy5DQVRFR09SSUVTX0xPQURFRCwgdGhpcy5fbGlzdGVuZXIpO1xuICAgIH0sXG5cbiAgICBjb21wb25lbnRXaWxsVW5tb3VudDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHN0b3JlLnJlbW92ZUxpc3RlbmVyKEV2ZW50cy5DQVRFR09SSUVTX0xPQURFRCwgdGhpcy5fbGlzdGVuZXIpO1xuICAgIH0sXG5cbiAgICByZW5kZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgaXRlbXMgPSB0aGlzLnN0YXRlLmNhdGVnb3JpZXMubWFwKGZ1bmN0aW9uIChjYXQpIHtcbiAgICAgICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICAgICAgUmVhY3QuRE9NLmxpKHtrZXk6IGNhdC5pZH0sIGNhdC50aXRsZSlcbiAgICAgICAgICAgICk7XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgUmVhY3QuRE9NLnVsKG51bGwsIGl0ZW1zKVxuICAgICAgICApO1xuICAgIH1cbn0pO1xuXG52YXIgQ2F0ZWdvcnlGb3JtID0gUmVhY3QuY3JlYXRlQ2xhc3Moe2Rpc3BsYXlOYW1lOiAnQ2F0ZWdvcnlGb3JtJyxcblxuICAgIG9uU3VibWl0OiBmdW5jdGlvbihlKSB7XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcblxuICAgICAgICB2YXIgbGFiZWwgPSB0aGlzLnJlZnMubGFiZWwuZ2V0RE9NTm9kZSgpLnZhbHVlLnRyaW0oKTtcbiAgICAgICAgaWYgKCFsYWJlbClcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcblxuICAgICAgICB2YXIgY2F0ZWdvcnkgPSB7XG4gICAgICAgICAgICB0aXRsZTogbGFiZWxcbiAgICAgICAgfTtcblxuICAgICAgICBmbHV4LmRpc3BhdGNoKHtcbiAgICAgICAgICAgIHR5cGU6IEV2ZW50cy5DQVRFR09SWV9DUkVBVEVELFxuICAgICAgICAgICAgY2F0ZWdvcnk6IGNhdGVnb3J5XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHRoaXMucmVmcy5sYWJlbC5nZXRET01Ob2RlKCkudmFsdWUgPSAnJztcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH0sXG5cbiAgICByZW5kZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgUmVhY3QuRE9NLmZvcm0oe29uU3VibWl0OiB0aGlzLm9uU3VibWl0fSwgXG4gICAgICAgICAgICAgICAgUmVhY3QuRE9NLmRpdih7Y2xhc3NOYW1lOiBcInJvd1wifSwgXG4gICAgICAgICAgICAgICAgICAgIFJlYWN0LkRPTS5kaXYoe2NsYXNzTmFtZTogXCJzbWFsbC0xMCBjb2x1bW5zXCJ9LCBcbiAgICAgICAgICAgICAgICAgICAgICAgIFJlYWN0LkRPTS5pbnB1dCh7dHlwZTogXCJ0ZXh0XCIsIHBsYWNlaG9sZGVyOiBcIkxhYmVsIG9mIG5ldyBjYXRlZ29yeVwiLCByZWY6IFwibGFiZWxcIn0pXG4gICAgICAgICAgICAgICAgICAgICksIFxuICAgICAgICAgICAgICAgICAgICBSZWFjdC5ET00uZGl2KHtjbGFzc05hbWU6IFwic21hbGwtMiBjb2x1bW5zXCJ9LCBcbiAgICAgICAgICAgICAgICAgICAgICAgIFJlYWN0LkRPTS5pbnB1dCh7dHlwZTogXCJzdWJtaXRcIiwgY2xhc3NOYW1lOiBcImJ1dHRvbiBwb3N0Zml4XCIsIHZhbHVlOiBcIlN1Ym1pdFwifSlcbiAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgIClcbiAgICAgICAgKVxuICAgIH1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtkaXNwbGF5TmFtZTogJ2V4cG9ydHMnLFxuXG4gICAgcmVuZGVyOiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIFJlYWN0LkRPTS5kaXYobnVsbCwgXG4gICAgICAgICAgICAgICAgUmVhY3QuRE9NLmgxKG51bGwsIFwiQ2F0ZWdvcmllc1wiKSwgXG4gICAgICAgICAgICAgICAgQ2F0ZWdvcnlMaXN0KG51bGwpLCBcbiAgICAgICAgICAgICAgICBSZWFjdC5ET00uaDMobnVsbCwgXCJBZGQgYSBjYXRlZ29yeVwiKSwgXG4gICAgICAgICAgICAgICAgQ2F0ZWdvcnlGb3JtKG51bGwpXG4gICAgICAgICAgICApXG4gICAgICAgICk7XG4gICAgfVxufSk7XG4iLCIvKiogQGpzeCBSZWFjdC5ET00gKi9cblxuLy8gQ29uc3RhbnRzXG52YXIgRXZlbnRzID0gcmVxdWlyZSgnLi4vRXZlbnRzJyk7XG52YXIgZGVidWcgPSByZXF1aXJlKCcuLi9IZWxwZXJzJykuZGVidWc7XG5cbi8vIEdsb2JhbCB2YXJpYWJsZXNcbnZhciBzdG9yZSA9IHJlcXVpcmUoJy4uL3N0b3JlJyk7XG5cbnZhciAkY2hhcnQgPSBudWxsO1xuXG5mdW5jdGlvbiBERUJVRyh0ZXh0KSB7XG4gICAgcmV0dXJuIGRlYnVnKCdDaGFydCBDb21wb25lbnQgLSAnICsgdGV4dCk7XG59XG5cbi8vIENvbXBvbmVudHNcbm1vZHVsZS5leHBvcnRzID0gUmVhY3QuY3JlYXRlQ2xhc3Moe2Rpc3BsYXlOYW1lOiAnZXhwb3J0cycsXG5cbiAgICBnZXRJbml0aWFsU3RhdGU6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgYWNjb3VudDogbnVsbCxcbiAgICAgICAgICAgIG9wZXJhdGlvbnM6IFtdLFxuICAgICAgICAgICAgY2F0ZWdvcmllczogW10sXG4gICAgICAgICAgICBraW5kOiAnYWxsJyAgICAgICAgIC8vIHdoaWNoIGNoYXJ0IGFyZSB3ZSBzaG93aW5nP1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIF9yZWxvYWQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICBERUJVRygncmVsb2FkJyk7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgYWNjb3VudDogICAgc3RvcmUuY3VycmVudEFjY291bnQsXG4gICAgICAgICAgICBvcGVyYXRpb25zOiBzdG9yZS5vcGVyYXRpb25zLFxuICAgICAgICAgICAgY2F0ZWdvcmllczogc3RvcmUuY2F0ZWdvcmllc1xuICAgICAgICB9LCB0aGlzLl9yZWRyYXcpO1xuICAgIH0sXG5cbiAgICBjb21wb25lbnREaWRNb3VudDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHN0b3JlLm9uKEV2ZW50cy5PUEVSQVRJT05TX0xPQURFRCwgdGhpcy5fcmVsb2FkKTtcbiAgICAgICAgc3RvcmUub24oRXZlbnRzLkNBVEVHT1JJRVNfTE9BREVELCB0aGlzLl9yZWxvYWQpO1xuICAgICAgICAkY2hhcnQgPSAkKCcjY2hhcnQnKTtcbiAgICB9LFxuXG4gICAgY29tcG9uZW50V2lsbFVubW91bnQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICBzdG9yZS5yZW1vdmVMaXN0ZW5lcihFdmVudHMuT1BFUkFUSU9OU19MT0FERUQsIHRoaXMuX3JlbG9hZCk7XG4gICAgICAgIHN0b3JlLnJlbW92ZUxpc3RlbmVyKEV2ZW50cy5DQVRFR09SSUVTX0xPQURFRCwgdGhpcy5fcmVsb2FkKTtcbiAgICB9LFxuXG4gICAgX3JlZHJhdzogZnVuY3Rpb24oKSB7XG4gICAgICAgIERFQlVHKCdyZWRyYXcnKTtcbiAgICAgICAgc3dpdGNoICh0aGlzLnN0YXRlLmtpbmQpIHtcbiAgICAgICAgICAgIGNhc2UgJ2FsbCc6XG4gICAgICAgICAgICAgICAgQ3JlYXRlQ2hhcnRBbGxCeUNhdGVnb3J5QnlNb250aCh0aGlzLnN0YXRlLm9wZXJhdGlvbnMpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnYmFsYW5jZSc6XG4gICAgICAgICAgICAgICAgQ3JlYXRlQ2hhcnRCYWxhbmNlKHRoaXMuc3RhdGUuYWNjb3VudCwgdGhpcy5zdGF0ZS5vcGVyYXRpb25zKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ2J5LWNhdGVnb3J5JzpcbiAgICAgICAgICAgICAgICB2YXIgdmFsID0gdGhpcy5yZWZzLnNlbGVjdC5nZXRET01Ob2RlKCkudmFsdWU7XG4gICAgICAgICAgICAgICAgQ3JlYXRlQ2hhcnRCeUNhdGVnb3J5QnlNb250aCh2YWwsIHRoaXMuc3RhdGUub3BlcmF0aW9ucyk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICdwb3MtbmVnJzpcbiAgICAgICAgICAgICAgICBDcmVhdGVDaGFydFBvc2l0aXZlTmVnYXRpdmUodGhpcy5zdGF0ZS5vcGVyYXRpb25zKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgYXNzZXJ0KHRydWUgPT09IGZhbHNlLCAndW5leHBlY3RlZCB2YWx1ZSBpbiBfcmVkcmF3OiAnICsgdGhpcy5zdGF0ZS5raW5kKTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICBfY2hhbmdlS2luZDogZnVuY3Rpb24oa2luZCkge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgIGtpbmQ6IGtpbmRcbiAgICAgICAgfSwgdGhpcy5fcmVkcmF3KTtcbiAgICB9LFxuICAgIF9vbkNsaWNrQWxsOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy5fY2hhbmdlS2luZCgnYWxsJyk7XG4gICAgfSxcbiAgICBfb25DbGlja0J5Q2F0ZWdvcnk6IGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLl9jaGFuZ2VLaW5kKCdieS1jYXRlZ29yeScpO1xuICAgIH0sXG4gICAgX29uQ2xpY2tCYWxhbmNlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy5fY2hhbmdlS2luZCgnYmFsYW5jZScpO1xuICAgIH0sXG4gICAgX29uQ2xpY2tQb3NOZWc6IGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLl9jaGFuZ2VLaW5kKCdwb3MtbmVnJyk7XG4gICAgfSxcblxuICAgIHJlbmRlcjogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBjYXRlZ29yeU9wdGlvbnMgPSB0aGlzLnN0YXRlLmNhdGVnb3JpZXMubWFwKGZ1bmN0aW9uIChjKSB7XG4gICAgICAgICAgICByZXR1cm4gKFJlYWN0LkRPTS5vcHRpb24oe2tleTogYy5pZCwgdmFsdWU6IGMuaWR9LCBjLnRpdGxlKSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHZhciBtYXliZVNlbGVjdCA9IHRoaXMuc3RhdGUua2luZCAhPT0gJ2J5LWNhdGVnb3J5JyA/ICcnIDpcbiAgICAgICAgICAgIFJlYWN0LkRPTS5zZWxlY3Qoe29uQ2hhbmdlOiB0aGlzLl9yZWRyYXcsIHJlZjogXCJzZWxlY3RcIn0sIFxuICAgICAgICAgICAgICAgIGNhdGVnb3J5T3B0aW9uc1xuICAgICAgICAgICAgKVxuXG4gICAgICAgIHJldHVybiAoXG4gICAgICAgIFJlYWN0LkRPTS5kaXYobnVsbCwgXG4gICAgICAgICAgICBSZWFjdC5ET00uaDEobnVsbCwgXCJDaGFydHNcIiksIFxuXG4gICAgICAgICAgICBSZWFjdC5ET00uZGl2KG51bGwsIFxuICAgICAgICAgICAgICAgIFJlYWN0LkRPTS5idXR0b24oe29uQ2xpY2s6IHRoaXMuX29uQ2xpY2tBbGx9LCBcIkFsbCBjYXRlZ29yaWVzIGJ5IG1vbnRoXCIpLCBcbiAgICAgICAgICAgICAgICBSZWFjdC5ET00uYnV0dG9uKHtvbkNsaWNrOiB0aGlzLl9vbkNsaWNrQnlDYXRlZ29yeX0sIFwiQnkgY2F0ZWdvcnkgYnkgbW9udGhcIiksIFxuICAgICAgICAgICAgICAgIFJlYWN0LkRPTS5idXR0b24oe29uQ2xpY2s6IHRoaXMuX29uQ2xpY2tCYWxhbmNlfSwgXCJCYWxhbmNlIG92ZXIgdGltZVwiKSwgXG4gICAgICAgICAgICAgICAgUmVhY3QuRE9NLmJ1dHRvbih7b25DbGljazogdGhpcy5fb25DbGlja1Bvc05lZ30sIFwiSW5zIC8gb3V0cyBvdmVyIHRpbWVcIilcbiAgICAgICAgICAgICksIFxuXG4gICAgICAgICAgICBtYXliZVNlbGVjdCwgXG5cbiAgICAgICAgICAgIFJlYWN0LkRPTS5kaXYoe2lkOiBcImNoYXJ0XCJ9KVxuICAgICAgICApXG4gICAgICAgICk7XG4gICAgfVxufSk7XG5cbi8vIENoYXJ0c1xuZnVuY3Rpb24gQ3JlYXRlQ2hhcnRCeUNhdGVnb3J5QnlNb250aChjYXRJZCwgb3BlcmF0aW9ucykge1xuICAgIHZhciBvcHMgPSBvcGVyYXRpb25zLnNsaWNlKCkuZmlsdGVyKGZ1bmN0aW9uKG9wKSB7XG4gICAgICAgIHJldHVybiBvcC5jYXRlZ29yeUlkID09PSBjYXRJZDtcbiAgICB9KTtcbiAgICBDcmVhdGVDaGFydEFsbEJ5Q2F0ZWdvcnlCeU1vbnRoKG9wcyk7XG59XG5cbmZ1bmN0aW9uIENyZWF0ZUNoYXJ0QWxsQnlDYXRlZ29yeUJ5TW9udGgob3BlcmF0aW9ucykge1xuXG4gICAgZnVuY3Rpb24gZGF0ZWtleShvcCkge1xuICAgICAgICB2YXIgZCA9IG9wLmRhdGU7XG4gICAgICAgIHJldHVybiBkLmdldEZ1bGxZZWFyKCkgKyAnLScgKyBkLmdldE1vbnRoKCk7XG4gICAgfVxuXG4gICAgLy8gQ2F0ZWdvcnkgLT4ge01vbnRoIC0+IFtBbW91bnRzXX1cbiAgICB2YXIgbWFwID0ge307XG4gICAgLy8gRGF0ZWtleSAtPiBEYXRlXG4gICAgdmFyIGRhdGVzZXQgPSB7fTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IG9wZXJhdGlvbnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgdmFyIG9wID0gb3BlcmF0aW9uc1tpXTtcbiAgICAgICAgdmFyIGMgPSBzdG9yZS5jYXRlZ29yeVRvTGFiZWwob3AuY2F0ZWdvcnlJZCk7XG4gICAgICAgIG1hcFtjXSA9IG1hcFtjXSB8fCB7fTtcblxuICAgICAgICB2YXIgZGsgPSBkYXRla2V5KG9wKTtcbiAgICAgICAgbWFwW2NdW2RrXSA9IG1hcFtjXVtka10gfHwgW107XG4gICAgICAgIG1hcFtjXVtka10ucHVzaChvcC5hbW91bnQpO1xuICAgICAgICBkYXRlc2V0W2RrXSA9ICtvcC5kYXRlO1xuICAgIH1cblxuICAgIC8vIFNvcnQgZGF0ZSBpbiBhc2NlbmRpbmcgb3JkZXI6IHB1c2ggYWxsIHBhaXJzIG9mIChkYXRla2V5LCBkYXRlKSBpbiBhblxuICAgIC8vIGFycmF5IGFuZCBzb3J0IHRoYXQgYXJyYXkgYnkgdGhlIHNlY29uZCBlbGVtZW50LiBUaGVuIHJlYWQgdGhhdCBhcnJheSBpblxuICAgIC8vIGFzY2VuZGluZyBvcmRlci5cbiAgICB2YXIgZGF0ZXMgPSBbXTtcbiAgICBmb3IgKHZhciBkayBpbiBkYXRlc2V0KSB7XG4gICAgICAgIGRhdGVzLnB1c2goW2RrLCBkYXRlc2V0W2RrXV0pO1xuICAgIH1cbiAgICBkYXRlcy5zb3J0KGZ1bmN0aW9uKGEsIGIpIHtcbiAgICAgICAgcmV0dXJuIGFbMV0gLSBiWzFdO1xuICAgIH0pO1xuXG4gICAgdmFyIHNlcmllcyA9IFtdO1xuICAgIGZvciAodmFyIGMgaW4gbWFwKSB7XG4gICAgICAgIHZhciBkYXRhID0gW107XG5cbiAgICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCBkYXRlcy5sZW5ndGg7IGorKykge1xuICAgICAgICAgICAgdmFyIGRrID0gZGF0ZXNbal1bMF07XG4gICAgICAgICAgICBtYXBbY11bZGtdID0gbWFwW2NdW2RrXSB8fCBbXTtcbiAgICAgICAgICAgIGRhdGEucHVzaChtYXBbY11bZGtdLnJlZHVjZShmdW5jdGlvbihhLCBiKSB7IHJldHVybiBhICsgYiB9LCAwKSk7XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgc2VyaWUgPSB7XG4gICAgICAgICAgICBuYW1lOiBjLFxuICAgICAgICAgICAgZGF0YTogZGF0YVxuICAgICAgICB9O1xuXG4gICAgICAgIHNlcmllcy5wdXNoKHNlcmllKTtcbiAgICB9XG5cbiAgICB2YXIgY2F0ZWdvcmllcyA9IFtdO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZGF0ZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgdmFyIGRhdGUgPSBuZXcgRGF0ZShkYXRlc1tpXVsxXSk7XG4gICAgICAgIHZhciBzdHIgPSBkYXRlLnRvTG9jYWxlRGF0ZVN0cmluZygvKiB1c2UgdGhlIGRlZmF1bHQgbG9jYWxlICovIHVuZGVmaW5lZCwge1xuICAgICAgICAgICAgeWVhcjogJ251bWVyaWMnLFxuICAgICAgICAgICAgbW9udGg6ICdsb25nJ1xuICAgICAgICB9KTtcbiAgICAgICAgY2F0ZWdvcmllcy5wdXNoKHN0cik7XG4gICAgfVxuXG4gICAgdmFyIHRpdGxlID0gJ0J5IGNhdGVnb3J5JztcbiAgICB2YXIgeUF4aXNMZWdlbmQgPSAnQW1vdW50JztcblxuICAgICRjaGFydC5oaWdoY2hhcnRzKHtcbiAgICAgICAgY2hhcnQ6IHtcbiAgICAgICAgICAgIHR5cGU6ICdjb2x1bW4nXG4gICAgICAgIH0sXG4gICAgICAgIHRpdGxlOiB7XG4gICAgICAgICAgICB0ZXh0OiB0aXRsZVxuICAgICAgICB9LFxuICAgICAgICB4QXhpczoge1xuICAgICAgICAgICAgY2F0ZWdvcmllczogY2F0ZWdvcmllc1xuICAgICAgICB9LFxuICAgICAgICB5QXhpczoge1xuICAgICAgICAgICAgdGl0bGU6IHtcbiAgICAgICAgICAgICAgICB0ZXh0OiB5QXhpc0xlZ2VuZFxuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICB0b29sdGlwOiB7XG4gICAgICAgICAgICBoZWFkZXJGb3JtYXQ6ICc8c3BhbiBzdHlsZT1cImZvbnQtc2l6ZToxMHB4XCI+e3BvaW50LmtleX08L3NwYW4+PHRhYmxlPicsXG4gICAgICAgICAgICBwb2ludEZvcm1hdDogJzx0cj48dGQgc3R5bGU9XCJjb2xvcjp7c2VyaWVzLmNvbG9yfTtwYWRkaW5nOjBcIj57c2VyaWVzLm5hbWV9OiA8L3RkPicgK1xuICAgICAgICAgICAgJzx0ZCBzdHlsZT1cInBhZGRpbmc6MFwiPjxiPntwb2ludC55Oi4xZn0gZXVyPC9iPjwvdGQ+PC90cj4nLFxuICAgICAgICAgICAgZm9vdGVyRm9ybWF0OiAnPC90YWJsZT4nLFxuICAgICAgICAgICAgc2hhcmVkOiB0cnVlLFxuICAgICAgICAgICAgdXNlSFRNTDogdHJ1ZVxuICAgICAgICB9LFxuICAgICAgICBwbG90T3B0aW9uczoge1xuICAgICAgICAgICAgY29sdW1uOiB7XG4gICAgICAgICAgICAgICAgcG9pbnRQYWRkaW5nOiAwLjIsXG4gICAgICAgICAgICAgICAgYm9yZGVyV2lkdGg6IDBcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgc2VyaWVzOiBzZXJpZXNcbiAgICB9KTtcbn1cblxuZnVuY3Rpb24gQ3JlYXRlQ2hhcnRCYWxhbmNlKGFjY291bnQsIG9wZXJhdGlvbnMpIHtcblxuICAgIHZhciBvcHMgPSBvcGVyYXRpb25zLnNvcnQoZnVuY3Rpb24gKGEsYikgeyByZXR1cm4gK2EuZGF0ZSAtICtiLmRhdGUgfSk7XG5cbiAgICAvLyBEYXRlIChkYXkpIC0+IHN1bSBhbW91bnRzIG9mIHRoaXMgZGF5IChzY2FsYXIpXG4gICAgdmFyIG9wbWFwID0ge307XG4gICAgb3BzLm1hcChmdW5jdGlvbihvKSB7XG4gICAgICAgIC8vIENvbnZlcnQgZGF0ZSBpbnRvIGEgbnVtYmVyOiBpdCdzIGdvaW5nIHRvIGJlIGNvbnZlcnRlZCBpbnRvIGEgc3RyaW5nXG4gICAgICAgIC8vIHdoZW4gdXNlZCBhcyBhIGtleS5cbiAgICAgICAgdmFyIGEgPSBvLmFtb3VudDtcbiAgICAgICAgdmFyIGQgPSArby5kYXRlO1xuICAgICAgICBvcG1hcFtkXSA9IG9wbWFwW2RdIHx8IDA7XG4gICAgICAgIG9wbWFwW2RdICs9IGE7XG4gICAgfSlcblxuICAgIHZhciBiYWxhbmNlID0gYWNjb3VudC5pbml0aWFsQW1vdW50O1xuICAgIHZhciBiYWwgPSBbXTtcbiAgICBmb3IgKHZhciBkYXRlIGluIG9wbWFwKSB7XG4gICAgICAgIC8vIGRhdGUgaXMgYSBzdHJpbmcgbm93OiBjb252ZXJ0IGl0IGJhY2sgdG8gYSBudW1iZXIgZm9yIGhpZ2hjaGFydHMuXG4gICAgICAgIGJhbGFuY2UgKz0gb3BtYXBbZGF0ZV07XG4gICAgICAgIGJhbC5wdXNoKFsrZGF0ZSwgYmFsYW5jZV0pO1xuICAgIH1cblxuICAgIC8vIENyZWF0ZSB0aGUgY2hhcnRcbiAgICAkY2hhcnQuaGlnaGNoYXJ0cygnQmFsYW5jZUNoYXJ0Jywge1xuICAgICAgICByYW5nZVNlbGVjdG9yIDoge1xuICAgICAgICAgICAgc2VsZWN0ZWQgOiAxXG4gICAgICAgIH0sXG5cbiAgICAgICAgdGl0bGUgOiB7XG4gICAgICAgICAgICB0ZXh0IDogJ0JhbGFuY2UnXG4gICAgICAgIH0sXG5cbiAgICAgICAgc2VyaWVzIDogW3tcbiAgICAgICAgICAgIG5hbWUgOiAnQmFsYW5jZScsXG4gICAgICAgICAgICBkYXRhIDogYmFsLFxuICAgICAgICAgICAgdG9vbHRpcDogeyB2YWx1ZURlY2ltYWxzOiAyIH1cbiAgICAgICAgfV1cbiAgICB9KTtcbn1cblxuZnVuY3Rpb24gQ3JlYXRlQ2hhcnRQb3NpdGl2ZU5lZ2F0aXZlKG9wZXJhdGlvbnMpIHtcblxuICAgIGZ1bmN0aW9uIGRhdGVrZXkob3ApIHtcbiAgICAgICAgdmFyIGQgPSBvcC5kYXRlO1xuICAgICAgICByZXR1cm4gZC5nZXRGdWxsWWVhcigpICsgJy0nICsgZC5nZXRNb250aCgpO1xuICAgIH1cblxuICAgIGNvbnN0IFBPUyA9IDAsIE5FRyA9IDEsIEJBTCA9IDI7XG5cbiAgICAvLyBNb250aCAtPiBbUG9zaXRpdmUgYW1vdW50LCBOZWdhdGl2ZSBhbW91bnQsIERpZmZdXG4gICAgdmFyIG1hcCA9IHt9O1xuICAgIC8vIERhdGVrZXkgLT4gRGF0ZVxuICAgIHZhciBkYXRlc2V0ID0ge307XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBvcGVyYXRpb25zLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHZhciBvcCA9IG9wZXJhdGlvbnNbaV07XG4gICAgICAgIHZhciBkayA9IGRhdGVrZXkob3ApO1xuICAgICAgICBtYXBbZGtdID0gbWFwW2RrXSB8fCBbMCwgMCwgMF07XG5cbiAgICAgICAgbWFwW2RrXVtQT1NdICs9IG9wLmFtb3VudCA+IDAgPyBvcC5hbW91bnQgOiAwO1xuICAgICAgICBtYXBbZGtdW05FR10gKz0gb3AuYW1vdW50IDwgMCA/IC1vcC5hbW91bnQgOiAwO1xuICAgICAgICBtYXBbZGtdW0JBTF0gKz0gb3AuYW1vdW50O1xuXG4gICAgICAgIGRhdGVzZXRbZGtdID0gK29wLmRhdGU7XG4gICAgfVxuXG4gICAgLy8gU29ydCBkYXRlIGluIGFzY2VuZGluZyBvcmRlcjogcHVzaCBhbGwgcGFpcnMgb2YgKGRhdGVrZXksIGRhdGUpIGluIGFuXG4gICAgLy8gYXJyYXkgYW5kIHNvcnQgdGhhdCBhcnJheSBieSB0aGUgc2Vjb25kIGVsZW1lbnQuIFRoZW4gcmVhZCB0aGF0IGFycmF5IGluXG4gICAgLy8gYXNjZW5kaW5nIG9yZGVyLlxuICAgIHZhciBkYXRlcyA9IFtdO1xuICAgIGZvciAodmFyIGRrIGluIGRhdGVzZXQpIHtcbiAgICAgICAgZGF0ZXMucHVzaChbZGssIGRhdGVzZXRbZGtdXSk7XG4gICAgfVxuICAgIGRhdGVzLnNvcnQoZnVuY3Rpb24oYSwgYikge1xuICAgICAgICByZXR1cm4gYVsxXSAtIGJbMV07XG4gICAgfSk7XG5cbiAgICB2YXIgc2VyaWVzID0gW107XG4gICAgZnVuY3Rpb24gYWRkU2VyaWUobmFtZSwgbWFwSW5kZXgpIHtcbiAgICAgICAgdmFyIGRhdGEgPSBbXTtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBkYXRlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgdmFyIGRrID0gZGF0ZXNbaV1bMF07XG4gICAgICAgICAgICBkYXRhLnB1c2gobWFwW2RrXVttYXBJbmRleF0pO1xuICAgICAgICB9XG4gICAgICAgIHZhciBzZXJpZSA9IHtcbiAgICAgICAgICAgIG5hbWU6IG5hbWUsXG4gICAgICAgICAgICBkYXRhOiBkYXRhXG4gICAgICAgIH07XG4gICAgICAgIHNlcmllcy5wdXNoKHNlcmllKTtcbiAgICB9XG5cbiAgICBhZGRTZXJpZSgnUG9zaXRpdmUnLCBQT1MpO1xuICAgIGFkZFNlcmllKCdOZWdhdGl2ZScsIE5FRyk7XG4gICAgYWRkU2VyaWUoJ0JhbGFuY2UnLCBCQUwpO1xuXG4gICAgdmFyIGNhdGVnb3JpZXMgPSBbXTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGRhdGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHZhciBkYXRlID0gbmV3IERhdGUoZGF0ZXNbaV1bMV0pO1xuICAgICAgICB2YXIgc3RyID0gZGF0ZS50b0xvY2FsZURhdGVTdHJpbmcoLyogdXNlIHRoZSBkZWZhdWx0IGxvY2FsZSAqLyB1bmRlZmluZWQsIHtcbiAgICAgICAgICAgIHllYXI6ICdudW1lcmljJyxcbiAgICAgICAgICAgIG1vbnRoOiAnbG9uZydcbiAgICAgICAgfSk7XG4gICAgICAgIGNhdGVnb3JpZXMucHVzaChzdHIpO1xuICAgIH1cblxuICAgIHZhciB0aXRsZSA9ICdQb3NpdGl2ZSAvIE5lZ2F0aXZlIG92ZXIgdGltZSc7XG4gICAgdmFyIHlBeGlzTGVnZW5kID0gJ0Ftb3VudCc7XG5cbiAgICAkY2hhcnQuaGlnaGNoYXJ0cyh7XG4gICAgICAgIGNoYXJ0OiB7XG4gICAgICAgICAgICB0eXBlOiAnY29sdW1uJ1xuICAgICAgICB9LFxuICAgICAgICB0aXRsZToge1xuICAgICAgICAgICAgdGV4dDogdGl0bGVcbiAgICAgICAgfSxcbiAgICAgICAgeEF4aXM6IHtcbiAgICAgICAgICAgIGNhdGVnb3JpZXM6IGNhdGVnb3JpZXNcbiAgICAgICAgfSxcbiAgICAgICAgeUF4aXM6IHtcbiAgICAgICAgICAgIHRpdGxlOiB7XG4gICAgICAgICAgICAgICAgdGV4dDogeUF4aXNMZWdlbmRcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgdG9vbHRpcDoge1xuICAgICAgICAgICAgaGVhZGVyRm9ybWF0OiAnPHNwYW4gc3R5bGU9XCJmb250LXNpemU6MTBweFwiPntwb2ludC5rZXl9PC9zcGFuPjx0YWJsZT4nLFxuICAgICAgICAgICAgcG9pbnRGb3JtYXQ6ICc8dHI+PHRkIHN0eWxlPVwiY29sb3I6e3Nlcmllcy5jb2xvcn07cGFkZGluZzowXCI+e3Nlcmllcy5uYW1lfTogPC90ZD4nICtcbiAgICAgICAgICAgICc8dGQgc3R5bGU9XCJwYWRkaW5nOjBcIj48Yj57cG9pbnQueTouMWZ9IGV1cjwvYj48L3RkPjwvdHI+JyxcbiAgICAgICAgICAgIGZvb3RlckZvcm1hdDogJzwvdGFibGU+JyxcbiAgICAgICAgICAgIHNoYXJlZDogdHJ1ZSxcbiAgICAgICAgICAgIHVzZUhUTUw6IHRydWVcbiAgICAgICAgfSxcbiAgICAgICAgcGxvdE9wdGlvbnM6IHtcbiAgICAgICAgICAgIGNvbHVtbjoge1xuICAgICAgICAgICAgICAgIHBvaW50UGFkZGluZzogMC4yLFxuICAgICAgICAgICAgICAgIGJvcmRlcldpZHRoOiAwXG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIHNlcmllczogc2VyaWVzXG4gICAgfSk7XG59XG5cbiIsIi8qKiBAanN4IFJlYWN0LkRPTSAqL1xuXG4vLyBDb25zdGFudHNcbnZhciBFdmVudHMgPSByZXF1aXJlKCcuLi9FdmVudHMnKTtcbnZhciBkZWJ1ZyA9IHJlcXVpcmUoJy4uL0hlbHBlcnMnKS5kZWJ1ZztcblxuLy8gR2xvYmFsIHZhcmlhYmxlc1xudmFyIHN0b3JlID0gcmVxdWlyZSgnLi4vc3RvcmUnKTtcbnZhciBmbHV4ID0gcmVxdWlyZSgnLi4vZmx1eC9kaXNwYXRjaGVyJyk7XG5cbi8vIENvbXBvbmVudHNcbnZhciBDYXRlZ29yeVNlbGVjdENvbXBvbmVudCA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtkaXNwbGF5TmFtZTogJ0NhdGVnb3J5U2VsZWN0Q29tcG9uZW50JyxcblxuICAgIGdldEluaXRpYWxTdGF0ZTogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB7IGVkaXRNb2RlOiBmYWxzZSB9XG4gICAgfSxcblxuICAgIGRvbTogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnJlZnMuY2F0LmdldERPTU5vZGUoKTtcbiAgICB9LFxuXG4gICAgb25DaGFuZ2U6IGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgdmFyIHNlbGVjdGVkSWQgPSB0aGlzLmRvbSgpLnZhbHVlO1xuICAgICAgICBmbHV4LmRpc3BhdGNoKHtcbiAgICAgICAgICAgIHR5cGU6IEV2ZW50cy5PUEVSQVRJT05fQ0FURUdPUllfQ0hBTkdFRCxcbiAgICAgICAgICAgIG9wZXJhdGlvbklkOiB0aGlzLnByb3BzLm9wZXJhdGlvbi5pZCxcbiAgICAgICAgICAgIGNhdGVnb3J5SWQ6IHNlbGVjdGVkSWRcbiAgICAgICAgfSk7XG4gICAgICAgIC8vIEJlIG9wdGltaXN0aWNcbiAgICAgICAgdGhpcy5wcm9wcy5vcGVyYXRpb24uY2F0ZWdvcnlJZCA9IHNlbGVjdGVkSWQ7XG4gICAgfSxcblxuICAgIHN3aXRjaFRvRWRpdE1vZGU6IGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHsgZWRpdE1vZGU6IHRydWUgfSwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB0aGlzLmRvbSgpLmZvY3VzKCk7XG4gICAgICAgIH0pO1xuICAgIH0sXG4gICAgc3dpdGNoVG9TdGF0aWNNb2RlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IGVkaXRNb2RlOiBmYWxzZSB9KTtcbiAgICB9LFxuXG4gICAgcmVuZGVyOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIHNlbGVjdGVkSWQgPSB0aGlzLnByb3BzLm9wZXJhdGlvbi5jYXRlZ29yeUlkO1xuICAgICAgICB2YXIgbGFiZWwgPSBzdG9yZS5jYXRlZ29yeVRvTGFiZWwoc2VsZWN0ZWRJZCk7XG5cbiAgICAgICAgaWYgKCF0aGlzLnN0YXRlLmVkaXRNb2RlKSB7XG4gICAgICAgICAgICByZXR1cm4gKFJlYWN0LkRPTS5zcGFuKHtvbkNsaWNrOiB0aGlzLnN3aXRjaFRvRWRpdE1vZGV9LCBsYWJlbCkpXG4gICAgICAgIH1cblxuICAgICAgICAvLyBPbiB0aGUgZmlyc3QgY2xpY2sgaW4gZWRpdCBtb2RlLCBjYXRlZ29yaWVzIGFyZSBhbHJlYWR5IGxvYWRlZC5cbiAgICAgICAgLy8gRXZlcnkgdGltZSB3ZSByZWxvYWQgY2F0ZWdvcmllcywgd2UgY2FuJ3QgYmUgaW4gZWRpdCBtb2RlLCBzbyB3ZSBjYW5cbiAgICAgICAgLy8ganVzdCBzeW5jaHJvbm91c2x5IHJldHJpZXZlIGNhdGVnb3JpZXMgYW5kIG5vdCBuZWVkIHRvIHN1YnNjcmliZSB0b1xuICAgICAgICAvLyB0aGVtLlxuICAgICAgICB2YXIgb3B0aW9ucyA9IHN0b3JlLmNhdGVnb3JpZXMubWFwKGZ1bmN0aW9uIChjKSB7XG4gICAgICAgICAgICByZXR1cm4gKFJlYWN0LkRPTS5vcHRpb24oe2tleTogYy5pZCwgdmFsdWU6IGMuaWR9LCBjLnRpdGxlKSlcbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIFJlYWN0LkRPTS5zZWxlY3Qoe29uQ2hhbmdlOiB0aGlzLm9uQ2hhbmdlLCBvbkJsdXI6IHRoaXMuc3dpdGNoVG9TdGF0aWNNb2RlLCBkZWZhdWx0VmFsdWU6IHNlbGVjdGVkSWQsIHJlZjogXCJjYXRcIn0sIFxuICAgICAgICAgICAgICAgIG9wdGlvbnNcbiAgICAgICAgICAgIClcbiAgICAgICAgKTtcbiAgICB9XG59KTtcblxudmFyIE9wZXJhdGlvbkNvbXBvbmVudCA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtkaXNwbGF5TmFtZTogJ09wZXJhdGlvbkNvbXBvbmVudCcsXG5cbiAgICBnZXRJbml0aWFsU3RhdGU6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4geyBtb3VzZU9uOiBmYWxzZSB9O1xuICAgIH0sXG5cbiAgICBvbk1vdXNlRW50ZXI6IGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IG1vdXNlT246IHRydWUgfSlcbiAgICB9LFxuICAgIG9uTW91c2VMZWF2ZTogZnVuY3Rpb24oZSkge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHsgbW91c2VPbjogZmFsc2UgfSlcbiAgICB9LFxuXG4gICAgcmVuZGVyOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIG9wID0gdGhpcy5wcm9wcy5vcGVyYXRpb247XG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICBSZWFjdC5ET00udHIobnVsbCwgXG4gICAgICAgICAgICAgICAgUmVhY3QuRE9NLnRkKG51bGwsIG9wLmRhdGUudG9Mb2NhbGVEYXRlU3RyaW5nKCkpLCBcbiAgICAgICAgICAgICAgICBSZWFjdC5ET00udGQoe29uTW91c2VFbnRlcjogdGhpcy5vbk1vdXNlRW50ZXIsIG9uTW91c2VMZWF2ZTogdGhpcy5vbk1vdXNlTGVhdmV9LCB0aGlzLnN0YXRlLm1vdXNlT24gPyBvcC5yYXcgOiBvcC50aXRsZSksIFxuICAgICAgICAgICAgICAgIFJlYWN0LkRPTS50ZChudWxsLCBvcC5hbW91bnQpLCBcbiAgICAgICAgICAgICAgICBSZWFjdC5ET00udGQobnVsbCwgXG4gICAgICAgICAgICAgICAgICAgIENhdGVnb3J5U2VsZWN0Q29tcG9uZW50KHtvcGVyYXRpb246IG9wfSlcbiAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICApXG4gICAgICAgICk7XG4gICAgfVxufSk7XG5cbnZhciBPcGVyYXRpb25zQ29tcG9uZW50ID0gbW9kdWxlLmV4cG9ydHMgPSBSZWFjdC5jcmVhdGVDbGFzcyh7ZGlzcGxheU5hbWU6ICdleHBvcnRzJyxcblxuICAgIGdldEluaXRpYWxTdGF0ZTogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBhY2NvdW50OiB7aW5pdGlhbEFtb3VudDogMH0sXG4gICAgICAgICAgICBvcGVyYXRpb25zOiBbXVxuICAgICAgICB9XG4gICAgfSxcblxuICAgIF9jYjogZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgYWNjb3VudDogc3RvcmUuY3VycmVudEFjY291bnQsXG4gICAgICAgICAgICBvcGVyYXRpb25zOiBzdG9yZS5vcGVyYXRpb25zXG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICBjb21wb25lbnREaWRNb3VudDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHN0b3JlLm9uKEV2ZW50cy5PUEVSQVRJT05TX0xPQURFRCwgdGhpcy5fY2IpO1xuICAgIH0sXG5cbiAgICBjb21wb25lbnRXaWxsVW5tb3VudDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHN0b3JlLnJlbW92ZUxpc3RlbmVyKEV2ZW50cy5PUEVSQVRJT05TX0xPQURFRCwgdGhpcy5fY2IpO1xuICAgIH0sXG5cbiAgICBnZXRUb3RhbDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciB0b3RhbCA9IHRoaXMuc3RhdGUub3BlcmF0aW9ucy5yZWR1Y2UoZnVuY3Rpb24oYSxiKSB7IHJldHVybiBhICsgYi5hbW91bnQgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnN0YXRlLmFjY291bnQuaW5pdGlhbEFtb3VudCk7XG4gICAgICAgIHJldHVybiAodG90YWwgKiAxMDAgfCAwKSAvIDEwMDtcbiAgICB9LFxuXG4gICAgcmVuZGVyOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIG9wcyA9IHRoaXMuc3RhdGUub3BlcmF0aW9ucy5tYXAoZnVuY3Rpb24gKG8pIHtcbiAgICAgICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICAgICAgT3BlcmF0aW9uQ29tcG9uZW50KHtrZXk6IG8uaWQsIG9wZXJhdGlvbjogb30pXG4gICAgICAgICAgICApO1xuICAgICAgICB9KTtcblxuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgUmVhY3QuRE9NLmRpdihudWxsLCBcbiAgICAgICAgICAgICAgICBSZWFjdC5ET00uaDEobnVsbCwgXCJPcGVyYXRpb25zXCIpLCBcbiAgICAgICAgICAgICAgICBSZWFjdC5ET00uZGl2KG51bGwsIFxuICAgICAgICAgICAgICAgICAgICBSZWFjdC5ET00uaDMobnVsbCwgXCJUb3RhbDogXCIsIHRoaXMuZ2V0VG90YWwoKSlcbiAgICAgICAgICAgICAgICApLCBcbiAgICAgICAgICAgICAgICBSZWFjdC5ET00udGFibGUobnVsbCwgXG4gICAgICAgICAgICAgICAgICAgIFJlYWN0LkRPTS50aGVhZChudWxsLCBcbiAgICAgICAgICAgICAgICAgICAgICAgIFJlYWN0LkRPTS50cihudWxsLCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBSZWFjdC5ET00udGgobnVsbCwgXCJEYXRlXCIpLCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBSZWFjdC5ET00udGgobnVsbCwgXCJUaXRsZVwiKSwgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgUmVhY3QuRE9NLnRoKG51bGwsIFwiQW1vdW50XCIpLCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBSZWFjdC5ET00udGgobnVsbCwgXCJDYXRlZ29yeVwiKVxuICAgICAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgICApLCBcbiAgICAgICAgICAgICAgICAgICAgUmVhY3QuRE9NLnRib2R5KG51bGwsIFxuICAgICAgICAgICAgICAgICAgICAgICAgb3BzXG4gICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICApXG4gICAgICAgICk7XG4gICAgfVxufSk7XG5cbiIsIi8qKiBAanN4IFJlYWN0LkRPTSAqL1xuXG4vLyBDb25zdGFudHNcbnZhciBFdmVudHMgPSByZXF1aXJlKCcuLi9FdmVudHMnKTtcbnZhciBkZWJ1ZyA9IHJlcXVpcmUoJy4uL0hlbHBlcnMnKS5kZWJ1ZztcblxuLy8gR2xvYmFsIHZhcmlhYmxlc1xudmFyIHN0b3JlID0gcmVxdWlyZSgnLi4vc3RvcmUnKTtcbnZhciBmbHV4ID0gcmVxdWlyZSgnLi4vZmx1eC9kaXNwYXRjaGVyJyk7XG5cbmZ1bmN0aW9uIERFQlVHKHRleHQpIHtcbiAgICByZXR1cm4gZGVidWcoJ1NpbWlsYXJpdHkgQ29tcG9uZW50IC0gJyArIHRleHQpO1xufVxuXG4vLyBBbGdvcml0aG1cblxuLy8gVE9ETyBtYWtlIHRoaXMgdGhyZXNob2xkIGEgcGFyYW1ldGVyXG5jb25zdCBUSU1FX1NJTUlMQVJfVEhSRVNIT0xEID0gMTAwMCAqIDYwICogNjAgKiAyNCAqIDI7IC8vIDQ4IGhvdXJzXG5mdW5jdGlvbiBmaW5kUmVkdW5kYW50UGFpcnMob3BlcmF0aW9ucykge1xuICAgIERFQlVHKCdSdW5uaW5nIGZpbmRSZWR1bmRhbnRQYWlycyBhbGdvcml0aG0uLi4nKTtcbiAgICBERUJVRygnSW5wdXQ6ICcgKyBvcGVyYXRpb25zLmxlbmd0aCArICcgb3BlcmF0aW9ucycpO1xuICAgIHZhciBzaW1pbGFyID0gW107XG5cbiAgICBmdW5jdGlvbiBhcmVTaW1pbGFyT3BlcmF0aW9ucyhhLCBiKSB7XG4gICAgICAgIGlmIChhLmFtb3VudCAhPSBiLmFtb3VudClcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgdmFyIGRhdGVkaWZmID0gTWF0aC5hYnMoK2EuZGF0ZSAtICtiLmRhdGUpO1xuICAgICAgICByZXR1cm4gZGF0ZWRpZmYgPD0gVElNRV9TSU1JTEFSX1RIUkVTSE9MRDtcbiAgICB9XG5cbiAgICAvLyBPKG4gbG9nIG4pXG4gICAgZnVuY3Rpb24gc29ydENyaXRlcmlhKGEsYikgeyByZXR1cm4gYS5hbW91bnQgLSBiLmFtb3VudDsgfVxuICAgIHZhciBzb3J0ZWQgPSBvcGVyYXRpb25zLnNsaWNlKCkuc29ydChzb3J0Q3JpdGVyaWEpO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgb3BlcmF0aW9ucy5sZW5ndGg7ICsraSkge1xuICAgICAgICBpZiAoaSArIDEgPj0gb3BlcmF0aW9ucy5sZW5ndGgpXG4gICAgICAgICAgICBjb250aW51ZTtcblxuICAgICAgICB2YXIgb3AgPSBzb3J0ZWRbaV07XG4gICAgICAgIHZhciBuZXh0ID0gc29ydGVkW2krMV07XG4gICAgICAgIGlmIChhcmVTaW1pbGFyT3BlcmF0aW9ucyhvcCwgbmV4dCkpXG4gICAgICAgICAgICBzaW1pbGFyLnB1c2goW29wLCBuZXh0XSk7XG4gICAgfVxuXG4gICAgREVCVUcoc2ltaWxhci5sZW5ndGggKyAnIHBhaXJzIG9mIHNpbWlsYXIgb3BlcmF0aW9ucyBmb3VuZCcpO1xuICAgIHJldHVybiBzaW1pbGFyO1xufVxuXG4vLyBDb21wb25lbnRzXG52YXIgU2ltaWxhcml0eUl0ZW1Db21wb25lbnQgPSBSZWFjdC5jcmVhdGVDbGFzcyh7ZGlzcGxheU5hbWU6ICdTaW1pbGFyaXR5SXRlbUNvbXBvbmVudCcsXG5cbiAgICBfZGVsZXRlT3BlcmF0aW9uOiBmdW5jdGlvbigpIHtcbiAgICAgICAgZmx1eC5kaXNwYXRjaCh7XG4gICAgICAgICAgICB0eXBlOiBFdmVudHMuREVMRVRFX09QRVJBVElPTixcbiAgICAgICAgICAgIG9wZXJhdGlvbjogdGhpcy5wcm9wcy5vcGVyYXRpb25cbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIHJlbmRlcjogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICBSZWFjdC5ET00udHIobnVsbCwgXG4gICAgICAgICAgICAgICAgUmVhY3QuRE9NLnRkKG51bGwsIHRoaXMucHJvcHMub3BlcmF0aW9uLmRhdGUudG9TdHJpbmcoKSksIFxuICAgICAgICAgICAgICAgIFJlYWN0LkRPTS50ZChudWxsLCB0aGlzLnByb3BzLm9wZXJhdGlvbi50aXRsZSksIFxuICAgICAgICAgICAgICAgIFJlYWN0LkRPTS50ZChudWxsLCB0aGlzLnByb3BzLm9wZXJhdGlvbi5hbW91bnQpLCBcbiAgICAgICAgICAgICAgICBSZWFjdC5ET00udGQobnVsbCwgUmVhY3QuRE9NLmEoe29uQ2xpY2s6IHRoaXMuX2RlbGV0ZU9wZXJhdGlvbn0sIFwieFwiKSlcbiAgICAgICAgICAgIClcbiAgICAgICAgKTtcbiAgICB9XG59KTtcblxudmFyIFNpbWlsYXJpdHlQYWlyQ29tcG9uZW50ID0gUmVhY3QuY3JlYXRlQ2xhc3Moe2Rpc3BsYXlOYW1lOiAnU2ltaWxhcml0eVBhaXJDb21wb25lbnQnLFxuXG4gICAgcmVuZGVyOiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIFJlYWN0LkRPTS50YWJsZShudWxsLCBcbiAgICAgICAgICAgICAgICBTaW1pbGFyaXR5SXRlbUNvbXBvbmVudCh7b3BlcmF0aW9uOiB0aGlzLnByb3BzLmF9KSwgXG4gICAgICAgICAgICAgICAgU2ltaWxhcml0eUl0ZW1Db21wb25lbnQoe29wZXJhdGlvbjogdGhpcy5wcm9wcy5ifSlcbiAgICAgICAgICAgIClcbiAgICAgICAgKTtcbiAgICB9XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBSZWFjdC5jcmVhdGVDbGFzcyh7ZGlzcGxheU5hbWU6ICdleHBvcnRzJyxcblxuICAgIGdldEluaXRpYWxTdGF0ZTogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBwYWlyczogW11cbiAgICAgICAgfTtcbiAgICB9LFxuXG4gICAgX2NiOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICBwYWlyczogZmluZFJlZHVuZGFudFBhaXJzKHN0b3JlLm9wZXJhdGlvbnMpXG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICBjb21wb25lbnREaWRNb3VudDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHN0b3JlLm9uKEV2ZW50cy5PUEVSQVRJT05TX0xPQURFRCwgdGhpcy5fY2IpO1xuICAgIH0sXG5cbiAgICBjb21wb25lbnRXaWxsVW5tb3VudDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHN0b3JlLnJlbW92ZUxpc3RlbmVyKEV2ZW50cy5PUEVSQVRJT05TX0xPQURFRCwgdGhpcy5fY2IpO1xuICAgIH0sXG5cbiAgICByZW5kZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgcGFpcnMgPSB0aGlzLnN0YXRlLnBhaXJzO1xuICAgICAgICBpZiAocGFpcnMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgICAgIFJlYWN0LkRPTS5kaXYobnVsbCwgXCJObyBzaW1pbGFyIG9wZXJhdGlvbnMgZm91bmQuXCIpXG4gICAgICAgICAgICApXG4gICAgICAgIH1cblxuICAgICAgICB2YXIgc2ltID0gcGFpcnMubWFwKGZ1bmN0aW9uIChwKSB7XG4gICAgICAgICAgICB2YXIga2V5ID0gcFswXS5pZC50b1N0cmluZygpICsgcFsxXS5pZC50b1N0cmluZygpO1xuICAgICAgICAgICAgcmV0dXJuIChTaW1pbGFyaXR5UGFpckNvbXBvbmVudCh7a2V5OiBrZXksIGE6IHBbMF0sIGI6IHBbMV19KSlcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICBSZWFjdC5ET00uZGl2KG51bGwsIFxuICAgICAgICAgICAgICAgIFJlYWN0LkRPTS5oMShudWxsLCBcIlNpbWlsYXJpdGllc1wiKSwgXG4gICAgICAgICAgICAgICAgUmVhY3QuRE9NLmRpdihudWxsLCBcbiAgICAgICAgICAgICAgICAgICAgc2ltXG4gICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgKSlcbiAgICB9XG59KTtcblxuIiwiLypcbiAqIENvcHlyaWdodCAoYykgMjAxNCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgQlNELXN0eWxlIGxpY2Vuc2UgZm91bmQgaW4gdGhlXG4gKiBMSUNFTlNFIGZpbGUgaW4gdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuIEFuIGFkZGl0aW9uYWwgZ3JhbnRcbiAqIG9mIHBhdGVudCByaWdodHMgY2FuIGJlIGZvdW5kIGluIHRoZSBQQVRFTlRTIGZpbGUgaW4gdGhlIHNhbWUgZGlyZWN0b3J5LlxuICpcbiAqIEBwcm92aWRlc01vZHVsZSBEaXNwYXRjaGVyXG4gKiBAdHlwZWNoZWNrc1xuICovXG5cblwidXNlIHN0cmljdFwiO1xuXG52YXIgaW52YXJpYW50ID0gcmVxdWlyZSgnLi9pbnZhcmlhbnQnKTtcblxudmFyIF9sYXN0SUQgPSAxO1xudmFyIF9wcmVmaXggPSAnSURfJztcblxuLyoqXG4gKiBEaXNwYXRjaGVyIGlzIHVzZWQgdG8gYnJvYWRjYXN0IHBheWxvYWRzIHRvIHJlZ2lzdGVyZWQgY2FsbGJhY2tzLiBUaGlzIGlzXG4gKiBkaWZmZXJlbnQgZnJvbSBnZW5lcmljIHB1Yi1zdWIgc3lzdGVtcyBpbiB0d28gd2F5czpcbiAqXG4gKiAgIDEpIENhbGxiYWNrcyBhcmUgbm90IHN1YnNjcmliZWQgdG8gcGFydGljdWxhciBldmVudHMuIEV2ZXJ5IHBheWxvYWQgaXNcbiAqICAgICAgZGlzcGF0Y2hlZCB0byBldmVyeSByZWdpc3RlcmVkIGNhbGxiYWNrLlxuICogICAyKSBDYWxsYmFja3MgY2FuIGJlIGRlZmVycmVkIGluIHdob2xlIG9yIHBhcnQgdW50aWwgb3RoZXIgY2FsbGJhY2tzIGhhdmVcbiAqICAgICAgYmVlbiBleGVjdXRlZC5cbiAqXG4gKiBGb3IgZXhhbXBsZSwgY29uc2lkZXIgdGhpcyBoeXBvdGhldGljYWwgZmxpZ2h0IGRlc3RpbmF0aW9uIGZvcm0sIHdoaWNoXG4gKiBzZWxlY3RzIGEgZGVmYXVsdCBjaXR5IHdoZW4gYSBjb3VudHJ5IGlzIHNlbGVjdGVkOlxuICpcbiAqICAgdmFyIGZsaWdodERpc3BhdGNoZXIgPSBuZXcgRGlzcGF0Y2hlcigpO1xuICpcbiAqICAgLy8gS2VlcHMgdHJhY2sgb2Ygd2hpY2ggY291bnRyeSBpcyBzZWxlY3RlZFxuICogICB2YXIgQ291bnRyeVN0b3JlID0ge2NvdW50cnk6IG51bGx9O1xuICpcbiAqICAgLy8gS2VlcHMgdHJhY2sgb2Ygd2hpY2ggY2l0eSBpcyBzZWxlY3RlZFxuICogICB2YXIgQ2l0eVN0b3JlID0ge2NpdHk6IG51bGx9O1xuICpcbiAqICAgLy8gS2VlcHMgdHJhY2sgb2YgdGhlIGJhc2UgZmxpZ2h0IHByaWNlIG9mIHRoZSBzZWxlY3RlZCBjaXR5XG4gKiAgIHZhciBGbGlnaHRQcmljZVN0b3JlID0ge3ByaWNlOiBudWxsfVxuICpcbiAqIFdoZW4gYSB1c2VyIGNoYW5nZXMgdGhlIHNlbGVjdGVkIGNpdHksIHdlIGRpc3BhdGNoIHRoZSBwYXlsb2FkOlxuICpcbiAqICAgZmxpZ2h0RGlzcGF0Y2hlci5kaXNwYXRjaCh7XG4gKiAgICAgYWN0aW9uVHlwZTogJ2NpdHktdXBkYXRlJyxcbiAqICAgICBzZWxlY3RlZENpdHk6ICdwYXJpcydcbiAqICAgfSk7XG4gKlxuICogVGhpcyBwYXlsb2FkIGlzIGRpZ2VzdGVkIGJ5IGBDaXR5U3RvcmVgOlxuICpcbiAqICAgZmxpZ2h0RGlzcGF0Y2hlci5yZWdpc3RlcihmdW5jdGlvbihwYXlsb2FkKSB7XG4gKiAgICAgaWYgKHBheWxvYWQuYWN0aW9uVHlwZSA9PT0gJ2NpdHktdXBkYXRlJykge1xuICogICAgICAgQ2l0eVN0b3JlLmNpdHkgPSBwYXlsb2FkLnNlbGVjdGVkQ2l0eTtcbiAqICAgICB9XG4gKiAgIH0pO1xuICpcbiAqIFdoZW4gdGhlIHVzZXIgc2VsZWN0cyBhIGNvdW50cnksIHdlIGRpc3BhdGNoIHRoZSBwYXlsb2FkOlxuICpcbiAqICAgZmxpZ2h0RGlzcGF0Y2hlci5kaXNwYXRjaCh7XG4gKiAgICAgYWN0aW9uVHlwZTogJ2NvdW50cnktdXBkYXRlJyxcbiAqICAgICBzZWxlY3RlZENvdW50cnk6ICdhdXN0cmFsaWEnXG4gKiAgIH0pO1xuICpcbiAqIFRoaXMgcGF5bG9hZCBpcyBkaWdlc3RlZCBieSBib3RoIHN0b3JlczpcbiAqXG4gKiAgICBDb3VudHJ5U3RvcmUuZGlzcGF0Y2hUb2tlbiA9IGZsaWdodERpc3BhdGNoZXIucmVnaXN0ZXIoZnVuY3Rpb24ocGF5bG9hZCkge1xuICogICAgIGlmIChwYXlsb2FkLmFjdGlvblR5cGUgPT09ICdjb3VudHJ5LXVwZGF0ZScpIHtcbiAqICAgICAgIENvdW50cnlTdG9yZS5jb3VudHJ5ID0gcGF5bG9hZC5zZWxlY3RlZENvdW50cnk7XG4gKiAgICAgfVxuICogICB9KTtcbiAqXG4gKiBXaGVuIHRoZSBjYWxsYmFjayB0byB1cGRhdGUgYENvdW50cnlTdG9yZWAgaXMgcmVnaXN0ZXJlZCwgd2Ugc2F2ZSBhIHJlZmVyZW5jZVxuICogdG8gdGhlIHJldHVybmVkIHRva2VuLiBVc2luZyB0aGlzIHRva2VuIHdpdGggYHdhaXRGb3IoKWAsIHdlIGNhbiBndWFyYW50ZWVcbiAqIHRoYXQgYENvdW50cnlTdG9yZWAgaXMgdXBkYXRlZCBiZWZvcmUgdGhlIGNhbGxiYWNrIHRoYXQgdXBkYXRlcyBgQ2l0eVN0b3JlYFxuICogbmVlZHMgdG8gcXVlcnkgaXRzIGRhdGEuXG4gKlxuICogICBDaXR5U3RvcmUuZGlzcGF0Y2hUb2tlbiA9IGZsaWdodERpc3BhdGNoZXIucmVnaXN0ZXIoZnVuY3Rpb24ocGF5bG9hZCkge1xuICogICAgIGlmIChwYXlsb2FkLmFjdGlvblR5cGUgPT09ICdjb3VudHJ5LXVwZGF0ZScpIHtcbiAqICAgICAgIC8vIGBDb3VudHJ5U3RvcmUuY291bnRyeWAgbWF5IG5vdCBiZSB1cGRhdGVkLlxuICogICAgICAgZmxpZ2h0RGlzcGF0Y2hlci53YWl0Rm9yKFtDb3VudHJ5U3RvcmUuZGlzcGF0Y2hUb2tlbl0pO1xuICogICAgICAgLy8gYENvdW50cnlTdG9yZS5jb3VudHJ5YCBpcyBub3cgZ3VhcmFudGVlZCB0byBiZSB1cGRhdGVkLlxuICpcbiAqICAgICAgIC8vIFNlbGVjdCB0aGUgZGVmYXVsdCBjaXR5IGZvciB0aGUgbmV3IGNvdW50cnlcbiAqICAgICAgIENpdHlTdG9yZS5jaXR5ID0gZ2V0RGVmYXVsdENpdHlGb3JDb3VudHJ5KENvdW50cnlTdG9yZS5jb3VudHJ5KTtcbiAqICAgICB9XG4gKiAgIH0pO1xuICpcbiAqIFRoZSB1c2FnZSBvZiBgd2FpdEZvcigpYCBjYW4gYmUgY2hhaW5lZCwgZm9yIGV4YW1wbGU6XG4gKlxuICogICBGbGlnaHRQcmljZVN0b3JlLmRpc3BhdGNoVG9rZW4gPVxuICogICAgIGZsaWdodERpc3BhdGNoZXIucmVnaXN0ZXIoZnVuY3Rpb24ocGF5bG9hZCkge1xuICogICAgICAgc3dpdGNoIChwYXlsb2FkLmFjdGlvblR5cGUpIHtcbiAqICAgICAgICAgY2FzZSAnY291bnRyeS11cGRhdGUnOlxuICogICAgICAgICAgIGZsaWdodERpc3BhdGNoZXIud2FpdEZvcihbQ2l0eVN0b3JlLmRpc3BhdGNoVG9rZW5dKTtcbiAqICAgICAgICAgICBGbGlnaHRQcmljZVN0b3JlLnByaWNlID1cbiAqICAgICAgICAgICAgIGdldEZsaWdodFByaWNlU3RvcmUoQ291bnRyeVN0b3JlLmNvdW50cnksIENpdHlTdG9yZS5jaXR5KTtcbiAqICAgICAgICAgICBicmVhaztcbiAqXG4gKiAgICAgICAgIGNhc2UgJ2NpdHktdXBkYXRlJzpcbiAqICAgICAgICAgICBGbGlnaHRQcmljZVN0b3JlLnByaWNlID1cbiAqICAgICAgICAgICAgIEZsaWdodFByaWNlU3RvcmUoQ291bnRyeVN0b3JlLmNvdW50cnksIENpdHlTdG9yZS5jaXR5KTtcbiAqICAgICAgICAgICBicmVhaztcbiAqICAgICB9XG4gKiAgIH0pO1xuICpcbiAqIFRoZSBgY291bnRyeS11cGRhdGVgIHBheWxvYWQgd2lsbCBiZSBndWFyYW50ZWVkIHRvIGludm9rZSB0aGUgc3RvcmVzJ1xuICogcmVnaXN0ZXJlZCBjYWxsYmFja3MgaW4gb3JkZXI6IGBDb3VudHJ5U3RvcmVgLCBgQ2l0eVN0b3JlYCwgdGhlblxuICogYEZsaWdodFByaWNlU3RvcmVgLlxuICovXG5cbiAgZnVuY3Rpb24gRGlzcGF0Y2hlcigpIHtcbiAgICB0aGlzLiREaXNwYXRjaGVyX2NhbGxiYWNrcyA9IHt9O1xuICAgIHRoaXMuJERpc3BhdGNoZXJfaXNQZW5kaW5nID0ge307XG4gICAgdGhpcy4kRGlzcGF0Y2hlcl9pc0hhbmRsZWQgPSB7fTtcbiAgICB0aGlzLiREaXNwYXRjaGVyX2lzRGlzcGF0Y2hpbmcgPSBmYWxzZTtcbiAgICB0aGlzLiREaXNwYXRjaGVyX3BlbmRpbmdQYXlsb2FkID0gbnVsbDtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZWdpc3RlcnMgYSBjYWxsYmFjayB0byBiZSBpbnZva2VkIHdpdGggZXZlcnkgZGlzcGF0Y2hlZCBwYXlsb2FkLiBSZXR1cm5zXG4gICAqIGEgdG9rZW4gdGhhdCBjYW4gYmUgdXNlZCB3aXRoIGB3YWl0Rm9yKClgLlxuICAgKlxuICAgKiBAcGFyYW0ge2Z1bmN0aW9ufSBjYWxsYmFja1xuICAgKiBAcmV0dXJuIHtzdHJpbmd9XG4gICAqL1xuICBEaXNwYXRjaGVyLnByb3RvdHlwZS5yZWdpc3Rlcj1mdW5jdGlvbihjYWxsYmFjaykge1xuICAgIHZhciBpZCA9IF9wcmVmaXggKyBfbGFzdElEKys7XG4gICAgdGhpcy4kRGlzcGF0Y2hlcl9jYWxsYmFja3NbaWRdID0gY2FsbGJhY2s7XG4gICAgcmV0dXJuIGlkO1xuICB9O1xuXG4gIC8qKlxuICAgKiBSZW1vdmVzIGEgY2FsbGJhY2sgYmFzZWQgb24gaXRzIHRva2VuLlxuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gaWRcbiAgICovXG4gIERpc3BhdGNoZXIucHJvdG90eXBlLnVucmVnaXN0ZXI9ZnVuY3Rpb24oaWQpIHtcbiAgICBpbnZhcmlhbnQoXG4gICAgICB0aGlzLiREaXNwYXRjaGVyX2NhbGxiYWNrc1tpZF0sXG4gICAgICAnRGlzcGF0Y2hlci51bnJlZ2lzdGVyKC4uLik6IGAlc2AgZG9lcyBub3QgbWFwIHRvIGEgcmVnaXN0ZXJlZCBjYWxsYmFjay4nLFxuICAgICAgaWRcbiAgICApO1xuICAgIGRlbGV0ZSB0aGlzLiREaXNwYXRjaGVyX2NhbGxiYWNrc1tpZF07XG4gIH07XG5cbiAgLyoqXG4gICAqIFdhaXRzIGZvciB0aGUgY2FsbGJhY2tzIHNwZWNpZmllZCB0byBiZSBpbnZva2VkIGJlZm9yZSBjb250aW51aW5nIGV4ZWN1dGlvblxuICAgKiBvZiB0aGUgY3VycmVudCBjYWxsYmFjay4gVGhpcyBtZXRob2Qgc2hvdWxkIG9ubHkgYmUgdXNlZCBieSBhIGNhbGxiYWNrIGluXG4gICAqIHJlc3BvbnNlIHRvIGEgZGlzcGF0Y2hlZCBwYXlsb2FkLlxuICAgKlxuICAgKiBAcGFyYW0ge2FycmF5PHN0cmluZz59IGlkc1xuICAgKi9cbiAgRGlzcGF0Y2hlci5wcm90b3R5cGUud2FpdEZvcj1mdW5jdGlvbihpZHMpIHtcbiAgICBpbnZhcmlhbnQoXG4gICAgICB0aGlzLiREaXNwYXRjaGVyX2lzRGlzcGF0Y2hpbmcsXG4gICAgICAnRGlzcGF0Y2hlci53YWl0Rm9yKC4uLik6IE11c3QgYmUgaW52b2tlZCB3aGlsZSBkaXNwYXRjaGluZy4nXG4gICAgKTtcbiAgICBmb3IgKHZhciBpaSA9IDA7IGlpIDwgaWRzLmxlbmd0aDsgaWkrKykge1xuICAgICAgdmFyIGlkID0gaWRzW2lpXTtcbiAgICAgIGlmICh0aGlzLiREaXNwYXRjaGVyX2lzUGVuZGluZ1tpZF0pIHtcbiAgICAgICAgaW52YXJpYW50KFxuICAgICAgICAgIHRoaXMuJERpc3BhdGNoZXJfaXNIYW5kbGVkW2lkXSxcbiAgICAgICAgICAnRGlzcGF0Y2hlci53YWl0Rm9yKC4uLik6IENpcmN1bGFyIGRlcGVuZGVuY3kgZGV0ZWN0ZWQgd2hpbGUgJyArXG4gICAgICAgICAgJ3dhaXRpbmcgZm9yIGAlc2AuJyxcbiAgICAgICAgICBpZFxuICAgICAgICApO1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cbiAgICAgIGludmFyaWFudChcbiAgICAgICAgdGhpcy4kRGlzcGF0Y2hlcl9jYWxsYmFja3NbaWRdLFxuICAgICAgICAnRGlzcGF0Y2hlci53YWl0Rm9yKC4uLik6IGAlc2AgZG9lcyBub3QgbWFwIHRvIGEgcmVnaXN0ZXJlZCBjYWxsYmFjay4nLFxuICAgICAgICBpZFxuICAgICAgKTtcbiAgICAgIHRoaXMuJERpc3BhdGNoZXJfaW52b2tlQ2FsbGJhY2soaWQpO1xuICAgIH1cbiAgfTtcblxuICAvKipcbiAgICogRGlzcGF0Y2hlcyBhIHBheWxvYWQgdG8gYWxsIHJlZ2lzdGVyZWQgY2FsbGJhY2tzLlxuICAgKlxuICAgKiBAcGFyYW0ge29iamVjdH0gcGF5bG9hZFxuICAgKi9cbiAgRGlzcGF0Y2hlci5wcm90b3R5cGUuZGlzcGF0Y2g9ZnVuY3Rpb24ocGF5bG9hZCkge1xuICAgIGludmFyaWFudChcbiAgICAgICF0aGlzLiREaXNwYXRjaGVyX2lzRGlzcGF0Y2hpbmcsXG4gICAgICAnRGlzcGF0Y2guZGlzcGF0Y2goLi4uKTogQ2Fubm90IGRpc3BhdGNoIGluIHRoZSBtaWRkbGUgb2YgYSBkaXNwYXRjaC4nXG4gICAgKTtcbiAgICB0aGlzLiREaXNwYXRjaGVyX3N0YXJ0RGlzcGF0Y2hpbmcocGF5bG9hZCk7XG4gICAgdHJ5IHtcbiAgICAgIGZvciAodmFyIGlkIGluIHRoaXMuJERpc3BhdGNoZXJfY2FsbGJhY2tzKSB7XG4gICAgICAgIGlmICh0aGlzLiREaXNwYXRjaGVyX2lzUGVuZGluZ1tpZF0pIHtcbiAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLiREaXNwYXRjaGVyX2ludm9rZUNhbGxiYWNrKGlkKTtcbiAgICAgIH1cbiAgICB9IGZpbmFsbHkge1xuICAgICAgdGhpcy4kRGlzcGF0Y2hlcl9zdG9wRGlzcGF0Y2hpbmcoKTtcbiAgICB9XG4gIH07XG5cbiAgLyoqXG4gICAqIElzIHRoaXMgRGlzcGF0Y2hlciBjdXJyZW50bHkgZGlzcGF0Y2hpbmcuXG4gICAqXG4gICAqIEByZXR1cm4ge2Jvb2xlYW59XG4gICAqL1xuICBEaXNwYXRjaGVyLnByb3RvdHlwZS5pc0Rpc3BhdGNoaW5nPWZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLiREaXNwYXRjaGVyX2lzRGlzcGF0Y2hpbmc7XG4gIH07XG5cbiAgLyoqXG4gICAqIENhbGwgdGhlIGNhbGxiYWNrIHN0b3JlZCB3aXRoIHRoZSBnaXZlbiBpZC4gQWxzbyBkbyBzb21lIGludGVybmFsXG4gICAqIGJvb2trZWVwaW5nLlxuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gaWRcbiAgICogQGludGVybmFsXG4gICAqL1xuICBEaXNwYXRjaGVyLnByb3RvdHlwZS4kRGlzcGF0Y2hlcl9pbnZva2VDYWxsYmFjaz1mdW5jdGlvbihpZCkge1xuICAgIHRoaXMuJERpc3BhdGNoZXJfaXNQZW5kaW5nW2lkXSA9IHRydWU7XG4gICAgdGhpcy4kRGlzcGF0Y2hlcl9jYWxsYmFja3NbaWRdKHRoaXMuJERpc3BhdGNoZXJfcGVuZGluZ1BheWxvYWQpO1xuICAgIHRoaXMuJERpc3BhdGNoZXJfaXNIYW5kbGVkW2lkXSA9IHRydWU7XG4gIH07XG5cbiAgLyoqXG4gICAqIFNldCB1cCBib29ra2VlcGluZyBuZWVkZWQgd2hlbiBkaXNwYXRjaGluZy5cbiAgICpcbiAgICogQHBhcmFtIHtvYmplY3R9IHBheWxvYWRcbiAgICogQGludGVybmFsXG4gICAqL1xuICBEaXNwYXRjaGVyLnByb3RvdHlwZS4kRGlzcGF0Y2hlcl9zdGFydERpc3BhdGNoaW5nPWZ1bmN0aW9uKHBheWxvYWQpIHtcbiAgICBmb3IgKHZhciBpZCBpbiB0aGlzLiREaXNwYXRjaGVyX2NhbGxiYWNrcykge1xuICAgICAgdGhpcy4kRGlzcGF0Y2hlcl9pc1BlbmRpbmdbaWRdID0gZmFsc2U7XG4gICAgICB0aGlzLiREaXNwYXRjaGVyX2lzSGFuZGxlZFtpZF0gPSBmYWxzZTtcbiAgICB9XG4gICAgdGhpcy4kRGlzcGF0Y2hlcl9wZW5kaW5nUGF5bG9hZCA9IHBheWxvYWQ7XG4gICAgdGhpcy4kRGlzcGF0Y2hlcl9pc0Rpc3BhdGNoaW5nID0gdHJ1ZTtcbiAgfTtcblxuICAvKipcbiAgICogQ2xlYXIgYm9va2tlZXBpbmcgdXNlZCBmb3IgZGlzcGF0Y2hpbmcuXG4gICAqXG4gICAqIEBpbnRlcm5hbFxuICAgKi9cbiAgRGlzcGF0Y2hlci5wcm90b3R5cGUuJERpc3BhdGNoZXJfc3RvcERpc3BhdGNoaW5nPWZ1bmN0aW9uKCkge1xuICAgIHRoaXMuJERpc3BhdGNoZXJfcGVuZGluZ1BheWxvYWQgPSBudWxsO1xuICAgIHRoaXMuJERpc3BhdGNoZXJfaXNEaXNwYXRjaGluZyA9IGZhbHNlO1xuICB9O1xuXG5cbm1vZHVsZS5leHBvcnRzID0gbmV3IERpc3BhdGNoZXI7XG4iLCIvKipcbiAqIENvcHlyaWdodCAoYykgMjAxNCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgQlNELXN0eWxlIGxpY2Vuc2UgZm91bmQgaW4gdGhlXG4gKiBMSUNFTlNFIGZpbGUgaW4gdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuIEFuIGFkZGl0aW9uYWwgZ3JhbnRcbiAqIG9mIHBhdGVudCByaWdodHMgY2FuIGJlIGZvdW5kIGluIHRoZSBQQVRFTlRTIGZpbGUgaW4gdGhlIHNhbWUgZGlyZWN0b3J5LlxuICpcbiAqIEBwcm92aWRlc01vZHVsZSBpbnZhcmlhbnRcbiAqL1xuXG5cInVzZSBzdHJpY3RcIjtcblxuLyoqXG4gKiBVc2UgaW52YXJpYW50KCkgdG8gYXNzZXJ0IHN0YXRlIHdoaWNoIHlvdXIgcHJvZ3JhbSBhc3N1bWVzIHRvIGJlIHRydWUuXG4gKlxuICogUHJvdmlkZSBzcHJpbnRmLXN0eWxlIGZvcm1hdCAob25seSAlcyBpcyBzdXBwb3J0ZWQpIGFuZCBhcmd1bWVudHNcbiAqIHRvIHByb3ZpZGUgaW5mb3JtYXRpb24gYWJvdXQgd2hhdCBicm9rZSBhbmQgd2hhdCB5b3Ugd2VyZVxuICogZXhwZWN0aW5nLlxuICpcbiAqIFRoZSBpbnZhcmlhbnQgbWVzc2FnZSB3aWxsIGJlIHN0cmlwcGVkIGluIHByb2R1Y3Rpb24sIGJ1dCB0aGUgaW52YXJpYW50XG4gKiB3aWxsIHJlbWFpbiB0byBlbnN1cmUgbG9naWMgZG9lcyBub3QgZGlmZmVyIGluIHByb2R1Y3Rpb24uXG4gKi9cblxudmFyIGludmFyaWFudCA9IGZ1bmN0aW9uKGNvbmRpdGlvbiwgZm9ybWF0LCBhLCBiLCBjLCBkLCBlLCBmKSB7XG4gIGlmICghY29uZGl0aW9uKSB7XG4gICAgdmFyIGVycm9yO1xuICAgIGlmIChmb3JtYXQgPT09IHVuZGVmaW5lZCkge1xuICAgICAgZXJyb3IgPSBuZXcgRXJyb3IoXG4gICAgICAgICdNaW5pZmllZCBleGNlcHRpb24gb2NjdXJyZWQ7IHVzZSB0aGUgbm9uLW1pbmlmaWVkIGRldiBlbnZpcm9ubWVudCAnICtcbiAgICAgICAgJ2ZvciB0aGUgZnVsbCBlcnJvciBtZXNzYWdlIGFuZCBhZGRpdGlvbmFsIGhlbHBmdWwgd2FybmluZ3MuJ1xuICAgICAgKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdmFyIGFyZ3MgPSBbYSwgYiwgYywgZCwgZSwgZl07XG4gICAgICB2YXIgYXJnSW5kZXggPSAwO1xuICAgICAgZXJyb3IgPSBuZXcgRXJyb3IoXG4gICAgICAgICdJbnZhcmlhbnQgVmlvbGF0aW9uOiAnICtcbiAgICAgICAgZm9ybWF0LnJlcGxhY2UoLyVzL2csIGZ1bmN0aW9uKCkgeyByZXR1cm4gYXJnc1thcmdJbmRleCsrXTsgfSlcbiAgICAgICk7XG4gICAgfVxuXG4gICAgZXJyb3IuZnJhbWVzVG9Qb3AgPSAxOyAvLyB3ZSBkb24ndCBjYXJlIGFib3V0IGludmFyaWFudCdzIG93biBmcmFtZVxuICAgIHRocm93IGVycm9yO1xuICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGludmFyaWFudDtcbiIsIi8qKiBAanN4IFJlYWN0LkRPTSAqL1xuXG4vLyBIZWxwZXJzXG52YXIgRXZlbnRzID0gcmVxdWlyZSgnLi9FdmVudHMnKTtcblxuLy8gQ2xhc3Nlc1xudmFyIEFjY291bnRMaXN0Q29tcG9uZW50ID0gcmVxdWlyZSgnLi9jb21wb25lbnRzL0FjY291bnRMaXN0Q29tcG9uZW50Jyk7XG52YXIgQmFua0xpc3RDb21wb25lbnQgPSByZXF1aXJlKCcuL2NvbXBvbmVudHMvQmFua0xpc3RDb21wb25lbnQnKTtcbnZhciBDYXRlZ29yeUNvbXBvbmVudCA9IHJlcXVpcmUoJy4vY29tcG9uZW50cy9DYXRlZ29yeUNvbXBvbmVudCcpO1xudmFyIENoYXJ0Q29tcG9uZW50ID0gcmVxdWlyZSgnLi9jb21wb25lbnRzL0NoYXJ0Q29tcG9uZW50Jyk7XG52YXIgT3BlcmF0aW9uTGlzdENvbXBvbmVudCA9IHJlcXVpcmUoJy4vY29tcG9uZW50cy9PcGVyYXRpb25MaXN0Q29tcG9uZW50Jyk7XG52YXIgU2ltaWxhcml0eUNvbXBvbmVudCA9IHJlcXVpcmUoJy4vY29tcG9uZW50cy9TaW1pbGFyaXR5Q29tcG9uZW50Jyk7XG5cbi8vIEdsb2JhbCB2YXJpYWJsZXNcbnZhciBzdG9yZSA9IHJlcXVpcmUoJy4vc3RvcmUnKTtcblxuLy8gTm93IHRoaXMgcmVhbGx5IGJlZ2lucy5cbnZhciBLcmVzdXMgPSBSZWFjdC5jcmVhdGVDbGFzcyh7ZGlzcGxheU5hbWU6ICdLcmVzdXMnLFxuXG4gICAgY29tcG9uZW50RGlkTW91bnQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAvLyBMZXQncyBnby5cbiAgICAgICAgc3RvcmUuZ2V0Q2F0ZWdvcmllcygpO1xuICAgICAgICBzdG9yZS5vbmNlKEV2ZW50cy5DQVRFR09SSUVTX0xPQURFRCwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBzdG9yZS5nZXRBbGxCYW5rcygpO1xuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgcmVuZGVyOiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIFJlYWN0LkRPTS5kaXYoe2NsYXNzTmFtZTogXCJyb3dcIn0sIFxuXG4gICAgICAgICAgICBSZWFjdC5ET00uZGl2KHtjbGFzc05hbWU6IFwicGFuZWwgc21hbGwtMiBjb2x1bW5zXCJ9LCBcbiAgICAgICAgICAgICAgICBCYW5rTGlzdENvbXBvbmVudChudWxsKSwgXG4gICAgICAgICAgICAgICAgQWNjb3VudExpc3RDb21wb25lbnQobnVsbClcbiAgICAgICAgICAgICksIFxuXG4gICAgICAgICAgICBSZWFjdC5ET00uZGl2KHtjbGFzc05hbWU6IFwic21hbGwtMTAgY29sdW1uc1wifSwgXG4gICAgICAgICAgICAgICAgUmVhY3QuRE9NLnVsKHtjbGFzc05hbWU6IFwidGFic1wiLCAnZGF0YS10YWInOiB0cnVlfSwgXG4gICAgICAgICAgICAgICAgICAgIFJlYWN0LkRPTS5saSh7Y2xhc3NOYW1lOiBcInRhYi10aXRsZSBhY3RpdmVcIn0sIFJlYWN0LkRPTS5hKHtocmVmOiBcIiNwYW5lbC1vcGVyYXRpb25zXCJ9LCBcIk9wZXJhdGlvbnNcIikpLCBcbiAgICAgICAgICAgICAgICAgICAgUmVhY3QuRE9NLmxpKHtjbGFzc05hbWU6IFwidGFiLXRpdGxlXCJ9LCBSZWFjdC5ET00uYSh7aHJlZjogXCIjcGFuZWwtY2hhcnRzXCJ9LCBcIkNoYXJ0c1wiKSksIFxuICAgICAgICAgICAgICAgICAgICBSZWFjdC5ET00ubGkoe2NsYXNzTmFtZTogXCJ0YWItdGl0bGVcIn0sIFJlYWN0LkRPTS5hKHtocmVmOiBcIiNwYW5lbC1zaW1pbGFyaXRpZXNcIn0sIFwiU2ltaWxhcml0aWVzXCIpKSwgXG4gICAgICAgICAgICAgICAgICAgIFJlYWN0LkRPTS5saSh7Y2xhc3NOYW1lOiBcInRhYi10aXRsZVwifSwgUmVhY3QuRE9NLmEoe2hyZWY6IFwiI3BhbmVsLWNhdGVnb3JpZXNcIn0sIFwiQ2F0ZWdvcmllc1wiKSlcbiAgICAgICAgICAgICAgICApLCBcblxuICAgICAgICAgICAgICAgIFJlYWN0LkRPTS5kaXYoe2NsYXNzTmFtZTogXCJ0YWJzLWNvbnRlbnRcIn0sIFxuXG4gICAgICAgICAgICAgICAgICAgIFJlYWN0LkRPTS5kaXYoe2NsYXNzTmFtZTogXCJjb250ZW50IGFjdGl2ZVwiLCBpZDogXCJwYW5lbC1vcGVyYXRpb25zXCJ9LCBcbiAgICAgICAgICAgICAgICAgICAgICAgIE9wZXJhdGlvbkxpc3RDb21wb25lbnQobnVsbClcbiAgICAgICAgICAgICAgICAgICAgKSwgXG5cbiAgICAgICAgICAgICAgICAgICAgUmVhY3QuRE9NLmRpdih7Y2xhc3NOYW1lOiBcImNvbnRlbnRcIiwgaWQ6IFwicGFuZWwtc2ltaWxhcml0aWVzXCJ9LCBcbiAgICAgICAgICAgICAgICAgICAgICAgIFNpbWlsYXJpdHlDb21wb25lbnQobnVsbClcbiAgICAgICAgICAgICAgICAgICAgKSwgXG5cbiAgICAgICAgICAgICAgICAgICAgUmVhY3QuRE9NLmRpdih7Y2xhc3NOYW1lOiBcImNvbnRlbnRcIiwgaWQ6IFwicGFuZWwtY2hhcnRzXCJ9LCBcbiAgICAgICAgICAgICAgICAgICAgICAgIENoYXJ0Q29tcG9uZW50KG51bGwpXG4gICAgICAgICAgICAgICAgICAgICksIFxuXG4gICAgICAgICAgICAgICAgICAgIFJlYWN0LkRPTS5kaXYoe2NsYXNzTmFtZTogXCJjb250ZW50XCIsIGlkOiBcInBhbmVsLWNhdGVnb3JpZXNcIn0sIFxuICAgICAgICAgICAgICAgICAgICAgICAgQ2F0ZWdvcnlDb21wb25lbnQobnVsbClcbiAgICAgICAgICAgICAgICAgICAgKVxuXG4gICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgKVxuXG4gICAgICAgICAgICApXG4gICAgICAgICk7XG4gICAgfVxufSk7XG5cblJlYWN0LnJlbmRlckNvbXBvbmVudChLcmVzdXMobnVsbCksIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNtYWluJykpO1xuIiwidmFyIEVFID0gcmVxdWlyZSgnZXZlbnRzJykuRXZlbnRFbWl0dGVyO1xudmFyIEV2ZW50cyA9IHJlcXVpcmUoJy4vRXZlbnRzJyk7XG5cbnZhciBIZWxwZXJzID0gcmVxdWlyZSgnLi9IZWxwZXJzJyk7XG52YXIgYXNzZXJ0ID0gSGVscGVycy5hc3NlcnQ7XG52YXIgZGVidWcgPSBIZWxwZXJzLmRlYnVnO1xudmFyIGhhcyA9IEhlbHBlcnMuaGFzO1xudmFyIHhockVycm9yID0gSGVscGVycy54aHJFcnJvcjtcblxudmFyIE1vZGVscyA9IHJlcXVpcmUoJy4vTW9kZWxzJyk7XG52YXIgQWNjb3VudCA9IE1vZGVscy5BY2NvdW50O1xudmFyIEJhbmsgPSBNb2RlbHMuQmFuaztcbnZhciBDYXRlZ29yeSA9IE1vZGVscy5DYXRlZ29yeTtcbnZhciBPcGVyYXRpb24gPSBNb2RlbHMuT3BlcmF0aW9uO1xuXG52YXIgZmx1eCA9IHJlcXVpcmUoJy4vZmx1eC9kaXNwYXRjaGVyJyk7XG5cbi8vIEhvbGRzIHRoZSBjdXJyZW50IGJhbmsgaW5mb3JtYXRpb25cbnZhciBzdG9yZSA9IG5ldyBFRTtcblxuc3RvcmUuYmFua3MgPSBbXTtcbnN0b3JlLmNhdGVnb3JpZXMgPSBbXTtcbnN0b3JlLmNhdGVnb3J5TGFiZWwgPSB7fTsgLy8gbWFwcyBjYXRlZ29yeSBpZHMgdG8gbGFiZWxzXG5cbnN0b3JlLmFjY291bnRzID0gW107ICAgIC8vIGZvciBhIGdpdmVuIGJhbmtcbnN0b3JlLm9wZXJhdGlvbnMgPSBbXTsgIC8vIGZvciBhIGdpdmVuIGFjY291bnRcblxuc3RvcmUuY3VycmVudEJhbmsgPSBudWxsO1xuc3RvcmUuY3VycmVudEFjY291bnQgPSBudWxsO1xuXG5zdG9yZS5nZXRBbGxCYW5rcyA9IGZ1bmN0aW9uKCkge1xuICAgICQuZ2V0KCdiYW5rcycsIHt3aXRoQWNjb3VudE9ubHk6dHJ1ZX0sIGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgICAgIHZhciBiYW5rcyA9IFtdXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZGF0YS5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgdmFyIGIgPSBuZXcgQmFuayhkYXRhW2ldKTtcbiAgICAgICAgICAgIGJhbmtzLnB1c2goYik7XG4gICAgICAgIH1cblxuICAgICAgICBmbHV4LmRpc3BhdGNoKHtcbiAgICAgICAgICAgIHR5cGU6IEV2ZW50cy5CQU5LX0xJU1RfTE9BREVELFxuICAgICAgICAgICAgbGlzdDogYmFua3NcbiAgICAgICAgfSk7XG5cbiAgICAgICAgaWYgKGJhbmtzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIGZsdXguZGlzcGF0Y2goe1xuICAgICAgICAgICAgICAgIHR5cGU6IEV2ZW50cy5TRUxFQ1RFRF9CQU5LX0NIQU5HRUQsXG4gICAgICAgICAgICAgICAgYmFuazogYmFua3NbMF1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfSkuZmFpbCh4aHJFcnJvcik7XG59XG5cbnN0b3JlLmxvYWRBbGxBY2NvdW50cyA9IGZ1bmN0aW9uICgpIHtcbiAgICBoYXModGhpcywgJ2N1cnJlbnRCYW5rJyk7XG4gICAgYXNzZXJ0KHRoaXMuY3VycmVudEJhbmsgaW5zdGFuY2VvZiBCYW5rKTtcblxuICAgICQuZ2V0KCdiYW5rcy9nZXRBY2NvdW50cy8nICsgdGhpcy5jdXJyZW50QmFuay5pZCwgZnVuY3Rpb24gKGRhdGEpIHtcblxuICAgICAgICB2YXIgYWNjb3VudHMgPSBbXVxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGRhdGEubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGFjY291bnRzLnB1c2gobmV3IEFjY291bnQoZGF0YVtpXSkpO1xuICAgICAgICB9XG5cbiAgICAgICAgZmx1eC5kaXNwYXRjaCh7XG4gICAgICAgICAgICB0eXBlOiBFdmVudHMuQUNDT1VOVFNfTE9BREVELFxuICAgICAgICAgICAgYWNjb3VudHM6IGFjY291bnRzXG4gICAgICAgIH0pO1xuXG4gICAgICAgIGlmIChhY2NvdW50cy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICBmbHV4LmRpc3BhdGNoKHtcbiAgICAgICAgICAgICAgICB0eXBlOiBFdmVudHMuU0VMRUNURURfQUNDT1VOVF9DSEFOR0VELFxuICAgICAgICAgICAgICAgIGFjY291bnQ6IGFjY291bnRzWzBdXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH0pLmZhaWwoeGhyRXJyb3IpO1xufVxuXG5zdG9yZS5sb2FkT3BlcmF0aW9uc0ZvciA9IGZ1bmN0aW9uKGFjY291bnQpIHtcbiAgICAkLmdldCgnYWNjb3VudHMvZ2V0T3BlcmF0aW9ucy8nICsgYWNjb3VudC5pZCwgZnVuY3Rpb24gKGRhdGEpIHtcbiAgICAgICAgdmFyIG9wZXJhdGlvbnMgPSBbXTtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBkYXRhLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICB2YXIgbyA9IG5ldyBPcGVyYXRpb24oZGF0YVtpXSlcbiAgICAgICAgICAgIG9wZXJhdGlvbnMucHVzaChvKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGZsdXguZGlzcGF0Y2goe1xuICAgICAgICAgICAgdHlwZTogRXZlbnRzLk9QRVJBVElPTlNfTE9BREVELFxuICAgICAgICAgICAgb3BlcmF0aW9uczogb3BlcmF0aW9uc1xuICAgICAgICB9KTtcbiAgICB9KS5mYWlsKHhockVycm9yKTtcbn07XG5cbnN0b3JlLmdldENhdGVnb3JpZXMgPSBmdW5jdGlvbigpIHtcbiAgICAkLmdldCgnY2F0ZWdvcmllcycsIGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgICAgIHZhciBjYXRlZ29yaWVzID0gW11cbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBkYXRhLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICB2YXIgYyA9IG5ldyBDYXRlZ29yeShkYXRhW2ldKTtcbiAgICAgICAgICAgIGNhdGVnb3JpZXMucHVzaChjKVxuICAgICAgICB9XG5cbiAgICAgICAgZmx1eC5kaXNwYXRjaCh7XG4gICAgICAgICAgICB0eXBlOiBFdmVudHMuQ0FURUdPUklFU19MT0FERUQsXG4gICAgICAgICAgICBjYXRlZ29yaWVzOiBjYXRlZ29yaWVzXG4gICAgICAgIH0pO1xuICAgIH0pLmZhaWwoeGhyRXJyb3IpO1xufTtcblxuc3RvcmUuYWRkQ2F0ZWdvcnkgPSBmdW5jdGlvbihjYXRlZ29yeSkge1xuICAgICQucG9zdCgnY2F0ZWdvcmllcycsIGNhdGVnb3J5LCBmdW5jdGlvbiAoZGF0YSkge1xuICAgICAgICBmbHV4LmRpc3BhdGNoKHtcbiAgICAgICAgICAgIHR5cGU6IEV2ZW50cy5DQVRFR09SWV9TQVZFRFxuICAgICAgICB9KTtcbiAgICB9KS5mYWlsKHhockVycm9yKTtcbn1cblxuc3RvcmUuY2F0ZWdvcnlUb0xhYmVsID0gZnVuY3Rpb24oaWQpIHtcbiAgICBhc3NlcnQodHlwZW9mIHRoaXMuY2F0ZWdvcnlMYWJlbFtpZF0gIT09ICd1bmRlZmluZWQnLFxuICAgICAgICAgICdjYXRlZ29yeVRvTGFiZWwgbG9va3VwIGZhaWxlZCBmb3IgaWQ6ICcgKyBpZCk7XG4gICAgcmV0dXJuIHRoaXMuY2F0ZWdvcnlMYWJlbFtpZF07XG59XG5cbnN0b3JlLnNldENhdGVnb3JpZXMgPSBmdW5jdGlvbihjYXQpIHtcbiAgICB0aGlzLmNhdGVnb3JpZXMgPSBbbmV3IENhdGVnb3J5KHtpZDogJy0xJywgdGl0bGU6ICdOb25lJ30pXS5jb25jYXQoY2F0KTtcbiAgICB0aGlzLmNhdGVnb3J5TGFiZWwgPSB7fTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuY2F0ZWdvcmllcy5sZW5ndGg7IGkrKykge1xuICAgICAgICB2YXIgYyA9IHRoaXMuY2F0ZWdvcmllc1tpXTtcbiAgICAgICAgaGFzKGMsICdpZCcpO1xuICAgICAgICBoYXMoYywgJ3RpdGxlJyk7XG4gICAgICAgIHRoaXMuY2F0ZWdvcnlMYWJlbFtjLmlkXSA9IGMudGl0bGU7XG4gICAgfVxufVxuXG5zdG9yZS51cGRhdGVDYXRlZ29yeUZvck9wZXJhdGlvbiA9IGZ1bmN0aW9uKG9wZXJhdGlvbklkLCBjYXRlZ29yeUlkKSB7XG4gICAgJC5hamF4KHtcbiAgICAgICAgdXJsOidvcGVyYXRpb25zLycgKyBvcGVyYXRpb25JZCxcbiAgICAgICAgdHlwZTogJ1BVVCcsXG4gICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgIGNhdGVnb3J5SWQ6IGNhdGVnb3J5SWRcbiAgICAgICAgfSxcbiAgICAgICAgc3VjY2VzczogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgZmx1eC5kaXNwYXRjaCh7XG4gICAgICAgICAgICAgICAgdHlwZTogRXZlbnRzLk9QRVJBVElPTl9DQVRFR09SWV9TQVZFRFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sXG4gICAgICAgIGVycm9yOiB4aHJFcnJvclxuICAgIH0pO1xufVxuXG5zdG9yZS5kZWxldGVPcGVyYXRpb24gPSBmdW5jdGlvbihvcGVyYXRpb24pIHtcbiAgICBhc3NlcnQob3BlcmF0aW9uIGluc3RhbmNlb2YgT3BlcmF0aW9uKTtcbiAgICAkLmFqYXgoe1xuICAgICAgICB1cmw6ICdvcGVyYXRpb25zLycgKyBvcGVyYXRpb24uaWQsXG4gICAgICAgIHR5cGU6ICdERUxFVEUnLFxuICAgICAgICBzdWNjZXNzOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGZsdXguZGlzcGF0Y2goe1xuICAgICAgICAgICAgICAgIHR5cGU6IEV2ZW50cy5ERUxFVEVEX09QRVJBVElPTlxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sXG4gICAgICAgIGVycm9yOiB4aHJFcnJvclxuICAgIH0pO1xufVxuXG5mbHV4LnJlZ2lzdGVyKGZ1bmN0aW9uKGFjdGlvbikge1xuICAgIHN3aXRjaCAoYWN0aW9uLnR5cGUpIHtcblxuICAgICAgY2FzZSBFdmVudHMuQUNDT1VOVFNfTE9BREVEOlxuICAgICAgICBoYXMoYWN0aW9uLCAnYWNjb3VudHMnKTtcbiAgICAgICAgaWYgKGFjdGlvbi5hY2NvdW50cy5sZW5ndGggPiAwKVxuICAgICAgICAgICAgYXNzZXJ0KGFjdGlvbi5hY2NvdW50c1swXSBpbnN0YW5jZW9mIEFjY291bnQpO1xuICAgICAgICBzdG9yZS5hY2NvdW50cyA9IGFjdGlvbi5hY2NvdW50cztcbiAgICAgICAgc3RvcmUuZW1pdChFdmVudHMuQUNDT1VOVFNfTE9BREVEKTtcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGNhc2UgRXZlbnRzLkJBTktfTElTVF9MT0FERUQ6XG4gICAgICAgIGhhcyhhY3Rpb24sICdsaXN0Jyk7XG4gICAgICAgIHN0b3JlLmJhbmtzID0gYWN0aW9uLmxpc3Q7XG4gICAgICAgIHN0b3JlLmVtaXQoRXZlbnRzLkJBTktfTElTVF9MT0FERUQpO1xuICAgICAgICBicmVhaztcblxuICAgICAgY2FzZSBFdmVudHMuQ0FURUdPUklFU19MT0FERUQ6XG4gICAgICAgIGhhcyhhY3Rpb24sICdjYXRlZ29yaWVzJyk7XG4gICAgICAgIHN0b3JlLnNldENhdGVnb3JpZXMoYWN0aW9uLmNhdGVnb3JpZXMpO1xuICAgICAgICBzdG9yZS5lbWl0KEV2ZW50cy5DQVRFR09SSUVTX0xPQURFRCk7XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBjYXNlIEV2ZW50cy5DQVRFR09SWV9DUkVBVEVEOlxuICAgICAgICBoYXMoYWN0aW9uLCAnY2F0ZWdvcnknKTtcbiAgICAgICAgc3RvcmUuYWRkQ2F0ZWdvcnkoYWN0aW9uLmNhdGVnb3J5KTtcbiAgICAgICAgLy8gTm8gbmVlZCB0byBmb3J3YXJkXG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBjYXNlIEV2ZW50cy5DQVRFR09SWV9TQVZFRDpcbiAgICAgICAgc3RvcmUuZ2V0Q2F0ZWdvcmllcygpO1xuICAgICAgICAvLyBObyBuZWVkIHRvIGZvcndhcmRcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGNhc2UgRXZlbnRzLkRFTEVURV9PUEVSQVRJT046XG4gICAgICAgIGhhcyhhY3Rpb24sICdvcGVyYXRpb24nKTtcbiAgICAgICAgYXNzZXJ0KGFjdGlvbi5vcGVyYXRpb24gaW5zdGFuY2VvZiBPcGVyYXRpb24pO1xuICAgICAgICBzdG9yZS5kZWxldGVPcGVyYXRpb24oYWN0aW9uLm9wZXJhdGlvbik7XG4gICAgICAgIC8vIE5vIG5lZWQgdG8gZm9yd2FyZFxuICAgICAgICBicmVhaztcblxuICAgICAgY2FzZSBFdmVudHMuREVMRVRFRF9PUEVSQVRJT046XG4gICAgICAgIGFzc2VydCh0eXBlb2Ygc3RvcmUuY3VycmVudEFjY291bnQgIT09ICd1bmRlZmluZWQnKTtcbiAgICAgICAgc3RvcmUubG9hZE9wZXJhdGlvbnNGb3Ioc3RvcmUuY3VycmVudEFjY291bnQpO1xuICAgICAgICAvLyBObyBuZWVkIHRvIGZvcndhcmRcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGNhc2UgRXZlbnRzLk9QRVJBVElPTl9DQVRFR09SWV9DSEFOR0VEOlxuICAgICAgICBoYXMoYWN0aW9uLCAnb3BlcmF0aW9uSWQnKTtcbiAgICAgICAgaGFzKGFjdGlvbiwgJ2NhdGVnb3J5SWQnKTtcbiAgICAgICAgc3RvcmUudXBkYXRlQ2F0ZWdvcnlGb3JPcGVyYXRpb24oYWN0aW9uLm9wZXJhdGlvbklkLCBhY3Rpb24uY2F0ZWdvcnlJZCk7XG4gICAgICAgIC8vIE5vIG5lZWQgdG8gZm9yd2FyZFxuICAgICAgICBicmVhaztcblxuICAgICAgY2FzZSBFdmVudHMuT1BFUkFUSU9OX0NBVEVHT1JZX1NBVkVEOlxuICAgICAgICBzdG9yZS5lbWl0KEV2ZW50cy5PUEVSQVRJT05fQ0FURUdPUllfU0FWRUQpO1xuICAgICAgICBicmVhaztcblxuICAgICAgY2FzZSBFdmVudHMuT1BFUkFUSU9OU19MT0FERUQ6XG4gICAgICAgIGhhcyhhY3Rpb24sICdvcGVyYXRpb25zJyk7XG4gICAgICAgIGlmIChhY3Rpb24ub3BlcmF0aW9ucy5sZW5ndGggPiAwKVxuICAgICAgICAgICAgYXNzZXJ0KGFjdGlvbi5vcGVyYXRpb25zWzBdIGluc3RhbmNlb2YgT3BlcmF0aW9uKTtcbiAgICAgICAgc3RvcmUub3BlcmF0aW9ucyA9IGFjdGlvbi5vcGVyYXRpb25zO1xuICAgICAgICBzdG9yZS5lbWl0KEV2ZW50cy5PUEVSQVRJT05TX0xPQURFRCk7XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBjYXNlIEV2ZW50cy5TRUxFQ1RFRF9BQ0NPVU5UX0NIQU5HRUQ6XG4gICAgICAgIGhhcyhhY3Rpb24sICdhY2NvdW50Jyk7XG4gICAgICAgIGFzc2VydChhY3Rpb24uYWNjb3VudCBpbnN0YW5jZW9mIEFjY291bnQpO1xuICAgICAgICBzdG9yZS5jdXJyZW50QWNjb3VudCA9IGFjdGlvbi5hY2NvdW50O1xuICAgICAgICBzdG9yZS5sb2FkT3BlcmF0aW9uc0ZvcihhY3Rpb24uYWNjb3VudCk7XG4gICAgICAgIHN0b3JlLmVtaXQoRXZlbnRzLlNFTEVDVEVEX0FDQ09VTlRfQ0hBTkdFRCk7XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBjYXNlIEV2ZW50cy5TRUxFQ1RFRF9CQU5LX0NIQU5HRUQ6XG4gICAgICAgIGhhcyhhY3Rpb24sICdiYW5rJyk7XG4gICAgICAgIGFzc2VydChhY3Rpb24uYmFuayBpbnN0YW5jZW9mIEJhbmspO1xuICAgICAgICBzdG9yZS5jdXJyZW50QmFuayA9IGFjdGlvbi5iYW5rO1xuICAgICAgICBzdG9yZS5sb2FkQWxsQWNjb3VudHMoKTtcbiAgICAgICAgc3RvcmUuZW1pdChFdmVudHMuU0VMRUNURURfQkFOS19DSEFOR0VEKTtcbiAgICAgICAgYnJlYWs7XG5cbiAgICB9XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBzdG9yZTtcbiIsIi8vIENvcHlyaWdodCBKb3llbnQsIEluYy4gYW5kIG90aGVyIE5vZGUgY29udHJpYnV0b3JzLlxuLy9cbi8vIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhXG4vLyBjb3B5IG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlXG4vLyBcIlNvZnR3YXJlXCIpLCB0byBkZWFsIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmdcbi8vIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCxcbi8vIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXRcbi8vIHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXMgZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZVxuLy8gZm9sbG93aW5nIGNvbmRpdGlvbnM6XG4vL1xuLy8gVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWRcbi8vIGluIGFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuLy9cbi8vIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1Ncbi8vIE9SIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0Zcbi8vIE1FUkNIQU5UQUJJTElUWSwgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU5cbi8vIE5PIEVWRU5UIFNIQUxMIFRIRSBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLFxuLy8gREFNQUdFUyBPUiBPVEhFUiBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SXG4vLyBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSwgT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFXG4vLyBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU4gVEhFIFNPRlRXQVJFLlxuXG5mdW5jdGlvbiBFdmVudEVtaXR0ZXIoKSB7XG4gIHRoaXMuX2V2ZW50cyA9IHRoaXMuX2V2ZW50cyB8fCB7fTtcbiAgdGhpcy5fbWF4TGlzdGVuZXJzID0gdGhpcy5fbWF4TGlzdGVuZXJzIHx8IHVuZGVmaW5lZDtcbn1cbm1vZHVsZS5leHBvcnRzID0gRXZlbnRFbWl0dGVyO1xuXG4vLyBCYWNrd2FyZHMtY29tcGF0IHdpdGggbm9kZSAwLjEwLnhcbkV2ZW50RW1pdHRlci5FdmVudEVtaXR0ZXIgPSBFdmVudEVtaXR0ZXI7XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuX2V2ZW50cyA9IHVuZGVmaW5lZDtcbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuX21heExpc3RlbmVycyA9IHVuZGVmaW5lZDtcblxuLy8gQnkgZGVmYXVsdCBFdmVudEVtaXR0ZXJzIHdpbGwgcHJpbnQgYSB3YXJuaW5nIGlmIG1vcmUgdGhhbiAxMCBsaXN0ZW5lcnMgYXJlXG4vLyBhZGRlZCB0byBpdC4gVGhpcyBpcyBhIHVzZWZ1bCBkZWZhdWx0IHdoaWNoIGhlbHBzIGZpbmRpbmcgbWVtb3J5IGxlYWtzLlxuRXZlbnRFbWl0dGVyLmRlZmF1bHRNYXhMaXN0ZW5lcnMgPSAxMDtcblxuLy8gT2J2aW91c2x5IG5vdCBhbGwgRW1pdHRlcnMgc2hvdWxkIGJlIGxpbWl0ZWQgdG8gMTAuIFRoaXMgZnVuY3Rpb24gYWxsb3dzXG4vLyB0aGF0IHRvIGJlIGluY3JlYXNlZC4gU2V0IHRvIHplcm8gZm9yIHVubGltaXRlZC5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuc2V0TWF4TGlzdGVuZXJzID0gZnVuY3Rpb24obikge1xuICBpZiAoIWlzTnVtYmVyKG4pIHx8IG4gPCAwIHx8IGlzTmFOKG4pKVxuICAgIHRocm93IFR5cGVFcnJvcignbiBtdXN0IGJlIGEgcG9zaXRpdmUgbnVtYmVyJyk7XG4gIHRoaXMuX21heExpc3RlbmVycyA9IG47XG4gIHJldHVybiB0aGlzO1xufTtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5lbWl0ID0gZnVuY3Rpb24odHlwZSkge1xuICB2YXIgZXIsIGhhbmRsZXIsIGxlbiwgYXJncywgaSwgbGlzdGVuZXJzO1xuXG4gIGlmICghdGhpcy5fZXZlbnRzKVxuICAgIHRoaXMuX2V2ZW50cyA9IHt9O1xuXG4gIC8vIElmIHRoZXJlIGlzIG5vICdlcnJvcicgZXZlbnQgbGlzdGVuZXIgdGhlbiB0aHJvdy5cbiAgaWYgKHR5cGUgPT09ICdlcnJvcicpIHtcbiAgICBpZiAoIXRoaXMuX2V2ZW50cy5lcnJvciB8fFxuICAgICAgICAoaXNPYmplY3QodGhpcy5fZXZlbnRzLmVycm9yKSAmJiAhdGhpcy5fZXZlbnRzLmVycm9yLmxlbmd0aCkpIHtcbiAgICAgIGVyID0gYXJndW1lbnRzWzFdO1xuICAgICAgaWYgKGVyIGluc3RhbmNlb2YgRXJyb3IpIHtcbiAgICAgICAgdGhyb3cgZXI7IC8vIFVuaGFuZGxlZCAnZXJyb3InIGV2ZW50XG4gICAgICB9XG4gICAgICB0aHJvdyBUeXBlRXJyb3IoJ1VuY2F1Z2h0LCB1bnNwZWNpZmllZCBcImVycm9yXCIgZXZlbnQuJyk7XG4gICAgfVxuICB9XG5cbiAgaGFuZGxlciA9IHRoaXMuX2V2ZW50c1t0eXBlXTtcblxuICBpZiAoaXNVbmRlZmluZWQoaGFuZGxlcikpXG4gICAgcmV0dXJuIGZhbHNlO1xuXG4gIGlmIChpc0Z1bmN0aW9uKGhhbmRsZXIpKSB7XG4gICAgc3dpdGNoIChhcmd1bWVudHMubGVuZ3RoKSB7XG4gICAgICAvLyBmYXN0IGNhc2VzXG4gICAgICBjYXNlIDE6XG4gICAgICAgIGhhbmRsZXIuY2FsbCh0aGlzKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIDI6XG4gICAgICAgIGhhbmRsZXIuY2FsbCh0aGlzLCBhcmd1bWVudHNbMV0pO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgMzpcbiAgICAgICAgaGFuZGxlci5jYWxsKHRoaXMsIGFyZ3VtZW50c1sxXSwgYXJndW1lbnRzWzJdKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICAvLyBzbG93ZXJcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIGxlbiA9IGFyZ3VtZW50cy5sZW5ndGg7XG4gICAgICAgIGFyZ3MgPSBuZXcgQXJyYXkobGVuIC0gMSk7XG4gICAgICAgIGZvciAoaSA9IDE7IGkgPCBsZW47IGkrKylcbiAgICAgICAgICBhcmdzW2kgLSAxXSA9IGFyZ3VtZW50c1tpXTtcbiAgICAgICAgaGFuZGxlci5hcHBseSh0aGlzLCBhcmdzKTtcbiAgICB9XG4gIH0gZWxzZSBpZiAoaXNPYmplY3QoaGFuZGxlcikpIHtcbiAgICBsZW4gPSBhcmd1bWVudHMubGVuZ3RoO1xuICAgIGFyZ3MgPSBuZXcgQXJyYXkobGVuIC0gMSk7XG4gICAgZm9yIChpID0gMTsgaSA8IGxlbjsgaSsrKVxuICAgICAgYXJnc1tpIC0gMV0gPSBhcmd1bWVudHNbaV07XG5cbiAgICBsaXN0ZW5lcnMgPSBoYW5kbGVyLnNsaWNlKCk7XG4gICAgbGVuID0gbGlzdGVuZXJzLmxlbmd0aDtcbiAgICBmb3IgKGkgPSAwOyBpIDwgbGVuOyBpKyspXG4gICAgICBsaXN0ZW5lcnNbaV0uYXBwbHkodGhpcywgYXJncyk7XG4gIH1cblxuICByZXR1cm4gdHJ1ZTtcbn07XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuYWRkTGlzdGVuZXIgPSBmdW5jdGlvbih0eXBlLCBsaXN0ZW5lcikge1xuICB2YXIgbTtcblxuICBpZiAoIWlzRnVuY3Rpb24obGlzdGVuZXIpKVxuICAgIHRocm93IFR5cGVFcnJvcignbGlzdGVuZXIgbXVzdCBiZSBhIGZ1bmN0aW9uJyk7XG5cbiAgaWYgKCF0aGlzLl9ldmVudHMpXG4gICAgdGhpcy5fZXZlbnRzID0ge307XG5cbiAgLy8gVG8gYXZvaWQgcmVjdXJzaW9uIGluIHRoZSBjYXNlIHRoYXQgdHlwZSA9PT0gXCJuZXdMaXN0ZW5lclwiISBCZWZvcmVcbiAgLy8gYWRkaW5nIGl0IHRvIHRoZSBsaXN0ZW5lcnMsIGZpcnN0IGVtaXQgXCJuZXdMaXN0ZW5lclwiLlxuICBpZiAodGhpcy5fZXZlbnRzLm5ld0xpc3RlbmVyKVxuICAgIHRoaXMuZW1pdCgnbmV3TGlzdGVuZXInLCB0eXBlLFxuICAgICAgICAgICAgICBpc0Z1bmN0aW9uKGxpc3RlbmVyLmxpc3RlbmVyKSA/XG4gICAgICAgICAgICAgIGxpc3RlbmVyLmxpc3RlbmVyIDogbGlzdGVuZXIpO1xuXG4gIGlmICghdGhpcy5fZXZlbnRzW3R5cGVdKVxuICAgIC8vIE9wdGltaXplIHRoZSBjYXNlIG9mIG9uZSBsaXN0ZW5lci4gRG9uJ3QgbmVlZCB0aGUgZXh0cmEgYXJyYXkgb2JqZWN0LlxuICAgIHRoaXMuX2V2ZW50c1t0eXBlXSA9IGxpc3RlbmVyO1xuICBlbHNlIGlmIChpc09iamVjdCh0aGlzLl9ldmVudHNbdHlwZV0pKVxuICAgIC8vIElmIHdlJ3ZlIGFscmVhZHkgZ290IGFuIGFycmF5LCBqdXN0IGFwcGVuZC5cbiAgICB0aGlzLl9ldmVudHNbdHlwZV0ucHVzaChsaXN0ZW5lcik7XG4gIGVsc2VcbiAgICAvLyBBZGRpbmcgdGhlIHNlY29uZCBlbGVtZW50LCBuZWVkIHRvIGNoYW5nZSB0byBhcnJheS5cbiAgICB0aGlzLl9ldmVudHNbdHlwZV0gPSBbdGhpcy5fZXZlbnRzW3R5cGVdLCBsaXN0ZW5lcl07XG5cbiAgLy8gQ2hlY2sgZm9yIGxpc3RlbmVyIGxlYWtcbiAgaWYgKGlzT2JqZWN0KHRoaXMuX2V2ZW50c1t0eXBlXSkgJiYgIXRoaXMuX2V2ZW50c1t0eXBlXS53YXJuZWQpIHtcbiAgICB2YXIgbTtcbiAgICBpZiAoIWlzVW5kZWZpbmVkKHRoaXMuX21heExpc3RlbmVycykpIHtcbiAgICAgIG0gPSB0aGlzLl9tYXhMaXN0ZW5lcnM7XG4gICAgfSBlbHNlIHtcbiAgICAgIG0gPSBFdmVudEVtaXR0ZXIuZGVmYXVsdE1heExpc3RlbmVycztcbiAgICB9XG5cbiAgICBpZiAobSAmJiBtID4gMCAmJiB0aGlzLl9ldmVudHNbdHlwZV0ubGVuZ3RoID4gbSkge1xuICAgICAgdGhpcy5fZXZlbnRzW3R5cGVdLndhcm5lZCA9IHRydWU7XG4gICAgICBjb25zb2xlLmVycm9yKCcobm9kZSkgd2FybmluZzogcG9zc2libGUgRXZlbnRFbWl0dGVyIG1lbW9yeSAnICtcbiAgICAgICAgICAgICAgICAgICAgJ2xlYWsgZGV0ZWN0ZWQuICVkIGxpc3RlbmVycyBhZGRlZC4gJyArXG4gICAgICAgICAgICAgICAgICAgICdVc2UgZW1pdHRlci5zZXRNYXhMaXN0ZW5lcnMoKSB0byBpbmNyZWFzZSBsaW1pdC4nLFxuICAgICAgICAgICAgICAgICAgICB0aGlzLl9ldmVudHNbdHlwZV0ubGVuZ3RoKTtcbiAgICAgIGlmICh0eXBlb2YgY29uc29sZS50cmFjZSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAvLyBub3Qgc3VwcG9ydGVkIGluIElFIDEwXG4gICAgICAgIGNvbnNvbGUudHJhY2UoKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICByZXR1cm4gdGhpcztcbn07XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUub24gPSBFdmVudEVtaXR0ZXIucHJvdG90eXBlLmFkZExpc3RlbmVyO1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLm9uY2UgPSBmdW5jdGlvbih0eXBlLCBsaXN0ZW5lcikge1xuICBpZiAoIWlzRnVuY3Rpb24obGlzdGVuZXIpKVxuICAgIHRocm93IFR5cGVFcnJvcignbGlzdGVuZXIgbXVzdCBiZSBhIGZ1bmN0aW9uJyk7XG5cbiAgdmFyIGZpcmVkID0gZmFsc2U7XG5cbiAgZnVuY3Rpb24gZygpIHtcbiAgICB0aGlzLnJlbW92ZUxpc3RlbmVyKHR5cGUsIGcpO1xuXG4gICAgaWYgKCFmaXJlZCkge1xuICAgICAgZmlyZWQgPSB0cnVlO1xuICAgICAgbGlzdGVuZXIuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICB9XG4gIH1cblxuICBnLmxpc3RlbmVyID0gbGlzdGVuZXI7XG4gIHRoaXMub24odHlwZSwgZyk7XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vLyBlbWl0cyBhICdyZW1vdmVMaXN0ZW5lcicgZXZlbnQgaWZmIHRoZSBsaXN0ZW5lciB3YXMgcmVtb3ZlZFxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5yZW1vdmVMaXN0ZW5lciA9IGZ1bmN0aW9uKHR5cGUsIGxpc3RlbmVyKSB7XG4gIHZhciBsaXN0LCBwb3NpdGlvbiwgbGVuZ3RoLCBpO1xuXG4gIGlmICghaXNGdW5jdGlvbihsaXN0ZW5lcikpXG4gICAgdGhyb3cgVHlwZUVycm9yKCdsaXN0ZW5lciBtdXN0IGJlIGEgZnVuY3Rpb24nKTtcblxuICBpZiAoIXRoaXMuX2V2ZW50cyB8fCAhdGhpcy5fZXZlbnRzW3R5cGVdKVxuICAgIHJldHVybiB0aGlzO1xuXG4gIGxpc3QgPSB0aGlzLl9ldmVudHNbdHlwZV07XG4gIGxlbmd0aCA9IGxpc3QubGVuZ3RoO1xuICBwb3NpdGlvbiA9IC0xO1xuXG4gIGlmIChsaXN0ID09PSBsaXN0ZW5lciB8fFxuICAgICAgKGlzRnVuY3Rpb24obGlzdC5saXN0ZW5lcikgJiYgbGlzdC5saXN0ZW5lciA9PT0gbGlzdGVuZXIpKSB7XG4gICAgZGVsZXRlIHRoaXMuX2V2ZW50c1t0eXBlXTtcbiAgICBpZiAodGhpcy5fZXZlbnRzLnJlbW92ZUxpc3RlbmVyKVxuICAgICAgdGhpcy5lbWl0KCdyZW1vdmVMaXN0ZW5lcicsIHR5cGUsIGxpc3RlbmVyKTtcblxuICB9IGVsc2UgaWYgKGlzT2JqZWN0KGxpc3QpKSB7XG4gICAgZm9yIChpID0gbGVuZ3RoOyBpLS0gPiAwOykge1xuICAgICAgaWYgKGxpc3RbaV0gPT09IGxpc3RlbmVyIHx8XG4gICAgICAgICAgKGxpc3RbaV0ubGlzdGVuZXIgJiYgbGlzdFtpXS5saXN0ZW5lciA9PT0gbGlzdGVuZXIpKSB7XG4gICAgICAgIHBvc2l0aW9uID0gaTtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHBvc2l0aW9uIDwgMClcbiAgICAgIHJldHVybiB0aGlzO1xuXG4gICAgaWYgKGxpc3QubGVuZ3RoID09PSAxKSB7XG4gICAgICBsaXN0Lmxlbmd0aCA9IDA7XG4gICAgICBkZWxldGUgdGhpcy5fZXZlbnRzW3R5cGVdO1xuICAgIH0gZWxzZSB7XG4gICAgICBsaXN0LnNwbGljZShwb3NpdGlvbiwgMSk7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuX2V2ZW50cy5yZW1vdmVMaXN0ZW5lcilcbiAgICAgIHRoaXMuZW1pdCgncmVtb3ZlTGlzdGVuZXInLCB0eXBlLCBsaXN0ZW5lcik7XG4gIH1cblxuICByZXR1cm4gdGhpcztcbn07XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUucmVtb3ZlQWxsTGlzdGVuZXJzID0gZnVuY3Rpb24odHlwZSkge1xuICB2YXIga2V5LCBsaXN0ZW5lcnM7XG5cbiAgaWYgKCF0aGlzLl9ldmVudHMpXG4gICAgcmV0dXJuIHRoaXM7XG5cbiAgLy8gbm90IGxpc3RlbmluZyBmb3IgcmVtb3ZlTGlzdGVuZXIsIG5vIG5lZWQgdG8gZW1pdFxuICBpZiAoIXRoaXMuX2V2ZW50cy5yZW1vdmVMaXN0ZW5lcikge1xuICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAwKVxuICAgICAgdGhpcy5fZXZlbnRzID0ge307XG4gICAgZWxzZSBpZiAodGhpcy5fZXZlbnRzW3R5cGVdKVxuICAgICAgZGVsZXRlIHRoaXMuX2V2ZW50c1t0eXBlXTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8vIGVtaXQgcmVtb3ZlTGlzdGVuZXIgZm9yIGFsbCBsaXN0ZW5lcnMgb24gYWxsIGV2ZW50c1xuICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMCkge1xuICAgIGZvciAoa2V5IGluIHRoaXMuX2V2ZW50cykge1xuICAgICAgaWYgKGtleSA9PT0gJ3JlbW92ZUxpc3RlbmVyJykgY29udGludWU7XG4gICAgICB0aGlzLnJlbW92ZUFsbExpc3RlbmVycyhrZXkpO1xuICAgIH1cbiAgICB0aGlzLnJlbW92ZUFsbExpc3RlbmVycygncmVtb3ZlTGlzdGVuZXInKTtcbiAgICB0aGlzLl9ldmVudHMgPSB7fTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIGxpc3RlbmVycyA9IHRoaXMuX2V2ZW50c1t0eXBlXTtcblxuICBpZiAoaXNGdW5jdGlvbihsaXN0ZW5lcnMpKSB7XG4gICAgdGhpcy5yZW1vdmVMaXN0ZW5lcih0eXBlLCBsaXN0ZW5lcnMpO1xuICB9IGVsc2Uge1xuICAgIC8vIExJRk8gb3JkZXJcbiAgICB3aGlsZSAobGlzdGVuZXJzLmxlbmd0aClcbiAgICAgIHRoaXMucmVtb3ZlTGlzdGVuZXIodHlwZSwgbGlzdGVuZXJzW2xpc3RlbmVycy5sZW5ndGggLSAxXSk7XG4gIH1cbiAgZGVsZXRlIHRoaXMuX2V2ZW50c1t0eXBlXTtcblxuICByZXR1cm4gdGhpcztcbn07XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUubGlzdGVuZXJzID0gZnVuY3Rpb24odHlwZSkge1xuICB2YXIgcmV0O1xuICBpZiAoIXRoaXMuX2V2ZW50cyB8fCAhdGhpcy5fZXZlbnRzW3R5cGVdKVxuICAgIHJldCA9IFtdO1xuICBlbHNlIGlmIChpc0Z1bmN0aW9uKHRoaXMuX2V2ZW50c1t0eXBlXSkpXG4gICAgcmV0ID0gW3RoaXMuX2V2ZW50c1t0eXBlXV07XG4gIGVsc2VcbiAgICByZXQgPSB0aGlzLl9ldmVudHNbdHlwZV0uc2xpY2UoKTtcbiAgcmV0dXJuIHJldDtcbn07XG5cbkV2ZW50RW1pdHRlci5saXN0ZW5lckNvdW50ID0gZnVuY3Rpb24oZW1pdHRlciwgdHlwZSkge1xuICB2YXIgcmV0O1xuICBpZiAoIWVtaXR0ZXIuX2V2ZW50cyB8fCAhZW1pdHRlci5fZXZlbnRzW3R5cGVdKVxuICAgIHJldCA9IDA7XG4gIGVsc2UgaWYgKGlzRnVuY3Rpb24oZW1pdHRlci5fZXZlbnRzW3R5cGVdKSlcbiAgICByZXQgPSAxO1xuICBlbHNlXG4gICAgcmV0ID0gZW1pdHRlci5fZXZlbnRzW3R5cGVdLmxlbmd0aDtcbiAgcmV0dXJuIHJldDtcbn07XG5cbmZ1bmN0aW9uIGlzRnVuY3Rpb24oYXJnKSB7XG4gIHJldHVybiB0eXBlb2YgYXJnID09PSAnZnVuY3Rpb24nO1xufVxuXG5mdW5jdGlvbiBpc051bWJlcihhcmcpIHtcbiAgcmV0dXJuIHR5cGVvZiBhcmcgPT09ICdudW1iZXInO1xufVxuXG5mdW5jdGlvbiBpc09iamVjdChhcmcpIHtcbiAgcmV0dXJuIHR5cGVvZiBhcmcgPT09ICdvYmplY3QnICYmIGFyZyAhPT0gbnVsbDtcbn1cblxuZnVuY3Rpb24gaXNVbmRlZmluZWQoYXJnKSB7XG4gIHJldHVybiBhcmcgPT09IHZvaWQgMDtcbn1cbiJdfQ==
