import React, { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import moment from 'moment';

import { translate as $t } from '../../helpers';
import { actions } from '../../store';

import './budget-date.css';
import { Operation } from '../../models';
import { useGenericError } from '../../hooks';

interface Props {
    // The operation from which to get the budget date.
    operation: Operation;
}

function toggleButton(label: string, toggled: boolean, icon: string, onclick: () => void) {
    const toggleButtonClass = toggled ? 'btn info active' : 'btn';
    return (
        <button
            type="button"
            onClick={onclick}
            className={`${toggleButtonClass} budget-assignment`}>
            <i className={`fa ${icon}`} />
            <span>{label}</span>
        </button>
    );
}

const BudgetDateComponent = (props: Props) => {
    // Cheat a bit by putting the date of month as the 15, to avoid any
    // timezone conflict when using any of the edge days (start or end
    // of month).
    const previousMonth = moment(props.operation.date).date(15).subtract(1, 'months').toDate();
    const followingMonth = moment(props.operation.date).date(15).add(1, 'months').toDate();

    const dispatch = useDispatch();
    const setBudgetDate = useGenericError(
        useCallback(
            (date: Date | null) => actions.setOperationBudgetDate(dispatch, props.operation, date),
            [dispatch, props]
        )
    );

    const handleTogglePreviousMonth = useCallback(async () => {
        if (+props.operation.budgetDate !== +previousMonth) {
            await setBudgetDate(previousMonth);
        }
    }, [props, setBudgetDate, previousMonth]);

    const handleToggleCurrentMonth = useCallback(async () => {
        if (+props.operation.budgetDate !== +props.operation.date) {
            await setBudgetDate(null);
        }
    }, [props, setBudgetDate]);

    const handleToggleFollowingMonth = useCallback(async () => {
        if (+props.operation.budgetDate !== +followingMonth) {
            await setBudgetDate(followingMonth);
        }
    }, [props, setBudgetDate, followingMonth]);

    return (
        <div className="budget-date buttons-group" role="group">
            {toggleButton(
                $t('client.operations.assign_to_previous_month'),
                +props.operation.budgetDate === +previousMonth,
                'fa-calendar-minus-o',
                handleTogglePreviousMonth
            )}
            {toggleButton(
                $t('client.operations.assign_to_current_month'),
                +props.operation.budgetDate === +props.operation.date,
                'fa-calendar-o',
                handleToggleCurrentMonth
            )}
            {toggleButton(
                $t('client.operations.assign_to_following_month'),
                +props.operation.budgetDate === +followingMonth,
                'fa-calendar-plus-o',
                handleToggleFollowingMonth
            )}
        </div>
    );
};

BudgetDateComponent.displayName = 'BudgetDateComponent';

export default BudgetDateComponent;
