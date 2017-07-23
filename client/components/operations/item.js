import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { translate as $t, formatDate } from '../../helpers';
import { get } from '../../store';

import { OperationListViewLabel } from './label';

import OperationTypeSelect from './type-select';
import CategorySelect from './category-select';

const Operation = props => {
    let op = props.operation;

    let rowClassName = op.amount > 0 ? 'success' : '';

    let typeSelect = (
        <OperationTypeSelect
          operationId={ props.operationId }
        />
    );

    let categorySelect = (
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
                { formatDate.toShortString(op.date) }
            </td>
            <td className="hidden-xs">
                { typeSelect }
            </td>
            <td>
                <OperationListViewLabel
                  operationId={ op.id }
                  customLabel={ op.customLabel }
                  title={ op.title }
                  raw={ op.raw }
                  link={ link }
                />
            </td>
            <td className="text-right">
                { props.formatCurrency(op.amount) }
            </td>
            <td className="hidden-xs">
                { categorySelect }
            </td>
        </tr>
    );
};

const Export = connect((state, props) => {
    return {
        operation: get.operationById(state, props.operationId)
    };
})(Operation);

Export.propTypes = {
    // The id of the operation this item is representing.
    operationId: PropTypes.string.isRequired,

    // A method to compute the currency.
    formatCurrency: PropTypes.func.isRequired
};

export default Export;
