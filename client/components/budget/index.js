import React from 'react';
import { connect } from 'react-redux';
import moment from 'moment';

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
            showAllCats: true,
            displayInPercent: false
        };

        this.handleChange = this.handleChange.bind(this);
        this.showOperations = this.showOperations.bind(this);
        this.handleChangeShowAllCats = this.handleChangeShowAllCats.bind(this);
        this.handleChangeDisplayPercent = this.handleChangeDisplayPercent.bind(this);
    }

    handleChange() {
        let period = this.refs.month.value.split('-');

        this.setState({
            month: parseInt(period[1], 10),
            year: parseInt(period[0], 10)
        });
    }

    handleChangeShowAllCats() {
        this.setState({
            showAllCats: !this.state.showAllCats
        });
    }

    handleChangeDisplayPercent() {
        this.setState({
            displayInPercent: !this.state.displayInPercent
        });
    }

    showOperations(catId) {
        let periodDate = { year: this.state.year, month: this.state.month };
        let fromDate = moment(periodDate).toDate();
        let toDate = moment(periodDate).endOf('month').toDate();

        this.props.showOperations(catId, fromDate, toDate);
        this.props.mainApp.setState({ showing: 'reports' });
    }

    render() {
        let periodDate = { year: this.state.year, month: this.state.month };
        let fromDate = moment(periodDate).toDate();
        let toDate = moment(periodDate).endOf('month').toDate();

        let dateFilter = op => ((op.date >= fromDate) && (op.date <= toDate));
        let totalAmounts = 0;
        let totalThresholds = 0;
        let totalRemaining = '-';
        let operations = this.props.operations.filter(dateFilter);
        let categoriesToShow = this.props.categories;

        if (!this.state.showAllCats) {
            categoriesToShow = categoriesToShow.filter(cat => (cat.threshold && cat.threshold > 0));
        }

        let items = categoriesToShow.map(cat => {
            let catOps = operations.filter(op => cat.id === op.categoryId);
            let amount = Math.abs(catOps.reduce((acc, op) => acc + op.amount, 0));

            totalAmounts += amount;
            totalThresholds += cat.threshold;

            return (<BudgetListItem
              key={ cat.id }
              cat={ cat }
              amount={ amount }
              updateCategory={ this.props.updateCategory }
              showOperations={ this.showOperations }
              displayInPercent= { this.state.displayInPercent }
                    />);
        });

        if (totalAmounts) {
            if (this.state.displayInPercent) {
                totalRemaining = 100 - (totalAmounts * 100 / totalThresholds);
                totalRemaining = `${totalRemaining.toFixed(2)}%`;
            } else {
                totalRemaining = Math.abs(totalAmounts - totalThresholds);
            }
        }

        let currentDate = new Date();
        let currentYear = currentDate.getFullYear();
        let currentMonth = currentDate.getMonth();
        let monthNames = ['january', 'february', 'march', 'april', 'may',
            'june', 'july', 'august', 'september', 'october', 'november',
            'december'
        ];

        let months = this.props.periods.map(period => {
            let monthId = `${period.year}-${period.month}`;
            let monthLocalizedName = $t(`client.datepicker.monthsFull.${monthNames[period.month]}`);
            let label = '';

            if (period.month === currentMonth && period.year === currentYear) {
                label = $t('client.amount_well.this_month');
            } else {
                label = `${monthLocalizedName} ${period.year}`;
            }

            return (
                <option value={ monthId } key={ monthId }>
                    { label }
                </option>
            );
        });

        return (
            <div>
                <div className="top-panel panel panel-default">
                    <div className="panel-heading">
                        <h3 className="title panel-title">
                            { $t('client.budget.title') }
                        </h3>
                    </div>

                    <div className="panel-body">
                        <div className="row">
                            <p className="col-md-4">
                                <label className="budget_period_label">
                                    { $t('client.budget.period') }:
                                </label>

                                <select ref="month"
                                  onChange={ this.handleChange }
                                  defaultValue={ `${currentYear}-${currentMonth}` }>
                                  { months }
                                </select>
                            </p>
                            <p className="col-md-4">
                                <label className="budget_showall_label">
                                    { $t('client.budget.showCategoriesWithoutBudget') }:
                                    <input type="checkbox"
                                      onChange={ this.handleChangeShowAllCats }
                                      checked={ this.state.showAllCats }
                                    />
                                </label>
                            </p>
                            <p className="col-md-4">
                                <label className="budget_showall_label">
                                    { $t('client.budget.display_in_percent') }:
                                    <input type="checkbox"
                                      onChange={ this.handleChangeDisplayPercent }
                                      checked={ this.state.displayInPercent }
                                    />
                                </label>
                            </p>
                        </div>
                    </div>

                    <div className="table-responsive">
                        <table className="table table-striped table-hover table-bordered budget">
                            <thead>
                                <tr>
                                    <th className="col-sm-4 col-xs-6">
                                        { $t('client.category.column_category_name') }
                                    </th>
                                    <th className="col-sm-5 col-xs-6">
                                        { $t('client.budget.amount') }
                                    </th>
                                    <th className="col-sm-1 hidden-xs">
                                        { $t('client.budget.threshold') }
                                    </th>
                                    <th className="col-sm-1 hidden-xs">
                                        { $t('client.budget.remaining') }
                                    </th>
                                    <th className="col-sm-1 hidden-xs">&nbsp;</th>
                                </tr>
                            </thead>
                            <tbody>
                                { items }
                                <tr>
                                    <th className="col-sm-4 col-xs-6">
                                        { $t('client.budget.total') }
                                    </th>
                                    <th className="col-sm-5 col-xs-6 text-right">
                                        { totalAmounts }
                                    </th>
                                    <th className="col-sm-1 hidden-xs text-right">
                                        { totalThresholds }
                                    </th>
                                    <th className="col-sm-1 hidden-xs text-right">
                                        { totalRemaining }
                                    </th>
                                    <th className="col-sm-1 hidden-xs">&nbsp;</th>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        );
    }
}

Budget.propTypes = {
    // The mainApp component.
    mainApp: React.PropTypes.object.isRequired,

    // The list of categories.
    categories: React.PropTypes.array.isRequired,

    // The list of current operations.
    operations: React.PropTypes.array.isRequired,

    // The method to update a category.
    updateCategory: React.PropTypes.func.isRequired,

    // A method to display the reports component inside the main app, pre-filled
    // with the year/month and category filters.
    showOperations: React.PropTypes.func.isRequired,

    // An array of the months/years tuples available since the first operation.
    periods: React.PropTypes.array.isRequired
};

const Export = connect(state => {
    let operations = get.currentOperations(state);
    let periods = [];

    if (operations.length) {
        let currentDate = new Date();
        let currentYear = currentDate.getFullYear();
        let currentMonth = currentDate.getMonth();

        let year = operations[operations.length - 1].date.getFullYear();
        while (year <= currentYear) {
            let month = 0;
            let maxMonth = (year === currentYear) ? currentMonth : 11;
            while (month <= maxMonth) {
                periods.push({
                    month,
                    year
                });
                month++;
            }
            year++;
        }
    }

    return {
        categories: get.categoriesButNone(state),
        operations,
        periods
    };
}, dispatch => {
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
})(Budget);

export default Export;
