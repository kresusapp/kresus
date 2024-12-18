import React, { useCallback } from 'react';
import { useHistory, useParams } from 'react-router-dom';

import { notify, translate as $t } from '../../helpers';

import URL from '../../urls';

import { BackLink } from '../ui';

import { createRecurringTransaction } from '../../store/backend';
import SharedForm from './form';
import { RecurringTransaction } from '../../models';

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

    const onSubmit = useCallback(
        async (formData: Omit<RecurringTransaction, 'id' | 'accountId'>) => {
            try {
                await createRecurringTransaction(accountId, formData);
            } catch (err: any) {
                notify.error($t('client.general.unexpected_error', { error: err.message }));
                return;
            }

            notify.success($t('client.recurring_transactions.creation_success'));
            history.push(listUrl);
        },
        [accountId, history, listUrl]
    );

    const indexLink = <BackLink to={listUrl}>{$t('client.recurring_transactions.list')}</BackLink>;

    return (
        <SharedForm
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
