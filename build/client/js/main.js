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
            React.DOM.li({className: "active"}, 
                React.DOM.span(null, 
                    React.DOM.a({onClick: this._onClick}, this.props.account.title)
                )
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
            React.DOM.div({className: "thr_div"}, 
                React.DOM.ul({className: "top"}, React.DOM.span({className: "topic"}, "Accounts"), 
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
            React.DOM.li({className: "active"}, React.DOM.span(null, React.DOM.a({onClick: this._onClick}, this.props.bank.name)))
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
            React.DOM.div({className: "sec_div"}, 
                React.DOM.ul({className: "top"}, React.DOM.span({className: "topic"}, "Banks"), 
                    banks
                )
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
        return { showDetails: false };
    },

    _toggleDetails: function(e) {
        this.setState({ showDetails: !this.state.showDetails});
    },

    render: function() {
        var op = this.props.operation;

        var maybeDetails, maybeActive;
        if (this.state.showDetails) {
            maybeDetails = React.DOM.li({className: "detail"}, React.DOM.b(null, "Details: "), op.raw);
            maybeActive = "toggle-btn active";
        } else {
            maybeDetails = "";
            maybeActive = "toggle-btn";
        }

        return (
            React.DOM.ul({className: "table-row clearfix"}, 
                React.DOM.li(null, React.DOM.a({className: maybeActive, onClick: this._toggleDetails})), 
                React.DOM.li(null, op.date.toLocaleDateString()), 
                React.DOM.li(null, op.title), 
                React.DOM.li(null, op.amount), 
                React.DOM.li(null, CategorySelectComponent({operation: op})), 
                maybeDetails
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

    FilterOperationsThisMonth: function(operations) {
        return operations.filter(function(op) {
            var d = new Date(op.date);
            var now = new Date();
            return d.getFullYear() == now.getFullYear() && d.getMonth() == now.getMonth()
        });
    },

    getPositive: function() {
        var total = this.FilterOperationsThisMonth(this.state.operations)
                        .reduce(function(a,b) { return a + (b.amount > 0) ? b.amount : 0}, 0);
        return (total * 100 | 0) / 100;
    },

    getNegative: function() {
        var total = this.FilterOperationsThisMonth(this.state.operations)
                        .reduce(function(a,b) { return a + (b.amount < 0) ? -b.amount : 0}, 0);
        return (total * 100 | 0) / 100;
    },

    getDiff: function() {
        var total = this.FilterOperationsThisMonth(this.state.operations)
                        .reduce(function(a,b) { return a + b.amount} , 0);
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

        // TODO no inline style
        var tableFooterStyle = {
            "bottom": 0,
            "margin-left": 0
        };

        // TODO pagination:
        // let k the number of elements to show by page,
        // let n the total number of elements.
        // There are Ceil(n/k) pages.
        // q-th page (starting at 1) shows elements from [(q-1)k, Min(qk-1, n)]

        return (
            React.DOM.div(null, 
                React.DOM.div({className: "price-block clearfix"}, 
                    React.DOM.ul({className: "main_amt"}, 
                        React.DOM.li({className: "mar_li org"}, 
                            React.DOM.span({className: "amt_big"}, this.getTotal(), " €"), React.DOM.br(null), 
                            React.DOM.span({className: "sub1 "}, "Total amount"), React.DOM.br(null), 
                            React.DOM.span({className: "sub2"}, "today")
                        ), 
                        React.DOM.li({className: "mar_li gr"}, 
                            React.DOM.span({className: "amt_big"}, this.getPositive(), " €"), React.DOM.br(null), 
                            React.DOM.span({className: "sub1 "}, "Ins"), React.DOM.br(null), 
                            React.DOM.span({className: "sub2"}, "this month")
                        ), 
                        React.DOM.li({className: "mar_li lblu"}, 
                            React.DOM.span({className: "amt_big"}, this.getNegative(), " €"), React.DOM.br(null), 
                            React.DOM.span({className: "sub1 "}, "Outs"), React.DOM.br(null), 
                            React.DOM.span({className: "sub2"}, "this month")
                        ), 
                        React.DOM.li({className: "dblu"}, 
                            React.DOM.span({className: "amt_big"}, this.getDiff(), " €"), React.DOM.br(null), 
                            React.DOM.span({className: "sub1 "}, "Difference"), React.DOM.br(null), 
                            React.DOM.span({className: "sub2"}, "this month")
                        )
                    )
                ), 

                React.DOM.div({className: "operation-block"}, 
                    React.DOM.div({className: "title text-uppercase"}, "operation"), 
                    React.DOM.div({className: "operation"}, 

                        React.DOM.div({className: "operation-top clearfix"}, 
                            React.DOM.div({className: "record-per-page pull-left"}, 
                                React.DOM.select({className: "form-control pull-left"}, 
                                    React.DOM.option(null, "5"), 
                                    React.DOM.option(null, "10"), 
                                    React.DOM.option(null, "20"), 
                                    React.DOM.option(null, "50")
                                ), 
                                React.DOM.span({className: "pull-left"}, "record per page")
                            )
                        ), 

                        React.DOM.div({className: "operation-table"}, 
                            React.DOM.ul({className: "table-header clearfix"}, 
                                React.DOM.li(null), 
                                React.DOM.li(null, "DATE ", React.DOM.a({className: "pull-right", href: ""}, React.DOM.span(null, "▴"))), 
                                React.DOM.li(null, "OPERATION ", React.DOM.a({className: "pull-right", href: ""}, React.DOM.span(null, "▴"))), 
                                React.DOM.li(null, "AMOUNT ", React.DOM.a({className: "pull-right up-n-down", href: ""}, React.DOM.span(null, "▴"), React.DOM.span(null, "▾"))), 
                                React.DOM.li(null, "CATEGORY ", React.DOM.a({className: "pull-right up-n-down", href: ""}, React.DOM.span(null, "▴"), React.DOM.span(null, "▾")))
                            ), 
                            ops
                        ), 

                        React.DOM.div({className: "clearfix table-footer"}, 
                            React.DOM.div({className: "rig_cont pull-left"}, "Showing 1 to 10 of 57 entries "), 

                            React.DOM.div({className: "pull-right", style: tableFooterStyle}, 
                                React.DOM.nav({className: "my_nav"}, 
                                    React.DOM.ul({className: "pagination my_pag"}, 
                                        React.DOM.li({className: "previous"}, React.DOM.a({href: "#"}, React.DOM.span({'aria-hidden': "true"}, "←"), " Previous")), 
                                        React.DOM.li({className: "active"}, React.DOM.a({href: "#"}, "1 ")), 
                                        React.DOM.li(null, React.DOM.a({href: "#"}, "2 ")), 
                                        React.DOM.li(null, React.DOM.a({href: "#"}, "3 ")), 
                                        React.DOM.li(null, React.DOM.a({href: "#"}, "4 ")), 
                                        React.DOM.li(null, React.DOM.a({href: "#"}, "5 ")), 
                                        React.DOM.li({className: "next"}, React.DOM.a({href: "#"}, "Next ", React.DOM.span({'aria-hidden': "true"}, "→")))
                                    )
                                )
                            )
                        )
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

    getInitialState: function() {
        return {
            showing: 'reports'
        }
    },

    componentDidMount: function() {
        // Let's go.
        store.getCategories();
        store.once(Events.CATEGORIES_LOADED, function() {
            store.getAllBanks();
        });
    },

    _show: function(name) {
        return function() {
            this.setState({ showing: name });
        }.bind(this);
    },

    render: function() {

        var mainComponent;
        switch(this.state.showing) {
            case "reports":
                mainComponent = OperationListComponent(null)
                break;
            case "charts":
                mainComponent = ChartComponent(null)
                break;
            case "categories":
                mainComponent = CategoryComponent(null)
                break;
            case "similarities":
                mainComponent = SimilarityComponent(null)
                break;
            case "settings":
                // TODO
                alert('NYI, showing operations list instead');
                mainComponent = OperationListComponent(null)
                break;
            default:
                alert('unknown component to render: '  + this.state.showing + '!');
                break;
        }

        return (
        React.DOM.div(null, 
            React.DOM.div({className: "side-bar pull-left"}, 
                React.DOM.div({className: "logo sidebar_light"}, 
                    React.DOM.a({href: "#"}, "KRESUS")
                ), 

                React.DOM.div({className: "fir_div"}, 
                    React.DOM.ul({className: "bor_li"}, 
                        React.DOM.li({className: "active", onClick: this._show('reports')}, 
                            React.DOM.span({className: "rep li_st"}, " "), "Report"
                        ), 
                        React.DOM.li({className: "", onClick: this._show('charts')}, 
                            React.DOM.span({className: "chr li_st"}, " "), "Charts"
                        ), 
                        React.DOM.li({className: "", onClick: this._show('categories')}, 
                            React.DOM.span({className: "cat li_st"}, " "), "Categories"
                        ), 
                        React.DOM.li({className: "", onClick: this._show('similarities')}, 
                            React.DOM.span({className: "sim li_st"}, " "), "Similarities"
                        ), 
                        React.DOM.li({className: "", onClick: this._show('settings')}, 
                            React.DOM.span({className: "set li_st"}, " "), "Settings"
                        )
                    )
                ), 

                React.DOM.div({className: "bank_div"}, 
                    React.DOM.ul({className: "bor_li_bnk"}, 
                        React.DOM.li(null, React.DOM.span({className: "bank sec_st"}, " "), "Banks")
                    )
                ), 

                BankListComponent(null), 
                AccountListComponent(null)
            ), 

            React.DOM.div({className: "main-block pull-right"}, 
                React.DOM.div({className: "main-container"}, 

                    mainComponent

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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2Jlbi9jb2RlL2NvenkvZGV2L2tyZXN1cy9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwiL2hvbWUvYmVuL2NvZGUvY296eS9kZXYva3Jlc3VzL2NsaWVudC9FdmVudHMuanMiLCIvaG9tZS9iZW4vY29kZS9jb3p5L2Rldi9rcmVzdXMvY2xpZW50L0hlbHBlcnMuanMiLCIvaG9tZS9iZW4vY29kZS9jb3p5L2Rldi9rcmVzdXMvY2xpZW50L01vZGVscy5qcyIsIi9ob21lL2Jlbi9jb2RlL2NvenkvZGV2L2tyZXN1cy9jbGllbnQvY29tcG9uZW50cy9BY2NvdW50TGlzdENvbXBvbmVudC5qcyIsIi9ob21lL2Jlbi9jb2RlL2NvenkvZGV2L2tyZXN1cy9jbGllbnQvY29tcG9uZW50cy9CYW5rTGlzdENvbXBvbmVudC5qcyIsIi9ob21lL2Jlbi9jb2RlL2NvenkvZGV2L2tyZXN1cy9jbGllbnQvY29tcG9uZW50cy9DYXRlZ29yeUNvbXBvbmVudC5qcyIsIi9ob21lL2Jlbi9jb2RlL2NvenkvZGV2L2tyZXN1cy9jbGllbnQvY29tcG9uZW50cy9DaGFydENvbXBvbmVudC5qcyIsIi9ob21lL2Jlbi9jb2RlL2NvenkvZGV2L2tyZXN1cy9jbGllbnQvY29tcG9uZW50cy9PcGVyYXRpb25MaXN0Q29tcG9uZW50LmpzIiwiL2hvbWUvYmVuL2NvZGUvY296eS9kZXYva3Jlc3VzL2NsaWVudC9jb21wb25lbnRzL1NpbWlsYXJpdHlDb21wb25lbnQuanMiLCIvaG9tZS9iZW4vY29kZS9jb3p5L2Rldi9rcmVzdXMvY2xpZW50L2ZsdXgvZGlzcGF0Y2hlci5qcyIsIi9ob21lL2Jlbi9jb2RlL2NvenkvZGV2L2tyZXN1cy9jbGllbnQvZmx1eC9pbnZhcmlhbnQuanMiLCIvaG9tZS9iZW4vY29kZS9jb3p5L2Rldi9rcmVzdXMvY2xpZW50L21haW4uanMiLCIvaG9tZS9iZW4vY29kZS9jb3p5L2Rldi9rcmVzdXMvY2xpZW50L3N0b3JlLmpzIiwiL2hvbWUvYmVuL2NvZGUvY296eS9kZXYva3Jlc3VzL25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9ldmVudHMvZXZlbnRzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDZkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9GQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaFhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwUUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFQQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6UkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt0aHJvdyBuZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpfXZhciBmPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChmLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGYsZi5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJ2YXIgRXZlbnRzID0gbW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgQUNDT1VOVFNfTE9BREVEOiAnYWNjb3VudCBoYXZlIGp1c3QgYmVlbiBsb2FkZWQnLFxuICAgIEJBTktfTElTVF9MT0FERUQ6ICdiYW5rIGxpc3QgaGFzIGp1c3QgYmVlbiBsb2FkZWQnLFxuICAgIENBVEVHT1JJRVNfTE9BREVEOiAnY2F0ZWdvcmllcyBoYXZlIGp1c3QgYmVlbiBsb2FkZWQnLFxuICAgIENBVEVHT1JZX0NSRUFURUQ6ICd0aGUgdXNlciBjcmVhdGVkIGEgY2F0ZWdvcnknLFxuICAgIENBVEVHT1JZX1NBVkVEOiAndGhlIGNhdGVnb3J5IHdhcyBzYXZlZCBvbiB0aGUgc2VydmVyJyxcbiAgICBERUxFVEVfT1BFUkFUSU9OOiAndGhlIHVzZXIgYXNrZWQgdG8gZGVsZXRlIGFuIG9wZXJhdGlvbicsXG4gICAgREVMRVRFRF9PUEVSQVRJT046ICdhbiBvcGVyYXRpb24gaGFzIGp1c3QgYmVlbiBkZWxldGVkIG9uIHRoZSBzZXJ2ZXInLFxuICAgIE9QRVJBVElPTlNfTE9BREVEOiAnb3BlcmF0aW9ucyBoYXZlIGJlZW4gbG9hZGVkJyxcbiAgICBPUEVSQVRJT05fQ0FURUdPUllfQ0hBTkdFRDogJ3VzZXIgY2hhbmdlZCB0aGUgY2F0ZWdvcnkgb2YgYW4gb3BlcmF0aW9uJyxcbiAgICBPUEVSQVRJT05fQ0FURUdPUllfU0FWRUQ6ICd0aGUgY2F0ZWdvcnkgZm9yIGFuIG9wZXJhdGlvbiB3YXMgc2V0IG9uIHRoZSBzZXJ2ZXInLFxuICAgIFJFVFJJRVZFX09QRVJBVElPTlNfUVVFUklFRDogJ3RoZSB1c2VyIGNsaWNrZWQgb24gcmV0cmlldmUgb3BlcmF0aW9ucyBmb3IgYSBiYW5rIGFjY291bnQnLFxuICAgIFNFTEVDVEVEX0FDQ09VTlRfQ0hBTkdFRDogJ3NvbWV0aGluZyBjaGFuZ2VkIHRoZSBzZWxlY3RlZCBhY2NvdW50JyxcbiAgICBTRUxFQ1RFRF9CQU5LX0NIQU5HRUQ6ICdzb21ldGhpbmcgY2hhbmdlZCB0aGUgc2VsZWN0ZWQgYmFuaydcbn07XG4iLCIvKlxuICogSEVMUEVSU1xuICovXG5cbmNvbnN0IERFQlVHID0gdHJ1ZTtcbmNvbnN0IEFTU0VSVFMgPSB0cnVlO1xuXG52YXIgZGVidWcgPSBleHBvcnRzLmRlYnVnID0gZnVuY3Rpb24oKSB7XG4gICAgREVCVUcgJiYgY29uc29sZS5sb2cuYXBwbHkoY29uc29sZSwgYXJndW1lbnRzKTtcbn07XG5cbnZhciBhc3NlcnQgPSBleHBvcnRzLmFzc2VydCA9IGZ1bmN0aW9uKHgsIHdhdCkge1xuICAgIGlmICgheCkge1xuICAgICAgICB2YXIgdGV4dCA9ICdBc3NlcnRpb24gZXJyb3I6ICcgKyAod2F0P3dhdDonJykgKyAnXFxuJyArIG5ldyBFcnJvcigpLnN0YWNrO1xuICAgICAgICBBU1NFUlRTICYmIGFsZXJ0KHRleHQpO1xuICAgICAgICBjb25zb2xlLmxvZyh0ZXh0KTtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICByZXR1cm4gdHJ1ZTtcbn07XG5cbnZhciBtYXliZUhhcyA9IGV4cG9ydHMubWF5YmVIYXMgPSBmdW5jdGlvbihvYmosIHByb3ApIHtcbiAgICByZXR1cm4gb2JqLmhhc093blByb3BlcnR5KHByb3ApO1xufVxuXG5leHBvcnRzLmhhcyA9IGZ1bmN0aW9uIGhhcyhvYmosIHByb3ApIHtcbiAgICByZXR1cm4gYXNzZXJ0KG1heWJlSGFzKG9iaiwgcHJvcCksICdvYmplY3Qgc2hvdWxkIGhhdmUgcHJvcGVydHkgJyArIHByb3ApO1xufVxuXG5leHBvcnRzLnhockVycm9yID0gZnVuY3Rpb24geGhyRXJyb3IoeGhyLCB0ZXh0U3RhdHVzLCBlcnIpIHtcbiAgICBhbGVydCgneGhyIGVycm9yOiAnICsgdGV4dFN0YXR1cyArICdcXG4nICsgZXJyKTtcbn1cblxuIiwidmFyIGhhcyA9IHJlcXVpcmUoJy4vSGVscGVycycpLmhhcztcbnZhciBtYXliZUhhcyA9IHJlcXVpcmUoJy4vSGVscGVycycpLm1heWJlSGFzO1xuXG5leHBvcnRzLkJhbmsgPSBmdW5jdGlvbiBCYW5rKGFyZykge1xuICAgIHRoaXMuaWQgICA9IGhhcyhhcmcsICdpZCcpICAgJiYgYXJnLmlkO1xuICAgIHRoaXMubmFtZSA9IGhhcyhhcmcsICduYW1lJykgJiYgYXJnLm5hbWU7XG4gICAgdGhpcy51dWlkID0gaGFzKGFyZywgJ3V1aWQnKSAmJiBhcmcudXVpZDtcbn1cblxuZXhwb3J0cy5BY2NvdW50ID0gZnVuY3Rpb24gQWNjb3VudChhcmcpIHtcbiAgICB0aGlzLmJhbmsgICAgICAgICAgPSBoYXMoYXJnLCAnYmFuaycpICYmIGFyZy5iYW5rO1xuICAgIHRoaXMuYmFua0FjY2VzcyAgICA9IGhhcyhhcmcsICdiYW5rQWNjZXNzJykgJiYgYXJnLmJhbmtBY2Nlc3M7XG4gICAgdGhpcy50aXRsZSAgICAgICAgID0gaGFzKGFyZywgJ3RpdGxlJykgJiYgYXJnLnRpdGxlO1xuICAgIHRoaXMuYWNjb3VudE51bWJlciA9IGhhcyhhcmcsICdhY2NvdW50TnVtYmVyJykgJiYgYXJnLmFjY291bnROdW1iZXI7XG4gICAgdGhpcy5pbml0aWFsQW1vdW50ID0gaGFzKGFyZywgJ2luaXRpYWxBbW91bnQnKSAmJiBhcmcuaW5pdGlhbEFtb3VudDtcbiAgICB0aGlzLmxhc3RDaGVja2VkICAgPSBoYXMoYXJnLCAnbGFzdENoZWNrZWQnKSAmJiBuZXcgRGF0ZShhcmcubGFzdENoZWNrZWQpO1xuICAgIHRoaXMuaWQgICAgICAgICAgICA9IGhhcyhhcmcsICdpZCcpICYmIGFyZy5pZDtcbiAgICB0aGlzLmFtb3VudCAgICAgICAgPSBoYXMoYXJnLCAnYW1vdW50JykgJiYgYXJnLmFtb3VudDtcbn1cblxuZnVuY3Rpb24gT3BlcmF0aW9uKGFyZykge1xuICAgIHRoaXMuYmFua0FjY291bnQgPSBoYXMoYXJnLCAnYmFua0FjY291bnQnKSAmJiBhcmcuYmFua0FjY291bnQ7XG4gICAgdGhpcy50aXRsZSAgICAgICA9IGhhcyhhcmcsICd0aXRsZScpICYmIGFyZy50aXRsZTtcbiAgICB0aGlzLmRhdGUgICAgICAgID0gaGFzKGFyZywgJ2RhdGUnKSAmJiBuZXcgRGF0ZShhcmcuZGF0ZSk7XG4gICAgdGhpcy5hbW91bnQgICAgICA9IGhhcyhhcmcsICdhbW91bnQnKSAmJiBhcmcuYW1vdW50O1xuICAgIHRoaXMucmF3ICAgICAgICAgPSBoYXMoYXJnLCAncmF3JykgJiYgYXJnLnJhdztcbiAgICB0aGlzLmRhdGVJbXBvcnQgID0gKG1heWJlSGFzKGFyZywgJ2RhdGVJbXBvcnQnKSAmJiBuZXcgRGF0ZShhcmcuZGF0ZUltcG9ydCkpIHx8IDA7XG4gICAgdGhpcy5pZCAgICAgICAgICA9IGhhcyhhcmcsICdpZCcpICYmIGFyZy5pZDtcbiAgICB0aGlzLmNhdGVnb3J5SWQgID0gYXJnLmNhdGVnb3J5SWQgfHwgLTE7XG59XG5cbmV4cG9ydHMuT3BlcmF0aW9uID0gT3BlcmF0aW9uO1xuXG5mdW5jdGlvbiBDYXRlZ29yeShhcmcpIHtcbiAgICB0aGlzLnRpdGxlID0gaGFzKGFyZywgJ3RpdGxlJykgJiYgYXJnLnRpdGxlO1xuICAgIHRoaXMuaWQgPSBoYXMoYXJnLCAnaWQnKSAmJiBhcmcuaWQ7XG5cbiAgICAvLyBPcHRpb25hbFxuICAgIHRoaXMucGFyZW50SWQgPSBhcmcucGFyZW50SWQ7XG59XG5cbmV4cG9ydHMuQ2F0ZWdvcnkgPSBDYXRlZ29yeTtcbiIsIi8qKiBAanN4IFJlYWN0LkRPTSAqL1xuXG4vLyBDb25zdGFudHNcbnZhciBFdmVudHMgPSByZXF1aXJlKCcuLi9FdmVudHMnKTtcbnZhciBkZWJ1ZyA9IHJlcXVpcmUoJy4uL0hlbHBlcnMnKS5kZWJ1ZztcblxuLy8gR2xvYmFsIHZhcmlhYmxlc1xudmFyIHN0b3JlID0gcmVxdWlyZSgnLi4vc3RvcmUnKTtcbnZhciBmbHV4ID0gcmVxdWlyZSgnLi4vZmx1eC9kaXNwYXRjaGVyJyk7XG5cbi8vIFByb3BzOiBhY2NvdW50OiBBY2NvdW50XG52YXIgQWNjb3VudExpc3RJdGVtID0gUmVhY3QuY3JlYXRlQ2xhc3Moe2Rpc3BsYXlOYW1lOiAnQWNjb3VudExpc3RJdGVtJyxcblxuICAgIF9vbkNsaWNrOiBmdW5jdGlvbigpIHtcbiAgICAgICAgZGVidWcoJ2NsaWNrIG9uIGEgcGFydGljdWxhciBhY2NvdW50Jyk7XG4gICAgICAgIGZsdXguZGlzcGF0Y2goe1xuICAgICAgICAgICAgdHlwZTogRXZlbnRzLlNFTEVDVEVEX0FDQ09VTlRfQ0hBTkdFRCxcbiAgICAgICAgICAgIGFjY291bnQ6IHRoaXMucHJvcHMuYWNjb3VudFxuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgcmVuZGVyOiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIFJlYWN0LkRPTS5saSh7Y2xhc3NOYW1lOiBcImFjdGl2ZVwifSwgXG4gICAgICAgICAgICAgICAgUmVhY3QuRE9NLnNwYW4obnVsbCwgXG4gICAgICAgICAgICAgICAgICAgIFJlYWN0LkRPTS5hKHtvbkNsaWNrOiB0aGlzLl9vbkNsaWNrfSwgdGhpcy5wcm9wcy5hY2NvdW50LnRpdGxlKVxuICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgIClcbiAgICAgICAgKTtcbiAgICB9XG59KTtcblxuLy8gU3RhdGU6IGFjY291bnRzOiBbQWNjb3VudF1cbnZhciBBY2NvdW50TGlzdENvbXBvbmVudCA9IG1vZHVsZS5leHBvcnRzID0gUmVhY3QuY3JlYXRlQ2xhc3Moe2Rpc3BsYXlOYW1lOiAnZXhwb3J0cycsXG5cbiAgICBnZXRJbml0aWFsU3RhdGU6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgYWNjb3VudHM6IFtdXG4gICAgICAgIH07XG4gICAgfSxcblxuICAgIF9saXN0ZW5lcjogZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgYWNjb3VudHM6IHN0b3JlLmFjY291bnRzXG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICBjb21wb25lbnREaWRNb3VudDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHN0b3JlLm9uKEV2ZW50cy5BQ0NPVU5UU19MT0FERUQsIHRoaXMuX2xpc3RlbmVyKTtcbiAgICB9LFxuXG4gICAgY29tcG9uZW50V2lsbFVubW91bnQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICBzdG9yZS5yZW1vdmVMaXN0ZW5lcihFdmVudHMuQUNDT1VOVFNfTE9BREVELCB0aGlzLl9saXN0ZW5lcik7XG4gICAgfSxcblxuICAgIHJlbmRlcjogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBhY2NvdW50cyA9IHRoaXMuc3RhdGUuYWNjb3VudHMubWFwKGZ1bmN0aW9uIChhKSB7XG4gICAgICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgICAgIEFjY291bnRMaXN0SXRlbSh7a2V5OiBhLmlkLCBhY2NvdW50OiBhfSlcbiAgICAgICAgICAgICk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICBSZWFjdC5ET00uZGl2KHtjbGFzc05hbWU6IFwidGhyX2RpdlwifSwgXG4gICAgICAgICAgICAgICAgUmVhY3QuRE9NLnVsKHtjbGFzc05hbWU6IFwidG9wXCJ9LCBSZWFjdC5ET00uc3Bhbih7Y2xhc3NOYW1lOiBcInRvcGljXCJ9LCBcIkFjY291bnRzXCIpLCBcbiAgICAgICAgICAgICAgICAgICAgYWNjb3VudHNcbiAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICApXG4gICAgICAgICk7XG4gICAgfVxufSk7XG5cbiIsIi8qKiBAanN4IFJlYWN0LkRPTSAqL1xuXG4vLyBDb25zdGFudHNcbnZhciBFdmVudHMgPSByZXF1aXJlKCcuLi9FdmVudHMnKTtcbnZhciBkZWJ1ZyA9IHJlcXVpcmUoJy4uL0hlbHBlcnMnKS5kZWJ1ZztcblxuLy8gR2xvYmFsIHZhcmlhYmxlc1xudmFyIHN0b3JlID0gcmVxdWlyZSgnLi4vc3RvcmUnKTtcbnZhciBmbHV4ID0gcmVxdWlyZSgnLi4vZmx1eC9kaXNwYXRjaGVyJyk7XG5cbi8vIFByb3BzOiBiYW5rOiBCYW5rXG52YXIgQmFua0xpc3RJdGVtQ29tcG9uZW50ID0gUmVhY3QuY3JlYXRlQ2xhc3Moe2Rpc3BsYXlOYW1lOiAnQmFua0xpc3RJdGVtQ29tcG9uZW50JyxcblxuICAgIF9vbkNsaWNrOiBmdW5jdGlvbigpIHtcbiAgICAgICAgZGVidWcoJ2NsaWNrIG9uIGEgYmFuayBpdGVtJyk7XG4gICAgICAgIGZsdXguZGlzcGF0Y2goe1xuICAgICAgICAgICAgdHlwZTogRXZlbnRzLlNFTEVDVEVEX0JBTktfQ0hBTkdFRCxcbiAgICAgICAgICAgIGJhbms6IHRoaXMucHJvcHMuYmFua1xuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgcmVuZGVyOiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIFJlYWN0LkRPTS5saSh7Y2xhc3NOYW1lOiBcImFjdGl2ZVwifSwgUmVhY3QuRE9NLnNwYW4obnVsbCwgUmVhY3QuRE9NLmEoe29uQ2xpY2s6IHRoaXMuX29uQ2xpY2t9LCB0aGlzLnByb3BzLmJhbmsubmFtZSkpKVxuICAgICAgICApO1xuICAgIH1cbn0pO1xuXG4vLyBTdGF0ZTogW2JhbmtdXG52YXIgQmFua0xpc3RDb21wb25lbnQgPSBtb2R1bGUuZXhwb3J0cyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtkaXNwbGF5TmFtZTogJ2V4cG9ydHMnLFxuXG4gICAgX2JhbmtMaXN0TGlzdGVuZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgIGJhbmtzOiBzdG9yZS5iYW5rc1xuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgZ2V0SW5pdGlhbFN0YXRlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGJhbmtzOiBbXVxuICAgICAgICB9XG4gICAgfSxcblxuICAgIGNvbXBvbmVudERpZE1vdW50OiBmdW5jdGlvbigpIHtcbiAgICAgICAgc3RvcmUub24oRXZlbnRzLkJBTktfTElTVF9MT0FERUQsIHRoaXMuX2JhbmtMaXN0TGlzdGVuZXIpO1xuICAgIH0sXG5cbiAgICBjb21wb25lbnRXaWxsVW5tb3VudDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHN0b3JlLnJlbW92ZUxpc3RlbmVyKEV2ZW50cy5CQU5LX0xJU1RfTE9BREVELCB0aGlzLl9iYW5rTGlzdExpc3RlbmVyKTtcbiAgICB9LFxuXG4gICAgcmVuZGVyOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGJhbmtzID0gdGhpcy5zdGF0ZS5iYW5rcy5tYXAoZnVuY3Rpb24gKGIpIHtcbiAgICAgICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICAgICAgQmFua0xpc3RJdGVtQ29tcG9uZW50KHtrZXk6IGIuaWQsIGJhbms6IGJ9KVxuICAgICAgICAgICAgKVxuICAgICAgICB9KTtcblxuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgUmVhY3QuRE9NLmRpdih7Y2xhc3NOYW1lOiBcInNlY19kaXZcIn0sIFxuICAgICAgICAgICAgICAgIFJlYWN0LkRPTS51bCh7Y2xhc3NOYW1lOiBcInRvcFwifSwgUmVhY3QuRE9NLnNwYW4oe2NsYXNzTmFtZTogXCJ0b3BpY1wifSwgXCJCYW5rc1wiKSwgXG4gICAgICAgICAgICAgICAgICAgIGJhbmtzXG4gICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgKVxuICAgICAgICApO1xuICAgIH1cbn0pO1xuIiwiLyoqIEBqc3ggUmVhY3QuRE9NICovXG5cbi8vIENvbnN0YW50c1xudmFyIEV2ZW50cyA9IHJlcXVpcmUoJy4uL0V2ZW50cycpO1xudmFyIGRlYnVnID0gcmVxdWlyZSgnLi4vSGVscGVycycpLmRlYnVnO1xuXG4vLyBHbG9iYWwgdmFyaWFibGVzXG52YXIgc3RvcmUgPSByZXF1aXJlKCcuLi9zdG9yZScpO1xudmFyIGZsdXggPSByZXF1aXJlKCcuLi9mbHV4L2Rpc3BhdGNoZXInKTtcblxudmFyIENhdGVnb3J5TGlzdCA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtkaXNwbGF5TmFtZTogJ0NhdGVnb3J5TGlzdCcsXG5cbiAgICBfbGlzdGVuZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgIGNhdGVnb3JpZXM6IHN0b3JlLmNhdGVnb3JpZXNcbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIGdldEluaXRpYWxTdGF0ZTogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBjYXRlZ29yaWVzOiBbXVxuICAgICAgICB9XG4gICAgfSxcblxuICAgIGNvbXBvbmVudERpZE1vdW50OiBmdW5jdGlvbigpIHtcbiAgICAgICAgc3RvcmUub24oRXZlbnRzLkNBVEVHT1JJRVNfTE9BREVELCB0aGlzLl9saXN0ZW5lcik7XG4gICAgfSxcblxuICAgIGNvbXBvbmVudFdpbGxVbm1vdW50OiBmdW5jdGlvbigpIHtcbiAgICAgICAgc3RvcmUucmVtb3ZlTGlzdGVuZXIoRXZlbnRzLkNBVEVHT1JJRVNfTE9BREVELCB0aGlzLl9saXN0ZW5lcik7XG4gICAgfSxcblxuICAgIHJlbmRlcjogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBpdGVtcyA9IHRoaXMuc3RhdGUuY2F0ZWdvcmllcy5tYXAoZnVuY3Rpb24gKGNhdCkge1xuICAgICAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgICAgICBSZWFjdC5ET00ubGkoe2tleTogY2F0LmlkfSwgY2F0LnRpdGxlKVxuICAgICAgICAgICAgKTtcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICBSZWFjdC5ET00udWwobnVsbCwgaXRlbXMpXG4gICAgICAgICk7XG4gICAgfVxufSk7XG5cbnZhciBDYXRlZ29yeUZvcm0gPSBSZWFjdC5jcmVhdGVDbGFzcyh7ZGlzcGxheU5hbWU6ICdDYXRlZ29yeUZvcm0nLFxuXG4gICAgb25TdWJtaXQ6IGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgICAgIHZhciBsYWJlbCA9IHRoaXMucmVmcy5sYWJlbC5nZXRET01Ob2RlKCkudmFsdWUudHJpbSgpO1xuICAgICAgICBpZiAoIWxhYmVsKVxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuXG4gICAgICAgIHZhciBjYXRlZ29yeSA9IHtcbiAgICAgICAgICAgIHRpdGxlOiBsYWJlbFxuICAgICAgICB9O1xuXG4gICAgICAgIGZsdXguZGlzcGF0Y2goe1xuICAgICAgICAgICAgdHlwZTogRXZlbnRzLkNBVEVHT1JZX0NSRUFURUQsXG4gICAgICAgICAgICBjYXRlZ29yeTogY2F0ZWdvcnlcbiAgICAgICAgfSk7XG5cbiAgICAgICAgdGhpcy5yZWZzLmxhYmVsLmdldERPTU5vZGUoKS52YWx1ZSA9ICcnO1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfSxcblxuICAgIHJlbmRlcjogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICBSZWFjdC5ET00uZm9ybSh7b25TdWJtaXQ6IHRoaXMub25TdWJtaXR9LCBcbiAgICAgICAgICAgICAgICBSZWFjdC5ET00uZGl2KHtjbGFzc05hbWU6IFwicm93XCJ9LCBcbiAgICAgICAgICAgICAgICAgICAgUmVhY3QuRE9NLmRpdih7Y2xhc3NOYW1lOiBcInNtYWxsLTEwIGNvbHVtbnNcIn0sIFxuICAgICAgICAgICAgICAgICAgICAgICAgUmVhY3QuRE9NLmlucHV0KHt0eXBlOiBcInRleHRcIiwgcGxhY2Vob2xkZXI6IFwiTGFiZWwgb2YgbmV3IGNhdGVnb3J5XCIsIHJlZjogXCJsYWJlbFwifSlcbiAgICAgICAgICAgICAgICAgICAgKSwgXG4gICAgICAgICAgICAgICAgICAgIFJlYWN0LkRPTS5kaXYoe2NsYXNzTmFtZTogXCJzbWFsbC0yIGNvbHVtbnNcIn0sIFxuICAgICAgICAgICAgICAgICAgICAgICAgUmVhY3QuRE9NLmlucHV0KHt0eXBlOiBcInN1Ym1pdFwiLCBjbGFzc05hbWU6IFwiYnV0dG9uIHBvc3RmaXhcIiwgdmFsdWU6IFwiU3VibWl0XCJ9KVxuICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgKVxuICAgICAgICApXG4gICAgfVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gUmVhY3QuY3JlYXRlQ2xhc3Moe2Rpc3BsYXlOYW1lOiAnZXhwb3J0cycsXG5cbiAgICByZW5kZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgUmVhY3QuRE9NLmRpdihudWxsLCBcbiAgICAgICAgICAgICAgICBSZWFjdC5ET00uaDEobnVsbCwgXCJDYXRlZ29yaWVzXCIpLCBcbiAgICAgICAgICAgICAgICBDYXRlZ29yeUxpc3QobnVsbCksIFxuICAgICAgICAgICAgICAgIFJlYWN0LkRPTS5oMyhudWxsLCBcIkFkZCBhIGNhdGVnb3J5XCIpLCBcbiAgICAgICAgICAgICAgICBDYXRlZ29yeUZvcm0obnVsbClcbiAgICAgICAgICAgIClcbiAgICAgICAgKTtcbiAgICB9XG59KTtcbiIsIi8qKiBAanN4IFJlYWN0LkRPTSAqL1xuXG4vLyBDb25zdGFudHNcbnZhciBFdmVudHMgPSByZXF1aXJlKCcuLi9FdmVudHMnKTtcbnZhciBkZWJ1ZyA9IHJlcXVpcmUoJy4uL0hlbHBlcnMnKS5kZWJ1ZztcblxuLy8gR2xvYmFsIHZhcmlhYmxlc1xudmFyIHN0b3JlID0gcmVxdWlyZSgnLi4vc3RvcmUnKTtcblxudmFyICRjaGFydCA9IG51bGw7XG5cbmZ1bmN0aW9uIERFQlVHKHRleHQpIHtcbiAgICByZXR1cm4gZGVidWcoJ0NoYXJ0IENvbXBvbmVudCAtICcgKyB0ZXh0KTtcbn1cblxuLy8gQ29tcG9uZW50c1xubW9kdWxlLmV4cG9ydHMgPSBSZWFjdC5jcmVhdGVDbGFzcyh7ZGlzcGxheU5hbWU6ICdleHBvcnRzJyxcblxuICAgIGdldEluaXRpYWxTdGF0ZTogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBhY2NvdW50OiBudWxsLFxuICAgICAgICAgICAgb3BlcmF0aW9uczogW10sXG4gICAgICAgICAgICBjYXRlZ29yaWVzOiBbXSxcbiAgICAgICAgICAgIGtpbmQ6ICdhbGwnICAgICAgICAgLy8gd2hpY2ggY2hhcnQgYXJlIHdlIHNob3dpbmc/XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgX3JlbG9hZDogZnVuY3Rpb24oKSB7XG4gICAgICAgIERFQlVHKCdyZWxvYWQnKTtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICBhY2NvdW50OiAgICBzdG9yZS5jdXJyZW50QWNjb3VudCxcbiAgICAgICAgICAgIG9wZXJhdGlvbnM6IHN0b3JlLm9wZXJhdGlvbnMsXG4gICAgICAgICAgICBjYXRlZ29yaWVzOiBzdG9yZS5jYXRlZ29yaWVzXG4gICAgICAgIH0sIHRoaXMuX3JlZHJhdyk7XG4gICAgfSxcblxuICAgIGNvbXBvbmVudERpZE1vdW50OiBmdW5jdGlvbigpIHtcbiAgICAgICAgc3RvcmUub24oRXZlbnRzLk9QRVJBVElPTlNfTE9BREVELCB0aGlzLl9yZWxvYWQpO1xuICAgICAgICBzdG9yZS5vbihFdmVudHMuQ0FURUdPUklFU19MT0FERUQsIHRoaXMuX3JlbG9hZCk7XG4gICAgICAgICRjaGFydCA9ICQoJyNjaGFydCcpO1xuICAgIH0sXG5cbiAgICBjb21wb25lbnRXaWxsVW5tb3VudDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHN0b3JlLnJlbW92ZUxpc3RlbmVyKEV2ZW50cy5PUEVSQVRJT05TX0xPQURFRCwgdGhpcy5fcmVsb2FkKTtcbiAgICAgICAgc3RvcmUucmVtb3ZlTGlzdGVuZXIoRXZlbnRzLkNBVEVHT1JJRVNfTE9BREVELCB0aGlzLl9yZWxvYWQpO1xuICAgIH0sXG5cbiAgICBfcmVkcmF3OiBmdW5jdGlvbigpIHtcbiAgICAgICAgREVCVUcoJ3JlZHJhdycpO1xuICAgICAgICBzd2l0Y2ggKHRoaXMuc3RhdGUua2luZCkge1xuICAgICAgICAgICAgY2FzZSAnYWxsJzpcbiAgICAgICAgICAgICAgICBDcmVhdGVDaGFydEFsbEJ5Q2F0ZWdvcnlCeU1vbnRoKHRoaXMuc3RhdGUub3BlcmF0aW9ucyk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICdiYWxhbmNlJzpcbiAgICAgICAgICAgICAgICBDcmVhdGVDaGFydEJhbGFuY2UodGhpcy5zdGF0ZS5hY2NvdW50LCB0aGlzLnN0YXRlLm9wZXJhdGlvbnMpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnYnktY2F0ZWdvcnknOlxuICAgICAgICAgICAgICAgIHZhciB2YWwgPSB0aGlzLnJlZnMuc2VsZWN0LmdldERPTU5vZGUoKS52YWx1ZTtcbiAgICAgICAgICAgICAgICBDcmVhdGVDaGFydEJ5Q2F0ZWdvcnlCeU1vbnRoKHZhbCwgdGhpcy5zdGF0ZS5vcGVyYXRpb25zKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ3Bvcy1uZWcnOlxuICAgICAgICAgICAgICAgIENyZWF0ZUNoYXJ0UG9zaXRpdmVOZWdhdGl2ZSh0aGlzLnN0YXRlLm9wZXJhdGlvbnMpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnZ2xvYmFsLXBvcy1uZWcnOlxuICAgICAgICAgICAgICAgIENyZWF0ZUNoYXJ0UG9zaXRpdmVOZWdhdGl2ZShzdG9yZS5nZXRPcGVyYXRpb25zT2ZBbGxBY2NvdW50cygpKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgYXNzZXJ0KHRydWUgPT09IGZhbHNlLCAndW5leHBlY3RlZCB2YWx1ZSBpbiBfcmVkcmF3OiAnICsgdGhpcy5zdGF0ZS5raW5kKTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICBfY2hhbmdlS2luZDogZnVuY3Rpb24oa2luZCkge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgIGtpbmQ6IGtpbmRcbiAgICAgICAgfSwgdGhpcy5fcmVkcmF3KTtcbiAgICB9LFxuICAgIF9vbkNsaWNrQWxsOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy5fY2hhbmdlS2luZCgnYWxsJyk7XG4gICAgfSxcbiAgICBfb25DbGlja0J5Q2F0ZWdvcnk6IGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLl9jaGFuZ2VLaW5kKCdieS1jYXRlZ29yeScpO1xuICAgIH0sXG4gICAgX29uQ2xpY2tCYWxhbmNlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy5fY2hhbmdlS2luZCgnYmFsYW5jZScpO1xuICAgIH0sXG4gICAgX29uQ2xpY2tQb3NOZWc6IGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLl9jaGFuZ2VLaW5kKCdwb3MtbmVnJyk7XG4gICAgfSxcbiAgICBfb25DbGlja0dsb2JhbFBvc05lZzogZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoaXMuX2NoYW5nZUtpbmQoJ2dsb2JhbC1wb3MtbmVnJyk7XG4gICAgfSxcblxuICAgIHJlbmRlcjogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBjYXRlZ29yeU9wdGlvbnMgPSB0aGlzLnN0YXRlLmNhdGVnb3JpZXMubWFwKGZ1bmN0aW9uIChjKSB7XG4gICAgICAgICAgICByZXR1cm4gKFJlYWN0LkRPTS5vcHRpb24oe2tleTogYy5pZCwgdmFsdWU6IGMuaWR9LCBjLnRpdGxlKSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHZhciBtYXliZVNlbGVjdCA9IHRoaXMuc3RhdGUua2luZCAhPT0gJ2J5LWNhdGVnb3J5JyA/ICcnIDpcbiAgICAgICAgICAgIFJlYWN0LkRPTS5zZWxlY3Qoe29uQ2hhbmdlOiB0aGlzLl9yZWRyYXcsIHJlZjogXCJzZWxlY3RcIn0sIFxuICAgICAgICAgICAgICAgIGNhdGVnb3J5T3B0aW9uc1xuICAgICAgICAgICAgKVxuXG4gICAgICAgIHJldHVybiAoXG4gICAgICAgIFJlYWN0LkRPTS5kaXYobnVsbCwgXG4gICAgICAgICAgICBSZWFjdC5ET00uaDEobnVsbCwgXCJDaGFydHNcIiksIFxuXG4gICAgICAgICAgICBSZWFjdC5ET00uZGl2KG51bGwsIFxuICAgICAgICAgICAgICAgIFJlYWN0LkRPTS5idXR0b24oe29uQ2xpY2s6IHRoaXMuX29uQ2xpY2tBbGx9LCBcIkFsbCBjYXRlZ29yaWVzIGJ5IG1vbnRoXCIpLCBcbiAgICAgICAgICAgICAgICBSZWFjdC5ET00uYnV0dG9uKHtvbkNsaWNrOiB0aGlzLl9vbkNsaWNrQnlDYXRlZ29yeX0sIFwiQnkgY2F0ZWdvcnkgYnkgbW9udGhcIiksIFxuICAgICAgICAgICAgICAgIFJlYWN0LkRPTS5idXR0b24oe29uQ2xpY2s6IHRoaXMuX29uQ2xpY2tCYWxhbmNlfSwgXCJCYWxhbmNlIG92ZXIgdGltZVwiKSwgXG4gICAgICAgICAgICAgICAgUmVhY3QuRE9NLmJ1dHRvbih7b25DbGljazogdGhpcy5fb25DbGlja1Bvc05lZ30sIFwiSW5zIC8gb3V0cyBvdmVyIHRpbWUgKHRoaXMgYWNjb3VudClcIiksIFxuICAgICAgICAgICAgICAgIFJlYWN0LkRPTS5idXR0b24oe29uQ2xpY2s6IHRoaXMuX29uQ2xpY2tHbG9iYWxQb3NOZWd9LCBcIklucyAvIG91dHMgb3ZlciB0aW1lIChhbGwgYWNjb3VudHMpXCIpXG4gICAgICAgICAgICApLCBcblxuICAgICAgICAgICAgbWF5YmVTZWxlY3QsIFxuXG4gICAgICAgICAgICBSZWFjdC5ET00uZGl2KHtpZDogXCJjaGFydFwifSlcbiAgICAgICAgKVxuICAgICAgICApO1xuICAgIH1cbn0pO1xuXG4vLyBDaGFydHNcbmZ1bmN0aW9uIENyZWF0ZUNoYXJ0QnlDYXRlZ29yeUJ5TW9udGgoY2F0SWQsIG9wZXJhdGlvbnMpIHtcbiAgICB2YXIgb3BzID0gb3BlcmF0aW9ucy5zbGljZSgpLmZpbHRlcihmdW5jdGlvbihvcCkge1xuICAgICAgICByZXR1cm4gb3AuY2F0ZWdvcnlJZCA9PT0gY2F0SWQ7XG4gICAgfSk7XG4gICAgQ3JlYXRlQ2hhcnRBbGxCeUNhdGVnb3J5QnlNb250aChvcHMpO1xufVxuXG5mdW5jdGlvbiBDcmVhdGVDaGFydEFsbEJ5Q2F0ZWdvcnlCeU1vbnRoKG9wZXJhdGlvbnMpIHtcblxuICAgIGZ1bmN0aW9uIGRhdGVrZXkob3ApIHtcbiAgICAgICAgdmFyIGQgPSBvcC5kYXRlO1xuICAgICAgICByZXR1cm4gZC5nZXRGdWxsWWVhcigpICsgJy0nICsgZC5nZXRNb250aCgpO1xuICAgIH1cblxuICAgIC8vIENhdGVnb3J5IC0+IHtNb250aCAtPiBbQW1vdW50c119XG4gICAgdmFyIG1hcCA9IHt9O1xuICAgIC8vIERhdGVrZXkgLT4gRGF0ZVxuICAgIHZhciBkYXRlc2V0ID0ge307XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBvcGVyYXRpb25zLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHZhciBvcCA9IG9wZXJhdGlvbnNbaV07XG4gICAgICAgIHZhciBjID0gc3RvcmUuY2F0ZWdvcnlUb0xhYmVsKG9wLmNhdGVnb3J5SWQpO1xuICAgICAgICBtYXBbY10gPSBtYXBbY10gfHwge307XG5cbiAgICAgICAgdmFyIGRrID0gZGF0ZWtleShvcCk7XG4gICAgICAgIG1hcFtjXVtka10gPSBtYXBbY11bZGtdIHx8IFtdO1xuICAgICAgICBtYXBbY11bZGtdLnB1c2gob3AuYW1vdW50KTtcbiAgICAgICAgZGF0ZXNldFtka10gPSArb3AuZGF0ZTtcbiAgICB9XG5cbiAgICAvLyBTb3J0IGRhdGUgaW4gYXNjZW5kaW5nIG9yZGVyOiBwdXNoIGFsbCBwYWlycyBvZiAoZGF0ZWtleSwgZGF0ZSkgaW4gYW5cbiAgICAvLyBhcnJheSBhbmQgc29ydCB0aGF0IGFycmF5IGJ5IHRoZSBzZWNvbmQgZWxlbWVudC4gVGhlbiByZWFkIHRoYXQgYXJyYXkgaW5cbiAgICAvLyBhc2NlbmRpbmcgb3JkZXIuXG4gICAgdmFyIGRhdGVzID0gW107XG4gICAgZm9yICh2YXIgZGsgaW4gZGF0ZXNldCkge1xuICAgICAgICBkYXRlcy5wdXNoKFtkaywgZGF0ZXNldFtka11dKTtcbiAgICB9XG4gICAgZGF0ZXMuc29ydChmdW5jdGlvbihhLCBiKSB7XG4gICAgICAgIHJldHVybiBhWzFdIC0gYlsxXTtcbiAgICB9KTtcblxuICAgIHZhciBzZXJpZXMgPSBbXTtcbiAgICBmb3IgKHZhciBjIGluIG1hcCkge1xuICAgICAgICB2YXIgZGF0YSA9IFtdO1xuXG4gICAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgZGF0ZXMubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgICAgIHZhciBkayA9IGRhdGVzW2pdWzBdO1xuICAgICAgICAgICAgbWFwW2NdW2RrXSA9IG1hcFtjXVtka10gfHwgW107XG4gICAgICAgICAgICBkYXRhLnB1c2gobWFwW2NdW2RrXS5yZWR1Y2UoZnVuY3Rpb24oYSwgYikgeyByZXR1cm4gYSArIGIgfSwgMCkpO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIHNlcmllID0ge1xuICAgICAgICAgICAgbmFtZTogYyxcbiAgICAgICAgICAgIGRhdGE6IGRhdGFcbiAgICAgICAgfTtcblxuICAgICAgICBzZXJpZXMucHVzaChzZXJpZSk7XG4gICAgfVxuXG4gICAgdmFyIGNhdGVnb3JpZXMgPSBbXTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGRhdGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHZhciBkYXRlID0gbmV3IERhdGUoZGF0ZXNbaV1bMV0pO1xuICAgICAgICB2YXIgc3RyID0gZGF0ZS50b0xvY2FsZURhdGVTdHJpbmcoLyogdXNlIHRoZSBkZWZhdWx0IGxvY2FsZSAqLyB1bmRlZmluZWQsIHtcbiAgICAgICAgICAgIHllYXI6ICdudW1lcmljJyxcbiAgICAgICAgICAgIG1vbnRoOiAnbG9uZydcbiAgICAgICAgfSk7XG4gICAgICAgIGNhdGVnb3JpZXMucHVzaChzdHIpO1xuICAgIH1cblxuICAgIHZhciB0aXRsZSA9ICdCeSBjYXRlZ29yeSc7XG4gICAgdmFyIHlBeGlzTGVnZW5kID0gJ0Ftb3VudCc7XG5cbiAgICAkY2hhcnQuaGlnaGNoYXJ0cyh7XG4gICAgICAgIGNoYXJ0OiB7XG4gICAgICAgICAgICB0eXBlOiAnY29sdW1uJ1xuICAgICAgICB9LFxuICAgICAgICB0aXRsZToge1xuICAgICAgICAgICAgdGV4dDogdGl0bGVcbiAgICAgICAgfSxcbiAgICAgICAgeEF4aXM6IHtcbiAgICAgICAgICAgIGNhdGVnb3JpZXM6IGNhdGVnb3JpZXNcbiAgICAgICAgfSxcbiAgICAgICAgeUF4aXM6IHtcbiAgICAgICAgICAgIHRpdGxlOiB7XG4gICAgICAgICAgICAgICAgdGV4dDogeUF4aXNMZWdlbmRcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgdG9vbHRpcDoge1xuICAgICAgICAgICAgaGVhZGVyRm9ybWF0OiAnPHNwYW4gc3R5bGU9XCJmb250LXNpemU6MTBweFwiPntwb2ludC5rZXl9PC9zcGFuPjx0YWJsZT4nLFxuICAgICAgICAgICAgcG9pbnRGb3JtYXQ6ICc8dHI+PHRkIHN0eWxlPVwiY29sb3I6e3Nlcmllcy5jb2xvcn07cGFkZGluZzowXCI+e3Nlcmllcy5uYW1lfTogPC90ZD4nICtcbiAgICAgICAgICAgICc8dGQgc3R5bGU9XCJwYWRkaW5nOjBcIj48Yj57cG9pbnQueTouMWZ9IGV1cjwvYj48L3RkPjwvdHI+JyxcbiAgICAgICAgICAgIGZvb3RlckZvcm1hdDogJzwvdGFibGU+JyxcbiAgICAgICAgICAgIHNoYXJlZDogdHJ1ZSxcbiAgICAgICAgICAgIHVzZUhUTUw6IHRydWVcbiAgICAgICAgfSxcbiAgICAgICAgcGxvdE9wdGlvbnM6IHtcbiAgICAgICAgICAgIGNvbHVtbjoge1xuICAgICAgICAgICAgICAgIHBvaW50UGFkZGluZzogMC4yLFxuICAgICAgICAgICAgICAgIGJvcmRlcldpZHRoOiAwXG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIHNlcmllczogc2VyaWVzXG4gICAgfSk7XG59XG5cbmZ1bmN0aW9uIENyZWF0ZUNoYXJ0QmFsYW5jZShhY2NvdW50LCBvcGVyYXRpb25zKSB7XG5cbiAgICB2YXIgb3BzID0gb3BlcmF0aW9ucy5zb3J0KGZ1bmN0aW9uIChhLGIpIHsgcmV0dXJuICthLmRhdGUgLSArYi5kYXRlIH0pO1xuXG4gICAgLy8gRGF0ZSAoZGF5KSAtPiBzdW0gYW1vdW50cyBvZiB0aGlzIGRheSAoc2NhbGFyKVxuICAgIHZhciBvcG1hcCA9IHt9O1xuICAgIG9wcy5tYXAoZnVuY3Rpb24obykge1xuICAgICAgICAvLyBDb252ZXJ0IGRhdGUgaW50byBhIG51bWJlcjogaXQncyBnb2luZyB0byBiZSBjb252ZXJ0ZWQgaW50byBhIHN0cmluZ1xuICAgICAgICAvLyB3aGVuIHVzZWQgYXMgYSBrZXkuXG4gICAgICAgIHZhciBhID0gby5hbW91bnQ7XG4gICAgICAgIHZhciBkID0gK28uZGF0ZTtcbiAgICAgICAgb3BtYXBbZF0gPSBvcG1hcFtkXSB8fCAwO1xuICAgICAgICBvcG1hcFtkXSArPSBhO1xuICAgIH0pXG5cbiAgICB2YXIgYmFsYW5jZSA9IGFjY291bnQuaW5pdGlhbEFtb3VudDtcbiAgICB2YXIgYmFsID0gW107XG4gICAgZm9yICh2YXIgZGF0ZSBpbiBvcG1hcCkge1xuICAgICAgICAvLyBkYXRlIGlzIGEgc3RyaW5nIG5vdzogY29udmVydCBpdCBiYWNrIHRvIGEgbnVtYmVyIGZvciBoaWdoY2hhcnRzLlxuICAgICAgICBiYWxhbmNlICs9IG9wbWFwW2RhdGVdO1xuICAgICAgICBiYWwucHVzaChbK2RhdGUsIGJhbGFuY2VdKTtcbiAgICB9XG5cbiAgICAvLyBDcmVhdGUgdGhlIGNoYXJ0XG4gICAgJGNoYXJ0LmhpZ2hjaGFydHMoJ1N0b2NrQ2hhcnQnLCB7XG4gICAgICAgIHJhbmdlU2VsZWN0b3IgOiB7XG4gICAgICAgICAgICBzZWxlY3RlZCA6IDFcbiAgICAgICAgfSxcblxuICAgICAgICB0aXRsZSA6IHtcbiAgICAgICAgICAgIHRleHQgOiAnQmFsYW5jZSdcbiAgICAgICAgfSxcblxuICAgICAgICBzZXJpZXMgOiBbe1xuICAgICAgICAgICAgbmFtZSA6ICdCYWxhbmNlJyxcbiAgICAgICAgICAgIGRhdGEgOiBiYWwsXG4gICAgICAgICAgICB0b29sdGlwOiB7IHZhbHVlRGVjaW1hbHM6IDIgfVxuICAgICAgICB9XVxuICAgIH0pO1xufVxuXG5mdW5jdGlvbiBDcmVhdGVDaGFydFBvc2l0aXZlTmVnYXRpdmUob3BlcmF0aW9ucykge1xuXG4gICAgZnVuY3Rpb24gZGF0ZWtleShvcCkge1xuICAgICAgICB2YXIgZCA9IG9wLmRhdGU7XG4gICAgICAgIHJldHVybiBkLmdldEZ1bGxZZWFyKCkgKyAnLScgKyBkLmdldE1vbnRoKCk7XG4gICAgfVxuXG4gICAgY29uc3QgUE9TID0gMCwgTkVHID0gMSwgQkFMID0gMjtcblxuICAgIC8vIE1vbnRoIC0+IFtQb3NpdGl2ZSBhbW91bnQsIE5lZ2F0aXZlIGFtb3VudCwgRGlmZl1cbiAgICB2YXIgbWFwID0ge307XG4gICAgLy8gRGF0ZWtleSAtPiBEYXRlXG4gICAgdmFyIGRhdGVzZXQgPSB7fTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IG9wZXJhdGlvbnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgdmFyIG9wID0gb3BlcmF0aW9uc1tpXTtcbiAgICAgICAgdmFyIGRrID0gZGF0ZWtleShvcCk7XG4gICAgICAgIG1hcFtka10gPSBtYXBbZGtdIHx8IFswLCAwLCAwXTtcblxuICAgICAgICBtYXBbZGtdW1BPU10gKz0gb3AuYW1vdW50ID4gMCA/IG9wLmFtb3VudCA6IDA7XG4gICAgICAgIG1hcFtka11bTkVHXSArPSBvcC5hbW91bnQgPCAwID8gLW9wLmFtb3VudCA6IDA7XG4gICAgICAgIG1hcFtka11bQkFMXSArPSBvcC5hbW91bnQ7XG5cbiAgICAgICAgZGF0ZXNldFtka10gPSArb3AuZGF0ZTtcbiAgICB9XG5cbiAgICAvLyBTb3J0IGRhdGUgaW4gYXNjZW5kaW5nIG9yZGVyOiBwdXNoIGFsbCBwYWlycyBvZiAoZGF0ZWtleSwgZGF0ZSkgaW4gYW5cbiAgICAvLyBhcnJheSBhbmQgc29ydCB0aGF0IGFycmF5IGJ5IHRoZSBzZWNvbmQgZWxlbWVudC4gVGhlbiByZWFkIHRoYXQgYXJyYXkgaW5cbiAgICAvLyBhc2NlbmRpbmcgb3JkZXIuXG4gICAgdmFyIGRhdGVzID0gW107XG4gICAgZm9yICh2YXIgZGsgaW4gZGF0ZXNldCkge1xuICAgICAgICBkYXRlcy5wdXNoKFtkaywgZGF0ZXNldFtka11dKTtcbiAgICB9XG4gICAgZGF0ZXMuc29ydChmdW5jdGlvbihhLCBiKSB7XG4gICAgICAgIHJldHVybiBhWzFdIC0gYlsxXTtcbiAgICB9KTtcblxuICAgIHZhciBzZXJpZXMgPSBbXTtcbiAgICBmdW5jdGlvbiBhZGRTZXJpZShuYW1lLCBtYXBJbmRleCkge1xuICAgICAgICB2YXIgZGF0YSA9IFtdO1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGRhdGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICB2YXIgZGsgPSBkYXRlc1tpXVswXTtcbiAgICAgICAgICAgIGRhdGEucHVzaChtYXBbZGtdW21hcEluZGV4XSk7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIHNlcmllID0ge1xuICAgICAgICAgICAgbmFtZTogbmFtZSxcbiAgICAgICAgICAgIGRhdGE6IGRhdGFcbiAgICAgICAgfTtcbiAgICAgICAgc2VyaWVzLnB1c2goc2VyaWUpO1xuICAgIH1cblxuICAgIGFkZFNlcmllKCdQb3NpdGl2ZScsIFBPUyk7XG4gICAgYWRkU2VyaWUoJ05lZ2F0aXZlJywgTkVHKTtcbiAgICBhZGRTZXJpZSgnQmFsYW5jZScsIEJBTCk7XG5cbiAgICB2YXIgY2F0ZWdvcmllcyA9IFtdO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZGF0ZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgdmFyIGRhdGUgPSBuZXcgRGF0ZShkYXRlc1tpXVsxXSk7XG4gICAgICAgIHZhciBzdHIgPSBkYXRlLnRvTG9jYWxlRGF0ZVN0cmluZygvKiB1c2UgdGhlIGRlZmF1bHQgbG9jYWxlICovIHVuZGVmaW5lZCwge1xuICAgICAgICAgICAgeWVhcjogJ251bWVyaWMnLFxuICAgICAgICAgICAgbW9udGg6ICdsb25nJ1xuICAgICAgICB9KTtcbiAgICAgICAgY2F0ZWdvcmllcy5wdXNoKHN0cik7XG4gICAgfVxuXG4gICAgdmFyIHRpdGxlID0gJ1Bvc2l0aXZlIC8gTmVnYXRpdmUgb3ZlciB0aW1lJztcbiAgICB2YXIgeUF4aXNMZWdlbmQgPSAnQW1vdW50JztcblxuICAgICRjaGFydC5oaWdoY2hhcnRzKHtcbiAgICAgICAgY2hhcnQ6IHtcbiAgICAgICAgICAgIHR5cGU6ICdjb2x1bW4nXG4gICAgICAgIH0sXG4gICAgICAgIHRpdGxlOiB7XG4gICAgICAgICAgICB0ZXh0OiB0aXRsZVxuICAgICAgICB9LFxuICAgICAgICB4QXhpczoge1xuICAgICAgICAgICAgY2F0ZWdvcmllczogY2F0ZWdvcmllc1xuICAgICAgICB9LFxuICAgICAgICB5QXhpczoge1xuICAgICAgICAgICAgdGl0bGU6IHtcbiAgICAgICAgICAgICAgICB0ZXh0OiB5QXhpc0xlZ2VuZFxuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICB0b29sdGlwOiB7XG4gICAgICAgICAgICBoZWFkZXJGb3JtYXQ6ICc8c3BhbiBzdHlsZT1cImZvbnQtc2l6ZToxMHB4XCI+e3BvaW50LmtleX08L3NwYW4+PHRhYmxlPicsXG4gICAgICAgICAgICBwb2ludEZvcm1hdDogJzx0cj48dGQgc3R5bGU9XCJjb2xvcjp7c2VyaWVzLmNvbG9yfTtwYWRkaW5nOjBcIj57c2VyaWVzLm5hbWV9OiA8L3RkPicgK1xuICAgICAgICAgICAgJzx0ZCBzdHlsZT1cInBhZGRpbmc6MFwiPjxiPntwb2ludC55Oi4xZn0gZXVyPC9iPjwvdGQ+PC90cj4nLFxuICAgICAgICAgICAgZm9vdGVyRm9ybWF0OiAnPC90YWJsZT4nLFxuICAgICAgICAgICAgc2hhcmVkOiB0cnVlLFxuICAgICAgICAgICAgdXNlSFRNTDogdHJ1ZVxuICAgICAgICB9LFxuICAgICAgICBwbG90T3B0aW9uczoge1xuICAgICAgICAgICAgY29sdW1uOiB7XG4gICAgICAgICAgICAgICAgcG9pbnRQYWRkaW5nOiAwLjIsXG4gICAgICAgICAgICAgICAgYm9yZGVyV2lkdGg6IDBcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgc2VyaWVzOiBzZXJpZXNcbiAgICB9KTtcbn1cblxuIiwiLyoqIEBqc3ggUmVhY3QuRE9NICovXG5cbi8vIENvbnN0YW50c1xudmFyIEV2ZW50cyA9IHJlcXVpcmUoJy4uL0V2ZW50cycpO1xudmFyIGRlYnVnID0gcmVxdWlyZSgnLi4vSGVscGVycycpLmRlYnVnO1xuXG4vLyBHbG9iYWwgdmFyaWFibGVzXG52YXIgc3RvcmUgPSByZXF1aXJlKCcuLi9zdG9yZScpO1xudmFyIGZsdXggPSByZXF1aXJlKCcuLi9mbHV4L2Rpc3BhdGNoZXInKTtcblxuLy8gQ29tcG9uZW50c1xudmFyIENhdGVnb3J5U2VsZWN0Q29tcG9uZW50ID0gUmVhY3QuY3JlYXRlQ2xhc3Moe2Rpc3BsYXlOYW1lOiAnQ2F0ZWdvcnlTZWxlY3RDb21wb25lbnQnLFxuXG4gICAgZ2V0SW5pdGlhbFN0YXRlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHsgZWRpdE1vZGU6IGZhbHNlIH1cbiAgICB9LFxuXG4gICAgZG9tOiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucmVmcy5jYXQuZ2V0RE9NTm9kZSgpO1xuICAgIH0sXG5cbiAgICBvbkNoYW5nZTogZnVuY3Rpb24oZSkge1xuICAgICAgICB2YXIgc2VsZWN0ZWRJZCA9IHRoaXMuZG9tKCkudmFsdWU7XG4gICAgICAgIGZsdXguZGlzcGF0Y2goe1xuICAgICAgICAgICAgdHlwZTogRXZlbnRzLk9QRVJBVElPTl9DQVRFR09SWV9DSEFOR0VELFxuICAgICAgICAgICAgb3BlcmF0aW9uSWQ6IHRoaXMucHJvcHMub3BlcmF0aW9uLmlkLFxuICAgICAgICAgICAgY2F0ZWdvcnlJZDogc2VsZWN0ZWRJZFxuICAgICAgICB9KTtcbiAgICAgICAgLy8gQmUgb3B0aW1pc3RpY1xuICAgICAgICB0aGlzLnByb3BzLm9wZXJhdGlvbi5jYXRlZ29yeUlkID0gc2VsZWN0ZWRJZDtcbiAgICB9LFxuXG4gICAgc3dpdGNoVG9FZGl0TW9kZTogZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoeyBlZGl0TW9kZTogdHJ1ZSB9LCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHRoaXMuZG9tKCkuZm9jdXMoKTtcbiAgICAgICAgfSk7XG4gICAgfSxcbiAgICBzd2l0Y2hUb1N0YXRpY01vZGU6IGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHsgZWRpdE1vZGU6IGZhbHNlIH0pO1xuICAgIH0sXG5cbiAgICByZW5kZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgc2VsZWN0ZWRJZCA9IHRoaXMucHJvcHMub3BlcmF0aW9uLmNhdGVnb3J5SWQ7XG4gICAgICAgIHZhciBsYWJlbCA9IHN0b3JlLmNhdGVnb3J5VG9MYWJlbChzZWxlY3RlZElkKTtcblxuICAgICAgICBpZiAoIXRoaXMuc3RhdGUuZWRpdE1vZGUpIHtcbiAgICAgICAgICAgIHJldHVybiAoUmVhY3QuRE9NLnNwYW4oe29uQ2xpY2s6IHRoaXMuc3dpdGNoVG9FZGl0TW9kZX0sIGxhYmVsKSlcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIE9uIHRoZSBmaXJzdCBjbGljayBpbiBlZGl0IG1vZGUsIGNhdGVnb3JpZXMgYXJlIGFscmVhZHkgbG9hZGVkLlxuICAgICAgICAvLyBFdmVyeSB0aW1lIHdlIHJlbG9hZCBjYXRlZ29yaWVzLCB3ZSBjYW4ndCBiZSBpbiBlZGl0IG1vZGUsIHNvIHdlIGNhblxuICAgICAgICAvLyBqdXN0IHN5bmNocm9ub3VzbHkgcmV0cmlldmUgY2F0ZWdvcmllcyBhbmQgbm90IG5lZWQgdG8gc3Vic2NyaWJlIHRvXG4gICAgICAgIC8vIHRoZW0uXG4gICAgICAgIHZhciBvcHRpb25zID0gc3RvcmUuY2F0ZWdvcmllcy5tYXAoZnVuY3Rpb24gKGMpIHtcbiAgICAgICAgICAgIHJldHVybiAoUmVhY3QuRE9NLm9wdGlvbih7a2V5OiBjLmlkLCB2YWx1ZTogYy5pZH0sIGMudGl0bGUpKVxuICAgICAgICB9KTtcblxuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgUmVhY3QuRE9NLnNlbGVjdCh7b25DaGFuZ2U6IHRoaXMub25DaGFuZ2UsIG9uQmx1cjogdGhpcy5zd2l0Y2hUb1N0YXRpY01vZGUsIGRlZmF1bHRWYWx1ZTogc2VsZWN0ZWRJZCwgcmVmOiBcImNhdFwifSwgXG4gICAgICAgICAgICAgICAgb3B0aW9uc1xuICAgICAgICAgICAgKVxuICAgICAgICApO1xuICAgIH1cbn0pO1xuXG52YXIgT3BlcmF0aW9uQ29tcG9uZW50ID0gUmVhY3QuY3JlYXRlQ2xhc3Moe2Rpc3BsYXlOYW1lOiAnT3BlcmF0aW9uQ29tcG9uZW50JyxcblxuICAgIGdldEluaXRpYWxTdGF0ZTogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB7IHNob3dEZXRhaWxzOiBmYWxzZSB9O1xuICAgIH0sXG5cbiAgICBfdG9nZ2xlRGV0YWlsczogZnVuY3Rpb24oZSkge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHsgc2hvd0RldGFpbHM6ICF0aGlzLnN0YXRlLnNob3dEZXRhaWxzfSk7XG4gICAgfSxcblxuICAgIHJlbmRlcjogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBvcCA9IHRoaXMucHJvcHMub3BlcmF0aW9uO1xuXG4gICAgICAgIHZhciBtYXliZURldGFpbHMsIG1heWJlQWN0aXZlO1xuICAgICAgICBpZiAodGhpcy5zdGF0ZS5zaG93RGV0YWlscykge1xuICAgICAgICAgICAgbWF5YmVEZXRhaWxzID0gUmVhY3QuRE9NLmxpKHtjbGFzc05hbWU6IFwiZGV0YWlsXCJ9LCBSZWFjdC5ET00uYihudWxsLCBcIkRldGFpbHM6IFwiKSwgb3AucmF3KTtcbiAgICAgICAgICAgIG1heWJlQWN0aXZlID0gXCJ0b2dnbGUtYnRuIGFjdGl2ZVwiO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgbWF5YmVEZXRhaWxzID0gXCJcIjtcbiAgICAgICAgICAgIG1heWJlQWN0aXZlID0gXCJ0b2dnbGUtYnRuXCI7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgUmVhY3QuRE9NLnVsKHtjbGFzc05hbWU6IFwidGFibGUtcm93IGNsZWFyZml4XCJ9LCBcbiAgICAgICAgICAgICAgICBSZWFjdC5ET00ubGkobnVsbCwgUmVhY3QuRE9NLmEoe2NsYXNzTmFtZTogbWF5YmVBY3RpdmUsIG9uQ2xpY2s6IHRoaXMuX3RvZ2dsZURldGFpbHN9KSksIFxuICAgICAgICAgICAgICAgIFJlYWN0LkRPTS5saShudWxsLCBvcC5kYXRlLnRvTG9jYWxlRGF0ZVN0cmluZygpKSwgXG4gICAgICAgICAgICAgICAgUmVhY3QuRE9NLmxpKG51bGwsIG9wLnRpdGxlKSwgXG4gICAgICAgICAgICAgICAgUmVhY3QuRE9NLmxpKG51bGwsIG9wLmFtb3VudCksIFxuICAgICAgICAgICAgICAgIFJlYWN0LkRPTS5saShudWxsLCBDYXRlZ29yeVNlbGVjdENvbXBvbmVudCh7b3BlcmF0aW9uOiBvcH0pKSwgXG4gICAgICAgICAgICAgICAgbWF5YmVEZXRhaWxzXG4gICAgICAgICAgICApXG4gICAgICAgICk7XG4gICAgfVxufSk7XG5cbnZhciBPcGVyYXRpb25zQ29tcG9uZW50ID0gbW9kdWxlLmV4cG9ydHMgPSBSZWFjdC5jcmVhdGVDbGFzcyh7ZGlzcGxheU5hbWU6ICdleHBvcnRzJyxcblxuICAgIGdldEluaXRpYWxTdGF0ZTogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBhY2NvdW50OiB7aW5pdGlhbEFtb3VudDogMH0sXG4gICAgICAgICAgICBvcGVyYXRpb25zOiBbXVxuICAgICAgICB9XG4gICAgfSxcblxuICAgIF9jYjogZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgYWNjb3VudDogc3RvcmUuY3VycmVudEFjY291bnQsXG4gICAgICAgICAgICBvcGVyYXRpb25zOiBzdG9yZS5vcGVyYXRpb25zXG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICBjb21wb25lbnREaWRNb3VudDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHN0b3JlLm9uKEV2ZW50cy5PUEVSQVRJT05TX0xPQURFRCwgdGhpcy5fY2IpO1xuICAgIH0sXG5cbiAgICBjb21wb25lbnRXaWxsVW5tb3VudDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHN0b3JlLnJlbW92ZUxpc3RlbmVyKEV2ZW50cy5PUEVSQVRJT05TX0xPQURFRCwgdGhpcy5fY2IpO1xuICAgIH0sXG5cbiAgICBnZXRUb3RhbDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciB0b3RhbCA9IHRoaXMuc3RhdGUub3BlcmF0aW9ucy5yZWR1Y2UoZnVuY3Rpb24oYSxiKSB7IHJldHVybiBhICsgYi5hbW91bnQgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnN0YXRlLmFjY291bnQuaW5pdGlhbEFtb3VudCk7XG4gICAgICAgIHJldHVybiAodG90YWwgKiAxMDAgfCAwKSAvIDEwMDtcbiAgICB9LFxuXG4gICAgRmlsdGVyT3BlcmF0aW9uc1RoaXNNb250aDogZnVuY3Rpb24ob3BlcmF0aW9ucykge1xuICAgICAgICByZXR1cm4gb3BlcmF0aW9ucy5maWx0ZXIoZnVuY3Rpb24ob3ApIHtcbiAgICAgICAgICAgIHZhciBkID0gbmV3IERhdGUob3AuZGF0ZSk7XG4gICAgICAgICAgICB2YXIgbm93ID0gbmV3IERhdGUoKTtcbiAgICAgICAgICAgIHJldHVybiBkLmdldEZ1bGxZZWFyKCkgPT0gbm93LmdldEZ1bGxZZWFyKCkgJiYgZC5nZXRNb250aCgpID09IG5vdy5nZXRNb250aCgpXG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICBnZXRQb3NpdGl2ZTogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciB0b3RhbCA9IHRoaXMuRmlsdGVyT3BlcmF0aW9uc1RoaXNNb250aCh0aGlzLnN0YXRlLm9wZXJhdGlvbnMpXG4gICAgICAgICAgICAgICAgICAgICAgICAucmVkdWNlKGZ1bmN0aW9uKGEsYikgeyByZXR1cm4gYSArIChiLmFtb3VudCA+IDApID8gYi5hbW91bnQgOiAwfSwgMCk7XG4gICAgICAgIHJldHVybiAodG90YWwgKiAxMDAgfCAwKSAvIDEwMDtcbiAgICB9LFxuXG4gICAgZ2V0TmVnYXRpdmU6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgdG90YWwgPSB0aGlzLkZpbHRlck9wZXJhdGlvbnNUaGlzTW9udGgodGhpcy5zdGF0ZS5vcGVyYXRpb25zKVxuICAgICAgICAgICAgICAgICAgICAgICAgLnJlZHVjZShmdW5jdGlvbihhLGIpIHsgcmV0dXJuIGEgKyAoYi5hbW91bnQgPCAwKSA/IC1iLmFtb3VudCA6IDB9LCAwKTtcbiAgICAgICAgcmV0dXJuICh0b3RhbCAqIDEwMCB8IDApIC8gMTAwO1xuICAgIH0sXG5cbiAgICBnZXREaWZmOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIHRvdGFsID0gdGhpcy5GaWx0ZXJPcGVyYXRpb25zVGhpc01vbnRoKHRoaXMuc3RhdGUub3BlcmF0aW9ucylcbiAgICAgICAgICAgICAgICAgICAgICAgIC5yZWR1Y2UoZnVuY3Rpb24oYSxiKSB7IHJldHVybiBhICsgYi5hbW91bnR9ICwgMCk7XG4gICAgICAgIHJldHVybiAodG90YWwgKiAxMDAgfCAwKSAvIDEwMDtcbiAgICB9LFxuXG4gICAgb25SZXRyaWV2ZU9wZXJhdGlvbnNfOiBmdW5jdGlvbigpIHtcbiAgICAgICAgZmx1eC5kaXNwYXRjaCh7XG4gICAgICAgICAgICB0eXBlOiBFdmVudHMuUkVUUklFVkVfT1BFUkFUSU9OU19RVUVSSUVEXG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICByZW5kZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgb3BzID0gdGhpcy5zdGF0ZS5vcGVyYXRpb25zLm1hcChmdW5jdGlvbiAobykge1xuICAgICAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgICAgICBPcGVyYXRpb25Db21wb25lbnQoe2tleTogby5pZCwgb3BlcmF0aW9uOiBvfSlcbiAgICAgICAgICAgICk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vIFRPRE8gbm8gaW5saW5lIHN0eWxlXG4gICAgICAgIHZhciB0YWJsZUZvb3RlclN0eWxlID0ge1xuICAgICAgICAgICAgXCJib3R0b21cIjogMCxcbiAgICAgICAgICAgIFwibWFyZ2luLWxlZnRcIjogMFxuICAgICAgICB9O1xuXG4gICAgICAgIC8vIFRPRE8gcGFnaW5hdGlvbjpcbiAgICAgICAgLy8gbGV0IGsgdGhlIG51bWJlciBvZiBlbGVtZW50cyB0byBzaG93IGJ5IHBhZ2UsXG4gICAgICAgIC8vIGxldCBuIHRoZSB0b3RhbCBudW1iZXIgb2YgZWxlbWVudHMuXG4gICAgICAgIC8vIFRoZXJlIGFyZSBDZWlsKG4vaykgcGFnZXMuXG4gICAgICAgIC8vIHEtdGggcGFnZSAoc3RhcnRpbmcgYXQgMSkgc2hvd3MgZWxlbWVudHMgZnJvbSBbKHEtMSlrLCBNaW4ocWstMSwgbildXG5cbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIFJlYWN0LkRPTS5kaXYobnVsbCwgXG4gICAgICAgICAgICAgICAgUmVhY3QuRE9NLmRpdih7Y2xhc3NOYW1lOiBcInByaWNlLWJsb2NrIGNsZWFyZml4XCJ9LCBcbiAgICAgICAgICAgICAgICAgICAgUmVhY3QuRE9NLnVsKHtjbGFzc05hbWU6IFwibWFpbl9hbXRcIn0sIFxuICAgICAgICAgICAgICAgICAgICAgICAgUmVhY3QuRE9NLmxpKHtjbGFzc05hbWU6IFwibWFyX2xpIG9yZ1wifSwgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgUmVhY3QuRE9NLnNwYW4oe2NsYXNzTmFtZTogXCJhbXRfYmlnXCJ9LCB0aGlzLmdldFRvdGFsKCksIFwiIOKCrFwiKSwgUmVhY3QuRE9NLmJyKG51bGwpLCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBSZWFjdC5ET00uc3Bhbih7Y2xhc3NOYW1lOiBcInN1YjEgXCJ9LCBcIlRvdGFsIGFtb3VudFwiKSwgUmVhY3QuRE9NLmJyKG51bGwpLCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBSZWFjdC5ET00uc3Bhbih7Y2xhc3NOYW1lOiBcInN1YjJcIn0sIFwidG9kYXlcIilcbiAgICAgICAgICAgICAgICAgICAgICAgICksIFxuICAgICAgICAgICAgICAgICAgICAgICAgUmVhY3QuRE9NLmxpKHtjbGFzc05hbWU6IFwibWFyX2xpIGdyXCJ9LCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBSZWFjdC5ET00uc3Bhbih7Y2xhc3NOYW1lOiBcImFtdF9iaWdcIn0sIHRoaXMuZ2V0UG9zaXRpdmUoKSwgXCIg4oKsXCIpLCBSZWFjdC5ET00uYnIobnVsbCksIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFJlYWN0LkRPTS5zcGFuKHtjbGFzc05hbWU6IFwic3ViMSBcIn0sIFwiSW5zXCIpLCBSZWFjdC5ET00uYnIobnVsbCksIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFJlYWN0LkRPTS5zcGFuKHtjbGFzc05hbWU6IFwic3ViMlwifSwgXCJ0aGlzIG1vbnRoXCIpXG4gICAgICAgICAgICAgICAgICAgICAgICApLCBcbiAgICAgICAgICAgICAgICAgICAgICAgIFJlYWN0LkRPTS5saSh7Y2xhc3NOYW1lOiBcIm1hcl9saSBsYmx1XCJ9LCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBSZWFjdC5ET00uc3Bhbih7Y2xhc3NOYW1lOiBcImFtdF9iaWdcIn0sIHRoaXMuZ2V0TmVnYXRpdmUoKSwgXCIg4oKsXCIpLCBSZWFjdC5ET00uYnIobnVsbCksIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFJlYWN0LkRPTS5zcGFuKHtjbGFzc05hbWU6IFwic3ViMSBcIn0sIFwiT3V0c1wiKSwgUmVhY3QuRE9NLmJyKG51bGwpLCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBSZWFjdC5ET00uc3Bhbih7Y2xhc3NOYW1lOiBcInN1YjJcIn0sIFwidGhpcyBtb250aFwiKVxuICAgICAgICAgICAgICAgICAgICAgICAgKSwgXG4gICAgICAgICAgICAgICAgICAgICAgICBSZWFjdC5ET00ubGkoe2NsYXNzTmFtZTogXCJkYmx1XCJ9LCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBSZWFjdC5ET00uc3Bhbih7Y2xhc3NOYW1lOiBcImFtdF9iaWdcIn0sIHRoaXMuZ2V0RGlmZigpLCBcIiDigqxcIiksIFJlYWN0LkRPTS5icihudWxsKSwgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgUmVhY3QuRE9NLnNwYW4oe2NsYXNzTmFtZTogXCJzdWIxIFwifSwgXCJEaWZmZXJlbmNlXCIpLCBSZWFjdC5ET00uYnIobnVsbCksIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFJlYWN0LkRPTS5zcGFuKHtjbGFzc05hbWU6IFwic3ViMlwifSwgXCJ0aGlzIG1vbnRoXCIpXG4gICAgICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICApLCBcblxuICAgICAgICAgICAgICAgIFJlYWN0LkRPTS5kaXYoe2NsYXNzTmFtZTogXCJvcGVyYXRpb24tYmxvY2tcIn0sIFxuICAgICAgICAgICAgICAgICAgICBSZWFjdC5ET00uZGl2KHtjbGFzc05hbWU6IFwidGl0bGUgdGV4dC11cHBlcmNhc2VcIn0sIFwib3BlcmF0aW9uXCIpLCBcbiAgICAgICAgICAgICAgICAgICAgUmVhY3QuRE9NLmRpdih7Y2xhc3NOYW1lOiBcIm9wZXJhdGlvblwifSwgXG5cbiAgICAgICAgICAgICAgICAgICAgICAgIFJlYWN0LkRPTS5kaXYoe2NsYXNzTmFtZTogXCJvcGVyYXRpb24tdG9wIGNsZWFyZml4XCJ9LCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBSZWFjdC5ET00uZGl2KHtjbGFzc05hbWU6IFwicmVjb3JkLXBlci1wYWdlIHB1bGwtbGVmdFwifSwgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFJlYWN0LkRPTS5zZWxlY3Qoe2NsYXNzTmFtZTogXCJmb3JtLWNvbnRyb2wgcHVsbC1sZWZ0XCJ9LCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFJlYWN0LkRPTS5vcHRpb24obnVsbCwgXCI1XCIpLCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFJlYWN0LkRPTS5vcHRpb24obnVsbCwgXCIxMFwiKSwgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBSZWFjdC5ET00ub3B0aW9uKG51bGwsIFwiMjBcIiksIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgUmVhY3QuRE9NLm9wdGlvbihudWxsLCBcIjUwXCIpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICksIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBSZWFjdC5ET00uc3Bhbih7Y2xhc3NOYW1lOiBcInB1bGwtbGVmdFwifSwgXCJyZWNvcmQgcGVyIHBhZ2VcIilcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgICAgICApLCBcblxuICAgICAgICAgICAgICAgICAgICAgICAgUmVhY3QuRE9NLmRpdih7Y2xhc3NOYW1lOiBcIm9wZXJhdGlvbi10YWJsZVwifSwgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgUmVhY3QuRE9NLnVsKHtjbGFzc05hbWU6IFwidGFibGUtaGVhZGVyIGNsZWFyZml4XCJ9LCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgUmVhY3QuRE9NLmxpKG51bGwpLCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgUmVhY3QuRE9NLmxpKG51bGwsIFwiREFURSBcIiwgUmVhY3QuRE9NLmEoe2NsYXNzTmFtZTogXCJwdWxsLXJpZ2h0XCIsIGhyZWY6IFwiXCJ9LCBSZWFjdC5ET00uc3BhbihudWxsLCBcIuKWtFwiKSkpLCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgUmVhY3QuRE9NLmxpKG51bGwsIFwiT1BFUkFUSU9OIFwiLCBSZWFjdC5ET00uYSh7Y2xhc3NOYW1lOiBcInB1bGwtcmlnaHRcIiwgaHJlZjogXCJcIn0sIFJlYWN0LkRPTS5zcGFuKG51bGwsIFwi4pa0XCIpKSksIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBSZWFjdC5ET00ubGkobnVsbCwgXCJBTU9VTlQgXCIsIFJlYWN0LkRPTS5hKHtjbGFzc05hbWU6IFwicHVsbC1yaWdodCB1cC1uLWRvd25cIiwgaHJlZjogXCJcIn0sIFJlYWN0LkRPTS5zcGFuKG51bGwsIFwi4pa0XCIpLCBSZWFjdC5ET00uc3BhbihudWxsLCBcIuKWvlwiKSkpLCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgUmVhY3QuRE9NLmxpKG51bGwsIFwiQ0FURUdPUlkgXCIsIFJlYWN0LkRPTS5hKHtjbGFzc05hbWU6IFwicHVsbC1yaWdodCB1cC1uLWRvd25cIiwgaHJlZjogXCJcIn0sIFJlYWN0LkRPTS5zcGFuKG51bGwsIFwi4pa0XCIpLCBSZWFjdC5ET00uc3BhbihudWxsLCBcIuKWvlwiKSkpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKSwgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb3BzXG4gICAgICAgICAgICAgICAgICAgICAgICApLCBcblxuICAgICAgICAgICAgICAgICAgICAgICAgUmVhY3QuRE9NLmRpdih7Y2xhc3NOYW1lOiBcImNsZWFyZml4IHRhYmxlLWZvb3RlclwifSwgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgUmVhY3QuRE9NLmRpdih7Y2xhc3NOYW1lOiBcInJpZ19jb250IHB1bGwtbGVmdFwifSwgXCJTaG93aW5nIDEgdG8gMTAgb2YgNTcgZW50cmllcyBcIiksIFxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgUmVhY3QuRE9NLmRpdih7Y2xhc3NOYW1lOiBcInB1bGwtcmlnaHRcIiwgc3R5bGU6IHRhYmxlRm9vdGVyU3R5bGV9LCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgUmVhY3QuRE9NLm5hdih7Y2xhc3NOYW1lOiBcIm15X25hdlwifSwgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBSZWFjdC5ET00udWwoe2NsYXNzTmFtZTogXCJwYWdpbmF0aW9uIG15X3BhZ1wifSwgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgUmVhY3QuRE9NLmxpKHtjbGFzc05hbWU6IFwicHJldmlvdXNcIn0sIFJlYWN0LkRPTS5hKHtocmVmOiBcIiNcIn0sIFJlYWN0LkRPTS5zcGFuKHsnYXJpYS1oaWRkZW4nOiBcInRydWVcIn0sIFwi4oaQXCIpLCBcIiBQcmV2aW91c1wiKSksIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFJlYWN0LkRPTS5saSh7Y2xhc3NOYW1lOiBcImFjdGl2ZVwifSwgUmVhY3QuRE9NLmEoe2hyZWY6IFwiI1wifSwgXCIxIFwiKSksIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFJlYWN0LkRPTS5saShudWxsLCBSZWFjdC5ET00uYSh7aHJlZjogXCIjXCJ9LCBcIjIgXCIpKSwgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgUmVhY3QuRE9NLmxpKG51bGwsIFJlYWN0LkRPTS5hKHtocmVmOiBcIiNcIn0sIFwiMyBcIikpLCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBSZWFjdC5ET00ubGkobnVsbCwgUmVhY3QuRE9NLmEoe2hyZWY6IFwiI1wifSwgXCI0IFwiKSksIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFJlYWN0LkRPTS5saShudWxsLCBSZWFjdC5ET00uYSh7aHJlZjogXCIjXCJ9LCBcIjUgXCIpKSwgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgUmVhY3QuRE9NLmxpKHtjbGFzc05hbWU6IFwibmV4dFwifSwgUmVhY3QuRE9NLmEoe2hyZWY6IFwiI1wifSwgXCJOZXh0IFwiLCBSZWFjdC5ET00uc3Bhbih7J2FyaWEtaGlkZGVuJzogXCJ0cnVlXCJ9LCBcIuKGklwiKSkpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICApXG5cbiAgICAgICAgICAgIClcbiAgICAgICAgKTtcbiAgICB9XG59KTtcblxuIiwiLyoqIEBqc3ggUmVhY3QuRE9NICovXG5cbi8vIENvbnN0YW50c1xudmFyIEV2ZW50cyA9IHJlcXVpcmUoJy4uL0V2ZW50cycpO1xudmFyIGRlYnVnID0gcmVxdWlyZSgnLi4vSGVscGVycycpLmRlYnVnO1xuXG4vLyBHbG9iYWwgdmFyaWFibGVzXG52YXIgc3RvcmUgPSByZXF1aXJlKCcuLi9zdG9yZScpO1xudmFyIGZsdXggPSByZXF1aXJlKCcuLi9mbHV4L2Rpc3BhdGNoZXInKTtcblxuZnVuY3Rpb24gREVCVUcodGV4dCkge1xuICAgIHJldHVybiBkZWJ1ZygnU2ltaWxhcml0eSBDb21wb25lbnQgLSAnICsgdGV4dCk7XG59XG5cbi8vIEFsZ29yaXRobVxuXG4vLyBUT0RPIG1ha2UgdGhpcyB0aHJlc2hvbGQgYSBwYXJhbWV0ZXJcbmNvbnN0IFRJTUVfU0lNSUxBUl9USFJFU0hPTEQgPSAxMDAwICogNjAgKiA2MCAqIDI0ICogMjsgLy8gNDggaG91cnNcbmZ1bmN0aW9uIGZpbmRSZWR1bmRhbnRQYWlycyhvcGVyYXRpb25zKSB7XG4gICAgREVCVUcoJ1J1bm5pbmcgZmluZFJlZHVuZGFudFBhaXJzIGFsZ29yaXRobS4uLicpO1xuICAgIERFQlVHKCdJbnB1dDogJyArIG9wZXJhdGlvbnMubGVuZ3RoICsgJyBvcGVyYXRpb25zJyk7XG4gICAgdmFyIHNpbWlsYXIgPSBbXTtcblxuICAgIGZ1bmN0aW9uIGFyZVNpbWlsYXJPcGVyYXRpb25zKGEsIGIpIHtcbiAgICAgICAgaWYgKGEuYW1vdW50ICE9IGIuYW1vdW50KVxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB2YXIgZGF0ZWRpZmYgPSBNYXRoLmFicygrYS5kYXRlIC0gK2IuZGF0ZSk7XG4gICAgICAgIHJldHVybiBkYXRlZGlmZiA8PSBUSU1FX1NJTUlMQVJfVEhSRVNIT0xEO1xuICAgIH1cblxuICAgIC8vIE8obiBsb2cgbilcbiAgICBmdW5jdGlvbiBzb3J0Q3JpdGVyaWEoYSxiKSB7IHJldHVybiBhLmFtb3VudCAtIGIuYW1vdW50OyB9XG4gICAgdmFyIHNvcnRlZCA9IG9wZXJhdGlvbnMuc2xpY2UoKS5zb3J0KHNvcnRDcml0ZXJpYSk7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBvcGVyYXRpb25zLmxlbmd0aDsgKytpKSB7XG4gICAgICAgIGlmIChpICsgMSA+PSBvcGVyYXRpb25zLmxlbmd0aClcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuXG4gICAgICAgIHZhciBvcCA9IHNvcnRlZFtpXTtcbiAgICAgICAgdmFyIG5leHQgPSBzb3J0ZWRbaSsxXTtcbiAgICAgICAgaWYgKGFyZVNpbWlsYXJPcGVyYXRpb25zKG9wLCBuZXh0KSlcbiAgICAgICAgICAgIHNpbWlsYXIucHVzaChbb3AsIG5leHRdKTtcbiAgICB9XG5cbiAgICBERUJVRyhzaW1pbGFyLmxlbmd0aCArICcgcGFpcnMgb2Ygc2ltaWxhciBvcGVyYXRpb25zIGZvdW5kJyk7XG4gICAgcmV0dXJuIHNpbWlsYXI7XG59XG5cbi8vIENvbXBvbmVudHNcbnZhciBTaW1pbGFyaXR5SXRlbUNvbXBvbmVudCA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtkaXNwbGF5TmFtZTogJ1NpbWlsYXJpdHlJdGVtQ29tcG9uZW50JyxcblxuICAgIF9kZWxldGVPcGVyYXRpb246IGZ1bmN0aW9uKCkge1xuICAgICAgICBmbHV4LmRpc3BhdGNoKHtcbiAgICAgICAgICAgIHR5cGU6IEV2ZW50cy5ERUxFVEVfT1BFUkFUSU9OLFxuICAgICAgICAgICAgb3BlcmF0aW9uOiB0aGlzLnByb3BzLm9wZXJhdGlvblxuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgcmVuZGVyOiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIFJlYWN0LkRPTS50cihudWxsLCBcbiAgICAgICAgICAgICAgICBSZWFjdC5ET00udGQobnVsbCwgdGhpcy5wcm9wcy5vcGVyYXRpb24uZGF0ZS50b1N0cmluZygpKSwgXG4gICAgICAgICAgICAgICAgUmVhY3QuRE9NLnRkKG51bGwsIHRoaXMucHJvcHMub3BlcmF0aW9uLnRpdGxlKSwgXG4gICAgICAgICAgICAgICAgUmVhY3QuRE9NLnRkKG51bGwsIHRoaXMucHJvcHMub3BlcmF0aW9uLmFtb3VudCksIFxuICAgICAgICAgICAgICAgIFJlYWN0LkRPTS50ZChudWxsLCBSZWFjdC5ET00uYSh7b25DbGljazogdGhpcy5fZGVsZXRlT3BlcmF0aW9ufSwgXCJ4XCIpKVxuICAgICAgICAgICAgKVxuICAgICAgICApO1xuICAgIH1cbn0pO1xuXG52YXIgU2ltaWxhcml0eVBhaXJDb21wb25lbnQgPSBSZWFjdC5jcmVhdGVDbGFzcyh7ZGlzcGxheU5hbWU6ICdTaW1pbGFyaXR5UGFpckNvbXBvbmVudCcsXG5cbiAgICByZW5kZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgUmVhY3QuRE9NLnRhYmxlKG51bGwsIFxuICAgICAgICAgICAgICAgIFNpbWlsYXJpdHlJdGVtQ29tcG9uZW50KHtvcGVyYXRpb246IHRoaXMucHJvcHMuYX0pLCBcbiAgICAgICAgICAgICAgICBTaW1pbGFyaXR5SXRlbUNvbXBvbmVudCh7b3BlcmF0aW9uOiB0aGlzLnByb3BzLmJ9KVxuICAgICAgICAgICAgKVxuICAgICAgICApO1xuICAgIH1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtkaXNwbGF5TmFtZTogJ2V4cG9ydHMnLFxuXG4gICAgZ2V0SW5pdGlhbFN0YXRlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHBhaXJzOiBbXVxuICAgICAgICB9O1xuICAgIH0sXG5cbiAgICBfY2I6IGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgIHBhaXJzOiBmaW5kUmVkdW5kYW50UGFpcnMoc3RvcmUub3BlcmF0aW9ucylcbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIGNvbXBvbmVudERpZE1vdW50OiBmdW5jdGlvbigpIHtcbiAgICAgICAgc3RvcmUub24oRXZlbnRzLk9QRVJBVElPTlNfTE9BREVELCB0aGlzLl9jYik7XG4gICAgfSxcblxuICAgIGNvbXBvbmVudFdpbGxVbm1vdW50OiBmdW5jdGlvbigpIHtcbiAgICAgICAgc3RvcmUucmVtb3ZlTGlzdGVuZXIoRXZlbnRzLk9QRVJBVElPTlNfTE9BREVELCB0aGlzLl9jYik7XG4gICAgfSxcblxuICAgIHJlbmRlcjogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBwYWlycyA9IHRoaXMuc3RhdGUucGFpcnM7XG4gICAgICAgIGlmIChwYWlycy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICAgICAgUmVhY3QuRE9NLmRpdihudWxsLCBcIk5vIHNpbWlsYXIgb3BlcmF0aW9ucyBmb3VuZC5cIilcbiAgICAgICAgICAgIClcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBzaW0gPSBwYWlycy5tYXAoZnVuY3Rpb24gKHApIHtcbiAgICAgICAgICAgIHZhciBrZXkgPSBwWzBdLmlkLnRvU3RyaW5nKCkgKyBwWzFdLmlkLnRvU3RyaW5nKCk7XG4gICAgICAgICAgICByZXR1cm4gKFNpbWlsYXJpdHlQYWlyQ29tcG9uZW50KHtrZXk6IGtleSwgYTogcFswXSwgYjogcFsxXX0pKVxuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIFJlYWN0LkRPTS5kaXYobnVsbCwgXG4gICAgICAgICAgICAgICAgUmVhY3QuRE9NLmgxKG51bGwsIFwiU2ltaWxhcml0aWVzXCIpLCBcbiAgICAgICAgICAgICAgICBSZWFjdC5ET00uZGl2KG51bGwsIFxuICAgICAgICAgICAgICAgICAgICBzaW1cbiAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICApKVxuICAgIH1cbn0pO1xuXG4iLCIvKlxuICogQ29weXJpZ2h0IChjKSAyMDE0LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBCU0Qtc3R5bGUgbGljZW5zZSBmb3VuZCBpbiB0aGVcbiAqIExJQ0VOU0UgZmlsZSBpbiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS4gQW4gYWRkaXRpb25hbCBncmFudFxuICogb2YgcGF0ZW50IHJpZ2h0cyBjYW4gYmUgZm91bmQgaW4gdGhlIFBBVEVOVFMgZmlsZSBpbiB0aGUgc2FtZSBkaXJlY3RvcnkuXG4gKlxuICogQHByb3ZpZGVzTW9kdWxlIERpc3BhdGNoZXJcbiAqIEB0eXBlY2hlY2tzXG4gKi9cblxuXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBpbnZhcmlhbnQgPSByZXF1aXJlKCcuL2ludmFyaWFudCcpO1xuXG52YXIgX2xhc3RJRCA9IDE7XG52YXIgX3ByZWZpeCA9ICdJRF8nO1xuXG4vKipcbiAqIERpc3BhdGNoZXIgaXMgdXNlZCB0byBicm9hZGNhc3QgcGF5bG9hZHMgdG8gcmVnaXN0ZXJlZCBjYWxsYmFja3MuIFRoaXMgaXNcbiAqIGRpZmZlcmVudCBmcm9tIGdlbmVyaWMgcHViLXN1YiBzeXN0ZW1zIGluIHR3byB3YXlzOlxuICpcbiAqICAgMSkgQ2FsbGJhY2tzIGFyZSBub3Qgc3Vic2NyaWJlZCB0byBwYXJ0aWN1bGFyIGV2ZW50cy4gRXZlcnkgcGF5bG9hZCBpc1xuICogICAgICBkaXNwYXRjaGVkIHRvIGV2ZXJ5IHJlZ2lzdGVyZWQgY2FsbGJhY2suXG4gKiAgIDIpIENhbGxiYWNrcyBjYW4gYmUgZGVmZXJyZWQgaW4gd2hvbGUgb3IgcGFydCB1bnRpbCBvdGhlciBjYWxsYmFja3MgaGF2ZVxuICogICAgICBiZWVuIGV4ZWN1dGVkLlxuICpcbiAqIEZvciBleGFtcGxlLCBjb25zaWRlciB0aGlzIGh5cG90aGV0aWNhbCBmbGlnaHQgZGVzdGluYXRpb24gZm9ybSwgd2hpY2hcbiAqIHNlbGVjdHMgYSBkZWZhdWx0IGNpdHkgd2hlbiBhIGNvdW50cnkgaXMgc2VsZWN0ZWQ6XG4gKlxuICogICB2YXIgZmxpZ2h0RGlzcGF0Y2hlciA9IG5ldyBEaXNwYXRjaGVyKCk7XG4gKlxuICogICAvLyBLZWVwcyB0cmFjayBvZiB3aGljaCBjb3VudHJ5IGlzIHNlbGVjdGVkXG4gKiAgIHZhciBDb3VudHJ5U3RvcmUgPSB7Y291bnRyeTogbnVsbH07XG4gKlxuICogICAvLyBLZWVwcyB0cmFjayBvZiB3aGljaCBjaXR5IGlzIHNlbGVjdGVkXG4gKiAgIHZhciBDaXR5U3RvcmUgPSB7Y2l0eTogbnVsbH07XG4gKlxuICogICAvLyBLZWVwcyB0cmFjayBvZiB0aGUgYmFzZSBmbGlnaHQgcHJpY2Ugb2YgdGhlIHNlbGVjdGVkIGNpdHlcbiAqICAgdmFyIEZsaWdodFByaWNlU3RvcmUgPSB7cHJpY2U6IG51bGx9XG4gKlxuICogV2hlbiBhIHVzZXIgY2hhbmdlcyB0aGUgc2VsZWN0ZWQgY2l0eSwgd2UgZGlzcGF0Y2ggdGhlIHBheWxvYWQ6XG4gKlxuICogICBmbGlnaHREaXNwYXRjaGVyLmRpc3BhdGNoKHtcbiAqICAgICBhY3Rpb25UeXBlOiAnY2l0eS11cGRhdGUnLFxuICogICAgIHNlbGVjdGVkQ2l0eTogJ3BhcmlzJ1xuICogICB9KTtcbiAqXG4gKiBUaGlzIHBheWxvYWQgaXMgZGlnZXN0ZWQgYnkgYENpdHlTdG9yZWA6XG4gKlxuICogICBmbGlnaHREaXNwYXRjaGVyLnJlZ2lzdGVyKGZ1bmN0aW9uKHBheWxvYWQpIHtcbiAqICAgICBpZiAocGF5bG9hZC5hY3Rpb25UeXBlID09PSAnY2l0eS11cGRhdGUnKSB7XG4gKiAgICAgICBDaXR5U3RvcmUuY2l0eSA9IHBheWxvYWQuc2VsZWN0ZWRDaXR5O1xuICogICAgIH1cbiAqICAgfSk7XG4gKlxuICogV2hlbiB0aGUgdXNlciBzZWxlY3RzIGEgY291bnRyeSwgd2UgZGlzcGF0Y2ggdGhlIHBheWxvYWQ6XG4gKlxuICogICBmbGlnaHREaXNwYXRjaGVyLmRpc3BhdGNoKHtcbiAqICAgICBhY3Rpb25UeXBlOiAnY291bnRyeS11cGRhdGUnLFxuICogICAgIHNlbGVjdGVkQ291bnRyeTogJ2F1c3RyYWxpYSdcbiAqICAgfSk7XG4gKlxuICogVGhpcyBwYXlsb2FkIGlzIGRpZ2VzdGVkIGJ5IGJvdGggc3RvcmVzOlxuICpcbiAqICAgIENvdW50cnlTdG9yZS5kaXNwYXRjaFRva2VuID0gZmxpZ2h0RGlzcGF0Y2hlci5yZWdpc3RlcihmdW5jdGlvbihwYXlsb2FkKSB7XG4gKiAgICAgaWYgKHBheWxvYWQuYWN0aW9uVHlwZSA9PT0gJ2NvdW50cnktdXBkYXRlJykge1xuICogICAgICAgQ291bnRyeVN0b3JlLmNvdW50cnkgPSBwYXlsb2FkLnNlbGVjdGVkQ291bnRyeTtcbiAqICAgICB9XG4gKiAgIH0pO1xuICpcbiAqIFdoZW4gdGhlIGNhbGxiYWNrIHRvIHVwZGF0ZSBgQ291bnRyeVN0b3JlYCBpcyByZWdpc3RlcmVkLCB3ZSBzYXZlIGEgcmVmZXJlbmNlXG4gKiB0byB0aGUgcmV0dXJuZWQgdG9rZW4uIFVzaW5nIHRoaXMgdG9rZW4gd2l0aCBgd2FpdEZvcigpYCwgd2UgY2FuIGd1YXJhbnRlZVxuICogdGhhdCBgQ291bnRyeVN0b3JlYCBpcyB1cGRhdGVkIGJlZm9yZSB0aGUgY2FsbGJhY2sgdGhhdCB1cGRhdGVzIGBDaXR5U3RvcmVgXG4gKiBuZWVkcyB0byBxdWVyeSBpdHMgZGF0YS5cbiAqXG4gKiAgIENpdHlTdG9yZS5kaXNwYXRjaFRva2VuID0gZmxpZ2h0RGlzcGF0Y2hlci5yZWdpc3RlcihmdW5jdGlvbihwYXlsb2FkKSB7XG4gKiAgICAgaWYgKHBheWxvYWQuYWN0aW9uVHlwZSA9PT0gJ2NvdW50cnktdXBkYXRlJykge1xuICogICAgICAgLy8gYENvdW50cnlTdG9yZS5jb3VudHJ5YCBtYXkgbm90IGJlIHVwZGF0ZWQuXG4gKiAgICAgICBmbGlnaHREaXNwYXRjaGVyLndhaXRGb3IoW0NvdW50cnlTdG9yZS5kaXNwYXRjaFRva2VuXSk7XG4gKiAgICAgICAvLyBgQ291bnRyeVN0b3JlLmNvdW50cnlgIGlzIG5vdyBndWFyYW50ZWVkIHRvIGJlIHVwZGF0ZWQuXG4gKlxuICogICAgICAgLy8gU2VsZWN0IHRoZSBkZWZhdWx0IGNpdHkgZm9yIHRoZSBuZXcgY291bnRyeVxuICogICAgICAgQ2l0eVN0b3JlLmNpdHkgPSBnZXREZWZhdWx0Q2l0eUZvckNvdW50cnkoQ291bnRyeVN0b3JlLmNvdW50cnkpO1xuICogICAgIH1cbiAqICAgfSk7XG4gKlxuICogVGhlIHVzYWdlIG9mIGB3YWl0Rm9yKClgIGNhbiBiZSBjaGFpbmVkLCBmb3IgZXhhbXBsZTpcbiAqXG4gKiAgIEZsaWdodFByaWNlU3RvcmUuZGlzcGF0Y2hUb2tlbiA9XG4gKiAgICAgZmxpZ2h0RGlzcGF0Y2hlci5yZWdpc3RlcihmdW5jdGlvbihwYXlsb2FkKSB7XG4gKiAgICAgICBzd2l0Y2ggKHBheWxvYWQuYWN0aW9uVHlwZSkge1xuICogICAgICAgICBjYXNlICdjb3VudHJ5LXVwZGF0ZSc6XG4gKiAgICAgICAgICAgZmxpZ2h0RGlzcGF0Y2hlci53YWl0Rm9yKFtDaXR5U3RvcmUuZGlzcGF0Y2hUb2tlbl0pO1xuICogICAgICAgICAgIEZsaWdodFByaWNlU3RvcmUucHJpY2UgPVxuICogICAgICAgICAgICAgZ2V0RmxpZ2h0UHJpY2VTdG9yZShDb3VudHJ5U3RvcmUuY291bnRyeSwgQ2l0eVN0b3JlLmNpdHkpO1xuICogICAgICAgICAgIGJyZWFrO1xuICpcbiAqICAgICAgICAgY2FzZSAnY2l0eS11cGRhdGUnOlxuICogICAgICAgICAgIEZsaWdodFByaWNlU3RvcmUucHJpY2UgPVxuICogICAgICAgICAgICAgRmxpZ2h0UHJpY2VTdG9yZShDb3VudHJ5U3RvcmUuY291bnRyeSwgQ2l0eVN0b3JlLmNpdHkpO1xuICogICAgICAgICAgIGJyZWFrO1xuICogICAgIH1cbiAqICAgfSk7XG4gKlxuICogVGhlIGBjb3VudHJ5LXVwZGF0ZWAgcGF5bG9hZCB3aWxsIGJlIGd1YXJhbnRlZWQgdG8gaW52b2tlIHRoZSBzdG9yZXMnXG4gKiByZWdpc3RlcmVkIGNhbGxiYWNrcyBpbiBvcmRlcjogYENvdW50cnlTdG9yZWAsIGBDaXR5U3RvcmVgLCB0aGVuXG4gKiBgRmxpZ2h0UHJpY2VTdG9yZWAuXG4gKi9cblxuICBmdW5jdGlvbiBEaXNwYXRjaGVyKCkge1xuICAgIHRoaXMuJERpc3BhdGNoZXJfY2FsbGJhY2tzID0ge307XG4gICAgdGhpcy4kRGlzcGF0Y2hlcl9pc1BlbmRpbmcgPSB7fTtcbiAgICB0aGlzLiREaXNwYXRjaGVyX2lzSGFuZGxlZCA9IHt9O1xuICAgIHRoaXMuJERpc3BhdGNoZXJfaXNEaXNwYXRjaGluZyA9IGZhbHNlO1xuICAgIHRoaXMuJERpc3BhdGNoZXJfcGVuZGluZ1BheWxvYWQgPSBudWxsO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlZ2lzdGVycyBhIGNhbGxiYWNrIHRvIGJlIGludm9rZWQgd2l0aCBldmVyeSBkaXNwYXRjaGVkIHBheWxvYWQuIFJldHVybnNcbiAgICogYSB0b2tlbiB0aGF0IGNhbiBiZSB1c2VkIHdpdGggYHdhaXRGb3IoKWAuXG4gICAqXG4gICAqIEBwYXJhbSB7ZnVuY3Rpb259IGNhbGxiYWNrXG4gICAqIEByZXR1cm4ge3N0cmluZ31cbiAgICovXG4gIERpc3BhdGNoZXIucHJvdG90eXBlLnJlZ2lzdGVyPWZ1bmN0aW9uKGNhbGxiYWNrKSB7XG4gICAgdmFyIGlkID0gX3ByZWZpeCArIF9sYXN0SUQrKztcbiAgICB0aGlzLiREaXNwYXRjaGVyX2NhbGxiYWNrc1tpZF0gPSBjYWxsYmFjaztcbiAgICByZXR1cm4gaWQ7XG4gIH07XG5cbiAgLyoqXG4gICAqIFJlbW92ZXMgYSBjYWxsYmFjayBiYXNlZCBvbiBpdHMgdG9rZW4uXG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBpZFxuICAgKi9cbiAgRGlzcGF0Y2hlci5wcm90b3R5cGUudW5yZWdpc3Rlcj1mdW5jdGlvbihpZCkge1xuICAgIGludmFyaWFudChcbiAgICAgIHRoaXMuJERpc3BhdGNoZXJfY2FsbGJhY2tzW2lkXSxcbiAgICAgICdEaXNwYXRjaGVyLnVucmVnaXN0ZXIoLi4uKTogYCVzYCBkb2VzIG5vdCBtYXAgdG8gYSByZWdpc3RlcmVkIGNhbGxiYWNrLicsXG4gICAgICBpZFxuICAgICk7XG4gICAgZGVsZXRlIHRoaXMuJERpc3BhdGNoZXJfY2FsbGJhY2tzW2lkXTtcbiAgfTtcblxuICAvKipcbiAgICogV2FpdHMgZm9yIHRoZSBjYWxsYmFja3Mgc3BlY2lmaWVkIHRvIGJlIGludm9rZWQgYmVmb3JlIGNvbnRpbnVpbmcgZXhlY3V0aW9uXG4gICAqIG9mIHRoZSBjdXJyZW50IGNhbGxiYWNrLiBUaGlzIG1ldGhvZCBzaG91bGQgb25seSBiZSB1c2VkIGJ5IGEgY2FsbGJhY2sgaW5cbiAgICogcmVzcG9uc2UgdG8gYSBkaXNwYXRjaGVkIHBheWxvYWQuXG4gICAqXG4gICAqIEBwYXJhbSB7YXJyYXk8c3RyaW5nPn0gaWRzXG4gICAqL1xuICBEaXNwYXRjaGVyLnByb3RvdHlwZS53YWl0Rm9yPWZ1bmN0aW9uKGlkcykge1xuICAgIGludmFyaWFudChcbiAgICAgIHRoaXMuJERpc3BhdGNoZXJfaXNEaXNwYXRjaGluZyxcbiAgICAgICdEaXNwYXRjaGVyLndhaXRGb3IoLi4uKTogTXVzdCBiZSBpbnZva2VkIHdoaWxlIGRpc3BhdGNoaW5nLidcbiAgICApO1xuICAgIGZvciAodmFyIGlpID0gMDsgaWkgPCBpZHMubGVuZ3RoOyBpaSsrKSB7XG4gICAgICB2YXIgaWQgPSBpZHNbaWldO1xuICAgICAgaWYgKHRoaXMuJERpc3BhdGNoZXJfaXNQZW5kaW5nW2lkXSkge1xuICAgICAgICBpbnZhcmlhbnQoXG4gICAgICAgICAgdGhpcy4kRGlzcGF0Y2hlcl9pc0hhbmRsZWRbaWRdLFxuICAgICAgICAgICdEaXNwYXRjaGVyLndhaXRGb3IoLi4uKTogQ2lyY3VsYXIgZGVwZW5kZW5jeSBkZXRlY3RlZCB3aGlsZSAnICtcbiAgICAgICAgICAnd2FpdGluZyBmb3IgYCVzYC4nLFxuICAgICAgICAgIGlkXG4gICAgICAgICk7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuICAgICAgaW52YXJpYW50KFxuICAgICAgICB0aGlzLiREaXNwYXRjaGVyX2NhbGxiYWNrc1tpZF0sXG4gICAgICAgICdEaXNwYXRjaGVyLndhaXRGb3IoLi4uKTogYCVzYCBkb2VzIG5vdCBtYXAgdG8gYSByZWdpc3RlcmVkIGNhbGxiYWNrLicsXG4gICAgICAgIGlkXG4gICAgICApO1xuICAgICAgdGhpcy4kRGlzcGF0Y2hlcl9pbnZva2VDYWxsYmFjayhpZCk7XG4gICAgfVxuICB9O1xuXG4gIC8qKlxuICAgKiBEaXNwYXRjaGVzIGEgcGF5bG9hZCB0byBhbGwgcmVnaXN0ZXJlZCBjYWxsYmFja3MuXG4gICAqXG4gICAqIEBwYXJhbSB7b2JqZWN0fSBwYXlsb2FkXG4gICAqL1xuICBEaXNwYXRjaGVyLnByb3RvdHlwZS5kaXNwYXRjaD1mdW5jdGlvbihwYXlsb2FkKSB7XG4gICAgaW52YXJpYW50KFxuICAgICAgIXRoaXMuJERpc3BhdGNoZXJfaXNEaXNwYXRjaGluZyxcbiAgICAgICdEaXNwYXRjaC5kaXNwYXRjaCguLi4pOiBDYW5ub3QgZGlzcGF0Y2ggaW4gdGhlIG1pZGRsZSBvZiBhIGRpc3BhdGNoLidcbiAgICApO1xuICAgIHRoaXMuJERpc3BhdGNoZXJfc3RhcnREaXNwYXRjaGluZyhwYXlsb2FkKTtcbiAgICB0cnkge1xuICAgICAgZm9yICh2YXIgaWQgaW4gdGhpcy4kRGlzcGF0Y2hlcl9jYWxsYmFja3MpIHtcbiAgICAgICAgaWYgKHRoaXMuJERpc3BhdGNoZXJfaXNQZW5kaW5nW2lkXSkge1xuICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuJERpc3BhdGNoZXJfaW52b2tlQ2FsbGJhY2soaWQpO1xuICAgICAgfVxuICAgIH0gZmluYWxseSB7XG4gICAgICB0aGlzLiREaXNwYXRjaGVyX3N0b3BEaXNwYXRjaGluZygpO1xuICAgIH1cbiAgfTtcblxuICAvKipcbiAgICogSXMgdGhpcyBEaXNwYXRjaGVyIGN1cnJlbnRseSBkaXNwYXRjaGluZy5cbiAgICpcbiAgICogQHJldHVybiB7Ym9vbGVhbn1cbiAgICovXG4gIERpc3BhdGNoZXIucHJvdG90eXBlLmlzRGlzcGF0Y2hpbmc9ZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMuJERpc3BhdGNoZXJfaXNEaXNwYXRjaGluZztcbiAgfTtcblxuICAvKipcbiAgICogQ2FsbCB0aGUgY2FsbGJhY2sgc3RvcmVkIHdpdGggdGhlIGdpdmVuIGlkLiBBbHNvIGRvIHNvbWUgaW50ZXJuYWxcbiAgICogYm9va2tlZXBpbmcuXG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBpZFxuICAgKiBAaW50ZXJuYWxcbiAgICovXG4gIERpc3BhdGNoZXIucHJvdG90eXBlLiREaXNwYXRjaGVyX2ludm9rZUNhbGxiYWNrPWZ1bmN0aW9uKGlkKSB7XG4gICAgdGhpcy4kRGlzcGF0Y2hlcl9pc1BlbmRpbmdbaWRdID0gdHJ1ZTtcbiAgICB0aGlzLiREaXNwYXRjaGVyX2NhbGxiYWNrc1tpZF0odGhpcy4kRGlzcGF0Y2hlcl9wZW5kaW5nUGF5bG9hZCk7XG4gICAgdGhpcy4kRGlzcGF0Y2hlcl9pc0hhbmRsZWRbaWRdID0gdHJ1ZTtcbiAgfTtcblxuICAvKipcbiAgICogU2V0IHVwIGJvb2trZWVwaW5nIG5lZWRlZCB3aGVuIGRpc3BhdGNoaW5nLlxuICAgKlxuICAgKiBAcGFyYW0ge29iamVjdH0gcGF5bG9hZFxuICAgKiBAaW50ZXJuYWxcbiAgICovXG4gIERpc3BhdGNoZXIucHJvdG90eXBlLiREaXNwYXRjaGVyX3N0YXJ0RGlzcGF0Y2hpbmc9ZnVuY3Rpb24ocGF5bG9hZCkge1xuICAgIGZvciAodmFyIGlkIGluIHRoaXMuJERpc3BhdGNoZXJfY2FsbGJhY2tzKSB7XG4gICAgICB0aGlzLiREaXNwYXRjaGVyX2lzUGVuZGluZ1tpZF0gPSBmYWxzZTtcbiAgICAgIHRoaXMuJERpc3BhdGNoZXJfaXNIYW5kbGVkW2lkXSA9IGZhbHNlO1xuICAgIH1cbiAgICB0aGlzLiREaXNwYXRjaGVyX3BlbmRpbmdQYXlsb2FkID0gcGF5bG9hZDtcbiAgICB0aGlzLiREaXNwYXRjaGVyX2lzRGlzcGF0Y2hpbmcgPSB0cnVlO1xuICB9O1xuXG4gIC8qKlxuICAgKiBDbGVhciBib29ra2VlcGluZyB1c2VkIGZvciBkaXNwYXRjaGluZy5cbiAgICpcbiAgICogQGludGVybmFsXG4gICAqL1xuICBEaXNwYXRjaGVyLnByb3RvdHlwZS4kRGlzcGF0Y2hlcl9zdG9wRGlzcGF0Y2hpbmc9ZnVuY3Rpb24oKSB7XG4gICAgdGhpcy4kRGlzcGF0Y2hlcl9wZW5kaW5nUGF5bG9hZCA9IG51bGw7XG4gICAgdGhpcy4kRGlzcGF0Y2hlcl9pc0Rpc3BhdGNoaW5nID0gZmFsc2U7XG4gIH07XG5cblxubW9kdWxlLmV4cG9ydHMgPSBuZXcgRGlzcGF0Y2hlcjtcbiIsIi8qKlxuICogQ29weXJpZ2h0IChjKSAyMDE0LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBCU0Qtc3R5bGUgbGljZW5zZSBmb3VuZCBpbiB0aGVcbiAqIExJQ0VOU0UgZmlsZSBpbiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS4gQW4gYWRkaXRpb25hbCBncmFudFxuICogb2YgcGF0ZW50IHJpZ2h0cyBjYW4gYmUgZm91bmQgaW4gdGhlIFBBVEVOVFMgZmlsZSBpbiB0aGUgc2FtZSBkaXJlY3RvcnkuXG4gKlxuICogQHByb3ZpZGVzTW9kdWxlIGludmFyaWFudFxuICovXG5cblwidXNlIHN0cmljdFwiO1xuXG4vKipcbiAqIFVzZSBpbnZhcmlhbnQoKSB0byBhc3NlcnQgc3RhdGUgd2hpY2ggeW91ciBwcm9ncmFtIGFzc3VtZXMgdG8gYmUgdHJ1ZS5cbiAqXG4gKiBQcm92aWRlIHNwcmludGYtc3R5bGUgZm9ybWF0IChvbmx5ICVzIGlzIHN1cHBvcnRlZCkgYW5kIGFyZ3VtZW50c1xuICogdG8gcHJvdmlkZSBpbmZvcm1hdGlvbiBhYm91dCB3aGF0IGJyb2tlIGFuZCB3aGF0IHlvdSB3ZXJlXG4gKiBleHBlY3RpbmcuXG4gKlxuICogVGhlIGludmFyaWFudCBtZXNzYWdlIHdpbGwgYmUgc3RyaXBwZWQgaW4gcHJvZHVjdGlvbiwgYnV0IHRoZSBpbnZhcmlhbnRcbiAqIHdpbGwgcmVtYWluIHRvIGVuc3VyZSBsb2dpYyBkb2VzIG5vdCBkaWZmZXIgaW4gcHJvZHVjdGlvbi5cbiAqL1xuXG52YXIgaW52YXJpYW50ID0gZnVuY3Rpb24oY29uZGl0aW9uLCBmb3JtYXQsIGEsIGIsIGMsIGQsIGUsIGYpIHtcbiAgaWYgKCFjb25kaXRpb24pIHtcbiAgICB2YXIgZXJyb3I7XG4gICAgaWYgKGZvcm1hdCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICBlcnJvciA9IG5ldyBFcnJvcihcbiAgICAgICAgJ01pbmlmaWVkIGV4Y2VwdGlvbiBvY2N1cnJlZDsgdXNlIHRoZSBub24tbWluaWZpZWQgZGV2IGVudmlyb25tZW50ICcgK1xuICAgICAgICAnZm9yIHRoZSBmdWxsIGVycm9yIG1lc3NhZ2UgYW5kIGFkZGl0aW9uYWwgaGVscGZ1bCB3YXJuaW5ncy4nXG4gICAgICApO1xuICAgIH0gZWxzZSB7XG4gICAgICB2YXIgYXJncyA9IFthLCBiLCBjLCBkLCBlLCBmXTtcbiAgICAgIHZhciBhcmdJbmRleCA9IDA7XG4gICAgICBlcnJvciA9IG5ldyBFcnJvcihcbiAgICAgICAgJ0ludmFyaWFudCBWaW9sYXRpb246ICcgK1xuICAgICAgICBmb3JtYXQucmVwbGFjZSgvJXMvZywgZnVuY3Rpb24oKSB7IHJldHVybiBhcmdzW2FyZ0luZGV4KytdOyB9KVxuICAgICAgKTtcbiAgICB9XG5cbiAgICBlcnJvci5mcmFtZXNUb1BvcCA9IDE7IC8vIHdlIGRvbid0IGNhcmUgYWJvdXQgaW52YXJpYW50J3Mgb3duIGZyYW1lXG4gICAgdGhyb3cgZXJyb3I7XG4gIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gaW52YXJpYW50O1xuIiwiLyoqIEBqc3ggUmVhY3QuRE9NICovXG5cbi8vIEhlbHBlcnNcbnZhciBFdmVudHMgPSByZXF1aXJlKCcuL0V2ZW50cycpO1xuXG4vLyBDbGFzc2VzXG52YXIgQWNjb3VudExpc3RDb21wb25lbnQgPSByZXF1aXJlKCcuL2NvbXBvbmVudHMvQWNjb3VudExpc3RDb21wb25lbnQnKTtcbnZhciBCYW5rTGlzdENvbXBvbmVudCA9IHJlcXVpcmUoJy4vY29tcG9uZW50cy9CYW5rTGlzdENvbXBvbmVudCcpO1xudmFyIENhdGVnb3J5Q29tcG9uZW50ID0gcmVxdWlyZSgnLi9jb21wb25lbnRzL0NhdGVnb3J5Q29tcG9uZW50Jyk7XG52YXIgQ2hhcnRDb21wb25lbnQgPSByZXF1aXJlKCcuL2NvbXBvbmVudHMvQ2hhcnRDb21wb25lbnQnKTtcbnZhciBPcGVyYXRpb25MaXN0Q29tcG9uZW50ID0gcmVxdWlyZSgnLi9jb21wb25lbnRzL09wZXJhdGlvbkxpc3RDb21wb25lbnQnKTtcbnZhciBTaW1pbGFyaXR5Q29tcG9uZW50ID0gcmVxdWlyZSgnLi9jb21wb25lbnRzL1NpbWlsYXJpdHlDb21wb25lbnQnKTtcblxuLy8gR2xvYmFsIHZhcmlhYmxlc1xudmFyIHN0b3JlID0gcmVxdWlyZSgnLi9zdG9yZScpO1xuXG4vLyBOb3cgdGhpcyByZWFsbHkgYmVnaW5zLlxudmFyIEtyZXN1cyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtkaXNwbGF5TmFtZTogJ0tyZXN1cycsXG5cbiAgICBnZXRJbml0aWFsU3RhdGU6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgc2hvd2luZzogJ3JlcG9ydHMnXG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgY29tcG9uZW50RGlkTW91bnQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAvLyBMZXQncyBnby5cbiAgICAgICAgc3RvcmUuZ2V0Q2F0ZWdvcmllcygpO1xuICAgICAgICBzdG9yZS5vbmNlKEV2ZW50cy5DQVRFR09SSUVTX0xPQURFRCwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBzdG9yZS5nZXRBbGxCYW5rcygpO1xuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgX3Nob3c6IGZ1bmN0aW9uKG5hbWUpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IHNob3dpbmc6IG5hbWUgfSk7XG4gICAgICAgIH0uYmluZCh0aGlzKTtcbiAgICB9LFxuXG4gICAgcmVuZGVyOiBmdW5jdGlvbigpIHtcblxuICAgICAgICB2YXIgbWFpbkNvbXBvbmVudDtcbiAgICAgICAgc3dpdGNoKHRoaXMuc3RhdGUuc2hvd2luZykge1xuICAgICAgICAgICAgY2FzZSBcInJlcG9ydHNcIjpcbiAgICAgICAgICAgICAgICBtYWluQ29tcG9uZW50ID0gT3BlcmF0aW9uTGlzdENvbXBvbmVudChudWxsKVxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBcImNoYXJ0c1wiOlxuICAgICAgICAgICAgICAgIG1haW5Db21wb25lbnQgPSBDaGFydENvbXBvbmVudChudWxsKVxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBcImNhdGVnb3JpZXNcIjpcbiAgICAgICAgICAgICAgICBtYWluQ29tcG9uZW50ID0gQ2F0ZWdvcnlDb21wb25lbnQobnVsbClcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgXCJzaW1pbGFyaXRpZXNcIjpcbiAgICAgICAgICAgICAgICBtYWluQ29tcG9uZW50ID0gU2ltaWxhcml0eUNvbXBvbmVudChudWxsKVxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBcInNldHRpbmdzXCI6XG4gICAgICAgICAgICAgICAgLy8gVE9ET1xuICAgICAgICAgICAgICAgIGFsZXJ0KCdOWUksIHNob3dpbmcgb3BlcmF0aW9ucyBsaXN0IGluc3RlYWQnKTtcbiAgICAgICAgICAgICAgICBtYWluQ29tcG9uZW50ID0gT3BlcmF0aW9uTGlzdENvbXBvbmVudChudWxsKVxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICBhbGVydCgndW5rbm93biBjb21wb25lbnQgdG8gcmVuZGVyOiAnICArIHRoaXMuc3RhdGUuc2hvd2luZyArICchJyk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gKFxuICAgICAgICBSZWFjdC5ET00uZGl2KG51bGwsIFxuICAgICAgICAgICAgUmVhY3QuRE9NLmRpdih7Y2xhc3NOYW1lOiBcInNpZGUtYmFyIHB1bGwtbGVmdFwifSwgXG4gICAgICAgICAgICAgICAgUmVhY3QuRE9NLmRpdih7Y2xhc3NOYW1lOiBcImxvZ28gc2lkZWJhcl9saWdodFwifSwgXG4gICAgICAgICAgICAgICAgICAgIFJlYWN0LkRPTS5hKHtocmVmOiBcIiNcIn0sIFwiS1JFU1VTXCIpXG4gICAgICAgICAgICAgICAgKSwgXG5cbiAgICAgICAgICAgICAgICBSZWFjdC5ET00uZGl2KHtjbGFzc05hbWU6IFwiZmlyX2RpdlwifSwgXG4gICAgICAgICAgICAgICAgICAgIFJlYWN0LkRPTS51bCh7Y2xhc3NOYW1lOiBcImJvcl9saVwifSwgXG4gICAgICAgICAgICAgICAgICAgICAgICBSZWFjdC5ET00ubGkoe2NsYXNzTmFtZTogXCJhY3RpdmVcIiwgb25DbGljazogdGhpcy5fc2hvdygncmVwb3J0cycpfSwgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgUmVhY3QuRE9NLnNwYW4oe2NsYXNzTmFtZTogXCJyZXAgbGlfc3RcIn0sIFwiIFwiKSwgXCJSZXBvcnRcIlxuICAgICAgICAgICAgICAgICAgICAgICAgKSwgXG4gICAgICAgICAgICAgICAgICAgICAgICBSZWFjdC5ET00ubGkoe2NsYXNzTmFtZTogXCJcIiwgb25DbGljazogdGhpcy5fc2hvdygnY2hhcnRzJyl9LCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBSZWFjdC5ET00uc3Bhbih7Y2xhc3NOYW1lOiBcImNociBsaV9zdFwifSwgXCIgXCIpLCBcIkNoYXJ0c1wiXG4gICAgICAgICAgICAgICAgICAgICAgICApLCBcbiAgICAgICAgICAgICAgICAgICAgICAgIFJlYWN0LkRPTS5saSh7Y2xhc3NOYW1lOiBcIlwiLCBvbkNsaWNrOiB0aGlzLl9zaG93KCdjYXRlZ29yaWVzJyl9LCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBSZWFjdC5ET00uc3Bhbih7Y2xhc3NOYW1lOiBcImNhdCBsaV9zdFwifSwgXCIgXCIpLCBcIkNhdGVnb3JpZXNcIlxuICAgICAgICAgICAgICAgICAgICAgICAgKSwgXG4gICAgICAgICAgICAgICAgICAgICAgICBSZWFjdC5ET00ubGkoe2NsYXNzTmFtZTogXCJcIiwgb25DbGljazogdGhpcy5fc2hvdygnc2ltaWxhcml0aWVzJyl9LCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBSZWFjdC5ET00uc3Bhbih7Y2xhc3NOYW1lOiBcInNpbSBsaV9zdFwifSwgXCIgXCIpLCBcIlNpbWlsYXJpdGllc1wiXG4gICAgICAgICAgICAgICAgICAgICAgICApLCBcbiAgICAgICAgICAgICAgICAgICAgICAgIFJlYWN0LkRPTS5saSh7Y2xhc3NOYW1lOiBcIlwiLCBvbkNsaWNrOiB0aGlzLl9zaG93KCdzZXR0aW5ncycpfSwgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgUmVhY3QuRE9NLnNwYW4oe2NsYXNzTmFtZTogXCJzZXQgbGlfc3RcIn0sIFwiIFwiKSwgXCJTZXR0aW5nc1wiXG4gICAgICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICApLCBcblxuICAgICAgICAgICAgICAgIFJlYWN0LkRPTS5kaXYoe2NsYXNzTmFtZTogXCJiYW5rX2RpdlwifSwgXG4gICAgICAgICAgICAgICAgICAgIFJlYWN0LkRPTS51bCh7Y2xhc3NOYW1lOiBcImJvcl9saV9ibmtcIn0sIFxuICAgICAgICAgICAgICAgICAgICAgICAgUmVhY3QuRE9NLmxpKG51bGwsIFJlYWN0LkRPTS5zcGFuKHtjbGFzc05hbWU6IFwiYmFuayBzZWNfc3RcIn0sIFwiIFwiKSwgXCJCYW5rc1wiKVxuICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgKSwgXG5cbiAgICAgICAgICAgICAgICBCYW5rTGlzdENvbXBvbmVudChudWxsKSwgXG4gICAgICAgICAgICAgICAgQWNjb3VudExpc3RDb21wb25lbnQobnVsbClcbiAgICAgICAgICAgICksIFxuXG4gICAgICAgICAgICBSZWFjdC5ET00uZGl2KHtjbGFzc05hbWU6IFwibWFpbi1ibG9jayBwdWxsLXJpZ2h0XCJ9LCBcbiAgICAgICAgICAgICAgICBSZWFjdC5ET00uZGl2KHtjbGFzc05hbWU6IFwibWFpbi1jb250YWluZXJcIn0sIFxuXG4gICAgICAgICAgICAgICAgICAgIG1haW5Db21wb25lbnRcblxuICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgIClcbiAgICAgICAgKVxuICAgICAgICApO1xuICAgIH1cbn0pO1xuXG5SZWFjdC5yZW5kZXJDb21wb25lbnQoS3Jlc3VzKG51bGwpLCBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjbWFpbicpKTtcbiIsInZhciBFRSA9IHJlcXVpcmUoJ2V2ZW50cycpLkV2ZW50RW1pdHRlcjtcbnZhciBFdmVudHMgPSByZXF1aXJlKCcuL0V2ZW50cycpO1xuXG52YXIgSGVscGVycyA9IHJlcXVpcmUoJy4vSGVscGVycycpO1xudmFyIGFzc2VydCA9IEhlbHBlcnMuYXNzZXJ0O1xudmFyIGRlYnVnID0gSGVscGVycy5kZWJ1ZztcbnZhciBoYXMgPSBIZWxwZXJzLmhhcztcbnZhciB4aHJFcnJvciA9IEhlbHBlcnMueGhyRXJyb3I7XG5cbnZhciBNb2RlbHMgPSByZXF1aXJlKCcuL01vZGVscycpO1xudmFyIEFjY291bnQgPSBNb2RlbHMuQWNjb3VudDtcbnZhciBCYW5rID0gTW9kZWxzLkJhbms7XG52YXIgQ2F0ZWdvcnkgPSBNb2RlbHMuQ2F0ZWdvcnk7XG52YXIgT3BlcmF0aW9uID0gTW9kZWxzLk9wZXJhdGlvbjtcblxudmFyIGZsdXggPSByZXF1aXJlKCcuL2ZsdXgvZGlzcGF0Y2hlcicpO1xuXG4vLyBIb2xkcyB0aGUgY3VycmVudCBiYW5rIGluZm9ybWF0aW9uXG52YXIgc3RvcmUgPSBuZXcgRUU7XG5cbnN0b3JlLmJhbmtzID0gW107XG5zdG9yZS5jYXRlZ29yaWVzID0gW107XG5zdG9yZS5jYXRlZ29yeUxhYmVsID0ge307IC8vIG1hcHMgY2F0ZWdvcnkgaWRzIHRvIGxhYmVsc1xuXG5zdG9yZS5hY2NvdW50cyA9IFtdOyAgICAvLyBmb3IgYSBnaXZlbiBiYW5rXG5zdG9yZS5vcGVyYXRpb25zID0gW107ICAvLyBmb3IgYSBnaXZlbiBhY2NvdW50XG5cbnN0b3JlLmN1cnJlbnRCYW5rID0gbnVsbDtcbnN0b3JlLmN1cnJlbnRBY2NvdW50ID0gbnVsbDtcblxuc3RvcmUuYWNjb3VudE9wZXJhdGlvbnMgPSB7fTsgLy8gYWNjb3VudCAtPiBvcGVyYXRpb25zXG5cbnN0b3JlLmdldEFsbEJhbmtzID0gZnVuY3Rpb24oKSB7XG4gICAgJC5nZXQoJ2JhbmtzJywge3dpdGhBY2NvdW50T25seTp0cnVlfSwgZnVuY3Rpb24gKGRhdGEpIHtcbiAgICAgICAgdmFyIGJhbmtzID0gW11cbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBkYXRhLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICB2YXIgYiA9IG5ldyBCYW5rKGRhdGFbaV0pO1xuICAgICAgICAgICAgYmFua3MucHVzaChiKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGZsdXguZGlzcGF0Y2goe1xuICAgICAgICAgICAgdHlwZTogRXZlbnRzLkJBTktfTElTVF9MT0FERUQsXG4gICAgICAgICAgICBsaXN0OiBiYW5rc1xuICAgICAgICB9KTtcblxuICAgICAgICBpZiAoYmFua3MubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgZmx1eC5kaXNwYXRjaCh7XG4gICAgICAgICAgICAgICAgdHlwZTogRXZlbnRzLlNFTEVDVEVEX0JBTktfQ0hBTkdFRCxcbiAgICAgICAgICAgICAgICBiYW5rOiBiYW5rc1swXVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9KS5mYWlsKHhockVycm9yKTtcbn1cblxuc3RvcmUubG9hZEFsbEFjY291bnRzID0gZnVuY3Rpb24gKCkge1xuICAgIGhhcyh0aGlzLCAnY3VycmVudEJhbmsnKTtcbiAgICBhc3NlcnQodGhpcy5jdXJyZW50QmFuayBpbnN0YW5jZW9mIEJhbmspO1xuXG4gICAgJC5nZXQoJ2JhbmtzL2dldEFjY291bnRzLycgKyB0aGlzLmN1cnJlbnRCYW5rLmlkLCBmdW5jdGlvbiAoZGF0YSkge1xuXG4gICAgICAgIHZhciBhY2NvdW50cyA9IFtdXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZGF0YS5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgYWNjb3VudHMucHVzaChuZXcgQWNjb3VudChkYXRhW2ldKSk7XG4gICAgICAgIH1cblxuICAgICAgICBmbHV4LmRpc3BhdGNoKHtcbiAgICAgICAgICAgIHR5cGU6IEV2ZW50cy5BQ0NPVU5UU19MT0FERUQsXG4gICAgICAgICAgICBhY2NvdW50czogYWNjb3VudHNcbiAgICAgICAgfSk7XG5cbiAgICAgICAgaWYgKGFjY291bnRzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIGZsdXguZGlzcGF0Y2goe1xuICAgICAgICAgICAgICAgIHR5cGU6IEV2ZW50cy5TRUxFQ1RFRF9BQ0NPVU5UX0NIQU5HRUQsXG4gICAgICAgICAgICAgICAgYWNjb3VudDogYWNjb3VudHNbMF1cbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMTsgaSA8IGFjY291bnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgc3RvcmUubG9hZE9wZXJhdGlvbnNGb3JJbXBsKGFjY291bnRzW2ldLCAvKiBwcm9wYWdhdGUgPSAqLyBmYWxzZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9KS5mYWlsKHhockVycm9yKTtcbn1cblxuc3RvcmUubG9hZE9wZXJhdGlvbnNGb3JJbXBsID0gZnVuY3Rpb24oYWNjb3VudCwgcHJvcGFnYXRlKSB7XG4gICAgJC5nZXQoJ2FjY291bnRzL2dldE9wZXJhdGlvbnMvJyArIGFjY291bnQuaWQsIGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgICAgIHZhciBvcGVyYXRpb25zID0gW107XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZGF0YS5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgdmFyIG8gPSBuZXcgT3BlcmF0aW9uKGRhdGFbaV0pXG4gICAgICAgICAgICBvcGVyYXRpb25zLnB1c2gobyk7XG4gICAgICAgIH1cblxuICAgICAgICBzdG9yZS5hY2NvdW50T3BlcmF0aW9uc1thY2NvdW50LmlkXSA9IG9wZXJhdGlvbnM7XG5cbiAgICAgICAgaWYgKHByb3BhZ2F0ZSkge1xuICAgICAgICAgICAgZmx1eC5kaXNwYXRjaCh7XG4gICAgICAgICAgICAgICAgdHlwZTogRXZlbnRzLk9QRVJBVElPTlNfTE9BREVELFxuICAgICAgICAgICAgICAgIG9wZXJhdGlvbnM6IG9wZXJhdGlvbnNcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfSkuZmFpbCh4aHJFcnJvcik7XG59O1xuXG5zdG9yZS5sb2FkT3BlcmF0aW9uc0ZvciA9IGZ1bmN0aW9uKGFjY291bnQpIHtcbiAgICB0aGlzLmxvYWRPcGVyYXRpb25zRm9ySW1wbChhY2NvdW50LCAvKiBwcm9wYWdhdGUgPSAqLyB0cnVlKTtcbn1cblxuc3RvcmUuZmV0Y2hPcGVyYXRpb25zID0gZnVuY3Rpb24oKSB7XG4gICAgYXNzZXJ0KHRoaXMuY3VycmVudEFjY291bnQgIT09IG51bGwpO1xuICAgICQuZ2V0KCdhY2NvdW50cy9yZXRyaWV2ZU9wZXJhdGlvbnMvJyArIHRoaXMuY3VycmVudEFjY291bnQuaWQsIGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgICAgIHN0b3JlLmN1cnJlbnRBY2NvdW50ID0gbmV3IEFjY291bnQoZGF0YSk7XG4gICAgICAgIHN0b3JlLmxvYWRPcGVyYXRpb25zRm9yKHN0b3JlLmN1cnJlbnRBY2NvdW50KTtcbiAgICB9KS5mYWlsKHhockVycm9yKTtcbn07XG5cbnN0b3JlLmdldENhdGVnb3JpZXMgPSBmdW5jdGlvbigpIHtcbiAgICAkLmdldCgnY2F0ZWdvcmllcycsIGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgICAgIHZhciBjYXRlZ29yaWVzID0gW11cbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBkYXRhLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICB2YXIgYyA9IG5ldyBDYXRlZ29yeShkYXRhW2ldKTtcbiAgICAgICAgICAgIGNhdGVnb3JpZXMucHVzaChjKVxuICAgICAgICB9XG5cbiAgICAgICAgZmx1eC5kaXNwYXRjaCh7XG4gICAgICAgICAgICB0eXBlOiBFdmVudHMuQ0FURUdPUklFU19MT0FERUQsXG4gICAgICAgICAgICBjYXRlZ29yaWVzOiBjYXRlZ29yaWVzXG4gICAgICAgIH0pO1xuICAgIH0pLmZhaWwoeGhyRXJyb3IpO1xufTtcblxuc3RvcmUuYWRkQ2F0ZWdvcnkgPSBmdW5jdGlvbihjYXRlZ29yeSkge1xuICAgICQucG9zdCgnY2F0ZWdvcmllcycsIGNhdGVnb3J5LCBmdW5jdGlvbiAoZGF0YSkge1xuICAgICAgICBmbHV4LmRpc3BhdGNoKHtcbiAgICAgICAgICAgIHR5cGU6IEV2ZW50cy5DQVRFR09SWV9TQVZFRFxuICAgICAgICB9KTtcbiAgICB9KS5mYWlsKHhockVycm9yKTtcbn1cblxuc3RvcmUuY2F0ZWdvcnlUb0xhYmVsID0gZnVuY3Rpb24oaWQpIHtcbiAgICBhc3NlcnQodHlwZW9mIHRoaXMuY2F0ZWdvcnlMYWJlbFtpZF0gIT09ICd1bmRlZmluZWQnLFxuICAgICAgICAgICdjYXRlZ29yeVRvTGFiZWwgbG9va3VwIGZhaWxlZCBmb3IgaWQ6ICcgKyBpZCk7XG4gICAgcmV0dXJuIHRoaXMuY2F0ZWdvcnlMYWJlbFtpZF07XG59XG5cbnN0b3JlLnNldENhdGVnb3JpZXMgPSBmdW5jdGlvbihjYXQpIHtcbiAgICB0aGlzLmNhdGVnb3JpZXMgPSBbbmV3IENhdGVnb3J5KHtpZDogJy0xJywgdGl0bGU6ICdOb25lJ30pXS5jb25jYXQoY2F0KTtcbiAgICB0aGlzLmNhdGVnb3J5TGFiZWwgPSB7fTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuY2F0ZWdvcmllcy5sZW5ndGg7IGkrKykge1xuICAgICAgICB2YXIgYyA9IHRoaXMuY2F0ZWdvcmllc1tpXTtcbiAgICAgICAgaGFzKGMsICdpZCcpO1xuICAgICAgICBoYXMoYywgJ3RpdGxlJyk7XG4gICAgICAgIHRoaXMuY2F0ZWdvcnlMYWJlbFtjLmlkXSA9IGMudGl0bGU7XG4gICAgfVxufVxuXG5zdG9yZS51cGRhdGVDYXRlZ29yeUZvck9wZXJhdGlvbiA9IGZ1bmN0aW9uKG9wZXJhdGlvbklkLCBjYXRlZ29yeUlkKSB7XG4gICAgJC5hamF4KHtcbiAgICAgICAgdXJsOidvcGVyYXRpb25zLycgKyBvcGVyYXRpb25JZCxcbiAgICAgICAgdHlwZTogJ1BVVCcsXG4gICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgIGNhdGVnb3J5SWQ6IGNhdGVnb3J5SWRcbiAgICAgICAgfSxcbiAgICAgICAgc3VjY2VzczogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgZmx1eC5kaXNwYXRjaCh7XG4gICAgICAgICAgICAgICAgdHlwZTogRXZlbnRzLk9QRVJBVElPTl9DQVRFR09SWV9TQVZFRFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sXG4gICAgICAgIGVycm9yOiB4aHJFcnJvclxuICAgIH0pO1xufVxuXG5zdG9yZS5kZWxldGVPcGVyYXRpb24gPSBmdW5jdGlvbihvcGVyYXRpb24pIHtcbiAgICBhc3NlcnQob3BlcmF0aW9uIGluc3RhbmNlb2YgT3BlcmF0aW9uKTtcbiAgICAkLmFqYXgoe1xuICAgICAgICB1cmw6ICdvcGVyYXRpb25zLycgKyBvcGVyYXRpb24uaWQsXG4gICAgICAgIHR5cGU6ICdERUxFVEUnLFxuICAgICAgICBzdWNjZXNzOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGZsdXguZGlzcGF0Y2goe1xuICAgICAgICAgICAgICAgIHR5cGU6IEV2ZW50cy5ERUxFVEVEX09QRVJBVElPTlxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sXG4gICAgICAgIGVycm9yOiB4aHJFcnJvclxuICAgIH0pO1xufVxuXG5zdG9yZS5nZXRPcGVyYXRpb25zT2ZBbGxBY2NvdW50cyA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBvcHMgPSBbXTtcbiAgICBmb3IgKHZhciBhY2MgaW4gdGhpcy5hY2NvdW50T3BlcmF0aW9ucykge1xuICAgICAgICBvcHMgPSBvcHMuY29uY2F0KHRoaXMuYWNjb3VudE9wZXJhdGlvbnNbYWNjXSk7XG4gICAgfVxuICAgIHJldHVybiBvcHM7XG59XG5cbmZsdXgucmVnaXN0ZXIoZnVuY3Rpb24oYWN0aW9uKSB7XG4gICAgc3dpdGNoIChhY3Rpb24udHlwZSkge1xuXG4gICAgICBjYXNlIEV2ZW50cy5BQ0NPVU5UU19MT0FERUQ6XG4gICAgICAgIGhhcyhhY3Rpb24sICdhY2NvdW50cycpO1xuICAgICAgICBpZiAoYWN0aW9uLmFjY291bnRzLmxlbmd0aCA+IDApXG4gICAgICAgICAgICBhc3NlcnQoYWN0aW9uLmFjY291bnRzWzBdIGluc3RhbmNlb2YgQWNjb3VudCk7XG4gICAgICAgIHN0b3JlLmFjY291bnRzID0gYWN0aW9uLmFjY291bnRzO1xuICAgICAgICBzdG9yZS5lbWl0KEV2ZW50cy5BQ0NPVU5UU19MT0FERUQpO1xuICAgICAgICBicmVhaztcblxuICAgICAgY2FzZSBFdmVudHMuQkFOS19MSVNUX0xPQURFRDpcbiAgICAgICAgaGFzKGFjdGlvbiwgJ2xpc3QnKTtcbiAgICAgICAgc3RvcmUuYmFua3MgPSBhY3Rpb24ubGlzdDtcbiAgICAgICAgc3RvcmUuZW1pdChFdmVudHMuQkFOS19MSVNUX0xPQURFRCk7XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBjYXNlIEV2ZW50cy5DQVRFR09SSUVTX0xPQURFRDpcbiAgICAgICAgaGFzKGFjdGlvbiwgJ2NhdGVnb3JpZXMnKTtcbiAgICAgICAgc3RvcmUuc2V0Q2F0ZWdvcmllcyhhY3Rpb24uY2F0ZWdvcmllcyk7XG4gICAgICAgIHN0b3JlLmVtaXQoRXZlbnRzLkNBVEVHT1JJRVNfTE9BREVEKTtcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGNhc2UgRXZlbnRzLkNBVEVHT1JZX0NSRUFURUQ6XG4gICAgICAgIGhhcyhhY3Rpb24sICdjYXRlZ29yeScpO1xuICAgICAgICBzdG9yZS5hZGRDYXRlZ29yeShhY3Rpb24uY2F0ZWdvcnkpO1xuICAgICAgICAvLyBObyBuZWVkIHRvIGZvcndhcmRcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGNhc2UgRXZlbnRzLkNBVEVHT1JZX1NBVkVEOlxuICAgICAgICBzdG9yZS5nZXRDYXRlZ29yaWVzKCk7XG4gICAgICAgIC8vIE5vIG5lZWQgdG8gZm9yd2FyZFxuICAgICAgICBicmVhaztcblxuICAgICAgY2FzZSBFdmVudHMuREVMRVRFX09QRVJBVElPTjpcbiAgICAgICAgaGFzKGFjdGlvbiwgJ29wZXJhdGlvbicpO1xuICAgICAgICBhc3NlcnQoYWN0aW9uLm9wZXJhdGlvbiBpbnN0YW5jZW9mIE9wZXJhdGlvbik7XG4gICAgICAgIHN0b3JlLmRlbGV0ZU9wZXJhdGlvbihhY3Rpb24ub3BlcmF0aW9uKTtcbiAgICAgICAgLy8gTm8gbmVlZCB0byBmb3J3YXJkXG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBjYXNlIEV2ZW50cy5ERUxFVEVEX09QRVJBVElPTjpcbiAgICAgICAgYXNzZXJ0KHR5cGVvZiBzdG9yZS5jdXJyZW50QWNjb3VudCAhPT0gJ3VuZGVmaW5lZCcpO1xuICAgICAgICBzdG9yZS5sb2FkT3BlcmF0aW9uc0ZvcihzdG9yZS5jdXJyZW50QWNjb3VudCk7XG4gICAgICAgIC8vIE5vIG5lZWQgdG8gZm9yd2FyZFxuICAgICAgICBicmVhaztcblxuICAgICAgY2FzZSBFdmVudHMuT1BFUkFUSU9OX0NBVEVHT1JZX0NIQU5HRUQ6XG4gICAgICAgIGhhcyhhY3Rpb24sICdvcGVyYXRpb25JZCcpO1xuICAgICAgICBoYXMoYWN0aW9uLCAnY2F0ZWdvcnlJZCcpO1xuICAgICAgICBzdG9yZS51cGRhdGVDYXRlZ29yeUZvck9wZXJhdGlvbihhY3Rpb24ub3BlcmF0aW9uSWQsIGFjdGlvbi5jYXRlZ29yeUlkKTtcbiAgICAgICAgLy8gTm8gbmVlZCB0byBmb3J3YXJkXG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBjYXNlIEV2ZW50cy5PUEVSQVRJT05fQ0FURUdPUllfU0FWRUQ6XG4gICAgICAgIHN0b3JlLmVtaXQoRXZlbnRzLk9QRVJBVElPTl9DQVRFR09SWV9TQVZFRCk7XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBjYXNlIEV2ZW50cy5PUEVSQVRJT05TX0xPQURFRDpcbiAgICAgICAgaGFzKGFjdGlvbiwgJ29wZXJhdGlvbnMnKTtcbiAgICAgICAgaWYgKGFjdGlvbi5vcGVyYXRpb25zLmxlbmd0aCA+IDApXG4gICAgICAgICAgICBhc3NlcnQoYWN0aW9uLm9wZXJhdGlvbnNbMF0gaW5zdGFuY2VvZiBPcGVyYXRpb24pO1xuICAgICAgICBzdG9yZS5vcGVyYXRpb25zID0gYWN0aW9uLm9wZXJhdGlvbnM7XG4gICAgICAgIHN0b3JlLmVtaXQoRXZlbnRzLk9QRVJBVElPTlNfTE9BREVEKTtcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGNhc2UgRXZlbnRzLlJFVFJJRVZFX09QRVJBVElPTlNfUVVFUklFRDpcbiAgICAgICAgc3RvcmUuZmV0Y2hPcGVyYXRpb25zKCk7XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBjYXNlIEV2ZW50cy5TRUxFQ1RFRF9BQ0NPVU5UX0NIQU5HRUQ6XG4gICAgICAgIGhhcyhhY3Rpb24sICdhY2NvdW50Jyk7XG4gICAgICAgIGFzc2VydChhY3Rpb24uYWNjb3VudCBpbnN0YW5jZW9mIEFjY291bnQpO1xuICAgICAgICBzdG9yZS5jdXJyZW50QWNjb3VudCA9IGFjdGlvbi5hY2NvdW50O1xuICAgICAgICBzdG9yZS5sb2FkT3BlcmF0aW9uc0ZvcihhY3Rpb24uYWNjb3VudCk7XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBjYXNlIEV2ZW50cy5TRUxFQ1RFRF9CQU5LX0NIQU5HRUQ6XG4gICAgICAgIGhhcyhhY3Rpb24sICdiYW5rJyk7XG4gICAgICAgIGFzc2VydChhY3Rpb24uYmFuayBpbnN0YW5jZW9mIEJhbmspO1xuICAgICAgICBzdG9yZS5jdXJyZW50QmFuayA9IGFjdGlvbi5iYW5rO1xuICAgICAgICBzdG9yZS5sb2FkQWxsQWNjb3VudHMoKTtcbiAgICAgICAgc3RvcmUuZW1pdChFdmVudHMuU0VMRUNURURfQkFOS19DSEFOR0VEKTtcbiAgICAgICAgYnJlYWs7XG5cbiAgICB9XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBzdG9yZTtcbiIsIi8vIENvcHlyaWdodCBKb3llbnQsIEluYy4gYW5kIG90aGVyIE5vZGUgY29udHJpYnV0b3JzLlxuLy9cbi8vIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhXG4vLyBjb3B5IG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlXG4vLyBcIlNvZnR3YXJlXCIpLCB0byBkZWFsIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmdcbi8vIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCxcbi8vIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXRcbi8vIHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXMgZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZVxuLy8gZm9sbG93aW5nIGNvbmRpdGlvbnM6XG4vL1xuLy8gVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWRcbi8vIGluIGFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuLy9cbi8vIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1Ncbi8vIE9SIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0Zcbi8vIE1FUkNIQU5UQUJJTElUWSwgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU5cbi8vIE5PIEVWRU5UIFNIQUxMIFRIRSBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLFxuLy8gREFNQUdFUyBPUiBPVEhFUiBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SXG4vLyBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSwgT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFXG4vLyBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU4gVEhFIFNPRlRXQVJFLlxuXG5mdW5jdGlvbiBFdmVudEVtaXR0ZXIoKSB7XG4gIHRoaXMuX2V2ZW50cyA9IHRoaXMuX2V2ZW50cyB8fCB7fTtcbiAgdGhpcy5fbWF4TGlzdGVuZXJzID0gdGhpcy5fbWF4TGlzdGVuZXJzIHx8IHVuZGVmaW5lZDtcbn1cbm1vZHVsZS5leHBvcnRzID0gRXZlbnRFbWl0dGVyO1xuXG4vLyBCYWNrd2FyZHMtY29tcGF0IHdpdGggbm9kZSAwLjEwLnhcbkV2ZW50RW1pdHRlci5FdmVudEVtaXR0ZXIgPSBFdmVudEVtaXR0ZXI7XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuX2V2ZW50cyA9IHVuZGVmaW5lZDtcbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuX21heExpc3RlbmVycyA9IHVuZGVmaW5lZDtcblxuLy8gQnkgZGVmYXVsdCBFdmVudEVtaXR0ZXJzIHdpbGwgcHJpbnQgYSB3YXJuaW5nIGlmIG1vcmUgdGhhbiAxMCBsaXN0ZW5lcnMgYXJlXG4vLyBhZGRlZCB0byBpdC4gVGhpcyBpcyBhIHVzZWZ1bCBkZWZhdWx0IHdoaWNoIGhlbHBzIGZpbmRpbmcgbWVtb3J5IGxlYWtzLlxuRXZlbnRFbWl0dGVyLmRlZmF1bHRNYXhMaXN0ZW5lcnMgPSAxMDtcblxuLy8gT2J2aW91c2x5IG5vdCBhbGwgRW1pdHRlcnMgc2hvdWxkIGJlIGxpbWl0ZWQgdG8gMTAuIFRoaXMgZnVuY3Rpb24gYWxsb3dzXG4vLyB0aGF0IHRvIGJlIGluY3JlYXNlZC4gU2V0IHRvIHplcm8gZm9yIHVubGltaXRlZC5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuc2V0TWF4TGlzdGVuZXJzID0gZnVuY3Rpb24obikge1xuICBpZiAoIWlzTnVtYmVyKG4pIHx8IG4gPCAwIHx8IGlzTmFOKG4pKVxuICAgIHRocm93IFR5cGVFcnJvcignbiBtdXN0IGJlIGEgcG9zaXRpdmUgbnVtYmVyJyk7XG4gIHRoaXMuX21heExpc3RlbmVycyA9IG47XG4gIHJldHVybiB0aGlzO1xufTtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5lbWl0ID0gZnVuY3Rpb24odHlwZSkge1xuICB2YXIgZXIsIGhhbmRsZXIsIGxlbiwgYXJncywgaSwgbGlzdGVuZXJzO1xuXG4gIGlmICghdGhpcy5fZXZlbnRzKVxuICAgIHRoaXMuX2V2ZW50cyA9IHt9O1xuXG4gIC8vIElmIHRoZXJlIGlzIG5vICdlcnJvcicgZXZlbnQgbGlzdGVuZXIgdGhlbiB0aHJvdy5cbiAgaWYgKHR5cGUgPT09ICdlcnJvcicpIHtcbiAgICBpZiAoIXRoaXMuX2V2ZW50cy5lcnJvciB8fFxuICAgICAgICAoaXNPYmplY3QodGhpcy5fZXZlbnRzLmVycm9yKSAmJiAhdGhpcy5fZXZlbnRzLmVycm9yLmxlbmd0aCkpIHtcbiAgICAgIGVyID0gYXJndW1lbnRzWzFdO1xuICAgICAgaWYgKGVyIGluc3RhbmNlb2YgRXJyb3IpIHtcbiAgICAgICAgdGhyb3cgZXI7IC8vIFVuaGFuZGxlZCAnZXJyb3InIGV2ZW50XG4gICAgICB9XG4gICAgICB0aHJvdyBUeXBlRXJyb3IoJ1VuY2F1Z2h0LCB1bnNwZWNpZmllZCBcImVycm9yXCIgZXZlbnQuJyk7XG4gICAgfVxuICB9XG5cbiAgaGFuZGxlciA9IHRoaXMuX2V2ZW50c1t0eXBlXTtcblxuICBpZiAoaXNVbmRlZmluZWQoaGFuZGxlcikpXG4gICAgcmV0dXJuIGZhbHNlO1xuXG4gIGlmIChpc0Z1bmN0aW9uKGhhbmRsZXIpKSB7XG4gICAgc3dpdGNoIChhcmd1bWVudHMubGVuZ3RoKSB7XG4gICAgICAvLyBmYXN0IGNhc2VzXG4gICAgICBjYXNlIDE6XG4gICAgICAgIGhhbmRsZXIuY2FsbCh0aGlzKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIDI6XG4gICAgICAgIGhhbmRsZXIuY2FsbCh0aGlzLCBhcmd1bWVudHNbMV0pO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgMzpcbiAgICAgICAgaGFuZGxlci5jYWxsKHRoaXMsIGFyZ3VtZW50c1sxXSwgYXJndW1lbnRzWzJdKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICAvLyBzbG93ZXJcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIGxlbiA9IGFyZ3VtZW50cy5sZW5ndGg7XG4gICAgICAgIGFyZ3MgPSBuZXcgQXJyYXkobGVuIC0gMSk7XG4gICAgICAgIGZvciAoaSA9IDE7IGkgPCBsZW47IGkrKylcbiAgICAgICAgICBhcmdzW2kgLSAxXSA9IGFyZ3VtZW50c1tpXTtcbiAgICAgICAgaGFuZGxlci5hcHBseSh0aGlzLCBhcmdzKTtcbiAgICB9XG4gIH0gZWxzZSBpZiAoaXNPYmplY3QoaGFuZGxlcikpIHtcbiAgICBsZW4gPSBhcmd1bWVudHMubGVuZ3RoO1xuICAgIGFyZ3MgPSBuZXcgQXJyYXkobGVuIC0gMSk7XG4gICAgZm9yIChpID0gMTsgaSA8IGxlbjsgaSsrKVxuICAgICAgYXJnc1tpIC0gMV0gPSBhcmd1bWVudHNbaV07XG5cbiAgICBsaXN0ZW5lcnMgPSBoYW5kbGVyLnNsaWNlKCk7XG4gICAgbGVuID0gbGlzdGVuZXJzLmxlbmd0aDtcbiAgICBmb3IgKGkgPSAwOyBpIDwgbGVuOyBpKyspXG4gICAgICBsaXN0ZW5lcnNbaV0uYXBwbHkodGhpcywgYXJncyk7XG4gIH1cblxuICByZXR1cm4gdHJ1ZTtcbn07XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuYWRkTGlzdGVuZXIgPSBmdW5jdGlvbih0eXBlLCBsaXN0ZW5lcikge1xuICB2YXIgbTtcblxuICBpZiAoIWlzRnVuY3Rpb24obGlzdGVuZXIpKVxuICAgIHRocm93IFR5cGVFcnJvcignbGlzdGVuZXIgbXVzdCBiZSBhIGZ1bmN0aW9uJyk7XG5cbiAgaWYgKCF0aGlzLl9ldmVudHMpXG4gICAgdGhpcy5fZXZlbnRzID0ge307XG5cbiAgLy8gVG8gYXZvaWQgcmVjdXJzaW9uIGluIHRoZSBjYXNlIHRoYXQgdHlwZSA9PT0gXCJuZXdMaXN0ZW5lclwiISBCZWZvcmVcbiAgLy8gYWRkaW5nIGl0IHRvIHRoZSBsaXN0ZW5lcnMsIGZpcnN0IGVtaXQgXCJuZXdMaXN0ZW5lclwiLlxuICBpZiAodGhpcy5fZXZlbnRzLm5ld0xpc3RlbmVyKVxuICAgIHRoaXMuZW1pdCgnbmV3TGlzdGVuZXInLCB0eXBlLFxuICAgICAgICAgICAgICBpc0Z1bmN0aW9uKGxpc3RlbmVyLmxpc3RlbmVyKSA/XG4gICAgICAgICAgICAgIGxpc3RlbmVyLmxpc3RlbmVyIDogbGlzdGVuZXIpO1xuXG4gIGlmICghdGhpcy5fZXZlbnRzW3R5cGVdKVxuICAgIC8vIE9wdGltaXplIHRoZSBjYXNlIG9mIG9uZSBsaXN0ZW5lci4gRG9uJ3QgbmVlZCB0aGUgZXh0cmEgYXJyYXkgb2JqZWN0LlxuICAgIHRoaXMuX2V2ZW50c1t0eXBlXSA9IGxpc3RlbmVyO1xuICBlbHNlIGlmIChpc09iamVjdCh0aGlzLl9ldmVudHNbdHlwZV0pKVxuICAgIC8vIElmIHdlJ3ZlIGFscmVhZHkgZ290IGFuIGFycmF5LCBqdXN0IGFwcGVuZC5cbiAgICB0aGlzLl9ldmVudHNbdHlwZV0ucHVzaChsaXN0ZW5lcik7XG4gIGVsc2VcbiAgICAvLyBBZGRpbmcgdGhlIHNlY29uZCBlbGVtZW50LCBuZWVkIHRvIGNoYW5nZSB0byBhcnJheS5cbiAgICB0aGlzLl9ldmVudHNbdHlwZV0gPSBbdGhpcy5fZXZlbnRzW3R5cGVdLCBsaXN0ZW5lcl07XG5cbiAgLy8gQ2hlY2sgZm9yIGxpc3RlbmVyIGxlYWtcbiAgaWYgKGlzT2JqZWN0KHRoaXMuX2V2ZW50c1t0eXBlXSkgJiYgIXRoaXMuX2V2ZW50c1t0eXBlXS53YXJuZWQpIHtcbiAgICB2YXIgbTtcbiAgICBpZiAoIWlzVW5kZWZpbmVkKHRoaXMuX21heExpc3RlbmVycykpIHtcbiAgICAgIG0gPSB0aGlzLl9tYXhMaXN0ZW5lcnM7XG4gICAgfSBlbHNlIHtcbiAgICAgIG0gPSBFdmVudEVtaXR0ZXIuZGVmYXVsdE1heExpc3RlbmVycztcbiAgICB9XG5cbiAgICBpZiAobSAmJiBtID4gMCAmJiB0aGlzLl9ldmVudHNbdHlwZV0ubGVuZ3RoID4gbSkge1xuICAgICAgdGhpcy5fZXZlbnRzW3R5cGVdLndhcm5lZCA9IHRydWU7XG4gICAgICBjb25zb2xlLmVycm9yKCcobm9kZSkgd2FybmluZzogcG9zc2libGUgRXZlbnRFbWl0dGVyIG1lbW9yeSAnICtcbiAgICAgICAgICAgICAgICAgICAgJ2xlYWsgZGV0ZWN0ZWQuICVkIGxpc3RlbmVycyBhZGRlZC4gJyArXG4gICAgICAgICAgICAgICAgICAgICdVc2UgZW1pdHRlci5zZXRNYXhMaXN0ZW5lcnMoKSB0byBpbmNyZWFzZSBsaW1pdC4nLFxuICAgICAgICAgICAgICAgICAgICB0aGlzLl9ldmVudHNbdHlwZV0ubGVuZ3RoKTtcbiAgICAgIGlmICh0eXBlb2YgY29uc29sZS50cmFjZSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAvLyBub3Qgc3VwcG9ydGVkIGluIElFIDEwXG4gICAgICAgIGNvbnNvbGUudHJhY2UoKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICByZXR1cm4gdGhpcztcbn07XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUub24gPSBFdmVudEVtaXR0ZXIucHJvdG90eXBlLmFkZExpc3RlbmVyO1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLm9uY2UgPSBmdW5jdGlvbih0eXBlLCBsaXN0ZW5lcikge1xuICBpZiAoIWlzRnVuY3Rpb24obGlzdGVuZXIpKVxuICAgIHRocm93IFR5cGVFcnJvcignbGlzdGVuZXIgbXVzdCBiZSBhIGZ1bmN0aW9uJyk7XG5cbiAgdmFyIGZpcmVkID0gZmFsc2U7XG5cbiAgZnVuY3Rpb24gZygpIHtcbiAgICB0aGlzLnJlbW92ZUxpc3RlbmVyKHR5cGUsIGcpO1xuXG4gICAgaWYgKCFmaXJlZCkge1xuICAgICAgZmlyZWQgPSB0cnVlO1xuICAgICAgbGlzdGVuZXIuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICB9XG4gIH1cblxuICBnLmxpc3RlbmVyID0gbGlzdGVuZXI7XG4gIHRoaXMub24odHlwZSwgZyk7XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vLyBlbWl0cyBhICdyZW1vdmVMaXN0ZW5lcicgZXZlbnQgaWZmIHRoZSBsaXN0ZW5lciB3YXMgcmVtb3ZlZFxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5yZW1vdmVMaXN0ZW5lciA9IGZ1bmN0aW9uKHR5cGUsIGxpc3RlbmVyKSB7XG4gIHZhciBsaXN0LCBwb3NpdGlvbiwgbGVuZ3RoLCBpO1xuXG4gIGlmICghaXNGdW5jdGlvbihsaXN0ZW5lcikpXG4gICAgdGhyb3cgVHlwZUVycm9yKCdsaXN0ZW5lciBtdXN0IGJlIGEgZnVuY3Rpb24nKTtcblxuICBpZiAoIXRoaXMuX2V2ZW50cyB8fCAhdGhpcy5fZXZlbnRzW3R5cGVdKVxuICAgIHJldHVybiB0aGlzO1xuXG4gIGxpc3QgPSB0aGlzLl9ldmVudHNbdHlwZV07XG4gIGxlbmd0aCA9IGxpc3QubGVuZ3RoO1xuICBwb3NpdGlvbiA9IC0xO1xuXG4gIGlmIChsaXN0ID09PSBsaXN0ZW5lciB8fFxuICAgICAgKGlzRnVuY3Rpb24obGlzdC5saXN0ZW5lcikgJiYgbGlzdC5saXN0ZW5lciA9PT0gbGlzdGVuZXIpKSB7XG4gICAgZGVsZXRlIHRoaXMuX2V2ZW50c1t0eXBlXTtcbiAgICBpZiAodGhpcy5fZXZlbnRzLnJlbW92ZUxpc3RlbmVyKVxuICAgICAgdGhpcy5lbWl0KCdyZW1vdmVMaXN0ZW5lcicsIHR5cGUsIGxpc3RlbmVyKTtcblxuICB9IGVsc2UgaWYgKGlzT2JqZWN0KGxpc3QpKSB7XG4gICAgZm9yIChpID0gbGVuZ3RoOyBpLS0gPiAwOykge1xuICAgICAgaWYgKGxpc3RbaV0gPT09IGxpc3RlbmVyIHx8XG4gICAgICAgICAgKGxpc3RbaV0ubGlzdGVuZXIgJiYgbGlzdFtpXS5saXN0ZW5lciA9PT0gbGlzdGVuZXIpKSB7XG4gICAgICAgIHBvc2l0aW9uID0gaTtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHBvc2l0aW9uIDwgMClcbiAgICAgIHJldHVybiB0aGlzO1xuXG4gICAgaWYgKGxpc3QubGVuZ3RoID09PSAxKSB7XG4gICAgICBsaXN0Lmxlbmd0aCA9IDA7XG4gICAgICBkZWxldGUgdGhpcy5fZXZlbnRzW3R5cGVdO1xuICAgIH0gZWxzZSB7XG4gICAgICBsaXN0LnNwbGljZShwb3NpdGlvbiwgMSk7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuX2V2ZW50cy5yZW1vdmVMaXN0ZW5lcilcbiAgICAgIHRoaXMuZW1pdCgncmVtb3ZlTGlzdGVuZXInLCB0eXBlLCBsaXN0ZW5lcik7XG4gIH1cblxuICByZXR1cm4gdGhpcztcbn07XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUucmVtb3ZlQWxsTGlzdGVuZXJzID0gZnVuY3Rpb24odHlwZSkge1xuICB2YXIga2V5LCBsaXN0ZW5lcnM7XG5cbiAgaWYgKCF0aGlzLl9ldmVudHMpXG4gICAgcmV0dXJuIHRoaXM7XG5cbiAgLy8gbm90IGxpc3RlbmluZyBmb3IgcmVtb3ZlTGlzdGVuZXIsIG5vIG5lZWQgdG8gZW1pdFxuICBpZiAoIXRoaXMuX2V2ZW50cy5yZW1vdmVMaXN0ZW5lcikge1xuICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAwKVxuICAgICAgdGhpcy5fZXZlbnRzID0ge307XG4gICAgZWxzZSBpZiAodGhpcy5fZXZlbnRzW3R5cGVdKVxuICAgICAgZGVsZXRlIHRoaXMuX2V2ZW50c1t0eXBlXTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8vIGVtaXQgcmVtb3ZlTGlzdGVuZXIgZm9yIGFsbCBsaXN0ZW5lcnMgb24gYWxsIGV2ZW50c1xuICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMCkge1xuICAgIGZvciAoa2V5IGluIHRoaXMuX2V2ZW50cykge1xuICAgICAgaWYgKGtleSA9PT0gJ3JlbW92ZUxpc3RlbmVyJykgY29udGludWU7XG4gICAgICB0aGlzLnJlbW92ZUFsbExpc3RlbmVycyhrZXkpO1xuICAgIH1cbiAgICB0aGlzLnJlbW92ZUFsbExpc3RlbmVycygncmVtb3ZlTGlzdGVuZXInKTtcbiAgICB0aGlzLl9ldmVudHMgPSB7fTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIGxpc3RlbmVycyA9IHRoaXMuX2V2ZW50c1t0eXBlXTtcblxuICBpZiAoaXNGdW5jdGlvbihsaXN0ZW5lcnMpKSB7XG4gICAgdGhpcy5yZW1vdmVMaXN0ZW5lcih0eXBlLCBsaXN0ZW5lcnMpO1xuICB9IGVsc2Uge1xuICAgIC8vIExJRk8gb3JkZXJcbiAgICB3aGlsZSAobGlzdGVuZXJzLmxlbmd0aClcbiAgICAgIHRoaXMucmVtb3ZlTGlzdGVuZXIodHlwZSwgbGlzdGVuZXJzW2xpc3RlbmVycy5sZW5ndGggLSAxXSk7XG4gIH1cbiAgZGVsZXRlIHRoaXMuX2V2ZW50c1t0eXBlXTtcblxuICByZXR1cm4gdGhpcztcbn07XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUubGlzdGVuZXJzID0gZnVuY3Rpb24odHlwZSkge1xuICB2YXIgcmV0O1xuICBpZiAoIXRoaXMuX2V2ZW50cyB8fCAhdGhpcy5fZXZlbnRzW3R5cGVdKVxuICAgIHJldCA9IFtdO1xuICBlbHNlIGlmIChpc0Z1bmN0aW9uKHRoaXMuX2V2ZW50c1t0eXBlXSkpXG4gICAgcmV0ID0gW3RoaXMuX2V2ZW50c1t0eXBlXV07XG4gIGVsc2VcbiAgICByZXQgPSB0aGlzLl9ldmVudHNbdHlwZV0uc2xpY2UoKTtcbiAgcmV0dXJuIHJldDtcbn07XG5cbkV2ZW50RW1pdHRlci5saXN0ZW5lckNvdW50ID0gZnVuY3Rpb24oZW1pdHRlciwgdHlwZSkge1xuICB2YXIgcmV0O1xuICBpZiAoIWVtaXR0ZXIuX2V2ZW50cyB8fCAhZW1pdHRlci5fZXZlbnRzW3R5cGVdKVxuICAgIHJldCA9IDA7XG4gIGVsc2UgaWYgKGlzRnVuY3Rpb24oZW1pdHRlci5fZXZlbnRzW3R5cGVdKSlcbiAgICByZXQgPSAxO1xuICBlbHNlXG4gICAgcmV0ID0gZW1pdHRlci5fZXZlbnRzW3R5cGVdLmxlbmd0aDtcbiAgcmV0dXJuIHJldDtcbn07XG5cbmZ1bmN0aW9uIGlzRnVuY3Rpb24oYXJnKSB7XG4gIHJldHVybiB0eXBlb2YgYXJnID09PSAnZnVuY3Rpb24nO1xufVxuXG5mdW5jdGlvbiBpc051bWJlcihhcmcpIHtcbiAgcmV0dXJuIHR5cGVvZiBhcmcgPT09ICdudW1iZXInO1xufVxuXG5mdW5jdGlvbiBpc09iamVjdChhcmcpIHtcbiAgcmV0dXJuIHR5cGVvZiBhcmcgPT09ICdvYmplY3QnICYmIGFyZyAhPT0gbnVsbDtcbn1cblxuZnVuY3Rpb24gaXNVbmRlZmluZWQoYXJnKSB7XG4gIHJldHVybiBhcmcgPT09IHZvaWQgMDtcbn1cbiJdfQ==
