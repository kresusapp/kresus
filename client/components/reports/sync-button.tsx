import { useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router';

import { handleSyncError } from '../../errors';
import { translate as $t, notify } from '../../helpers';
import { useKresusDispatch, useKresusState } from '../../store';
import * as BanksStore from '../../store/banks';
import { Account } from '../../models';
import AccessesURL from '../accesses/urls';

interface SyncButtonProps {
    // Account to be resynced.
    account: Account;
}

const SyncButton = (props: SyncButtonProps) => {
    const access = useKresusState(state =>
        BanksStore.accessById(state.banks, props.account.accessId)
    );
    const isDeprecated = useKresusState(
        state => BanksStore.bankByUuid(state.banks, access.vendorId).deprecated
    );

    const dispatch = useKresusDispatch();
    const navigate = useNavigate();
    const { pathname } = useLocation();

    const handleSync = useCallback(async () => {
        if (!access.enabled) {
            void navigate(AccessesURL.manualSync(access.id), { state: { backLink: pathname } });
            return;
        }
        try {
            const result = await dispatch(
                BanksStore.runTransactionsSync({
                    accessId: props.account.accessId,
                })
            ).unwrap();

            // There might be errors along with the values
            if (result && result.errors instanceof Array && result.errors.length) {
                notify.error(
                    $t('client.sync.partial_errors', {
                        errors: result.errors.map((err: string) => `”${err}”`).join(', '),
                    })
                );
            }
        } catch (err) {
            handleSyncError(err);
        }
    }, [access.enabled, access.id, dispatch, navigate, pathname, props.account.accessId]);

    if (isDeprecated) {
        return null;
    }

    const label = $t('client.transactions.sync_now');
    return (
        <span className="tooltipped tooltipped-n" aria-label={label}>
            <button type="button" onClick={handleSync} className="btn">
                <span className="fa fa-refresh" />
                <span>{$t('client.transactions.sync_now')}</span>
            </button>
        </span>
    );
};

export default SyncButton;
