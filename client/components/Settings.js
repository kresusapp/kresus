// Constants
import {debug, assert, translate as t} from '../Helpers';

// Global variables
import {Actions, store, State} from '../store';

import ConfirmDeleteModal from './ConfirmDeleteModal';
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
                    data-toggle="modal" data-target={'#confirmDeleteAccount' + a.id}>
                    <span className="glyphicon glyphicon-remove" aria-hidden="true"></span>
                </button>

                <ConfirmDeleteModal
                    modalId={'confirmDeleteAccount' + a.id}
                    modalBody={t('settings.erase_account', {title: a.title}) ||
                        `This will erase the "${a.title}" account, and all its transactions. If this is the last account bound to this bank, the bank will be erased as well. Are you sure about this?`
                    }
                    onDelete={this.onDelete.bind(this)}
                />
            </td>
        </tr>
    }
}

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
        store.loadAccountsAnyBank(this.props.bank);
    }

    componentWillUnmount() {
        store.removeListener(State.accounts, this.listener);
    }

    onDeleteBank() {
        Actions.DeleteBank(this.props.bank);
    }

    render() {
        var accounts = this.state.accounts.map((acc) => <Account key={acc.id} account={acc} />);

        var b = this.props.bank;

        return <div className="top-panel panel panel-default">
                    <div className="panel-heading">
                        <h3 className="title panel-title">{this.props.bank.name}
                            <button type="button" className="btn btn-danger pull-right" aria-label="remove"
                              data-toggle="modal" data-target={'#confirmDeleteBank' + b.id}>
                                <span className="glyphicon glyphicon-remove" aria-hidden="true"></span>
                            </button>
                        </h3>
                    </div>

                <ConfirmDeleteModal
                    modalId={'confirmDeleteBank' + b.id}
                    modalBody={t('settings.erase_bank', {name: b.name}) ||
                    `This will erase the "${b.name}" bank, and all its associated accounts and transactions. Are you sure about this?`}
                    onDelete={this.onDeleteBank.bind(this)}
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

class NewBankForm extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            expanded: false,
            hasWebsites: false,
            websites: []
        }
    }

    toggleExpand() {
        this.setState({
            expanded: !this.state.expanded
        });
    }

    domBank() {
        return this.refs.bank.getDOMNode();
    }
    domWebsite() {
        return this.refs.website.getDOMNode();
    }
    domId() {
        return this.refs.id.getDOMNode();
    }
    domPassword() {
        return this.refs.password.getDOMNode();
    }

    onChangedBank() {
        var uuid = this.domBank().value;

        var found = store.getStaticBanks().filter(function(b) { return b.uuid == uuid });
        assert(found.length == 1, 'selected bank doesnt exist');
        var bank = found[0];

        if (typeof bank.websites !== 'undefined') {
            this.setState({
                hasWebsites: true,
                websites: bank.websites
            });
        } else {
            this.setState({
                hasWebsites: false,
                websites: []
            });
        }
    }

    onSubmit() {
        var bank = this.domBank().value;
        var id = this.domId().value;
        var pwd = this.domPassword().value;

        this.setState({
            expanded: false
        });

        Actions.CreateBank(bank, id, pwd, this.state.hasWebsites ? this.domWebsite().value : undefined);
    }

    render() {
        var maybeForm = <div className="transition-expand"/>

        if (this.state.expanded) {
            var options = store.getStaticBanks().map((bank) =>
                <option key={bank.id} value={bank.uuid}>{bank.name}</option>
            );

            var maybeWebsites;
            if (this.state.hasWebsites) {
                var websitesOptions = this.state.websites.map((website) =>
                    <option key={website.hostname} value={website.hostname}>{website.label}</option>
                );
                maybeWebsites = <div className="form-group">
                    <label htmlFor="website"><T k='settings.website'>Website</T></label>
                    <select className="form-control" id="website" ref="website">
                        {websitesOptions}
                    </select>
                </div>;
            } else {
                maybeWebsites = <div/>;
            }

            maybeForm = <div className="panel-body transition-expand">
                <div className="form-group">
                    <label htmlFor="bank"><T k='settings.bank'>Bank</T></label>
                    <select className="form-control" id="bank" ref="bank" onChange={this.onChangedBank.bind(this)}>
                        {options}
                    </select>
                </div>

                {maybeWebsites}

                <div className="form-group">
                    <label htmlFor="id"><T k='settings.login'>Login</T></label>
                    <input type="text" className="form-control" id="id" placeholder="Enter here your bank identifier" ref="id" />
                </div>

                <div className="form-group">
                    <label htmlFor="password"><T k='settings.password'>Password</T></label>
                    <input type="password" className="form-control" id="password" ref="password" />
                </div>

                <input type="submit" className="btn btn-save pull-right" onClick={this.onSubmit.bind(this)} value={t('settings.submit') || 'Save'} />
            </div>;
        }

        return (
        <div className="top-panel panel panel-default">
            <div className="panel-heading">
                <h3 className="title panel-title"><T k='settings.new_bank_form_title'>Configure a new bank access</T>
                    <button type="button" className="btn btn-primary pull-right" aria-label="add" onClick={this.toggleExpand.bind(this)}>
                        <span className="glyphicon glyphicon-plus" aria-hidden="true"></span>
                    </button>
                </h3>
                {maybeForm}
            </div>
        </div>
        );
    }
}

class BankAccountsList extends React.Component {

    constructor() {
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
            <NewBankForm/>
            <div>
                {banks}
            </div>
        </div>;
    }
}

class AdvancedParameters extends React.Component {

    constructor(props) {
        super(props);
        this.onWeboobUpdated = this._onWeboobUpdated.bind(this);
        this.state = {
            // settings
            duplicateThreshold: store.getSetting('duplicateThreshold'),
            isUpdatingWeboob: false
        };
    }

    componentDidMount() {
        store.on(State.weboob, this.onWeboobUpdated);
    }
    componentWillUnmount() {
        store.removeListener(State.weboob, this.onWeboobUpdated);
    }

    onChange(e) {
        var val = this.refs.duplicateThreshold.getDOMNode().value;
        Actions.ChangeSetting('duplicateThreshold', val);
        this.setState({
            duplicateThreshold: val
        });
        return true;
    }

    onWeboobUpdate() {
        Actions.UpdateWeboob();
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
       return (
       <form className="form-horizontal">
        <div className="form-group">
            <label htmlFor="duplicateThreshold" className="col-xs-4 control-label"><T k='settings.duplicate_threshold'>Duplication threshold</T></label>
            <div className="col-xs-8">
                <input id="duplicateThreshold" ref="duplicateThreshold" type="number" className="form-control"
                    min="0" step="1"
                    value={this.state.duplicateThreshold} onChange={this.onChange.bind(this)} />
                <span className="help-block"><T k='settings.duplicate_help'>Two transactions will appear in the Duplicates section if they both happen within this period of time (in hours) of each other.</T></span>
            </div>
        </div>

        <div className="form-group">
            <button
                className="btn btn-primary pull-right"
                onClick={this.onWeboobUpdate.bind(this)}
                disabled={this.state.isUpdatingWeboob ? 'disabled' : undefined}>
                    <T k='settings.reinstall_weboob'>Reinstall weboob</T>
            </button>
        </div>
      </form>);
    }
}

export default class SettingsComponents extends React.Component {

    constructor() {
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
          case 'advanced':
           Tab = <AdvancedParameters/>;
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
                            <li role="presentation" className={MaybeActive('accounts')}><a href="#" onClick={this.show('accounts')}><T k='settings.tab_accounts'>Bank accounts</T></a></li>
                            <li role="presentation" className={MaybeActive('advanced')}><a href="#" onClick={this.show('advanced')}><T k='settings.tab_advanced'>Advanced (beta)</T></a></li>
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

