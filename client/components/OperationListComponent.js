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
                <td>{op.date.toLocaleDateString()}</td>
                <td onMouseEnter={this.onMouseEnter} onMouseLeave={this.onMouseLeave} >{this.state.mouseOn ? op.raw : op.title}</td>
                <td>{op.amount}</td>
                <td>
                    <CategorySelectComponent operation={op} />
                </td>
            </tr>
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
        store.on(Events.OPERATIONS_LOADED, this._cb);
    },

    componentWillUnmount: function() {
        store.removeListener(Events.OPERATIONS_LOADED, this._cb);
    },

    getTotal: function() {
        var total = this.state.operations.reduce(function(a,b) { return a + b.amount },
                                                 this.state.account.initialAmount);
        return (total * 100 | 0) / 100;
    },

    onRetrieveOperations_: function() {
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

        return (
            <div>
                <h1>Operations</h1>
                <div>
                    <h3>Total: {this.getTotal()}</h3>
                    <a onClick={this.onRetrieveOperations_}>Retrieve operations</a>
                </div>
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

