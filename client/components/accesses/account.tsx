import React, { useCallback } from 'react';
import { Link } from 'react-router-dom';

import { useKresusState } from '../../helpers';
import { useKresusDispatch } from '../../store';
import * as BanksStore from '../../store/banks';
import { Account } from '../../models';

import LabelComponent from '../ui/label';
import { useNotifyError } from '../../hooks';

import URL from './urls';

const AccountLabelComponent = (props: { item: Account; inputClassName: string }) => {
    const dispatch = useKresusDispatch();
    const setCustomLabel = useNotifyError(
        'client.general.update_fail',
        useCallback(
            async label => {
                await dispatch(
                    BanksStore.updateAccount({
                        accountId: props.item.id,
                        newFields: {
                            customLabel: label,
                        },
                        prevFields: {
                            customLabel: props.item.customLabel,
                        },
                    })
                ).unwrap();
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

export default (props: { accountId: number }) => {
    const account = useKresusState(state => {
        if (!BanksStore.accountExists(state.banks, props.accountId)) {
            // Zombie!
            return null;
        }
        return BanksStore.accountById(state.banks, props.accountId);
    });

    if (account === null) {
        // Zombie!
        return null;
    }

    return (
        <tr key={`settings-bank-accesses-account-${account.id}`}>
            <td className="account-label">
                <AccountLabelComponent item={account} inputClassName="light" />
            </td>
            <td className="actions">
                <Link className="fa fa-pencil" to={URL.editAccount(account.id)} />
            </td>
        </tr>
    );
};
