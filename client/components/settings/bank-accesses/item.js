import React from 'react';
import { connect } from 'react-redux';

import { translate as $t } from '../../../helpers';
import { get, actions } from '../../../store';

import ConfirmDeleteModal from '../../ui/confirm-delete-modal';
import DisableAccessButton from './disable-access-modal';
import AccountItem from './account';
import EditAccessModal from './edit-access-modal';

export default connect(
    (state, props) => {
        return {
            bank: get.bank,
            access: get.accessById(state, props.accessId)
        };
    },
    (dispatch, props) => {
        return {
            handleSyncAccounts: () => actions.runAccountsSync(dispatch, props.accessId),
            handleDeleteAccess: () => actions.deleteAccess(dispatch, props.accessId),
            handleUpdateAccess(login, password, customFields) {
                actions.updateAccess(dispatch, props.accessId, login, password, customFields);
            }
        };
    }
)(props => {
    let { access } = props;
    let accounts = access.accountIds.map(id => (
        <AccountItem key={id} accountId={id} enabled={access.enabled} />
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

                    <span
                        className="option-legend fa fa-times-circle"
                        aria-label="remove"
                        data-toggle="modal"
                        data-target={`#confirmDeleteBank${access.id}`}
                        title={$t('client.settings.delete_bank_button')}
                    />
                </div>
            </div>

            <ConfirmDeleteModal
                modalId={`confirmDeleteBank${access.id}`}
                modalBody={$t('client.settings.erase_bank', { name: access.name })}
                onDelete={props.handleDeleteAccess}
            />

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
