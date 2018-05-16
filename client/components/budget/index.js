import React from 'react';
import { connect } from 'react-redux';
import moment from 'moment';
import PropTypes from 'prop-types';

import { get, actions } from '../../store';

import { translate as $t } from '../../helpers';

import BudgetListItem from './item';

class Budget extends React.Component {
    constructor(props) {
        super(props);

        let now = new Date();
        this.state = {
            month: now.getMonth(),
            year: now.getFullYear(),
            showCatWithoutThreshold: true,
            displayInPercent: false
        };

        this.handleChange = this.handleChange.bind(this);
        this.showOperations = this.showOperations.bind(this);
        this.handleToggleWithoutThreshold = this.handleToggleWithoutThreshold.bind(this);
        this.handleTogglePercentDisplay = this.handleTogglePercentDisplay.bind(this);
    }

    handleChange(event) {
        let period = event.currentTarget.value.split('-');

        this.setState({
            month: parseInt(period[1], 10),
            year: parseInt(period[0], 10)
        });
    }

    handleToggleWithoutThreshold() {
        this.setState({
            showCatWithoutThreshold: !this.state.showCatWithoutThreshold
        });
    }

    handleTogglePercentDisplay() {
        this.setState({
            displayInPercent: !this.state.displayInPercent
        });
    }

    showOperations(catId) {
        let periodDate = { year: this.state.year, month: this.state.month };
        let fromDate = moment(periodDate).toDate();
        let toDate = moment(periodDate)
            .endOf('month')
            .toDate();
        this.props.showOperations(catId, fromDate, toDate);
    }

    render() {
        let periodDate = { year: this.state.year, month: this.state.month };
        let fromDate = moment(periodDate).toDate();
        let toDate = moment(periodDate)
            .endOf('month')
            .toDate();
        let dateFilter = op => op.budgetDate >= fromDate && op.budgetDate <= toDate;
        let operations = this.props.operations.filter(dateFilter);
        let categoriesToShow = this.props.categories;

        if (!this.state.showCatWithoutThreshold) {
            categoriesToShow = categoriesToShow.filter(cat => cat.threshold !== 0);
        }

        let sumAmounts = 0;
        let sumThresholds = 0;
        let items = categoriesToShow.map(cat => {
            let catOps = operations.filter(op => cat.id === op.categoryId);
            let amount = catOps.reduce((acc, op) => acc + op.amount, 0);

            sumAmounts += amount;
            sumThresholds += cat.threshold;

            return (
                <BudgetListItem
                    key={cat.id}
                    cat={cat}
                    amount={parseFloat(amount.toFixed(2))}
                    updateCategory={this.props.updateCategory}
                    showOperations={this.showOperations}
                    displayInPercent={this.state.displayInPercent}
                    currentAccountId={this.props.currentAccountId}
                />
            );
        });

        let remaining = '-';
        if (sumAmounts) {
            if (this.state.displayInPercent) {
                if (sumThresholds) {
                    remaining = 100 * (sumAmounts - sumThresholds) / sumThresholds;
                    remaining = `${remaining.toFixed(2)}%`;
                } else {
                    remaining = '-';
                }
            } else {
                remaining = (sumAmounts - sumThresholds).toFixed(2);
            }
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
                            defaultValue={`${currentYear}-${currentMonth}`}>
                            {months}
                        </select>
                    </p>
                    <p>
                        <label className="budget-display-label">
                            {$t('client.budget.show_categories_without_budget')}:
                            <input
                                type="checkbox"
                                onChange={this.handleToggleWithoutThreshold}
                                checked={this.state.showCatWithoutThreshold}
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

                <table className="table table-striped table-hover table-bordered budget">
                    <thead>
                        <tr>
                            <th className="category-name">
                                {$t('client.category.column_category_name')}
                            </th>
                            <th className="category-amount">{$t('client.budget.amount')}</th>
                            <th className="category-threshold">{$t('client.budget.threshold')}</th>
                            <th className="category-diff">{$t('client.budget.difference')}</th>
                            <th className="category-button">&nbsp;</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items}
                        <tr>
                            <th className="category-name">{$t('client.budget.total')}</th>
                            <th className="category-amount amount">{sumAmounts.toFixed(2)}</th>
                            <th className="category-threshold amount">
                                {sumThresholds.toFixed(2)}
                            </th>
                            <th className="category-diff amount">{remaining}</th>
                            <th className="category-button">&nbsp;</th>
                        </tr>
                    </tbody>
                </table>
            </div>
        );
    }
}

Budget.propTypes = {
    // The list of categories.
    categories: PropTypes.array.isRequired,

    // The list of current operations.
    operations: PropTypes.array.isRequired,

    // The method to update a category.
    updateCategory: PropTypes.func.isRequired,

    // A method to display the reports component inside the main app, pre-filled
    // with the year/month and category filters.
    showOperations: PropTypes.func.isRequired,

    // An array of the months/years tuples available since the first operation.
    periods: PropTypes.array.isRequired
};

const Export = connect(
    (state, ownProps) => {
        let currentAccountId = ownProps.match.params.currentAccountId;
        let operations = get.operationsByAccountIds(state, currentAccountId);
        let periods = [];

        let currentDate = new Date();
        let currentYear = currentDate.getFullYear();
        let currentMonth = currentDate.getMonth();
        if (operations.length) {
            let year = operations[operations.length - 1].date.getFullYear();
            while (year <= currentYear) {
                let month = 0;
                let maxMonth = year === currentYear ? currentMonth : 11;
                while (month <= maxMonth) {
                    periods.push({
                        month,
                        year
                    });
                    month++;
                }
                year++;
            }
        } else {
            // Just put the current month/year pair if there are no operations.
            periods.push({
                month: currentMonth,
                year: currentYear
            });
        }

        return {
            categories: get.categoriesButNone(state),
            operations,
            periods,
            currentAccountId
        };
    },
    dispatch => {
        return {
            updateCategory(former, newer) {
                actions.updateCategory(dispatch, former, newer);
            },

            showOperations(categoryId, fromDate, toDate) {
                actions.setSearchFields(dispatch, {
                    dateLow: +fromDate,
                    dateHigh: +toDate,
                    categoryId
                });
            }
        };
    }
)(Budget);

export default Export;
