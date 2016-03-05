import { translate as $t, assert } from '../../helpers';
import { Actions, store, State } from '../../store';
import { maybeHandleSyncError } from '../../errors';

import ConfirmDeleteModal from '../ui/confirm-delete-modal';

import Account from './account';
import EditAccessModal from './edit-access-modal';

export default class BankAccounts extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            accounts: store.getBankAccounts(this.props.bank.id)
        };
        this.listener = this._listener.bind(this);
        this.handleChangeAccess = this.handleChangeAccess.bind(this);
        this.handleDelete = this.handleDelete.bind(this);
        this.handleUpdate = this.handleUpdate.bind(this);
    }

    _listener() {
        this.setState({
            accounts: store.getBankAccounts(this.props.bank.id)
        });
    }

    componentDidMount() {
        store.on(State.accounts, this.listener);
    }

    componentWillUnmount() {
        store.removeListener(State.accounts, this.listener);
    }

    handleDelete() {
        Actions.deleteBank(this.props.bank);
    }

    handleUpdate() {
        if (this.state.accounts && this.state.accounts.length) {
            store.once(State.sync, maybeHandleSyncError);
            Actions.fetchAccounts(this.props.bank, this.state.accounts[0]);
        }
    }

    handleChangeAccess(login, password, customFields) {
        assert(this.state.accounts && this.state.accounts.length);
        Actions.updateAccess(this.state.accounts[0], login, password, customFields);
    }

    render() {
        let accounts = this.state.accounts.map(acc => <Account key={ acc.id } account={ acc } />);

        let b = this.props.bank;

        return (
            <div className="top-panel panel panel-default">
                <div className="panel-heading">
                    <h3 className="title panel-title">{ this.props.bank.name }</h3>

                    <div className="panel-options">
                        <span className="option-legend fa fa-refresh" aria-label="reload accounts"
                          onClick={ this.handleUpdate }
                          title={ $t('client.settings.reload_accounts_button') }>
                        </span>

                        <span className="option-legend fa fa-cog" aria-label="Edit bank access"
                          data-toggle="modal"
                          data-target={ `#changePasswordBank${b.id}` }
                          title={ $t('client.settings.change_password_button') }>
                        </span>

                        <span className="option-legend fa fa-times-circle" aria-label="remove"
                          data-toggle="modal"
                          data-target={ `#confirmDeleteBank${b.id}` }
                          title={ $t('client.settings.delete_bank_button') }>
                        </span>
                    </div>
                </div>

                <ConfirmDeleteModal
                  modalId={ `confirmDeleteBank${b.id}` }
                  modalBody={ $t('client.settings.erase_bank', { name: b.name }) }
                  onDelete={ this.handleDelete }
                />

                <EditAccessModal
                  modalId={ `changePasswordBank${b.id}` }
                  customFields={ b.customFields }
                  onSave={ this.handleChangeAccess }
                />

                <table className="table bank-accounts-list">
                    <thead>
                        <tr>
                            <th></th>
                            <th>{ $t('client.settings.column_account_name') }</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        { accounts }
                    </tbody>
                </table>
            </div>
        );
    }
}
