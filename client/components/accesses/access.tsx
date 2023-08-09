import React, { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';

import { useKresusState, assert, translate as $t } from '../../helpers';
import { get, actions } from '../../store';

import AccountItem from './account';
import Label from '../ui/label';
import DisplayIf from '../ui/display-if';

import URL from './urls';

import { useNotifyError } from '../../hooks';

const AccessItem = (props: { accessId: number }) => {
    const access = useKresusState(state => {
        if (!get.accessExists(state, props.accessId)) {
            // Zombie child!
            return null;
        }
        return get.accessById(state, props.accessId);
    });

    const dispatch = useDispatch();

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
        return <AccountItem key={id} accountId={id} />;
    });

    const inactiveIcon = access.enabled ? null :
        <span
            className="tooltipped tooltipped-sw tooltipped-multiline"
            aria-label={$t('client.accesses.inactive_account')}>
            <span className="fa fa-stop-circle clickable" />
        </span>;

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
                                inputClassName={`light ${access.enabled ? 'text-bold' : null}`}
                            />
                        </h3>
                        {inactiveIcon}
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
