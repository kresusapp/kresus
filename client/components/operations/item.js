import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import { actions, get } from '../../store';

import { translate as $t, formatDate } from '../../helpers';

import { computeAttachmentLink } from './details';
import { OperationListViewLabel } from './label';

import OperationTypeSelect from './type-select';
import CategorySelect from './category-select';

let Operation = props => {
    let op = props.operation;

    let rowClassName = op.amount > 0 ? 'success' : '';

    let typeSelect = (
        <OperationTypeSelect
          selectedTypeId={ op.type }
          onSelectId={ props.handleSelectType }
        />
    );

    let categorySelect = (
        <CategorySelect
          selectedCategoryId={ op.categoryId }
          onSelectId={ props.handleSelectCategory }
        />
    );

    // Add a link to the attached file, if there is any.
    let link;
    if (op.binary !== null) {
        let opLink = computeAttachmentLink(op);
        link = (
            <a
              target="_blank"
              rel="noopener noreferrer"
              href={ opLink }
              title={ $t('client.operations.attached_file') }>
                <span
                  className="fa fa-file"
                  aria-hidden="true"
                />
            </a>
        );
    } else if (op.attachments && op.attachments.url !== null) {
        link = (
            <a
              href={ op.attachments.url }
              rel="noopener noreferrer"
              target="_blank">
                <span className="fa fa-link" />
                { $t(`client.${op.attachments.linkTranslationKey}`) }
            </a>
        );
    }

    if (link) {
        link = (
            <label
              className="input-group-addon box-transparent">
                { link }
            </label>
        );
    }

    return (
        <tr className={ rowClassName }>
            <td className="hidden-xs">
                <a onClick={ props.handleOpenModal }>
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
                  operation={ op }
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

const ConnectedItem = connect((state, props) => {
    return {
        operation: get.operationById(state, props.operationId),
        handleOpenModal: () => props.onOpenModal(props.operationId)
    };
}, (dispatch, props) => {
    return {
        handleSelectType: type => {
            actions.setOperationType(dispatch, props.operationId, type);
        },
        handleSelectCategory: category => {
            actions.setOperationCategory(dispatch, props.operationId, category);
        }
    };
})(Operation);

ConnectedItem.propTypes = {
    // The id of the operation this item is representing.
    operationId: PropTypes.string.isRequired,

    // A method to compute the currency.
    formatCurrency: PropTypes.func.isRequired,

    // A method to show the details modal
    onOpenModal: PropTypes.func.isRequired
};

export default ConnectedItem;
