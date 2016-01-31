import { Actions, store, State } from '../../store';
import { debug, translate as $t } from '../../helpers';

function DEBUG(text) {
    return debug(`Similarity Component - ${text}`);
}

// Algorithm

function findRedundantPairs(operations, duplicateThreshold) {
    let before = Date.now();
    DEBUG('Running findRedundantPairs algorithm...');
    DEBUG(`Input: ${operations.length} operations`);
    let similar = [];

    // duplicateThreshold is in hours
    let threshold = duplicateThreshold * 60 * 60 * 1000;
    DEBUG(`Threshold: ${threshold}`);

    // O(n log n)
    let sorted = operations.slice().sort((a, b) => a.amount - b.amount);
    for (let i = 0; i < operations.length; ++i) {
        let op = sorted[i];
        let j = i + 1;
        while (j < operations.length) {
            let next = sorted[j];
            if (next.amount !== op.amount)
                break;
            let datediff = Math.abs(+op.date - +next.date);
            // Two operations are duplicates if they were not imported at the same date.
            if (datediff <= threshold && +op.dateImport !== +next.dateImport)
                similar.push([op, next]);
            j += 1;
        }
    }

    DEBUG(`${similar.length} pairs of similar operations found`);
    DEBUG(`findRedundantPairs took ${Date.now() - before}ms.`);
    // The duplicates are sorted from last imported to first imported
    similar.sort((a, b) => Math.max(b[0].dateImport, b[1].dateImport) -
        Math.max(a[0].dateImport, a[1].dateImport)
    );
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
                        <th className="col-xs-2">{ $t('client.similarity.date') }</th>
                        <th className="col-xs-3">{ $t('client.similarity.label') }</th>
                        <th className="col-xs-1">{ $t('client.similarity.amount') }</th>
                        <th className="col-xs-2">{ $t('client.similarity.category') }</th>
                        <th className="col-xs-1">{ $t('client.similarity.type') }</th>
                        <th className="col-xs-2">{ $t('client.similarity.imported_on') }</th>
                        <th className="col-xs-1">{ $t('client.similarity.merge') }</th>
                    </tr>
                </thead>
                <tbody>

                    <tr>
                        <td>{ this.props.a.date.toLocaleDateString() }</td>
                        <td>{ this.props.a.title }</td>
                        <td>{ this.props.a.amount }</td>
                        <td>{ store.getCategoryFromId(this.props.a.categoryId).title }</td>
                        <td>{ store.operationTypeToLabel(this.props.a.operationTypeID) }</td>
                        <td>{ new Date(this.props.a.dateImport).toLocaleString() }</td>
                        <td rowSpan={ 2 }>
                            <button className="btn btn-primary" onClick={ this.onMerge.bind(this) }>
                                <span className="glyphicon glyphicon-resize-small"
                                  aria-hidden="true" />
                            </button>
                        </td>
                    </tr>

                    <tr>
                        <td>{ this.props.b.date.toLocaleDateString() }</td>
                        <td>{ this.props.b.title }</td>
                        <td>{ this.props.b.amount }</td>
                        <td>{ store.getCategoryFromId(this.props.b.categoryId).title }</td>
                        <td>{ store.operationTypeToLabel(this.props.b.operationTypeID) }</td>
                        <td>{ new Date(this.props.b.dateImport).toLocaleString() }</td>
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
        let pairs = this.state.pairs;

        let sim;
        if (pairs.length === 0) {
            sim = ( <div> { $t('client.similarity.nothing_found') } </div>);
        } else {
            sim = pairs.map(p => {
                let key = p[0].id.toString() + p[1].id.toString();
                return <SimilarityPairComponent key={ key } a={ p[0] } b={ p[1] }/>;
            });
        }
        return (
            <div>
                <div className="top-panel panel panel-default">
                    <div className="panel-heading">
                        <h3 className="title panel-title">
                            { $t('client.similarity.title') }
                        </h3>
                    </div>
                    <div className="panel-body">
                        <div className="alert alert-info">
                            <span className="glyphicon glyphicon-exclamation-sign"></span>
                            { $t('client.similarity.help') }
                        </div>
                        { sim }
                    </div>
                </div>
            </div>
        );
    }
}
