import { store, State } from '../../store';
import { debug as dbg, translate as $t } from '../../helpers';
import Pair from './item';

function debug(text) {
    return dbg(`Similarity Component - ${text}`);
}

// Algorithm

function findRedundantPairs(operations, duplicateThreshold) {
    let before = Date.now();
    debug('Running findRedundantPairs algorithm...');
    debug(`Input: ${operations.length} operations`);
    let similar = [];

    // duplicateThreshold is in hours
    let threshold = duplicateThreshold * 60 * 60 * 1000;
    debug(`Threshold: ${threshold}`);

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

    debug(`${similar.length} pairs of similar operations found`);
    debug(`findRedundantPairs took ${Date.now() - before}ms.`);
    // The duplicates are sorted from last imported to first imported
    similar.sort((a, b) =>
        Math.max(b[0].dateImport, b[1].dateImport) -
        Math.max(a[0].dateImport, a[1].dateImport)
    );
    return similar;
}

export default class Similarity extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            pairs: []
        };
        this.listener = this.listener.bind(this);
    }

    listener() {
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
            sim = <div>{ $t('client.similarity.nothing_found') }</div>;
        } else {
            sim = pairs.map(p => {
                let key = p[0].id.toString() + p[1].id.toString();
                return <Pair key={ key } a={ p[0] } b={ p[1] }/>;
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
