import React, { useCallback } from 'react';

import { deleteRecurringTransaction } from '../../store/backend';

import { RecurringTransaction } from '../../models';

import { translate as $t, notify } from '../../helpers';

import Popconfirm from '../ui/popform';

const RecurringTransactionItem = (props: {
    onDelete: (id: number) => void;
    recurringTransaction: RecurringTransaction;
}) => {
    const { recurringTransaction: rt, onDelete } = props;

    const handleDelete = useCallback(async () => {
        try {
            await deleteRecurringTransaction(rt);

            onDelete(rt.id);

            notify.success($t('client.recurring_transactions.delete_success'));
        } catch (err: any) {
            notify.error($t('client.recurring_transactions.delete_error'));
        }
    }, [rt, onDelete]);

    return (
        <tr>
            <td>{rt.label}</td>
            <td>{$t(`client.${rt.type}`)}</td>
            <td>{rt.amount}</td>
            <td>{rt.dayOfMonth}</td>
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
