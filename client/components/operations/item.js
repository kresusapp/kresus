import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { formatDate } from '../../helpers';
import { get } from '../../store';

import { OperationListViewLabel } from './label';

import OperationTypeSelect from './type-select';
import CategorySelect from './category-select';

const Operation = props => {
    let rowClassName = props.amount > 0 ? 'success' : '';

    let typeSelect = props.isSmallScreen ? null : (
        <OperationTypeSelect
          operationId={ props.operationId }
        />
    );

    let categorySelect = props.isSmallScreen ? null : (
        <CategorySelect
          operationId={ props.operationId }
        />
    );

    return (
        <tr className={ rowClassName }>
            <td className="hidden-xs">
                <a onClick={ props.onOpenModal }>
                    <i className="fa fa-plus-square" />
                </a>
            </td>
            <td>
                { formatDate.toShortString(props.date) }
            </td>
            <td className="hidden-xs">
                { typeSelect }
            </td>
            <td>
                <OperationListViewLabel
                  operationId={ props.operationId }
                />
            </td>
            <td className="text-right">
                { props.formatCurrency(props.amount) }
            </td>
            <td className="hidden-xs">
                { categorySelect }
            </td>
        </tr>
    );
};

const Export = connect((state, props) => {
    let { amount, date } = get.operationById(state, props.operationId);
    return {
        amount,
        date
    };
})(Operation);

Export.propTypes = {
    // The id of the operation this item is representing.
    operationId: PropTypes.string.isRequired,

    // A method to compute the currency.
    formatCurrency: PropTypes.func.isRequired,

    // A boolean telling if the screen is small or not
    isSmallScreen: PropTypes.bool.isRequired
};

export default Export;
