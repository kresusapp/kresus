// Constants
import {has, assert, maybeHas, translate as t, DEFAULT_TYPE_LABELS} from '../Helpers';

import {Category} from '../Models';

// Global variables
import {Actions, store, State} from '../store';

import {AmountWell, FilteredAmountWell} from './AmountWell';
import SearchComponent from './SearchOperationList';
import CategorySelectComponent from './CategorySelectComponent';
import OperationTypeSelectComponent from './OperationTypeSelectComponent';
import T from './Translated';

import {MaybeHandleSyncError} from '../errors';

// If the length of the short label (of an operation) is smaller than this
// threshold, the raw label of the operation will be displayed in lieu of the
// short label, in the operations list.
// TODO make this a parameter in settings
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
            return <em className="text-muted">{t('client.operations.add_custom_label') || "Add custom label"}</em>;
        }
        return <div className="label-button">{customLabel}</div>;
    }
}

class OperationListViewLabelComponent extends LabelComponent {
    constructor(props) {
        has(props, 'operation');
        has(props, 'link');
        super(props);
    }

    buttonLabel() {
        return <div className="label-button text-uppercase">{this.defaultValue()}</div>;
    }

    render() {
        if (typeof this.props.link === 'undefined') {
            return super.render();
        }
        return (
            <div className="input-group">
                { this.props.link }
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
        this.props.operation.type = id;
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
                    <T k="client.operations.attached_file">Download the attached file</T>
                </a>
            </span>;
        } else if (op.attachments && op.attachments.url !== null) {
            maybeAttachment = <span>
                <a href={op.attachments.url} target="_blank">
                    <span className="glyphicon glyphicon-file"></span>
                    <T k={'client.' + op.attachments.linkTranslationKey}>{op.attachments.linkPlainEnglish}</T>
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
                    <li><T k='client.operations.full_label'>Full label:</T> {op.raw}</li>
                    <li className="form-inline">
                      <T k='client.operations.custom_label'>Custom Label:</T>
                      <DetailedViewLabelComponent operation={op} />
                    </li>
                    <li><T k='client.operations.amount'>Amount:</T> {op.amount}</li>
                    <li className="form-inline">
                        <T k='client.operations.type'>Type:</T>
                        <OperationTypeSelectComponent
                          operation={op}
                          onSelectId={this.onSelectOperationType.bind(this)}
                        />
                    </li>
                    <li className="form-inline">
                        <T k='client.operations.category'>Category:</T>
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
        this.props.operation.type = id;
    }

    onSelectCategory(id) {
        Actions.SetOperationCategory(this.props.operation, id);
        this.props.operation.categoryId = id;
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

        // Add a link to the attached file, if there is any.
        let link;
        if (op.binary !== null) {
            let opLink = ComputeAttachmentLink(op);
            link= <label for={op.id} className="input-group-addon box-transparent">
                    <a target="_blank" href={opLink} title={t('client.operations.attached_file') || 'download attached file'}>
                        <span className="glyphicon glyphicon-file" aria-hidden="true"></span>
                    </a>
                  </label>;
        } else if (op.attachments && op.attachments.url !== null) {
            maybeAttachment = <span>
                <a href={op.attachments.url} target="_blank">
                    <span className="glyphicon glyphicon-link"></span>
                    <T k={'client.' + op.attachments.linkTranslationKey}>{op.attachments.linkPlainEnglish}</T>
                </a>
            </span>;
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
                <td><OperationListViewLabelComponent operation={op} link={link} /></td>
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
                            <T k='client.operations.syncing'>Fetching your latest bank transactions...</T>
                        </span>
                        <span className="fa fa-refresh fa-spin"></span>
                     </div>
                   : <div className="last-sync">
                        <span className="option-legend">
                            <T k='client.operations.last_sync'>Last sync:</T>
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
                        size='col-xs-12 col-md-3'
                        backgroundColor='background-lightblue'
                        icon='balance-scale'
                        title={t('client.operations.current_balance') || 'Balance'}
                        subtitle={(t('client.operations.as_of') || 'As of') + ' ' + new Date(this.state.account.lastChecked).toLocaleDateString()}
                        operations={this.state.operations}
                        initialAmount={this.state.account.initialAmount}
                        filterFunction={(op) => true}
                    />

                    <FilteredAmountWell
                        size='col-xs-12 col-md-3'
                        backgroundColor='background-green'
                        icon='arrow-down'
                        title={t('client.operations.received') || 'Received'}
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
                        title={t('client.operations.paid') || 'Paid'}
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
                        title={t('client.operations.saved') || 'Saved'}
                        hasFilteredOperations={this.state.hasFilteredOperations}
                        operations={this.state.operations}
                        filteredOperations={this.state.filteredOperations}
                        initialAmount={0}
                        filterFunction={(op) => true}
                    />
                </div>

                <div className="operation-panel panel panel-default">
                    <div className="panel-heading">
                        <h3 className="title panel-title"><T k='client.operations.title'>Transactions</T></h3>
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
                                    <th className="col-sm-1"><T k='client.operations.column_date'>Date</T></th>
                                    <th className="col-sm-2"><T k='client.operations.column_type'>Type</T></th>
                                    <th className="col-sm-6"><T k='client.operations.column_name'>Transaction</T></th>
                                    <th className="col-sm-1"><T k='client.operations.column_amount'>Amount</T></th>
                                    <th className="col-sm-2"><T k='client.operations.column_category'>Category</T></th>
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
