import React, { useCallback, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';

import { assert, translate as $t } from '../../../helpers';
import * as BanksStore from '../../../store/banks';

import AccountSelector from '../../ui/account-select';
import AmountInput from '../../ui/amount-input';
import { useHistory, useParams } from 'react-router-dom';
import { BackLink, Form } from '../../ui';
import URL from './urls';
import { useGenericError } from '../../../hooks';

const AlertForm = () => {
    const { type } = useParams<{ type: 'balance' | 'transaction' }>();
    assert(type === 'balance' || type === 'transaction', 'subset of valid types');

    const dispatch = useDispatch();

    const [limit, setLimit] = useState<number | null>(null);

    const refSelectOrder = useRef<HTMLSelectElement | null>(null);
    const refSelectAccount = useRef<{ value: number } | null>(null);

    const history = useHistory();
    const onSubmit = useGenericError(
        useCallback(async () => {
            assert(type !== null, 'type must be set');
            assert(limit !== null, 'limit must be set');

            assert(refSelectOrder.current !== null, 'order select has been mounted');
            assert(refSelectAccount.current !== null, 'account select has been mounted');
            const accountId = refSelectAccount.current.value;
            const order = refSelectOrder.current.value;
            assert(order === 'lt' || order === 'gt', 'possible values for order');

            await dispatch(
                BanksStore.createAlert({
                    type,
                    limit,
                    accountId,
                    order,
                })
            );

            history.push(URL.all);
        }, [dispatch, history, type, limit, refSelectOrder, refSelectAccount])
    );

    const isBalanceAlert = type === 'balance';
    const isSubmitDisabled = limit === null || Number.isNaN(limit);

    // Only balance alerts can have negative values, others are absolute.
    let displayLimit = limit;
    if (displayLimit !== null && !isBalanceAlert) {
        displayLimit = Math.abs(displayLimit);
    }

    return (
        <Form center={true} onSubmit={onSubmit}>
            <BackLink to={URL.all}>{$t('client.settings.emails.back_list')}</BackLink>

            <h3>{$t(`client.settings.emails.add_${type}`)}</h3>

            <Form.Input id="account" label={$t('client.settings.emails.account')}>
                <AccountSelector ref={refSelectAccount} />
            </Form.Input>

            <Form.Input
                id="order-select"
                dontPropagateId={true}
                label={$t(`client.settings.emails.send_if_${type}_is`)}>
                <div className="balance-inputs">
                    <select id="order-select" ref={refSelectOrder}>
                        <option value="gt">{$t('client.settings.emails.greater_than')}</option>
                        <option value="lt">{$t('client.settings.emails.less_than')}</option>
                    </select>
                    <AmountInput
                        defaultValue={displayLimit}
                        togglable={isBalanceAlert}
                        onChange={setLimit}
                        signId="sign-alert"
                    />
                </div>
            </Form.Input>

            <button className="btn success" disabled={isSubmitDisabled}>
                {$t('client.settings.emails.create')}
            </button>
        </Form>
    );
};

AlertForm.displayName = 'AlertForm';

export default AlertForm;
