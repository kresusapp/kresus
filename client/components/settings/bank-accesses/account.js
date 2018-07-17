import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import { translate as $t } from '../../../helpers';
import { actions, get } from '../../../store';

import { DELETE_ACCOUNT_MODAL_SLUG } from './confirm-delete-account';
import { ADD_OPERATION_MODAL_SLUG } from './add-operation-modal';
import { SYNC_ACCOUNT_MODAL_SLUG } from './sync-account-balance-modal';

const DeleteAccountButton = connect(
    null,
    (dispatch, props) => {
        return {
            handleClick() {
                actions.showModal(dispatch, DELETE_ACCOUNT_MODAL_SLUG, props.accountId);
            }
        };
    }
)(props => {
    return (
        <button
            className="pull-right fa fa-times-circle"
            aria-label="remove account"
            onClick={props.handleClick}
            title={$t('client.settings.delete_account_button')}
        />
    );
});

DeleteAccountButton.propTypes = {
    // The account's unique id
    accountId: PropTypes.string.isRequired
};

const SyncAccountButton = connect(
    null,
    (dispatch, props) => {
        return {
            handleShowSyncModal() {
                actions.showModal(dispatch, SYNC_ACCOUNT_MODAL_SLUG, props.accountId);
            }
        };
    }
)(props => {
    return (
        <button
            className="pull-right fa fa-cog"
            aria-label="Resync account balance"
            onClick={props.handleShowSyncModal}
            title={$t('client.settings.resync_account_button')}
        />
    );
});

SyncAccountButton.propTypes = {
    // The unique identifier of the account for which the balance has to be synced.
    accountId: PropTypes.string.isRequired
};

const AddOperationModalButton = connect(
    null,
    (dispatch, props) => {
        return {
            handleClick() {
                actions.showModal(dispatch, ADD_OPERATION_MODAL_SLUG, props.accountId);
            }
        };
    }
)(props => {
    return (
        <button
            className="pull-right fa fa-plus-circle"
            aria-label="Add an operation"
            onClick={props.handleClick}
            title={$t('client.settings.add_operation')}
        />
    );
});

AddOperationModalButton.propTypes = {
    // The account identifier for which we're adding an operation.
    accountId: PropTypes.string.isRequired
};

const formatIBAN = function(iban) {
    return iban.replace(/(.{4})(?!$)/g, '$1\xa0');
};

export default connect(
    (state, props) => {
        return {
            isDefaultAccount: get.defaultAccountId(state) === props.accountId,
            account: get.accountById(state, props.accountId)
        };
    },
    (dispatch, props) => {
        return {
            handleDeleteAccount: () => {
                actions.deleteAccount(dispatch, props.accountId);
            },
            handleSetDefault: () => {
                actions.setDefaultAccountId(dispatch, props.accountId);
            },
            updateAccount(update) {
                actions.updateAccount(dispatch, props.accountId, update);
            }
        };
    },
    (stateToProps, dispatchToProps, props) => {
        return {
            ...stateToProps,
            ...props,
            handleDeleteAccount: dispatchToProps.handleDeleteAccount,
            handleSetDefault: dispatchToProps.handleSetDefault,
            handleExcludeFromBalance() {
                dispatchToProps.updateAccount({
                    excludeFromBalance: !stateToProps.account.excludeFromBalance
                });
            }
        };
    }
)(props => {
    let a = props.account;

    let label = a.iban ? `${a.title} (IBAN\xa0:\xa0${formatIBAN(a.iban)})` : a.title;

    let selected;
    let setDefaultAccountTitle;

    if (props.isDefaultAccount) {
        setDefaultAccountTitle = '';
        selected = 'fa-star';
    } else {
        setDefaultAccountTitle = $t('client.settings.set_default_account');
        selected = 'fa-star-o';
    }

    // Show the balance sync button only if the related access is enabled.
    let maybeResyncIcon = null;
    if (props.enabled) {
        maybeResyncIcon = <SyncAccountButton accountId={a.id} />;
    }

    // Enable the ExcludedFromBalance icon if account is not excluded.
    let toggleExcludedFromBalanceIcon = null;
    if (a.excludeFromBalance) {
        toggleExcludedFromBalanceIcon = (
            <span
                className="pull-right fa fa-calculator"
                aria-label="Exclude from balance"
                onClick={props.handleExcludeFromBalance}
                title={$t('client.settings.include_in_balance')}
            />
        );
    } else {
        toggleExcludedFromBalanceIcon = (
            <span
                className="pull-right fa fa-calculator enabled"
                aria-label="Include in balance"
                onClick={props.handleExcludeFromBalance}
                title={$t('client.settings.exclude_from_balance')}
            />
        );
    }

    return (
        <tr key={`settings-bank-accesses-account-${a.id}`}>
            <td>
                <span
                    className={`clickable fa ${selected}`}
                    aria-hidden="true"
                    onClick={props.handleSetDefault}
                    title={setDefaultAccountTitle}
                />
            </td>
            <td>{label}</td>
            <td>
                <DeleteAccountButton accountId={a.id} />
                <AddOperationModalButton accountId={a.id} />
                {toggleExcludedFromBalanceIcon}
                {maybeResyncIcon}
            </td>
        </tr>
    );
});
