import React, { useCallback } from 'react';
import { Link } from 'react-router-dom';

import { useKresusDispatch, useKresusState } from '../../store';
import { assert } from '../../helpers';
import * as BanksStore from '../../store/banks';

import AccountItem from './account';
import Label from '../ui/label';
import DisplayIf from '../ui/display-if';

import URL from './urls';

import { useNotifyError } from '../../hooks';

const AccessItem = (props: { accessId: number }) => {
    const access = useKresusState(state => {
        if (!BanksStore.accessExists(state.banks, props.accessId)) {
            // Zombie child!
            return null;
        }
        return BanksStore.accessById(state.banks, props.accessId);
    });

    const dispatch = useKresusDispatch();

    const setAccessCustomLabel = useNotifyError(
        'client.general.update_fail',
        useCallback(
            async (customLabel: string) => {
                assert(access !== null, 'access not null');
                await dispatch(
                    BanksStore.updateAccess({
                        accessId: props.accessId,
                        newFields: { customLabel },
                        prevFields: access,
                    })
                ).unwrap();
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
        return <AccountItem key={id} accountId={id} />;
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
                            <Link className="fa fa-pencil" to={URL.editAccess(access.id)} />
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
