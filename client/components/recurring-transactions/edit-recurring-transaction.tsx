import React, { useCallback } from 'react';
import { useHistory, useParams } from 'react-router-dom';

import { notify, translate as $t } from '../../helpers';

import URL from '../../urls';

import { BackLink } from '../ui';

import * as BankStore from '../../store/banks';
import { useKresusDispatch, useKresusState } from '../../store';
import { RecurringTransaction } from '../../models';

import SharedForm from './form';

export default () => {
    const { id: rtIdStr } = useParams<{ id: string }>();

    const rtId = Number.parseInt(rtIdStr, 10);

    const history = useHistory();

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
            history.push(listUrl);
        },
        [dispatch, recurringTransaction, history, listUrl]
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
