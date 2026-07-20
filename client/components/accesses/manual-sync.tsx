import { useCallback, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router';

import { assert, translate as $t, notify } from '../../helpers';
import { useSyncError, useRequiredParams } from '../../hooks';
import { useKresusDispatch, useKresusState } from '../../store';
import * as BanksStore from '../../store/banks';
import { Access, AccessCustomField, Bank } from '../../models';

import { BackLink } from '../ui';
import CredentialsForm from './sync-form';

const ManualSync = (props: { access: Access; bankDesc: Bank; backLink: string }) => {
    const { access, bankDesc, backLink } = props;

    const navigate = useNavigate();
    const dispatch = useKresusDispatch();

    const backLinkRef = useRef<HTMLParagraphElement>(null);
    useEffect(() => {
        if (backLinkRef.current !== null) {
            backLinkRef.current.scrollIntoView(false);
        }
    });

    const onSubmit = useSyncError(
        useCallback(
            async (customFieldsArray: AccessCustomField[], storeCredentials: boolean) => {
                // When an access is enabled we call BanksStore.runTransactionsSync, however
                // in this case we choose to call BanksStore.updateAndFetchAccess to allow
                // to  re-enable the access at the same time by storing credentials.
                await dispatch(
                    BanksStore.updateAndFetchAccess({
                        accessId: access.id,
                        customFields: customFieldsArray,
                        storeCredentials,
                    })
                ).unwrap();
                notify.success($t('client.editaccess.success'));
                void navigate(backLink);
            },
            [access.id, dispatch, navigate, backLink]
        )
    );

    return (
        <>
            <p className="alerts info">{$t('client.transactions.sync_disabled')}</p>

            <p ref={backLinkRef}>
                <BackLink to={backLink}>{$t('client.transactions.back_to_report')}</BackLink>
            </p>

            <CredentialsForm
                bankDesc={bankDesc}
                accessCustomFields={access.customFields}
                initialStoreCredentials={access.enabled}
                onSubmit={onSubmit}
            />
        </>
    );
};

export { ManualSync };

export default () => {
    const { accessId: accessIdStr } = useRequiredParams<{ accessId: string }>();
    const accessId = Number.parseInt(accessIdStr, 10);

    const { state: locationState } = useLocation();
    const backLink: string = locationState?.backLink ?? '/';

    const access = useKresusState(state => {
        if (!BanksStore.accessExists(state.banks, accessId)) {
            return null;
        }
        return BanksStore.accessById(state.banks, accessId);
    });
    const bankDesc = useKresusState(state => {
        if (access === null) return null;
        return BanksStore.bankByUuid(state.banks, access.vendorId);
    });

    if (access === null) {
        return null;
    }
    assert(bankDesc !== null, 'bank descriptor must be set at this point');

    return <ManualSync access={access} bankDesc={bankDesc} backLink={backLink} />;
};
