import React from 'react';
import { connect } from 'react-redux';
import moment from 'moment';
import { createSelector } from 'reselect';
import PropTypes from 'prop-types';

import URL from '../../urls';
import { get, actions } from '../../store';

import { translate as $t, localeComparator } from '../../helpers';

import BudgetListItem from './item';

class Budget extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            showBudgetWithoutThreshold: this.props.displayNoThreshold,
            displayInPercent: this.props.displayPercent
        };
    }

    handleChange = event => {
        let period = event.currentTarget.value.split('-');
        this.props.setPeriod(parseInt(period[0], 10), parseInt(period[1], 10));
    };

    handleToggleWithoutThreshold = () => {
        let newValue = !this.state.showBudgetWithoutThreshold;
        this.props.updateDisplayNoThreshold(newValue);
        this.setState({
            showBudgetWithoutThreshold: newValue
        });
    };

    handleTogglePercentDisplay = () => {
        let newValue = !this.state.displayInPercent;
        this.props.updateDisplayPercent(newValue);
        this.setState({
            displayInPercent: newValue
        });
    };

    showOperations = catId => {
        let periodDate = moment({ year: this.props.year, month: this.props.month, day: 1 });
        let fromDate = periodDate.toDate();
        let toDate = periodDate.endOf('month').toDate();
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
            let periodDate = moment({ year: this.props.year, month: this.props.month, day: 1 });
            let fromDate = periodDate.toDate();
            let toDate = periodDate.endOf('month').toDate();

            let dateFilter = op => op.budgetDate >= fromDate && op.budgetDate <= toDate;
            let operations = this.props.operations.filter(dateFilter);

            let budgetsToShow = this.props.budgets;
            if (!this.state.showBudgetWithoutThreshold) {
                budgetsToShow = budgetsToShow.filter(budget => budget.threshold !== 0);
            }

            budgetsToShow = budgetsToShow.slice().sort((prev, next) => {
                return localeComparator(
                    this.props.categoriesNamesMap.get(prev.categoryId),
                    this.props.categoriesNamesMap.get(next.categoryId)
                );
            });

            items = budgetsToShow.map(budget => {
                let catOps = operations.filter(op => budget.categoryId === op.categoryId);
                let amount = catOps.reduce((acc, op) => acc + op.amount, 0);

                sumAmounts += amount;
                sumThresholds += budget.threshold;

                let key = `${budget.categoryId}${budget.year}${budget.month}`;

                return (
                    <BudgetListItem
                        key={key}
                        id={key}
                        budget={budget}
                        amount={parseFloat(amount.toFixed(2))}
                        updateBudget={this.props.updateBudget}
                        showOperations={this.showOperations}
                        displayInPercent={this.state.displayInPercent}
                        currentAccountId={this.props.currentAccountId}
                    />
                );
            });

            // Number.EPSILON would still be inferior to any rounding issue
            // since we make several additions so we use 0.000001.
            if (Math.abs(sumAmounts) <= 0.000001) {
                sumAmounts = 0;
            }

            if (Math.abs(sumThresholds) <= 0.000001) {
                sumThresholds = 0;
            }

            if (sumAmounts) {
                if (this.state.displayInPercent) {
                    if (sumThresholds) {
                        remaining = (100 * (sumAmounts - sumThresholds)) / sumThresholds;
                        remaining = `${remaining.toFixed(2)}%`;
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
                    <td colSpan="5">
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
                label = $t('client.amount_well.this_month');
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
                <form>
                    <p>
                        <label className="budget-period-label">{$t('client.budget.period')}:</label>

                        <select
                            onChange={this.handleChange}
                            defaultValue={`${this.props.year}-${this.props.month}`}>
                            {months}
                        </select>
                    </p>
                    <p>
                        <label className="budget-display-label">
                            {$t('client.budget.show_categories_without_budget')}:
                            <input
                                type="checkbox"
                                onChange={this.handleToggleWithoutThreshold}
                                checked={this.state.showBudgetWithoutThreshold}
                            />
                        </label>
                    </p>
                    <p>
                        <label className="budget-display-label">
                            {$t('client.budget.display_in_percent')}:
                            <input
                                type="checkbox"
                                onChange={this.handleTogglePercentDisplay}
                                checked={this.state.displayInPercent}
                            />
                        </label>
                    </p>
                </form>

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
    periods: PropTypes.array.isRequired
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
        let currentAccountId = URL.budgets.accountId(ownProps.match);

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
                year: currentYear
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

        let displayPercent = get.boolSetting(state, 'budget-display-percent');
        let displayNoThreshold = get.boolSetting(state, 'budget-display-no-threshold');

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
            displayNoThreshold
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
                    dateLow: +fromDate,
                    dateHigh: +toDate,
                    categoryIds: [categoryId]
                });
            },

            async updateDisplayPercent(newValue) {
                try {
                    await actions.setBoolSetting(dispatch, 'budget-display-percent', newValue);
                } catch (err) {
                    // TODO do something with it!
                }
            },

            async updateDisplayNoThreshold(newValue) {
                try {
                    await actions.setBoolSetting(dispatch, 'budget-display-no-threshold', newValue);
                } catch (err) {
                    // TODO do something with it!
                }
            }
        };
    }
)(Budget);

export default Export;
