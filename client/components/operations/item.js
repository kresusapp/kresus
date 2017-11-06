import React from 'react';
import PropTypes from 'prop-types';

import { translate as $t, formatDate } from '../../helpers';

import { computeAttachmentLink, ShowDetailsButton } from './details';

import { OperationListViewLabel } from './label';

import OperationTypeSelect from './editable-type-select';
import CategorySelect from './editable-category-select';

// As the Operation component is meant to be passed to the withLongPress HOC,
// it has to be non functional.
/* eslint-disable react/prefer-stateless-function */
class Operation extends React.PureComponent {
    render() {
        let op = this.props.operation;

        let rowClassName = op.amount > 0 ? 'success' : '';

        let typeSelect = <OperationTypeSelect operationId={op.id} selectedValue={op.type} />;

        let categorySelect = <CategorySelect operationId={op.id} selectedValue={op.categoryId} />;

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
                    <ShowDetailsButton operationId={op.id} />
                </td>
                <td>{formatDate.toShortString(op.date)}</td>
                <td className="hidden-xs">{typeSelect}</td>
                <td>
                    <OperationListViewLabel operation={op} link={link} />
                </td>
                <td className="text-right">{this.props.formatCurrency(op.amount)}</td>
                <td className="hidden-xs">{categorySelect}</td>
            </tr>
        );
    }
}
/* eslint-enable react/prefer-stateless-function */

Operation.propTypes = {
    // The operation this item is representing.
    operation: PropTypes.object.isRequired,

    // A method to compute the currency.
    formatCurrency: PropTypes.func.isRequired
};

export default Operation;
