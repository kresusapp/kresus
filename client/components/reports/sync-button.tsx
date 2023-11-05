import React, { useCallback } from 'react';
import { useDispatch } from 'react-redux';

import { handleSyncError } from '../../errors';
import { translate as $t, formatDate, useKresusState } from '../../helpers';
import { actions, get } from '../../store';
import { Account } from '../../models';

interface SyncButtonProps {
    // Account to be resynced.
    account: Account;
}

const SyncButton = (props: SyncButtonProps) => {
    const access = useKresusState(state => get.accessById(state, props.account.accessId));
    const canBeSynced = useKresusState(state => {
        return !get.bankByUuid(state, access.vendorId).deprecated && access.enabled;
    });

    const dispatch = useDispatch();
    const handleSync = useCallback(async () => {
        try {
            await actions.runTransactionsSync(dispatch, props.account.accessId);
        } catch (err) {
            handleSyncError(err);
        }
    }, [dispatch, props]);

    const label = canBeSynced
        ? $t('client.transactions.sync_now')
        : $t('client.transactions.sync_disabled');
    return (
        <span className="tooltipped tooltipped-n" aria-label={label}>
            <button
                type="button"
                disabled={!canBeSynced}
                onClick={canBeSynced ? handleSync : undefined}
                className="btn">
                <span>
                    {$t('client.transactions.last_sync')}
                    &nbsp;
                    {formatDate.fromNow(props.account.lastCheckDate).toLowerCase()}
                </span>
                <span className="fa fa-refresh" />
            </button>
        </span>
    );
};

export default SyncButton;
