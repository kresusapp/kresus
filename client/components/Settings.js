// Constants
import Events from '../Events';
import {debug, assert, translate as t} from '../Helpers';

// Global variables
import store from '../store';
import flux from '../flux/dispatcher';

import ConfirmDeleteModal from './ConfirmDeleteModal';

class Account extends React.Component {

    onDelete(id) {
        flux.dispatch({
            type: Events.user.deleted_account,
            account: this.props.account
        });
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
                    modalBody={t('erase_account', {title: a.title})}
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
        store.on(Events.state.accounts, this.listener);
        store.loadAccountsAnyBank(this.props.bank);
    }

    componentWillUnmount() {
        store.removeListener(Events.state.accounts, this.listener);
    }

    onDeleteBank() {
        flux.dispatch({
            type: Events.user.deleted_bank,
            bank: this.props.bank
        });
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
                    modalBody={t('erase_bank', {name: b.name})}
                    onDelete={this.onDeleteBank.bind(this)}
                />

                <table className="table">
                    <thead>
                        <tr>
                            <th>{t('Name')}</th>
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

        var eventObject = {
            type: Events.user.created_bank,
            bankUuid: bank,
            id: id,
            pwd: pwd
        };

        if (this.state.hasWebsites)
            eventObject.website = this.domWebsite().value;
        flux.dispatch(eventObject);
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
                    <label htmlFor="website">{t('Website')}</label>
                    <select className="form-control" id="website" ref="website">
                        {websitesOptions}
                    </select>
                </div>;
            } else {
                maybeWebsites = <div/>;
            }

            maybeForm = <div className="panel-body transition-expand">
                <div className="form-group">
                    <label htmlFor="bank">{t('Bank')}</label>
                    <select className="form-control" id="bank" ref="bank" onChange={this.onChangedBank.bind(this)}>
                        {options}
                    </select>
                </div>

                {maybeWebsites}

                <div className="form-group">
                    <label htmlFor="id">{t('ID')}</label>
                    <input type="text" className="form-control" id="id" placeholder="Enter here your bank identifier" ref="id" />
                </div>

                <div className="form-group">
                    <label htmlFor="password">{t('Password')}</label>
                    <input type="password" className="form-control" id="password" ref="password" />
                </div>

                <input type="submit" className="btn btn-save pull-right" onClick={this.onSubmit.bind(this)} value={t("Save")} />
            </div>;
        }

        return (
        <div className="top-panel panel panel-default">
            <div className="panel-heading">
                <h3 className="title panel-title">{t('Configure a new bank access')}
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
        store.subscribeMaybeGet(Events.state.banks, this.listener);
    }

    componentWillUnmount() {
        store.removeListener(Events.state.banks, this.listener);
    }

    render() {
        var banks = this.state.banks.map((bank) => <BankAccounts key={bank.id} bank={bank} />);

        return (<div>
        <NewBankForm/>
        <div>
            {banks}
        </div>
        </div>)
    }
}

export default class SettingsComponents extends React.Component {

    constructor() {
        this.state = {
            showing: 'accounts',
            // settings
            duplicateThreshold: store.getSetting('duplicateThreshold')
        }
    }

    show(which) {
        return () => {
            this.setState({
                showing: which
            });
        }
    }

    onChange(e) {
        var val = this.refs.duplicateThreshold.getDOMNode().value;
        flux.dispatch({
            type: Events.user.changed_setting,
            key: 'duplicateThreshold',
            value: val
        });
        this.setState({
            duplicateThreshold: val
        });
        return true;
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
           Tab = <form className="form-horizontal">
                    <div className="form-group">
                        <label htmlFor="duplicateThreshold" className="col-xs-4 control-label">{t('Duplicate threshold')}</label>
                        <div className="col-xs-8">
                            <input id="duplicateThreshold" ref="duplicateThreshold" type="number" className="form-control"
                                min="0" step="1"
                                value={this.state.duplicateThreshold} onChange={this.onChange.bind(this)} />
                            <span className="help-block">{t('duplicate_help')}</span>
                        </div>
                    </div>
                  </form>;
           break;
          default:
           assert(true === false, 'unknown state to show in settings');
        }

        return (
            <div>
                <div className="top-panel panel panel-default">
                    <div className="panel-heading">
                        <h3 className="title panel-title">{t('Settings')}</h3>
                    </div>

                    <div className="panel-body">
                        <ul className="col-xs-3 nav nav-pills nav-stacked pull-left">
                            <li role="presentation" className={MaybeActive('accounts')}><a href="#" onClick={this.show('accounts')}>{t('Bank accounts')}</a></li>
                            <li role="presentation" className={MaybeActive('advanced')}><a href="#" onClick={this.show('advanced')}>{t('Advanced (beta)')}</a></li>
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

