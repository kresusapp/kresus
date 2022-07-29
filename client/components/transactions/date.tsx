import React, { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import moment from 'moment';

import { actions } from '../../store';
import { formatDate, notify, translate as $t } from '../../helpers';

import ValidatedDatePicker from '../ui/validated-date-picker';
import { Operation } from '../../models';
import { useGenericError } from '../../hooks';

interface Props {
    // The operation from which to get the budget date.
    transaction: Operation;
}

const DateComponent = (props: Props) => {
    const dispatch = useDispatch();
    const setDate = useGenericError(
        useCallback(
            async (date: Date) => {
                // We must adjust the budget date so that it remains in sync with the real date.
                let budgetDate = props.transaction.budgetDate;
                if (+budgetDate < +props.transaction.date) {
                    budgetDate = moment(date).date(15).subtract(1, 'months').toDate();
                } else if (+budgetDate > +props.transaction.date) {
                    budgetDate = moment(date).date(15).add(1, 'months').toDate();
                } else {
                    budgetDate = date;
                }

                await actions.setOperationDate(dispatch, props.transaction, date, budgetDate);
                notify.success($t('client.operations.date_update_success'));
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
