import { translate as $t } from '../../helpers';
import { store, State } from '../../store';

import { AmountWell, FilteredAmountWell } from './amount-well';
import SearchComponent from './search';
import Operation from './operation';
import SyncButton from './sync-button';


// Height of an operation line (px)
const OPERATION_HEIGHT = 55;
// Number of elements ( there is maximum a full screen of operations)
const SHOW_ITEMS_INITIAL = window.innerHeight / OPERATION_HEIGHT | 0;
// Last scroll time
const lastScrollTime = Date.now();
// SCROLL_TIMER (ms)
const SCROLL_TIMER = 300;

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
            lastItemShown: SHOW_ITEMS_INITIAL,
            hasFilteredOperations: false,
            operationHeight: 55,
            operationsToRender: 0
        };
        this.showMoreTimer = null;
        this.listener = this._listener.bind(this);
        this.setFilteredOperations = this.setFilteredOperations.bind(this);
        this.handleOnScroll = this.handleOnScroll.bind(this);
    }

    _listener() {
        this.setState({
            account: store.getCurrentAccount(),
            operations: store.getCurrentOperations(),
            lastItemShown: SHOW_ITEMS_INITIAL
        }, () => this.refs.search.filter());
    }

    componentDidMount() {
        store.on(State.banks, this.listener);
        store.on(State.accounts, this.listener);
        store.on(State.operations, this.listener);
        window.addEventListener('scroll', this.handleOnScroll);
    }

    componentWillUnmount() {
        store.removeListener(State.banks, this.listener);
        store.removeListener(State.operations, this.listener);
        store.removeListener(State.accounts, this.listener);
        window.removeEventListener('scroll', this.handleOnScroll);
    }

    handleOnScroll(event) {
        event.preventDefault();
        // Do not handle the event more than once every SCROLL_TIMER ms
        if (+Date.now() - +lastScrollTime <= SCROLL_TIMER) {
            return; 
        }
        lastScrollTime = Date.now();
                // Scroll position
        let topVisible = window.scrollY;
        // Well height
        let wellHeight = this.refs.wells.getDOMNode().scrollHeight;
        // Search height
        let searchHeight = React.findDOMNode(this.refs.search).scrollHeight;
        // Operation panel height
        let opPanelHeight = React.findDOMNode(this.refs.opPanel).scrollHeight;
        // Operation Height
        let operationHeight;
        if (this.refs.operation) {
            operationHeight = Math.min(
                React.findDOMNode(this.refs.operation).scrollHeight,
                OPERATION_HEIGHT);
        } else {
            // No operation is displayed, no need to rerender
            return;
        }

        // Buffer height;
        let bufferHeight;
        if (this.refs.buffer) {
            bufferHeight = React.findDOMNode(this.refs.buffer).scrollHeight;
        } else {
            // There is no buffer, no operations to add
            return;
        }

        // Display height
        let displayHeight = window.innerHeight;
        // We want to always have at least 2 operations in the buffer
        let heightToFill = (topVisible + displayHeight) + 10 * operationHeight -
            (wellHeight + searchHeight + opPanelHeight - bufferHeight);
        // Number of operations to add.
        let operationsToAdd = heightToFill / operationHeight | 0;

        if (operationsToAdd > 0) {
            this.setState({
                lastItemShown: Math.min(this.state.lastItemShown +
                    Math.max(2, operationsToAdd), this.state.filteredOperations.length),
                operationHeight
            });
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
            return <div/>;
        }

        // Function which formats amounts
        let formatCurrency = this.state.account.formatCurrency;
        let ops = this.state.filteredOperations
                    .filter((op, i) => i <= this.state.lastItemShown)
                    .map((o, idx) =>
                        <Operation key={ o.id } operation={ o }
                          formatCurrency={ formatCurrency }
                          ref = { idx === 0 ? 'operation' : '' }
                        />);
        // A DIV buffer is added to the DOM if there are more than lastItemShown operations
        // This is used to have fixed height for the window
        let nbOps = this.state.filteredOperations.length;
        let maybeBuffer = nbOps > this.state.lastItemShown ?
            <div
              style={ { height: (nbOps - this.state.lastItemShown) * this.state.operationHeight } }
              ref="buffer"
            /> :
            '';

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
                  setFilteredOperations={ this.setFilteredOperations }
                  operations={ this.state.operations } ref="search"
                />

                <div className="operation-panel panel panel-default" ref="opPanel">
                    <div className="panel-heading">
                        <h3 className="title panel-title">
                            { $t('client.operations.title') }
                        </h3>
                        <SyncButton account={ this.state.account } />
                    </div>

                    <div className="table-responsive">
                        <table className="table table-striped table-hover table-bordered">
                            <thead ref="head">
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
                                { ops }
                            </tbody>
                        </table>
                    </div>
                { maybeBuffer }
                </div>

            </div>
        );
    }
}
