import { translate as $t } from '../../helpers';
import { store, State} from '../../store';

import {AmountWell, FilteredAmountWell} from './AmountWell';
import SearchComponent from './SearchOperationList';
import Operation from './Operation';
import SyncButton from './SyncButton';

const SHOW_ITEMS_INITIAL = 30;  // elements
const SHOW_ITEMS_MORE = 50;     // elements
const SHOW_ITEMS_TIMEOUT = 300; // ms

export default class OperationsComponent extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            account: null,
            operations: [],
            filteredOperations: [],
            lastItemShown: SHOW_ITEMS_INITIAL,
            hasFilteredOperations: false
        }
        this.showMoreTimer = null;
        this.listener = this._listener.bind(this);
    }

    _listener() {
        this.setState({
            account: store.getCurrentAccount(),
            operations: store.getCurrentOperations(),
            lastItemShown: SHOW_ITEMS_INITIAL,
        }, () => this.refs.search.filter());
    }

    componentDidMount() {
        store.on(State.banks, this.listener);
        store.on(State.accounts, this.listener);
        store.subscribeMaybeGet(State.operations, this.listener);
    }

    componentWillUnmount() {
        store.removeListener(State.banks, this.listener);
        store.removeListener(State.operations, this.listener);
        store.removeListener(State.accounts, this.listener);

        if (this.showMoreTimer) {
            clearTimeout(this.showMoreTimer);
            this.showMoreTimer = null;
        }
    }

    setFilteredOperations(operations) {
        this.setState({
            filteredOperations: operations,
            hasFilteredOperations: operations.length < this.state.operations.length,
            lastItemShown: SHOW_ITEMS_INITIAL
        });
    }

    render() {

        // Edge case: the component hasn't retrieved the account yet.
        if (this.state.account === null) {
            return <div/>
        }

        var ops = this.state.filteredOperations
                    .filter((op, i) => i <= this.state.lastItemShown)
                    .map((o) => <Operation key={o.id} operation={o} />);

        var maybeShowMore = () => {

            if (this.showMoreTimer) {
                clearTimeout(this.showMoreTimer);
            }

            this.showMoreTimer = setTimeout(() => {
                let newLastItemShown = Math.min(this.state.lastItemShown + SHOW_ITEMS_MORE, this.state.filteredOperations.length);
                if (newLastItemShown > this.state.lastItemShown) {
                    this.setState({
                        lastItemShown: newLastItemShown
                    }, maybeShowMore);
                }
            }, SHOW_ITEMS_TIMEOUT);
        }
        maybeShowMore();

        return (
            <div>
                <div className="row operation-wells">

                    <AmountWell
                        size='col-xs-12 col-md-3'
                        backgroundColor='background-lightblue'
                        icon='balance-scale'
                        title={$t('client.operations.current_balance')}
                        subtitle={($t('client.operations.as_of')) + ' ' + new Date(this.state.account.lastChecked).toLocaleDateString()}
                        operations={this.state.operations}
                        initialAmount={this.state.account.initialAmount}
                        filterFunction={(op) => true}
                    />

                    <FilteredAmountWell
                        size='col-xs-12 col-md-3'
                        backgroundColor='background-green'
                        icon='arrow-down'
                        title={$t('client.operations.received')}
                        hasFilteredOperations={this.state.hasFilteredOperations}
                        operations={this.state.operations}
                        filteredOperations={this.state.filteredOperations}
                        initialAmount={0}
                        filterFunction={(op) => op.amount > 0}
                    />

                    <FilteredAmountWell
                        size='col-xs-12 col-md-3'
                        backgroundColor='background-orange'
                        icon='arrow-up'
                        title={$t('client.operations.paid')}
                        hasFilteredOperations={this.state.hasFilteredOperations}
                        operations={this.state.operations}
                        filteredOperations={this.state.filteredOperations}
                        initialAmount={0}
                        filterFunction={(op) => op.amount < 0}
                    />

                    <FilteredAmountWell
                        size='col-xs-12 col-md-3'
                        backgroundColor='background-darkblue'
                        icon='database'
                        title={$t('client.operations.saved')}
                        hasFilteredOperations={this.state.hasFilteredOperations}
                        operations={this.state.operations}
                        filteredOperations={this.state.filteredOperations}
                        initialAmount={0}
                        filterFunction={(op) => true}
                    />
                </div>

                <div className="operation-panel panel panel-default">
                    <div className="panel-heading">
                        <h3 className="title panel-title">
                            {$t('client.operations.title')}
                        </h3>
                        <SyncButton account={this.state.account} />
                    </div>

                    <div className="panel-body">
                        <SearchComponent setFilteredOperations={this.setFilteredOperations.bind(this)} operations={this.state.operations} ref='search' />
                    </div>

                    <div className="table-responsive">
                        <table className="table table-striped table-hover table-bordered">
                            <thead>
                                <tr>
                                    <th></th>
                                    <th className="col-sm-1">
                                        {$t('client.operations.column_date')}
                                    </th>
                                    <th className="col-sm-2">
                                        {$t('client.operations.column_type')}
                                    </th>
                                    <th className="col-sm-6">
                                        {$t('client.operations.column_name')}
                                    </th>
                                    <th className="col-sm-1">
                                        {$t('client.operations.column_amount')}
                                    </th>
                                    <th className="col-sm-2">
                                        {$t('client.operations.column_category')}
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {ops}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
        );
    }
}
