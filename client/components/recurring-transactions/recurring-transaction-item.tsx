import React, { useCallback } from 'react';
import moment from 'moment';

import * as BankStore from '../../store/banks';
import { useKresusDispatch } from '../../store';

import { RecurringTransaction } from '../../models';

import { translate as $t, notify } from '../../helpers';

import Popconfirm from '../ui/popform';
import { ButtonLink } from '../ui';

import URL from '../../urls';

const RecurringTransactionItem = (props: { recurringTransaction: RecurringTransaction }) => {
    const { recurringTransaction: rt } = props;
    const editionUrl = URL.editRecurringTransaction.url(rt.id);

    const dispatch = useKresusDispatch();

    const handleDelete = useCallback(async () => {
        try {
            await dispatch(BankStore.deleteRecurringTransaction(rt)).unwrap();

            notify.success($t('client.recurring_transactions.delete_success'));
        } catch (err: any) {
            notify.error($t('client.recurring_transactions.delete_error'));
        }
    }, [rt, dispatch]);

    let months;
    if (rt.listOfMonths === 'all') {
        months = <span>{$t('client.recurring_transactions.all')}</span>;
    } else {
        const listOfMonths = rt.listOfMonths.split(';');
        if (listOfMonths.length === 1) {
            months = <span>{moment.months(parseInt(listOfMonths[0], 10) - 1)}</span>;
        } else {
            months = (
                <span
                    className="tooltipped"
                    aria-label={listOfMonths
                        .map(m => moment.months(parseInt(m, 10) - 1))
                        .join(', ')}>
                    {$t('client.recurring_transactions.several')}
                </span>
            );
        }
    }

    return (
        <tr>
            <td className="label">{rt.label}</td>
            <td className="type">{$t(`client.${rt.type}`)}</td>
            <td className="amount">{rt.amount}</td>
            <td className="day">{rt.dayOfMonth}</td>
            <td className="months">{months}</td>
            <td className="actions">
                <ButtonLink to={editionUrl} aria={$t('client.general.edit')} icon="edit" />
            </td>
            <td className="actions">
                <Popconfirm
                    trigger={
                        <button
                            className="btn danger"
                            aria-label={$t('client.recurring_transactions.delete')}
                            title={$t('client.recurring_transactions.delete')}>
                            <span className="fa fa-trash" />
                        </button>
                    }
                    onConfirm={handleDelete}>
                    <p>{$t('client.recurring_transactions.delete_confirm')}</p>
                </Popconfirm>
            </td>
        </tr>
    );
};

export default RecurringTransactionItem;
