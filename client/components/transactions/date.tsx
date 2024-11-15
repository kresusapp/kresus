import React, { useCallback } from 'react';
import moment from 'moment';

import { useKresusDispatch } from '../../store';
import * as BanksStore from '../../store/banks';
import { formatDate, notify, translate as $t } from '../../helpers';

import ValidatedDatePicker from '../ui/validated-date-picker';
import { Transaction } from '../../models';
import { useGenericError } from '../../hooks';

interface Props {
    // The transaction from which to get the budget date.
    transaction: Transaction;
}

const DateComponent = (props: Props) => {
    const dispatch = useKresusDispatch();
    const setDate = useGenericError(
        useCallback(
            async (date: Date) => {
                // We must adjust the budget date so that it remains in sync with the real date.
                let budgetDate = props.transaction.budgetDate;
                if (budgetDate !== null) {
                    if (+budgetDate < +props.transaction.date) {
                        budgetDate = moment(date).date(15).subtract(1, 'months').toDate();
                    } else if (+budgetDate > +props.transaction.date) {
                        budgetDate = moment(date).date(15).add(1, 'months').toDate();
                    }
                }

                await dispatch(
                    BanksStore.setTransactionDate({
                        transaction: props.transaction,
                        date,
                        budgetDate,
                    })
                ).unwrap();

                let message = $t('client.transactions.date_update_success');
                if (budgetDate !== null) {
                    message += ` ${$t('client.transactions.date_update_success_budget_date_sync')}`;
                }
                notify.success(message);
            },
            [dispatch, props]
        )
    );

    if (props.transaction.createdByUser) {
        return (
            <ValidatedDatePicker
                onSelect={setDate}
                value={props.transaction.date}
                className="block"
                clearable={false}
            />
        );
    }

    return <span>{formatDate.toDayString(props.transaction.date)}</span>;
};

DateComponent.displayName = 'DateComponent';

export default DateComponent;
