import React from 'react';
import { connect } from 'react-redux';

import { translate as $t, displayLabel, decorateNotifyError } from '../../helpers';
import { actions, get } from '../../store';

import { Popconfirm } from '../ui';
import DisplayIf from '../ui/display-if';
import LabelComponent from '../ui/label';

const AccountLabelComponent = connect(null, (dispatch, props) => {
    return {
        @decorateNotifyError('client.general.update_fail')
        async setCustomLabel(label) {
            await actions.updateAccount(
                dispatch,
                props.item.id,
                {
                    customLabel: label,
                },
                {
                    customLabel: props.item.customLabel,
                }
            );
        },

        getLabel() {
            return props.item.label.trim();
        },
    };
})(LabelComponent);

const SyncAccount = connect(
    (state, props) => {
        let accountId = props.accountId;
        let account = get.accountById(state, accountId);
        let label = account ? displayLabel(account) : null;
        return {
            label,
            accountId,
        };
    },
    (dispatch, props) => {
        return {
            resyncBalance() {
                actions.resyncBalance(dispatch, props.accountId);
            },
        };
    },
    ({ label, accountId }, { resyncBalance }) => {
        return {
            label,
            async handleConfirm() {
                await resyncBalance(accountId);
            },
        };
    }
)(props => {
    return (
        <Popconfirm
            trigger={
                <button
                    className="fa fa-cog"
                    aria-label="Resync account balance"
                    title={$t('client.settings.resync_account_button')}
                />
            }
            onConfirm={props.handleConfirm}
            confirmClass="warning"
            confirmText={$t('client.settings.resync_account.submit')}>
            <h3>{$t('client.settings.resync_account.title', { label: props.label })}</h3>

            <p>{$t('client.settings.resync_account.make_sure')}</p>
            <ul className="bullet">
                <li>{$t('client.settings.resync_account.sync_operations')}</li>
                <li>{$t('client.settings.resync_account.manage_duplicates')}</li>
                <li>{$t('client.settings.resync_account.add_operation')}</li>
                <li>{$t('client.settings.resync_account.delete_operation')}</li>
            </ul>
            <p>{$t('client.settings.resync_account.are_you_sure')}</p>
        </Popconfirm>
    );
});

const formatIBAN = iban => {
    return iban.replace(/(.{4})(?!$)/g, '$1\xa0');
};

export default connect(
    (state, props) => {
        return {
            account: get.accountById(state, props.accountId),
            isDemoEnabled: get.isDemoMode(state),
        };
    },

    (dispatch, props) => {
        return {
            handleDeleteAccount: () => {
                actions.deleteAccount(dispatch, props.accountId);
            },
            updateAccount(update, previousAttributes) {
                actions.updateAccount(dispatch, props.accountId, update, previousAttributes);
            },
        };
    },

    (stateToProps, dispatchToProps, props) => {
        let excludeFromBalance = stateToProps.account.excludeFromBalance;
        return {
            ...stateToProps,
            ...props,
            handleDeleteAccount: dispatchToProps.handleDeleteAccount,
            handleSetDefault: dispatchToProps.handleSetDefault,
            handleExcludeFromBalance() {
                dispatchToProps.updateAccount(
                    {
                        excludeFromBalance: !excludeFromBalance,
                    },
                    {
                        excludeFromBalance,
                    }
                );
            },
        };
    }
)(props => {
    let a = props.account;

    // Show the balance sync button only if the related access is enabled.
    let maybeResyncIcon = null;
    if (props.enabled) {
        maybeResyncIcon = <SyncAccount accountId={a.id} />;
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
            <td className="account-label">
                <AccountLabelComponent item={a} inputClassName="light" />
            </td>
            <td className="iban">{maybeIban}</td>
            <td className="actions">
                {maybeResyncIcon}
                {toggleExcludedFromBalanceIcon}
                <DisplayIf condition={!props.isDemoEnabled}>
                    <Popconfirm
                        trigger={
                            <button
                                className="fa fa-times-circle"
                                aria-label="remove account"
                                title={$t('client.settings.delete_account_button')}
                            />
                        }
                        onConfirm={props.handleDeleteAccount}>
                        <h4>{$t('client.confirmdeletemodal.title')}</h4>
                        <p>{$t('client.settings.erase_account', { label: a.label })}</p>
                    </Popconfirm>
                </DisplayIf>
            </td>
        </tr>
    );
});
