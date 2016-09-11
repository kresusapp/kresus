import React from 'react';
import { connect } from 'react-redux';

import { translate as $t } from '../../helpers';
import { get, actions } from '../../store';

import Modal from '../ui/modal';

import { DetailedViewLabel } from './label';
import OperationTypeSelect from './type-select';
import CategorySelect from './category-select';
import DeleteOperation from './delete-operation';

export function computeAttachmentLink(op) {
    let file = op.binary.fileName || 'file';
    return `operations/${op.id}/${file}`;
}

const MODAL_ID = 'details-modal';

class DetailsModal extends React.Component {
    render() {
        let op = this.props.operation;

        if (op === null) {
            return <div/>;
        }

        let typeSelect = (
            <OperationTypeSelect
              operation={ op }
              onSelectId={ this.props.makeHandleSelectType(op) }
            />
        );

        let categorySelect = (
            <CategorySelect
              operation={ op }
              onSelectId={ this.props.makeHandleSelectCategory(op) }
              categories={ this.props.categories }
              getCategoryTitle={ this.props.getCategoryTitle }
            />
        );

        let modalTitle = $t('client.operations.details');

        let modalFooter = (
            <div>
                <DeleteOperation
                  operation={ op }
                  formatCurrency={ this.props.formatCurrency }
                />
            </div>
        );

        let attachment = null;
        if (op.binary !== null) {
            attachment = {
                link: computeAttachmentLink(op),
                text: $t('client.operations.attached_file')
            };
        } else if (op.attachments && op.attachments.url !== null) {
            attachment = {
                link: op.attachments.url,
                text: $t(`client.${op.attachments.linkTranslationKey}`)
            };
        }

        if (attachment) {
            attachment = (
                <div className="form-group clearfix">
                    <label className="col-xs-4 control-label">
                        { attachment.text }
                    </label>
                    <label className="col-xs-8 text-info">
                        <a href={ attachment.link } target="_blank">
                            <span className="glyphicon glyphicon-file"></span>
                        </a>
                    </label>
                </div>
            );
        }

        let modalBody = (
            <div>
                <div className="form-group clearfix">
                    <label className="col-xs-4 control-label">
                        { $t('client.operations.full_label') }
                    </label>
                    <label className="col-xs-8">
                        { op.raw }
                    </label>
                </div>
                <div className="form-group clearfix">
                    <label className="col-xs-4 control-label">
                        { $t('client.operations.custom_label') }
                    </label>
                    <div className="col-xs-8">
                        <DetailedViewLabel operation={ op } />
                    </div>
                </div>
                <div className="form-group clearfix">
                    <label className="col-xs-4 control-label">
                        { $t('client.operations.amount') }
                    </label>
                    <label className="col-xs-8">
                        { this.props.formatCurrency(op.amount) }
                    </label>
                </div>
                <div className="form-group clearfix">
                    <label className="col-xs-4 control-label">
                        { $t('client.operations.type') }
                    </label>
                    <div className="col-xs-8">
                        { typeSelect }
                    </div>
                </div>
                <div className="form-group clearfix">
                    <label className="col-xs-4 control-label">
                        { $t('client.operations.category') }
                    </label>
                    <div className="col-xs-8">
                        { categorySelect }
                    </div>
                </div>
                { attachment }
            </div>
        );

        return (
            <Modal
              modalId={ MODAL_ID }
              modalBody={ modalBody }
              modalTitle={ modalTitle }
              modalFooter={ modalFooter }
            />
        );
    }
}

let ConnectedModal = connect((state, props) => {
    let operation = props.operationId ? get.operationById(state, props.operationId) : null;
    return {
        operation
    };
}, dispatch => {
    return {
        makeHandleSelectType: operation => type => {
            actions.setOperationType(dispatch, operation, type);
        },
        makeHandleSelectCategory: operation => category => {
            actions.setOperationCategory(dispatch, operation, category);
        }
    };
})(DetailsModal);

ConnectedModal.propTypes = {
    // An operation id (can be null) from which we may retrieve a full
    // operation.
    operationId: React.PropTypes.string,

    // Function called to format amounts.
    formatCurrency: React.PropTypes.func.isRequired,

    // Array of categories (used for the category select).
    categories: React.PropTypes.array.isRequired,

    // Maps categories => titles (used for the category select).
    getCategoryTitle: React.PropTypes.func.isRequired,
};

// Simple wrapper that exposes one setter (setOperationId), to not expose a
// ref'd redux component to the above component.
class Wrapper extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedOperationId: null
        };

        // Togglable state to only show right thereafter the user asked.
        this.show = false;
    }

    setOperationId(operationId) {
        this.show = true;
        this.setState({
            selectedOperationId: operationId
        });
    }

    componentDidUpdate() {
        if (this.show && this.state.selectedOperationId !== null) {
            $(`#${MODAL_ID}`).modal('show');
            this.show = false;
        }
    }

    render() {
        return (
            <ConnectedModal
              operationId={ this.state.selectedOperationId }
              formatCurrency={ this.props.formatCurrency }
              categories={ this.props.categories }
              getCategoryTitle={ this.props.getCategoryTitle }
            />
        );
    }
}

export default Wrapper;
