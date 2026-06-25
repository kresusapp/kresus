import React, { useCallback } from 'react';
import { useNavigate } from 'react-router';

import { assert, translate as $t, notify } from '../../helpers';
import { useRequiredParams, useSyncError } from '../../hooks';
import { useKresusDispatch, useKresusState } from '../../store';
import * as BanksStore from '../../store/banks';
import { AccessCustomField } from '../../models';

import { BackLink } from '../ui';
import CredentialsForm from './sync-form';
import URL from './urls';

export default () => {
    const { accountId: accountIdStr } = useRequiredParams<{ accountId: string }>();
    const accountId = Number.parseInt(accountIdStr, 10);

    const dispatch = useKresusDispatch();
    const navigate = useNavigate();

    const backLink = URL.editAccount(accountId);

    const account = useKresusState(state => {
        if (!BanksStore.accountExists(state.banks, accountId)) {
            return null;
        }
        return BanksStore.accountById(state.banks, accountId);
    });
    const access = useKresusState(state => {
        if (account === null) return null;
        return BanksStore.accessById(state.banks, account.accessId);
    });
    const bankDesc = useKresusState(state => {
        if (access === null) return null;
        return BanksStore.bankByUuid(state.banks, access.vendorId);
    });

    const onSubmit = useSyncError(
        useCallback(
            async (customFieldsArray: AccessCustomField[], _storeCredentials: boolean) => {
                await dispatch(
                    BanksStore.resyncBalance({ accountId, fields: customFieldsArray })
                ).unwrap();
                notify.success($t('client.settings.resync_account.success'));
                void navigate(backLink);
            },
            [dispatch, accountId, navigate, backLink]
        )
    );

    if (account === null || access === null) {
        return null;
    }
    assert(bankDesc !== null, 'bank descriptor must be set at this point');

    return (
        <>
            <BackLink to={backLink}>{$t('client.accesses.back_to_account_edition')}</BackLink>

            <CredentialsForm
                bankDesc={bankDesc}
                accessCustomFields={access.customFields}
                initialStoreCredentials={false}
                showStoreCredentials={false}
                onSubmit={onSubmit}
            />
        </>
    );
};
