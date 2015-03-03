/** @jsx React.DOM */

// Constants
var Events = require('../Events');
var Helpers = require('../Helpers');
var has = Helpers.has;
var maybeHas = Helpers.maybeHas;

var Category = require('../Models').Category;

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

var SearchComponent = React.createClass({
    getInitialState: function() {
        return {
            showDetails: false,

            keywords: [],
            category: '',
            amount_low: '',
            amount_high: '',
            date_low: null,
            date_high: null
        }
    },

    toggleDetails: function() {
        this.setState({
            showDetails: !this.state.showDetails
        });
    },

    componentDidMount: function() {
        // Force search with empty query, to show all operations
        this.filter();
    },

    dateLowPicker: null,
    dateHighPicker: null,

    componentDidUpdate: function() {
        var self = this;
        if (this.state.showDetails) {
            if (!this.dateLowPicker) {
                this.dateLowPicker = $(this.refs.date_low.getDOMNode()).pickadate()
                                        .pickadate('picker');
                this.dateLowPicker.on('set', function(value) {
                    if (maybeHas(value, 'clear'))
                        value = null;
                    else if (maybeHas(value, 'select'))
                        value = +new Date(value.select);
                    else
                        return;

                    self.setState({
                        date_low: value
                    }, self.filter);
                });
            }
            if (!this.dateHighPicker) {
                this.dateHighPicker = $(this.refs.date_high.getDOMNode()).pickadate()
                                         .pickadate('picker');
                this.dateHighPicker.on('set', function(value) {
                    if (maybeHas(value, 'clear'))
                        value = null;
                    else if (maybeHas(value, 'select'))
                        value = +new Date(value.select);
                    else
                        return;

                    self.setState({
                        date_high: value
                    }, self.filter);
                });
            }
        } else {
            this.dateLowPicker = this.dateHighPicker = null;
        }
    },

    ref: function(name) {
        has(this.refs, name);
        return this.refs[name].getDOMNode();
    },

    syncKeyword: function() {
        var kw = this.ref('keywords');
        this.setState({
            keywords: kw.value.split(' ')
        }, this.filter);
    },

    syncCategory: function() {
        var cat = this.ref('cat');
        this.setState({
            category: cat.value.toLowerCase()
        }, this.filter);
    },

    syncAmountLow: function() {
        var low = this.ref('amount_low');
        this.setState({
            amount_low: low.value
        }, this.filter);
    },

    syncAmountHigh: function() {
        var high = this.ref('amount_high');
        this.setState({
            amount_high: high.value
        }, this.filter);
    },

    filter: function() {
        function contains(where, substring) {
            return where.toLowerCase().indexOf(substring) !== -1;
        }

        function filterIf(condition, array, callback) {
            if (condition)
                return array.filter(callback);
            return array;
        }

        // Filter! Apply most discriminatory / easiest filters first
        var operations = this.props.operations.slice();

        var self = this;
        operations = filterIf(this.state.category !== '', operations, function(op) {
            return contains(store.categoryToLabel(op.categoryId), self.state.category);
        });

        operations = filterIf(this.state.amount_low !== '', operations, function(op) {
            return op.amount >= self.state.amount_low;
        });

        operations = filterIf(this.state.amount_high !== '', operations, function(op) {
            return op.amount <= self.state.amount_high;
        });

        operations = filterIf(this.state.date_low !== null, operations, function(op) {
            return op.date >= self.state.date_low;
        });

        operations = filterIf(this.state.date_high !== null, operations, function(op) {
            return op.date <= self.state.date_high;
        });

        operations = filterIf(this.state.keywords.length > 0, operations, function(op) {
            for (var i = 0; i < self.state.keywords.length; i++) {
                var str = self.state.keywords[i];
                if (!contains(op.raw, str) && !contains(op.title, str))
                    return false;
            }
            return true;
        });

        this.props.setFilteredOperations(operations);
    },

    render: function() {
        var details;
        if (!this.state.showDetails) {
            details = <div className="transition-expand" />;
        } else {
            var catOptions = store.getCategories().map(function(c) {
                return (<option key={c.id} value={c.title}>{c.title}</option>)
            }).concat(<option key='_' value=''>Any category</option>);

            details = <div className="panel-body transition-expand">

                <div className="form-group">
                    <label htmlFor="keywords">Keywords</label>
                    <input type="text" className="form-control"
                       onKeyUp={this.syncKeyword} defaultValue={this.state.keywords.join(' ')}
                       placeholder="keywords" id="keywords" ref="keywords" />
                </div>

                <div className="form-group">
                    <label htmlFor="category-selector">Category</label>
                    <select className="form-control" id="category-selector"
                       onChange={this.syncCategory} defaultValue={this.state.category}
                       ref='cat'>
                        {catOptions}
                    </select>
                </div>

                <div className="form-horizontal">
                    <div className="form-group">
                        <div className="col-xs-2">
                            <label className="control-label" htmlFor="amount-low">Amount: low</label>
                        </div>
                        <div className="col-xs-5">
                            <input type="number" className="form-control"
                              onChange={this.syncAmountLow} defaultValue={this.state.amount_low}
                              id="amount-low" ref="amount_low" />
                        </div>
                        <div className="col-xs-1">
                            <label className="control-label" htmlFor="amount-high">high</label>
                        </div>
                        <div className="col-xs-4">
                            <input type="number" className="form-control"
                              onChange={this.syncAmountHigh} defaultValue={this.state.amount_high}
                              id="amount-high" ref="amount_high" />
                        </div>
                    </div>
                </div>

                <div className="form-horizontal">
                    <div className="form-group">
                        <div className="col-xs-2">
                            <label className="control-label" htmlFor="date-low">Date: between</label>
                        </div>
                        <div className="col-xs-5">
                            <input type="text" className="form-control" ref="date_low" id="date-low" key="date-low" />
                        </div>
                        <div className="col-xs-1">
                            <label className="control-label" htmlFor="date-high">and</label>
                        </div>
                        <div className="col-xs-4">
                            <input type="text" className="form-control" ref="date_high" id="date-high" key="date-high" />
                        </div>
                    </div>
                </div>
            </div>;
        }

        return (
        <div className="panel panel-default">
            <div className="panel-heading clickable" onClick={this.toggleDetails}>
                <h5 className="panel-title">Search</h5>
            </div>
            {details}
        </div>
        );

    }
});

var OperationsComponent = module.exports = React.createClass({

    getInitialState: function() {
        return {
            account: null,
            operations: [],
            filteredOperations: [],
            isSynchronizing: false,
            hasFilteredOperations: false
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
        store.subscribeMaybeGet(Events.state.operations, this._cb);
    },

    componentWillUnmount: function() {
        store.removeListener(Events.state.operations, this._cb);
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

    getPositiveSearch: function() {
        var total = this.state.filteredOperations
                        .filter(function(v) { return v.amount > 0 })
                        .reduce(function(a,b) { return a + b.amount; }, 0);
        return (total * 100 | 0) / 100;
    },

    getNegativeSearch: function() {
        var total = this.state.filteredOperations
                        .filter(function(v) { return v.amount < 0 })
                        .reduce(function(a,b) { return a + b.amount; }, 0);
        return (total * 100 | 0) / 100;
    },

    getDiffSearch: function() {
        var total = this.state.filteredOperations
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

    setFilteredOperations: function(operations) {
        this.setState({
            filteredOperations: operations,
            hasFilteredOperations: operations.length < this.state.operations.length
        });
    },

    render: function() {
        // If there's no account set, just show a message indicating to go to
        // the settings.
        if (this.state.account === null) {
            return (
                <div className="top-panel panel panel-default">
                    <div className="panel-heading">
                        <h3 className="title panel-title">Ohnoes!</h3>
                    </div>

                    <div className="panel-body">
                        <h3>It seems you haven't set any account! You can start by setting an account in the Settings section.</h3>
                    </div>
                </div>
            );
        }

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
                            <span className="operation-amount">{
                                this.state.hasFilteredOperations
                                ? this.getPositiveSearch()
                                : this.getPositive()
                            } €</span><br/>
                            <span className="well-title">Received</span><br/>
                            <span className="well-sub">{
                                this.state.hasFilteredOperations
                                ? 'For this search'
                                : 'This month'
                            }</span>
                        </div>
                    </div>

                    <div className="col-xs-3">
                        <div className="well background-orange">
                            <span className="operation-amount">{
                                this.state.hasFilteredOperations
                                ? this.getNegativeSearch()
                                : this.getNegative()
                            } €</span><br/>
                            <span className="well-title">Paid</span><br/>
                            <span className="well-sub">{
                                this.state.hasFilteredOperations
                                ? 'For this search'
                                : 'This month'
                            }</span>
                        </div>
                    </div>

                    <div className="col-xs-3">
                        <div className="well background-darkblue">
                            <span className="operation-amount">{
                                this.state.hasFilteredOperations
                                ? this.getDiffSearch()
                                : this.getDiff()
                            } €</span><br/>
                            <span className="well-title">Saved</span><br/>
                            <span className="well-sub">{
                                this.state.hasFilteredOperations
                                ? 'For this search'
                                : 'This month'
                            }</span>
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

                        <SearchComponent setFilteredOperations={this.setFilteredOperations} operations={this.state.operations} />
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

