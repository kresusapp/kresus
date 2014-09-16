(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/*
 * HELPERS
 */

const DEBUG = true;
const ASSERTS = true;

exports.debug = function debug() {
    DEBUG && console.log.apply(console, arguments);
};

var assert = exports.assert = function(x, wat) {
    if (!x) {
        ASSERTS && alert('assertion error: ' + (wat?wat+'\n':'') + new Error().stack);
        return false;
    }
    return true;
};

exports.has = function has(obj, prop) {
    return assert(obj.hasOwnProperty(prop));
}

},{}],2:[function(require,module,exports){
/** @jsx React.DOM */

var Helpers = require('./helpers.js');

var debug = Helpers.debug;
var assert = Helpers.assert;
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
    this.dateImport  = has(arg, 'dateImport') && new Date(arg.dateImport);
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


},{"./helpers.js":1}]},{},[2])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2Jlbi9jb2RlL2NvenkvZGV2L2tyZXN1cy9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwiL2hvbWUvYmVuL2NvZGUvY296eS9kZXYva3Jlc3VzL2NsaWVudC9oZWxwZXJzLmpzIiwiL2hvbWUvYmVuL2NvZGUvY296eS9kZXYva3Jlc3VzL2NsaWVudC9tYWluLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt0aHJvdyBuZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpfXZhciBmPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChmLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGYsZi5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIvKlxuICogSEVMUEVSU1xuICovXG5cbmNvbnN0IERFQlVHID0gdHJ1ZTtcbmNvbnN0IEFTU0VSVFMgPSB0cnVlO1xuXG5leHBvcnRzLmRlYnVnID0gZnVuY3Rpb24gZGVidWcoKSB7XG4gICAgREVCVUcgJiYgY29uc29sZS5sb2cuYXBwbHkoY29uc29sZSwgYXJndW1lbnRzKTtcbn07XG5cbnZhciBhc3NlcnQgPSBleHBvcnRzLmFzc2VydCA9IGZ1bmN0aW9uKHgsIHdhdCkge1xuICAgIGlmICgheCkge1xuICAgICAgICBBU1NFUlRTICYmIGFsZXJ0KCdhc3NlcnRpb24gZXJyb3I6ICcgKyAod2F0P3dhdCsnXFxuJzonJykgKyBuZXcgRXJyb3IoKS5zdGFjayk7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgcmV0dXJuIHRydWU7XG59O1xuXG5leHBvcnRzLmhhcyA9IGZ1bmN0aW9uIGhhcyhvYmosIHByb3ApIHtcbiAgICByZXR1cm4gYXNzZXJ0KG9iai5oYXNPd25Qcm9wZXJ0eShwcm9wKSk7XG59XG4iLCIvKiogQGpzeCBSZWFjdC5ET00gKi9cblxudmFyIEhlbHBlcnMgPSByZXF1aXJlKCcuL2hlbHBlcnMuanMnKTtcblxudmFyIGRlYnVnID0gSGVscGVycy5kZWJ1ZztcbnZhciBhc3NlcnQgPSBIZWxwZXJzLmFzc2VydDtcbnZhciBoYXMgPSBIZWxwZXJzLmhhcztcblxuZnVuY3Rpb24geGhyRXJyb3IoeGhyLCB0ZXh0U3RhdHVzLCBlcnIpIHtcbiAgICBhbGVydCgneGhyIGVycm9yOiAnICsgdGV4dFN0YXR1cyArICdcXG4nICsgZXJyKTtcbn1cblxuLypcbiAqIE1PREVMU1xuICovXG5mdW5jdGlvbiBCYW5rKGFyZykge1xuICAgIHRoaXMuaWQgICA9IGhhcyhhcmcsICdpZCcpICAgJiYgYXJnLmlkO1xuICAgIHRoaXMubmFtZSA9IGhhcyhhcmcsICduYW1lJykgJiYgYXJnLm5hbWU7XG4gICAgdGhpcy51dWlkID0gaGFzKGFyZywgJ3V1aWQnKSAmJiBhcmcudXVpZDtcbn1cblxuZnVuY3Rpb24gQWNjb3VudChhcmcpIHtcbiAgICB0aGlzLmJhbmsgICAgICAgICAgPSBoYXMoYXJnLCAnYmFuaycpICYmIGFyZy5iYW5rO1xuICAgIHRoaXMuYmFua0FjY2VzcyAgICA9IGhhcyhhcmcsICdiYW5rQWNjZXNzJykgJiYgYXJnLmJhbmtBY2Nlc3M7XG4gICAgdGhpcy50aXRsZSAgICAgICAgID0gaGFzKGFyZywgJ3RpdGxlJykgJiYgYXJnLnRpdGxlO1xuICAgIHRoaXMuYWNjb3VudE51bWJlciA9IGhhcyhhcmcsICdhY2NvdW50TnVtYmVyJykgJiYgYXJnLmFjY291bnROdW1iZXI7XG4gICAgdGhpcy5pbml0aWFsQW1vdW50ID0gaGFzKGFyZywgJ2luaXRpYWxBbW91bnQnKSAmJiBhcmcuaW5pdGlhbEFtb3VudDtcbiAgICB0aGlzLmxhc3RDaGVja2VkICAgPSBoYXMoYXJnLCAnbGFzdENoZWNrZWQnKSAmJiBuZXcgRGF0ZShhcmcubGFzdENoZWNrZWQpO1xuICAgIHRoaXMuaWQgICAgICAgICAgICA9IGhhcyhhcmcsICdpZCcpICYmIGFyZy5pZDtcbiAgICB0aGlzLmFtb3VudCAgICAgICAgPSBoYXMoYXJnLCAnYW1vdW50JykgJiYgYXJnLmFtb3VudDtcbn1cblxuZnVuY3Rpb24gT3BlcmF0aW9uKGFyZykge1xuICAgIHRoaXMuYmFua0FjY291bnQgPSBoYXMoYXJnLCAnYmFua0FjY291bnQnKSAmJiBhcmcuYmFua0FjY291bnQ7XG4gICAgdGhpcy50aXRsZSAgICAgICA9IGhhcyhhcmcsICd0aXRsZScpICYmIGFyZy50aXRsZTtcbiAgICB0aGlzLmRhdGUgICAgICAgID0gaGFzKGFyZywgJ2RhdGUnKSAmJiBuZXcgRGF0ZShhcmcuZGF0ZSk7XG4gICAgdGhpcy5hbW91bnQgICAgICA9IGhhcyhhcmcsICdhbW91bnQnKSAmJiBhcmcuYW1vdW50O1xuICAgIHRoaXMucmF3ICAgICAgICAgPSBoYXMoYXJnLCAncmF3JykgJiYgYXJnLnJhdztcbiAgICB0aGlzLmRhdGVJbXBvcnQgID0gaGFzKGFyZywgJ2RhdGVJbXBvcnQnKSAmJiBuZXcgRGF0ZShhcmcuZGF0ZUltcG9ydCk7XG4gICAgdGhpcy5pZCAgICAgICAgICA9IGhhcyhhcmcsICdpZCcpICYmIGFyZy5pZDtcblxuICAgIC8vIE9wdGlvbmFsXG4gICAgdGhpcy51cGRhdGVMYWJlbChhcmcuY2F0ZWdvcnlJZCB8fCAtMSk7XG59XG5cbk9wZXJhdGlvbi5wcm90b3R5cGUudXBkYXRlTGFiZWwgPSBmdW5jdGlvbihpZCkge1xuICAgIHRoaXMuY2F0ZWdvcnlJZCA9IGlkO1xuICAgIGlmICh0eXBlb2YgQ2F0ZWdvcnlNYXAgIT09ICd1bmRlZmluZWQnICYmXG4gICAgICAgIHR5cGVvZiBDYXRlZ29yeU1hcFtpZF0gIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgIHRoaXMuY2F0ZWdvcnlMYWJlbCA9IENhdGVnb3J5TWFwW2lkXTtcbiAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLmNhdGVnb3J5TGFiZWwgPSAnTm9uZSc7XG4gICAgfVxufVxuXG5mdW5jdGlvbiBDYXRlZ29yeShhcmcpIHtcbiAgICB0aGlzLnRpdGxlID0gaGFzKGFyZywgJ3RpdGxlJykgJiYgYXJnLnRpdGxlO1xuICAgIHRoaXMuaWQgPSBoYXMoYXJnLCAnaWQnKSAmJiBhcmcuaWQ7XG5cbiAgICAvLyBPcHRpb25hbFxuICAgIHRoaXMucGFyZW50SWQgPSBhcmcucGFyZW50SWQ7XG59XG5cbi8qXG4gKiBSZWFjdCBDb21wb25lbnRzXG4gKi9cblxudmFyIENhdGVnb3J5SXRlbSA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtkaXNwbGF5TmFtZTogJ0NhdGVnb3J5SXRlbScsXG5cbiAgICByZW5kZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgUmVhY3QuRE9NLmxpKG51bGwsIHRoaXMucHJvcHMudGl0bGUpXG4gICAgICAgICk7XG4gICAgfVxufSk7XG5cbnZhciBDYXRlZ29yeUxpc3QgPSBSZWFjdC5jcmVhdGVDbGFzcyh7ZGlzcGxheU5hbWU6ICdDYXRlZ29yeUxpc3QnLFxuXG4gICAgcmVuZGVyOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGl0ZW1zID0gdGhpcy5wcm9wcy5jYXRlZ29yaWVzLm1hcChmdW5jdGlvbiAoY2F0KSB7XG4gICAgICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgICAgIENhdGVnb3J5SXRlbSh7a2V5OiBjYXQuaWQsIHRpdGxlOiBjYXQudGl0bGV9KVxuICAgICAgICAgICAgKTtcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICBSZWFjdC5ET00udWwobnVsbCwgaXRlbXMpXG4gICAgICAgICk7XG4gICAgfVxufSk7XG5cbnZhciBDYXRlZ29yeUZvcm0gPSBSZWFjdC5jcmVhdGVDbGFzcyh7ZGlzcGxheU5hbWU6ICdDYXRlZ29yeUZvcm0nLFxuXG4gICAgb25TdWJtaXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgbGFiZWwgPSB0aGlzLnJlZnMubGFiZWwuZ2V0RE9NTm9kZSgpLnZhbHVlLnRyaW0oKTtcbiAgICAgICAgaWYgKCFsYWJlbClcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcblxuICAgICAgICB2YXIgY2F0UG9kID0ge3RpdGxlOiBsYWJlbH07XG4gICAgICAgIHRoaXMucHJvcHMub25TdWJtaXQoY2F0UG9kKTtcbiAgICAgICAgdGhpcy5yZWZzLmxhYmVsLmdldERPTU5vZGUoKS52YWx1ZSA9ICcnO1xuICAgIH0sXG5cbiAgICByZW5kZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgUmVhY3QuRE9NLmZvcm0oe29uU3VibWl0OiB0aGlzLm9uU3VibWl0fSwgXG4gICAgICAgICAgICAgICAgUmVhY3QuRE9NLmRpdih7Y2xhc3NOYW1lOiBcInJvd1wifSwgXG4gICAgICAgICAgICAgICAgICAgIFJlYWN0LkRPTS5kaXYoe2NsYXNzTmFtZTogXCJzbWFsbC0xMCBjb2x1bW5zXCJ9LCBcbiAgICAgICAgICAgICAgICAgICAgICAgIFJlYWN0LkRPTS5pbnB1dCh7dHlwZTogXCJ0ZXh0XCIsIHBsYWNlaG9sZGVyOiBcIkxhYmVsIG9mIG5ldyBjYXRlZ29yeVwiLCByZWY6IFwibGFiZWxcIn0pXG4gICAgICAgICAgICAgICAgICAgICksIFxuICAgICAgICAgICAgICAgICAgICBSZWFjdC5ET00uZGl2KHtjbGFzc05hbWU6IFwic21hbGwtMiBjb2x1bW5zXCJ9LCBcbiAgICAgICAgICAgICAgICAgICAgICAgIFJlYWN0LkRPTS5pbnB1dCh7dHlwZTogXCJzdWJtaXRcIiwgY2xhc3NOYW1lOiBcImJ1dHRvbiBwb3N0Zml4XCIsIHZhbHVlOiBcIlN1Ym1pdFwifSlcbiAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgIClcbiAgICAgICAgKVxuICAgIH1cbn0pO1xuXG52YXIgQ2F0ZWdvcnlDb21wb25lbnQgPSBSZWFjdC5jcmVhdGVDbGFzcyh7ZGlzcGxheU5hbWU6ICdDYXRlZ29yeUNvbXBvbmVudCcsXG5cbiAgICByZW5kZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgUmVhY3QuRE9NLmRpdihudWxsLCBcbiAgICAgICAgICAgICAgICBSZWFjdC5ET00uaDEobnVsbCwgXCJDYXRlZ29yaWVzXCIpLCBcbiAgICAgICAgICAgICAgICBDYXRlZ29yeUxpc3Qoe2NhdGVnb3JpZXM6IHRoaXMucHJvcHMuY2F0ZWdvcmllc30pLCBcbiAgICAgICAgICAgICAgICBSZWFjdC5ET00uaDMobnVsbCwgXCJBZGQgYSBjYXRlZ29yeVwiKSwgXG4gICAgICAgICAgICAgICAgQ2F0ZWdvcnlGb3JtKHtvblN1Ym1pdDogdGhpcy5wcm9wcy5vbkNhdGVnb3J5Rm9ybVN1Ym1pdH0pXG4gICAgICAgICAgICApXG4gICAgICAgICk7XG4gICAgfVxufSk7XG5cbi8vIFByb3BzOiBzZXRDdXJyZW50QmFuazogZnVuY3Rpb24oYmFuayl7fSwgYmFuazogQmFua1xudmFyIEJhbmtMaXN0SXRlbUNvbXBvbmVudCA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtkaXNwbGF5TmFtZTogJ0JhbmtMaXN0SXRlbUNvbXBvbmVudCcsXG5cbiAgICBvbkNsaWNrOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy5wcm9wcy5zZXRDdXJyZW50QmFuayh0aGlzLnByb3BzLmJhbmspO1xuICAgIH0sXG5cbiAgICByZW5kZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgUmVhY3QuRE9NLmxpKG51bGwsIFJlYWN0LkRPTS5hKHtvbkNsaWNrOiB0aGlzLm9uQ2xpY2t9LCB0aGlzLnByb3BzLmJhbmsubmFtZSkpXG4gICAgICAgICk7XG4gICAgfVxufSk7XG5cbi8vIFByb3BzOiBzZXRDdXJyZW50QmFuazogZnVuY3Rpb24oYmFuayl7fSwgYmFua3M6IFtCYW5rXVxudmFyIEJhbmtMaXN0Q29tcG9uZW50ID0gUmVhY3QuY3JlYXRlQ2xhc3Moe2Rpc3BsYXlOYW1lOiAnQmFua0xpc3RDb21wb25lbnQnLFxuXG4gICAgcmVuZGVyOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIHNldEN1cnJlbnRCYW5rID0gdGhpcy5wcm9wcy5zZXRDdXJyZW50QmFuaztcbiAgICAgICAgdmFyIGJhbmtzID0gdGhpcy5wcm9wcy5iYW5rcy5tYXAoZnVuY3Rpb24gKGIpIHtcbiAgICAgICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICAgICAgQmFua0xpc3RJdGVtQ29tcG9uZW50KHtrZXk6IGIuaWQsIGJhbms6IGIsIHNldEN1cnJlbnRCYW5rOiBzZXRDdXJyZW50QmFua30pXG4gICAgICAgICAgICApXG4gICAgICAgIH0pO1xuXG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICBSZWFjdC5ET00uZGl2KG51bGwsIFxuICAgICAgICAgICAgICAgIFwiQmFua3NcIiwgXG4gICAgICAgICAgICAgICAgUmVhY3QuRE9NLnVsKHtjbGFzc05hbWU6IFwicm93XCJ9LCBcbiAgICAgICAgICAgICAgICAgICAgYmFua3NcbiAgICAgICAgICAgICAgICApLCBcbiAgICAgICAgICAgICAgICBSZWFjdC5ET00uaHIobnVsbClcbiAgICAgICAgICAgIClcbiAgICAgICAgKTtcbiAgICB9XG59KTtcblxuLy8gUHJvcHM6IHNldEN1cnJlbnRBY2NvdW50OiBmdW5jdGlvbihhY2NvdW50KXt9LCBhY2NvdW50OiBBY2NvdW50XG52YXIgQWNjb3VudHNMaXN0SXRlbSA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtkaXNwbGF5TmFtZTogJ0FjY291bnRzTGlzdEl0ZW0nLFxuXG4gICAgb25DbGljazogZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoaXMucHJvcHMuc2V0Q3VycmVudEFjY291bnQodGhpcy5wcm9wcy5hY2NvdW50KTtcbiAgICB9LFxuXG4gICAgcmVuZGVyOiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIFJlYWN0LkRPTS5saShudWxsLCBcbiAgICAgICAgICAgICAgICBSZWFjdC5ET00uYSh7b25DbGljazogdGhpcy5vbkNsaWNrfSwgdGhpcy5wcm9wcy5hY2NvdW50LnRpdGxlKVxuICAgICAgICAgICAgKVxuICAgICAgICApO1xuICAgIH1cbn0pO1xuXG4vLyBQcm9wczogc2V0Q3VycmVudEFjY291bnQ6IGZ1bmN0aW9uKGFjY291bnQpIHt9LCBhY2NvdW50czogW0FjY291bnRdXG52YXIgQWNjb3VudHNMaXN0Q29tcG9uZW50ID0gUmVhY3QuY3JlYXRlQ2xhc3Moe2Rpc3BsYXlOYW1lOiAnQWNjb3VudHNMaXN0Q29tcG9uZW50JyxcblxuICAgIHJlbmRlcjogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBzZXRDdXJyZW50QWNjb3VudCA9IHRoaXMucHJvcHMuc2V0Q3VycmVudEFjY291bnQ7XG4gICAgICAgIHZhciBhY2NvdW50cyA9IHRoaXMucHJvcHMuYWNjb3VudHMubWFwKGZ1bmN0aW9uIChhKSB7XG4gICAgICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgICAgIEFjY291bnRzTGlzdEl0ZW0oe2tleTogYS5pZCwgYWNjb3VudDogYSwgc2V0Q3VycmVudEFjY291bnQ6IHNldEN1cnJlbnRBY2NvdW50fSlcbiAgICAgICAgICAgICk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICBSZWFjdC5ET00uZGl2KG51bGwsIFxuICAgICAgICAgICAgICAgIFwiQWNjb3VudHNcIiwgXG4gICAgICAgICAgICAgICAgUmVhY3QuRE9NLnVsKHtjbGFzc05hbWU6IFwicm93XCJ9LCBcbiAgICAgICAgICAgICAgICAgICAgYWNjb3VudHNcbiAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICApXG4gICAgICAgICk7XG4gICAgfVxufSk7XG5cbnZhciBDYXRlZ29yeVNlbGVjdENvbXBvbmVudCA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtkaXNwbGF5TmFtZTogJ0NhdGVnb3J5U2VsZWN0Q29tcG9uZW50JyxcblxuICAgIGdldEluaXRpYWxTdGF0ZTogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB7IGVkaXRNb2RlOiBmYWxzZSB9XG4gICAgfSxcblxuICAgIG9uQ2hhbmdlOiBmdW5jdGlvbihlKSB7XG4gICAgICAgIHZhciBzZWxlY3RlZCA9IHRoaXMucmVmcy5jYXQuZ2V0RE9NTm9kZSgpLnZhbHVlO1xuICAgICAgICB0aGlzLnByb3BzLnVwZGF0ZU9wZXJhdGlvbkNhdGVnb3J5KHRoaXMucHJvcHMub3BlcmF0aW9uLCBzZWxlY3RlZCk7XG4gICAgfSxcblxuICAgIHN3aXRjaFRvRWRpdE1vZGU6IGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHsgZWRpdE1vZGU6IHRydWUgfSwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB0aGlzLnJlZnMuY2F0LmdldERPTU5vZGUoKS5mb2N1cygpO1xuICAgICAgICB9KTtcbiAgICB9LFxuICAgIHN3aXRjaFRvU3RhdGljTW9kZTogZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoeyBlZGl0TW9kZTogZmFsc2UgfSk7XG4gICAgfSxcblxuICAgIHJlbmRlcjogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBsYWJlbCA9IHRoaXMucHJvcHMub3BlcmF0aW9uLmNhdGVnb3J5TGFiZWw7XG4gICAgICAgIHZhciBzZWxlY3RlZElkID0gdGhpcy5wcm9wcy5vcGVyYXRpb24uY2F0ZWdvcnlJZDtcblxuICAgICAgICBpZiAoIXRoaXMuc3RhdGUuZWRpdE1vZGUpIHtcbiAgICAgICAgICAgIHJldHVybiAoUmVhY3QuRE9NLnNwYW4oe29uQ2xpY2s6IHRoaXMuc3dpdGNoVG9FZGl0TW9kZX0sIGxhYmVsKSlcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBjYXRlZ29yaWVzID0gW25ldyBDYXRlZ29yeSh7dGl0bGU6ICdOb25lJywgaWQ6ICctMSd9KV0uY29uY2F0KHRoaXMucHJvcHMuY2F0ZWdvcmllcyk7XG4gICAgICAgIHZhciBvcHRpb25zID0gY2F0ZWdvcmllcy5tYXAoZnVuY3Rpb24gKGMpIHtcbiAgICAgICAgICAgIHJldHVybiAoUmVhY3QuRE9NLm9wdGlvbih7a2V5OiBjLmlkLCB2YWx1ZTogYy5pZH0sIGMudGl0bGUpKVxuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIFJlYWN0LkRPTS5zZWxlY3Qoe29uQ2hhbmdlOiB0aGlzLm9uQ2hhbmdlLCBvbkJsdXI6IHRoaXMuc3dpdGNoVG9TdGF0aWNNb2RlLCBkZWZhdWx0VmFsdWU6IHNlbGVjdGVkSWQsIHJlZjogXCJjYXRcIn0sIFxuICAgICAgICAgICAgICAgIG9wdGlvbnNcbiAgICAgICAgICAgIClcbiAgICAgICAgKTtcbiAgICB9XG59KTtcblxudmFyIE9wZXJhdGlvbkNvbXBvbmVudCA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtkaXNwbGF5TmFtZTogJ09wZXJhdGlvbkNvbXBvbmVudCcsXG5cbiAgICBnZXRJbml0aWFsU3RhdGU6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4geyBtb3VzZU9uOiBmYWxzZSB9O1xuICAgIH0sXG5cbiAgICBvbk1vdXNlRW50ZXI6IGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IG1vdXNlT246IHRydWUgfSlcbiAgICB9LFxuICAgIG9uTW91c2VMZWF2ZTogZnVuY3Rpb24oZSkge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHsgbW91c2VPbjogZmFsc2UgfSlcbiAgICB9LFxuXG4gICAgcmVuZGVyOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIG9wID0gdGhpcy5wcm9wcy5vcGVyYXRpb247XG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICBSZWFjdC5ET00udHIobnVsbCwgXG4gICAgICAgICAgICAgICAgUmVhY3QuRE9NLnRkKG51bGwsIG9wLmRhdGUudG9TdHJpbmcoKSksIFxuICAgICAgICAgICAgICAgIFJlYWN0LkRPTS50ZCh7b25Nb3VzZUVudGVyOiB0aGlzLm9uTW91c2VFbnRlciwgb25Nb3VzZUxlYXZlOiB0aGlzLm9uTW91c2VMZWF2ZX0sIHRoaXMuc3RhdGUubW91c2VPbiA/IG9wLnJhdyA6IG9wLnRpdGxlKSwgXG4gICAgICAgICAgICAgICAgUmVhY3QuRE9NLnRkKG51bGwsIG9wLmFtb3VudCksIFxuICAgICAgICAgICAgICAgIFJlYWN0LkRPTS50ZChudWxsLCBcbiAgICAgICAgICAgICAgICAgICAgQ2F0ZWdvcnlTZWxlY3RDb21wb25lbnQoe29wZXJhdGlvbjogb3AsIGNhdGVnb3JpZXM6IHRoaXMucHJvcHMuY2F0ZWdvcmllcywgXG4gICAgICAgICAgICAgICAgICAgICAgICB1cGRhdGVPcGVyYXRpb25DYXRlZ29yeTogdGhpcy5wcm9wcy51cGRhdGVPcGVyYXRpb25DYXRlZ29yeX0pXG4gICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgKVxuICAgICAgICApO1xuICAgIH1cbn0pO1xuXG52YXIgT3BlcmF0aW9uc0NvbXBvbmVudCA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtkaXNwbGF5TmFtZTogJ09wZXJhdGlvbnNDb21wb25lbnQnLFxuXG4gICAgcmVuZGVyOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGNhdGVnb3JpZXMgPSB0aGlzLnByb3BzLmNhdGVnb3JpZXM7XG4gICAgICAgIHZhciB1cGRhdGVPcGVyYXRpb25DYXRlZ29yeSA9IHRoaXMucHJvcHMudXBkYXRlT3BlcmF0aW9uQ2F0ZWdvcnk7XG4gICAgICAgIHZhciBvcHMgPSB0aGlzLnByb3BzLm9wZXJhdGlvbnMubWFwKGZ1bmN0aW9uIChvKSB7XG4gICAgICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgICAgIE9wZXJhdGlvbkNvbXBvbmVudCh7a2V5OiBvLmlkLCBvcGVyYXRpb246IG8sIGNhdGVnb3JpZXM6IGNhdGVnb3JpZXMsIHVwZGF0ZU9wZXJhdGlvbkNhdGVnb3J5OiB1cGRhdGVPcGVyYXRpb25DYXRlZ29yeX0pXG4gICAgICAgICAgICApO1xuICAgICAgICB9KTtcblxuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgUmVhY3QuRE9NLmRpdihudWxsLCBcbiAgICAgICAgICAgICAgICBSZWFjdC5ET00uaDEobnVsbCwgXCJPcGVyYXRpb25zXCIpLCBcbiAgICAgICAgICAgICAgICBSZWFjdC5ET00udGFibGUobnVsbCwgXG4gICAgICAgICAgICAgICAgICAgIFJlYWN0LkRPTS50aGVhZChudWxsLCBcbiAgICAgICAgICAgICAgICAgICAgICAgIFJlYWN0LkRPTS50cihudWxsLCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBSZWFjdC5ET00udGgobnVsbCwgXCJEYXRlXCIpLCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBSZWFjdC5ET00udGgobnVsbCwgXCJUaXRsZVwiKSwgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgUmVhY3QuRE9NLnRoKG51bGwsIFwiQW1vdW50XCIpLCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBSZWFjdC5ET00udGgobnVsbCwgXCJDYXRlZ29yeVwiKVxuICAgICAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgICApLCBcbiAgICAgICAgICAgICAgICAgICAgUmVhY3QuRE9NLnRib2R5KG51bGwsIFxuICAgICAgICAgICAgICAgICAgICAgICAgb3BzXG4gICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICApXG4gICAgICAgICk7XG4gICAgfVxufSk7XG5cbnZhciBTaW1pbGFyaXR5SXRlbUNvbXBvbmVudCA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtkaXNwbGF5TmFtZTogJ1NpbWlsYXJpdHlJdGVtQ29tcG9uZW50JyxcblxuICAgIGRlbGV0ZU9wZXJhdGlvbjogZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoaXMucHJvcHMuZGVsZXRlT3BlcmF0aW9uKHRoaXMucHJvcHMub3ApO1xuICAgIH0sXG5cbiAgICByZW5kZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgUmVhY3QuRE9NLnRyKG51bGwsIFxuICAgICAgICAgICAgICAgIFJlYWN0LkRPTS50ZChudWxsLCB0aGlzLnByb3BzLm9wLmRhdGUudG9TdHJpbmcoKSksIFxuICAgICAgICAgICAgICAgIFJlYWN0LkRPTS50ZChudWxsLCB0aGlzLnByb3BzLm9wLnRpdGxlKSwgXG4gICAgICAgICAgICAgICAgUmVhY3QuRE9NLnRkKG51bGwsIHRoaXMucHJvcHMub3AuYW1vdW50KSwgXG4gICAgICAgICAgICAgICAgUmVhY3QuRE9NLnRkKG51bGwsIFJlYWN0LkRPTS5hKHtvbkNsaWNrOiB0aGlzLmRlbGV0ZU9wZXJhdGlvbn0sIFwieFwiKSlcbiAgICAgICAgICAgIClcbiAgICAgICAgKTtcbiAgICB9XG59KTtcblxudmFyIFNpbWlsYXJpdHlQYWlyQ29tcG9uZW50ID0gUmVhY3QuY3JlYXRlQ2xhc3Moe2Rpc3BsYXlOYW1lOiAnU2ltaWxhcml0eVBhaXJDb21wb25lbnQnLFxuXG4gICAgcmVuZGVyOiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIFJlYWN0LkRPTS50YWJsZShudWxsLCBcbiAgICAgICAgICAgICAgICBTaW1pbGFyaXR5SXRlbUNvbXBvbmVudCh7b3A6IHRoaXMucHJvcHMuYSwgZGVsZXRlT3BlcmF0aW9uOiB0aGlzLnByb3BzLmRlbGV0ZU9wZXJhdGlvbn0pLCBcbiAgICAgICAgICAgICAgICBTaW1pbGFyaXR5SXRlbUNvbXBvbmVudCh7b3A6IHRoaXMucHJvcHMuYiwgZGVsZXRlT3BlcmF0aW9uOiB0aGlzLnByb3BzLmRlbGV0ZU9wZXJhdGlvbn0pXG4gICAgICAgICAgICApXG4gICAgICAgICk7XG4gICAgfVxufSk7XG5cbi8vIFByb3BzOiBwYWlyczogW1tPcGVyYXRpb24sIE9wZXJhdGlvbl1dLCBkZWxldGVPcGVyYXRpb246IGZ1bmN0aW9uKE9wZXJhdGlvbil7fVxudmFyIFNpbWlsYXJpdHlDb21wb25lbnQgPSBSZWFjdC5jcmVhdGVDbGFzcyh7ZGlzcGxheU5hbWU6ICdTaW1pbGFyaXR5Q29tcG9uZW50JyxcblxuICAgIHJlbmRlcjogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBwYWlycyA9IHRoaXMucHJvcHMucGFpcnM7XG4gICAgICAgIGlmIChwYWlycy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICAgICAgUmVhY3QuRE9NLmRpdihudWxsLCBcIk5vIHNpbWlsYXIgb3BlcmF0aW9ucyBmb3VuZC5cIilcbiAgICAgICAgICAgIClcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBkZWxldGVPcGVyYXRpb24gPSB0aGlzLnByb3BzLmRlbGV0ZU9wZXJhdGlvbjtcbiAgICAgICAgdmFyIHNpbSA9IHBhaXJzLm1hcChmdW5jdGlvbiAocCkge1xuICAgICAgICAgICAgdmFyIGtleSA9IHBbMF0uaWQudG9TdHJpbmcoKSArIHBbMV0uaWQudG9TdHJpbmcoKTtcbiAgICAgICAgICAgIHJldHVybiAoU2ltaWxhcml0eVBhaXJDb21wb25lbnQoe2tleToga2V5LCBhOiBwWzBdLCBiOiBwWzFdLCBkZWxldGVPcGVyYXRpb246IGRlbGV0ZU9wZXJhdGlvbn0pKVxuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIFJlYWN0LkRPTS5kaXYobnVsbCwgXG4gICAgICAgICAgICAgICAgUmVhY3QuRE9NLmgxKG51bGwsIFwiU2ltaWxhcml0aWVzXCIpLCBcbiAgICAgICAgICAgICAgICBSZWFjdC5ET00uZGl2KG51bGwsIFxuICAgICAgICAgICAgICAgICAgICBzaW1cbiAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICApKVxuICAgIH1cbn0pO1xuXG4vLyBQcm9wczogb3BlcmF0aW9ucywgY2F0ZWdvcmllc1xudmFyIENoYXJ0Q29tcG9uZW50ID0gUmVhY3QuY3JlYXRlQ2xhc3Moe2Rpc3BsYXlOYW1lOiAnQ2hhcnRDb21wb25lbnQnLFxuXG4gICAgX29uQ2hhbmdlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIHZhbCA9IHRoaXMucmVmcy5zZWxlY3QuZ2V0RE9NTm9kZSgpLnZhbHVlO1xuICAgICAgICBpZiAodmFsID09PSAnYWxsJykge1xuICAgICAgICAgICAgQ3JlYXRlQ2hhcnRBbGxCeUNhdGVnb3J5QnlNb250aCh0aGlzLnByb3BzLm9wZXJhdGlvbnMpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIGMgPSBDYXRlZ29yeU1hcFt2YWxdO1xuICAgICAgICBDcmVhdGVDaGFydEJ5Q2F0ZWdvcnlCeU1vbnRoKHZhbCwgdGhpcy5wcm9wcy5vcGVyYXRpb25zKTtcbiAgICB9LFxuXG4gICAgcmVuZGVyOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGNhdGVnb3J5T3B0aW9ucyA9IHRoaXMucHJvcHMuY2F0ZWdvcmllcy5tYXAoZnVuY3Rpb24gKGMpIHtcbiAgICAgICAgICAgIHJldHVybiAoUmVhY3QuRE9NLm9wdGlvbih7a2V5OiBjLmlkLCB2YWx1ZTogYy5pZH0sIGMudGl0bGUpKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgUmVhY3QuRE9NLmRpdihudWxsLCBcbiAgICAgICAgICAgIFJlYWN0LkRPTS5oMShudWxsLCBcIkNoYXJ0c1wiKSwgXG4gICAgICAgICAgICBSZWFjdC5ET00uc2VsZWN0KHtvbkNoYW5nZTogdGhpcy5fb25DaGFuZ2UsIGRlZmF1bHRWYWx1ZTogXCJhbGxcIiwgcmVmOiBcInNlbGVjdFwifSwgXG4gICAgICAgICAgICAgICAgUmVhY3QuRE9NLm9wdGlvbih7dmFsdWU6IFwiYWxsXCJ9LCBcIkFsbFwiKSwgXG4gICAgICAgICAgICAgICAgY2F0ZWdvcnlPcHRpb25zXG4gICAgICAgICAgICApLCBcbiAgICAgICAgICAgIFJlYWN0LkRPTS5kaXYoe2lkOiBcImNoYXJ0XCJ9KVxuICAgICAgICApXG4gICAgICAgICk7XG4gICAgfVxufSk7XG5cbnZhciBDYXRlZ29yeU1hcCA9IHt9O1xuXG52YXIgS3Jlc3VzID0gUmVhY3QuY3JlYXRlQ2xhc3Moe2Rpc3BsYXlOYW1lOiAnS3Jlc3VzJyxcblxuICAgIGdldEluaXRpYWxTdGF0ZTogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAvLyBBbGwgYmFua3NcbiAgICAgICAgICAgIGJhbmtzOiBbXSxcbiAgICAgICAgICAgIGNhdGVnb3JpZXM6IFtdLFxuICAgICAgICAgICAgLy8gQ3VycmVudCBiYW5rXG4gICAgICAgICAgICBjdXJyZW50QmFuazogbnVsbCxcbiAgICAgICAgICAgIGFjY291bnRzOiBbXSxcbiAgICAgICAgICAgIC8vIEN1cnJlbnQgYWNjb3VudFxuICAgICAgICAgICAgY3VycmVudEFjY291bnQ6IG51bGwsXG4gICAgICAgICAgICBvcGVyYXRpb25zOiBbXSxcbiAgICAgICAgICAgIHJlZHVuZGFudFBhaXJzOiBbXVxuICAgICAgICB9XG4gICAgfSxcblxuICAgIGxvYWRPcGVyYXRpb25zOiBmdW5jdGlvbigpIHtcbiAgICAgICAgaWYgKCF0aGlzLnN0YXRlLmN1cnJlbnRBY2NvdW50KVxuICAgICAgICAgICAgcmV0dXJuO1xuXG4gICAgICAgIHZhciB0aGF0ID0gdGhpcztcbiAgICAgICAgdmFyIGFjY291bnQgPSB0aGlzLnN0YXRlLmN1cnJlbnRBY2NvdW50O1xuICAgICAgICAkLmdldCgnYWNjb3VudHMvZ2V0T3BlcmF0aW9ucy8nICsgYWNjb3VudC5pZCwgZnVuY3Rpb24gKGRhdGEpIHtcbiAgICAgICAgICAgIHZhciBvcGVyYXRpb25zID0gW107XG4gICAgICAgICAgICBmb3IgKHZhciBvcFBvZCBvZiBkYXRhKSB7XG4gICAgICAgICAgICAgICAgdmFyIG8gPSBuZXcgT3BlcmF0aW9uKG9wUG9kKVxuICAgICAgICAgICAgICAgIG8udXBkYXRlTGFiZWwoby5jYXRlZ29yeUlkKTtcbiAgICAgICAgICAgICAgICBvcGVyYXRpb25zLnB1c2gobyk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHZhciByZWR1bmRhbnRQYWlycyA9IGZpbmRSZWR1bmRhbnRBbGdvcml0aG0ob3BlcmF0aW9ucyk7XG4gICAgICAgICAgICB0aGF0LnNldFN0YXRlKHtcbiAgICAgICAgICAgICAgICBvcGVyYXRpb25zOiBvcGVyYXRpb25zLFxuICAgICAgICAgICAgICAgIHJlZHVuZGFudFBhaXJzOiByZWR1bmRhbnRQYWlyc1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIC8vIE5vdCByYWN5OiBvbmx5IHVzZXMgZm9ybWFsIGFyZ3VtZW50cywgbm8gc3RhdGUuXG4gICAgICAgICAgICAvL0NyZWF0ZUNoYXJ0QWxsT3BlcmF0aW9ucyhhY2NvdW50LCBvcGVyYXRpb25zKTtcbiAgICAgICAgICAgIENyZWF0ZUNoYXJ0QWxsQnlDYXRlZ29yeUJ5TW9udGgob3BlcmF0aW9ucyk7XG4gICAgICAgIH0pLmZhaWwoeGhyRXJyb3IpO1xuICAgIH0sXG5cbiAgICBzZXRDdXJyZW50QWNjb3VudDogZnVuY3Rpb24oYWNjb3VudCkge1xuICAgICAgICBpZiAoIWFjY291bnQpIHtcbiAgICAgICAgICAgIGRlYnVnKCdzZXRDdXJyZW50QWNjb3VudDogbm8gcGFyYW1ldGVyJyk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBhc3NlcnQoYWNjb3VudCBpbnN0YW5jZW9mIEFjY291bnQpO1xuICAgICAgICBpZiAodGhpcy5zdGF0ZS5jdXJyZW50QWNjb3VudCAmJiBhY2NvdW50LmlkID09PSB0aGlzLnN0YXRlLmN1cnJlbnRBY2NvdW50LmlkKVxuICAgICAgICAgICAgcmV0dXJuO1xuXG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgY3VycmVudEFjY291bnQ6IGFjY291bnQgfHwgbnVsbFxuICAgICAgICB9LCB0aGlzLmxvYWRPcGVyYXRpb25zKVxuICAgIH0sXG5cbiAgICBsb2FkQWNjb3VudHM6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgdGhhdCA9IHRoaXM7XG4gICAgICAgIGlmICghdGhpcy5zdGF0ZS5jdXJyZW50QmFuaylcbiAgICAgICAgICAgIHJldHVybjtcblxuICAgICAgICAkLmdldCgnYmFua3MvZ2V0QWNjb3VudHMvJyArIHRoaXMuc3RhdGUuY3VycmVudEJhbmsuaWQsIGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgICAgICAgICB2YXIgYWNjb3VudHMgPSBbXVxuICAgICAgICAgICAgZm9yICh2YXIgYWNjUG9kIG9mIGRhdGEpIHtcbiAgICAgICAgICAgICAgICBhY2NvdW50cy5wdXNoKG5ldyBBY2NvdW50KGFjY1BvZCkpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0aGF0LnNldFN0YXRlKHtcbiAgICAgICAgICAgICAgICBhY2NvdW50czogYWNjb3VudHMsXG4gICAgICAgICAgICB9LCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICB0aGF0LnNldEN1cnJlbnRBY2NvdW50KGFjY291bnRzWzBdIHx8IG51bGwpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pLmZhaWwoeGhyRXJyb3IpO1xuICAgIH0sXG5cbiAgICBzZXRDdXJyZW50QmFuazogZnVuY3Rpb24oYmFuaykge1xuICAgICAgICBpZiAoIWJhbmspXG4gICAgICAgICAgICByZXR1cm47XG5cbiAgICAgICAgYXNzZXJ0KGJhbmsgaW5zdGFuY2VvZiBCYW5rKTtcbiAgICAgICAgaWYgKHRoaXMuc3RhdGUuY3VycmVudEJhbmsgJiYgYmFuay5pZCA9PT0gdGhpcy5zdGF0ZS5jdXJyZW50QmFuay5pZClcbiAgICAgICAgICAgIHJldHVybjtcblxuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgIGN1cnJlbnRCYW5rOiBiYW5rXG4gICAgICAgIH0sIHRoaXMubG9hZEFjY291bnRzKTtcbiAgICB9LFxuXG4gICAgZGVsZXRlT3BlcmF0aW9uOiBmdW5jdGlvbihvcGVyYXRpb24pIHtcbiAgICAgICAgaWYgKCFvcGVyYXRpb24pXG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIGFzc2VydChvcGVyYXRpb24gaW5zdGFuY2VvZiBPcGVyYXRpb24pO1xuXG4gICAgICAgIHZhciB0aGF0ID0gdGhpcztcbiAgICAgICAgJC5hamF4KHtcbiAgICAgICAgICAgIHVybDogJ29wZXJhdGlvbnMvJyArIG9wZXJhdGlvbi5pZCxcbiAgICAgICAgICAgIHR5cGU6ICdERUxFVEUnLFxuICAgICAgICAgICAgc3VjY2VzczogdGhhdC5sb2FkT3BlcmF0aW9ucyxcbiAgICAgICAgICAgIGVycm9yOiB4aHJFcnJvclxuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgbG9hZENhdGVnb3JpZXM6IGZ1bmN0aW9uKGNiKSB7XG4gICAgICAgIHZhciB0aGF0ID0gdGhpcztcbiAgICAgICAgJC5nZXQoJ2NhdGVnb3JpZXMnLCBmdW5jdGlvbiAoZGF0YSkge1xuICAgICAgICAgICAgdmFyIGNhdGVnb3JpZXMgPSBbXVxuICAgICAgICAgICAgZm9yICh2YXIgY2F0UG9kIG9mIGRhdGEpIHtcbiAgICAgICAgICAgICAgICB2YXIgYyA9IG5ldyBDYXRlZ29yeShjYXRQb2QpO1xuICAgICAgICAgICAgICAgIENhdGVnb3J5TWFwW2MuaWRdID0gYy50aXRsZTtcbiAgICAgICAgICAgICAgICBjYXRlZ29yaWVzLnB1c2goYylcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoYXQuc2V0U3RhdGUoe2NhdGVnb3JpZXM6IGNhdGVnb3JpZXN9LCBjYik7XG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICBhZGRDYXRlZ29yeTogZnVuY3Rpb24obmV3Y2F0KSB7XG4gICAgICAgIC8vIERvIHRoZSByZXF1ZXN0XG4gICAgICAgIHZhciB0aGF0ID0gdGhpcztcbiAgICAgICAgJC5wb3N0KCdjYXRlZ29yaWVzJywgbmV3Y2F0LCBmdW5jdGlvbiAoZGF0YSkge1xuICAgICAgICAgICAgdGhhdC5sb2FkQ2F0ZWdvcmllcygpO1xuICAgICAgICB9KS5mYWlsKHhockVycm9yKTtcbiAgICB9LFxuXG4gICAgdXBkYXRlT3BlcmF0aW9uQ2F0ZWdvcnk6IGZ1bmN0aW9uKG9wLCBjYXRJZCkge1xuICAgICAgICBhc3NlcnQob3AgaW5zdGFuY2VvZiBPcGVyYXRpb24pO1xuICAgICAgICB2YXIgZGF0YSA9IHtcbiAgICAgICAgICAgIGNhdGVnb3J5SWQ6IGNhdElkXG4gICAgICAgIH1cblxuICAgICAgICAkLmFqYXgoe1xuICAgICAgICAgICAgdXJsOidvcGVyYXRpb25zLycgKyBvcC5pZCxcbiAgICAgICAgICAgIHR5cGU6ICdQVVQnLFxuICAgICAgICAgICAgZGF0YTogZGF0YSxcbiAgICAgICAgICAgIHN1Y2Nlc3M6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBvcC51cGRhdGVMYWJlbChjYXRJZClcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBlcnJvcjogeGhyRXJyb3JcbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIGNvbXBvbmVudERpZE1vdW50OiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIHRoYXQgPSB0aGlzO1xuICAgICAgICAkLmdldCgnYmFua3MnLCB7d2l0aEFjY291bnRPbmx5OnRydWV9LCBmdW5jdGlvbiAoZGF0YSkge1xuICAgICAgICAgICAgdmFyIGJhbmtzID0gW11cbiAgICAgICAgICAgIGZvciAodmFyIGJhbmtQb2Qgb2YgZGF0YSkge1xuICAgICAgICAgICAgICAgIHZhciBiID0gbmV3IEJhbmsoYmFua1BvZCk7XG4gICAgICAgICAgICAgICAgYmFua3MucHVzaChiKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhhdC5zZXRTdGF0ZSh7XG4gICAgICAgICAgICAgICAgYmFua3M6IGJhbmtzLFxuICAgICAgICAgICAgfSwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgdGhhdC5sb2FkQ2F0ZWdvcmllcyhmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhhdC5zZXRDdXJyZW50QmFuayhiYW5rc1swXSB8fCBudWxsKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KS5mYWlsKHhockVycm9yKTtcbiAgICB9LFxuXG4gICAgcmVuZGVyOiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIFJlYWN0LkRPTS5kaXYoe2NsYXNzTmFtZTogXCJyb3dcIn0sIFxuXG4gICAgICAgICAgICBSZWFjdC5ET00uZGl2KHtjbGFzc05hbWU6IFwicGFuZWwgc21hbGwtMiBjb2x1bW5zXCJ9LCBcbiAgICAgICAgICAgICAgICBCYW5rTGlzdENvbXBvbmVudCh7XG4gICAgICAgICAgICAgICAgICAgIGJhbmtzOiB0aGlzLnN0YXRlLmJhbmtzLCBcbiAgICAgICAgICAgICAgICAgICAgc2V0Q3VycmVudEJhbms6IHRoaXMuc2V0Q3VycmVudEJhbmt9XG4gICAgICAgICAgICAgICAgKSwgXG4gICAgICAgICAgICAgICAgQWNjb3VudHNMaXN0Q29tcG9uZW50KHtcbiAgICAgICAgICAgICAgICAgICAgYWNjb3VudHM6IHRoaXMuc3RhdGUuYWNjb3VudHMsIFxuICAgICAgICAgICAgICAgICAgICBzZXRDdXJyZW50QWNjb3VudDogdGhpcy5zZXRDdXJyZW50QWNjb3VudH1cbiAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICApLCBcblxuICAgICAgICAgICAgUmVhY3QuRE9NLmRpdih7Y2xhc3NOYW1lOiBcInNtYWxsLTEwIGNvbHVtbnNcIn0sIFxuICAgICAgICAgICAgICAgIFJlYWN0LkRPTS51bCh7Y2xhc3NOYW1lOiBcInRhYnNcIiwgJ2RhdGEtdGFiJzogdHJ1ZX0sIFxuICAgICAgICAgICAgICAgICAgICBSZWFjdC5ET00ubGkoe2NsYXNzTmFtZTogXCJ0YWItdGl0bGUgYWN0aXZlXCJ9LCBSZWFjdC5ET00uYSh7aHJlZjogXCIjcGFuZWwtb3BlcmF0aW9uc1wifSwgXCJPcGVyYXRpb25zXCIpKSwgXG4gICAgICAgICAgICAgICAgICAgIFJlYWN0LkRPTS5saSh7Y2xhc3NOYW1lOiBcInRhYi10aXRsZVwifSwgUmVhY3QuRE9NLmEoe2hyZWY6IFwiI3BhbmVsLWNoYXJ0c1wifSwgXCJDaGFydHNcIikpLCBcbiAgICAgICAgICAgICAgICAgICAgUmVhY3QuRE9NLmxpKHtjbGFzc05hbWU6IFwidGFiLXRpdGxlXCJ9LCBSZWFjdC5ET00uYSh7aHJlZjogXCIjcGFuZWwtc2ltaWxhcml0aWVzXCJ9LCBcIlNpbWlsYXJpdGllc1wiKSksIFxuICAgICAgICAgICAgICAgICAgICBSZWFjdC5ET00ubGkoe2NsYXNzTmFtZTogXCJ0YWItdGl0bGVcIn0sIFJlYWN0LkRPTS5hKHtocmVmOiBcIiNwYW5lbC1jYXRlZ29yaWVzXCJ9LCBcIkNhdGVnb3JpZXNcIikpXG4gICAgICAgICAgICAgICAgKSwgXG5cbiAgICAgICAgICAgICAgICBSZWFjdC5ET00uZGl2KHtjbGFzc05hbWU6IFwidGFicy1jb250ZW50XCJ9LCBcblxuICAgICAgICAgICAgICAgICAgICBSZWFjdC5ET00uZGl2KHtjbGFzc05hbWU6IFwiY29udGVudCBhY3RpdmVcIiwgaWQ6IFwicGFuZWwtb3BlcmF0aW9uc1wifSwgXG4gICAgICAgICAgICAgICAgICAgICAgICBPcGVyYXRpb25zQ29tcG9uZW50KHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvcGVyYXRpb25zOiB0aGlzLnN0YXRlLm9wZXJhdGlvbnMsIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhdGVnb3JpZXM6IHRoaXMuc3RhdGUuY2F0ZWdvcmllcywgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdXBkYXRlT3BlcmF0aW9uQ2F0ZWdvcnk6IHRoaXMudXBkYXRlT3BlcmF0aW9uQ2F0ZWdvcnl9XG4gICAgICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgICksIFxuXG4gICAgICAgICAgICAgICAgICAgIFJlYWN0LkRPTS5kaXYoe2NsYXNzTmFtZTogXCJjb250ZW50XCIsIGlkOiBcInBhbmVsLXNpbWlsYXJpdGllc1wifSwgXG4gICAgICAgICAgICAgICAgICAgICAgICBTaW1pbGFyaXR5Q29tcG9uZW50KHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYWlyczogdGhpcy5zdGF0ZS5yZWR1bmRhbnRQYWlycywgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVsZXRlT3BlcmF0aW9uOiB0aGlzLmRlbGV0ZU9wZXJhdGlvbn1cbiAgICAgICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAgICAgKSwgXG5cbiAgICAgICAgICAgICAgICAgICAgUmVhY3QuRE9NLmRpdih7Y2xhc3NOYW1lOiBcImNvbnRlbnRcIiwgaWQ6IFwicGFuZWwtY2hhcnRzXCJ9LCBcbiAgICAgICAgICAgICAgICAgICAgICAgIENoYXJ0Q29tcG9uZW50KHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhY2NvdW50OiB0aGlzLnN0YXRlLmN1cnJlbnRBY2NvdW50LCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvcGVyYXRpb25zOiB0aGlzLnN0YXRlLm9wZXJhdGlvbnMsIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhdGVnb3JpZXM6IHRoaXMuc3RhdGUuY2F0ZWdvcmllc31cbiAgICAgICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAgICAgKSwgXG5cbiAgICAgICAgICAgICAgICAgICAgUmVhY3QuRE9NLmRpdih7Y2xhc3NOYW1lOiBcImNvbnRlbnRcIiwgaWQ6IFwicGFuZWwtY2F0ZWdvcmllc1wifSwgXG4gICAgICAgICAgICAgICAgICAgICAgICBDYXRlZ29yeUNvbXBvbmVudCh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2F0ZWdvcmllczogdGhpcy5zdGF0ZS5jYXRlZ29yaWVzLCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbkNhdGVnb3J5Rm9ybVN1Ym1pdDogdGhpcy5hZGRDYXRlZ29yeX1cbiAgICAgICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAgICAgKVxuXG4gICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgKVxuXG4gICAgICAgICAgICApXG4gICAgICAgICk7XG4gICAgfVxufSk7XG5cbnZhciBTID0gZG9jdW1lbnQucXVlcnlTZWxlY3Rvci5iaW5kKGRvY3VtZW50KTtcblJlYWN0LnJlbmRlckNvbXBvbmVudChLcmVzdXMobnVsbCksIFMoJyNtYWluJykpO1xuXG4vKlxuICogQUxHT1JJVEhNU1xuICovXG5jb25zdCBUSU1FX1NJTUlMQVJfVEhSRVNIT0xEID0gMTAwMCAqIDYwICogNjAgKiAyNCAqIDI7IC8vIDQ4IGhvdXJzXG5mdW5jdGlvbiBmaW5kUmVkdW5kYW50QWxnb3JpdGhtKG9wZXJhdGlvbnMpIHtcbiAgICB2YXIgc2ltaWxhciA9IFtdO1xuXG4gICAgLy8gTyhuIGxvZyBuKVxuICAgIGZ1bmN0aW9uIHNvcnRDcml0ZXJpYShhLGIpIHsgcmV0dXJuIGEuYW1vdW50IC0gYi5hbW91bnQ7IH1cbiAgICB2YXIgc29ydGVkID0gb3BlcmF0aW9ucy5zbGljZSgpLnNvcnQoc29ydENyaXRlcmlhKTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IG9wZXJhdGlvbnMubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgaWYgKGkgKyAxID49IG9wZXJhdGlvbnMubGVuZ3RoKVxuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgIHZhciBvcCA9IHNvcnRlZFtpXTtcbiAgICAgICAgdmFyIG5leHQgPSBzb3J0ZWRbaSsxXTtcbiAgICAgICAgaWYgKG9wLmFtb3VudCA9PSBuZXh0LmFtb3VudCkge1xuICAgICAgICAgICAgdmFyIGRhdGVkaWZmID0gK29wLmRhdGUgLSArbmV4dC5kYXRlO1xuICAgICAgICAgICAgaWYgKGRhdGVkaWZmIDw9IFRJTUVfU0lNSUxBUl9USFJFU0hPTEQpXG4gICAgICAgICAgICAgICAgc2ltaWxhci5wdXNoKFtvcCwgbmV4dF0pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHNpbWlsYXI7XG59XG5cbi8qXG4gKiBDSEFSVFNcbiAqL1xuXG4kY2hhcnQgPSAkKCcjY2hhcnQnKTtcblxuZnVuY3Rpb24gQ3JlYXRlQ2hhcnRCeUNhdGVnb3J5QnlNb250aChjYXRJZCwgb3BlcmF0aW9ucykge1xuICAgIHZhciBvcHMgPSBbXTtcbiAgICBmb3IgKHZhciBvcCBvZiBvcGVyYXRpb25zKSB7XG4gICAgICAgIGlmIChvcC5jYXRlZ29yeUlkID09PSBjYXRJZClcbiAgICAgICAgICAgIG9wcy5wdXNoKG9wKTtcbiAgICB9XG4gICAgQ3JlYXRlQ2hhcnRBbGxCeUNhdGVnb3J5QnlNb250aChvcHMpO1xufVxuXG5mdW5jdGlvbiBDcmVhdGVDaGFydEFsbEJ5Q2F0ZWdvcnlCeU1vbnRoKG9wZXJhdGlvbnMpIHtcbiAgICBmdW5jdGlvbiBkYXRla2V5KG9wKSB7XG4gICAgICAgIHZhciBkID0gb3AuZGF0ZTtcbiAgICAgICAgcmV0dXJuIGQuZ2V0RnVsbFllYXIoKSArICctJyArIGQuZ2V0TW9udGgoKTtcbiAgICB9XG5cbiAgICB2YXIgbWFwID0ge307XG4gICAgdmFyIGRhdGVzZXQgPSB7fTtcbiAgICBmb3IgKHZhciBvcCBvZiBvcGVyYXRpb25zKSB7XG4gICAgICAgIHZhciBjID0gb3AuY2F0ZWdvcnlMYWJlbDtcbiAgICAgICAgbWFwW2NdID0gbWFwW2NdIHx8IHt9O1xuXG4gICAgICAgIHZhciBkayA9IGRhdGVrZXkob3ApO1xuICAgICAgICBtYXBbY11bZGtdID0gbWFwW2NdW2RrXSB8fCBbXTtcbiAgICAgICAgbWFwW2NdW2RrXS5wdXNoKG9wLmFtb3VudCk7XG4gICAgICAgIGRhdGVzZXRbZGtdID0gdHJ1ZTtcbiAgICB9XG5cbiAgICB2YXIgc2VyaWVzID0gW107XG4gICAgZm9yICh2YXIgYyBpbiBtYXApIHtcbiAgICAgICAgdmFyIGRhdGEgPSBbXTtcblxuICAgICAgICBmb3IgKHZhciBkayBpbiBkYXRlc2V0KSB7XG4gICAgICAgICAgICBtYXBbY11bZGtdID0gbWFwW2NdW2RrXSB8fCBbXTtcbiAgICAgICAgICAgIHZhciBzID0gMDtcbiAgICAgICAgICAgIHZhciBhcnIgPSBtYXBbY11bZGtdO1xuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBhcnIubGVuZ3RoOyBpKyspXG4gICAgICAgICAgICAgICAgcyArPSBhcnJbaV07XG4gICAgICAgICAgICBkYXRhLnB1c2gocyk7XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgc2VyaWUgPSB7XG4gICAgICAgICAgICBuYW1lOiBjLFxuICAgICAgICAgICAgZGF0YTogZGF0YVxuICAgICAgICB9O1xuXG4gICAgICAgIHNlcmllcy5wdXNoKHNlcmllKTtcbiAgICB9XG5cbiAgICB2YXIgY2F0ZWdvcmllcyA9IFtdO1xuICAgIGZvciAodmFyIGRrIGluIGRhdGVzZXQpXG4gICAgICAgIGNhdGVnb3JpZXMucHVzaChkayk7XG5cbiAgICB2YXIgdGl0bGUgPSAnQnkgY2F0ZWdvcnknO1xuICAgIHZhciB5QXhpc0xlZ2VuZCA9ICdBbW91bnQnO1xuXG4gICAgJGNoYXJ0LmhpZ2hjaGFydHMoe1xuICAgICAgICBjaGFydDoge1xuICAgICAgICAgICAgdHlwZTogJ2NvbHVtbidcbiAgICAgICAgfSxcbiAgICAgICAgdGl0bGU6IHtcbiAgICAgICAgICAgIHRleHQ6IHRpdGxlXG4gICAgICAgIH0sXG4gICAgICAgIHhBeGlzOiB7XG4gICAgICAgICAgICBjYXRlZ29yaWVzOiBjYXRlZ29yaWVzXG4gICAgICAgIH0sXG4gICAgICAgIHlBeGlzOiB7XG4gICAgICAgICAgICB0aXRsZToge1xuICAgICAgICAgICAgICAgIHRleHQ6IHlBeGlzTGVnZW5kXG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIHRvb2x0aXA6IHtcbiAgICAgICAgICAgIGhlYWRlckZvcm1hdDogJzxzcGFuIHN0eWxlPVwiZm9udC1zaXplOjEwcHhcIj57cG9pbnQua2V5fTwvc3Bhbj48dGFibGU+JyxcbiAgICAgICAgICAgIHBvaW50Rm9ybWF0OiAnPHRyPjx0ZCBzdHlsZT1cImNvbG9yOntzZXJpZXMuY29sb3J9O3BhZGRpbmc6MFwiPntzZXJpZXMubmFtZX06IDwvdGQ+JyArXG4gICAgICAgICAgICAnPHRkIHN0eWxlPVwicGFkZGluZzowXCI+PGI+e3BvaW50Lnk6LjFmfSBldXI8L2I+PC90ZD48L3RyPicsXG4gICAgICAgICAgICBmb290ZXJGb3JtYXQ6ICc8L3RhYmxlPicsXG4gICAgICAgICAgICBzaGFyZWQ6IHRydWUsXG4gICAgICAgICAgICB1c2VIVE1MOiB0cnVlXG4gICAgICAgIH0sXG4gICAgICAgIHBsb3RPcHRpb25zOiB7XG4gICAgICAgICAgICBjb2x1bW46IHtcbiAgICAgICAgICAgICAgICBwb2ludFBhZGRpbmc6IDAuMixcbiAgICAgICAgICAgICAgICBib3JkZXJXaWR0aDogMFxuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICBzZXJpZXM6IHNlcmllc1xuICAgIH0pO1xufVxuXG4vLyBUT0RPIHVudXNlZCByaWdodCBub3dcbmZ1bmN0aW9uIENyZWF0ZUNoYXJ0QWxsT3BlcmF0aW9ucyhhY2NvdW50LCBvcGVyYXRpb25zKSB7XG4gICAgY3JlYXRlQ2hhcnQoYWNjb3VudC5pbml0aWFsQW1vdW50LCBvcGVyYXRpb25zLnNsaWNlKCksIGFjY291bnQudGl0bGUpO1xufVxuXG5mdW5jdGlvbiBDcmVhdGVDaGFydEJ5Q2F0ZWdvcnkoY2F0SWQsIGNhdExhYmVsLCBvcGVyYXRpb25zKSB7XG4gICAgdmFyIG9wcyA9IG9wZXJhdGlvbnMuc2xpY2UoKS5maWx0ZXIoZnVuY3Rpb24oeCkge1xuICAgICAgICByZXR1cm4geC5jYXRlZ29yeUlkID09IGNhdElkO1xuICAgIH0pO1xuXG4gICAgY3JlYXRlQ2hhcnQoMCwgb3BzLCBjYXRMYWJlbCk7XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZUNoYXJ0KGluaXRpYWxBbW91bnQsIG9wZXJhdGlvbnMsIHRpdGxlKSB7XG4gICAgaWYgKG9wZXJhdGlvbnMubGVuZ3RoID09PSAwKVxuICAgICAgICByZXR1cm47XG5cbiAgICB2YXIgb3BzID0gb3BlcmF0aW9ucy5zb3J0KGZ1bmN0aW9uIChhLGIpIHsgcmV0dXJuICthLmRhdGUgLSArYi5kYXRlIH0pO1xuICAgIHZhciBjdW11bGF0aXZlQW1vdW50ID0gaW5pdGlhbEFtb3VudDtcbiAgICAvLyBNdXN0IGNvbnRhaW4gYXJyYXkgcGFpcnMgWytkYXRlLCB2YWx1ZV1cbiAgICB2YXIgcG9zaXRpdmUgPSAoaW5pdGlhbEFtb3VudCA+IDApID8gaW5pdGlhbEFtb3VudCA6IDA7XG4gICAgdmFyIG5lZ2F0aXZlID0gKGluaXRpYWxBbW91bnQgPCAwKSA/IC1pbml0aWFsQW1vdW50IDogMDtcbiAgICB2YXIgYmFsYW5jZSA9IGluaXRpYWxBbW91bnQ7XG5cbiAgICB2YXIgcG9zZCA9IFtdO1xuICAgIHZhciBuZWdkID0gW107XG4gICAgdmFyIGJhbGQgPSBbXTtcblxuICAgIHZhciBvcG1hcCA9IHt9O1xuICAgIHZhciBwb3NtYXAgPSB7fTtcbiAgICB2YXIgbmVnbWFwID0ge307XG5cbiAgICBvcHMubWFwKGZ1bmN0aW9uKG8pIHtcbiAgICAgICAgLy8gQ29udmVydCBkYXRlIGludG8gYSBudW1iZXI6IGl0J3MgZ29pbmcgdG8gYmUgY29udmVydGVkIGludG8gYSBzdHJpbmdcbiAgICAgICAgLy8gd2hlbiB1c2VkIGFzIGEga2V5LlxuICAgICAgICB2YXIgYSA9IG8uYW1vdW50O1xuICAgICAgICB2YXIgZCA9ICtvLmRhdGU7XG4gICAgICAgIG9wbWFwW2RdID0gb3BtYXBbZF0gfHwgMDtcbiAgICAgICAgb3BtYXBbZF0gKz0gYTtcblxuICAgICAgICBpZiAoYSA8IDApIHtcbiAgICAgICAgICAgIG5lZ21hcFtkXSA9IG5lZ21hcFtkXSB8fCAwO1xuICAgICAgICAgICAgbmVnbWFwW2RdICs9IC1hO1xuICAgICAgICB9IGVsc2UgaWYgKGEgPiAwKSB7XG4gICAgICAgICAgICBwb3NtYXBbZF0gPSBwb3NtYXBbZF0gfHwgMDtcbiAgICAgICAgICAgIHBvc21hcFtkXSArPSBhO1xuICAgICAgICB9XG4gICAgfSlcblxuICAgIGZvciAodmFyIGRhdGUgaW4gb3BtYXApIHtcbiAgICAgICAgLy8gZGF0ZSBpcyBhIHN0cmluZyBub3c6IGNvbnZlcnQgaXQgYmFjayB0byBhIG51bWJlciBmb3IgaGlnaGNoYXJ0cy5cbiAgICAgICAgYmFsYW5jZSArPSBvcG1hcFtkYXRlXTtcbiAgICAgICAgYmFsZC5wdXNoKFsrZGF0ZSwgYmFsYW5jZV0pO1xuXG4gICAgICAgIGlmIChwb3NtYXBbZGF0ZV0pIHtcbiAgICAgICAgICAgIHBvc2l0aXZlICs9IHBvc21hcFtkYXRlXTtcbiAgICAgICAgfVxuICAgICAgICBpZiAobmVnbWFwW2RhdGVdKSB7XG4gICAgICAgICAgICBuZWdhdGl2ZSArPSBuZWdtYXBbZGF0ZV07XG4gICAgICAgIH1cbiAgICAgICAgcG9zZC5wdXNoKFsrZGF0ZSwgcG9zaXRpdmVdKTtcbiAgICAgICAgbmVnZC5wdXNoKFsrZGF0ZSwgbmVnYXRpdmVdKTtcbiAgICB9XG5cbiAgICAvLyBDcmVhdGUgdGhlIGNoYXJ0XG4gICAgJGNoYXJ0LmhpZ2hjaGFydHMoJ1N0b2NrQ2hhcnQnLCB7XG4gICAgICAgIHJhbmdlU2VsZWN0b3IgOiB7XG4gICAgICAgICAgICBzZWxlY3RlZCA6IDEsXG4gICAgICAgICAgICBpbnB1dEVuYWJsZWQ6ICRjaGFydC53aWR0aCgpID4gNDgwXG4gICAgICAgIH0sXG5cbiAgICAgICAgdGl0bGUgOiB7XG4gICAgICAgICAgICB0ZXh0IDogdGl0bGVcbiAgICAgICAgfSxcblxuICAgICAgICBzZXJpZXMgOiBbe1xuICAgICAgICAgICAgbmFtZSA6ICdCYWxhbmNlJyxcbiAgICAgICAgICAgIGRhdGEgOiBiYWxkLFxuICAgICAgICAgICAgdG9vbHRpcDogeyB2YWx1ZURlY2ltYWxzOiAyIH1cbiAgICAgICAgfSwge1xuICAgICAgICAgICAgbmFtZTogJ0NyZWRpdCcsXG4gICAgICAgICAgICBkYXRhOiBwb3NkLFxuICAgICAgICAgICAgdG9vbHRpcDogeyB2YWx1ZURlY2ltYWxzOiAyIH1cbiAgICAgICAgfSwge1xuICAgICAgICAgICAgbmFtZTogJ0RlYml0JyxcbiAgICAgICAgICAgIGRhdGE6IG5lZ2QsXG4gICAgICAgICAgICB0b29sdGlwOiB7IHZhbHVlRGVjaW1hbHM6IDIgfVxuICAgICAgICB9XVxuICAgIH0pO1xufVxuXG4iXX0=
