/** @jsx React.DOM */

// Constants
var Events = require('../Events');
var debug = require('../Helpers').debug;

// Global variables
var store = require('../store');
var flux = require('../flux/dispatcher');

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

        var maybeDetails, maybeActive;
        if (this.state.showDetails) {
            maybeDetails = <li className="detail"><b>Details: </b>{op.raw}</li>;
            maybeActive = "toggle-btn active";
        } else {
            maybeDetails = "";
            maybeActive = "toggle-btn";
        }

        return (
            <ul className="table-row clearfix">
                <li><a href="#" className={maybeActive} onClick={this._toggleDetails}></a></li>
                <li>{op.date.toLocaleDateString()}</li>
                <li>{op.title}</li>
                <li>{op.amount}</li>
                <li><CategorySelectComponent operation={op} /></li>
                {maybeDetails}
            </ul>
        );
    }
});

var OperationsComponent = module.exports = React.createClass({

    getInitialState: function() {
        return {
            account: {initialAmount: 0},
            operations: [],
            filteredOperations: []
        }
    },

    _cb: function() {
        this.setState({
            account: store.currentAccount,
            operations: store.operations
        }, this.onSearchInput_);
    },

    componentDidMount: function() {
        store.subscribeMaybeGet(Events.OPERATIONS_LOADED, this._cb);
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
            type: Events.RETRIEVE_OPERATIONS_QUERIED
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

        // Filter!
        var operations = store.operations.slice().filter(function(op) {
            // Apply most discriminatory / easiest filters first
            if (search.category !== null &&
                store.categoryToLabel(op.categoryId).toLowerCase().indexOf(search.category) === -1)
            {
                return false;
            }

            if (search.amount.low !== null && op.amount < search.amount.low)
                return false;
            if (search.amount.high !== null && op.amount > search.amount.high)
                return false;
            if (search.date.low !== null && op.date < search.date.low)
                return false;
            if (search.date.high !== null && op.date > search.date.high)
                return false;

            for (var i = 0; i < search.raw.length; i++) {
                var str = search.raw[i];
                if (op.raw.toLowerCase().indexOf(str) === -1 &&
                    op.title.toLowerCase().indexOf(str) === -1)
                {
                    return false;
                }
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
            <div>
                <div className="price-block clearfix">
                    <ul className="main_amt">
                        <li className="mar_li lblu">
                            <span className="amt_big">{this.getTotal()} €</span><br/>
                            <span className="sub1 ">Total amount</span><br/>
                            <span className="sub2">Last sync: {new Date(this.state.account.lastChecked).toLocaleString()}
                                                   <a href='#' onClick={this.onFetchOperations_}>(sync now)</a>
                            </span>
                        </li>
                        <li className="mar_li gr">
                            <span className="amt_big">{this.getPositive()} €</span><br/>
                            <span className="sub1 ">Ins</span><br/>
                            <span className="sub2">this month</span>
                        </li>
                        <li className="mar_li org">
                            <span className="amt_big">{this.getNegative()} €</span><br/>
                            <span className="sub1 ">Outs</span><br/>
                            <span className="sub2">this month</span>
                        </li>
                        <li className="dblu">
                            <span className="amt_big">{this.getDiff()} €</span><br/>
                            <span className="sub1 ">Difference</span><br/>
                            <span className="sub2">this month</span>
                        </li>
                    </ul>
                </div>

                <div className="operation-block">
                    <div className="title text-uppercase">operations</div>
                    <div className="operation">

                        <div className="operation-top clearfix">
                            <div className="record-per-page pull-left">
                                <select className="form-control pull-left">
                                    <option>5</option>
                                    <option>10</option>
                                    <option>20</option>
                                    <option>50</option>
                                </select>
                                <span className="pull-left">record per page</span>
                            </div>
                            <div className="search pull-right clearfix">
                                <span className="pull-left">search</span>
                                <input type="text" className="form-control pull-right" onKeyUp={this.onSearchInput_}
                                   placeholder="label c:categoryName a:-20,50 d:2015-01-01,2014-02-28" ref="search" />
                            </div>
                        </div>

                        <div className="operation-table">
                            <ul className="table-header clearfix">
                                <li></li>
                                <li>DATE</li>
                                <li>OPERATION</li>
                                <li>AMOUNT</li>
                                <li>CATEGORY</li>
                            </ul>
                            {ops}
                        </div>

                        <div className="clearfix table-footer">
                            <div className="rig_cont pull-left">Showing 1 to 10 of 57 entries </div>

                            <div className="pull-right" style={tableFooterStyle}>
                                <nav className="my_nav">
                                    <ul className="pagination my_pag">
                                        <li className="previous"><a href="#"><span aria-hidden="true">&larr;</span> Previous</a></li>
                                        <li className="active"><a href="#">1 </a></li>
                                        <li><a href="#">2 </a></li>
                                        <li><a href="#">3 </a></li>
                                        <li><a href="#">4 </a></li>
                                        <li><a href="#">5 </a></li>
                                        <li className="next"><a href="#">Next <span aria-hidden="true">&rarr;</span></a></li>
                                    </ul>
                                </nav>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        );
    }
});

