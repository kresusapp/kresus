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

var CategoryItem = React.createClass({

    render: function() {
        return (
            <li>{this.props.title}</li>
        );
    }
});

var CategoryList = React.createClass({

    render: function() {
        var items = this.props.categories.map(function (cat) {
            return (
                <CategoryItem title={cat.title} />
            );
        });
        return (
            <ul>{items}</ul>
        );
    }
});

var CategoryForm = React.createClass({

    onSubmit: function() {
        var label = this.refs.label.getDOMNode().value.trim();
        if (!label)
            return false;

        var catPod = {title: label};
        this.props.onSubmit(catPod);
    },

    render: function() {
        return (
            <form onSubmit={this.onSubmit}>
                <div class='row'>
                    <div class='small-10 columns'>
                        <input type='text' placeholder='Label of new category' ref='label' />
                    </div>
                    <div class='small-2 columns'>
                        <input type='submit' class='button postfix' value='Submit' />
                    </div>
                </div>
            </form>
        )
    }
});

var CategoryComponent = React.createClass({

    getInitialState: function() {
        return {categories: []}
    },

    loadCategories: function() {
        var that = this;
        $.get('categories', function (data) {
            var categories = []
            for (var catPod of data) {
                var c = new Category(catPod);
                categories.push(c);
            }
            that.setState({categories: categories});
        });
    },

    componentDidMount: function() {
        this.loadCategories();
    },

    onSubmit: function(newcat) {
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

    render: function() {
        return (
            <div>
                <h1>Categories</h1>
                <CategoryList categories={this.state.categories} />
                <h3>Add a category</h3>
                <CategoryForm onSubmit={this.onSubmit} />
            </div>
        );
    }
});

var BankListItemComponent = React.createClass({

    onClick: function() {
        // TODO
        console.log('clicked on bank');
    },

    render: function() {
        return (
            <li><a onClick={this.onClick}>{this.props.name}</a></li>
        );
    }
});

var BankListComponent = React.createClass({

    render: function() {
        var banks = this.props.banks.map(function (b) {
            return (
                <BankListItemComponent name={b.name} />
            )
        });

        return (
            <div>
                Banks
                <ul className='row'>
                    {banks}
                </ul>
                <hr/>
            </div>
        );
    }
});

var AccountsListItem = React.createClass({

    onClick: function() {
        console.log('clicked on account');
    },

    render: function() {
        return (
            <li>
                <a onClick={this.onClick}>{this.props.title}</a>
            </li>
        );
    }
});

var AccountsListComponent = React.createClass({

    render: function() {
        var accounts = this.props.accounts.map(function (a) {
            return (
                <AccountsListItem title={a.title} />
            );
        });

        return (
            <div>
                Accounts
                <ul className='row'>
                    {accounts}
                </ul>
            </div>
        );
    }
});

var OperationComponent = React.createClass({

    render: function() {
        return (
            <tr>
                <td>{this.props.operation.date.toString()}</td>
                <td>{this.props.operation.title}</td>
                <td>{this.props.operation.amount}</td>
                <td>
                    <select>
                        <option>No category</option>
                    </select>
                </td>
            </tr>
        );
    }
});

var OperationsComponent = React.createClass({

    render: function() {
        var ops = this.props.operations.map(function (o) {
            return (
                <OperationComponent operation={o} />
            );
        });

        return (
            <div>
                <h1>Operations</h1>
                <table>
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Title</th>
                            <th>Amount</th>
                            <th>Category</th>
                        </tr>
                    </thead>
                    <tbody>
                        {ops}
                    </tbody>
                </table>
            </div>
        );
    }
});

var Kresus = React.createClass({

    getInitialState: function() {
        return {
            // All banks
            banks: [],
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
        }).fail(xhrError);
    },

    setCurrentAccount: function(account) {
        if (!account)
            return false;
        assert(account instanceof Account);

        this.setState({
            currentAccount: account || null
        })
        this.loadOperations();
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
        this.setState({
            currentBank: bank
        });
        this.loadAccounts();
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
            });
            that.setCurrentBank(banks[0] || null);
        }).fail(xhrError);
    },

    render: function() {
        return (
            <div className='row'>

            <div className='panel small-2 columns'>
                <BankListComponent banks={this.state.banks} />
                <AccountsListComponent accounts={this.state.accounts} />
            </div>

            <div className="small-10 columns">
                <ul className="tabs" data-tab>
                    <li className="tab-title active"><a href="#panel-operations">Operations</a></li>
                    <li className="tab-title"><a href="#panel-charts">Charts</a></li>
                    <li className="tab-title"><a href="#panel-similarities">Similarities</a></li>
                    <li className="tab-title"><a href="#panel-categories">Categories</a></li>
                </ul>

                <div className="tabs-content">

                    <div className='content active' id='panel-operations'>
                        <OperationsComponent operations={this.state.operations} />
                    </div>

                    <div className='content' id='panel-similarities'>
                        <h1>Similarities</h1>
                        <div id='similarities-main'></div>
                    </div>

                    <div className='content' id='panel-charts'>
                        <h1>Charts</h1>
                        <div id='chart'></div>
                    </div>

                    <div className='content' id='panel-categories'>
                        <CategoryComponent />
                    </div>

                </div>
            </div>

            </div>
        );
    }
});

var S = document.querySelector.bind(document);
React.renderComponent(<Kresus />, S('#main'));

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
const TIME_SIMILAR_THRESHOLD = 1000 * 60 * 60 * 24 * 3; // 72 hours
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
    var tpl = '<table>'
            + '<tr><td>${adate}</td><td>${atitle}</td><td>${aamount}</td>'
            +    '<td><a onclick=deleteOperation("${aid}")>x</a><td></tr>'
            + '<tr><td>${bdate}</td><td>${btitle}</td><td>${bamount}</td>'
            +    '<td><a onclick=deleteOperation("${bid}")>x</a><td></tr>'
            + '</table>';

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

function createChart(account) {
    // Must contain array pairs [+date, value]
    var data = [];

    if (account.operations.length === 0)
        return;

    var ops = account.operations.sort(function (a,b) { return +a.date - +b.date });
    var firstOp = ops[0];
    var cumulativeAmount = account.initialAmount + firstOp.amount;
    data.push([+firstOp.date, cumulativeAmount]);
    for (var i = 1; i < ops.length; i++) {
        var op = ops[i];
        cumulativeAmount += op.amount;
        data.push([+op.date, cumulativeAmount]);
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
