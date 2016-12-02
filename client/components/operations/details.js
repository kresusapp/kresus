import React from 'react';
import { connect } from 'react-redux';

import { translate as $t } from '../../helpers';
import { get, actions } from '../../store';

import Modal from '../ui/modal';

import { DetailedViewLabel } from './label';
import OperationTypeSelect from './type-select';
import CategorySelect from './category-select';

export function computeAttachmentLink(op) {
    let file = op.binary.fileName || 'file';
    return `operations/${op.id}/${file}`;
}

const MODAL_ID = 'details-modal';

let fillShowDetails = (props, askDeleteConfirm) => {
    let op = props.operation;

    let typeSelect = (
        <OperationTypeSelect
          operation={ op }
          onSelectId={ props.makeHandleSelectType(op) }
          types={ props.types }
        />
    );

    let categorySelect = (
        <CategorySelect
          operation={ op }
          onSelectId={ props.makeHandleSelectCategory(op) }
          categories={ props.categories }
          getCategory={ props.getCategory }
        />
    );

    let modalTitle = $t('client.operations.details');

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
                    <a
                      href={ attachment.link }
                      rel="noopener noreferrer"
                      target="_blank">
                        <span className="glyphicon glyphicon-file" />
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
                    { props.formatCurrency(op.amount) }
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

    let modalFooter = (
        <div>
            <div>
                <button
                  type="button"
                  onClick={ askDeleteConfirm }
                  className="btn btn-danger">
                    <span className="fa fa-trash" />&nbsp;
                    { $t('client.operations.delete_operation_button') }
                </button>
            </div>
        </div>
    );

    return {
        modalBody,
        modalTitle,
        modalFooter
    };
};

let fillConfirmDelete = (props, showDetails, onDelete) => {
    let op = props.operation;

    let label = `"${op.customLabel ? op.customLabel : op.title}"`;

    let amount = props.formatCurrency(op.amount);
    let date = op.date.toLocaleDateString();

    let modalTitle = $t('client.confirmdeletemodal.title');

    let modalBody = (
        <div>
            <div>{ $t('client.operations.warning_delete') }</div>
            <div>{ $t('client.operations.are_you_sure', { label, amount, date }) }</div>
        </div>
    );

    let modalFooter = (
        <div>
            <button
              type="button"
              className="btn btn-default"
              onClick={ showDetails }>
                { $t('client.confirmdeletemodal.dont_delete') }
            </button>
            <button
              type="button"
              className="btn btn-danger"
              data-dismiss="modal"
              onClick={ onDelete }>
                { $t('client.confirmdeletemodal.confirm') }
            </button>
        </div>
    );

    return { modalTitle, modalBody, modalFooter };
};

class DetailsModal extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            view: 'details'
        };

        let makeChangeView = view => () => this.setState({ view });

        this.showConfirm = makeChangeView('confirm-delete').bind(this);
        this.showDetails = makeChangeView('details').bind(this);
    }

    render() {
        if (this.props.operation === null) {
            return <div />;
        }

        let onDelete = this.props.makeHandleDeleteOperation(this.props.operation);

        let modal;
        switch (this.state.view) {
            case 'details':
                modal = fillShowDetails(this.props, this.showConfirm);
                break;
            case 'confirm-delete':
                modal = fillConfirmDelete(this.props, this.showDetails, onDelete);
                break;
            default:
                throw 'Unknown state';
        }

        let { modalBody, modalTitle, modalFooter } = modal;

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
        },
        makeHandleDeleteOperation: operation => () => {
            actions.deleteOperation(dispatch, operation.id);
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

    // Array of types (used for the type select).
    types: React.PropTypes.array.isRequired,

    // A function mapping category id => category
    getCategory: React.PropTypes.func.isRequired
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
              types={ this.props.types }
              getCategory={ this.props.getCategory }
            />
        );
    }
}

export default Wrapper;
