import React from 'react';
import { connect } from 'react-redux';

import { translate as $t } from '../../../helpers';
import { get, actions } from '../../../store';

import DeleteAccessButton from './confirm-delete-access';
import DisableAccessButton from './disable-access-modal';
import AccountItem from './account';
import { ShowEditAccessModalButton, EnableAccessModalButton } from './edit-access-modal';

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
        maybeEditIcon = <ShowEditAccessModalButton accessId={access.id} />;
        toggleEnableIcon = <DisableAccessButton accessId={access.id} />;
    } else {
        toggleEnableIcon = <EnableAccessModalButton accessId={access.id} />;
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
            <table className="table bank-accounts-list">
                <tbody>{accounts}</tbody>
            </table>
        </div>
    );
});
