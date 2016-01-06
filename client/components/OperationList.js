import {has, assert, maybeHas, translate as $t} from '../helpers';
import {Category} from '../models';

import {Actions, store, State} from '../store';
import {MaybeHandleSyncError} from '../errors';

import {AmountWell, FilteredAmountWell} from './AmountWell';
import SearchComponent from './SearchOperationList';
import CategorySelectComponent from './CategorySelectComponent';
import OperationTypeSelectComponent from './OperationTypeSelectComponent';
import DisplayOptions from './DisplayOptions';
// If the length of the short label (of an operation) is smaller than this
// threshold, the raw label of the operation will be displayed in lieu of the
// short label, in the operations list.
// TODO make this a parameter in settings To add in Display Options
const SMALL_TITLE_THRESHOLD = 4;
// Components
function ComputeAttachmentLink(op) {
    let file = op.binary.fileName || 'file';
    return `operations/${op.id}/`+file;
}

class LabelComponent extends React.Component {
    constructor(props) {
        has(props, 'operation');
        super(props);
        this.state = {
            editMode: false
        };
    }

    buttonLabel() {
        assert(false, "buttonLabel() must be implemented by the subclasses!");
    }

    dom() {
        return this.refs.customlabel.getDOMNode();
    }

    switchToEditMode() {
        this.setState({ editMode: true }, () => {
            this.dom().focus();
            // Set the cursor at the end
            this.dom().selectionStart = (this.dom().value || '').length;
        });
    }
    switchToStaticMode() {
        this.setState({ editMode: false });
    }

    onBlur() {
        let customLabel = this.dom().value;
        if (customLabel) {
            // If the new non empty customLabel value is different from the current one, save it.
            if (customLabel.trim() !== this.defaultValue() && customLabel.trim().length) {
                Actions.SetCustomLabel(this.props.operation, customLabel);
                // Be optimistic
                this.props.operation.customLabel = customLabel;
            }
        } else if (this.props.operation.customLabel && this.props.operation.customLabel.length) {
                // If the new customLabel value is empty and there was already one, unset it.
                Actions.SetCustomLabel(this.props.operation, '');
                // Be optimistic
                this.props.operation.customLabel = null;
            }
        this.switchToStaticMode();
    }

    onKeyUp(e) {
        if (e.key === 'Enter') {
            this.onBlur();
        } else if (e.key === 'Escape') {
            this.switchToStaticMode();
        }
    }

    defaultValue() {
        let op = this.props.operation;

        let customLabel = op.customLabel;
        if (customLabel !== null && customLabel.trim().length) {
            return customLabel;
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
        return label;
    }

    render() {
        if (!this.state.editMode) {
            return (
                <button
                  className="form-control text-left btn-transparent"
                  id={this.props.operation.id}
                  onClick={this.switchToEditMode.bind(this)}>
                    {this.buttonLabel()}
                </button>
            );
        }
        return (
            <input className="form-control"
              type="text"
              ref='customlabel'
              id={this.props.operation.id}
              defaultValue={this.defaultValue()}
              onBlur={this.onBlur.bind(this)}
              onKeyUp={this.onKeyUp.bind(this)}
            />
        );
    }
}

class DetailedViewLabelComponent extends LabelComponent {
    constructor(props) {
        has(props, 'operation');
        super(props);
    }

    buttonLabel() {
        let customLabel = this.props.operation.customLabel;
        if (customLabel === null || customLabel.trim().length === 0) {
            return (
                <em className="text-muted">
                    {$t('client.operations.add_custom_label')}
                </em>
            );
        }
        return <div className="label-button">{customLabel}</div>;
    }
}

class OperationListViewLabelComponent extends LabelComponent {
    constructor(props) {
        has(props, 'operation');
        has(props, 'maybeIcon');
        super(props);
    }

    buttonLabel() {
        return <div className="label-button text-uppercase">{this.defaultValue()}</div>;
    }

    render() {
        if (typeof this.props.maybeIcon === 'undefined') {
            return super.render();
        }
        return (
            <div className="input-group">
                { this.props.maybeIcon }
                { super.render() }
            </div>
        );
    }
}

class OperationDetails extends React.Component {
    constructor(props) {
        has(props, 'toggleDetails');
        has(props, 'operation');
        has(props, 'rowClassName');
        super(props);
    }

    onSelectOperationType(id) {
        Actions.SetOperationType(this.props.operation, id);
        this.props.operation.operationTypeID = id;
    }

    onSelectCategory(id) {
        Actions.SetOperationCategory(this.props.operation, id);
        this.props.operation.categoryId = id;
    }

    render() {
        let op = this.props.operation;

        let maybeAttachment = '';
        if (op.binary !== null) {
            let opLink = ComputeAttachmentLink(op);
            maybeAttachment = <span>
                <a href={opLink} target="_blank">
                    <span className="glyphicon glyphicon-file"></span>
                    {$t('client.operations.attached_file')}
                </a>
            </span>;
        } else if (op.attachments && op.attachments.url !== null) {
            maybeAttachment = <span>
                <a href={op.attachments.url} target="_blank">
                    <span className="glyphicon glyphicon-file"></span>
                    {$t('client.' + op.attachments.linkTranslationKey)}
                </a>
            </span>;
        }

        return <tr className={this.props.rowClassName}>
            <td>
                <a href="#" onClick={this.props.toggleDetails}>
                    <i className="fa fa-minus-square"></i>
                </a>
            </td>
            <td colSpan="5" className="text-uppercase">
                <ul>
                    <li>
                        {$t('client.operations.full_label')}
                        {op.raw}
                    </li>
                    <li className="form-inline">
                        {$t('client.operations.custom_label')}
                        <DetailedViewLabelComponent operation={op} />
                    </li>
                    <li>
                        {$t('client.operations.amount')}
                        {op.amount}</li>
                    <li className="form-inline">
                        {$t('client.operations.type')}
                        <OperationTypeSelectComponent
                          operation={op}
                          onSelectId={this.onSelectOperationType.bind(this)}
                        />
                    </li>
                    <li className="form-inline">
                        {$t('client.operations.category')}
                        <CategorySelectComponent
                          operation={op}
                          onSelectId={this.onSelectCategory.bind(this)}
                        />
                    </li>
                    {maybeAttachment}
                </ul>
            </td>
        </tr>;
    }
}

class OperationComponent extends React.Component {

    constructor(props) {
        has(props, 'visible')
        super(props);
        this.state = {
            showDetails: false
        };
    }

    toggleDetails(e) {
        this.setState({ showDetails: !this.state.showDetails});
        e.preventDefault();
    }

    onSelectOperationType(id) {
        Actions.SetOperationType(this.props.operation, id);
        this.props.operation.operationTypeID = id;
    }

    onSelectCategory(id) {
        Actions.SetOperationCategory(this.props.operation, id);
        this.props.operation.categoryId = id;
    }

    render() {
        if (!this.props.visible)
            return <tr />;
        let op = this.props.operation;

        let rowClassName = op.amount > 0 ? "success" : "";

        if (this.state.showDetails) {
            return <OperationDetails
                     toggleDetails={this.toggleDetails.bind(this)}
                     operation={op}
                     rowClassName={rowClassName} />;
        }
        //Add an icon if the operation is a future operation
        let futureIcon = op.isFuture ?
            <i className = "fa fa-hourglass-start" aria-label='Future operation' title={ $t('client.operations.future_operation') }></i> 
            : '';
        // Add a link to the attached file, if there is any.
        let link;
        if (op.binary !== null) {
            let opLink = ComputeAttachmentLink(op);
            link = (
                <a
                  target="_blank"
                  href={opLink}
                  title={$t('client.operations.attached_file')}>
                    <span className="glyphicon glyphicon-file" aria-hidden="true"></span>
                </a>
            );
        } else if (op.attachments && op.attachments.url !== null) {
            link = (
                <a href={op.attachments.url} target="_blank">
                    <span className="glyphicon glyphicon-link"></span>
                    {$t('client.' + op.attachments.linkTranslationKey)}
                </a>
            );
        }
        let maybeIcon;
        if (link || futureIcon) {
            maybeIcon =
            <label htmlFor={op.id} className="input-group-addon box-transparent">
                {futureIcon}{link}
            </label>;
        }
        return (
            <tr className={rowClassName}>
                <td>
                    <a href="#" onClick={this.toggleDetails.bind(this)}>
                        <i className="fa fa-plus-square"></i>
                    </a>
                </td>
                <td>{op.date.toLocaleDateString()}</td>
                <td>
                    <OperationTypeSelectComponent
                      operation={op}
                      onSelectId={this.onSelectOperationType.bind(this)}
                    />
                </td>
                <td>
                    <OperationListViewLabelComponent operation={op} maybeIcon={maybeIcon} />
                </td>
                <td>{op.amount}</td>
                <td>
                    <CategorySelectComponent
                      operation={op}
                      onSelectId={this.onSelectCategory.bind(this)}
                    />
                </td>
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
    }

    onFetchOperations() {
        store.once(State.sync, this.afterFetchOperations.bind(this));
        Actions.FetchOperations();
        // Change UI to show a message indicating sync.
        this.setState({
            isSynchronizing: true
        });
    }

    afterFetchOperations(err) {
        this.setState({
            isSynchronizing: false
        });
        MaybeHandleSyncError(err);
    }

    render() {
        let text = this.state.isSynchronizing
                   ? <div className="last-sync">
                        <span className="option-legend">
                            {$t('client.operations.syncing')}
                        </span>
                        <span className="fa fa-refresh fa-spin"></span>
                     </div>
                   : <div className="last-sync">
                        <span className="option-legend">
                            {$t('client.operations.last_sync')}
                            {' ' + new Date(this.props.account.lastChecked).toLocaleString()}
                        </span>
                        <a href='#' onClick={this.onFetchOperations.bind(this)}>
                            <span className="option-legend fa fa-refresh"></span>
                        </a>
                    </div>;

        return <div className="panel-options">
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
            hasFilteredOperations: false,
            showFutureOperations: store.getBoolSetting('showFutureOperations')
        }
        this.showMoreTimer = null;
        this.listener = this._listener.bind(this);
        this.settingsListener = this._settingsListener.bind(this);
    }

    _listener() {
        this.setState({
            account: store.getCurrentAccount(),
            operations: store.getCurrentOperations(),
            lastItemShown: SHOW_ITEMS_INITIAL,
        }, () => this.refs.search.filter());
    }

    _settingsListener() {
        this.setState({
            showFutureOperations: store.getBoolSetting('showFutureOperations')
        });
    }

    componentDidMount() {
        store.on(State.banks, this.listener);
        store.on(State.accounts, this.listener);
        store.on(State.settings, this.settingsListener);
        store.subscribeMaybeGet(State.operations, this.listener);
    }

    componentWillUnmount() {
        store.removeListener(State.banks, this.listener);
        store.removeListener(State.operations, this.listener);
        store.removeListener(State.accounts, this.listener);
        store.removeListener(State.settings, this.settingsListener);

        if (this.showMoreTimer) {
            clearTimeout(this.showMoreTimer);
            this.showMoreTimer = null;
        }
    }

    setFilteredOperations(operations) {
        let filteredFutureOperations = operations.map(op => op.isFuture || !this.state.showFutureOperations);
        this.setState({
            filteredOperations: filteredFutureOperations,
            hasFilteredOperations: filteredFutureOperations.length < this.state.filteredFutureOperations.length,
            lastItemShown: SHOW_ITEMS_INITIAL
        });
    }

    render() {
        // Edge case: the component hasn't retrieved the account yet.
        if (this.state.account === null) {
            return <div/>
        }

        let ops = this.state.filteredOperations
                    .map((o, i) => <OperationComponent key={ o.id } operation={ o } visible={ i <= this.state.lastItemShown }/>);
        let lastChecked = this.state.account.lastChecked;
        let showFutureOperations = this.state.showFutureOperations;
        let oldestOperationDate = this.state.filteredOperations[0] ?
            this.state.filteredOperations[0].date:
            0;
        let balanceDate = showFutureOperations ?
            //We only consider the first date of the filtered operations, as they are sorted -date
            Math.max(lastChecked, oldestOperationDate) :
            lastChecked;
        balanceDate = new Date(balanceDate).toLocaleDateString();
        let maybeShowMore = () => {

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
                        subtitle={`${$t('client.operations.as_of')} ${balanceDate}`}
                        operations={this.state.operations}
                        initialAmount={this.state.account.initialAmount}
                        filterFunction={ op => true }
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
                        filterFunction={ op => op.amount > 0 }
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
                        filterFunction={ op => op.amount < 0 }
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
                        filterFunction={ op => true }
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
                        <DisplayOptions
                          ref='display-options'
                        />
                        <SearchComponent
                          setFilteredOperations={this.setFilteredOperations.bind(this)}
                          operations={this.state.operations}
                          ref='search'
                        />
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
