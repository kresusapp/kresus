import React from 'react';
import { connect } from 'react-redux';

import { translate as $t } from '../../../helpers';
import { get, actions } from '../../../store';

import DeleteAccessButton from './confirm-delete-access';
import DisableAccessButton from './disable-access-modal';
import AccountItem from './account';
import EditAccessModal from './edit-access-modal';

export default connect(
    (state, props) => {
        return {
            bank: get.bank,
            accounts: get.accountsByAccessId(state, props.access.id)
        };
    },
    (dispatch, props) => {
        return {
            handleSyncAccounts: () => actions.runAccountsSync(dispatch, props.access.id),
            handleDeleteAccess: () => actions.deleteAccess(dispatch, props.access.id),
            handleUpdateAccess(login, password, customFields) {
                actions.updateAccess(dispatch, props.access.id, login, password, customFields);
            }
        };
    }
)(props => {
    let { access } = props;
    let accounts = props.accounts.map(acc => (
        <AccountItem key={acc.id} account={acc} enabled={access.enabled} />
    ));

    // Display fetch and edit icons only if the access is active.
    let maybeFetchIcon = null;
    let maybeEditIcon = null;

    let toggleEnableIcon = null;

    if (access.enabled) {
        maybeFetchIcon = (
            <span
                className="option-legend fa fa-refresh"
                aria-label="Reload accounts"
                onClick={props.handleSyncAccounts}
                title={$t('client.settings.reload_accounts_button')}
            />
        );
        maybeEditIcon = (
            <span
                className="option-legend fa fa-cog"
                aria-label="Edit bank access"
                data-toggle="modal"
                data-target={`#changePasswordBank${access.id}`}
                title={$t('client.settings.change_password_button')}
            />
        );
        toggleEnableIcon = <DisableAccessButton accessId={access.id} />;
    } else {
        toggleEnableIcon = (
            <span
                className="option-legend fa fa-power-off clickable"
                aria-label="Enable access"
                data-toggle="modal"
                data-target={`#changePasswordBank${access.id}`}
                title={$t('client.settings.enable_access')}
            />
        );
    }

    return (
        <div key={`bank-access-item-${access.id}`} className="top-panel panel panel-default">
            <div className="panel-heading">
                <h3 className="title panel-title">
                    {toggleEnableIcon}
                    &nbsp;
                    {access.name}
                </h3>

                <div className="panel-options">
                    {maybeFetchIcon}
                    {maybeEditIcon}
                    <DeleteAccessButton accessId={access.id} />
                </div>
            </div>

            <EditAccessModal
                modalId={`changePasswordBank${access.id}`}
                accessId={access.id}
                onSave={props.handleUpdateAccess}
            />

            <table className="table bank-accounts-list">
                <tbody>{accounts}</tbody>
            </table>
        </div>
    );
});
