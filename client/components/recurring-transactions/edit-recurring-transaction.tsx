import { useCallback } from 'react';
import { Navigate, useNavigate } from 'react-router';

import { translate as $t, notify } from '../../helpers';
import { useRequiredParams } from '../../hooks';
import type { RecurringTransaction } from '../../models';
import { useKresusDispatch, useKresusState } from '../../store';

import * as BankStore from '../../store/banks';
import URL from '../../urls';
import { BackLink } from '../ui';

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
        // If we didn't find the recurring transaction, the best we can do is redirect to the list
        // of recurring transactions, since we have no ideas to which account the not-found
        // recurring transaction could have been related.
        return <Navigate to={URL.recurringTransactions.pattern} />;
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
