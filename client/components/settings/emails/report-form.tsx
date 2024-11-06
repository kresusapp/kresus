import React, { useCallback, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';

import { assert, translate as $t } from '../../../helpers';
import * as BanksStore from '../../../store/banks';
import AccountSelector from '../../ui/account-select';
import { useGenericError } from '../../../hooks';
import { BackLink, Form } from '../../ui';
import URL from './urls';

const CreateReportForm = () => {
    const history = useHistory();
    const dispatch = useDispatch();

    const refSelectFrequency = useRef<HTMLSelectElement>(null);
    const refSelectAccount = useRef<{ value: number }>(null);

    const onSubmit = useGenericError(
        useCallback(async () => {
            assert(refSelectAccount.current !== null, 'account selector has been mounted');
            assert(refSelectFrequency.current !== null, 'frequency selector has been mounted');
            const frequency = refSelectFrequency.current.value;
            assert(
                frequency === 'daily' || frequency === 'weekly' || frequency === 'monthly',
                'frequency is known'
            );
            await dispatch(
                BanksStore.createAlert({
                    type: 'report',
                    accountId: refSelectAccount.current.value,
                    frequency,
                })
            ).unwrap();
            history.push(URL.all);
        }, [dispatch, history, refSelectAccount, refSelectFrequency])
    );

    return (
        <Form center={true} onSubmit={onSubmit}>
            <BackLink to={URL.all}>{$t('client.settings.emails.back_list')}</BackLink>

            <h3>{$t('client.settings.emails.add_report')}</h3>

            <Form.Input id="account" label={$t('client.settings.emails.account')}>
                <AccountSelector ref={refSelectAccount} />
            </Form.Input>

            <Form.Input id="frequency" label={$t('client.settings.emails.frequency')}>
                <select ref={refSelectFrequency}>
                    <option value="daily">{$t('client.settings.emails.daily')}</option>
                    <option value="weekly">{$t('client.settings.emails.weekly')}</option>
                    <option value="monthly">{$t('client.settings.emails.monthly')}</option>
                </select>
            </Form.Input>

            <button type="submit" className="btn success">
                {$t('client.settings.emails.create')}
            </button>
        </Form>
    );
};

CreateReportForm.displayName = 'CreateReportForm';

export default CreateReportForm;
