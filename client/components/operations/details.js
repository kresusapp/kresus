import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import { translate as $t } from '../../helpers';
import { get, actions } from '../../store';

import MultiStateModal from '../ui/multi-state-modal';

import { LabelComponent } from './label';
import OperationTypeSelect from './type-select';
import CategorySelect from './category-select';

export function computeAttachmentLink(opId, binary) {
    return binary ? `operations/${opId}/${binary.fileName || 'file'}` : null;
}

const MODAL_ID = 'details-modal';

let fillShowDetails = (props, askDeleteConfirm) => {
    let { operationId } = props;

    if (operationId === null) {
        return {
            modalBody: <div />,
            modalTitle: '',
            modalFooter: <div />
        };
    }
    let typeSelect = (
        <OperationTypeSelect
          operationId={ operationId }
        />
    );

    let categorySelect = (
        <CategorySelect
          operationId={ operationId }
        />
    );

    let modalTitle = $t('client.operations.details');

    let attachment = null;
    if (props.binary !== null) {
        attachment = {
            link: computeAttachmentLink(operationId, props.binary),
            text: $t('client.operations.attached_file')
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
                        <span className="fa fa-file" />
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
                    { props.raw }
                </label>
            </div>
            <div className="form-group clearfix">
                <label className="col-xs-4 control-label">
                    { $t('client.operations.custom_label') }
                </label>
                <div className="col-xs-8">
                    <LabelComponent
                      operationId={ operationId }
                      displayLabelIfNoCustom={ false }
                    />
                </div>
            </div>
            <div className="form-group clearfix">
                <label className="col-xs-4 control-label">
                    { $t('client.operations.amount') }
                </label>
                <label className="col-xs-8">
                    { props.formatCurrency(props.amount) }
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

let fillConfirmDelete = (props, showDetails) => {

    let label = `"${props.customLabel ? props.customLabel : props.title}"`;

    let amount = props.formatCurrency(props.amount);
    let date = props.date.toLocaleDateString();

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
              onClick={ props.handleDeleteOperation }>
                { $t('client.confirmdeletemodal.confirm') }
            </button>
        </div>
    );

    return { modalTitle, modalBody, modalFooter };
};

let DetailsModal = props => {
    if (props.operationId === null) {
        return null;
    }

    let views = {
        'details': switchView => {
            return fillShowDetails(props, () => switchView('confirm-delete'));
        },
        'confirm-delete': switchView => {
            return fillConfirmDelete(props, () => switchView('details'));
        }
    };

    return (
        <MultiStateModal
          initialView='details'
          views={ views }
          modalId={ MODAL_ID }
        />
    );
};

let ConnectedModal = connect((state, props) => {
    let operation = get.operationById(state, props.operationId);

    if (operation) {
        let { raw, title, date, customLabel, amount, binary } = operation;
        return {
            raw,
            title,
            date,
            customLabel,
            amount,
            binary
        };
    }
    return {};

}, (dispatch, props) => {
    return {
        handleDeleteOperation: () => {
            actions.deleteOperation(dispatch, props.operationId);
            props.resetModal();
        }
    };
})(DetailsModal);

ConnectedModal.propTypes = {
    // An operation id (can be null) from which we may retrieve a full
    // operation.
    operationId: PropTypes.string,

    // Function called to format amounts.
    formatCurrency: PropTypes.func.isRequired,

    resetModal: PropTypes.func.isRequired
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

        this.resetOperationId = this.resetOperationId.bind(this);
    }

    setOperationId(operationId) {
        this.show = true;
        this.setState({
            selectedOperationId: operationId
        });
    }

    resetOperationId() {
        this.show = false;
        this.setState({
            selectedOperationId: null
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
              resetModal={ this.resetOperationId }
            />
        );
    }
}

export default Wrapper;
