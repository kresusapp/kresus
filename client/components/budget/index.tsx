import React, {
    useCallback,
    useContext,
    useEffect,
    useMemo,
    ChangeEvent,
    ReactElement,
} from 'react';
import { useDispatch } from 'react-redux';
import moment from 'moment';

import { get, actions } from '../../store';

import {
    translate as $t,
    localeComparator,
    endOfMonth,
    NONE_CATEGORY_ID,
    useKresusState,
} from '../../helpers';
import { BUDGET_DISPLAY_PERCENT, BUDGET_DISPLAY_NO_THRESHOLD } from '../../../shared/settings';
import { useGenericError, useNotifyError } from '../../hooks';

import BudgetListItem, { UncategorizedTransactionsItem } from './item';

import { Switch, Popover, Form } from '../ui';
import { ViewContext } from '../drivers';

import type { Budget, Operation } from '../../models';

import './budgets.css';

interface BudgetsPopoverProps {
    // Called whenever the value "Show empty budgets" switch state has changed.
    toggleWithoutThreshold: (state: boolean) => void;

    showEmptyBudgets: boolean;

    // Called whenever the value "Display in percent" switch state has changed.
    toggleDisplayPercent: (state: boolean) => void;

    displayPercent: boolean;
}

function PrefsPopover(props: BudgetsPopoverProps) {
    return (
        <Popover
            trigger={
                <button className="btn btn-info">{$t('client.general.default_parameters')}</button>
            }
            content={
                <>
                    <Form.Input
                        inline={true}
                        label={$t('client.budget.show_empty_budgets')}
                        help={$t('client.budget.show_empty_budgets_desc')}
                        id="show-without-threshold">
                        <Switch
                            ariaLabel={$t('client.budget.show_empty_budgets')}
                            onChange={props.toggleWithoutThreshold}
                            checked={props.showEmptyBudgets}
                        />
                    </Form.Input>

                    <Form.Input
                        inline={true}
                        label={$t('client.budget.display_in_percent')}
                        id="display-in-percent">
                        <Switch
                            ariaLabel={$t('client.budget.display_in_percent')}
                            onChange={props.toggleDisplayPercent}
                            checked={props.displayPercent}
                        />
                    </Form.Input>
                </>
            }
        />
    );
}

const computePeriodsListFromTransactions = (transactions: Operation[]): ReactElement[] => {
    const periods: { month: number; year: number }[] = [];
    if (transactions.length) {
        const periodsSet = new Set();

        for (const transaction of transactions) {
            const { budgetDate } = transaction;

            const budgetMonth = budgetDate.getMonth();
            const budgetYear = budgetDate.getFullYear();
            if (!periodsSet.has(`${budgetMonth}-${budgetYear}`)) {
                periodsSet.add(`${budgetMonth}-${budgetYear}`);
                periods.push({ month: budgetMonth, year: budgetYear });
            }
        }
    }

    // Always add the current month year as there might be no transactions at the beginning of
    // the month but the user might still want to set their budgets.
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();
    if (!periods.some(p => p.month === currentMonth && p.year === currentYear)) {
        periods.push({
            month: currentMonth,
            year: currentYear,
        });
    }

    // As the transactions are sorted by date, and the list is made of budget dates,
    // it may be necessary to sort the list in descending order.
    periods.sort((a, b) => {
        if (a.year !== b.year) {
            return a.year > b.year ? -1 : 1;
        }
        return a.month > b.month ? -1 : 1;
    });

    return periods.map(period => {
        const monthId = `${period.year}-${period.month}`;
        let label = '';

        if (period.month === currentMonth && period.year === currentYear) {
            label = $t('client.budget.this_month');
        } else {
            label = `${moment.months(period.month)} ${period.year}`;
        }

        return (
            <option value={monthId} key={monthId}>
                {label}
            </option>
        );
    });
};

const BudgetsList = (): ReactElement => {
    const dispatch = useDispatch();

    const currentView = useContext(ViewContext);

    const setPeriod = useCallback(
        (year: number, month: number) => actions.setBudgetsPeriod(dispatch, year, month),
        [dispatch]
    );

    const fetchBudgets = useGenericError(
        useCallback(
            (year, month) => actions.fetchBudgetsByYearMonth(dispatch, year, month),
            [dispatch]
        )
    );

    const accountTransactions: Operation[] = currentView.transactions;

    const displayPercent = useKresusState(state => get.boolSetting(state, BUDGET_DISPLAY_PERCENT));
    const showEmptyBudgets = useKresusState(state =>
        get.boolSetting(state, BUDGET_DISPLAY_NO_THRESHOLD)
    );
    const { year, month } = useKresusState(state => get.budgetSelectedPeriod(state));
    const budgets: Budget[] | null = useKresusState(state => get.budgetsFromSelectedPeriod(state));

    const categoriesNamesMap = useKresusState(state => {
        const cats = get.categoriesButNone(state);
        const categoriesNames = new Map();
        for (const cat of cats) {
            categoriesNames.set(cat.id, cat.label);
        }

        return categoriesNames;
    });

    const onChange = useCallback(
        async (event: ChangeEvent<HTMLSelectElement>) => {
            const period = event.currentTarget.value.split('-');
            await setPeriod(parseInt(period[0], 10), parseInt(period[1], 10));
        },
        [setPeriod]
    );

    const toggleWithoutThreshold = useNotifyError(
        'client.general.update_fail',
        useCallback(
            (checked: boolean) => {
                return actions.setBoolSetting(dispatch, BUDGET_DISPLAY_NO_THRESHOLD, checked);
            },
            [dispatch]
        )
    );

    const toggleDisplayPercent = useNotifyError(
        'client.general.update_fail',
        useCallback(
            (checked: boolean) => {
                return actions.setBoolSetting(dispatch, BUDGET_DISPLAY_PERCENT, checked);
            },
            [dispatch]
        )
    );

    const showTransactions = useCallback(
        (catId: number) => {
            // From beginning of the month to its end.
            const fromDate = new Date(year, month, 1, 0, 0, 0, 0);
            const toDate = endOfMonth(fromDate);

            actions.setSearchFields(dispatch, {
                dateLow: fromDate,
                dateHigh: toDate,
                categoryIds: [catId],
            });
        },
        [dispatch, year, month]
    );

    // On mount, fetch the budgets.
    useEffect(() => {
        if (!budgets) {
            void fetchBudgets(year, month);
        }
    }, [year, month, budgets, fetchBudgets]);

    // TODO: use useMemo for sumAmounts, sumThresholds, remaining and items computation.
    let sumAmounts = 0;
    let sumThresholds = 0;
    let remaining = '-';
    let items = null;

    if (budgets) {
        // From beginning of the month to its end.
        const fromDate = new Date(year, month, 1, 0, 0, 0, 0);
        const toDate = endOfMonth(fromDate);

        const dateFilter = (op: Operation) => op.budgetDate >= fromDate && op.budgetDate <= toDate;
        const transactions = accountTransactions.filter(dateFilter);

        const sortedBudgets = budgets.slice().sort((prev, next) => {
            return localeComparator(
                categoriesNamesMap.get(prev.categoryId) as string,
                categoriesNamesMap.get(next.categoryId) as string
            );
        });

        items = [];
        for (const budget of sortedBudgets) {
            const key = `${budget.categoryId}${budget.year}${budget.month}`;
            const budgetTransactions = transactions.filter(
                transaction => budget.categoryId === transaction.categoryId
            );
            const amount = budgetTransactions.reduce(
                (acc, transaction) => acc + transaction.amount,
                0
            );

            sumAmounts += amount;
            sumThresholds += budget.threshold || 0;

            if (showEmptyBudgets || budgetTransactions.length > 0 || budget.threshold !== null) {
                items.push(
                    <BudgetListItem
                        key={key}
                        id={key}
                        budget={budget}
                        showTransactions={showTransactions}
                        amount={parseFloat(amount.toFixed(2))}
                        displayPercent={displayPercent}
                    />
                );
            }
        }

        // Uncategorized transactions.
        const uncategorizedTransactions = transactions.filter(
            transaction => transaction.categoryId === NONE_CATEGORY_ID
        );
        if (uncategorizedTransactions.length > 0) {
            const amount = uncategorizedTransactions.reduce(
                (acc, transaction) => acc + transaction.amount,
                0
            );
            sumAmounts += amount;
            items.push(
                <UncategorizedTransactionsItem
                    key={`uncategorized-${amount}`}
                    amount={amount}
                    showTransactions={showTransactions}
                    currentDriver={currentView.driver}
                />
            );
        }

        // Number.EPSILON would still be inferior to any rounding issue
        // since we make several additions so we use 0.000001.
        if (Math.abs(sumAmounts) <= 0.000001) {
            sumAmounts = 0;
        }

        if (Math.abs(sumThresholds) <= 0.000001) {
            sumThresholds = 0;
        }

        if (sumAmounts) {
            if (displayPercent) {
                if (sumThresholds) {
                    const rem = (100 * (sumAmounts - sumThresholds)) / sumThresholds;
                    remaining = `${rem.toFixed(2)}%`;
                } else {
                    remaining = '-';
                }
            } else {
                remaining = (sumAmounts - sumThresholds).toFixed(2);
            }
        }
    } else {
        items = (
            <tr>
                <td colSpan={5}>
                    <i className="fa fa-spinner" />
                </td>
            </tr>
        );
    }

    const months = useMemo(
        () => computePeriodsListFromTransactions(accountTransactions),
        [accountTransactions]
    );

    return (
        <div className="budgets">
            <div className="toolbar">
                <label htmlFor="budget-period" className="budget-period-label">
                    {$t('client.budget.period')}:
                    <select
                        id="budget-period"
                        onChange={onChange}
                        defaultValue={`${year}-${month}`}>
                        {months}
                    </select>
                </label>

                <PrefsPopover
                    toggleWithoutThreshold={toggleWithoutThreshold}
                    toggleDisplayPercent={toggleDisplayPercent}
                    displayPercent={displayPercent}
                    showEmptyBudgets={showEmptyBudgets}
                />
            </div>

            <table className="striped budget">
                <thead>
                    <tr>
                        <th className="category-name">{$t('client.budget.category')}</th>
                        <th className="category-amount">{$t('client.budget.amount')}</th>
                        <th className="category-threshold">
                            {$t('client.budget.threshold')}
                            <span
                                className="tooltipped tooltipped-s"
                                aria-label={$t('client.budget.threshold_help')}>
                                <span className="fa fa-question-circle clickable" />
                            </span>
                        </th>
                        <th className="category-diff">{$t('client.budget.difference')}</th>
                        <th className="category-button">&nbsp;</th>
                    </tr>
                </thead>
                <tbody>{items}</tbody>
                <tfoot>
                    <tr>
                        <th className="category-name">{$t('client.budget.total')}</th>
                        <th className="category-amount amount">{sumAmounts.toFixed(2)}</th>
                        <th className="category-threshold amount">{sumThresholds.toFixed(2)}</th>
                        <th className="category-diff amount">{remaining}</th>
                        <th className="category-button">&nbsp;</th>
                    </tr>
                </tfoot>
            </table>
        </div>
    );
};

export default BudgetsList;
