import React from 'react';

import { translate as $t } from '../../helpers';

import { DetailedViewLabel } from './label';
import DeleteOperation from './delete-operation';

export function computeAttachmentLink(op) {
    let file = op.binary.fileName || 'file';
    return `operations/${op.id}/${file}`;
}

export default class OperationDetails extends React.Component {
    render() {
        let op = this.props.operation;

        let maybeAttachment = '';
        if (op.binary !== null) {
            let opLink = computeAttachmentLink(op);
            maybeAttachment = (
                <span>
                    <a href={ opLink } target="_blank">
                        <span className="glyphicon glyphicon-file"></span>
                        { $t('client.operations.attached_file') }
                    </a>
                </span>
            );
        } else if (op.attachments && op.attachments.url !== null) {
            maybeAttachment = (
                <span>
                    <a href={ op.attachments.url } target="_blank">
                        <span className="glyphicon glyphicon-file"></span>
                        { $t(`client.${op.attachments.linkTranslationKey}`) }
                    </a>
                </span>
            );
        }

        return (
            <tr className={ this.props.rowClassName }>
                <td>
                    <a href="#" onClick={ this.props.onToggleDetails }>
                        <i className="fa fa-minus-square"></i>
                    </a>
                </td>
                <td colSpan="5" className="text-uppercase">
                    <ul>
                        <li>
                            { $t('client.operations.full_label') }
                            { op.raw }
                        </li>
                        <li className="form-inline">
                            { $t('client.operations.custom_label') }
                            <DetailedViewLabel operation={ op } />
                        </li>
                        <li>
                            { $t('client.operations.amount') }
                            { this.props.formatCurrency(op.amount) }
                        </li>
                        <li className="form-inline">
                            { $t('client.operations.type') }
                            { this.props.typeSelect }
                        </li>
                        <li className="form-inline">
                            { $t('client.operations.category') }
                            { this.props.categorySelect }
                        </li>
                        { maybeAttachment }
                        <li>
                            <DeleteOperation
                              operation={ this.props.operation }
                              formatCurrency={ this.props.formatCurrency }
                            />
                        </li>
                    </ul>

                </td>
            </tr>
        );
    }
}

OperationDetails.propTypes = {
    // The Operation itself.
    operation: React.PropTypes.object.isRequired,

    // Function describing what happens when we untoggle details.
    onToggleDetails: React.PropTypes.func.isRequired,

    // Function called to format amounts.
    formatCurrency: React.PropTypes.func.isRequired,

    // CSS class name for the current row.
    rowClassName: React.PropTypes.string.isRequired,

    // Type select for the current operation.
    typeSelect: React.PropTypes.object.isRequired,

    // Category select for the current operation.
    categorySelect: React.PropTypes.object.isRequired,
};
