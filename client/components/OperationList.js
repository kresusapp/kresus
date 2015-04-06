// Constants
import Events from '../Events';
import {has, maybeHas, translate as t} from '../Helpers';

import {Category} from '../Models';

// Global variables
import store from '../store';

import {AmountWell, FilteredAmountWell} from './AmountWell';
import SearchComponent from './SearchOperationList';

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
        store.actions.SetOperationCategory(this.props.operation, selectedId);
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
        var op = this.props.operation;

        var rowClassName = op.amount > 0 ? "success" : "";

        var label = op.title.length < SMALL_TITLE_THRESHOLD ? op.raw + ' (' + op.title + ')' : op.title;

        if (this.state.showDetails) {
            return (
                <tr className={rowClassName}>
                    <td>
                        <a href="#" className="toggle-btn active" onClick={this.toggleDetails.bind(this)}> </a>
                    </td>
                    <td colSpan="4" className="text-uppercase">
                        <ul>
                            <li>{t('Full label:')} {op.raw}</li>
                            <li>{t('Amount:')} {op.amount}</li>
                            <li>{t('Category:')} <CategorySelectComponent operation={op} /></li>
                        </ul>
                    </td>
                </tr>
            );
        }


        // Build ammount cell. Add a download link if a file is linked to the
        // operation.
        var amountCell = null;
        if (op.binary !== null) {
          var opLink = 'operations/' + op.id + '/file/';
          amountCell = (
            <td>
              <a target="_blank" href={opLink} title={t('download bill')}>
               {op.amount}
              </a>
            </td>
          );
        } else {
          amountCell = (<td>{op.amount}</td>);
        }

        return (
            <tr className={rowClassName}>
                <td>
                    <a href="#" className="toggle-btn" onClick={this.toggleDetails.bind(this)}> </a>
                </td>
                <td>{op.date.toLocaleDateString()}</td>
                <td className="text-uppercase">{label}</td>
                {amountCell}
                <td><CategorySelectComponent operation={op} /></td>
            </tr>
        );
    }
}

export default class OperationsComponent extends React.Component {

    constructor() {
        this.state = {
            loaded: false,
            account: null,
            operations: [],
            filteredOperations: [],
            isSynchronizing: false,
            hasFilteredOperations: false
        }
        this.operationListener = this._operationListener.bind(this);
        this.accountListener = this._accountListener.bind(this);
    }

    _operationListener() {
        this.setState({
            account: store.getCurrentAccount(),
            operations: store.getCurrentOperations(),
            isSynchronizing: false
        }, () => this.refs.search.filter());
    }

    _accountListener() {
        this.setState({
            account: store.getCurrentAccount(),
            loaded: true
        });
    }

    componentDidMount() {
        store.subscribeMaybeGet(Events.state.operations, this.operationListener);
        store.subscribeMaybeGet(Events.state.accounts, this.accountListener);
    }

    componentWillUnmount() {
        store.removeListener(Events.state.operations, this.operationListener);
        store.removeListener(Events.state.accounts, this.accountListener);
    }

    onFetchOperations() {
        store.actions.FetchOperations();
        // Change UI to show a message indicating sync.
        this.setState({
            isSynchronizing: true
        });
    }

    setFilteredOperations(operations) {
        this.setState({
            filteredOperations: operations,
            hasFilteredOperations: operations.length < this.state.operations.length
        });
    }

    render() {
        if (!this.state.loaded) {
            return (
                <div className="top-panel panel panel-default">
                    <div className="panel-heading">
                        <h3 className="title panel-title">{t('kresus-init-please-wait')}</h3>
                    </div>

                    <div className="panel-body">
                        <h3>{t('kresus-loading')}</h3>
                    </div>
                </div>
            );
        }

        // If there's no account set, just show a message indicating to go to
        // the settings.
        if (this.state.account === null) {
            return (
                <div className="top-panel panel panel-default">
                    <div className="panel-heading">
                        <h3 className="title panel-title">{t('Ohnoes!')}</h3>
                    </div>

                    <div className="panel-body">
                        <h3>{t('no-account-set')}</h3>
                    </div>
                </div>
            );
        }

        var ops = this.state.filteredOperations.map((o) => <OperationComponent key={o.id} operation={o} />);

        var syncText = this.state.isSynchronizing
                       ? <div className="last-sync">Fetching your latest bank transactions...</div>
                       : <div className="input-group">
                             <div className="last-sync">
                                 {t('Last synchronization with your bank:')}
                                 {' ' + new Date(this.state.account.lastChecked).toLocaleString()}
                             </div>
                             <span className="input-group-btn">
                                 <a className="btn btn-primary pull-right" href='#' onClick={this.onFetchOperations.bind(this)}>{t('Synchronize now')}</a>
                             </span>
                         </div>

        return (
            <div>
                <div className="row operation-wells">

                    <AmountWell
                        size='col-xs-3'
                        backgroundColor='background-lightblue'
                        title={t('Current Balance')}
                        subtitle={t('As of') + ' ' + new Date(this.state.account.lastChecked).toLocaleDateString()}
                        operations={this.state.operations}
                        initialAmount={this.state.account.initialAmount}
                        filterFunction={(op) => true}
                    />

                    <FilteredAmountWell
                        size='col-xs-3'
                        backgroundColor='background-green'
                        title={t('Received')}
                        hasFilteredOperations={this.state.hasFilteredOperations}
                        operations={this.state.operations}
                        filteredOperations={this.state.filteredOperations}
                        initialAmount={0}
                        filterFunction={(op) => op.amount > 0}
                    />

                    <FilteredAmountWell
                        size='col-xs-3'
                        backgroundColor='background-orange'
                        title={t('Paid')}
                        hasFilteredOperations={this.state.hasFilteredOperations}
                        operations={this.state.operations}
                        filteredOperations={this.state.filteredOperations}
                        initialAmount={0}
                        filterFunction={(op) => op.amount < 0}
                    />

                    <FilteredAmountWell
                        size='col-xs-3'
                        backgroundColor='background-darkblue'
                        title={t('Saved')}
                        hasFilteredOperations={this.state.hasFilteredOperations}
                        operations={this.state.operations}
                        filteredOperations={this.state.filteredOperations}
                        initialAmount={0}
                        filterFunction={(op) => true}
                    />
                </div>

                <div className="operation-panel panel panel-default">
                    <div className="panel-heading">
                        <h3 className="title panel-title">{t('Transactions')}</h3>
                    </div>

                    <div className="panel-body">
                        <div className="panel panel-default">
                            {syncText}
                        </div>

                        <SearchComponent setFilteredOperations={this.setFilteredOperations.bind(this)} operations={this.state.operations} ref='search' />
                    </div>

                    <table className="table table-striped table-hover table-bordered">
                        <thead>
                            <tr>
                                <th></th>
                                <th>{t('Date')}</th>
                                <th>{t('Operation')}</th>
                                <th>{t('Amount')}</th>
                                <th>{t('Category')}</th>
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

