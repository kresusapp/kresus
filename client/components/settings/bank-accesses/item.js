import React from 'react';
import { connect } from 'react-redux';

import { translate as $t } from '../../../helpers';
import { get, actions } from '../../../store';

import ConfirmDeleteModal from '../../ui/confirm-delete-modal';

import AccountItem from './account';
import EditAccessModal from './edit-access-modal';
import DisableAccessModal from './disable-access-modal';

export default connect((state, props) => {
    return {
        bank: get.bank,
        accounts: get.accountsByAccessId(state, props.access.id)
    };
}, (dispatch, props) => {
    return {
        handleSyncAccounts: () => actions.runAccountsSync(dispatch, props.access.id),
        handleDeleteAccess: () => actions.deleteAccess(dispatch, props.access.id),
        handleUpdateAccess(update) {
            actions.updateAccess(dispatch, props.access.id, update);
        }
    };
})(props => {
    let access = props.access;
    let accounts = props.accounts.map(acc => (
        <AccountItem
          key={ acc.id }
          account={ acc }
        />)
    );

    // Display fetch and edit icons only if the access is active.
    let maybeFetchIcon = null;
    let maybeEditIcon = null;

    // Disable/Enable Icon
    let enableIcon = (
        <span
          className="option-legend fa fa-power-off clickable"
          aria-label="Enable access"
          data-toggle="modal"
          data-target={ `#changePasswordBank${access.id}` }
          title={ $t('client.settings.enable_access_button') }
        />
    );

    if (access.isActive) {
        maybeFetchIcon = (
            <span
              className="option-legend fa fa-refresh"
              aria-label="reload accounts"
              onClick={ props.handleSyncAccounts }
              title={ $t('client.settings.reload_accounts_button') }
            />
        );
        maybeEditIcon = (
            <span
              className="option-legend fa fa-cog"
              aria-label="Edit bank access"
              data-toggle="modal"
              data-target={ `#changePasswordBank${access.id}` }
              title={ $t('client.settings.change_password_button') }
            />
        );
        enableIcon = (
            <span
              className="option-legend fa fa-power-off enabled clickable"
              aria-label="Disable access"
              data-toggle="modal"
              data-target={ `#disableAccess${access.id}` }
              title={ $t('client.settings.disable_access_button') }
            />
        );
    }

    return (
        <div
          key={ `bank-access-item-${access.id}` }
          className="top-panel panel panel-default">
            <div className="panel-heading">
                <h3 className="title panel-title">
                    { enableIcon }
                    &nbsp;
                    { access.name }
                </h3>

                <div className="panel-options">
                    { maybeFetchIcon }
                    { maybeEditIcon }
                    <span
                      className="option-legend fa fa-times-circle"
                      aria-label="remove"
                      data-toggle="modal"
                      data-target={ `#confirmDeleteBank${access.id}` }
                      title={ $t('client.settings.delete_bank_button') }
                    />
                </div>
            </div>

            <DisableAccessModal
              modalId={ `disableAccess${access.id}` }
              accessId={ access.id }
            />
            <ConfirmDeleteModal
              modalId={ `confirmDeleteBank${access.id}` }
              modalBody={ $t('client.settings.erase_bank', { name: access.name }) }
              onDelete={ props.handleDeleteAccess }
            />

            <EditAccessModal
              modalId={ `changePasswordBank${access.id}` }
              accessId={ access.id }
              onSave={ props.handleUpdateAccess }
            />

            <table className="table bank-accounts-list">
                <tbody>
                    { accounts }
                </tbody>
            </table>
        </div>
    );
});
