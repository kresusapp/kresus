import React from 'react';
import { connect } from 'react-redux';
import moment from 'moment';
import PropTypes from 'prop-types';

import { translate as $t } from '../../helpers';
import { actions } from '../../store';

class BudgetDateComponent extends React.Component {
    state = { editedValue: null };

    handleToggleBudgetMonth = budgetMonth => {
        if (this.props.operation.budgetDate.getTime() === budgetMonth.getTime()) {
            this.props.setBudgetDate(null);
        } else {
            this.props.setBudgetDate(budgetMonth);
        }
    };

    handleTogglePreviousMonth = () => {
        this.handleToggleBudgetMonth(this.props.previousMonth);
    };

    handleToggleFollowingMonth = () => {
        this.handleToggleBudgetMonth(this.props.followingMonth);
    };

    render() {
        let togglePreviousMonthButtonClass = 'btn-default';
        if (this.props.operation.budgetDate.getTime() === this.props.previousMonth.getTime()) {
            togglePreviousMonthButtonClass = 'btn-primary';
        }

        let toggleFollowingMonthButtonClass = 'btn-default';
        if (this.props.operation.budgetDate.getTime() === this.props.followingMonth.getTime()) {
            toggleFollowingMonthButtonClass = 'btn-primary';
        }

        return (
            <div className="btn-group btn-block" role="group">
                <button
                    type="button"
                    onClick={this.handleTogglePreviousMonth}
                    className={`btn ${togglePreviousMonthButtonClass} btn-budget-assignment`}>
                    <span className="fa fa-calendar-minus-o" />
                    <span className="hidden-xs">
                        {$t('client.operations.assign_to_previous_month')}
                    </span>
                </button>
                <button
                    type="button"
                    onClick={this.handleToggleFollowingMonth}
                    className={`btn ${toggleFollowingMonthButtonClass} btn-budget-assignment`}>
                    <span className="fa fa-calendar-plus-o" />
                    <span className="hidden-xs">
                        {$t('client.operations.assign_to_following_month')}
                    </span>
                </button>
            </div>
        );
    }
}

BudgetDateComponent.propTypes /* remove-proptypes */ = {
    // The operation from which to get the budget date.
    operation: PropTypes.object.isRequired,

    // A function to set the budget date when modified.
    setBudgetDate: PropTypes.func.isRequired
};

export default connect(
    (state, props) => {
        return {
            previousMonth: moment(props.operation.date)
                .subtract(1, 'months')
                .endOf('month')
                .toDate(),
            followingMonth: moment(props.operation.date)
                .add(1, 'months')
                .startOf('month')
                .toDate()
        };
    },
    (dispatch, props) => {
        return {
            setBudgetDate(date) {
                actions.setOperationBudgetDate(dispatch, props.operation, date);
            }
        };
    }
)(BudgetDateComponent);
