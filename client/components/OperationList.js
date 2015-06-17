// Constants
import {has, maybeHas, translate as t} from '../Helpers';

import {Category} from '../Models';

// Global variables
import {Actions, store, State} from '../store';

import {AmountWell, FilteredAmountWell} from './AmountWell';
import SearchComponent from './SearchOperationList';
import T from './Translated';

// If the length of the short label (of an operation) is smaller than this
// threshold, the raw label of the operation will be displayed in lieu of the
// short label, in the operations list.
// TODO make this a parameter in settings
const SMALL_TITLE_THRESHOLD = 4;

// Components
class CategorySelectComponent extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            editMode: false
        };
    }

    dom() {
        return this.refs.cat.getDOMNode();
    }

    onChange(e) {
        var selectedId = this.dom().value;
        Actions.SetOperationCategory(this.props.operation, selectedId);
        // Be optimistic
        this.props.operation.categoryId = selectedId;
    }

    switchToEditMode() {
        this.setState({ editMode: true }, function() {
            this.dom().focus();
        });
    }

    switchToStaticMode() {
        this.setState({ editMode: false });
    }

    render() {
        var selectedId = this.props.operation.categoryId;
        var label = store.categoryToLabel(selectedId);

        if (!this.state.editMode) {
            return (<span onClick={this.switchToEditMode.bind(this)}>{label}</span>)
        }

        // On the first click in edit mode, categories are already loaded.
        // Every time we reload categories, we can't be in edit mode, so we can
        // just synchronously retrieve categories and not need to subscribe to
        // them.
        var options = store.getCategories().map((c) => <option key={c.id} value={c.id}>{c.title}</option>);

        return (
            <select onChange={this.onChange.bind(this)} onBlur={this.switchToStaticMode.bind(this)} defaultValue={selectedId} ref='cat' >
                {options}
            </select>
        );
    }
}

function ComputeAttachmentLink(opId) {
    return `operations/${opId}/file`;
}

class OperationDetails extends React.Component {
    constructor(props) {
        has(props, 'toggleDetails');
        has(props, 'operation');
        has(props, 'rowClassName');
        super(props);
    }

    render() {
        let op = this.props.operation;

        let maybeAttachment = '';
        if (op.binary !== null) {
            let opLink = ComputeAttachmentLink(op.id);
            maybeAttachment = <span>
                <a href={opLink} target="_blank">
                    <span className="glyphicon glyphicon-file"></span>
                    <T k="operations.attached_file">Download the attached file</T>
                </a>
            </span>;
        }

        if (op.appUrl !== null) {
            maybeAttachment = <span>
                <a href={op.appUrl} target="_blank">
                    <span className="glyphicon glyphicon-file"></span>
                    <T k="operations.edf_details">Go to EDF details</T>
                </a>
            </span>;
        }

        return <tr className={this.props.rowClassName}>
            <td>
                <a href="#" className="toggle-btn active" onClick={this.props.toggleDetails}> </a>
            </td>
            <td colSpan="4" className="text-uppercase">
                <ul>
                    <li><T k='operations.full_label'>Full label:</T> {op.raw}</li>
                    <li><T k='operations.amount'>Amount:</T> {op.amount}</li>
                    <li><T k='operations.category'>Category:</T> <CategorySelectComponent operation={op} /></li>
                    {maybeAttachment}
                </ul>
            </td>
        </tr>;
    }
}

class OperationComponent extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            showDetails: false
        };
    }

    toggleDetails(e) {
        this.setState({ showDetails: !this.state.showDetails});
        e.preventDefault();
    }

    render() {
        let op = this.props.operation;

        let rowClassName = op.amount > 0 ? "success" : "";

        if (this.state.showDetails) {
            return <OperationDetails
                     toggleDetails={this.toggleDetails.bind(this)}
                     operation={op}
                     rowClassName={rowClassName} />;
        }

        let label;
        if (op.title.length < SMALL_TITLE_THRESHOLD) {
            label = op.raw;
            if (op.title.length) {
                label += ` (${op.title})`;
            }
        } else {
            label = op.title;
        }

        // Add a link to the attached file, if there is any.
        if (op.binary !== null) {
            let opLink = ComputeAttachmentLink(op.id);
            label = <span>
                <a target="_blank" href={opLink} title={t('operations.attached_file') || 'download attached file'}>
                    <span className="glyphicon glyphicon-file" aria-hidden="true"></span>
                </a> {label}
            </span>;
        }
        if (op.appUrl !== null) {
            label = <span>
                <a target="_blank" href={op.appUrl} title={t('operations.edf_details') || 'Go to EDF details'}>
                    <span className="glyphicon glyphicon-file" aria-hidden="true"></span>
                </a> {label}
            </span>;
        }

        return (
            <tr className={rowClassName}>
                <td>
                    <a href="#" className="toggle-btn" onClick={this.toggleDetails.bind(this)}> </a>
                </td>
                <td>{op.date.toLocaleDateString()}</td>
                <td className="text-uppercase">{label}</td>
                <td>{op.amount}</td>
                <td><CategorySelectComponent operation={op} /></td>
            </tr>
        );
    }
}

class SyncButton extends React.Component {

    constructor(props) {
        has(props, 'account');
        super(props);
        this.state = {
            isSynchronizing: false
        }
        this.onAccountChanged = this.onAccountChanged_.bind(this);
    }

    onAccountChanged_() {
        this.setState({
            isSynchronizing: false
        });
    }

    componentDidMount() {
        store.on(State.accounts, this.onAccountChanged);
    }
    componentWillUnmount() {
        store.removeListener(State.accounts, this.onAccountChanged);
    }

    onFetchOperations() {
        Actions.FetchOperations();
        // Change UI to show a message indicating sync.
        this.setState({
            isSynchronizing: true
        });
    }

    render() {
        let text = this.state.isSynchronizing
                   ? <div className="last-sync"><T k='operations.syncing'>Fetching your latest bank transactions...</T></div>
                   : <div className="input-group">
                         <div className="last-sync">
                            <T k='operations.last_sync'>Last sync with your bank:</T>
                             {' ' + new Date(this.props.account.lastChecked).toLocaleString()}
                         </div>
                         <span className="input-group-btn">
                             <a className="btn btn-primary pull-right" href='#' onClick={this.onFetchOperations.bind(this)}>
                                <T k='operations.sync_now'>Sync now</T></a>
                         </span>
                     </div>;

        return <div className="panel panel-default">
                    {text}
               </div>;
    }
}

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
                    .map((o) => <OperationComponent key={o.id} operation={o} />);

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
                        size='col-xs-3'
                        backgroundColor='background-lightblue'
                        title={t('operations.current_balance') || 'Balance'}
                        subtitle={(t('operations.as_of') || 'As of') + ' ' + new Date(this.state.account.lastChecked).toLocaleDateString()}
                        operations={this.state.operations}
                        initialAmount={this.state.account.initialAmount}
                        filterFunction={(op) => true}
                    />

                    <FilteredAmountWell
                        size='col-xs-3'
                        backgroundColor='background-green'
                        title={t('operations.received') || 'Received'}
                        hasFilteredOperations={this.state.hasFilteredOperations}
                        operations={this.state.operations}
                        filteredOperations={this.state.filteredOperations}
                        initialAmount={0}
                        filterFunction={(op) => op.amount > 0}
                    />

                    <FilteredAmountWell
                        size='col-xs-3'
                        backgroundColor='background-orange'
                        title={t('operations.paid') || 'Paid'}
                        hasFilteredOperations={this.state.hasFilteredOperations}
                        operations={this.state.operations}
                        filteredOperations={this.state.filteredOperations}
                        initialAmount={0}
                        filterFunction={(op) => op.amount < 0}
                    />

                    <FilteredAmountWell
                        size='col-xs-3'
                        backgroundColor='background-darkblue'
                        title={t('operations.saved') || 'Saved'}
                        hasFilteredOperations={this.state.hasFilteredOperations}
                        operations={this.state.operations}
                        filteredOperations={this.state.filteredOperations}
                        initialAmount={0}
                        filterFunction={(op) => true}
                    />
                </div>

                <div className="operation-panel panel panel-default">
                    <div className="panel-heading">
                        <h3 className="title panel-title"><T k='operations.title'>Transactions</T></h3>
                    </div>

                    <div className="panel-body">
                        <SyncButton account={this.state.account} />
                        <SearchComponent setFilteredOperations={this.setFilteredOperations.bind(this)} operations={this.state.operations} ref='search' />
                    </div>

                    <table className="table table-striped table-hover table-bordered">
                        <thead>
                            <tr>
                                <th></th>
                                <th className="col-sm-2"><T k='operations.column_date'>Date</T></th>
                                <th className="col-sm-7"><T k='operations.column_name'>Transaction</T></th>
                                <th className="col-sm-1"><T k='operations.column_amount'>Amount</T></th>
                                <th className="col-sm-2"><T k='operations.column_category'>Category</T></th>
                            </tr>
                        </thead>
                        <tbody>
                            {ops}
                        </tbody>
                    </table>
                </div>

            </div>
        );
    }
}

