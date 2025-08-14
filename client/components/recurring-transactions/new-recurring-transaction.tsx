import React, { useCallback } from 'react';
import { useHistory, useParams } from 'react-router-dom';

import { notify, translate as $t } from '../../helpers';

import URL from '../../urls';

import { BackLink } from '../ui';

import * as BankStore from '../../store/banks';
import { useKresusDispatch } from '../../store';
import { RecurringTransaction } from '../../models';

import SharedForm from './form';

export default () => {
    const {
        accountId: accountIdStr,
        label: rawPredefinedLabel,
        amount: rawPredefinedAmount,
        day: rawPredefinedDay,
        type: predefinedType,
    } = useParams<{
        accountId: string;
        label?: string;
        amount?: string;
        day?: string;
        type?: string;
    }>();

    let predefinedLabel = rawPredefinedLabel;
    if (predefinedLabel) {
        predefinedLabel = window.decodeURIComponent(predefinedLabel);
    }

    let predefinedAmount = 0;
    if (rawPredefinedAmount) {
        predefinedAmount = Number.parseFloat(rawPredefinedAmount);
        if (isNaN(predefinedAmount)) {
            predefinedAmount = 0;
        }
    }

    let predefinedDay = 1;
    if (rawPredefinedDay) {
        predefinedDay = Number.parseInt(rawPredefinedDay, 10);
        if (Number.isNaN(predefinedDay) || predefinedDay < 1 || predefinedDay > 31) {
            predefinedDay = 1;
        }
    }

    const accountId = Number.parseInt(accountIdStr, 10);
    const listUrl = URL.accountRecurringTransactions.url(accountId);

    const history = useHistory();

    const dispatch = useKresusDispatch();

    const onSubmit = useCallback(
        async (formData: Omit<RecurringTransaction, 'id' | 'accountId'>) => {
            try {
                await dispatch(
                    BankStore.createRecurringTransaction({
                        accountId,
                        recurringTransaction: formData,
                    })
                ).unwrap();
            } catch (err: any) {
                notify.error($t('client.general.unexpected_error', { error: err.message }));
                return;
            }

            notify.success($t('client.recurring_transactions.creation_success'));
            history.push(listUrl);
        },
        [dispatch, accountId, history, listUrl]
    );

    const indexLink = <BackLink to={listUrl}>{$t('client.recurring_transactions.list')}</BackLink>;

    return (
        <SharedForm
            title={$t('client.recurring_transactions.new')}
            onSubmit={onSubmit}
            backLink={indexLink}
            initialValues={{
                type: predefinedType,
                label: predefinedLabel,
                amount: predefinedAmount,
                dayOfMonth: predefinedDay,
                listOfMonths: 'all',
            }}
            submitButtonLabel={$t('client.general.save')}
        />
    );
};
