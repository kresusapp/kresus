import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import { translate as $t } from '../../../helpers';
import { actions, get } from '../../../store';

import DisplayIf from '../../ui/display-if';
import LabelComponent from '../../ui/label';

import { DELETE_ACCOUNT_MODAL_SLUG } from './confirm-delete-account';
import { SYNC_ACCOUNT_MODAL_SLUG } from './sync-account-balance-modal';

const AccountLabelComponent = connect(
    null,
    (dispatch, props) => {
        return {
            setCustomLabel(label) {
                actions.updateAccount(
                    dispatch,
                    props.item.id,
                    {
                        customLabel: label
                    },
                    {
                        customLabel: props.item.customLabel
                    }
                );
            },
            getLabel() {
                return props.item.label.trim();
            }
        };
    }
)(LabelComponent);

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
            className="fa fa-times-circle"
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
            className="fa fa-cog"
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

const formatIBAN = function(iban) {
    return iban.replace(/(.{4})(?!$)/g, '$1\xa0');
};

export default connect(
    (state, props) => {
        return {
            isDefaultAccount: get.defaultAccountId(state) === props.accountId,
            account: get.accountById(state, props.accountId),
            isDemoEnabled: get.isDemoMode(state)
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
            updateAccount(update, previousAttributes) {
                actions.updateAccount(dispatch, props.accountId, update, previousAttributes);
            }
        };
    },

    (stateToProps, dispatchToProps, props) => {
        let currentExcludeFromBalance = stateToProps.account.excludeFromBalance;
        return {
            ...stateToProps,
            ...props,
            handleDeleteAccount: dispatchToProps.handleDeleteAccount,
            handleSetDefault: dispatchToProps.handleSetDefault,
            handleExcludeFromBalance() {
                dispatchToProps.updateAccount(
                    {
                        excludeFromBalance: !currentExcludeFromBalance
                    },
                    {
                        excludeFromBalance: currentExcludeFromBalance
                    }
                );
            }
        };
    }
)(props => {
    let a = props.account;

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
            <button
                className="fa fa-calculator"
                aria-label="Exclude from balance"
                onClick={props.handleExcludeFromBalance}
                title={$t('client.settings.include_in_balance')}
            />
        );
    } else {
        toggleExcludedFromBalanceIcon = (
            <button
                className="fa fa-calculator enabled"
                aria-label="Include in balance"
                onClick={props.handleExcludeFromBalance}
                title={$t('client.settings.exclude_from_balance')}
            />
        );
    }

    let maybeIban = a.iban ? $t('client.settings.iban', { iban: formatIBAN(a.iban) }) : null;

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
            <td className="account-label">
                <AccountLabelComponent item={a} inputClassName="light" />
            </td>
            <td className="iban">{maybeIban}</td>
            <td className="actions">
                {maybeResyncIcon}
                {toggleExcludedFromBalanceIcon}
                <DisplayIf condition={!props.isDemoEnabled}>
                    <DeleteAccountButton accountId={a.id} />
                </DisplayIf>
            </td>
        </tr>
    );
});
