import React from 'react';
import { connect } from 'react-redux';

import { get, actions } from '../../store';

import { translate as $t } from '../../helpers';

import BudgetListItem from './item';

class Budget extends React.Component {

    constructor(props) {
        super(props);

        let now = new Date();
        this.state = {
            month: now.getMonth(),
            year: now.getFullYear()
        };

        this.handleChange = this.handleChange.bind(this);
        this.showOperations = this.showOperations.bind(this);
    }

    handleChange() {
        let period = this.refs.month.value.split('-');

        this.setState({
            month: parseInt(period[1], 10),
            year: parseInt(period[0], 10)
        });
    }

    showOperations(catId) {
        let fromDate = new Date(this.state.year, this.state.month, 1, 0, 0, 0, 0);
        let toDate = new Date(this.state.year, this.state.month + 1, -1, 23, 59, 59, 999);
        this.props.showOperations(catId, fromDate, toDate);
        this.props.mainApp.setState({ showing: 'reports' });
    }

    render() {
        let fromDate = new Date(this.state.year, this.state.month, 1, 0, 0, 0, 0);
        let toDate = new Date(this.state.year, this.state.month + 1, -1, 23, 59, 59, 999);
        let dateFilter = op => ((op.date >= fromDate) && (op.date <= toDate));
        let operations = this.props.operations.filter(dateFilter);
        let items = this.props.categories.map(cat =>
            <BudgetListItem
              key={ cat.id }
              cat={ cat }
              operations={ operations.filter(op => cat.id === op.categoryId) }
              updateCategory={ this.props.updateCategory }
              showOperations={ this.showOperations }
            />
        );

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

            if ((period.month === currentMonth) && (period.year === currentYear)) {
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
                        <p>
                            <label className="budget_period_label">
                                { $t('client.budget.period') }:
                            </label>

                            <select ref="month"
                              onChange={ this.handleChange }
                              defaultValue={ `${currentYear}-${currentMonth}` }>
                              { months }
                            </select>
                        </p>
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
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        );
    }
}

const Export = connect(state => {
    let operations = get.currentOperations(state);
    let periods = [];

    if (operations.length) {
        let firstOperationDate = operations[operations.length - 1].date;
        let firstYear = firstOperationDate.getFullYear();
        let year = firstYear;
        let currentDate = new Date();
        let currentYear = currentDate.getFullYear();
        let currentMonth = currentDate.getMonth();

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
                dateLow: fromDate.getTime(),
                dateHigh: toDate.getTime(),
                categoryId
            });
        }
    };
})(Budget);

export default Export;
