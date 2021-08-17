import React, { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';

import { translate as $t, displayLabel, useKresusState, assert } from '../../helpers';
import { get, actions } from '../../store';

import AccountItem from './account';
import Label from '../ui/label';
import DisplayIf from '../ui/display-if';

import URL from './urls';

import { Popconfirm } from '../ui';
import { useNotifyError, useSyncError } from '../../hooks';

const AccessItem = (props: { accessId: number }) => {
    const access = useKresusState(state => {
        if (!get.accessExists(state, props.accessId)) {
            // Zombie child!
            return null;
        }
        return get.accessById(state, props.accessId);
    });
    const isDemoEnabled = useKresusState(state => get.isDemoMode(state));

    const dispatch = useDispatch();

    const handleSyncAccounts = useSyncError(
        useCallback(
            () => actions.runAccountsSync(dispatch, props.accessId),
            [dispatch, props.accessId]
        )
    );

    const handleDeleteAccess = useNotifyError(
        'client.general.unexpected_error',
        useCallback(
            () => actions.deleteAccess(dispatch, props.accessId),
            [dispatch, props.accessId]
        )
    );

    const setAccessCustomLabel = useNotifyError(
        'client.general.update_fail',
        useCallback(
            (customLabel: string) => {
                assert(access !== null, 'access not null');
                return actions.updateAccess(dispatch, props.accessId, { customLabel }, access);
            },
            [dispatch, access, props.accessId]
        )
    );

    const getLabel = useCallback(() => {
        assert(access !== null, 'access not null');
        return access.label;
    }, [access]);

    if (access === null) {
        // Zombie!
        return null;
    }

    const accounts = access.accountIds.map(id => {
        const enabled = access.enabled && !access.isBankVendorDeprecated;
        return <AccountItem key={id} accountId={id} enabled={enabled} />;
    });

    return (
        <div key={`bank-access-item-${access.id}`}>
            <table className="no-vertical-border no-hover bank-accounts-list">
                <caption>
                    <div>
                        <DisplayIf condition={!access.isBankVendorDeprecated}>
                            <div className={`icon icon-${access.vendorId}`} />
                        </DisplayIf>
                        <h3>
                            <Label
                                item={access}
                                setCustomLabel={setAccessCustomLabel}
                                getLabel={getLabel}
                                inputClassName={`light ${
                                    access.enabled ? 'text-bold' : 'text-italic'
                                }`}
                            />
                        </h3>
                        <div className="actions">
                            <DisplayIf condition={!access.isBankVendorDeprecated && access.enabled}>
                                <button
                                    type="button"
                                    className="fa fa-refresh"
                                    aria-label="Reload accounts"
                                    onClick={handleSyncAccounts}
                                    title={$t('client.settings.reload_accounts_button')}
                                />
                            </DisplayIf>

                            <Link className="fa fa-pencil" to={URL.edit(access.id)} />

                            <DisplayIf condition={!isDemoEnabled}>
                                <Popconfirm
                                    trigger={
                                        <button
                                            className="fa fa-times-circle popover-button"
                                            aria-label="remove access"
                                            title={$t('client.settings.delete_access_button')}
                                        />
                                    }
                                    onConfirm={handleDeleteAccess}>
                                    <p>
                                        {$t('client.settings.erase_access', {
                                            name: displayLabel(access),
                                        })}
                                    </p>
                                </Popconfirm>
                            </DisplayIf>
                        </div>
                    </div>
                </caption>
                <tbody>{accounts}</tbody>
            </table>
        </div>
    );
};

AccessItem.displayName = 'AccessItem';

export default AccessItem;
