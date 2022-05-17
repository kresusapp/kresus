import React, { useCallback } from 'react';
import { useDispatch } from 'react-redux';

import { useKresusState } from '../../helpers';
import { actions, get } from '../../store';
import { Account } from '../../models';

import LabelComponent from '../ui/label';
import { useNotifyError } from '../../hooks';

import URL from './urls';
import { Link } from 'react-router-dom';

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

export default (props: { accountId: number }) => {
    const account = useKresusState(state => {
        if (!get.accountExists(state, props.accountId)) {
            // Zombie!
            return null;
        }
        return get.accountById(state, props.accountId);
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
