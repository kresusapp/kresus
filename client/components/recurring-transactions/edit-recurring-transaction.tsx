import React, { useCallback } from 'react';
import { useNavigate } from 'react-router';

import { notify, translate as $t } from '../../helpers';
import { useRequiredParams } from '../../hooks';

import URL from '../../urls';

import { BackLink } from '../ui';

import * as BankStore from '../../store/banks';
import { useKresusDispatch, useKresusState } from '../../store';
import { RecurringTransaction } from '../../models';

import SharedForm from './form';

export default () => {
    const { id: rtIdStr } = useRequiredParams<{ id: string }>();

    const rtId = Number.parseInt(rtIdStr, 10);

    const navigate = useNavigate();

    const dispatch = useKresusDispatch();

    const recurringTransaction = useKresusState(state => {
        return BankStore.getRecurringTransactionById(state.banks, rtId);
    });

    const listUrl = recurringTransaction
        ? URL.accountRecurringTransactions.url(recurringTransaction.accountId)
        : '';

    const onSubmit = useCallback(
        async (formData: Omit<RecurringTransaction, 'id' | 'accountId'>) => {
            if (!recurringTransaction) {
                return;
            }

            try {
                await dispatch(
                    BankStore.updateRecurringTransaction({
                        ...formData,
                        accountId: recurringTransaction.accountId,
                        id: recurringTransaction.id,
                    })
                ).unwrap();
            } catch (err: any) {
                notify.error($t('client.general.unexpected_error', { error: err.message }));
                return;
            }

            notify.success($t('client.recurring_transactions.edition_success'));
            navigate(listUrl);
        },
        [dispatch, recurringTransaction, navigate, listUrl]
    );

    if (!recurringTransaction) {
        return null;
    }

    const indexLink = <BackLink to={listUrl}>{$t('client.recurring_transactions.list')}</BackLink>;

    return (
        <SharedForm
            title={$t('client.general.edit')}
            onSubmit={onSubmit}
            backLink={indexLink}
            initialValues={recurringTransaction}
            submitButtonLabel={$t('client.general.save')}
        />
    );
};
