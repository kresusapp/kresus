import React, { useCallback } from 'react';
import { useDispatch } from 'react-redux';

import { assert, translate as $t, useKresusState } from '../../helpers';
import { actions, get } from '../../store';
import { Account } from '../../models';

import { Popconfirm } from '../ui';
import DisplayIf from '../ui/display-if';
import LabelComponent from '../ui/label';
import { useNotifyError, useSyncError } from '../../hooks';

const AccountLabelComponent = (props: { item: Account; inputClassName: string }) => {
    const dispatch = useDispatch();
    const setCustomLabel = useNotifyError(
        'client.general.update_fail',
        useCallback(
            async label => {
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
            [dispatch, props.item]
        )
    );

    const getLabel = useCallback(() => {
        return props.item.label.trim();
    }, [props.item]);

    return (
        <LabelComponent
            item={props.item}
            getLabel={getLabel}
            setCustomLabel={setCustomLabel}
            inputClassName={props.inputClassName}
        />
    );
};

const SyncAccount = (props: { accountId: number }) => {
    const dispatch = useDispatch();
    const handleConfirm = useSyncError(
        useCallback(
            () => actions.resyncBalance(dispatch, props.accountId),
            [dispatch, props.accountId]
        )
    );

    return (
        <Popconfirm
            trigger={
                <button
                    className="fa fa-cog"
                    aria-label="Resync account balance"
                    title={$t('client.settings.resync_account_button')}
                />
            }
            onConfirm={handleConfirm}
            confirmClass="warning"
            confirmText={$t('client.settings.resync_account.submit')}>
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
};

const formatIBAN = (iban: string) => {
    return iban.replace(/(.{4})(?!$)/g, '$1\xa0');
};

export default (props: { accountId: number; enabled: boolean }) => {
    const account = useKresusState(state => {
        if (!get.accountExists(state, props.accountId)) {
            // Zombie!
            return null;
        }
        return get.accountById(state, props.accountId);
    });

    const isDemoEnabled = useKresusState(state => get.isDemoMode(state));
    const dispatch = useDispatch();
    const handleDeleteAccount = useCallback(() => {
        return actions.deleteAccount(dispatch, props.accountId);
    }, [dispatch, props.accountId]);
    const updateAccount = useCallback(
        (update, previousAttributes) => {
            return actions.updateAccount(dispatch, props.accountId, update, previousAttributes);
        },
        [dispatch, props.accountId]
    );

    const handleExcludeFromBalance = useCallback(() => {
        assert(account !== null, 'account not null');
        return updateAccount(
            { excludeFromBalance: !account.excludeFromBalance },
            { excludeFromBalance: account.excludeFromBalance }
        );
    }, [updateAccount, account]);

    if (account === null) {
        // Zombie!
        return null;
    }

    // Show the balance sync button only if the related access is enabled.
    let maybeResyncIcon = null;
    if (props.enabled) {
        maybeResyncIcon = <SyncAccount accountId={account.id} />;
    }

    // Enable the ExcludedFromBalance icon if account is not excluded.
    let toggleExcludedFromBalanceIcon = null;
    if (account.excludeFromBalance) {
        toggleExcludedFromBalanceIcon = (
            <button
                className="fa fa-calculator"
                aria-label="Exclude from balance"
                onClick={handleExcludeFromBalance}
                title={$t('client.settings.include_in_balance')}
            />
        );
    } else {
        toggleExcludedFromBalanceIcon = (
            <button
                className="fa fa-calculator enabled"
                aria-label="Include in balance"
                onClick={handleExcludeFromBalance}
                title={$t('client.settings.exclude_from_balance')}
            />
        );
    }

    const maybeIban = account.iban
        ? $t('client.settings.iban', { iban: formatIBAN(account.iban) })
        : null;

    return (
        <tr key={`settings-bank-accesses-account-${account.id}`}>
            <td className="account-label">
                <AccountLabelComponent item={account} inputClassName="light" />
            </td>
            <td className="iban">{maybeIban}</td>
            <td className="actions">
                {maybeResyncIcon}
                {toggleExcludedFromBalanceIcon}
                <DisplayIf condition={!isDemoEnabled}>
                    <Popconfirm
                        trigger={
                            <button
                                className="fa fa-times-circle"
                                aria-label="remove account"
                                title={$t('client.settings.delete_account_button')}
                            />
                        }
                        onConfirm={handleDeleteAccount}>
                        <p>{$t('client.settings.erase_account', { label: account.label })}</p>
                    </Popconfirm>
                </DisplayIf>
            </td>
        </tr>
    );
};
