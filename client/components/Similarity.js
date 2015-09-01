// Constants
import {assert, debug, translate as t, NONE_CATEGORY_ID} from '../Helpers';

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
class SimilarityPairComponent extends React.Component {

    onMerge(e) {

        let older, younger;
        if (+this.props.a.dateImport < +this.props.b.dateImport) {
            [older, younger] = [this.props.a, this.props.b];
        } else {
            [older, younger] = [this.props.b, this.props.a];
        }

        Actions.MergeOperations(younger, older);
        e.preventDefault();
    }

    render() {

        return (
            <table className="table table-striped table-bordered">
                <thead>
                    <tr>
                        <th className="col-xs-2"><T k="similarity.date">Date</T></th>
                        <th className="col-xs-3"><T k="similarity.label">Label</T></th>
                        <th className="col-xs-1"><T k="similarity.amount">Amount</T></th>
                        <th className="col-xs-2"><T k="similarity.category">Category</T></th>
                        <th className="col-xs-3"><T k="similarity.imported_on">Imported on</T></th>
                        <th className="col-xs-1"><T k="similarity.merge">Merge</T></th>
                    </tr>
                </thead>
                <tbody>

                    <tr>
                        <td>{this.props.a.date.toLocaleDateString()}</td>
                        <td>{this.props.a.title}</td>
                        <td>{this.props.a.amount}</td>
                        <td>{store.categoryToLabel(this.props.a.categoryId)}</td>
                        <td>{new Date(this.props.a.dateImport).toLocaleString()}</td>
                        <td rowSpan={2}>
                            <button className="btn btn-primary" onClick={this.onMerge.bind(this)}>
                                <span className="glyphicon glyphicon-resize-small" aria-hidden="true"></span>
                            </button>
                        </td>
                    </tr>

                    <tr>
                        <td>{this.props.b.date.toLocaleDateString()}</td>
                        <td>{this.props.b.title}</td>
                        <td>{this.props.b.amount}</td>
                        <td>{store.categoryToLabel(this.props.b.categoryId)}</td>
                        <td>{new Date(this.props.b.dateImport).toLocaleString()}</td>
                    </tr>

                </tbody>
            </table>
        );
    }
}

export default class Similarity extends React.Component {

    constructor(props) {
        super(props);
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
        store.on(State.banks, this.listener);
        store.on(State.accounts, this.listener);
        store.subscribeMaybeGet(State.operations, this.listener);
    }

    componentWillUnmount() {
        store.removeListener(State.banks, this.listener);
        store.removeListener(State.accounts, this.listener);
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

