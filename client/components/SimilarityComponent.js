/** @jsx React.DOM */

// Constants
var Events = require('../Events');
var assert = require('../Helpers').assert;
var debug = require('../Helpers').debug;

// Global variables
var store = require('../store');
var flux = require('../flux/dispatcher');

function DEBUG(text) {
    return debug('Similarity Component - ' + text);
}

// Algorithm

// TODO make this threshold a parameter
const TIME_SIMILAR_THRESHOLD = 1000 * 60 * 60 * 24 * 1.5; // 36 hours
function findRedundantPairs(operations) {
    DEBUG('Running findRedundantPairs algorithm...');
    DEBUG('Input: ' + operations.length + ' operations');
    var similar = [];

    function areSimilarOperations(a, b) {
        if (a.amount != b.amount)
            return false;
        var datediff = Math.abs(+a.date - +b.date);
        return datediff <= TIME_SIMILAR_THRESHOLD;
    }

    // O(n log n)
    function sortCriteria(a,b) { return a.amount - b.amount; }
    var sorted = operations.slice().sort(sortCriteria);
    for (var i = 0; i < operations.length; ++i) {
        if (i + 1 >= operations.length)
            continue;

        var op = sorted[i];
        var next = sorted[i+1];
        if (areSimilarOperations(op, next))
            similar.push([op, next]);
    }

    DEBUG(similar.length + ' pairs of similar operations found');
    return similar;
}

// Components
var SimilarityItemComponent = React.createClass({

    render: function() {
        return (
            <tr>
                <td>{this.props.operation.date.toString()}</td>
                <td>{this.props.operation.title}</td>
                <td>{this.props.operation.amount}</td>
                <td>Category: {store.categoryToLabel(this.props.operation.categoryId)}</td>
                <td>Imported on: {new Date(this.props.operation.dateImport).toLocaleString()}</td>
                <td><a onClick={this.props.ondelete}>x</a></td>
            </tr>
        );
    }
});

var SimilarityPairComponent = React.createClass({

    render: function() {

        var that = this;
        function makeOndelete(id) {
            return function() {
                assert(id === 'a' || id === 'b');
                var toDelete = that.props[id];
                var toKeep = that.props[(id === 'a') ? 'b' : 'a'];

                // If the one to delete had a category and the one to keep
                // doesn't, automatically transfer category.
                if (toDelete.categoryId !== -1 && toKeep.categoryId === -1) {
                    var catId = toDelete.categoryId;
                    flux.dispatch({
                        type: Events.OPERATION_CATEGORY_CHANGED,
                        operationId: toKeep.id,
                        categoryId: catId
                    });
                }

                flux.dispatch({
                    type: Events.DELETE_OPERATION,
                    operation: toDelete
                });
            }
        }

        return (
            <table>
                <SimilarityItemComponent operation={this.props.a} ondelete={makeOndelete('a')} />
                <SimilarityItemComponent operation={this.props.b} ondelete={makeOndelete('b')} />
            </table>
        );
    }
});

module.exports = React.createClass({

    getInitialState: function() {
        return {
            pairs: []
        };
    },

    _cb: function() {
        this.setState({
            pairs: findRedundantPairs(store.operations)
        });
    },

    componentDidMount: function() {
        store.subscribeMaybeGet(Events.OPERATIONS_LOADED, this._cb);
    },

    componentWillUnmount: function() {
        store.removeListener(Events.OPERATIONS_LOADED, this._cb);
    },

    render: function() {
        var pairs = this.state.pairs;
        if (pairs.length === 0) {
            return (
                <div>No similar operations found.</div>
            )
        }

        var sim = pairs.map(function (p) {
            var key = p[0].id.toString() + p[1].id.toString();
            return (<SimilarityPairComponent key={key} a={p[0]} b={p[1]}  />)
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

