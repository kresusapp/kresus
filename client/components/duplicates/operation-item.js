import React from 'react';
import connect from 'react-redux';
import PropTypes from 'prop-types';

import { get } from '../../store';

const OperationItem = props => {
    let customLabel = null;
    if (props.customLabel) {
        customLabel = (
            <span
              className="fa fa-question-circle pull-right"
              title={ props.customLabel }
            />
        );
    }

    let maybeMergeButton = null;
    if (props.firstInPair) {
        maybeMergeButton = (
            <td rowSpan={ 2 }>
                <button
                  className="btn btn-primary"
                  onClick={ props.merge }>
                    <span
                      className="fa fa-compress"
                      aria-hidden="true"
                    />
                </button>
            </td>
        );
    }

    return (
        <tr>
            <td>{ formatDate.toShortString(props.date) }</td>
            <td>
                { props.title }
                { customLabel }
            </td>
            <td>{ props.formatCurrency(props.amount) }</td>
            <td>{ props.category }</td>
            <td>{ $t(`client.${props.type}`) }</td>
            <td>{ formatDate.toLongString(props.dateImport) }</td>
            { maybeMergeButton }
        </tr>
    );
};

const Export = connect((state, props) => {
    let { date, title, amount, type, dateImport, customLabel, categoryId } = get.operationById(state, props.operationId);
    let category = get.categoryById = get.categoryById(state, props.categoryId).title;
    return {
        date,
        title,
        amount,
        type,
        dateImport,
        customLabel,
        category
    };
})(OperationItem);

Export.propTypes = {
    // The id of the operation to by displayed.
    operationId: PropTypes.string.isRequired,

    // A boolean telling whether the operation is the first in the pair.
    firstInPair: PropTypes.boolean.isRequired,

    // The function to be called to merge 2 operations.
    merge: PropTypes.func
};

export Export;
