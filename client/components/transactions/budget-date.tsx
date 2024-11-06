import React, { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import moment from 'moment';

import { translate as $t } from '../../helpers';
import * as BanksStore from '../../store/banks';

import './budget-date.css';
import { Transaction } from '../../models';
import { useGenericError } from '../../hooks';

interface Props {
    // The transaction from which to get the budget date.
    transaction: Transaction;
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
    const { budgetDate, date } = props.transaction;

    // Cheat a bit by putting the date of month as the 15, to avoid any
    // timezone conflict when using any of the edge days (start or end
    // of month).
    const previousMonth = moment(date).date(15).subtract(1, 'months').toDate();
    const followingMonth = moment(date).date(15).add(1, 'months').toDate();

    const dispatch = useDispatch();
    const setBudgetDate = useGenericError(
        useCallback(
            async (newDate: Date | null) => {
                await dispatch(
                    BanksStore.setTransactionBudgetDate({
                        transaction: props.transaction,
                        budgetDate: newDate,
                    })
                ).unwrap();
            },
            [dispatch, props]
        )
    );

    const handleTogglePreviousMonth = useCallback(async () => {
        if (!budgetDate || +budgetDate !== +previousMonth) {
            await setBudgetDate(previousMonth);
        }
    }, [budgetDate, setBudgetDate, previousMonth]);

    const handleToggleCurrentMonth = useCallback(async () => {
        if (!budgetDate || +budgetDate !== +date) {
            await setBudgetDate(null);
        }
    }, [date, budgetDate, setBudgetDate]);

    const handleToggleFollowingMonth = useCallback(async () => {
        if (!budgetDate || +budgetDate !== +followingMonth) {
            await setBudgetDate(followingMonth);
        }
    }, [budgetDate, setBudgetDate, followingMonth]);

    return (
        <div className="budget-date buttons-group" role="group">
            {toggleButton(
                $t('client.transactions.assign_to_previous_month'),
                budgetDate !== null && +budgetDate === +previousMonth,
                'fa-calendar-minus-o',
                handleTogglePreviousMonth
            )}
            {toggleButton(
                $t('client.transactions.assign_to_current_month'),
                budgetDate !== null && +budgetDate === +date,
                'fa-calendar-o',
                handleToggleCurrentMonth
            )}
            {toggleButton(
                $t('client.transactions.assign_to_following_month'),
                budgetDate !== null && +budgetDate === +followingMonth,
                'fa-calendar-plus-o',
                handleToggleFollowingMonth
            )}
        </div>
    );
};

BudgetDateComponent.displayName = 'BudgetDateComponent';

export default BudgetDateComponent;
