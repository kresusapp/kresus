import { translate as $t, assert } from '../../helpers';
import {Actions, store, State} from '../../store';
import {MaybeHandleSyncError} from '../../errors';

import Account from './Account';
import EditAccessModal from './EditAccessModal';
import ConfirmDeleteModal from '../ui/ConfirmDeleteModal';

export default class BankAccounts extends React.Component {

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

