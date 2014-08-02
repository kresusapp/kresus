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

/*
 * Templating
 */
var template = (function() {
    var rgx = /\$\{([a-zA-Z0-9]+)\}/;
    return function (context, str) {
        var ret = str;
        var match = null;
        assert(typeof context !== 'undefined', 'template context is undefined');
        while (match = ret.match(rgx)) {
            // The original str is also in the match array
            assert(match.length > 1, 'match is inconsistent');
            var key = match[1];
            assert(typeof context[key] !== 'undefined', 'missing key in template:' + key);
            ret = ret.replace('${' + key + '}', context[key]);
        }
        return ret;
    }
})();

/*
 * MODELS
 */
function Bank(arg) {
    this.id   = has(arg, 'id')   && arg.id;
    this.name = has(arg, 'name') && arg.name;
    this.uuid = has(arg, 'uuid') && arg.uuid;

    this.accounts = [];
}

Bank.prototype.addAccount = function(arg) {
    assert(arg instanceof Account);
    this.accounts.push(arg);
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

    this.operations = [];
}

Account.prototype.addOperation = function(arg) {
    assert(arg instanceof Operation);
    this.operations.push(arg);
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
    this.categoryId  = arg.categoryId;
    this.category    = null;
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
                CategoryItem({title: cat.title})
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
        var that = this;
        var banks = this.props.banks.map(function (b) {
            return (
                BankListItemComponent({bank: b, setCurrentBank: that.props.setCurrentBank})
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
        var that = this;
        var accounts = this.props.accounts.map(function (a) {
            return (
                AccountsListItem({account: a, setCurrentAccount: that.props.setCurrentAccount})
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

var CategorySelectOptionComponent = React.createClass({displayName: 'CategorySelectOptionComponent',

    render: function() {
        if (this.props.selected == this.props.category.id) {
            return (
                React.DOM.option({value: this.props.category.id, selected: "selected"}, this.props.category.title)
            );
        }

        return (
            React.DOM.option({value: this.props.category.id}, this.props.category.title)
        );
    }
});

var CategorySelectComponent = React.createClass({displayName: 'CategorySelectComponent',

    onChange: function(e) {
        var selected = this.refs.cat.getDOMNode().value;
        this.props.updateOperationCategory(this.props.operation, selected);
    },

    render: function() {
        var categories = [new Category({title: 'None', id: '-1'})].concat(this.props.categories);
        var that = this;
        var options = categories.map(function (c) {
            return (CategorySelectOptionComponent({selected: that.props.operation.categoryId, category: c}));
        });
        return (
            React.DOM.select({onChange: this.onChange, ref: "cat"}, 
                options
            )
        );
    }
});

var OperationComponent = React.createClass({displayName: 'OperationComponent',

    render: function() {
        return (
            React.DOM.tr(null, 
                React.DOM.td(null, this.props.operation.date.toString()), 
                React.DOM.td(null, this.props.operation.title), 
                React.DOM.td(null, this.props.operation.amount), 
                React.DOM.td(null, 
                    CategorySelectComponent({operation: this.props.operation, categories: this.props.categories, updateOperationCategory: this.props.updateOperationCategory})
                )
            )
        );
    }
});

var OperationsComponent = React.createClass({displayName: 'OperationsComponent',

    render: function() {
        var that = this;
        var ops = this.props.operations.map(function (o) {
            return (
                OperationComponent({operation: o, categories: that.props.categories, updateOperationCategory: that.props.updateOperationCategory})
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

// Props: operations: [Operation], deleteOperation: function(Operation){}
var SimilarityComponent = React.createClass({displayName: 'SimilarityComponent',

    render: function() {
        var pairs = findRedundantAlgorithm(this.props.operations);

        if (pairs.length === 0) {
            return (
                React.DOM.div(null, "No similar operations found.")
            )
        }

        var that = this;
        var sim = pairs.map(function (p) {
            return (SimilarityPairComponent({a: p[0], b: p[1], deleteOperation: that.props.deleteOperation}))
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
            operations: []
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
                operations.push(new Operation(opPod));
            }

            that.setState({
                operations: operations
            });

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
            });
            that.setCurrentAccount(accounts[0] || null);
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
                categories.push(new Category(catPod));
            }
            that.setState({categories: categories}, cb);
        });
    },

    addCategory: function(newcat) {
        // Optimistically show in the list :)
        var categories = this.state.categories;
        categories.push(newcat);
        this.setState({categories: categories});

        // Do the request
        var that = this;
        $.post('categories', newcat, function (data) {
            that.loadCategories();
        }).fail(xhrError);
    },

    updateOperationCategory: function(op, cat) {
        assert(op instanceof Operation);
        var data = {
            categoryId: cat
        }

        $.ajax({
            url:'operations/' + op.id,
            type: 'PUT',
            data: data,
            success: function () {
                op.categoryId = cat;
                //op.category = w.lookup.categories[categoryId].title;
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
                BankListComponent({banks: this.state.banks, setCurrentBank: this.setCurrentBank}), 
                AccountsListComponent({accounts: this.state.accounts, setCurrentAccount: this.setCurrentAccount})
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
                        OperationsComponent({operations: this.state.operations, categories: this.state.categories, updateOperationCategory: this.updateOperationCategory})
                    ), 

                    React.DOM.div({className: "content", id: "panel-similarities"}, 
                        SimilarityComponent({operations: this.state.operations, deleteOperation: this.deleteOperation})
                    ), 

                    React.DOM.div({className: "content", id: "panel-charts"}, 
                        React.DOM.h1(null, "Charts"), 
                        React.DOM.div({id: "chart"})
                    ), 

                    React.DOM.div({className: "content", id: "panel-categories"}, 
                        CategoryComponent({categories: this.state.categories, onCategoryFormSubmit: this.addCategory})
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
 * Global state
 */
var w = {
    lookup: {},
    current: {}
};

$banks = $('#banks-list');
$accounts = $('#accounts-list');
$operationsHeader = $('#operations-header');
$operations = $('#operations-table');
$similarities = $('#similarities-main');
$chart = $('#chart');

function xhrError(xhr, textStatus, err) {
    alert('xhr error: ' + textStatus + '\n' + err);
}

/*
 * Controllers
 */

function matchCategories() {
    if (typeof w.current.account === 'undefined')
        return;

    // TODO shouldn't need sorting
    // TODO still issues when matching categories
    var ops = w.current.account.operations.sort(function(a,b) { return +a.date - +b.date })
    var selects = $('#operations-table select');
    assert(ops.length === selects.length);

    for (var i = 0; i < ops.length; i++) {
        var op = ops[i];
        var catid = op.categoryId;
        if (typeof catid !== 'undefined' && typeof w.lookup.categories[catid] !== 'undefined') {
            op.category = w.lookup.categories[catid].title;

            // Update view
            var select = $(selects[i]);
            select.val(catid);
        }
    }
}

function loadCategories() {
    // Retrieve categories
    $.get('categories', function (data) {
        w.categories = [];
        w.lookup.categories = {};
        w.lookup.categories['-1'] = new Category({ title: 'None', id: -1})

        for (var catPod of data) {
            var c = new Category(catPod);
            w.categories.push(c);
            w.lookup.categories[c.id] = c;
        }

        matchCategories();

        if (typeof w.current.account !== 'undefined')
            updateCategorySelects();
    }).fail(xhrError);
}

function updateCategorySelects() {
    if (typeof w.categories === 'undefined' || w.categories.length == 0)
        return;

    var options = '<option value="-1">None</option>';
    for (var c of w.categories) {
        options += template(c, '<option value="${id}">${title}</option>');
    }

    assert(w.current.account);
    var selects = $('#operations-table select');
    var ops = w.current.account.operations;
    assert(typeof ops !== 'undefined');
    assert(ops.length === selects.length);
    for (var i = 0; i < selects.length; i++) {

        // Captures i
        (function(j){
            var select = $(selects[j]);
            select.html(options);
            select.change(function (e) {
                var categoryId = select.val();
                var data = {
                    categoryId: categoryId
                }

                $.ajax({
                    url:'operations/' + ops[j].id,
                    type: 'PUT',
                    data: data,
                    success: function () {
                        // TODO replace with a setter
                        ops[j].categoryId = categoryId;
                        ops[j].category = w.lookup.categories[categoryId].title;
                        select.val(categoryId);
                    },
                    error: xhrError
                });
            });
        })(i);

    }
}

// Run at startup
(function init() {
    $.get('banks', {withAccountOnly:true}, function (data) {
        // Update model
        w.banks = [];
        w.lookup.banks = {}

        assert(w.banks.length === 0);
        assert(Object.keys(w.lookup.banks).length === 0);
        for (var bankPod of data) {
            var b = new Bank(bankPod);
            w.banks.push(b);
            w.lookup.banks[b.id] = b;
        }

        // Update view
        var content = '';
        for (var b of w.banks) {
            content += template(b, "<li><a onclick=clickOnBank('${id}')>${name}</a></li>");
        }
        $banks.html(content);

    }).fail(xhrError);

    loadCategories();
})();

function clickOnBank(id) {
    assert(typeof w.lookup.banks !== 'undefined');
    assert(typeof w.lookup.banks[id] !== 'undefined');
    var bank = w.lookup.banks[id];

    $.get('banks/getAccounts/' + bank.id, function (data) {
        // Update model
        bank.accounts = []
        w.lookup.accounts = {}

        assert(bank.accounts.length === 0);
        assert(Object.keys(w.lookup.accounts).length === 0);
        for (var accPod of data) {
            var a = new Account(accPod);
            bank.addAccount(a);
            w.lookup.accounts[a.id] = a;
        }

        // Update view
        var content = '';
        for (var a of bank.accounts) {
            var ctx = {
                bid: bank.id,
                aid: a.id,
                atitle: a.title
            }
            content += template(ctx, "<li><a onclick=loadAccount('${aid}')>${atitle}</li>");
        }
        $accounts.html(content);

    }).fail(xhrError);
}

function loadAccount(id) {
    assert(typeof w.lookup.accounts !== 'undefined');
    assert(typeof w.lookup.accounts[id] !== 'undefined');
    var account = w.lookup.accounts[id];
    w.current.account = account;

    $.get('accounts/getOperations/' + account.id, function (data) {
        account.operations = [];
        w.lookup.operations = w.lookup.operations || {};

        assert(account.operations.length === 0);
        // Update model
        for (var opPod of data) {
            var opObj = new Operation(opPod);
            account.addOperation(opObj);
            w.lookup.operations[opObj.id] = opObj;
        }

        var total = account.initialAmount;
        for (var op of account.operations)
            total += op.amount;

        // Update view
        var content = '';
        var tpl  = '<tr><td>${date}</td><td>${title}</td><td>${amount}</td>';
            tpl += '<td><select><option>No category</option></select></td>'
            tpl += '</tr>';
        for (var op of account.operations) {
            content += template(op, tpl);
        }
        $operations.html(content);
        $operationsHeader.html('Total: ' + total);
        updateCategorySelects();
        matchCategories();

        // Run algorithms
        findRedundant(account.operations);
        createChart(account);
    });
}

var $newCategory = $('#categories-new-cat');

function onCategoryFormSubmit() {
    var title = $newCategory.val();

    if (typeof title === 'undefined' || title.length === 0) {
        alert('no title!');
        return
    }

    var catPod = {
        title: title
    };

    $.post('categories', catPod, function (data) {
        var cat = new Category(data);
        w.categories.push(cat);
        w.lookup.categories[cat.id] = cat;
        $newCategory.val('');

        // Update view
        var content = template(cat, '<li>${title}</li>');
        var before = $categoryList.html();
        $categoryList.html(before + content);

        // TODO update selectors
    }).fail(xhrError);
}

/*
 * ALGORITHMS
 */
const TIME_SIMILAR_THRESHOLD = 1000 * 60 * 60 * 24 * 32; // 72 hours
//const TIME_SIMILAR_THRESHOLD = 1000 * 60 * 60 * 24 * 3; // 72 hours
function findRedundantAlgorithm(operations) {
    var similar = [];

    // O(n log n)
    function sortCriteria(a,b) { return a.amount - b.amount; }
    var sorted = operations.sort(sortCriteria);
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

function findRedundant(operations) {
    var similar = [];

    // O(n log n)
    function sortCriteria(a,b) { return a.amount - b.amount; }
    var sorted = operations.sort(sortCriteria);
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

    var content = '';
    // Update view
    if (similar.length === 0) {
        content = 'No similar operations found';
        $similarities.html(content);
        return;
    }

    content = '<div>Possibly redundant operations have been found.</div>';
    var tpl = ''

    for (var pair of similar) {
        assert(pair.length == 2);
        var a = pair[0], b = pair[1];
        var ctx = {
            adate: a.date,
            atitle: a.title,
            aamount: a.amount,
            aid: a.id,
            bdate: b.date,
            btitle: b.title,
            bamount: b.amount,
            bid: b.id
        }
        content += template(ctx, tpl);
    }
    $similarities.html(content);
}

function deleteOperation(id) {
    function reloadAccount() {
        assert(typeof w.lookup.operations !== 'undefined');
        assert(typeof w.lookup.operations[id] !== 'undefined');
        var op = w.lookup.operations[id];
        delete w.lookup.operations[id];
        has(w.current, 'account') && loadAccount(w.current.account.id);
    }

    $.ajax({
        url: 'operations/' + id,
        type: 'DELETE',
        success: reloadAccount,
        error: xhrError
    });
}

function createChart(account, operations) {
    if (operations.length === 0)
        return;

    var ops = operations.sort(function (a,b) { return +a.date - +b.date });
    var firstOp = ops[0];

    var cumulativeAmount = account.initialAmount;
    // Must contain array pairs [+date, value]
    var data = [];

    var opmap = {};
    operations.map(function(o) {
        opmap[o.date] = opmap[o.date] || 0;
        opmap[o.date] += o.amount;
    })

    for (var date in opmap) {
        cumulativeAmount += opmap[date];
        data.push([date, cumulativeAmount]);
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
