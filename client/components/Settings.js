import {Actions, store, State} from '../store';
import {debug, has, assert, translate as $t} from '../helpers';
import {MaybeHandleSyncError} from '../errors';

import packageConfig from '../../package.json';

import ConfirmDeleteModal from './ConfirmDeleteModal';
import ImportModule from './ImportModule';
import Modal from './Modal';
import NewBankForm from './NewBankForm';
import CustomBankField from './CustomBankField';
import AddOperationModal from './AddOperationModal';
import {OpCatChartTypeSelect, OpCatChartPeriodSelect} from './Charts';

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
            setDefaultAccountTitle = $t("client.settings.set_default_account");
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
                    title={$t("client.settings.delete_account_button")}>
                </span>
                <span className="pull-right fa fa-plus-circle" aria-label="Add an operation"
                    data-toggle="modal"
                    data-target={'#addOperation' + a.id}
                    title={$t("client.settings.add_operation")}>
                </span>
                <ConfirmDeleteModal
                    modalId={'confirmDeleteAccount' + a.id}
                    modalBody={$t('client.settings.erase_account', {title: a.title})}
                    onDelete={this.onDelete.bind(this)}
                />
                <AddOperationModal
                    account={a}
                />
            </td>
        </tr>;
    }
}

class EditAccessModal extends React.Component {

    handleSubmit(event) {
        event.preventDefault();

        let newLogin = this.refs.login.getDOMNode().value.trim();
        let newPassword = this.refs.password.getDOMNode().value.trim();
        if (!newPassword || !newPassword.length) {
            alert($t("client.editaccessmodal.not_empty"));
            return;
        }

        let customFields;
        if (this.props.customFields) {
            customFields = this.props.customFields.map((field, index) => this.refs["customField" + index].getValue());
            if (customFields.some(f => !f.value)) {
                alert($t("client.editaccessmodal.customFields_not_empty"));
                return;
            }
        }

        this.props.onSave(newLogin && newLogin.length ? newLogin : undefined,
                          newPassword,
                          customFields);
        this.refs.password.getDOMNode().value = '';

        $("#" + this.props.modalId).modal('hide');
    }

    constructor(props) {
        has(props, "modalId");
        super(props);
        this.handleSubmit = this.handleSubmit.bind(this);
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

        let modalTitle = $t('client.editaccessmodal.title');

        let modalBody = <div>
            {$t('client.editaccessmodal.body')}

            <form id={this.props.modalId + "-form"}
              className="form-group"
              onSubmit={this.handleSubmit}>
                <div className="form-group">
                    <label htmlFor="login">
                        {$t('client.settings.login')}
                    </label>
                    <input type="text" className="form-control" id="login" ref="login" />
                </div>

                <div className="form-group">
                    <label htmlFor="password">
                        {$t('client.settings.password')}
                    </label>
                    <input type="password" className="form-control" id="password" ref="password" />
                </div>

                {customFields}
            </form>
        </div>;

        let modalFooter = <div>
            <button type="button" className="btn btn-default" data-dismiss="modal">
                {$t('client.editaccessmodal.cancel')}
            </button>
            <button type="submit" form={this.props.modalId + "-form"} className="btn btn-success">
                {$t('client.editaccessmodal.save')}
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
        this.handleChangeAccess = this.handleChangeAccess.bind(this);
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

    handleChangeAccess(login, password, customFields) {
        assert(this.state.accounts && this.state.accounts.length);
        Actions.UpdateAccess(this.state.accounts[0], login, password, customFields);
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
                                title={$t("client.settings.reload_accounts_button")}>
                            </span>

                            <span className="option-legend fa fa-cog" aria-label="Edit bank access"
                                data-toggle="modal"
                                data-target={'#changePasswordBank' + b.id}
                                title={$t("client.settings.change_password_button")}>
                            </span>

                            <span className="option-legend fa fa-times-circle" aria-label="remove"
                                data-toggle="modal"
                                data-target={'#confirmDeleteBank' + b.id}
                                title={$t("client.settings.delete_bank_button")}>
                            </span>
                        </div>
                    </div>

                <ConfirmDeleteModal
                    modalId={'confirmDeleteBank' + b.id}
                    modalBody={$t('client.settings.erase_bank', {name: b.name})}
                    onDelete={this.onDeleteBank.bind(this)}
                />

                <EditAccessModal
                    modalId={'changePasswordBank' + b.id}
                    customFields={b.customFields}
                    onSave={this.handleChangeAccess}
                />

                <table className="table bank-accounts-list">
                    <thead>
                        <tr>
                            <th></th>
                            <th>{$t('client.settings.column_account_name')}</th>
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
                {$t('client.settings.duplicate_threshold')}
            </label>
            <div className="col-xs-8">
                <input id="duplicateThreshold" ref="duplicateThreshold" type="number" className="form-control"
                    min="0" step="1"
                    value={this.state.duplicateThreshold} onChange={this.onDuplicateThresholdChange.bind(this)} />
                <span className="help-block">
                    {$t('client.settings.duplicate_help')}
                </span>
            </div>
        </div>

        <div className="form-group">
            <label htmlFor="defaultChartType" className="col-xs-4 control-label">
                {$t('client.settings.default_chart_type')}
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
                {$t('client.settings.default_chart_period')}
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
                    {$t('client.settings.export_instance')}
                </label>
                <div className="col-xs-8">
                    <a download="kresus.json"
                      href="all/export"
                      id="exportInstance"
                      className="btn btn-primary">
                        {$t('client.settings.go_export_instance')}
                    </a>
                    <span className="help-block">
                        {$t('client.settings.export_instance_help')}
                    </span>
                </div>
            </div>

            <div className="form-group">
                <label htmlFor="importInstance" className="col-xs-4 control-label">
                    {$t('client.settings.import_instance')}
                </label>
                <div className="col-xs-8">
                    <ImportModule />
                    <span className="help-block">
                        {$t('client.settings.import_instance_help')}
                    </span>
                </div>
            </div>
        </form>;
    }
}

export class WeboobParameters extends React.Component {

    constructor(props) {
        super(props);
        this.onWeboobUpdated = this._onWeboobUpdated.bind(this);
        this.handleToggleWeboobAutoMergeAccounts = this.handleToggleWeboobAutoMergeAccounts.bind(this);
        this.handleToggleWeboobAutoUpdate = this.handleToggleWeboobAutoUpdate.bind(this);
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

    handleToggleWeboobAutoMergeAccounts(e) {
        let newValue = e.target.checked;
        Actions.ChangeBoolSetting('weboob-auto-merge-accounts', newValue);
    }

    handleToggleWeboobAutoUpdate(e) {
        let newValue = e.target.checked;
        Actions.ChangeBoolSetting('weboob-auto-update', newValue);
    }

    render() {
        return <form>

            <div className="form-group clearfix">
                <label htmlFor="autoMerge" className="col-xs-4 control-label">
                    {$t('client.settings.weboob_auto_merge_accounts')}
                </label>
                <div className="col-xs-8">
                    <input
                      id="autoMerge"
                      type="checkbox"
                      ref="autoMerge"
                      defaultChecked={store.getBoolSetting('weboob-auto-merge-accounts')}
                      onChange={this.handleToggleWeboobAutoMergeAccounts}
                    />
                </div>
            </div>

            <div className="form-group clearfix">
                <label htmlFor="autoUpdate" className="col-xs-4 control-label">
                    {$t('client.settings.weboob_auto_update')}
                </label>
                <div className="col-xs-8">
                    <input
                      id="autoUpdate"
                      type="checkbox"
                      ref="autoUpdate"
                      defaultChecked={store.getBoolSetting('weboob-auto-update')}
                      onChange={this.handleToggleWeboobAutoUpdate}
                    />
                </div>
            </div>

            <div className="form-group clearfix">
                <label htmlFor="updateWeboob" className="col-xs-4 control-label">
                    {$t('client.settings.update_weboob')}
                </label>
                <div className="col-xs-8">
                    <button
                        id="updateWeboob"
                        type="button"
                        className="btn btn-primary"
                        onClick={this.onWeboobUpdate.bind(this, 'modules')}
                        disabled={this.state.isUpdatingWeboob ? 'disabled' : undefined}>
                            {$t('client.settings.go_update_weboob')}
                    </button>
                    <span className="help-block">
                        {$t('client.settings.update_weboob_help')}
                    </span>
                </div>
            </div>

            <div className="form-group clearfix">
                <label htmlFor="reinstallWeboob" className="col-xs-4 control-label">
                    {$t('client.settings.reinstall_weboob')}
                </label>
                <div className="col-xs-8">
                    <button
                        id="reinstallWeboob"
                        type="button"
                        className="btn btn-danger"
                        onClick={this.onWeboobUpdate.bind(this, 'core')}
                        disabled={this.state.isUpdatingWeboob ? 'disabled' : undefined}>
                            {$t('client.settings.go_reinstall_weboob')}
                    </button>
                    <span className="help-block">
                        {$t('client.settings.reinstall_weboob_help')}
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
                maybeLimitError: $t("client.settings.emails.invalid_limit")
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
        let modalTitle = $t('client.' + this.props.titleTranslationKey);

        let modalBody = <div>
            <div className="form-group">
                <label htmlFor="account">
                    {$t('client.settings.emails.account')}
                </label>
                <AccountSelector ref="account" id="account" />
            </div>

            <div className="form-group">
                <span>{this.props.sendIfText}&nbsp;</span>

                <select className="form-control" ref="selector">
                    <option value="gt">{$t('client.settings.emails.greater_than')}</option>
                    <option value="lt">{$t('client.settings.emails.less_than')}</option>
                </select>
            </div>

            <div className="form-group">
                <span className="text-danger">{this.state.maybeLimitError}</span>
                <input type="number" ref="limit" className="form-control" defaultValue="0" />
            </div>
        </div>;

        let modalFooter = <div>
            <button type="button" className="btn btn-default" data-dismiss="modal">
                {$t('client.settings.emails.cancel')}
            </button>
            <button type="button" className="btn btn-success" onClick={this.onSubmit.bind(this)}>
                {$t('client.settings.emails.create')}
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
                        <option value="gt">{$t('client.settings.emails.greater_than')}</option>
                        <option value="lt">{$t('client.settings.emails.less_than')}</option>
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
                  title={$t("client.settings.emails.delete_alert")}>
                    <span className="glyphicon glyphicon-remove" aria-hidden="true"></span>
                </button>

                <ConfirmDeleteModal
                    modalId={'confirmDeleteAlert' + alert.id}
                    modalBody={$t('client.settings.emails.delete_alert_full_text')}
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
        has(props, 'panelTitleKey');
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
                    {$t('client.' + this.props.panelTitleKey)}
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
                sendIfText={this.props.sendIfText}
            />

            <div className="panel-body">
                <table className="table">
                    <thead>
                        <tr>
                            <th>{$t('client.settings.emails.account')}</th>
                            <th>{$t('client.settings.emails.details')}</th>
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
        let modalTitle = $t('client.settings.emails.add_report');

        let modalBody = <div>
            <div className="form-group">
                <label htmlFor="account">
                    {$t('client.settings.emails.account')}
                </label>
                <AccountSelector ref="account" id="account" />
            </div>

            <div className="form-group">
                <span>{$t('client.settings.emails.send_report')}&nbsp;</span>

                <select className="form-control" ref="selector">
                    <option value="daily">{$t('client.settings.emails.daily')}</option>
                    <option value="weekly">{$t('client.settings.emails.weekly')}</option>
                    <option value="monthly">{$t('client.settings.emails.monthly')}</option>
                </select>
            </div>
        </div>;

        let modalFooter = <div>
            <button type="button" className="btn btn-default" data-dismiss="modal">
                {$t('client.settings.emails.cancel')}
            </button>
            <button type="button" className="btn btn-success" data-dismiss="modal"
              onClick={this.onSubmit.bind(this)}>
                {$t('client.settings.emails.create')}
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
                    <span>{$t('client.settings.emails.send_report')}&nbsp;</span>

                    <select className="form-control"
                      defaultValue={alert.frequency}
                      ref="selector"
                      onChange={this.onSelectChange}
                    >
                        <option value="daily">{$t('client.settings.emails.daily')}</option>
                        <option value="weekly">{$t('client.settings.emails.weekly')}</option>
                        <option value="monthly">{$t('client.settings.emails.monthly')}</option>
                    </select>
                </div>
            </td>
            <td>
                <button type="button" className="btn btn-danger pull-right" aria-label="remove"
                  data-toggle="modal" data-target={'#confirmDeleteAlert' + alert.id}
                  title={$t("client.settings.emails.delete_report")}>
                    <span className="glyphicon glyphicon-remove" aria-hidden="true"></span>
                </button>

                <ConfirmDeleteModal
                    modalId={'confirmDeleteAlert' + alert.id}
                    modalBody={$t('client.settings.emails.delete_report_full_text')}
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
                    {$t('client.settings.emails.reports_title')}
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
                            <th>{$t('client.settings.emails.account')}</th>
                            <th>{$t('client.settings.emails.details')}</th>
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
                sendIfText={$t('client.settings.emails.send_if_balance_is')}
                titleTranslationKey="settings.emails.add_balance"
                panelTitleKey='settings.emails.balance_title'
            />

            <Alerts
                alertType="transaction"
                sendIfText={$t('client.settings.emails.send_if_transaction_is')}
                titleTranslationKey="settings.emails.add_transaction"
                panelTitleKey='settings.emails.transaction_title'
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
                        <h3 className="title panel-title">
                            {$t('client.settings.title')}
                        </h3>
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
                                                {$t('client.settings.tab_accounts')}
                                            </a>
                                        </li>
                                        <li role="presentation" className={MaybeActive('emails')}>
                                            <a href="#" onClick={this.show('emails')}>
                                                {$t('client.settings.tab_emails')}
                                            </a>
                                        </li>
                                        <li role="presentation" className={MaybeActive('defaults')}>
                                            <a href="#" onClick={this.show('defaults')}>
                                                {$t('client.settings.tab_defaults')}
                                            </a>
                                        </li>
                                        <li role="presentation" className={MaybeActive('backup')}>
                                            <a href="#" onClick={this.show('backup')}>
                                                {$t('client.settings.tab_backup')}
                                            </a>
                                        </li>
                                        <li role="presentation" className={MaybeActive('weboob')}>
                                            <a href="#" onClick={this.show('weboob')}>
                                                {$t('client.settings.tab_weboob')}
                                            </a>
                                        </li>
                                        <li role="presentation" className={MaybeActive('about')}>
                                            <a href="#" onClick={this.show('about')}>
                                                {$t('client.settings.tab_about')}
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
