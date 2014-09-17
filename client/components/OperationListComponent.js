/** @jsx React.DOM */

// Constants
var Events = require('../Events');
var debug = require('../Helpers').debug;

// Global variables
var operationStore = require('../stores/operationStore');
var flux = require('../flux/dispatcher');

// Props: operation: Operation
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
                <td>TODO</td>
            </tr>
        );
    }
});

/*
    <td>
        <CategorySelectComponent operation={op} categories={this.props.categories}
            updateOperationCategory={this.props.updateOperationCategory} />
    </td>
*/

var OperationsComponent = module.exports = React.createClass({

    getInitialState: function() {
        return {
            operations: []
        }
    },

    _cb: function() {
        this.setState({
            operations: operationStore.operations
        });
    },

    componentDidMount: function() {
        operationStore.on(Events.OPERATIONS_LOADED, this._cb);
    },

    componentWillUnmount: function() {
        operationStore.removeListener(Events.OPERATIONS_LOADED, this._cb);
    },

    render: function() {
        var ops = this.state.operations.map(function (o) {
            return (
                <OperationComponent key={o.id} operation={o} />
            ); // TODO  we passed along the updateCategory function as well
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

