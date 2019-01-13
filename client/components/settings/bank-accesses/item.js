import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import { displayLabel, translate as $t } from '../../../helpers';
import { get, actions } from '../../../store';

import { DELETE_ACCESS_MODAL_SLUG } from './confirm-delete-access';
import { DISABLE_MODAL_SLUG } from './disable-access-modal';
import { EDIT_ACCESS_MODAL_SLUG } from './edit-access-modal';
import AccountItem from './account';

const DeleteAccessButton = connect(
    null,
    (dispatch, props) => {
        return {
            handleClick() {
                actions.showModal(dispatch, DELETE_ACCESS_MODAL_SLUG, props.accessId);
            }
        };
    }
)(props => {
    return (
        <button
            className="fa fa-times-circle"
            aria-label="remove access"
            onClick={props.handleClick}
            title={$t('client.settings.delete_access_button')}
        />
    );
});

DeleteAccessButton.propTypes = {
    // The account's unique id
    accessId: PropTypes.string.isRequired
};

const DisableAccessButton = connect(
    null,
    (dispatch, props) => {
        return {
            handleClick: () => actions.showModal(dispatch, DISABLE_MODAL_SLUG, props.accessId)
        };
    }
)(props => {
    return (
        <button
            className="fa fa-power-off enabled"
            aria-label="Disable access"
            onClick={props.handleClick}
            title={$t('client.settings.disable_access')}
        />
    );
});

DisableAccessButton.propsTypes = {
    // The unique string id of the access to be disabled.
    accessId: PropTypes.string.isRequired
};

const ShowEditAccessModalButton = connect(
    null,
    (dispatch, props) => {
        return {
            handleClick() {
                actions.showModal(dispatch, EDIT_ACCESS_MODAL_SLUG, props.accessId);
            }
        };
    }
)(props => {
    let className = `fa ${props.faIcon}`;
    return (
        <button
            className={className}
            aria-label={props.ariaLabel}
            onClick={props.handleClick}
            title={props.title}
        />
    );
});

ShowEditAccessModalButton.propTypes = {
    // The unique string id of the access to be updated.
    accessId: PropTypes.string.isRequired
};

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
                className="fa fa-refresh"
                aria-label="Reload accounts"
                onClick={props.handleSyncAccounts}
                title={$t('client.settings.reload_accounts_button')}
            />
        );
        maybeEditIcon = (
            <ShowEditAccessModalButton
                faIcon="fa-cog"
                title={$t('client.settings.change_password_button')}
                ariaLabel="Edit bank access"
                accessId={access.id}
            />
        );
        toggleEnableIcon = <DisableAccessButton accessId={access.id} />;
    } else {
        toggleEnableIcon = (
            <ShowEditAccessModalButton
                faIcon="fa-power-off"
                title={$t('client.settings.enable_access')}
                ariaLabel="Enable bank access"
                accessId={access.id}
            />
        );
    }

    return (
        <div key={`bank-access-item-${access.id}`}>
            <table className="no-vertical-border no-hover bank-accounts-list">
                <caption>
                    <div>
                        {toggleEnableIcon}
                        <h3>{displayLabel(access)}</h3>
                        <div className="actions">
                            {maybeFetchIcon}
                            {maybeEditIcon}
                            <DeleteAccessButton accessId={access.id} />
                        </div>
                    </div>
                </caption>
                <tbody>{accounts}</tbody>
            </table>
        </div>
    );
});
