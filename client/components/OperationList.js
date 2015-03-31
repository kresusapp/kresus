// Constants
import Events from '../Events';
import {has, maybeHas, translate as t} from '../Helpers';

import {Category} from '../Models';

// Global variables
import store from '../store';
import flux from '../flux/dispatcher';

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
        flux.dispatch({
            type: Events.user.updated_category_of_operation,
            operationId: this.props.operation.id,
            categoryId: selectedId
        });
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
        var options = store.categories.map((c) => <option key={c.id} value={c.id}>{c.title}</option>);

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

export default class OperationsComponent extends React.Component {

    constructor() {
        this.state = {
            account: null,
            operations: [],
            filteredOperations: [],
            isSynchronizing: false,
            hasFilteredOperations: false
        }
        this.listener = this._listener.bind(this);
    }

    _listener() {
        this.setState({
            account: store.getCurrentAccount(),
            operations: store.getCurrentOperations(),
            isSynchronizing: false
        }, () => this.refs.search.filter());
    }

    componentDidMount() {
        store.subscribeMaybeGet(Events.state.operations, this.listener);
    }

    componentWillUnmount() {
        store.removeListener(Events.state.operations, this.listener);
    }

    getTotal() {
        var total = this.state.operations.reduce((a,b) => a + b.amount,
                                                 this.state.account.initialAmount);
        return (total * 100 | 0) / 100;
    }

    FilterOperationsThisMonth(operations) {
        var now = new Date();
        return operations.filter(function(op) {
            var d = new Date(op.date);
            return d.getFullYear() == now.getFullYear() && d.getMonth() == now.getMonth()
        });
    }

    getPositive() {
        var total = this.FilterOperationsThisMonth(this.state.operations)
                        .filter(function(v) { return v.amount > 0 })
                        .reduce(function(a,b) { return a + b.amount; }, 0);
        return (total * 100 | 0) / 100;
    }

    getNegative() {
        var total = this.FilterOperationsThisMonth(this.state.operations)
                        .filter(function(v) { return v.amount < 0 })
                        .reduce(function(a,b) { return a + b.amount; }, 0);
        return (total * 100 | 0) / 100;
    }

    getDiff() {
        var total = this.FilterOperationsThisMonth(this.state.operations)
                        .reduce(function(a,b) { return a + b.amount} , 0);
        return (total * 100 | 0) / 100;
    }

    getPositiveSearch() {
        var total = this.state.filteredOperations
                        .filter(function(v) { return v.amount > 0 })
                        .reduce(function(a,b) { return a + b.amount; }, 0);
        return (total * 100 | 0) / 100;
    }

    getNegativeSearch() {
        var total = this.state.filteredOperations
                        .filter(function(v) { return v.amount < 0 })
                        .reduce(function(a,b) { return a + b.amount; }, 0);
        return (total * 100 | 0) / 100;
    }

    getDiffSearch() {
        var total = this.state.filteredOperations
                        .reduce(function(a,b) { return a + b.amount} , 0);
        return (total * 100 | 0) / 100;
    }

    onFetchOperations() {
        flux.dispatch({
            type: Events.user.fetched_operations
        });

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
                    <div className="col-xs-3">
                        <div className="well background-lightblue">
                            <span className="operation-amount">{this.getTotal()} €</span><br/>
                            <span className="well-title">{t('Current Balance')}</span><br/>
                            <span className="well-sub">{t('As of')} {new Date(this.state.account.lastChecked).toLocaleDateString()}</span>
                        </div>
                    </div>

                    <div className="col-xs-3">
                        <div className="well background-green">
                            <span className="operation-amount">{
                                this.state.hasFilteredOperations
                                ? this.getPositiveSearch()
                                : this.getPositive()
                            } €</span><br/>
                            <span className="well-title">{t('Received')}</span><br/>
                            <span className="well-sub">{
                                this.state.hasFilteredOperations
                                ? t('For this search')
                                : t('This month')
                            }</span>
                        </div>
                    </div>

                    <div className="col-xs-3">
                        <div className="well background-orange">
                            <span className="operation-amount">{
                                this.state.hasFilteredOperations
                                ? this.getNegativeSearch()
                                : this.getNegative()
                            } €</span><br/>
                            <span className="well-title">{t('Paid')}</span><br/>
                            <span className="well-sub">{
                                this.state.hasFilteredOperations
                                ? t('For this search')
                                : t('This month')
                            }</span>
                        </div>
                    </div>

                    <div className="col-xs-3">
                        <div className="well background-darkblue">
                            <span className="operation-amount">{
                                this.state.hasFilteredOperations
                                ? this.getDiffSearch()
                                : this.getDiff()
                            } €</span><br/>
                            <span className="well-title">{t('Saved')}</span><br/>
                            <span className="well-sub">{
                                this.state.hasFilteredOperations
                                ? t('For this search')
                                : t('This month')
                            }</span>
                        </div>
                    </div>
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

