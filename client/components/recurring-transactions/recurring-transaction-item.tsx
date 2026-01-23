import React, { useCallback, useRef, useImperativeHandle } from 'react';
import { useHistory } from 'react-router-dom';
import moment from 'moment';

import * as BankStore from '../../store/banks';
import { useKresusDispatch } from '../../store';

import { RecurringTransaction } from '../../models';

import { translate as $t, currency, notify } from '../../helpers';

import Popconfirm from '../ui/popform';
import { ButtonLink } from '../ui';
import { IfMobile, IfNotMobile } from '../ui/display-if';
import { useTableRowSwipeDetection } from '../ui/use-swipe';

import URL from '../../urls';

type RecurringTransactionItemProps = {
    recurringTransaction: RecurringTransaction;
    currency: string;
};

interface RecurringTransactionRef extends HTMLTableRowElement {
    openEditionView: () => void;
    delete: () => void;
}

const RecurringTransactionItem = React.forwardRef<
    RecurringTransactionRef,
    RecurringTransactionItemProps
>((props, ref) => {
    const history = useHistory();
    const innerDomRef = useRef<any>();
    const { recurringTransaction: rt } = props;
    const editionUrl = URL.editRecurringTransaction.url(rt.id);

    const dispatch = useKresusDispatch();

    const currencyFormatter = currency.makeFormat(props.currency);

    const handleDelete = useCallback(async () => {
        try {
            await dispatch(BankStore.deleteRecurringTransaction(rt)).unwrap();

            notify.success($t('client.recurring_transactions.delete_success'));
        } catch (err: any) {
            notify.error($t('client.recurring_transactions.delete_error'));
        }
    }, [rt, dispatch]);

    // Expose some methods related to the recurring transactions.
    useImperativeHandle(
        ref,
        () => {
            return Object.assign(innerDomRef.current, {
                openEditionView() {
                    if (!rt) {
                        return;
                    }

                    history.push(URL.editRecurringTransaction.url(rt.id));
                },

                async delete() {
                    if (!rt) {
                        return;
                    }

                    const confirmMessage = $t('client.recurring_transactions.delete_confirm');
                    if (window.confirm(confirmMessage)) {
                        await handleDelete();
                    }
                },
            });
        },
        [rt, history, handleDelete]
    );

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
        <tr ref={innerDomRef}>
            <IfMobile>
                <td className="swipeable-action swipeable-action-left">
                    <span>{$t('client.general.edit')}</span>
                    <span className="fa fa-edit" />
                </td>
            </IfMobile>

            <td className="label">{rt.label}</td>
            <td className="type">{$t(`client.${rt.type}`)}</td>
            <td className="amount">{currencyFormatter(rt.amount)}</td>
            <td className="day">{rt.dayOfMonth}</td>
            <td className="months">{months}</td>
            <IfNotMobile>
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
            </IfNotMobile>

            <IfMobile>
                <td className="swipeable-action swipeable-action-right">
                    <span className="fa fa-trash" />
                    <span>{$t('client.general.delete')}</span>
                </td>
            </IfMobile>
        </tr>
    );
});

export const SwipeableRecurringTransactionItem = (props: RecurringTransactionItemProps) => {
    let ref: React.RefObject<RecurringTransactionRef> | null = null;

    const openEditionView = useCallback(async () => {
        if (!ref || !ref.current) {
            return;
        }

        ref.current.openEditionView();
    }, [ref]);

    const deleteRecurringTransaction = useCallback(async () => {
        if (!ref || !ref.current) {
            return;
        }

        await ref.current.delete();
    }, [ref]);

    ref = useTableRowSwipeDetection<RecurringTransactionRef>(
        deleteRecurringTransaction,
        openEditionView
    );

    return <RecurringTransactionItem ref={ref} {...props} />;
};

export default RecurringTransactionItem;
