// Constants
import {assert, debug, translate as t} from '../Helpers';

// Global variables
import {Actions, store, State} from '../store';
import T from './Translated';

function DEBUG(text) {
    return debug('Similarity Component - ' + text);
}

// Algorithm

function findRedundantPairs(operations, duplicateThreshold) {
    DEBUG('Running findRedundantPairs algorithm...');
    DEBUG('Input: ' + operations.length + ' operations');
    var similar = [];

    // duplicateThreshold is in hours
    var threshold = duplicateThreshold * 60 * 60 * 1000;
    DEBUG('Threshold: ' + threshold);

    function areSimilarOperations(a, b) {
        if (a.amount != b.amount)
            return false;
        var datediff = Math.abs(+a.date - +b.date);
        return datediff <= threshold;
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
class SimilarityItemComponent extends React.Component {
    render() {
        return (
            <tr>
                <td>{this.props.operation.date.toLocaleDateString()}</td>
                <td>{this.props.operation.title}</td>
                <td>{this.props.operation.amount}</td>
                <td>{store.categoryToLabel(this.props.operation.categoryId)}</td>
                <td>{new Date(this.props.operation.dateImport).toLocaleString()}</td>
                <td><button className="btn btn-danger" onClick={this.props.ondelete}>
                        <span className="glyphicon glyphicon-remove" aria-hidden="true"></span>
                    </button>
                </td>
            </tr>
        );
    }
}

class SimilarityPairComponent extends React.Component {

    render() {

        var makeOndelete = (id) => {
            return (e) => {
                assert(id === 'a' || id === 'b');
                var toDelete = this.props[id];
                var toKeep = this.props[(id === 'a') ? 'b' : 'a'];

                // If the one to delete had a category and the one to keep
                // doesn't, automatically transfer category.
                if (toDelete.categoryId !== -1 && toKeep.categoryId === -1) {
                    var catId = toDelete.categoryId;
                    Actions.SetOperationCategory(toKeep, catId);
                }
                Actions.DeleteOperation(toDelete);
                e.preventDefault();
            }
        }

        return (
            <table className="table table-striped table-bordered">
                <thead>
                    <tr>
                        <th className="col-xs-2">Date</th>
                        <th className="col-xs-3">Title</th>
                        <th className="col-xs-1">Amount</th>
                        <th className="col-xs-2">Category</th>
                        <th className="col-xs-3">Imported on</th>
                        <th className="col-xs-1">Delete</th>
                    </tr>
                </thead>
                <tbody>
                    <SimilarityItemComponent operation={this.props.a} ondelete={makeOndelete('a')} />
                    <SimilarityItemComponent operation={this.props.b} ondelete={makeOndelete('b')} />
                </tbody>
            </table>
        );
    }
}

export default class Similarity extends React.Component {

    constructor() {
        this.state = {
            pairs: []
        };
        this.listener = this._listener.bind(this);
    }

    _listener() {
        this.setState({
            pairs: findRedundantPairs(store.getCurrentOperations(),
                                      store.getSetting('duplicateThreshold'))
        });
    }

    componentDidMount() {
        store.subscribeMaybeGet(State.operations, this.listener);
    }

    componentWillUnmount() {
        store.removeListener(State.operations, this.listener);
    }

    render() {
        var pairs = this.state.pairs;

        var sim
        if (pairs.length === 0) {
            sim = <div><T k='similarity.nothing_found'>No similar transactions found.</T></div>
        } else {
            sim = pairs.map(function (p) {
                var key = p[0].id.toString() + p[1].id.toString();
                return (<SimilarityPairComponent key={key} a={p[0]} b={p[1]}  />)
            });
        }
        return (
            <div>
                <div className="top-panel panel panel-default">
                    <div className="panel-heading">
                        <h3 className="title panel-title"><T k='similarity.title'>Duplicates</T></h3>
                    </div>
                    <div className="panel-body">
                        <div className="alert alert-info">
                            <span className="glyphicon glyphicon-exclamation-sign"></span>
                            <T k='similarity.help'>
Sometimes, importing bank transactions may lead to duplicate transactions, e.g. if the bank added information to a given transaction a few days after its effective date. This screen shows similarities between suspected transactions, and allows you to manually remove duplicates. Note: Categories may be transferred upon deletion: if you have a pair of duplicates A/B, in which A has a category but B doesn't, and you choose to delete A, then B will inherit A's category.
                            </T></div>
                        {sim}
                    </div>
                </div>
            </div>)
    }
}

