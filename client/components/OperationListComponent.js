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
                <li><a className={maybeActive} onClick={this._toggleDetails}></a></li>
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

    render: function() {
        var ops = this.state.operations.map(function (o) {
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
                        <li className="mar_li org">
                            <span className="amt_big">{this.getTotal()} €</span><br/>
                            <span className="sub1 ">Total amount</span><br/>
                            <span className="sub2">today <a onClick={this.onFetchOperations_}>(sync)</a></span>
                        </li>
                        <li className="mar_li gr">
                            <span className="amt_big">{this.getPositive()} €</span><br/>
                            <span className="sub1 ">Ins</span><br/>
                            <span className="sub2">this month</span>
                        </li>
                        <li className="mar_li lblu">
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
                    <div className="title text-uppercase">operation</div>
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
                        </div>

                        <div className="operation-table">
                            <ul className="table-header clearfix">
                                <li></li>
                                <li>DATE <a className="pull-right" href=""><span>&#9652;</span></a></li>
                                <li>OPERATION <a className="pull-right" href=""><span>&#9652;</span></a></li>
                                <li>AMOUNT <a className="pull-right up-n-down" href=""><span>&#9652;</span><span>&#9662;</span></a></li>
                                <li>CATEGORY <a className="pull-right up-n-down" href=""><span>&#9652;</span><span>&#9662;</span></a></li>
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

