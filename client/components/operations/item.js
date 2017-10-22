import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import { actions } from '../../store';

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
            operation={op}
            types={props.types}
            onSelectId={props.handleSelectType}
        />
    );

    let categorySelect = (
        <CategorySelect
            operation={op}
            onSelectId={props.handleSelectCategory}
            categories={props.categories}
            getCategory={props.getCategory}
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
                href={opLink}
                title={$t('client.operations.attached_file')}>
                <span className="fa fa-file" aria-hidden="true" />
            </a>
        );
    } else if (op.attachments && op.attachments.url !== null) {
        link = (
            <a href={op.attachments.url} rel="noopener noreferrer" target="_blank">
                <span className="fa fa-link" />
                {$t(`client.${op.attachments.linkTranslationKey}`)}
            </a>
        );
    }

    if (link) {
        link = <label className="input-group-addon box-transparent">{link}</label>;
    }

    return (
        <tr className={rowClassName}>
            <td className="hidden-xs">
                <a onClick={props.onOpenModal}>
                    <i className="fa fa-plus-square" />
                </a>
            </td>
            <td>{formatDate.toShortString(op.date)}</td>
            <td className="hidden-xs">{typeSelect}</td>
            <td>
                <OperationListViewLabel operation={op} link={link} />
            </td>
            <td className="text-right">{props.formatCurrency(op.amount)}</td>
            <td className="hidden-xs">{categorySelect}</td>
        </tr>
    );
};

Operation.propTypes = {
    // The operation this item is representing.
    operation: PropTypes.object.isRequired,

    // A method to compute the currency.
    formatCurrency: PropTypes.func.isRequired,

    // An array of categories.
    categories: PropTypes.array.isRequired,

    // An array of types.
    types: PropTypes.array.isRequired,

    // A function mapping category id => category
    getCategory: PropTypes.func.isRequired
};

export default connect(null, (dispatch, props) => {
    return {
        handleSelectType: type => {
            actions.setOperationType(dispatch, props.operation, type);
        },
        handleSelectCategory: category => {
            actions.setOperationCategory(dispatch, props.operation, category);
        }
    };
})(Operation);
