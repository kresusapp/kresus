import React, { useCallback } from 'react';

import { displayLabel, assert, assertHas, translate as $t, useKresusState } from '../../../helpers';
import * as BanksStore from '../../../store/banks';

import DeleteAlertButton from './confirm-delete';
import { Account, Alert } from '../../../models';
import { useDispatch } from 'react-redux';
import { useGenericError } from '../../../hooks';

const ReportItem = (props: {
    // The alert
    alert: Alert;

    // The account for which the alert is configured
    account: Account;
}) => {
    const access = useKresusState(state =>
        BanksStore.accessById(state.banks, props.account.accessId)
    );

    const dispatch = useDispatch();
    const onChangeFrequency = useGenericError(
        useCallback(
            async event => {
                const newValue = event.target.value;
                if (newValue === props.alert.order) {
                    return;
                }
                await dispatch(
                    BanksStore.updateAlert({
                        alertId: props.alert.id,
                        fields: {
                            frequency: newValue,
                        },
                    })
                );
            },
            [dispatch, props]
        )
    );

    const { account, alert } = props;

    assertHas(alert, 'frequency');
    assert(alert.type === 'report', 'must be a report');

    return (
        <tr>
            <td className="label">{`${displayLabel(access)} − ${displayLabel(account)}`}</td>
            <td className="condition">
                <span>{$t('client.settings.emails.send_report')}</span>
            </td>
            <td className="frequency">
                <select defaultValue={alert.frequency} onChange={onChangeFrequency}>
                    <option value="daily">{$t('client.settings.emails.daily')}</option>
                    <option value="weekly">{$t('client.settings.emails.weekly')}</option>
                    <option value="monthly">{$t('client.settings.emails.monthly')}</option>
                </select>
            </td>
            <td className="actions">
                <DeleteAlertButton alertId={alert.id} type="report" />
            </td>
        </tr>
    );
};

ReportItem.displayName = 'ReportItem';

export default ReportItem;
