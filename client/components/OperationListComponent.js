/** @jsx React.DOM */

// Constants
var Events = require('../Events');
var debug = require('../Helpers').debug;

// Global variables
var store = require('../store');
var flux = require('../flux/dispatcher');

// If the length of the short label (of an operation) is smaller than this
// threshold, the raw label of the operation will be displayed in lieu of the
// short label, in the operations list.
// TODO make this a parameter in settings
const SMALL_TITLE_THRESHOLD = 4;

// Components
var CategorySelectComponent = React.createClass({

    getInitialState: function() {
        return { editMode: false }
    },

    dom: function() {
        return this.refs.cat.getDOMNode();
    },

    onChange: function(e) {
        var selectedId = this.dom().value;
        flux.dispatch({
            type: Events.user.updated_category_of_operation,
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
            return (<span onClick={this.switchToEditMode}>{label}</span>)
        }

        // On the first click in edit mode, categories are already loaded.
        // Every time we reload categories, we can't be in edit mode, so we can
        // just synchronously retrieve categories and not need to subscribe to
        // them.
        var options = store.categories.map(function (c) {
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
        return { showDetails: false };
    },

    _toggleDetails: function(e) {
        this.setState({ showDetails: !this.state.showDetails});
        e.preventDefault();
    },

    render: function() {
        var op = this.props.operation;

        var rowClassName = op.amount > 0 ? "success" : "";

        var label = op.title.length < SMALL_TITLE_THRESHOLD ? op.raw + ' (' + op.title + ')' : op.title;

        if (this.state.showDetails) {
            return (
                <tr className={rowClassName}>
                    <td>
                        <a href="#" className="toggle-btn active" onClick={this._toggleDetails}> </a>
                    </td>
                    <td colSpan="4" className="text-uppercase">
                        <ul>
                            <li>Full label: {op.raw}</li>
                            <li>Amount: {op.amount}</li>
                            <li>Category: <CategorySelectComponent operation={op} /></li>
                        </ul>
                    </td>
                </tr>
            );
        }

        return (
            <tr className={rowClassName}>
                <td>
                    <a href="#" className="toggle-btn" onClick={this._toggleDetails}> </a>
                </td>
                <td>{op.date.toLocaleDateString()}</td>
                <td className="text-uppercase">{label}</td>
                <td>{op.amount}</td>
                <td><CategorySelectComponent operation={op} /></td>
            </tr>
        );
    }
});

var OperationsComponent = module.exports = React.createClass({

    getInitialState: function() {
        return {
            account: {initialAmount: 0},
            operations: [],
            filteredOperations: [],
            isSynchronizing: false
        }
    },

    _cb: function() {
        this.setState({
            account: store.getCurrentAccount(),
            operations: store.getCurrentOperations(),
            isSynchronizing: false
        }, this.onSearchInput_);
    },

    componentDidMount: function() {
        store.subscribeMaybeGet(Events.server.loaded_operations, this._cb);
    },

    componentWillUnmount: function() {
        store.removeListener(Events.server.loaded_operations, this._cb);
    },

    getTotal: function() {
        var total = this.state.operations.reduce(function(a,b) { return a + b.amount },
                                                 this.state.account.initialAmount);
        return (total * 100 | 0) / 100;
    },

    FilterOperationsThisMonth: function(operations) {
        var now = new Date();
        return operations.filter(function(op) {
            var d = new Date(op.date);
            return d.getFullYear() == now.getFullYear() && d.getMonth() == now.getMonth()
        });
    },

    getPositive: function() {
        var total = this.FilterOperationsThisMonth(this.state.operations)
                        .filter(function(v) { return v.amount > 0 })
                        .reduce(function(a,b) { return a + b.amount; }, 0);
        return (total * 100 | 0) / 100;
    },

    getNegative: function() {
        var total = this.FilterOperationsThisMonth(this.state.operations)
                        .filter(function(v) { return v.amount < 0 })
                        .reduce(function(a,b) { return a + b.amount; }, 0);
        return (total * 100 | 0) / 100;
    },

    getDiff: function() {
        var total = this.FilterOperationsThisMonth(this.state.operations)
                        .reduce(function(a,b) { return a + b.amount} , 0);
        return (total * 100 | 0) / 100;
    },

    onFetchOperations_: function() {
        flux.dispatch({
            type: Events.user.fetched_operations
        });

        // Change UI to show a message indicating sync.
        this.setState({
            isSynchronizing: true
        });
    },

    onSearchInput_: function() {
        var wholeField = this.refs.search.getDOMNode().value;

        if (wholeField.length == 0) {
            this.setState({
                filteredOperations: this.state.operations
            });
            return;
        }

        // Parse search field
        var search = {
            amount: {
                low: null,
                high: null
            },
            date: {
                low: null,
                high: null
            },
            category: null,
            raw: []
        };

        wholeField.split(' ').forEach(function(v) {
            v = v.toLowerCase();
            if (v.indexOf("c:") === 0) {
                var catname = v.substring(2);
                if (catname.length)
                    search.category = catname;
            } else if (v.indexOf("a:") === 0) {
                // expect a:Number,Number
                v = v.substring(2).split(',');
                var low = v[0], high = v[1];
                if (!!low && low.length && +low === +low)
                    search.amount.low = +low;
                if (!!high && high.length && +high === +high)
                    search.amount.high = +high;
            } else if (v.indexOf("d:") === 0) {
                // expect d:DD-MM-YYYY,DD-MM-YYYY
                v = v.substring(2).split(',');
                var low = +new Date(v[0]), high = +new Date(v[1]);
                if (low === low)
                    search.date.low = low;
                if (high === high)
                    search.date.high = high;
            } else {
                search.raw.push(v);
            }
        });

        function contains(where, substring) {
            return where.toLowerCase().indexOf(substring) !== -1;
        }

        function filterIf(condition, array, callback) {
            if (condition)
                return array.filter(callback);
            return array;
        }

        // Filter! Apply most discriminatory / easiest filters first
        var operations = store.operations.slice();

        operations = filterIf(search.category !== null, operations, function(op) {
            return contains(store.categoryToLabel(op.categoryId), search.category);
        });

        operations = filterIf(search.amount.low !== null, operations, function(op) {
            return op.amount >= search.amount.low;
        });

        operations = filterIf(search.amount.high !== null, operations, function(op) {
            return op.amount <= search.amount.high;
        });

        operations = filterIf(search.date.low !== null, operations, function(op) {
            return op.date >= search.date.low;
        });

        operations = filterIf(search.date.high !== null, operations, function(op) {
            return op.date <= search.date.high;
        });

        operations = filterIf(search.raw.length > 0, operations, function(op) {
            for (var i = 0; i < search.raw.length; i++) {
                var str = search.raw[i];
                if (!contains(op.raw, str) && !contains(op.title, str))
                    return false;
            }
            return true;
        });

        this.setState({
            filteredOperations: operations
        });
    },

    render: function() {
        var ops = this.state.filteredOperations.map(function (o) {
            return (
                <OperationComponent key={o.id} operation={o} />
            );
        });

        var syncText = this.state.isSynchronizing
                       ? <div className="last-sync">Fetching your latest bank transactions...</div>
                       : <div className="input-group">
                             <div className="last-sync">
                                 Last synchronization with your bank:
                                 {' ' + new Date(this.state.account.lastChecked).toLocaleString()}
                             </div>
                             <span className="input-group-btn">
                                 <a className="btn btn-primary pull-right" href='#' onClick={this.onFetchOperations_}>Synchronize now</a>
                             </span>
                         </div>

        // TODO pagination:
        // let k the number of elements to show by page,
        // let n the total number of elements.
        // There are Ceil(n/k) pages.
        // q-th page (starting at 1) shows elements from [(q-1)k, Min(qk-1, n)]

        return (
            <div>
                <div className="row operation-wells">
                    <div className="col-xs-3">
                        <div className="well background-lightblue">
                            <span className="operation-amount">{this.getTotal()} €</span><br/>
                            <span className="well-title">Current Balance</span><br/>
                            <span className="well-sub">As of {new Date(this.state.account.lastChecked).toLocaleDateString()}</span>
                        </div>
                    </div>

                    <div className="col-xs-3">
                        <div className="well background-green">
                            <span className="operation-amount">{this.getPositive()} €</span><br/>
                            <span className="well-title">Received</span><br/>
                            <span className="well-sub">This month</span>
                        </div>
                    </div>

                    <div className="col-xs-3">
                        <div className="well background-orange">
                            <span className="operation-amount">{this.getNegative()} €</span><br/>
                            <span className="well-title">Paid</span><br/>
                            <span className="well-sub">This month</span>
                        </div>
                    </div>

                    <div className="col-xs-3">
                        <div className="well background-darkblue">
                            <span className="operation-amount">{this.getDiff()} €</span><br/>
                            <span className="well-title">Saved</span><br/>
                            <span className="well-sub">This month</span>
                        </div>
                    </div>
                </div>

                <div className="operation-panel panel panel-default">
                    <div className="panel-heading">
                        <h3 className="title panel-title">Transactions</h3>
                    </div>

                    <div className="panel-body">
                        <div className="panel panel-default">
                            {syncText}
                        </div>

                        <div className="row">
                            <div className="col-xs-12">
                                <div className="input-group">
                                    <input type="text" className="form-control" onKeyUp={this.onSearchInput_}
                                       placeholder="label c:categoryName a:-20,50 d:2015-01-01,2014-02-28" ref="search"
                                       aria-describedby="addon-search" />
                                    <span className="input-group-addon" id="addon-search">search</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <table className="table table-striped table-hover table-bordered">
                        <thead>
                            <tr>
                                <th></th>
                                <th>Date</th>
                                <th>Operation</th>
                                <th>Amount</th>
                                <th>Category</th>
                            </tr>
                        </thead>
                        <tbody>
                            {ops}
                        </tbody>
                    </table>
                </div>

            </div>
        );
    }
});

