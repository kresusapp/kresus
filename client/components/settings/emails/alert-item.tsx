import React, { createRef, useCallback } from 'react';

import { assert, translate as $t, displayLabel } from '../../../helpers';
import { useKresusDispatch, useKresusState } from '../../../store';
import * as BanksStore from '../../../store/banks';

import DeleteAlertButton from './confirm-delete';
import AmountInput, { AmountInputRef } from '../../ui/amount-input';
import { Account, Alert } from '../../../models';
import { useGenericError } from '../../../hooks';

const AlertItem = (props: {
    // Description of the type of alert.
    sendIfText: string;

    // The alert object itself.
    alert: Alert;

    // The account for which the alert is configured.
    account: Account;
}) => {
    const access = useKresusState(state =>
        BanksStore.accessById(state.banks, props.account.accessId)
    );
    const dispatch = useKresusDispatch();

    const update = useGenericError(
        useCallback(
            async (newFields: Partial<Alert>) => {
                await dispatch(
                    BanksStore.updateAlert({ alertId: props.alert.id, fields: newFields })
                ).unwrap();
            },
            [dispatch, props]
        )
    );

    // TODO hoist this logic in the above component?
    const handleSelect = useCallback(
        async (event: React.ChangeEvent<HTMLSelectElement>) => {
            const newValue = event.target.value as string;
            if (newValue === props.alert.order) {
                return;
            }
            await update({ order: newValue });
        },
        [props, update]
    );

    const refAmountInput = createRef<AmountInputRef>();

    const { account, alert } = props;
    const { limit, type, id } = alert;
    assert(typeof limit !== 'undefined', 'must have a limit');

    const handleChangeLimit = useCallback(
        async (value: number | null) => {
            assert(refAmountInput.current !== null, 'amount input has been mounted');
            assert(typeof limit !== 'undefined', 'must have a limit');
            if (value === null || Number.isNaN(value)) {
                refAmountInput.current.reset();
                return;
            }
            if (Math.abs(value - limit) <= 0.001) {
                return;
            }
            await update({ limit: value });
        },
        [limit, refAmountInput, update]
    );

    // Only balance alerts can have negative values, others are absolute.
    let displayLimit = limit;
    if (displayLimit !== null && type !== 'balance') {
        displayLimit = Math.abs(displayLimit);
    }

    return (
        <tr>
            <td className="label">{`${displayLabel(access)} − ${displayLabel(account)}`}</td>
            <td className="condition">
                <span>{props.sendIfText}</span>
            </td>
            <td className="amount">
                <select defaultValue={alert.order} onChange={handleSelect}>
                    <option value="gt">{$t('client.settings.emails.greater_than')}</option>
                    <option value="lt">{$t('client.settings.emails.less_than')}</option>
                </select>

                <AmountInput
                    ref={refAmountInput}
                    defaultValue={displayLimit}
                    onInput={handleChangeLimit}
                    togglable={type === 'balance'}
                    signId={`alert-limit-sign-${id}`}
                    currencySymbol={account.currencySymbol}
                    className="input-group-money"
                />
            </td>
            <td className="actions">
                <DeleteAlertButton alertId={alert.id} type="alert" />
            </td>
        </tr>
    );
};

AlertItem.displayName = 'AlertItem';

export default AlertItem;
