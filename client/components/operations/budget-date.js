import React from 'react';
import { connect } from 'react-redux';
import moment from 'moment';
import PropTypes from 'prop-types';

import { translate as $t } from '../../helpers';
import { actions } from '../../store';

class BudgetDateComponent extends React.Component {
    state = { editedValue: null };

    handleTogglePreviousMonth = () => {
        if (+this.props.operation.budgetDate !== +this.props.previousMonth) {
            this.props.setBudgetDate(this.props.previousMonth);
        }
    };

    handleToggleCurrentMonth = () => {
        if (+this.props.operation.budgetDate !== +this.props.operation.date) {
            this.props.setBudgetDate(null);
        }
    };

    handleToggleFollowingMonth = () => {
        if (+this.props.operation.budgetDate !== +this.props.followingMonth) {
            this.props.setBudgetDate(this.props.followingMonth);
        }
    };

    toggleButton = (label, toggled, icon, onclick) => {
        let toggleButtonClass = 'btn';
        if (toggled) {
            toggleButtonClass = 'btn info active';
        }

        return (
            <button
                type="button"
                onClick={onclick}
                className={`${toggleButtonClass} budget-assignment`}>
                <i className={`fa ${icon}`} />
                <span>{label}</span>
            </button>
        );
    };

    render() {
        return (
            <div className="buttons-group" role="group">
                {this.toggleButton(
                    $t('client.operations.assign_to_previous_month'),
                    +this.props.operation.budgetDate === +this.props.previousMonth,
                    'fa-calendar-minus-o',
                    this.handleTogglePreviousMonth
                )}
                {this.toggleButton(
                    $t('client.operations.assign_to_current_month'),
                    +this.props.operation.budgetDate === +this.props.operation.date,
                    'fa-calendar-o',
                    this.handleToggleCurrentMonth
                )}
                {this.toggleButton(
                    $t('client.operations.assign_to_following_month'),
                    +this.props.operation.budgetDate === +this.props.followingMonth,
                    'fa-calendar-plus-o',
                    this.handleToggleFollowingMonth
                )}
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
            // Cheat a bit by putting the date of month as the 15, to avoid any
            // timezone conflict when using any of the edge days (start or end
            // of month).
            previousMonth: moment(props.operation.date)
                .date(15)
                .subtract(1, 'months')
                .toDate(),
            followingMonth: moment(props.operation.date)
                .date(15)
                .add(1, 'months')
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
