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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2Jlbi9jb2RlL2NvenkvZGV2L2tyZXN1cy9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwiL2hvbWUvYmVuL2NvZGUvY296eS9kZXYva3Jlc3VzL2NsaWVudC9oZWxwZXJzLmpzIiwiL2hvbWUvYmVuL2NvZGUvY296eS9kZXYva3Jlc3VzL2NsaWVudC9tYWluLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dGhyb3cgbmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKX12YXIgZj1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwoZi5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxmLGYuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiLypcbiAqIEhFTFBFUlNcbiAqL1xuXG5jb25zdCBERUJVRyA9IHRydWU7XG5jb25zdCBBU1NFUlRTID0gdHJ1ZTtcblxuZXhwb3J0cy5kZWJ1ZyA9IGZ1bmN0aW9uIGRlYnVnKCkge1xuICAgIERFQlVHICYmIGNvbnNvbGUubG9nLmFwcGx5KGNvbnNvbGUsIGFyZ3VtZW50cyk7XG59O1xuXG52YXIgYXNzZXJ0ID0gZXhwb3J0cy5hc3NlcnQgPSBmdW5jdGlvbih4LCB3YXQpIHtcbiAgICBpZiAoIXgpIHtcbiAgICAgICAgQVNTRVJUUyAmJiBhbGVydCgnYXNzZXJ0aW9uIGVycm9yOiAnICsgKHdhdD93YXQrJ1xcbic6JycpICsgbmV3IEVycm9yKCkuc3RhY2spO1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIHJldHVybiB0cnVlO1xufTtcblxuZXhwb3J0cy5oYXMgPSBmdW5jdGlvbiBoYXMob2JqLCBwcm9wKSB7XG4gICAgcmV0dXJuIGFzc2VydChvYmouaGFzT3duUHJvcGVydHkocHJvcCkpO1xufVxuIiwiLyoqIEBqc3ggUmVhY3QuRE9NICovXG5cbnZhciBIZWxwZXJzID0gcmVxdWlyZSgnLi9oZWxwZXJzLmpzJyk7XG5cbnZhciBkZWJ1ZyA9IEhlbHBlcnMuZGVidWc7XG52YXIgYXNzZXJ0ID0gSGVscGVycy5hc3NlcnQ7XG52YXIgaGFzID0gSGVscGVycy5oYXM7XG5cbmZ1bmN0aW9uIHhockVycm9yKHhociwgdGV4dFN0YXR1cywgZXJyKSB7XG4gICAgYWxlcnQoJ3hociBlcnJvcjogJyArIHRleHRTdGF0dXMgKyAnXFxuJyArIGVycik7XG59XG5cbi8qXG4gKiBNT0RFTFNcbiAqL1xuZnVuY3Rpb24gQmFuayhhcmcpIHtcbiAgICB0aGlzLmlkICAgPSBoYXMoYXJnLCAnaWQnKSAgICYmIGFyZy5pZDtcbiAgICB0aGlzLm5hbWUgPSBoYXMoYXJnLCAnbmFtZScpICYmIGFyZy5uYW1lO1xuICAgIHRoaXMudXVpZCA9IGhhcyhhcmcsICd1dWlkJykgJiYgYXJnLnV1aWQ7XG59XG5cbmZ1bmN0aW9uIEFjY291bnQoYXJnKSB7XG4gICAgdGhpcy5iYW5rICAgICAgICAgID0gaGFzKGFyZywgJ2JhbmsnKSAmJiBhcmcuYmFuaztcbiAgICB0aGlzLmJhbmtBY2Nlc3MgICAgPSBoYXMoYXJnLCAnYmFua0FjY2VzcycpICYmIGFyZy5iYW5rQWNjZXNzO1xuICAgIHRoaXMudGl0bGUgICAgICAgICA9IGhhcyhhcmcsICd0aXRsZScpICYmIGFyZy50aXRsZTtcbiAgICB0aGlzLmFjY291bnROdW1iZXIgPSBoYXMoYXJnLCAnYWNjb3VudE51bWJlcicpICYmIGFyZy5hY2NvdW50TnVtYmVyO1xuICAgIHRoaXMuaW5pdGlhbEFtb3VudCA9IGhhcyhhcmcsICdpbml0aWFsQW1vdW50JykgJiYgYXJnLmluaXRpYWxBbW91bnQ7XG4gICAgdGhpcy5sYXN0Q2hlY2tlZCAgID0gaGFzKGFyZywgJ2xhc3RDaGVja2VkJykgJiYgbmV3IERhdGUoYXJnLmxhc3RDaGVja2VkKTtcbiAgICB0aGlzLmlkICAgICAgICAgICAgPSBoYXMoYXJnLCAnaWQnKSAmJiBhcmcuaWQ7XG4gICAgdGhpcy5hbW91bnQgICAgICAgID0gaGFzKGFyZywgJ2Ftb3VudCcpICYmIGFyZy5hbW91bnQ7XG59XG5cbmZ1bmN0aW9uIE9wZXJhdGlvbihhcmcpIHtcbiAgICB0aGlzLmJhbmtBY2NvdW50ID0gaGFzKGFyZywgJ2JhbmtBY2NvdW50JykgJiYgYXJnLmJhbmtBY2NvdW50O1xuICAgIHRoaXMudGl0bGUgICAgICAgPSBoYXMoYXJnLCAndGl0bGUnKSAmJiBhcmcudGl0bGU7XG4gICAgdGhpcy5kYXRlICAgICAgICA9IGhhcyhhcmcsICdkYXRlJykgJiYgbmV3IERhdGUoYXJnLmRhdGUpO1xuICAgIHRoaXMuYW1vdW50ICAgICAgPSBoYXMoYXJnLCAnYW1vdW50JykgJiYgYXJnLmFtb3VudDtcbiAgICB0aGlzLnJhdyAgICAgICAgID0gaGFzKGFyZywgJ3JhdycpICYmIGFyZy5yYXc7XG4gICAgdGhpcy5kYXRlSW1wb3J0ICA9IGhhcyhhcmcsICdkYXRlSW1wb3J0JykgJiYgbmV3IERhdGUoYXJnLmRhdGVJbXBvcnQpO1xuICAgIHRoaXMuaWQgICAgICAgICAgPSBoYXMoYXJnLCAnaWQnKSAmJiBhcmcuaWQ7XG5cbiAgICAvLyBPcHRpb25hbFxuICAgIHRoaXMudXBkYXRlTGFiZWwoYXJnLmNhdGVnb3J5SWQgfHwgLTEpO1xufVxuXG5PcGVyYXRpb24ucHJvdG90eXBlLnVwZGF0ZUxhYmVsID0gZnVuY3Rpb24oaWQpIHtcbiAgICB0aGlzLmNhdGVnb3J5SWQgPSBpZDtcbiAgICBpZiAodHlwZW9mIENhdGVnb3J5TWFwICE9PSAndW5kZWZpbmVkJyAmJlxuICAgICAgICB0eXBlb2YgQ2F0ZWdvcnlNYXBbaWRdICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICB0aGlzLmNhdGVnb3J5TGFiZWwgPSBDYXRlZ29yeU1hcFtpZF07XG4gICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5jYXRlZ29yeUxhYmVsID0gJ05vbmUnO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gQ2F0ZWdvcnkoYXJnKSB7XG4gICAgdGhpcy50aXRsZSA9IGhhcyhhcmcsICd0aXRsZScpICYmIGFyZy50aXRsZTtcbiAgICB0aGlzLmlkID0gaGFzKGFyZywgJ2lkJykgJiYgYXJnLmlkO1xuXG4gICAgLy8gT3B0aW9uYWxcbiAgICB0aGlzLnBhcmVudElkID0gYXJnLnBhcmVudElkO1xufVxuXG4vKlxuICogUmVhY3QgQ29tcG9uZW50c1xuICovXG5cbnZhciBDYXRlZ29yeUl0ZW0gPSBSZWFjdC5jcmVhdGVDbGFzcyh7ZGlzcGxheU5hbWU6ICdDYXRlZ29yeUl0ZW0nLFxuXG4gICAgcmVuZGVyOiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIFJlYWN0LkRPTS5saShudWxsLCB0aGlzLnByb3BzLnRpdGxlKVxuICAgICAgICApO1xuICAgIH1cbn0pO1xuXG52YXIgQ2F0ZWdvcnlMaXN0ID0gUmVhY3QuY3JlYXRlQ2xhc3Moe2Rpc3BsYXlOYW1lOiAnQ2F0ZWdvcnlMaXN0JyxcblxuICAgIHJlbmRlcjogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBpdGVtcyA9IHRoaXMucHJvcHMuY2F0ZWdvcmllcy5tYXAoZnVuY3Rpb24gKGNhdCkge1xuICAgICAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgICAgICBDYXRlZ29yeUl0ZW0oe2tleTogY2F0LmlkLCB0aXRsZTogY2F0LnRpdGxlfSlcbiAgICAgICAgICAgICk7XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgUmVhY3QuRE9NLnVsKG51bGwsIGl0ZW1zKVxuICAgICAgICApO1xuICAgIH1cbn0pO1xuXG52YXIgQ2F0ZWdvcnlGb3JtID0gUmVhY3QuY3JlYXRlQ2xhc3Moe2Rpc3BsYXlOYW1lOiAnQ2F0ZWdvcnlGb3JtJyxcblxuICAgIG9uU3VibWl0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGxhYmVsID0gdGhpcy5yZWZzLmxhYmVsLmdldERPTU5vZGUoKS52YWx1ZS50cmltKCk7XG4gICAgICAgIGlmICghbGFiZWwpXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG5cbiAgICAgICAgdmFyIGNhdFBvZCA9IHt0aXRsZTogbGFiZWx9O1xuICAgICAgICB0aGlzLnByb3BzLm9uU3VibWl0KGNhdFBvZCk7XG4gICAgICAgIHRoaXMucmVmcy5sYWJlbC5nZXRET01Ob2RlKCkudmFsdWUgPSAnJztcbiAgICB9LFxuXG4gICAgcmVuZGVyOiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIFJlYWN0LkRPTS5mb3JtKHtvblN1Ym1pdDogdGhpcy5vblN1Ym1pdH0sIFxuICAgICAgICAgICAgICAgIFJlYWN0LkRPTS5kaXYoe2NsYXNzTmFtZTogXCJyb3dcIn0sIFxuICAgICAgICAgICAgICAgICAgICBSZWFjdC5ET00uZGl2KHtjbGFzc05hbWU6IFwic21hbGwtMTAgY29sdW1uc1wifSwgXG4gICAgICAgICAgICAgICAgICAgICAgICBSZWFjdC5ET00uaW5wdXQoe3R5cGU6IFwidGV4dFwiLCBwbGFjZWhvbGRlcjogXCJMYWJlbCBvZiBuZXcgY2F0ZWdvcnlcIiwgcmVmOiBcImxhYmVsXCJ9KVxuICAgICAgICAgICAgICAgICAgICApLCBcbiAgICAgICAgICAgICAgICAgICAgUmVhY3QuRE9NLmRpdih7Y2xhc3NOYW1lOiBcInNtYWxsLTIgY29sdW1uc1wifSwgXG4gICAgICAgICAgICAgICAgICAgICAgICBSZWFjdC5ET00uaW5wdXQoe3R5cGU6IFwic3VibWl0XCIsIGNsYXNzTmFtZTogXCJidXR0b24gcG9zdGZpeFwiLCB2YWx1ZTogXCJTdWJtaXRcIn0pXG4gICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICApXG4gICAgICAgIClcbiAgICB9XG59KTtcblxudmFyIENhdGVnb3J5Q29tcG9uZW50ID0gUmVhY3QuY3JlYXRlQ2xhc3Moe2Rpc3BsYXlOYW1lOiAnQ2F0ZWdvcnlDb21wb25lbnQnLFxuXG4gICAgcmVuZGVyOiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIFJlYWN0LkRPTS5kaXYobnVsbCwgXG4gICAgICAgICAgICAgICAgUmVhY3QuRE9NLmgxKG51bGwsIFwiQ2F0ZWdvcmllc1wiKSwgXG4gICAgICAgICAgICAgICAgQ2F0ZWdvcnlMaXN0KHtjYXRlZ29yaWVzOiB0aGlzLnByb3BzLmNhdGVnb3JpZXN9KSwgXG4gICAgICAgICAgICAgICAgUmVhY3QuRE9NLmgzKG51bGwsIFwiQWRkIGEgY2F0ZWdvcnlcIiksIFxuICAgICAgICAgICAgICAgIENhdGVnb3J5Rm9ybSh7b25TdWJtaXQ6IHRoaXMucHJvcHMub25DYXRlZ29yeUZvcm1TdWJtaXR9KVxuICAgICAgICAgICAgKVxuICAgICAgICApO1xuICAgIH1cbn0pO1xuXG4vLyBQcm9wczogc2V0Q3VycmVudEJhbms6IGZ1bmN0aW9uKGJhbmspe30sIGJhbms6IEJhbmtcbnZhciBCYW5rTGlzdEl0ZW1Db21wb25lbnQgPSBSZWFjdC5jcmVhdGVDbGFzcyh7ZGlzcGxheU5hbWU6ICdCYW5rTGlzdEl0ZW1Db21wb25lbnQnLFxuXG4gICAgb25DbGljazogZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoaXMucHJvcHMuc2V0Q3VycmVudEJhbmsodGhpcy5wcm9wcy5iYW5rKTtcbiAgICB9LFxuXG4gICAgcmVuZGVyOiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIFJlYWN0LkRPTS5saShudWxsLCBSZWFjdC5ET00uYSh7b25DbGljazogdGhpcy5vbkNsaWNrfSwgdGhpcy5wcm9wcy5iYW5rLm5hbWUpKVxuICAgICAgICApO1xuICAgIH1cbn0pO1xuXG4vLyBQcm9wczogc2V0Q3VycmVudEJhbms6IGZ1bmN0aW9uKGJhbmspe30sIGJhbmtzOiBbQmFua11cbnZhciBCYW5rTGlzdENvbXBvbmVudCA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtkaXNwbGF5TmFtZTogJ0JhbmtMaXN0Q29tcG9uZW50JyxcblxuICAgIHJlbmRlcjogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBzZXRDdXJyZW50QmFuayA9IHRoaXMucHJvcHMuc2V0Q3VycmVudEJhbms7XG4gICAgICAgIHZhciBiYW5rcyA9IHRoaXMucHJvcHMuYmFua3MubWFwKGZ1bmN0aW9uIChiKSB7XG4gICAgICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgICAgIEJhbmtMaXN0SXRlbUNvbXBvbmVudCh7a2V5OiBiLmlkLCBiYW5rOiBiLCBzZXRDdXJyZW50QmFuazogc2V0Q3VycmVudEJhbmt9KVxuICAgICAgICAgICAgKVxuICAgICAgICB9KTtcblxuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgUmVhY3QuRE9NLmRpdihudWxsLCBcbiAgICAgICAgICAgICAgICBcIkJhbmtzXCIsIFxuICAgICAgICAgICAgICAgIFJlYWN0LkRPTS51bCh7Y2xhc3NOYW1lOiBcInJvd1wifSwgXG4gICAgICAgICAgICAgICAgICAgIGJhbmtzXG4gICAgICAgICAgICAgICAgKSwgXG4gICAgICAgICAgICAgICAgUmVhY3QuRE9NLmhyKG51bGwpXG4gICAgICAgICAgICApXG4gICAgICAgICk7XG4gICAgfVxufSk7XG5cbi8vIFByb3BzOiBzZXRDdXJyZW50QWNjb3VudDogZnVuY3Rpb24oYWNjb3VudCl7fSwgYWNjb3VudDogQWNjb3VudFxudmFyIEFjY291bnRzTGlzdEl0ZW0gPSBSZWFjdC5jcmVhdGVDbGFzcyh7ZGlzcGxheU5hbWU6ICdBY2NvdW50c0xpc3RJdGVtJyxcblxuICAgIG9uQ2xpY2s6IGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLnByb3BzLnNldEN1cnJlbnRBY2NvdW50KHRoaXMucHJvcHMuYWNjb3VudCk7XG4gICAgfSxcblxuICAgIHJlbmRlcjogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICBSZWFjdC5ET00ubGkobnVsbCwgXG4gICAgICAgICAgICAgICAgUmVhY3QuRE9NLmEoe29uQ2xpY2s6IHRoaXMub25DbGlja30sIHRoaXMucHJvcHMuYWNjb3VudC50aXRsZSlcbiAgICAgICAgICAgIClcbiAgICAgICAgKTtcbiAgICB9XG59KTtcblxuLy8gUHJvcHM6IHNldEN1cnJlbnRBY2NvdW50OiBmdW5jdGlvbihhY2NvdW50KSB7fSwgYWNjb3VudHM6IFtBY2NvdW50XVxudmFyIEFjY291bnRzTGlzdENvbXBvbmVudCA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtkaXNwbGF5TmFtZTogJ0FjY291bnRzTGlzdENvbXBvbmVudCcsXG5cbiAgICByZW5kZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgc2V0Q3VycmVudEFjY291bnQgPSB0aGlzLnByb3BzLnNldEN1cnJlbnRBY2NvdW50O1xuICAgICAgICB2YXIgYWNjb3VudHMgPSB0aGlzLnByb3BzLmFjY291bnRzLm1hcChmdW5jdGlvbiAoYSkge1xuICAgICAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgICAgICBBY2NvdW50c0xpc3RJdGVtKHtrZXk6IGEuaWQsIGFjY291bnQ6IGEsIHNldEN1cnJlbnRBY2NvdW50OiBzZXRDdXJyZW50QWNjb3VudH0pXG4gICAgICAgICAgICApO1xuICAgICAgICB9KTtcblxuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgUmVhY3QuRE9NLmRpdihudWxsLCBcbiAgICAgICAgICAgICAgICBcIkFjY291bnRzXCIsIFxuICAgICAgICAgICAgICAgIFJlYWN0LkRPTS51bCh7Y2xhc3NOYW1lOiBcInJvd1wifSwgXG4gICAgICAgICAgICAgICAgICAgIGFjY291bnRzXG4gICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgKVxuICAgICAgICApO1xuICAgIH1cbn0pO1xuXG52YXIgQ2F0ZWdvcnlTZWxlY3RDb21wb25lbnQgPSBSZWFjdC5jcmVhdGVDbGFzcyh7ZGlzcGxheU5hbWU6ICdDYXRlZ29yeVNlbGVjdENvbXBvbmVudCcsXG5cbiAgICBnZXRJbml0aWFsU3RhdGU6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4geyBlZGl0TW9kZTogZmFsc2UgfVxuICAgIH0sXG5cbiAgICBvbkNoYW5nZTogZnVuY3Rpb24oZSkge1xuICAgICAgICB2YXIgc2VsZWN0ZWQgPSB0aGlzLnJlZnMuY2F0LmdldERPTU5vZGUoKS52YWx1ZTtcbiAgICAgICAgdGhpcy5wcm9wcy51cGRhdGVPcGVyYXRpb25DYXRlZ29yeSh0aGlzLnByb3BzLm9wZXJhdGlvbiwgc2VsZWN0ZWQpO1xuICAgIH0sXG5cbiAgICBzd2l0Y2hUb0VkaXRNb2RlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IGVkaXRNb2RlOiB0cnVlIH0sIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdGhpcy5yZWZzLmNhdC5nZXRET01Ob2RlKCkuZm9jdXMoKTtcbiAgICAgICAgfSk7XG4gICAgfSxcbiAgICBzd2l0Y2hUb1N0YXRpY01vZGU6IGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHsgZWRpdE1vZGU6IGZhbHNlIH0pO1xuICAgIH0sXG5cbiAgICByZW5kZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgbGFiZWwgPSB0aGlzLnByb3BzLm9wZXJhdGlvbi5jYXRlZ29yeUxhYmVsO1xuICAgICAgICB2YXIgc2VsZWN0ZWRJZCA9IHRoaXMucHJvcHMub3BlcmF0aW9uLmNhdGVnb3J5SWQ7XG5cbiAgICAgICAgaWYgKCF0aGlzLnN0YXRlLmVkaXRNb2RlKSB7XG4gICAgICAgICAgICByZXR1cm4gKFJlYWN0LkRPTS5zcGFuKHtvbkNsaWNrOiB0aGlzLnN3aXRjaFRvRWRpdE1vZGV9LCBsYWJlbCkpXG4gICAgICAgIH1cblxuICAgICAgICB2YXIgY2F0ZWdvcmllcyA9IFtuZXcgQ2F0ZWdvcnkoe3RpdGxlOiAnTm9uZScsIGlkOiAnLTEnfSldLmNvbmNhdCh0aGlzLnByb3BzLmNhdGVnb3JpZXMpO1xuICAgICAgICB2YXIgb3B0aW9ucyA9IGNhdGVnb3JpZXMubWFwKGZ1bmN0aW9uIChjKSB7XG4gICAgICAgICAgICByZXR1cm4gKFJlYWN0LkRPTS5vcHRpb24oe2tleTogYy5pZCwgdmFsdWU6IGMuaWR9LCBjLnRpdGxlKSlcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICBSZWFjdC5ET00uc2VsZWN0KHtvbkNoYW5nZTogdGhpcy5vbkNoYW5nZSwgb25CbHVyOiB0aGlzLnN3aXRjaFRvU3RhdGljTW9kZSwgZGVmYXVsdFZhbHVlOiBzZWxlY3RlZElkLCByZWY6IFwiY2F0XCJ9LCBcbiAgICAgICAgICAgICAgICBvcHRpb25zXG4gICAgICAgICAgICApXG4gICAgICAgICk7XG4gICAgfVxufSk7XG5cbnZhciBPcGVyYXRpb25Db21wb25lbnQgPSBSZWFjdC5jcmVhdGVDbGFzcyh7ZGlzcGxheU5hbWU6ICdPcGVyYXRpb25Db21wb25lbnQnLFxuXG4gICAgZ2V0SW5pdGlhbFN0YXRlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHsgbW91c2VPbjogZmFsc2UgfTtcbiAgICB9LFxuXG4gICAgb25Nb3VzZUVudGVyOiBmdW5jdGlvbihlKSB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoeyBtb3VzZU9uOiB0cnVlIH0pXG4gICAgfSxcbiAgICBvbk1vdXNlTGVhdmU6IGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IG1vdXNlT246IGZhbHNlIH0pXG4gICAgfSxcblxuICAgIHJlbmRlcjogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBvcCA9IHRoaXMucHJvcHMub3BlcmF0aW9uO1xuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgUmVhY3QuRE9NLnRyKG51bGwsIFxuICAgICAgICAgICAgICAgIFJlYWN0LkRPTS50ZChudWxsLCBvcC5kYXRlLnRvU3RyaW5nKCkpLCBcbiAgICAgICAgICAgICAgICBSZWFjdC5ET00udGQoe29uTW91c2VFbnRlcjogdGhpcy5vbk1vdXNlRW50ZXIsIG9uTW91c2VMZWF2ZTogdGhpcy5vbk1vdXNlTGVhdmV9LCB0aGlzLnN0YXRlLm1vdXNlT24gPyBvcC5yYXcgOiBvcC50aXRsZSksIFxuICAgICAgICAgICAgICAgIFJlYWN0LkRPTS50ZChudWxsLCBvcC5hbW91bnQpLCBcbiAgICAgICAgICAgICAgICBSZWFjdC5ET00udGQobnVsbCwgXG4gICAgICAgICAgICAgICAgICAgIENhdGVnb3J5U2VsZWN0Q29tcG9uZW50KHtvcGVyYXRpb246IG9wLCBjYXRlZ29yaWVzOiB0aGlzLnByb3BzLmNhdGVnb3JpZXMsIFxuICAgICAgICAgICAgICAgICAgICAgICAgdXBkYXRlT3BlcmF0aW9uQ2F0ZWdvcnk6IHRoaXMucHJvcHMudXBkYXRlT3BlcmF0aW9uQ2F0ZWdvcnl9KVxuICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgIClcbiAgICAgICAgKTtcbiAgICB9XG59KTtcblxudmFyIE9wZXJhdGlvbnNDb21wb25lbnQgPSBSZWFjdC5jcmVhdGVDbGFzcyh7ZGlzcGxheU5hbWU6ICdPcGVyYXRpb25zQ29tcG9uZW50JyxcblxuICAgIHJlbmRlcjogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBjYXRlZ29yaWVzID0gdGhpcy5wcm9wcy5jYXRlZ29yaWVzO1xuICAgICAgICB2YXIgdXBkYXRlT3BlcmF0aW9uQ2F0ZWdvcnkgPSB0aGlzLnByb3BzLnVwZGF0ZU9wZXJhdGlvbkNhdGVnb3J5O1xuICAgICAgICB2YXIgb3BzID0gdGhpcy5wcm9wcy5vcGVyYXRpb25zLm1hcChmdW5jdGlvbiAobykge1xuICAgICAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgICAgICBPcGVyYXRpb25Db21wb25lbnQoe2tleTogby5pZCwgb3BlcmF0aW9uOiBvLCBjYXRlZ29yaWVzOiBjYXRlZ29yaWVzLCB1cGRhdGVPcGVyYXRpb25DYXRlZ29yeTogdXBkYXRlT3BlcmF0aW9uQ2F0ZWdvcnl9KVxuICAgICAgICAgICAgKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIFJlYWN0LkRPTS5kaXYobnVsbCwgXG4gICAgICAgICAgICAgICAgUmVhY3QuRE9NLmgxKG51bGwsIFwiT3BlcmF0aW9uc1wiKSwgXG4gICAgICAgICAgICAgICAgUmVhY3QuRE9NLnRhYmxlKG51bGwsIFxuICAgICAgICAgICAgICAgICAgICBSZWFjdC5ET00udGhlYWQobnVsbCwgXG4gICAgICAgICAgICAgICAgICAgICAgICBSZWFjdC5ET00udHIobnVsbCwgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgUmVhY3QuRE9NLnRoKG51bGwsIFwiRGF0ZVwiKSwgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgUmVhY3QuRE9NLnRoKG51bGwsIFwiVGl0bGVcIiksIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFJlYWN0LkRPTS50aChudWxsLCBcIkFtb3VudFwiKSwgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgUmVhY3QuRE9NLnRoKG51bGwsIFwiQ2F0ZWdvcnlcIilcbiAgICAgICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAgICAgKSwgXG4gICAgICAgICAgICAgICAgICAgIFJlYWN0LkRPTS50Ym9keShudWxsLCBcbiAgICAgICAgICAgICAgICAgICAgICAgIG9wc1xuICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgKVxuICAgICAgICApO1xuICAgIH1cbn0pO1xuXG52YXIgU2ltaWxhcml0eUl0ZW1Db21wb25lbnQgPSBSZWFjdC5jcmVhdGVDbGFzcyh7ZGlzcGxheU5hbWU6ICdTaW1pbGFyaXR5SXRlbUNvbXBvbmVudCcsXG5cbiAgICBkZWxldGVPcGVyYXRpb246IGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLnByb3BzLmRlbGV0ZU9wZXJhdGlvbih0aGlzLnByb3BzLm9wKTtcbiAgICB9LFxuXG4gICAgcmVuZGVyOiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIFJlYWN0LkRPTS50cihudWxsLCBcbiAgICAgICAgICAgICAgICBSZWFjdC5ET00udGQobnVsbCwgdGhpcy5wcm9wcy5vcC5kYXRlLnRvU3RyaW5nKCkpLCBcbiAgICAgICAgICAgICAgICBSZWFjdC5ET00udGQobnVsbCwgdGhpcy5wcm9wcy5vcC50aXRsZSksIFxuICAgICAgICAgICAgICAgIFJlYWN0LkRPTS50ZChudWxsLCB0aGlzLnByb3BzLm9wLmFtb3VudCksIFxuICAgICAgICAgICAgICAgIFJlYWN0LkRPTS50ZChudWxsLCBSZWFjdC5ET00uYSh7b25DbGljazogdGhpcy5kZWxldGVPcGVyYXRpb259LCBcInhcIikpXG4gICAgICAgICAgICApXG4gICAgICAgICk7XG4gICAgfVxufSk7XG5cbnZhciBTaW1pbGFyaXR5UGFpckNvbXBvbmVudCA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtkaXNwbGF5TmFtZTogJ1NpbWlsYXJpdHlQYWlyQ29tcG9uZW50JyxcblxuICAgIHJlbmRlcjogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICBSZWFjdC5ET00udGFibGUobnVsbCwgXG4gICAgICAgICAgICAgICAgU2ltaWxhcml0eUl0ZW1Db21wb25lbnQoe29wOiB0aGlzLnByb3BzLmEsIGRlbGV0ZU9wZXJhdGlvbjogdGhpcy5wcm9wcy5kZWxldGVPcGVyYXRpb259KSwgXG4gICAgICAgICAgICAgICAgU2ltaWxhcml0eUl0ZW1Db21wb25lbnQoe29wOiB0aGlzLnByb3BzLmIsIGRlbGV0ZU9wZXJhdGlvbjogdGhpcy5wcm9wcy5kZWxldGVPcGVyYXRpb259KVxuICAgICAgICAgICAgKVxuICAgICAgICApO1xuICAgIH1cbn0pO1xuXG4vLyBQcm9wczogcGFpcnM6IFtbT3BlcmF0aW9uLCBPcGVyYXRpb25dXSwgZGVsZXRlT3BlcmF0aW9uOiBmdW5jdGlvbihPcGVyYXRpb24pe31cbnZhciBTaW1pbGFyaXR5Q29tcG9uZW50ID0gUmVhY3QuY3JlYXRlQ2xhc3Moe2Rpc3BsYXlOYW1lOiAnU2ltaWxhcml0eUNvbXBvbmVudCcsXG5cbiAgICByZW5kZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgcGFpcnMgPSB0aGlzLnByb3BzLnBhaXJzO1xuICAgICAgICBpZiAocGFpcnMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgICAgIFJlYWN0LkRPTS5kaXYobnVsbCwgXCJObyBzaW1pbGFyIG9wZXJhdGlvbnMgZm91bmQuXCIpXG4gICAgICAgICAgICApXG4gICAgICAgIH1cblxuICAgICAgICB2YXIgZGVsZXRlT3BlcmF0aW9uID0gdGhpcy5wcm9wcy5kZWxldGVPcGVyYXRpb247XG4gICAgICAgIHZhciBzaW0gPSBwYWlycy5tYXAoZnVuY3Rpb24gKHApIHtcbiAgICAgICAgICAgIHZhciBrZXkgPSBwWzBdLmlkLnRvU3RyaW5nKCkgKyBwWzFdLmlkLnRvU3RyaW5nKCk7XG4gICAgICAgICAgICByZXR1cm4gKFNpbWlsYXJpdHlQYWlyQ29tcG9uZW50KHtrZXk6IGtleSwgYTogcFswXSwgYjogcFsxXSwgZGVsZXRlT3BlcmF0aW9uOiBkZWxldGVPcGVyYXRpb259KSlcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICBSZWFjdC5ET00uZGl2KG51bGwsIFxuICAgICAgICAgICAgICAgIFJlYWN0LkRPTS5oMShudWxsLCBcIlNpbWlsYXJpdGllc1wiKSwgXG4gICAgICAgICAgICAgICAgUmVhY3QuRE9NLmRpdihudWxsLCBcbiAgICAgICAgICAgICAgICAgICAgc2ltXG4gICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgKSlcbiAgICB9XG59KTtcblxuLy8gUHJvcHM6IG9wZXJhdGlvbnMsIGNhdGVnb3JpZXNcbnZhciBDaGFydENvbXBvbmVudCA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtkaXNwbGF5TmFtZTogJ0NoYXJ0Q29tcG9uZW50JyxcblxuICAgIF9vbkNoYW5nZTogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciB2YWwgPSB0aGlzLnJlZnMuc2VsZWN0LmdldERPTU5vZGUoKS52YWx1ZTtcbiAgICAgICAgaWYgKHZhbCA9PT0gJ2FsbCcpIHtcbiAgICAgICAgICAgIENyZWF0ZUNoYXJ0QWxsQnlDYXRlZ29yeUJ5TW9udGgodGhpcy5wcm9wcy5vcGVyYXRpb25zKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBjID0gQ2F0ZWdvcnlNYXBbdmFsXTtcbiAgICAgICAgQ3JlYXRlQ2hhcnRCeUNhdGVnb3J5QnlNb250aCh2YWwsIHRoaXMucHJvcHMub3BlcmF0aW9ucyk7XG4gICAgfSxcblxuICAgIHJlbmRlcjogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBjYXRlZ29yeU9wdGlvbnMgPSB0aGlzLnByb3BzLmNhdGVnb3JpZXMubWFwKGZ1bmN0aW9uIChjKSB7XG4gICAgICAgICAgICByZXR1cm4gKFJlYWN0LkRPTS5vcHRpb24oe2tleTogYy5pZCwgdmFsdWU6IGMuaWR9LCBjLnRpdGxlKSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHJldHVybiAoXG4gICAgICAgIFJlYWN0LkRPTS5kaXYobnVsbCwgXG4gICAgICAgICAgICBSZWFjdC5ET00uaDEobnVsbCwgXCJDaGFydHNcIiksIFxuICAgICAgICAgICAgUmVhY3QuRE9NLnNlbGVjdCh7b25DaGFuZ2U6IHRoaXMuX29uQ2hhbmdlLCBkZWZhdWx0VmFsdWU6IFwiYWxsXCIsIHJlZjogXCJzZWxlY3RcIn0sIFxuICAgICAgICAgICAgICAgIFJlYWN0LkRPTS5vcHRpb24oe3ZhbHVlOiBcImFsbFwifSwgXCJBbGxcIiksIFxuICAgICAgICAgICAgICAgIGNhdGVnb3J5T3B0aW9uc1xuICAgICAgICAgICAgKSwgXG4gICAgICAgICAgICBSZWFjdC5ET00uZGl2KHtpZDogXCJjaGFydFwifSlcbiAgICAgICAgKVxuICAgICAgICApO1xuICAgIH1cbn0pO1xuXG52YXIgQ2F0ZWdvcnlNYXAgPSB7fTtcblxudmFyIEtyZXN1cyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtkaXNwbGF5TmFtZTogJ0tyZXN1cycsXG5cbiAgICBnZXRJbml0aWFsU3RhdGU6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgLy8gQWxsIGJhbmtzXG4gICAgICAgICAgICBiYW5rczogW10sXG4gICAgICAgICAgICBjYXRlZ29yaWVzOiBbXSxcbiAgICAgICAgICAgIC8vIEN1cnJlbnQgYmFua1xuICAgICAgICAgICAgY3VycmVudEJhbms6IG51bGwsXG4gICAgICAgICAgICBhY2NvdW50czogW10sXG4gICAgICAgICAgICAvLyBDdXJyZW50IGFjY291bnRcbiAgICAgICAgICAgIGN1cnJlbnRBY2NvdW50OiBudWxsLFxuICAgICAgICAgICAgb3BlcmF0aW9uczogW10sXG4gICAgICAgICAgICByZWR1bmRhbnRQYWlyczogW11cbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICBsb2FkT3BlcmF0aW9uczogZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmICghdGhpcy5zdGF0ZS5jdXJyZW50QWNjb3VudClcbiAgICAgICAgICAgIHJldHVybjtcblxuICAgICAgICB2YXIgdGhhdCA9IHRoaXM7XG4gICAgICAgIHZhciBhY2NvdW50ID0gdGhpcy5zdGF0ZS5jdXJyZW50QWNjb3VudDtcbiAgICAgICAgJC5nZXQoJ2FjY291bnRzL2dldE9wZXJhdGlvbnMvJyArIGFjY291bnQuaWQsIGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgICAgICAgICB2YXIgb3BlcmF0aW9ucyA9IFtdO1xuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBkYXRhLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgdmFyIG8gPSBuZXcgT3BlcmF0aW9uKGRhdGFbaV0pXG4gICAgICAgICAgICAgICAgby51cGRhdGVMYWJlbChvLmNhdGVnb3J5SWQpO1xuICAgICAgICAgICAgICAgIG9wZXJhdGlvbnMucHVzaChvKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdmFyIHJlZHVuZGFudFBhaXJzID0gZmluZFJlZHVuZGFudEFsZ29yaXRobShvcGVyYXRpb25zKTtcbiAgICAgICAgICAgIHRoYXQuc2V0U3RhdGUoe1xuICAgICAgICAgICAgICAgIG9wZXJhdGlvbnM6IG9wZXJhdGlvbnMsXG4gICAgICAgICAgICAgICAgcmVkdW5kYW50UGFpcnM6IHJlZHVuZGFudFBhaXJzXG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgLy8gTm90IHJhY3k6IG9ubHkgdXNlcyBmb3JtYWwgYXJndW1lbnRzLCBubyBzdGF0ZS5cbiAgICAgICAgICAgIC8vQ3JlYXRlQ2hhcnRBbGxPcGVyYXRpb25zKGFjY291bnQsIG9wZXJhdGlvbnMpO1xuICAgICAgICAgICAgQ3JlYXRlQ2hhcnRBbGxCeUNhdGVnb3J5QnlNb250aChvcGVyYXRpb25zKTtcbiAgICAgICAgfSkuZmFpbCh4aHJFcnJvcik7XG4gICAgfSxcblxuICAgIHNldEN1cnJlbnRBY2NvdW50OiBmdW5jdGlvbihhY2NvdW50KSB7XG4gICAgICAgIGlmICghYWNjb3VudCkge1xuICAgICAgICAgICAgZGVidWcoJ3NldEN1cnJlbnRBY2NvdW50OiBubyBwYXJhbWV0ZXInKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGFzc2VydChhY2NvdW50IGluc3RhbmNlb2YgQWNjb3VudCk7XG4gICAgICAgIGlmICh0aGlzLnN0YXRlLmN1cnJlbnRBY2NvdW50ICYmIGFjY291bnQuaWQgPT09IHRoaXMuc3RhdGUuY3VycmVudEFjY291bnQuaWQpXG4gICAgICAgICAgICByZXR1cm47XG5cbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICBjdXJyZW50QWNjb3VudDogYWNjb3VudCB8fCBudWxsXG4gICAgICAgIH0sIHRoaXMubG9hZE9wZXJhdGlvbnMpXG4gICAgfSxcblxuICAgIGxvYWRBY2NvdW50czogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciB0aGF0ID0gdGhpcztcbiAgICAgICAgaWYgKCF0aGlzLnN0YXRlLmN1cnJlbnRCYW5rKVxuICAgICAgICAgICAgcmV0dXJuO1xuXG4gICAgICAgICQuZ2V0KCdiYW5rcy9nZXRBY2NvdW50cy8nICsgdGhpcy5zdGF0ZS5jdXJyZW50QmFuay5pZCwgZnVuY3Rpb24gKGRhdGEpIHtcbiAgICAgICAgICAgIHZhciBhY2NvdW50cyA9IFtdXG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGRhdGEubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICBhY2NvdW50cy5wdXNoKG5ldyBBY2NvdW50KGRhdGFbaV0pKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhhdC5zZXRTdGF0ZSh7XG4gICAgICAgICAgICAgICAgYWNjb3VudHM6IGFjY291bnRzLFxuICAgICAgICAgICAgfSwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgdGhhdC5zZXRDdXJyZW50QWNjb3VudChhY2NvdW50c1swXSB8fCBudWxsKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KS5mYWlsKHhockVycm9yKTtcbiAgICB9LFxuXG4gICAgc2V0Q3VycmVudEJhbms6IGZ1bmN0aW9uKGJhbmspIHtcbiAgICAgICAgaWYgKCFiYW5rKVxuICAgICAgICAgICAgcmV0dXJuO1xuXG4gICAgICAgIGFzc2VydChiYW5rIGluc3RhbmNlb2YgQmFuayk7XG4gICAgICAgIGlmICh0aGlzLnN0YXRlLmN1cnJlbnRCYW5rICYmIGJhbmsuaWQgPT09IHRoaXMuc3RhdGUuY3VycmVudEJhbmsuaWQpXG4gICAgICAgICAgICByZXR1cm47XG5cbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICBjdXJyZW50QmFuazogYmFua1xuICAgICAgICB9LCB0aGlzLmxvYWRBY2NvdW50cyk7XG4gICAgfSxcblxuICAgIGRlbGV0ZU9wZXJhdGlvbjogZnVuY3Rpb24ob3BlcmF0aW9uKSB7XG4gICAgICAgIGlmICghb3BlcmF0aW9uKVxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICBhc3NlcnQob3BlcmF0aW9uIGluc3RhbmNlb2YgT3BlcmF0aW9uKTtcblxuICAgICAgICB2YXIgdGhhdCA9IHRoaXM7XG4gICAgICAgICQuYWpheCh7XG4gICAgICAgICAgICB1cmw6ICdvcGVyYXRpb25zLycgKyBvcGVyYXRpb24uaWQsXG4gICAgICAgICAgICB0eXBlOiAnREVMRVRFJyxcbiAgICAgICAgICAgIHN1Y2Nlc3M6IHRoYXQubG9hZE9wZXJhdGlvbnMsXG4gICAgICAgICAgICBlcnJvcjogeGhyRXJyb3JcbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIGxvYWRDYXRlZ29yaWVzOiBmdW5jdGlvbihjYikge1xuICAgICAgICB2YXIgdGhhdCA9IHRoaXM7XG4gICAgICAgICQuZ2V0KCdjYXRlZ29yaWVzJywgZnVuY3Rpb24gKGRhdGEpIHtcbiAgICAgICAgICAgIHZhciBjYXRlZ29yaWVzID0gW11cbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZGF0YS5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIHZhciBjID0gbmV3IENhdGVnb3J5KGRhdGFbaV0pO1xuICAgICAgICAgICAgICAgIENhdGVnb3J5TWFwW2MuaWRdID0gYy50aXRsZTtcbiAgICAgICAgICAgICAgICBjYXRlZ29yaWVzLnB1c2goYylcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoYXQuc2V0U3RhdGUoe2NhdGVnb3JpZXM6IGNhdGVnb3JpZXN9LCBjYik7XG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICBhZGRDYXRlZ29yeTogZnVuY3Rpb24obmV3Y2F0KSB7XG4gICAgICAgIC8vIERvIHRoZSByZXF1ZXN0XG4gICAgICAgIHZhciB0aGF0ID0gdGhpcztcbiAgICAgICAgJC5wb3N0KCdjYXRlZ29yaWVzJywgbmV3Y2F0LCBmdW5jdGlvbiAoZGF0YSkge1xuICAgICAgICAgICAgdGhhdC5sb2FkQ2F0ZWdvcmllcygpO1xuICAgICAgICB9KS5mYWlsKHhockVycm9yKTtcbiAgICB9LFxuXG4gICAgdXBkYXRlT3BlcmF0aW9uQ2F0ZWdvcnk6IGZ1bmN0aW9uKG9wLCBjYXRJZCkge1xuICAgICAgICBhc3NlcnQob3AgaW5zdGFuY2VvZiBPcGVyYXRpb24pO1xuICAgICAgICB2YXIgZGF0YSA9IHtcbiAgICAgICAgICAgIGNhdGVnb3J5SWQ6IGNhdElkXG4gICAgICAgIH1cblxuICAgICAgICAkLmFqYXgoe1xuICAgICAgICAgICAgdXJsOidvcGVyYXRpb25zLycgKyBvcC5pZCxcbiAgICAgICAgICAgIHR5cGU6ICdQVVQnLFxuICAgICAgICAgICAgZGF0YTogZGF0YSxcbiAgICAgICAgICAgIHN1Y2Nlc3M6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBvcC51cGRhdGVMYWJlbChjYXRJZClcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBlcnJvcjogeGhyRXJyb3JcbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIGNvbXBvbmVudERpZE1vdW50OiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIHRoYXQgPSB0aGlzO1xuICAgICAgICAkLmdldCgnYmFua3MnLCB7d2l0aEFjY291bnRPbmx5OnRydWV9LCBmdW5jdGlvbiAoZGF0YSkge1xuICAgICAgICAgICAgdmFyIGJhbmtzID0gW11cbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZGF0YS5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIHZhciBiID0gbmV3IEJhbmsoZGF0YVtpXSk7XG4gICAgICAgICAgICAgICAgYmFua3MucHVzaChiKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhhdC5zZXRTdGF0ZSh7XG4gICAgICAgICAgICAgICAgYmFua3M6IGJhbmtzLFxuICAgICAgICAgICAgfSwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgdGhhdC5sb2FkQ2F0ZWdvcmllcyhmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhhdC5zZXRDdXJyZW50QmFuayhiYW5rc1swXSB8fCBudWxsKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KS5mYWlsKHhockVycm9yKTtcbiAgICB9LFxuXG4gICAgcmVuZGVyOiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIFJlYWN0LkRPTS5kaXYoe2NsYXNzTmFtZTogXCJyb3dcIn0sIFxuXG4gICAgICAgICAgICBSZWFjdC5ET00uZGl2KHtjbGFzc05hbWU6IFwicGFuZWwgc21hbGwtMiBjb2x1bW5zXCJ9LCBcbiAgICAgICAgICAgICAgICBCYW5rTGlzdENvbXBvbmVudCh7XG4gICAgICAgICAgICAgICAgICAgIGJhbmtzOiB0aGlzLnN0YXRlLmJhbmtzLCBcbiAgICAgICAgICAgICAgICAgICAgc2V0Q3VycmVudEJhbms6IHRoaXMuc2V0Q3VycmVudEJhbmt9XG4gICAgICAgICAgICAgICAgKSwgXG4gICAgICAgICAgICAgICAgQWNjb3VudHNMaXN0Q29tcG9uZW50KHtcbiAgICAgICAgICAgICAgICAgICAgYWNjb3VudHM6IHRoaXMuc3RhdGUuYWNjb3VudHMsIFxuICAgICAgICAgICAgICAgICAgICBzZXRDdXJyZW50QWNjb3VudDogdGhpcy5zZXRDdXJyZW50QWNjb3VudH1cbiAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICApLCBcblxuICAgICAgICAgICAgUmVhY3QuRE9NLmRpdih7Y2xhc3NOYW1lOiBcInNtYWxsLTEwIGNvbHVtbnNcIn0sIFxuICAgICAgICAgICAgICAgIFJlYWN0LkRPTS51bCh7Y2xhc3NOYW1lOiBcInRhYnNcIiwgJ2RhdGEtdGFiJzogdHJ1ZX0sIFxuICAgICAgICAgICAgICAgICAgICBSZWFjdC5ET00ubGkoe2NsYXNzTmFtZTogXCJ0YWItdGl0bGUgYWN0aXZlXCJ9LCBSZWFjdC5ET00uYSh7aHJlZjogXCIjcGFuZWwtb3BlcmF0aW9uc1wifSwgXCJPcGVyYXRpb25zXCIpKSwgXG4gICAgICAgICAgICAgICAgICAgIFJlYWN0LkRPTS5saSh7Y2xhc3NOYW1lOiBcInRhYi10aXRsZVwifSwgUmVhY3QuRE9NLmEoe2hyZWY6IFwiI3BhbmVsLWNoYXJ0c1wifSwgXCJDaGFydHNcIikpLCBcbiAgICAgICAgICAgICAgICAgICAgUmVhY3QuRE9NLmxpKHtjbGFzc05hbWU6IFwidGFiLXRpdGxlXCJ9LCBSZWFjdC5ET00uYSh7aHJlZjogXCIjcGFuZWwtc2ltaWxhcml0aWVzXCJ9LCBcIlNpbWlsYXJpdGllc1wiKSksIFxuICAgICAgICAgICAgICAgICAgICBSZWFjdC5ET00ubGkoe2NsYXNzTmFtZTogXCJ0YWItdGl0bGVcIn0sIFJlYWN0LkRPTS5hKHtocmVmOiBcIiNwYW5lbC1jYXRlZ29yaWVzXCJ9LCBcIkNhdGVnb3JpZXNcIikpXG4gICAgICAgICAgICAgICAgKSwgXG5cbiAgICAgICAgICAgICAgICBSZWFjdC5ET00uZGl2KHtjbGFzc05hbWU6IFwidGFicy1jb250ZW50XCJ9LCBcblxuICAgICAgICAgICAgICAgICAgICBSZWFjdC5ET00uZGl2KHtjbGFzc05hbWU6IFwiY29udGVudCBhY3RpdmVcIiwgaWQ6IFwicGFuZWwtb3BlcmF0aW9uc1wifSwgXG4gICAgICAgICAgICAgICAgICAgICAgICBPcGVyYXRpb25zQ29tcG9uZW50KHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvcGVyYXRpb25zOiB0aGlzLnN0YXRlLm9wZXJhdGlvbnMsIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhdGVnb3JpZXM6IHRoaXMuc3RhdGUuY2F0ZWdvcmllcywgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdXBkYXRlT3BlcmF0aW9uQ2F0ZWdvcnk6IHRoaXMudXBkYXRlT3BlcmF0aW9uQ2F0ZWdvcnl9XG4gICAgICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgICksIFxuXG4gICAgICAgICAgICAgICAgICAgIFJlYWN0LkRPTS5kaXYoe2NsYXNzTmFtZTogXCJjb250ZW50XCIsIGlkOiBcInBhbmVsLXNpbWlsYXJpdGllc1wifSwgXG4gICAgICAgICAgICAgICAgICAgICAgICBTaW1pbGFyaXR5Q29tcG9uZW50KHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYWlyczogdGhpcy5zdGF0ZS5yZWR1bmRhbnRQYWlycywgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVsZXRlT3BlcmF0aW9uOiB0aGlzLmRlbGV0ZU9wZXJhdGlvbn1cbiAgICAgICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAgICAgKSwgXG5cbiAgICAgICAgICAgICAgICAgICAgUmVhY3QuRE9NLmRpdih7Y2xhc3NOYW1lOiBcImNvbnRlbnRcIiwgaWQ6IFwicGFuZWwtY2hhcnRzXCJ9LCBcbiAgICAgICAgICAgICAgICAgICAgICAgIENoYXJ0Q29tcG9uZW50KHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhY2NvdW50OiB0aGlzLnN0YXRlLmN1cnJlbnRBY2NvdW50LCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvcGVyYXRpb25zOiB0aGlzLnN0YXRlLm9wZXJhdGlvbnMsIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhdGVnb3JpZXM6IHRoaXMuc3RhdGUuY2F0ZWdvcmllc31cbiAgICAgICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAgICAgKSwgXG5cbiAgICAgICAgICAgICAgICAgICAgUmVhY3QuRE9NLmRpdih7Y2xhc3NOYW1lOiBcImNvbnRlbnRcIiwgaWQ6IFwicGFuZWwtY2F0ZWdvcmllc1wifSwgXG4gICAgICAgICAgICAgICAgICAgICAgICBDYXRlZ29yeUNvbXBvbmVudCh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2F0ZWdvcmllczogdGhpcy5zdGF0ZS5jYXRlZ29yaWVzLCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbkNhdGVnb3J5Rm9ybVN1Ym1pdDogdGhpcy5hZGRDYXRlZ29yeX1cbiAgICAgICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAgICAgKVxuXG4gICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgKVxuXG4gICAgICAgICAgICApXG4gICAgICAgICk7XG4gICAgfVxufSk7XG5cbnZhciBTID0gZG9jdW1lbnQucXVlcnlTZWxlY3Rvci5iaW5kKGRvY3VtZW50KTtcblJlYWN0LnJlbmRlckNvbXBvbmVudChLcmVzdXMobnVsbCksIFMoJyNtYWluJykpO1xuXG4vKlxuICogQUxHT1JJVEhNU1xuICovXG5jb25zdCBUSU1FX1NJTUlMQVJfVEhSRVNIT0xEID0gMTAwMCAqIDYwICogNjAgKiAyNCAqIDI7IC8vIDQ4IGhvdXJzXG5mdW5jdGlvbiBmaW5kUmVkdW5kYW50QWxnb3JpdGhtKG9wZXJhdGlvbnMpIHtcbiAgICB2YXIgc2ltaWxhciA9IFtdO1xuXG4gICAgLy8gTyhuIGxvZyBuKVxuICAgIGZ1bmN0aW9uIHNvcnRDcml0ZXJpYShhLGIpIHsgcmV0dXJuIGEuYW1vdW50IC0gYi5hbW91bnQ7IH1cbiAgICB2YXIgc29ydGVkID0gb3BlcmF0aW9ucy5zbGljZSgpLnNvcnQoc29ydENyaXRlcmlhKTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IG9wZXJhdGlvbnMubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgaWYgKGkgKyAxID49IG9wZXJhdGlvbnMubGVuZ3RoKVxuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgIHZhciBvcCA9IHNvcnRlZFtpXTtcbiAgICAgICAgdmFyIG5leHQgPSBzb3J0ZWRbaSsxXTtcbiAgICAgICAgaWYgKG9wLmFtb3VudCA9PSBuZXh0LmFtb3VudCkge1xuICAgICAgICAgICAgdmFyIGRhdGVkaWZmID0gK29wLmRhdGUgLSArbmV4dC5kYXRlO1xuICAgICAgICAgICAgaWYgKGRhdGVkaWZmIDw9IFRJTUVfU0lNSUxBUl9USFJFU0hPTEQpXG4gICAgICAgICAgICAgICAgc2ltaWxhci5wdXNoKFtvcCwgbmV4dF0pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHNpbWlsYXI7XG59XG5cbi8qXG4gKiBDSEFSVFNcbiAqL1xuXG4kY2hhcnQgPSAkKCcjY2hhcnQnKTtcblxuZnVuY3Rpb24gQ3JlYXRlQ2hhcnRCeUNhdGVnb3J5QnlNb250aChjYXRJZCwgb3BlcmF0aW9ucykge1xuICAgIHZhciBvcHMgPSBbXTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IG9wZXJhdGlvbnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgdmFyIG9wID0gb3BlcmF0aW9uc1tpXTtcbiAgICAgICAgaWYgKG9wLmNhdGVnb3J5SWQgPT09IGNhdElkKVxuICAgICAgICAgICAgb3BzLnB1c2gob3ApO1xuICAgIH1cbiAgICBDcmVhdGVDaGFydEFsbEJ5Q2F0ZWdvcnlCeU1vbnRoKG9wcyk7XG59XG5cbmZ1bmN0aW9uIENyZWF0ZUNoYXJ0QWxsQnlDYXRlZ29yeUJ5TW9udGgob3BlcmF0aW9ucykge1xuICAgIGZ1bmN0aW9uIGRhdGVrZXkob3ApIHtcbiAgICAgICAgdmFyIGQgPSBvcC5kYXRlO1xuICAgICAgICByZXR1cm4gZC5nZXRGdWxsWWVhcigpICsgJy0nICsgZC5nZXRNb250aCgpO1xuICAgIH1cblxuICAgIHZhciBtYXAgPSB7fTtcbiAgICB2YXIgZGF0ZXNldCA9IHt9O1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgb3BlcmF0aW9ucy5sZW5ndGg7IGkrKykge1xuICAgICAgICB2YXIgb3AgPSBvcGVyYXRpb25zW2ldO1xuICAgICAgICB2YXIgYyA9IG9wLmNhdGVnb3J5TGFiZWw7XG4gICAgICAgIG1hcFtjXSA9IG1hcFtjXSB8fCB7fTtcblxuICAgICAgICB2YXIgZGsgPSBkYXRla2V5KG9wKTtcbiAgICAgICAgbWFwW2NdW2RrXSA9IG1hcFtjXVtka10gfHwgW107XG4gICAgICAgIG1hcFtjXVtka10ucHVzaChvcC5hbW91bnQpO1xuICAgICAgICBkYXRlc2V0W2RrXSA9IHRydWU7XG4gICAgfVxuXG4gICAgdmFyIHNlcmllcyA9IFtdO1xuICAgIGZvciAodmFyIGMgaW4gbWFwKSB7XG4gICAgICAgIHZhciBkYXRhID0gW107XG5cbiAgICAgICAgZm9yICh2YXIgZGsgaW4gZGF0ZXNldCkge1xuICAgICAgICAgICAgbWFwW2NdW2RrXSA9IG1hcFtjXVtka10gfHwgW107XG4gICAgICAgICAgICB2YXIgcyA9IDA7XG4gICAgICAgICAgICB2YXIgYXJyID0gbWFwW2NdW2RrXTtcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYXJyLmxlbmd0aDsgaSsrKVxuICAgICAgICAgICAgICAgIHMgKz0gYXJyW2ldO1xuICAgICAgICAgICAgZGF0YS5wdXNoKHMpO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIHNlcmllID0ge1xuICAgICAgICAgICAgbmFtZTogYyxcbiAgICAgICAgICAgIGRhdGE6IGRhdGFcbiAgICAgICAgfTtcblxuICAgICAgICBzZXJpZXMucHVzaChzZXJpZSk7XG4gICAgfVxuXG4gICAgdmFyIGNhdGVnb3JpZXMgPSBbXTtcbiAgICBmb3IgKHZhciBkayBpbiBkYXRlc2V0KVxuICAgICAgICBjYXRlZ29yaWVzLnB1c2goZGspO1xuXG4gICAgdmFyIHRpdGxlID0gJ0J5IGNhdGVnb3J5JztcbiAgICB2YXIgeUF4aXNMZWdlbmQgPSAnQW1vdW50JztcblxuICAgICRjaGFydC5oaWdoY2hhcnRzKHtcbiAgICAgICAgY2hhcnQ6IHtcbiAgICAgICAgICAgIHR5cGU6ICdjb2x1bW4nXG4gICAgICAgIH0sXG4gICAgICAgIHRpdGxlOiB7XG4gICAgICAgICAgICB0ZXh0OiB0aXRsZVxuICAgICAgICB9LFxuICAgICAgICB4QXhpczoge1xuICAgICAgICAgICAgY2F0ZWdvcmllczogY2F0ZWdvcmllc1xuICAgICAgICB9LFxuICAgICAgICB5QXhpczoge1xuICAgICAgICAgICAgdGl0bGU6IHtcbiAgICAgICAgICAgICAgICB0ZXh0OiB5QXhpc0xlZ2VuZFxuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICB0b29sdGlwOiB7XG4gICAgICAgICAgICBoZWFkZXJGb3JtYXQ6ICc8c3BhbiBzdHlsZT1cImZvbnQtc2l6ZToxMHB4XCI+e3BvaW50LmtleX08L3NwYW4+PHRhYmxlPicsXG4gICAgICAgICAgICBwb2ludEZvcm1hdDogJzx0cj48dGQgc3R5bGU9XCJjb2xvcjp7c2VyaWVzLmNvbG9yfTtwYWRkaW5nOjBcIj57c2VyaWVzLm5hbWV9OiA8L3RkPicgK1xuICAgICAgICAgICAgJzx0ZCBzdHlsZT1cInBhZGRpbmc6MFwiPjxiPntwb2ludC55Oi4xZn0gZXVyPC9iPjwvdGQ+PC90cj4nLFxuICAgICAgICAgICAgZm9vdGVyRm9ybWF0OiAnPC90YWJsZT4nLFxuICAgICAgICAgICAgc2hhcmVkOiB0cnVlLFxuICAgICAgICAgICAgdXNlSFRNTDogdHJ1ZVxuICAgICAgICB9LFxuICAgICAgICBwbG90T3B0aW9uczoge1xuICAgICAgICAgICAgY29sdW1uOiB7XG4gICAgICAgICAgICAgICAgcG9pbnRQYWRkaW5nOiAwLjIsXG4gICAgICAgICAgICAgICAgYm9yZGVyV2lkdGg6IDBcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgc2VyaWVzOiBzZXJpZXNcbiAgICB9KTtcbn1cblxuLy8gVE9ETyB1bnVzZWQgcmlnaHQgbm93XG5mdW5jdGlvbiBDcmVhdGVDaGFydEFsbE9wZXJhdGlvbnMoYWNjb3VudCwgb3BlcmF0aW9ucykge1xuICAgIGNyZWF0ZUNoYXJ0KGFjY291bnQuaW5pdGlhbEFtb3VudCwgb3BlcmF0aW9ucy5zbGljZSgpLCBhY2NvdW50LnRpdGxlKTtcbn1cblxuZnVuY3Rpb24gQ3JlYXRlQ2hhcnRCeUNhdGVnb3J5KGNhdElkLCBjYXRMYWJlbCwgb3BlcmF0aW9ucykge1xuICAgIHZhciBvcHMgPSBvcGVyYXRpb25zLnNsaWNlKCkuZmlsdGVyKGZ1bmN0aW9uKHgpIHtcbiAgICAgICAgcmV0dXJuIHguY2F0ZWdvcnlJZCA9PSBjYXRJZDtcbiAgICB9KTtcblxuICAgIGNyZWF0ZUNoYXJ0KDAsIG9wcywgY2F0TGFiZWwpO1xufVxuXG5mdW5jdGlvbiBjcmVhdGVDaGFydChpbml0aWFsQW1vdW50LCBvcGVyYXRpb25zLCB0aXRsZSkge1xuICAgIGlmIChvcGVyYXRpb25zLmxlbmd0aCA9PT0gMClcbiAgICAgICAgcmV0dXJuO1xuXG4gICAgdmFyIG9wcyA9IG9wZXJhdGlvbnMuc29ydChmdW5jdGlvbiAoYSxiKSB7IHJldHVybiArYS5kYXRlIC0gK2IuZGF0ZSB9KTtcbiAgICB2YXIgY3VtdWxhdGl2ZUFtb3VudCA9IGluaXRpYWxBbW91bnQ7XG4gICAgLy8gTXVzdCBjb250YWluIGFycmF5IHBhaXJzIFsrZGF0ZSwgdmFsdWVdXG4gICAgdmFyIHBvc2l0aXZlID0gKGluaXRpYWxBbW91bnQgPiAwKSA/IGluaXRpYWxBbW91bnQgOiAwO1xuICAgIHZhciBuZWdhdGl2ZSA9IChpbml0aWFsQW1vdW50IDwgMCkgPyAtaW5pdGlhbEFtb3VudCA6IDA7XG4gICAgdmFyIGJhbGFuY2UgPSBpbml0aWFsQW1vdW50O1xuXG4gICAgdmFyIHBvc2QgPSBbXTtcbiAgICB2YXIgbmVnZCA9IFtdO1xuICAgIHZhciBiYWxkID0gW107XG5cbiAgICB2YXIgb3BtYXAgPSB7fTtcbiAgICB2YXIgcG9zbWFwID0ge307XG4gICAgdmFyIG5lZ21hcCA9IHt9O1xuXG4gICAgb3BzLm1hcChmdW5jdGlvbihvKSB7XG4gICAgICAgIC8vIENvbnZlcnQgZGF0ZSBpbnRvIGEgbnVtYmVyOiBpdCdzIGdvaW5nIHRvIGJlIGNvbnZlcnRlZCBpbnRvIGEgc3RyaW5nXG4gICAgICAgIC8vIHdoZW4gdXNlZCBhcyBhIGtleS5cbiAgICAgICAgdmFyIGEgPSBvLmFtb3VudDtcbiAgICAgICAgdmFyIGQgPSArby5kYXRlO1xuICAgICAgICBvcG1hcFtkXSA9IG9wbWFwW2RdIHx8IDA7XG4gICAgICAgIG9wbWFwW2RdICs9IGE7XG5cbiAgICAgICAgaWYgKGEgPCAwKSB7XG4gICAgICAgICAgICBuZWdtYXBbZF0gPSBuZWdtYXBbZF0gfHwgMDtcbiAgICAgICAgICAgIG5lZ21hcFtkXSArPSAtYTtcbiAgICAgICAgfSBlbHNlIGlmIChhID4gMCkge1xuICAgICAgICAgICAgcG9zbWFwW2RdID0gcG9zbWFwW2RdIHx8IDA7XG4gICAgICAgICAgICBwb3NtYXBbZF0gKz0gYTtcbiAgICAgICAgfVxuICAgIH0pXG5cbiAgICBmb3IgKHZhciBkYXRlIGluIG9wbWFwKSB7XG4gICAgICAgIC8vIGRhdGUgaXMgYSBzdHJpbmcgbm93OiBjb252ZXJ0IGl0IGJhY2sgdG8gYSBudW1iZXIgZm9yIGhpZ2hjaGFydHMuXG4gICAgICAgIGJhbGFuY2UgKz0gb3BtYXBbZGF0ZV07XG4gICAgICAgIGJhbGQucHVzaChbK2RhdGUsIGJhbGFuY2VdKTtcblxuICAgICAgICBpZiAocG9zbWFwW2RhdGVdKSB7XG4gICAgICAgICAgICBwb3NpdGl2ZSArPSBwb3NtYXBbZGF0ZV07XG4gICAgICAgIH1cbiAgICAgICAgaWYgKG5lZ21hcFtkYXRlXSkge1xuICAgICAgICAgICAgbmVnYXRpdmUgKz0gbmVnbWFwW2RhdGVdO1xuICAgICAgICB9XG4gICAgICAgIHBvc2QucHVzaChbK2RhdGUsIHBvc2l0aXZlXSk7XG4gICAgICAgIG5lZ2QucHVzaChbK2RhdGUsIG5lZ2F0aXZlXSk7XG4gICAgfVxuXG4gICAgLy8gQ3JlYXRlIHRoZSBjaGFydFxuICAgICRjaGFydC5oaWdoY2hhcnRzKCdTdG9ja0NoYXJ0Jywge1xuICAgICAgICByYW5nZVNlbGVjdG9yIDoge1xuICAgICAgICAgICAgc2VsZWN0ZWQgOiAxLFxuICAgICAgICAgICAgaW5wdXRFbmFibGVkOiAkY2hhcnQud2lkdGgoKSA+IDQ4MFxuICAgICAgICB9LFxuXG4gICAgICAgIHRpdGxlIDoge1xuICAgICAgICAgICAgdGV4dCA6IHRpdGxlXG4gICAgICAgIH0sXG5cbiAgICAgICAgc2VyaWVzIDogW3tcbiAgICAgICAgICAgIG5hbWUgOiAnQmFsYW5jZScsXG4gICAgICAgICAgICBkYXRhIDogYmFsZCxcbiAgICAgICAgICAgIHRvb2x0aXA6IHsgdmFsdWVEZWNpbWFsczogMiB9XG4gICAgICAgIH0sIHtcbiAgICAgICAgICAgIG5hbWU6ICdDcmVkaXQnLFxuICAgICAgICAgICAgZGF0YTogcG9zZCxcbiAgICAgICAgICAgIHRvb2x0aXA6IHsgdmFsdWVEZWNpbWFsczogMiB9XG4gICAgICAgIH0sIHtcbiAgICAgICAgICAgIG5hbWU6ICdEZWJpdCcsXG4gICAgICAgICAgICBkYXRhOiBuZWdkLFxuICAgICAgICAgICAgdG9vbHRpcDogeyB2YWx1ZURlY2ltYWxzOiAyIH1cbiAgICAgICAgfV1cbiAgICB9KTtcbn1cblxuIl19
