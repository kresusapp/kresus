import React from 'react';
import { connect } from 'react-redux';
import moment from 'moment';
import { createSelector } from 'reselect';
import PropTypes from 'prop-types';

import { get, actions } from '../../store';

import { translate as $t, localeComparator, endOfMonth, NONE_CATEGORY_ID } from '../../helpers';
import { BUDGET_DISPLAY_PERCENT, BUDGET_DISPLAY_NO_THRESHOLD } from '../../../shared/settings';

import BudgetListItem from './item';
import UncategorizedTransactionsItem from './uncategorized-item';
import withCurrentAccountId from '../withCurrentAccountId';

import { Switch, Popover, FormRow } from '../ui';

import './budgets.css';

function PrefsPopover(props) {
    return (
        <Popover
            trigger={
                <button className="btn btn-info">{$t('client.general.default_parameters')}</button>
            }
            content={
                <>
                    <FormRow
                        fill={true}
                        inline={true}
                        label={$t('client.budget.show_empty_budgets')}
                        inputId="show-without-threshold"
                        input={
                            <Switch
                                ariaLabel={$t('client.budget.show_empty_budgets')}
                                onChange={props.toggleWithoutThreshold}
                                checked={props.showEmptyBudgets}
                            />
                        }
                        help={$t('client.budget.show_empty_budgets_desc')}
                    />

                    <FormRow
                        fill={true}
                        inline={true}
                        label={$t('client.budget.display_in_percent')}
                        inputId="display-in-percent"
                        input={
                            <Switch
                                ariaLabel={$t('client.budget.display_in_percent')}
                                onChange={props.toggleDisplayPercent}
                                checked={props.displayPercent}
                            />
                        }
                    />
                </>
            }
        />
    );
}

class Budget extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            showEmptyBudgets: this.props.displayNoThreshold,
            displayPercent: this.props.displayPercent,
        };
    }

    handleChange = event => {
        let period = event.currentTarget.value.split('-');
        this.props.setPeriod(parseInt(period[0], 10), parseInt(period[1], 10));
    };

    toggleWithoutThreshold = checked => {
        this.props.updateDisplayNoThreshold(checked);
        this.setState({
            showEmptyBudgets: checked,
        });
    };

    toggleDisplayPercent = checked => {
        this.props.updateDisplayPercent(checked);
        this.setState({
            displayPercent: checked,
        });
    };

    showOperations = catId => {
        // From beginning of the month to its end.
        const fromDate = new Date(this.props.year, this.props.month, 1, 0, 0, 0, 0);
        const toDate = endOfMonth(fromDate);
        this.props.showOperations(catId, fromDate, toDate);
    };

    componentDidMount() {
        if (!this.props.budgets) {
            this.props.fetchBudgets(this.props.year, this.props.month);
        }
    }

    render() {
        let sumAmounts = 0;
        let sumThresholds = 0;
        let remaining = '-';
        let items = null;

        if (this.props.budgets) {
            // From beginning of the month to its end.
            const fromDate = new Date(this.props.year, this.props.month, 1, 0, 0, 0, 0);
            const toDate = endOfMonth(fromDate);

            let dateFilter = op => op.budgetDate >= fromDate && op.budgetDate <= toDate;
            let operations = this.props.operations.filter(dateFilter);

            const budgets = this.props.budgets.slice().sort((prev, next) => {
                return localeComparator(
                    this.props.categoriesNamesMap.get(prev.categoryId),
                    this.props.categoriesNamesMap.get(next.categoryId)
                );
            });

            items = [];
            for (const budget of budgets) {
                const key = `${budget.categoryId}${budget.year}${budget.month}`;
                const budgetOps = operations.filter(op => budget.categoryId === op.categoryId);
                const amount = budgetOps.reduce((acc, op) => acc + op.amount, 0);

                sumAmounts += amount;
                sumThresholds += budget.threshold || 0;

                if (
                    this.state.showEmptyBudgets ||
                    budgetOps.length > 0 ||
                    budget.threshold !== null
                ) {
                    items.push(
                        <BudgetListItem
                            key={key}
                            id={key}
                            budget={budget}
                            amount={parseFloat(amount.toFixed(2))}
                            updateBudget={this.props.updateBudget}
                            showOperations={this.showOperations}
                            displayPercent={this.state.displayPercent}
                            currentAccountId={this.props.currentAccountId}
                        />
                    );
                }
            }

            // Uncategorized transactions.
            const uncategorizedTransactions = operations.filter(
                op => op.categoryId === NONE_CATEGORY_ID
            );
            if (uncategorizedTransactions.length > 0) {
                const amount = uncategorizedTransactions.reduce((acc, op) => acc + op.amount, 0);
                sumAmounts += amount;
                items.push(
                    <UncategorizedTransactionsItem
                        amount={amount}
                        showOperations={this.showOperations}
                        currentAccountId={this.props.currentAccountId}
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
                if (this.state.displayPercent) {
                    if (sumThresholds) {
                        let rem = (100 * (sumAmounts - sumThresholds)) / sumThresholds;
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

        let currentDate = new Date();
        let currentYear = currentDate.getFullYear();
        let currentMonth = currentDate.getMonth();

        let months = this.props.periods.map(period => {
            let monthId = `${period.year}-${period.month}`;
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

        return (
            <div className="budgets">
                <div className="toolbar">
                    <label htmlFor="budget-period" className="budget-period-label">
                        {$t('client.budget.period')}:
                        <select
                            id="budget-period"
                            onChange={this.handleChange}
                            defaultValue={`${this.props.year}-${this.props.month}`}>
                            {months}
                        </select>
                    </label>

                    <PrefsPopover
                        toggleWithoutThreshold={this.toggleWithoutThreshold}
                        toggleDisplayPercent={this.toggleDisplayPercent}
                        displayPercent={this.state.displayPercent}
                        showEmptyBudgets={this.state.showEmptyBudgets}
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
                            <th className="category-threshold amount">
                                {sumThresholds.toFixed(2)}
                            </th>
                            <th className="category-diff amount">{remaining}</th>
                            <th className="category-button">&nbsp;</th>
                        </tr>
                    </tfoot>
                </table>
            </div>
        );
    }
}

Budget.propTypes = {
    // The current displayed year.
    year: PropTypes.number.isRequired,

    // The current displayed month.
    month: PropTypes.number.isRequired,

    // The list of budgets.
    budgets: PropTypes.array,

    // A map of categories with the id as key and the label as value.
    categoriesNamesMap: PropTypes.object,

    // The list of current operations.
    operations: PropTypes.array.isRequired,

    // The method to update a budget.
    updateBudget: PropTypes.func.isRequired,

    // A method to display the reports component inside the main app, pre-filled
    // with the year/month and category filters.
    showOperations: PropTypes.func.isRequired,

    // An array of the months/years tuples available since the first operation.
    periods: PropTypes.array.isRequired,
};

const categoriesNamesSelector = createSelector(
    state => get.categoriesButNone(state),
    cats => {
        let categoriesNamesMap = new Map();
        for (let cat of cats) {
            categoriesNamesMap.set(cat.id, cat.label);
        }

        return categoriesNamesMap;
    }
);

const Export = connect(
    (state, ownProps) => {
        let { currentAccountId } = ownProps;

        let operations = get.operationsByAccountId(state, currentAccountId);
        let periods = [];
        let currentDate = new Date();
        if (operations.length) {
            let periodsSet = new Set();

            for (let operation of operations) {
                let { budgetDate } = operation;

                let month = budgetDate.getMonth();
                let year = budgetDate.getFullYear();
                if (!periodsSet.has(`${month}-${year}`)) {
                    periodsSet.add(`${month}-${year}`);
                    periods.push({ month, year });
                }
            }
        }

        // Always add the current month year as there might be no transactions at the beginning of
        // the month but the user might still want to set their budgets.
        let currentYear = currentDate.getFullYear();
        let currentMonth = currentDate.getMonth();
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

        let displayPercent = get.boolSetting(state, BUDGET_DISPLAY_PERCENT);
        let displayNoThreshold = get.boolSetting(state, BUDGET_DISPLAY_NO_THRESHOLD);

        let { year: selectedYear, month: selectedMonth } = get.budgetSelectedPeriod(state);
        let budgets = get.budgetsFromSelectedPeriod(state);

        return {
            year: selectedYear,
            month: selectedMonth,
            budgets,
            categoriesNamesMap: categoriesNamesSelector(state),
            operations,
            periods,
            currentAccountId,
            displayPercent,
            displayNoThreshold,
        };
    },
    dispatch => {
        return {
            setPeriod(year, month) {
                actions.setBudgetsPeriod(dispatch, year, month);
            },

            fetchBudgets(year, month) {
                actions.fetchBudgetsByYearMonth(dispatch, year, month);
            },

            updateBudget(former, newer) {
                actions.updateBudget(dispatch, former, newer);
            },

            showOperations(categoryId, fromDate, toDate) {
                actions.setSearchFields(dispatch, {
                    dateLow: fromDate,
                    dateHigh: toDate,
                    categoryIds: [categoryId],
                });
            },

            async updateDisplayPercent(newValue) {
                try {
                    await actions.setBoolSetting(dispatch, BUDGET_DISPLAY_PERCENT, newValue);
                } catch (err) {
                    // TODO do something with it!
                }
            },

            async updateDisplayNoThreshold(newValue) {
                try {
                    await actions.setBoolSetting(dispatch, BUDGET_DISPLAY_NO_THRESHOLD, newValue);
                } catch (err) {
                    // TODO do something with it!
                }
            },
        };
    }
)(Budget);

export default withCurrentAccountId(Export);
