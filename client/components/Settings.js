// Constants
import {debug, has, assert, translate as t} from '../Helpers';

import packageConfig from '../../package.json';

// Global variables
import {Actions, store, State} from '../store';
import {MaybeHandleSyncError} from '../errors';

import ConfirmDeleteModal from './ConfirmDeleteModal';
import ImportModule from './ImportModule';
import Modal from './Modal';
import NewBankForm from './NewBankForm';
import CustomBankField from './CustomBankField';
import {OpCatChartTypeSelect, OpCatChartPeriodSelect} from './Charts';
import T from './Translated';

class Account extends React.Component {

    constructor(props) {
        super(props);
        this.listener = this._listener.bind(this);
    }

    _listener() {
        this.forceUpdate();
    }

    componentDidMount() {
        store.on(State.settings, this.listener);
    }

    componentWillUnmount() {
        store.removeListener(State.settings, this.listener);
    }

    onDelete(id) {
        Actions.DeleteAccount(this.props.account);
    }

    setAsDefault() {        
        Actions.ChangeSetting('defaultAccountId', this.props.account.id);
    }

    render() {
        let a = this.props.account;
        let label = a.iban ? `${a.title} (IBAN: ${a.iban})` : a.title;
        let setDefaultAccountTitle;
        let selected;

        if (store.getDefaultAccountId() === this.props.account.id) {
            setDefaultAccountTitle = "";
            selected = "fa-star";
        }
        else {
            setDefaultAccountTitle = t("settings.set_default_account") || "Set as default account";
            selected = "fa-star-o";
        }

        return <tr>
            <td>
                <span className={"clickable fa " + selected}
                    aria-hidden="true"
                    onClick={this.setAsDefault.bind(this)}
                    title={setDefaultAccountTitle}>
                </span>
            </td>
            <td>{label}</td>
            <td>
                <span className="pull-right fa fa-times-circle" aria-label="remove"
                    data-toggle="modal"
                    data-target={'#confirmDeleteAccount' + a.id}
                    title={t("settings.delete_account_button") || "Delete account"}>
                </span>

                <ConfirmDeleteModal
                    modalId={'confirmDeleteAccount' + a.id}
                    modalBody={t('settings.erase_account', {title: a.title}) ||
                        `This will erase the "${a.title}" account, and all its
                        transactions. If this is the last account bound to
                        this bank, the bank will be erased as well. Are you
                        sure about this?`
                    }
                    onDelete={this.onDelete.bind(this)}
                />
            </td>
        </tr>;
    }
}

class EditAccessModal extends React.Component {

    onSubmit(event) {
        event.preventDefault();

        let newPassword = this.refs.password.getDOMNode().value.trim();
        let customFields;
        if (!newPassword || !newPassword.length) {
            alert(t("editaccessmodal.not_empty") || "Please fill the password field");
            return;
        }

        if (this.props.customFields) {
            customFields = this.props.customFields.map((field, index) => this.refs["customField" + index].getValue());
            if (customFields.some(f => !f.value)) {
                alert(t("editaccessmodal.customFields_not_empty") || "Please fill all the custom fields");
                return;
            }
        }

        this.props.onSave(newPassword, customFields);
        this.refs.password.getDOMNode().value = '';

        $("#" + this.props.modalId).modal('hide');
    }

    constructor(props) {
        has(props, "modalId");
        super(props);
    }

    componentDidMount() {
        $('#' + this.props.modalId).on('shown.bs.modal', () => {
            this.refs.password.getDOMNode().focus();
        });
    }

    render() {
        let customFields;

        if (this.props.customFields) {
            customFields = this.props.customFields.map((field, index) =>
                <CustomBankField ref={"customField" + index} params={field} />
            );
        }

        let modalTitle = <T k="editaccessmodal.title">Edit bank access</T>;

        let modalBody = <div>
            <T k="editaccessmodal.body">
                If your bank password changed, you need to update it in Kresus
                so that the bank link keeps on syncing operations from your
                bank account.
            </T>

            <form id={this.props.modalId + "-form"} className="form-group" onSubmit={this.onSubmit.bind(this)}>
                <div className="form-group">
                    <label htmlFor="password"><T k='settings.password'>Password</T></label>
                    <input type="password" className="form-control" id="password" ref="password" />
                </div>
                {customFields}
            </form>
        </div>;

        let modalFooter = <div>
            <button type="button" className="btn btn-default" data-dismiss="modal">
                <T k='editaccessmodal.cancel'>Cancel</T>
            </button>
            <button type="submit" form={this.props.modalId + "-form"} className="btn btn-success">
                <T k='editaccessmodal.save'>Save</T>
            </button>
        </div>;

        return <Modal modalId={this.props.modalId}
                      modalTitle={modalTitle}
                      modalBody={modalBody}
                      modalFooter={modalFooter}
               />;
    }
}

class BankAccounts extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            accounts: []
        };
        this.listener = this._listener.bind(this);
    }

    _listener() {
        this.setState({
            accounts: store.getBankAccounts(this.props.bank.id)
        });
    }

    componentDidMount() {
        store.subscribeMaybeGet(State.accounts, this.listener);
    }

    componentWillUnmount() {
        store.removeListener(State.accounts, this.listener);
    }

    onDeleteBank() {
        Actions.DeleteBank(this.props.bank);
    }

    onUpdateBank() {
        if (this.state.accounts && this.state.accounts.length) {
            store.once(State.sync, MaybeHandleSyncError);
            Actions.FetchAccounts(this.props.bank, this.state.accounts[0]);
        }
    }

    onChangePassword(password, customFields) {
        if (this.state.accounts && this.state.accounts.length) {
            Actions.UpdateAccess(this.state.accounts[0], password, customFields);
        }
    }

    render() {
        var accounts = this.state.accounts.map((acc) => <Account key={acc.id} account={acc} />);

        var b = this.props.bank;

        return <div className="top-panel panel panel-default">
                    <div className="panel-heading">
                        <h3 className="title panel-title">{this.props.bank.name}</h3>

                        <div className="panel-options">
                            <span className="option-legend fa fa-refresh" aria-label="reload accounts"
                                onClick={this.onUpdateBank.bind(this)}
                                title={t("settings.reload_accounts_button") || "Reload accounts"}>
                            </span>

                            <span className="option-legend fa fa-cog" aria-label="change password"
                                data-toggle="modal"
                                data-target={'#changePasswordBank' + b.id}
                                title={t("settings.change_password_button") || "Edit bank access"}>
                            </span>

                            <span className="option-legend fa fa-times-circle" aria-label="remove"
                                data-toggle="modal"
                                data-target={'#confirmDeleteBank' + b.id}
                                title={t("settings.delete_bank_button") || "Delete bank"}>
                            </span>
                        </div>
                    </div>

                <ConfirmDeleteModal
                    modalId={'confirmDeleteBank' + b.id}
                    modalBody={t('settings.erase_bank', {name: b.name}) ||
                    `This will erase the "${b.name}" bank, and all its
                    associated accounts and transactions. Are you sure
                    about this?`}
                    onDelete={this.onDeleteBank.bind(this)}
                />

                <EditAccessModal
                    modalId={'changePasswordBank' + b.id}
                    customFields={b.customFields}
                    onSave={this.onChangePassword.bind(this)}
                />

                <table className="table bank-accounts-list">
                    <thead>
                        <tr>
                            <th></th>
                            <th><T k='settings.column_account_name'>Name</T></th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {accounts}
                    </tbody>
                </table>
            </div>;
    }
}

class BankAccountsList extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            banks: []
        };
        this.listener = this._listener.bind(this);
    }

    _listener() {
        this.setState({
            banks: store.getBanks()
        });
    }

    componentDidMount() {
        store.subscribeMaybeGet(State.banks, this.listener);
    }

    componentWillUnmount() {
        store.removeListener(State.banks, this.listener);
    }

    render() {
        var banks = this.state.banks.map((bank) => <BankAccounts key={bank.id} bank={bank} />);

        return <div>
            <NewBankForm expanded={false} />
            <div>
                {banks}
            </div>
        </div>;
    }
}

class DefaultParameters extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            duplicateThreshold: store.getSetting('duplicateThreshold'),
            defaultChartType:   store.getSetting('defaultChartType'),
            defaultChartPeriod: store.getSetting('defaultChartPeriod')
        };
    }

    onDuplicateThresholdChange() {
        let val = this.refs.duplicateThreshold.getDOMNode().value;
        Actions.ChangeSetting('duplicateThreshold', val);
        this.setState({
            duplicateThreshold: val
        });
        return true;
    }

    onDefaultOpCatKindChange() {
        let val = this.refs.defaultChartType.getValue();
        Actions.ChangeSetting('defaultChartType', val);
        this.setState({
            defaultChartType: val
        });
        return true;
    }

    onDefaultOpCatPeriodChange() {
        let val = this.refs.defaultChartPeriod.getValue();
        Actions.ChangeSetting('defaultChartPeriod', val);
        this.setState({
            defaultChartPeriod: val
        });
        return true;
    }

    render() {
       return (
       <form className="form-horizontal">

        <div className="form-group">
            <label htmlFor="duplicateThreshold" className="col-xs-4 control-label">
                <T k='settings.duplicate_threshold'>Duplication threshold</T>
            </label>
            <div className="col-xs-8">
                <input id="duplicateThreshold" ref="duplicateThreshold" type="number" className="form-control"
                    min="0" step="1"
                    value={this.state.duplicateThreshold} onChange={this.onDuplicateThresholdChange.bind(this)} />
                <span className="help-block">
                    <T k='settings.duplicate_help'>Two transactions will appear
                    in the Duplicates section if they both happen within this
                    period of time (in hours) of each other.</T>
                </span>
            </div>
        </div>

        <div className="form-group">
            <label htmlFor="defaultChartType" className="col-xs-4 control-label">
                <T k='settings.default_chart_type'>Chart: default amount type</T>
            </label>
            <div className="col-xs-8">
                <OpCatChartTypeSelect
                  defaultValue={this.state.defaultChartType}
                  onChange={this.onDefaultOpCatKindChange.bind(this)}
                  ref='defaultChartType'
                  htmlId='defaultChartType'
                />
            </div>
        </div>

        <div className="form-group">
            <label htmlFor='defaultChartPeriod' className="col-xs-4 control-label">
                <T k="settings.default_chart_period">Chart: default period</T>
            </label>
            <div className="col-xs-8">
                <OpCatChartPeriodSelect
                  defaultValue={this.state.defaultChartPeriod}
                  onChange={this.onDefaultOpCatPeriodChange.bind(this)}
                  ref='defaultChartPeriod'
                  htmlId='defaultChartPeriod'
                />
            </div>
        </div>

      </form>);
    }
}

class BackupParameters extends React.Component {

    render() {
        return <form>
            <div className="form-group">
                <label htmlFor="exportInstance" className="col-xs-4 control-label">
                    <T k='settings.export_instance'>Export Kresus instance</T>
                </label>
                <div className="col-xs-8">
                    <a download="kresus.json"
                        href="all/export"
                        id="exportInstance"
                        className="btn btn-primary">
                            <T k='settings.go_export_instance'>Export as file</T>
                    </a>
                    <span className="help-block">
                        <T k='settings.export_instance_help'>This will export the
                        instance to a JSON format that another Kresus instance can
                        import. This won't contain the passwords of your bank
                        accesses, which need to be reset manually when importing
                        data from another instance.</T>
                    </span>
                </div>
            </div>

            <div className="form-group">
                <label htmlFor="importInstance" className="col-xs-4 control-label">
                    <T k='settings.import_instance'>Import Kresus instance</T>
                </label>
                <div className="col-xs-8">
                    <ImportModule />
                    <span className="help-block">
                        <T k='settings.import_instance_help'>This will import an
                        existing instance, exported with the above button. It won't
                        try to merge any data, so please ensure that your data is
                        clean and delete any existing data with the DataBrowser, if
                        needed.</T>
                    </span>
                </div>
            </div>
        </form>;
    }
}

class WeboobParameters extends React.Component {

    constructor(props) {
        super(props);
        this.onWeboobUpdated = this._onWeboobUpdated.bind(this);
        this.state = {
            isUpdatingWeboob: false
        };
    }

    componentDidMount() {
        store.on(State.weboob, this.onWeboobUpdated);
    }
    componentWillUnmount() {
        store.removeListener(State.weboob, this.onWeboobUpdated);
    }

    onWeboobUpdate(which) {
        Actions.UpdateWeboob({
            which
        });
        this.setState({
            isUpdatingWeboob: true
        });
    }

    _onWeboobUpdated() {
        this.setState({
            isUpdatingWeboob: false
        });
    }

    render() {
        return <form>
            <div className="form-group">
                <label htmlFor="updateWeboob" className="col-xs-4 control-label">
                    <T k='settings.update_weboob'>Update weboob</T>
                </label>
                <div className="col-xs-8">
                    <button
                        id="updateWeboob"
                        className="btn btn-primary"
                        onClick={this.onWeboobUpdate.bind(this, 'modules')}
                        disabled={this.state.isUpdatingWeboob ? 'disabled' : undefined}>
                            <T k='settings.go_update_weboob'>Launch the update!</T>
                    </button>
                    <span className="help-block">
                        <T k='settings.update_weboob_help'>This will update Weboob
                        without reinstalling it from scratch.  This should be done
                        as a first step, in case fetching transactions
                        doesn't work anymore.</T>
                    </span>
                </div>
            </div>

            <div className="form-group">
                <label htmlFor="reinstallWeboob" className="col-xs-4 control-label">
                    <T k='settings.reinstall_weboob'>Reinstall weboob</T>
                </label>
                <div className="col-xs-8">
                    <button
                        id="reinstallWeboob"
                        className="btn btn-danger"
                        onClick={this.onWeboobUpdate.bind(this, 'core')}
                        disabled={this.state.isUpdatingWeboob ? 'disabled' : undefined}>
                            <T k='settings.go_reinstall_weboob'>Launch the reinstall process!</T>
                    </button>
                    <span className="help-block">
                        <T k='settings.reinstall_weboob_help'>This will entirely
                        reinstall Weboob. Note it can take up to a few minutes,
                        during which you won't be able to poll your accounts and
                        operations. Use with caution!</T>
                    </span>
                </div>
            </div>
        </form>;
    }
}

class AccountSelector extends React.Component {

    value() {
        return this.refs.selector.getDOMNode().value;
    }

    render() {
        let banks = store.getBanks();
        let accounts = [];
        for (let b of banks) {
            for (let a of store.getBankAccounts(b.id)) {
                accounts.push([a.accountNumber, `${b.name} - ${a.title}`]);
            }
        }

        let options = accounts.map(pair => <option value={pair[0]}>{pair[1]}</option>);

        return (
        <select className="form-control" ref="selector">
            {options}
        </select>
        );
    }
}

class AlertCreationModal extends React.Component {

    constructor(props) {
        has(props, 'alertType');
        has(props, 'modalId');
        has(props, 'titleTranslationKey');
        has(props, 'titleTranslationValue');
        has(props, 'sendIfText');
        super(props);
        this.state = {
            maybeLimitError: ''
        };
    }

    onSubmit() {

        // Validate data
        let limitDom = this.refs.limit.getDOMNode();
        let limit = parseFloat(limitDom.value);
        if (limit !== limit) {
            this.setState({
                maybeLimitError: t("settings.emails.invalid_limit") || "Limit value is invalid."
            });
            return;
        }

        // Actually submit the form
        let newAlert = {
            type: this.props.alertType,
            limit,
            order: this.refs.selector.getDOMNode().value,
            bankAccount: this.refs.account.value(),
        };

        Actions.CreateAlert(newAlert);

        $(`#${this.props.modalId}`).modal('toggle');

        // Clear form and errors
        limitDom.value = 0;
        if (this.state.maybeLimitError.length) {
            this.setState({ maybeLimitError: '' });
        }
    }

    render() {
        let modalTitle = <T k={this.props.titleTranslationKey}>{this.props.titleTranslationValue}</T>;

        let modalBody = <div>
            <div className="form-group">
                <label htmlFor="account"><T k='settings.emails.account'>Account</T></label>
                <AccountSelector ref="account" id="account" />
            </div>

            <div className="form-group">
                <span>{this.props.sendIfText}&nbsp;</span>

                <select className="form-control" ref="selector">
                    <option value="gt">{t('settings.emails.greater_than') || 'greater than'}</option>
                    <option value="lt">{t('settings.emails.less_than') || 'less than'}</option>
                </select>
            </div>

            <div className="form-group">
                <span className="text-danger">{this.state.maybeLimitError}</span>
                <input type="number" ref="limit" className="form-control" defaultValue="0" />
            </div>
        </div>;

        let modalFooter = <div>
            <button type="button" className="btn btn-default" data-dismiss="modal">
                <T k='settings.emails.cancel'>Cancel</T>
            </button>
            <button type="button" className="btn btn-success" onClick={this.onSubmit.bind(this)}>
                <T k='settings.emails.create'>Create</T>
            </button>
        </div>;

        return <Modal modalId={this.props.modalId}
                      modalTitle={modalTitle}
                      modalBody={modalBody}
                      modalFooter={modalFooter}
               />;
    }
}

class AlertItem extends React.Component {

    constructor(props) {
        has(props, "alert");
        has(props, "account");
        has(props, "sendIfText");
        super(props);
        this.onSelectChange = this.onSelectChange.bind(this);
        this.onLimitChange = this.onLimitChange.bind(this);
        this.onDelete = this.onDelete.bind(this);
    }

    onSelectChange() {
        let newValue = this.refs.selector.getDOMNode().value;
        if (newValue === this.props.alert.order)
            return;
        Actions.UpdateAlert(this.props.alert, {order: newValue});
    }

    onLimitChange() {
        let newValue = parseFloat(this.refs.limit.getDOMNode().value);
        if (newValue === this.props.alert.limit || newValue !== newValue)
            return;
        Actions.UpdateAlert(this.props.alert, {limit: newValue});
    }

    onDelete() {
        Actions.DeleteAlert(this.props.alert);
    }

    render() {
        let {account, alert} = this.props;

        assert(alert.order === 'gt' || alert.order === 'lt');

        return <tr>
            <td>{account.title}</td>
            <td>
                <div className="form-inline">
                    <span>{this.props.sendIfText}&nbsp;</span>

                    <select className="form-control"
                      defaultValue={alert.order}
                      ref="selector"
                      onChange={this.onSelectChange}
                    >
                        <option value="gt">{t('settings.emails.greater_than') || 'greater than'}</option>
                        <option value="lt">{t('settings.emails.less_than') || 'less than'}</option>
                    </select>

                    <span>&nbsp;</span>

                    <input type="number"
                      ref="limit"
                      className="form-control"
                      defaultValue={alert.limit}
                      onChange={this.onLimitChange}
                    />
                </div>
            </td>
            <td>
                <button type="button" className="btn btn-danger pull-right" aria-label="remove"
                  data-toggle="modal" data-target={'#confirmDeleteAlert' + alert.id}
                  title={t("settings.emails.delete_alert") || "Delete alert"}>
                    <span className="glyphicon glyphicon-remove" aria-hidden="true"></span>
                </button>

                <ConfirmDeleteModal
                    modalId={'confirmDeleteAlert' + alert.id}
                    modalBody={t('settings.emails.delete_alert_full_text') ||
                        `This will erase this alert and you won't receive emails and notifications
                         about it anymore. Are you sure you want to remove this alert?`
                    }
                    onDelete={this.onDelete}
                />
            </td>
        </tr>;
    }
}

class Alerts extends React.Component {

    constructor(props) {
        has(props, 'alertType');
        has(props, 'sendIfText');
        has(props, 'titleTranslationKey');
        has(props, 'titleTranslationValue');
        has(props, 'panelTitleKey');
        has(props, 'panelTitleValue');
        super(props);
        this.state = {
            alerts: store.getAlerts(this.props.alertType)
        };
        this.onAlertChange = this.onAlertChange.bind(this);
    }

    componentDidMount() {
        store.on(State.alerts, this.onAlertChange);
    }
    componentWillUnmount() {
        store.removeListener(State.alerts, this.onAlertChange);
    }

    onAlertChange() {
        this.setState({
            alerts: store.getAlerts(this.props.alertType)
        });
    }

    render() {

        let pairs = this.state.alerts;
        let items = pairs.map(pair => <AlertItem
            alert={pair.alert}
            account={pair.account}
            sendIfText={this.props.sendIfText}
        />);

        return (
        <div className="top-panel panel panel-default">
            <div className="panel-heading">
                <h3 className="title panel-title">
                    <T k={this.props.panelTitleKey}>{this.props.panelTitleValue}</T>
                </h3>

                <div className="panel-options">
                    <span className="option-legend fa fa-plus-circle" aria-label="create alert"
                        data-toggle="modal"
                        data-target={'#alert-' + this.props.alertType + '-creation'}>
                    </span>
                </div>
            </div>

            <AlertCreationModal
                modalId={'alert-' + this.props.alertType + '-creation'}
                alertType={this.props.alertType}
                titleTranslationKey={this.props.titleTranslationKey}
                titleTranslationValue={this.props.titleTranslationValue}
                sendIfText={this.props.sendIfText}
            />

            <div className="panel-body">
                <table className="table">
                    <thead>
                        <tr>
                            <th><T k='settings.emails.account'>Account</T></th>
                            <th><T k='settings.emails.details'>Details</T></th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {items}
                    </tbody>
                </table>
            </div>
        </div>
        );
    }
}

class ReportCreationModal extends React.Component {

    onSubmit() {

        let newAlert = {
            type: "report",
            bankAccount: this.refs.account.value(),
            frequency: this.refs.selector.getDOMNode().value
        };

        Actions.CreateAlert(newAlert);
    }

    render() {
        let modalTitle = <T k="settings.emails.add_report">Add a new email report</T>;

        let modalBody = <div>
            <div className="form-group">
                <label htmlFor="account"><T k='settings.emails.account'>Account</T></label>
                <AccountSelector ref="account" id="account" />
            </div>

            <div className="form-group">
                <span>{t('settings.emails.send_report') || "Send me a report with the following frequency:"}&nbsp;</span>

                <select className="form-control" ref="selector">
                    <option value="daily">{t('settings.emails.daily') || 'daily'}</option>
                    <option value="weekly">{t('settings.emails.weekly') || 'weekly'}</option>
                    <option value="monthly">{t('settings.emails.monthly') || 'monthly'}</option>
                </select>
            </div>
        </div>;

        let modalFooter = <div>
            <button type="button" className="btn btn-default" data-dismiss="modal">
                <T k='settings.emails.cancel'>Cancel</T>
            </button>
            <button type="button" className="btn btn-success" data-dismiss="modal"
              onClick={this.onSubmit.bind(this)}>
                <T k='settings.emails.create'>Create</T>
            </button>
        </div>;

        return <Modal modalId="report-creation"
                      modalTitle={modalTitle}
                      modalBody={modalBody}
                      modalFooter={modalFooter}
               />;
    }
}


class ReportItem extends React.Component {

    constructor(props) {
        super(props);
        this.onSelectChange = this.onSelectChange.bind(this);
        this.onDelete = this.onDelete.bind(this);
    }

    onSelectChange() {
        let newValue = this.refs.selector.getDOMNode().value;
        if (newValue === this.props.alert.order)
            return;
        Actions.UpdateAlert(this.props.alert, {frequency: newValue});
    }

    onDelete() {
        Actions.DeleteAlert(this.props.alert);
    }

    render() {
        let {account, alert} = this.props;

        has(alert, 'frequency');
        assert(alert.type === 'report');

        return <tr>
            <td>{account.title}</td>
            <td>
                <div className="form-inline">
                    <span>{t('settings.emails.send_report') || "Send me a report with the following frequency:"}&nbsp;</span>

                    <select className="form-control"
                      defaultValue={alert.frequency}
                      ref="selector"
                      onChange={this.onSelectChange}
                    >
                        <option value="daily">{t('settings.emails.daily') || 'daily'}</option>
                        <option value="weekly">{t('settings.emails.weekly') || 'weekly'}</option>
                        <option value="monthly">{t('settings.emails.monthly') || 'monthly'}</option>
                    </select>
                </div>
            </td>
            <td>
                <button type="button" className="btn btn-danger pull-right" aria-label="remove"
                  data-toggle="modal" data-target={'#confirmDeleteAlert' + alert.id}
                  title={t("settings.emails.delete_report") || "Delete report"}>
                    <span className="glyphicon glyphicon-remove" aria-hidden="true"></span>
                </button>

                <ConfirmDeleteModal
                    modalId={'confirmDeleteAlert' + alert.id}
                    modalBody={t('settings.emails.delete_report_full_text') ||
                        `This will erase this report and you won't receive emails about it anymore.
                         Are you sure you want to remove this alert?`
                    }
                    onDelete={this.onDelete}
                />
            </td>
        </tr>;
    }
}

class Reports extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            alerts: store.getAlerts('report')
        };
        this.onAlertChange = this.onAlertChange.bind(this);
    }

    componentDidMount() {
        store.on(State.alerts, this.onAlertChange);
    }
    componentWillUnmount() {
        store.removeListener(State.alerts, this.onAlertChange);
    }

    onAlertChange() {
        this.setState({
            alerts: store.getAlerts('report')
        });
    }

    render() {

        let pairs = this.state.alerts;
        let items = pairs.map(pair => <ReportItem alert={pair.alert} account={pair.account} />);

        return (
        <div className="top-panel panel panel-default">
            <div className="panel-heading">
                <h3 className="title panel-title">
                    <T k="settings.emails.reports_title">Reports</T>
                </h3>

                <div className="panel-options">
                    <span className="option-legend fa fa-plus-circle" aria-label="create report"
                        data-toggle="modal" data-target='#report-creation'>
                    </span>
                </div>
            </div>

            <ReportCreationModal />

            <div className="panel-body">
                <table className="table">
                    <thead>
                        <tr>
                            <th><T k='settings.emails.account'>Account</T></th>
                            <th><T k='settings.emails.details'>Details</T></th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {items}
                    </tbody>
                </table>
            </div>
        </div>
        );
    }
}

class EmailsParameters extends React.Component {
    render() {
        return <div>
            <Alerts
                alertType="balance"
                sendIfText={t('settings.emails.send_if_balance_is') || 'Notify me if balance is'}
                titleTranslationKey="settings.emails.add_balance"
                titleTranslationValue="Add a new balance notification"
                panelTitleKey='settings.emails.balance_title'
                panelTitleValue='Balance alerts'
            />

            <Alerts
                alertType="transaction"
                sendIfText={t('settings.emails.send_if_transaction_is') || "Notify me if a transaction's amount is"}
                titleTranslationKey="settings.emails.add_transaction"
                titleTranslationValue="Add a new transaction notification"
                panelTitleKey='settings.emails.transaction_title'
                panelTitleValue='Transaction alerts'
            />

            <Reports />
        </div>;
    }
}

class About extends React.Component {
    render() {
        return (
            <div>
                <h3>Kresus</h3>
                <ul>
                    <li>Version: {packageConfig.version}</li>
                    <li>License: {packageConfig.license}</li>
                    <li><a href="https://github.com/bnjbvr/kresus" target="_blank">Code</a></li>
                    <li><a href="https://forum.cozy.io/t/app-kresus" target="_blank">Cozy Forum thread</a></li>
                    <li><a href="https://blog.benj.me/tag/kresus" target="_blank">Blog</a></li>
                </ul>
            </div>
        );
    }
}

export default class SettingsComponents extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            showing: 'accounts'
        };
    }

    show(which) {
        return () => {
            this.setState({
                showing: which
            });
        };
    }

    render() {
        var self = this;
        function MaybeActive(name) {
            return self.state.showing === name ? 'active' : '';
        }

        var Tab;
        switch (this.state.showing) {
          case 'accounts':
           Tab = <BankAccountsList/>;
           break;
          case 'defaults':
           Tab = <DefaultParameters/>;
           break;
          case 'about':
           Tab = <About/>;
           break;
          case 'backup':
           Tab = <BackupParameters/>;
           break;
          case 'weboob':
           Tab = <WeboobParameters/>;
           break;
          case 'emails':
           Tab = <EmailsParameters/>;
           break;
          default:
           assert(false, 'unknown state to show in settings');
        }

        return (
            <div>
                <div className="top-panel panel panel-default">
                    <div className="panel-heading">
                        <h3 className="title panel-title"><T k='settings.title'>Settings</T></h3>
                    </div>

                    <div className="panel-body">
                        <div className="col-md-3">
                            <nav className="top-panel navbar navbar-default">
                                <div className="navbar-header">
                                    <button type="button" className="navbar-toggle"
                                        data-toggle="collapse"
                                        data-target="#settings-menu-collapse">
                                        <span className="sr-only">Toggle navigation</span>
                                        <span className="fa fa-navicon"></span>
                                    </button>
                                </div>

                                <div className="collapse navbar-collapse sidebar-navbar-collapse" id="settings-menu-collapse">
                                    <ul className="nav nav-pills nav-stacked">
                                        <li role="presentation" className={MaybeActive('accounts')}>
                                            <a href="#" onClick={this.show('accounts')}>
                                                <T k='settings.tab_accounts'>Bank accounts</T>
                                            </a>
                                        </li>
                                        <li role="presentation" className={MaybeActive('emails')}>
                                            <a href="#" onClick={this.show('emails')}>
                                                <T k='settings.tab_emails'>Emails</T>
                                            </a>
                                        </li>
                                        <li role="presentation" className={MaybeActive('defaults')}>
                                            <a href="#" onClick={this.show('defaults')}>
                                                <T k='settings.tab_defaults'>Default parameters</T>
                                            </a>
                                        </li>
                                        <li role="presentation" className={MaybeActive('backup')}>
                                            <a href="#" onClick={this.show('backup')}>
                                                <T k='settings.tab_backup'>Backup / restore data</T>
                                            </a>
                                        </li>
                                        <li role="presentation" className={MaybeActive('weboob')}>
                                            <a href="#" onClick={this.show('weboob')}>
                                                <T k='settings.tab_weboob'>Weboob management</T>
                                            </a>
                                        </li>
                                        <li role="presentation" className={MaybeActive('about')}>
                                            <a href="#" onClick={this.show('about')}>
                                                <T k='settings.tab_about'>About</T>
                                            </a>
                                        </li>
                                    </ul>
                                </div>
                            </nav>
                        </div>

                        <div className="col-xs-12 col-md-9">
                            {Tab}
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
