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
                <CategoryItem key={cat.id} title={cat.title} />
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
        this.refs.label.getDOMNode().value = '';
    },

    render: function() {
        return (
            <form onSubmit={this.onSubmit}>
                <div className='row'>
                    <div className='small-10 columns'>
                        <input type='text' placeholder='Label of new category' ref='label' />
                    </div>
                    <div className='small-2 columns'>
                        <input type='submit' className='button postfix' value='Submit' />
                    </div>
                </div>
            </form>
        )
    }
});

var CategoryComponent = React.createClass({

    render: function() {
        return (
            <div>
                <h1>Categories</h1>
                <CategoryList categories={this.props.categories} />
                <h3>Add a category</h3>
                <CategoryForm onSubmit={this.props.onCategoryFormSubmit} />
            </div>
        );
    }
});

// Props: setCurrentBank: function(bank){}, bank: Bank
var BankListItemComponent = React.createClass({

    onClick: function() {
        this.props.setCurrentBank(this.props.bank);
    },

    render: function() {
        return (
            <li><a onClick={this.onClick}>{this.props.bank.name}</a></li>
        );
    }
});

// Props: setCurrentBank: function(bank){}, banks: [Bank]
var BankListComponent = React.createClass({

    render: function() {
        var setCurrentBank = this.props.setCurrentBank;
        var banks = this.props.banks.map(function (b) {
            return (
                <BankListItemComponent key={b.id} bank={b} setCurrentBank={setCurrentBank} />
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

// Props: setCurrentAccount: function(account){}, account: Account
var AccountsListItem = React.createClass({

    onClick: function() {
        this.props.setCurrentAccount(this.props.account);
    },

    render: function() {
        return (
            <li>
                <a onClick={this.onClick}>{this.props.account.title}</a>
            </li>
        );
    }
});

// Props: setCurrentAccount: function(account) {}, accounts: [Account]
var AccountsListComponent = React.createClass({

    render: function() {
        var setCurrentAccount = this.props.setCurrentAccount;
        var accounts = this.props.accounts.map(function (a) {
            return (
                <AccountsListItem key={a.id} account={a} setCurrentAccount={setCurrentAccount} />
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

var CategorySelectComponent = React.createClass({

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
            return (<span onClick={this.switchToEditMode}>{label}</span>)
        }

        var categories = [new Category({title: 'None', id: '-1'})].concat(this.props.categories);
        var options = categories.map(function (c) {
            return (<option key={c.id} value={c.id}>{c.title}</option>)
        });
        return (
            <select onChange={this.onChange} onBlur={this.switchToStaticMode} defaultValue={selectedId} ref='cat' >
                {options}
            </select>
        );
    }
});

var OperationComponent = React.createClass({

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
            <tr>
                <td>{op.date.toString()}</td>
                <td onMouseEnter={this.onMouseEnter} onMouseLeave={this.onMouseLeave} >{this.state.mouseOn ? op.raw : op.title}</td>
                <td>{op.amount}</td>
                <td>
                    <CategorySelectComponent operation={op} categories={this.props.categories}
                        updateOperationCategory={this.props.updateOperationCategory} />
                </td>
            </tr>
        );
    }
});

var OperationsComponent = React.createClass({

    render: function() {
        var categories = this.props.categories;
        var updateOperationCategory = this.props.updateOperationCategory;
        var ops = this.props.operations.map(function (o) {
            return (
                <OperationComponent key={o.id} operation={o} categories={categories} updateOperationCategory={updateOperationCategory} />
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

var SimilarityItemComponent = React.createClass({

    deleteOperation: function() {
        this.props.deleteOperation(this.props.op);
    },

    render: function() {
        return (
            <tr>
                <td>{this.props.op.date.toString()}</td>
                <td>{this.props.op.title}</td>
                <td>{this.props.op.amount}</td>
                <td><a onClick={this.deleteOperation}>x</a></td>
            </tr>
        );
    }
});

var SimilarityPairComponent = React.createClass({

    render: function() {
        return (
            <table>
                <SimilarityItemComponent op={this.props.a} deleteOperation={this.props.deleteOperation} />
                <SimilarityItemComponent op={this.props.b} deleteOperation={this.props.deleteOperation} />
            </table>
        );
    }
});

// Props: pairs: [[Operation, Operation]], deleteOperation: function(Operation){}
var SimilarityComponent = React.createClass({

    render: function() {
        var pairs = this.props.pairs;
        if (pairs.length === 0) {
            return (
                <div>No similar operations found.</div>
            )
        }

        var deleteOperation = this.props.deleteOperation;
        var sim = pairs.map(function (p) {
            var key = p[0].id.toString() + p[1].id.toString();
            return (<SimilarityPairComponent key={key} a={p[0]} b={p[1]} deleteOperation={deleteOperation} />)
        });
        return (
            <div>
                <h1>Similarities</h1>
                <div>
                    {sim}
                </div>
            </div>)
    }
});

// Props: operations, categories
var ChartComponent = React.createClass({

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
            return (<option key={c.id} value={c.id}>{c.title}</option>);
        });

        return (
        <div>
            <h1>Charts</h1>
            <select onChange={this._onChange} defaultValue='all' ref='select'>
                <option value='all'>All</option>
                {categoryOptions}
            </select>
            <div id='chart'></div>
        </div>
        );
    }
});

var CategoryMap = {};

var Kresus = React.createClass({

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
            <div className='row'>

            <div className='panel small-2 columns'>
                <BankListComponent
                    banks={this.state.banks}
                    setCurrentBank={this.setCurrentBank}
                />
                <AccountsListComponent
                    accounts={this.state.accounts}
                    setCurrentAccount={this.setCurrentAccount}
                />
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
                        <OperationsComponent
                            operations={this.state.operations}
                            categories={this.state.categories}
                            updateOperationCategory={this.updateOperationCategory}
                        />
                    </div>

                    <div className='content' id='panel-similarities'>
                        <SimilarityComponent
                            pairs={this.state.redundantPairs}
                            deleteOperation={this.deleteOperation}
                        />
                    </div>

                    <div className='content' id='panel-charts'>
                        <ChartComponent
                            account={this.state.currentAccount}
                            operations={this.state.operations}
                            categories={this.state.categories}
                        />
                    </div>

                    <div className='content' id='panel-categories'>
                        <CategoryComponent
                            categories={this.state.categories}
                            onCategoryFormSubmit={this.addCategory}
                        />
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
    for (var op of operations) {
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
    for (var op of operations) {
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

