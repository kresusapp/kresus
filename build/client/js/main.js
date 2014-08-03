/** @jsx React.DOM */

const DEBUG = true;
var ASSERTS = true;

/*
 * HELPERS
 */
function debug() {
    DEBUG && console.log.apply(console, arguments);
}

function assert(x, wat) {
    if (!x) {
        ASSERTS && alert('assertion error: ' + (wat?wat+'\n':'') + new Error().stack);
        return false;
    }
    return true;
}

function has(obj, prop) {
    return assert(obj.hasOwnProperty(prop));
}

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
            for (var opPod of data) {
                var o = new Operation(opPod)
                o.updateLabel(o.categoryId);
                operations.push(o);
            }

            var redundantPairs = findRedundantAlgorithm(operations);
            that.setState({
                operations: operations,
                redundantPairs: redundantPairs
            });

            // Not racy: only uses formal arguments, no state.
            createChart(account, operations);
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
            for (var accPod of data) {
                accounts.push(new Account(accPod));
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
            for (var catPod of data) {
                var c = new Category(catPod);
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
            for (var bankPod of data) {
                var b = new Bank(bankPod);
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
                        React.DOM.h1(null, "Charts"), 
                        React.DOM.div({id: "chart"})
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

$chart = $('#chart');
function createChart(account, operations) {
    if (operations.length === 0)
        return;

    var ops = operations.slice().sort(function (a,b) { return +a.date - +b.date });
    var cumulativeAmount = account.initialAmount;
    // Must contain array pairs [+date, value]
    var data = [];

    var opmap = {};
    ops.map(function(o) {
        // Convert date into a number: it's going to be converted into a string
        // when used as a key.
        opmap[+o.date] = opmap[+o.date] || 0;
        opmap[+o.date] += o.amount;
    })

    for (var date in opmap) {
        // date is a string now: convert it back to a number for highcharts.
        cumulativeAmount += opmap[date];
        data.push([+date, cumulativeAmount]);
    }

    // Create the chart
    $chart.highcharts('StockChart', {
        rangeSelector : {
            selected : 1,
            inputEnabled: $chart.width() > 480
        },

        title : {
            text : account.title
        },

        series : [{
            name : 'Money',
            data : data,
            tooltip: {
                valueDecimals: 2
            }
        }]
    });
}
