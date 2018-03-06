import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import { translate as $t } from '../../helpers';
import { actions } from '../../store';

class BudgetDateComponent extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            editedValue: null
        };
    }

    handleAssignToOperationDateBudget = () => {
        this.props.setBudgetDate(null);
    };

    handleAssignToPreviousMonthBudget = () => {
        this.props.setBudgetDate(this.props.previousMonth);
    };

    handleAssignToFollowingMonthBudget = () => {
        this.props.setBudgetDate(this.props.followingMonth);
    };

    render() {
        let toggleAssigmentToPreviousMonthBudget = null;
        if (this.props.operation.budgetDate.getTime() === this.props.previousMonth.getTime()) {
            toggleAssigmentToPreviousMonthBudget = (
                <button
                    type="button"
                    onClick={this.handleAssignToOperationDateBudget}
                    className="btn btn-primary btn-budget-assignment">
                    <span className="fa fa-calendar-minus-o" />
                    <span className="hidden-xs">
                        {$t('client.operations.assign_to_previous_month')}
                    </span>
                </button>
            );
        } else {
            toggleAssigmentToPreviousMonthBudget = (
                <button
                    type="button"
                    onClick={this.handleAssignToPreviousMonthBudget}
                    className="btn btn-default btn-budget-assignment">
                    <span className="fa fa-calendar-minus-o" />
                    <span className="hidden-xs">
                        {$t('client.operations.assign_to_previous_month')}
                    </span>
                </button>
            );
        }

        let toggleAssigmentToFollowingMonthBudget = null;
        if (this.props.operation.budgetDate.getTime() === this.props.followingMonth.getTime()) {
            toggleAssigmentToFollowingMonthBudget = (
                <button
                    type="button"
                    onClick={this.handleAssignToOperationDateBudget}
                    className="btn btn-primary  btn-budget-assignment">
                    <span className="fa fa-calendar-plus-o" />
                    <span className="hidden-xs">
                        {$t('client.operations.assign_to_following_month')}
                    </span>
                </button>
            );
        } else {
            toggleAssigmentToFollowingMonthBudget = (
                <button
                    type="button"
                    onClick={this.handleAssignToFollowingMonthBudget}
                    className="btn btn-default btn-budget-assignment">
                    <span className="fa fa-calendar-plus-o" />
                    <span className="hidden-xs">
                        {$t('client.operations.assign_to_following_month')}
                    </span>
                </button>
            );
        }

        return (
            <div className="btn-group btn-block" role="group">
                {toggleAssigmentToPreviousMonthBudget}
                {toggleAssigmentToFollowingMonthBudget}
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
            previousMonth: new Date(
                props.operation.date.getFullYear(),
                props.operation.date.getMonth(),
                0
            ),
            followingMonth: new Date(
                props.operation.date.getFullYear(),
                props.operation.date.getMonth() + 1,
                1
            )
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
