import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { formatDate, NONE_CATEGORY_ID, translate as $t } from '../../helpers';
import { get, actions } from '../../store';

import LabelComponent from './label';
import { MODAL_SLUG } from './details';

import withLongPress from '../ui/longpress';

const OpenDetailsModalButton = connect(
    null,
    (dispatch, props) => {
        return {
            handleClick() {
                actions.showModal(dispatch, MODAL_SLUG, props.operationId);
            }
        };
    }
)(props => {
    return (
        <button
            className="fa fa-plus-square"
            title={$t('client.operations.show_details')}
            onClick={props.handleClick}
        />
    );
});

OpenDetailsModalButton.propTypes = {
    // The unique id of the operation for which the details have to be shown.
    operationId: PropTypes.string.isRequired
};

import OperationTypeSelect from './editable-type-select';
import CategorySelect from './editable-category-select';

// As the Operation component is meant to be passed to the withLongPress HOC,
// it has to be non functional.
/* eslint-disable react/prefer-stateless-function */
class Operation extends React.PureComponent {
    render() {
        let op = this.props.operation;

        let rowClassName = op.amount > 0 ? 'success' : '';

        let maybeDetailsCell = null;
        let maybeTypeCell = null;
        let maybeCategoryCell = null;
        let maybeBudgetIcon = null;

        if (!this.props.isMobile) {
            maybeDetailsCell = (
                <td className="modale-button">
                    <OpenDetailsModalButton operationId={op.id} />
                </td>
            );

            maybeTypeCell = (
                <td className="type">
                    <OperationTypeSelect operationId={op.id} value={op.type} className="light" />
                </td>
            );

            maybeCategoryCell = (
                <td className="category">
                    <CategorySelect operationId={op.id} value={op.categoryId} className="light" />
                </td>
            );

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
                        className={`operation-assigned-to-budget fa ${budgetIcon}`}
                        title={budgetTitle}
                    />
                );
            }
        }

        let maybeBorder = this.props.categoryColor
            ? { borderRight: `5px solid ${this.props.categoryColor}` }
            : null;

        return (
            <tr style={maybeBorder} className={rowClassName}>
                {maybeDetailsCell}
                <td className="date">
                    <span>{formatDate.toShortString(op.date)}</span>
                    {maybeBudgetIcon}
                </td>
                {maybeTypeCell}
                <td>
                    <LabelComponent item={op} inputClassName="light" />
                </td>
                <td className="amount">{this.props.formatCurrency(op.amount)}</td>
                {maybeCategoryCell}
            </tr>
        );
    }
}

const ConnectedOperation = connect((state, props) => {
    let operation = get.operationById(state, props.operationId);
    let categoryColor =
        operation.categoryId !== NONE_CATEGORY_ID
            ? get.categoryById(state, operation.categoryId).color
            : null;
    return {
        operation,
        categoryColor,
        isMobile: props.isMobile
    };
})(Operation);
/* eslint-enable react/prefer-stateless-function */

ConnectedOperation.propTypes = {
    // The operation's unique identifier this item is representing.
    operationId: PropTypes.string.isRequired,

    // A method to compute the currency.
    formatCurrency: PropTypes.func.isRequired,

    // Is on mobile view.
    isMobile: PropTypes.bool
};

ConnectedOperation.defaultProps = {
    isMobile: false
};

export const OperationItem = ConnectedOperation;

export const PressableOperationItem = connect(
    null,
    (dispatch, props) => {
        return {
            onLongPress() {
                actions.showModal(dispatch, MODAL_SLUG, props.operationId);
            }
        };
    }
)(withLongPress(ConnectedOperation));
