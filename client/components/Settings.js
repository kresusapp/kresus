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
import {OpCatChartTypeSelect, OpCatChartPeriodSelect} from './Charts';
import T from './Translated';


class Account extends React.Component {

    onDelete(id) {
        Actions.DeleteAccount(this.props.account);
    }

    render() {
        var a = this.props.account;
        return <tr>
            <td>{a.title}</td>
            <td>
                <button type="button" className="btn btn-danger pull-right" aria-label="remove"
                    data-toggle="modal" data-target={'#confirmDeleteAccount' + a.id}
                    title={t("settings.delete_account_button") || "Delete account"}>
                    <span className="glyphicon glyphicon-remove" aria-hidden="true"></span>
                </button>

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
        </tr>
    }
}

class ChangePasswordModal extends React.Component {

    onClick() {
        let newPassword = this.refs.password.getDOMNode().value.trim();
        if (newPassword && newPassword.length) {
            this.props.onSave(newPassword);
            this.refs.password.getDOMNode().value = '';
        } else {
            alert(t("changepasswordmodal.not_empty") || "Please fill the password field");
        }
    }

    onKeyUp(e) {
        if (e.keyCode == 13) {
            this.onClick();
            $('#' + this.props.modalId).modal('toggle');
        }
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
        let modalTitle = <T k="changepasswordmodal.title">Change bank password</T>;

        let modalBody = <div>
            <T k="changepasswordmodal.body">
                If your bank password changed, you need to update it in Kresus
                so that the bank link keeps on syncing operations from your
                bank account.
            </T>

            <div className="form-group">
                <label htmlFor="password"><T k='settings.password'>Password</T></label>
                <input type="password" className="form-control" id="password" ref="password"
                  onKeyUp={this.onKeyUp.bind(this)} />
            </div>
        </div>;

        let modalFooter = <div>
            <button type="button" className="btn btn-default" data-dismiss="modal">
                <T k='changepasswordmodal.cancel'>Cancel</T>
            </button>
            <button type="button" className="btn btn-success" data-dismiss="modal"
              onClick={this.onClick.bind(this)}>
                <T k='changepasswordmodal.save'>Save</T>
            </button>
        </div>;

        return <Modal modalId={this.props.modalId}
                      modalTitle={modalTitle}
                      modalBody={modalBody}
                      modalFooter={modalFooter}
               />;
    }
};

class BankAccounts extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            accounts: []
        }
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

    onChangePassword(password) {
        if (this.state.accounts && this.state.accounts.length) {
            Actions.UpdateAccess(this.state.accounts[0], password);
        }
    }

    render() {
        var accounts = this.state.accounts.map((acc) => <Account key={acc.id} account={acc} />);

        var b = this.props.bank;

        return <div className="top-panel panel panel-default">
                    <div className="panel-heading">
                        <h3 className="title panel-title">{this.props.bank.name}
                            <button type="button" className="btn btn-danger pull-right" aria-label="remove"
                              data-toggle="modal" data-target={'#confirmDeleteBank' + b.id}
                              title={t("settings.delete_bank_button") || "Delete bank"}>
                                <span className="glyphicon glyphicon-remove" aria-hidden="true"></span>
                            </button>

                            <button type="button" className="btn btn-primary pull-right btn-space-right"
                              aria-label="reload accounts" onClick={this.onUpdateBank.bind(this)}
                              title={t("settings.reload_accounts_button") || "Reload accounts"}>
                                <span className="glyphicon glyphicon-refresh" aria-hidden="true"></span>
                            </button>

                            <button type="button" className="btn btn-default pull-right btn-space-right"
                              data-toggle="modal" data-target={'#changePasswordBank' + b.id}
                              aria-label="change password"
                              title={t("settings.change_password_button") || "Change password"}>
                                <span className="glyphicon glyphicon-cog" aria-hidden="true"></span>
                            </button>
                        </h3>
                    </div>

                <ConfirmDeleteModal
                    modalId={'confirmDeleteBank' + b.id}
                    modalBody={t('settings.erase_bank', {name: b.name}) ||
                    `This will erase the "${b.name}" bank, and all its
                    associated accounts and transactions. Are you sure
                    about this?`}
                    onDelete={this.onDeleteBank.bind(this)}
                />

                <ChangePasswordModal
                    modalId={'changePasswordBank' + b.id}
                    onSave={this.onChangePassword.bind(this)}
                />

                <table className="table">
                    <thead>
                        <tr>
                            <th><T k='settings.column_account_name'>Name</T></th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {accounts}
                    </tbody>
                </table>
            </div>
    }
}

class BankAccountsList extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            banks: []
        }
        this.listener = this._listener.bind(this);
    }

    _listener() {
        this.setState({
            banks: store.getBanks()
        })
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
        </form>
    }
}

class WeboobParameters extends React.Component {

    constructor(props) {
        super(props);
        this.onWeboobUpdated = this._onWeboobUpdated.bind(this);
        this.state = {
            isUpdatingWeboob: false
        }
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
        </form>
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
        }
    }

    show(which) {
        return () => {
            this.setState({
                showing: which
            });
        }
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
          default:
           assert(true === false, 'unknown state to show in settings');
        }

        return (
            <div>
                <div className="top-panel panel panel-default">
                    <div className="panel-heading">
                        <h3 className="title panel-title"><T k='settings.title'>Settings</T></h3>
                    </div>

                    <div className="panel-body">
                        <ul className="col-xs-3 nav nav-pills nav-stacked pull-left">
                            <li role="presentation" className={MaybeActive('accounts')}>
                                <a href="#" onClick={this.show('accounts')}>
                                    <T k='settings.tab_accounts'>Bank accounts</T>
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

                        <div className="col-xs-9">
                            {Tab}
                        </div>
                    </div>
                </div>
            </div>
        );
    }
};

