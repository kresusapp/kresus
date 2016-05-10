import { translate as $t } from '../../helpers';
import { store, State } from '../../store';

import { AmountWell, FilteredAmountWell } from './amount-well';
import SearchComponent from './search';
import Operation from './operation';
import SyncButton from './sync-button';

import throttle from 'lodash.throttle';

// Height of an operation line (px)
const OPERATION_HEIGHT = 55;

// Number of operations before / after the ones to render, for flexibility.
const OPERATION_BALLAST = 10;

// Throttling for the scroll event (ms)
const SCROLL_THROTTLING = 150;

// Number of elements
let INITIAL_SHOW_ITEMS = window.innerHeight / OPERATION_HEIGHT | 0;

// Filter functions used in amount wells.
function noFilter() {
    return true;
}
function isPositive(op) {
    return op.amount > 0;
}
function isNegative(op) {
    return op.amount < 0;
}

export default class OperationsComponent extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            account: store.getCurrentAccount(),
            operations: store.getCurrentOperations(),
            filteredOperations: [],
            firstItemShown: 0,
            lastItemShown: INITIAL_SHOW_ITEMS,
            hasFilteredOperations: false
        };
        this.listener = this._listener.bind(this);
        this.setFilteredOperations = this.setFilteredOperations.bind(this);

        this.handleScroll = throttle(this.onScroll.bind(this), SCROLL_THROTTLING);
        this.handleResize = this.handleResize.bind(this);
    }

    _listener() {
        this.setState({
            account: store.getCurrentAccount(),
            operations: store.getCurrentOperations(),
            firstItemShown: 0,
            lastItemShown: INITIAL_SHOW_ITEMS
        }, () => this.refs.search.filter());
    }

    setFilteredOperations(operations) {
        this.setState({
            filteredOperations: operations,
            hasFilteredOperations: operations.length < this.state.operations.length,
            firstItemShown: 0,
            lastItemShown: INITIAL_SHOW_ITEMS
        });
    }

    componentDidMount() {
        store.on(State.banks, this.listener);
        store.on(State.accounts, this.listener);
        store.on(State.operations, this.listener);

        window.addEventListener('scroll', this.handleScroll);
        window.addEventListener('resize', this.handleResize);
    }

    componentWillUnmount() {
        store.removeListener(State.banks, this.listener);
        store.removeListener(State.operations, this.listener);
        store.removeListener(State.accounts, this.listener);

        window.removeEventListener('scroll', this.handleScroll);
        window.removeEventListener('resize', this.handleResize);
    }

    handleResize(e) {
        e.preventDefault();
        INITIAL_SHOW_ITEMS = window.innerHeight / OPERATION_HEIGHT | 0;
        this.handleScroll();
    }

    onScroll() {
        let wellH = React.findDOMNode(this.refs.wells).scrollHeight;
        let searchH = React.findDOMNode(this.refs.search).scrollHeight;
        let panelH = React.findDOMNode(this.refs.panelHeading).scrollHeight;
        let theadH = React.findDOMNode(this.refs.thead).scrollHeight;
        let fixedTopH = wellH + searchH + panelH + theadH;

        let topItemH = Math.max(window.scrollY - fixedTopH, 0);
        let bottomItemH = topItemH + window.innerHeight;

        let firstItemShown = Math.max(topItemH / OPERATION_HEIGHT - OPERATION_BALLAST | 0, 0);
        let lastItemShown = (bottomItemH / OPERATION_HEIGHT | 0) + OPERATION_BALLAST;

        this.setState({
            firstItemShown,
            lastItemShown
        });
    }

    render() {
        // Edge case: the component hasn't retrieved the account yet.
        if (this.state.account === null) {
            return <div/>;
        }

        let bufferPreH = OPERATION_HEIGHT * this.state.firstItemShown;
        let bufferPre = <tr style={ { height: `${bufferPreH}px` } } />;

        let formatCurrency = this.state.account.formatCurrency;
        let ops = this.state.filteredOperations
                    .slice(this.state.firstItemShown, this.state.lastItemShown)
                    .map(o =>
                        <Operation key={ o.id }
                          operation={ o }
                          formatCurrency={ formatCurrency }
                        />);

        let numOps = this.state.filteredOperations.length;
        let bufferPostH = OPERATION_HEIGHT * Math.max(numOps - this.state.lastItemShown, 0);
        let bufferPost = <tr style={ { height: `${bufferPostH}px` } } />;

        let asOf = $t('client.operations.as_of');
        let lastCheckedDate = new Date(this.state.account.lastChecked).toLocaleDateString();
        let lastCheckDate = `${asOf} ${lastCheckedDate}`;

        return (
            <div>
                <div className="row operation-wells" ref="wells">

                    <AmountWell
                      size="col-xs-12 col-md-3"
                      backgroundColor="background-lightblue"
                      icon="balance-scale"
                      title={ $t('client.operations.current_balance') }
                      subtitle={ lastCheckDate }
                      operations={ this.state.operations }
                      initialAmount={ this.state.account.initialAmount }
                      filterFunction={ noFilter }
                      formatCurrency={ formatCurrency }
                    />

                    <FilteredAmountWell
                      size="col-xs-12 col-md-3"
                      backgroundColor="background-green"
                      icon="arrow-down"
                      title={ $t('client.operations.received') }
                      hasFilteredOperations={ this.state.hasFilteredOperations }
                      operations={ this.state.operations }
                      filteredOperations={ this.state.filteredOperations }
                      initialAmount={ 0 }
                      filterFunction={ isPositive }
                      formatCurrency={ formatCurrency }
                    />

                    <FilteredAmountWell
                      size="col-xs-12 col-md-3"
                      backgroundColor="background-orange"
                      icon="arrow-up"
                      title={ $t('client.operations.spent') }
                      hasFilteredOperations={ this.state.hasFilteredOperations }
                      operations={ this.state.operations }
                      filteredOperations={ this.state.filteredOperations }
                      initialAmount={ 0 }
                      filterFunction={ isNegative }
                      formatCurrency={ formatCurrency }
                    />

                    <FilteredAmountWell
                      size="col-xs-12 col-md-3"
                      backgroundColor="background-darkblue"
                      icon="database"
                      title={ $t('client.operations.saved') }
                      hasFilteredOperations={ this.state.hasFilteredOperations }
                      operations={ this.state.operations }
                      filteredOperations={ this.state.filteredOperations }
                      initialAmount={ 0 }
                      filterFunction={ noFilter }
                      formatCurrency={ formatCurrency }
                    />
                </div>

                <SearchComponent
                  ref="search"
                  setFilteredOperations={ this.setFilteredOperations }
                  operations={ this.state.operations }
                />

                <div className="operation-panel panel panel-default">
                    <div className="panel-heading" ref="panelHeading">
                        <h3 className="title panel-title">
                            { $t('client.operations.title') }
                        </h3>
                        <SyncButton account={ this.state.account } />
                    </div>

                    <div className="table-responsive">
                        <table className="table table-hover table-bordered">
                            <thead ref="thead">
                                <tr>
                                    <th></th>
                                    <th className="col-sm-1">
                                        { $t('client.operations.column_date') }
                                    </th>
                                    <th className="col-sm-2">
                                        { $t('client.operations.column_type') }
                                    </th>
                                    <th className="col-sm-6">
                                        { $t('client.operations.column_name') }
                                    </th>
                                    <th className="col-sm-1">
                                        { $t('client.operations.column_amount') }
                                    </th>
                                    <th className="col-sm-2">
                                        { $t('client.operations.column_category') }
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                { bufferPre }
                                { ops }
                                { bufferPost }
                            </tbody>
                        </table>
                    </div>

                </div>

            </div>
        );
    }
}
