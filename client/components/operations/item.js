import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { formatDate, translate as $t } from '../../helpers';
import { get } from '../../store';

import LabelComponent from './label';

import OperationTypeSelect from './editable-type-select';
import CategorySelect from './editable-category-select';

// As the Operation component is meant to be passed to the withLongPress HOC,
// it has to be non functional.
/* eslint-disable react/prefer-stateless-function */
class Operation extends React.PureComponent {
    render() {
        let op = this.props.operation;

        let rowClassName = op.amount > 0 ? 'success' : '';
        let typeSelect = <OperationTypeSelect operationId={op.id} value={op.type} />;
        let categorySelect = <CategorySelect operationId={op.id} value={op.categoryId} />;

        let maybeBudgetIcon = null;
        if (+op.budgetDate !== +op.date) {
            let budgetIcon, budgetTitle;
            if (+op.budgetDate < +op.date) {
                budgetIcon = 'fa-calendar-minus-o';
                budgetTitle = $t('client.operations.previous_month_budget');
            } else {
                budgetIcon = 'fa-calendar-plus-o';
                budgetTitle = $t('client.operations.following_month_budget');
            }
            maybeBudgetIcon = (
                <i
                    className={`hidden-xs operation-assigned-to-budget fa ${budgetIcon}`}
                    title={budgetTitle}
                />
            );
        }

        return (
            <tr className={rowClassName}>
                <td className="modale-button">
                    <a onClick={this.props.onOpenModal}>
                        <i className="fa fa-plus-square" />
                    </a>
                </td>
                <td className="date">
                    <span className="text-nowrap">
                        {formatDate.toShortString(op.date)}
                        {maybeBudgetIcon}
                    </span>
                </td>
                <td className="type">{typeSelect}</td>
                <td>
                    <LabelComponent operation={op} readonlyOnSmallScreens={true} />
                </td>
                <td className="amount">{this.props.formatCurrency(op.amount)}</td>
                <td className="category">{categorySelect}</td>
            </tr>
        );
    }
}

const ConnectedOperation = connect((state, props) => {
    return {
        operation: get.operationById(state, props.operationId)
    };
})(Operation);
/* eslint-enable react/prefer-stateless-function */

ConnectedOperation.propTypes = {
    // The operation's unique identifier this item is representing.
    operationId: PropTypes.string.isRequired,

    // A method to compute the currency.
    formatCurrency: PropTypes.func.isRequired
};

export default ConnectedOperation;
