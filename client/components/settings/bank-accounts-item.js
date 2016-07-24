import React from 'react';
import { connect } from 'react-redux';

import { translate as $t, assert } from '../../helpers';
import { get, actions } from '../../store';
import { maybeHandleSyncError } from '../../errors';

import ConfirmDeleteModal from '../ui/confirm-delete-modal';

import Account from './account';
import EditAccessModal from './edit-access-modal';

class BankAccounts extends React.Component {

    constructor(props) {
        super(props);
        this.handleChangeAccess = this.handleChangeAccess.bind(this);
        this.handleUpdate = this.handleUpdate.bind(this);
    }

    handleUpdate() {
        if (this.props.accounts && this.props.accounts.length) {
            alert('fetch NYI');
            //Actions.fetchAccounts(this.props.bank, this.props.accounts[0]);
        }
    }

    handleChangeAccess(login, password, customFields) {
        assert(this.props.accounts && this.props.accounts.length);
        alert('update NYI');
        //Actions.updateAccess(this.props.accounts[0], login, password, customFields);
    }

    render() {
        let access = this.props.access;
        let accounts = this.props.accounts.map(acc => <Account key={ acc.id } account={ acc } />);

        return (
            <div className="top-panel panel panel-default">
                <div className="panel-heading">
                    <h3 className="title panel-title">{ access.name }</h3>

                    <div className="panel-options">
                        <span className="option-legend fa fa-refresh" aria-label="reload accounts"
                          onClick={ this.handleUpdate }
                          title={ $t('client.settings.reload_accounts_button') }>
                        </span>

                        <span className="option-legend fa fa-cog" aria-label="Edit bank access"
                          data-toggle="modal"
                          data-target={ `#changePasswordBank${access.id}` }
                          title={ $t('client.settings.change_password_button') }>
                        </span>

                        <span className="option-legend fa fa-times-circle" aria-label="remove"
                          data-toggle="modal"
                          data-target={ `#confirmDeleteBank${access.id}` }
                          title={ $t('client.settings.delete_bank_button') }>
                        </span>
                    </div>
                </div>

                <ConfirmDeleteModal
                  modalId={ `confirmDeleteBank${access.id}` }
                  modalBody={ $t('client.settings.erase_bank', { name: access.name }) }
                  onDelete={ this.props.deleteAccess }
                />

                <EditAccessModal
                  modalId={ `changePasswordBank${access.id}` }
                  customFields={ access.customFields }
                  onSave={ this.handleChangeAccess }
                />

                <table className="table bank-accounts-list">
                    <tbody>
                        { accounts }
                    </tbody>
                </table>
            </div>
        );
    }
}

let Export = connect((state, props) => {
    return {
        bank: get.bank,
        accounts: get.accountsByAccessId(state, props.access.id)
    };
}, (dispatch, props) => {
    return {
        deleteAccess: () => actions.deleteAccess(dispatch, props.access.id)
    };
})(BankAccounts);

export default Export;
