import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import { translate as $t } from '../../helpers';
import { get, actions } from '../../store';

import MultiStateModal from '../ui/multi-state-modal';

import LabelComponent from './label';
import OperationTypeSelect from './editable-type-select';
import CategorySelect from './editable-category-select';
import BudgetDateComponent from './budget-date';

const MODAL_ID = 'details-modal';

let fillShowDetails = (props, askDeleteConfirm) => {
    let op = props.operation;

    let typeSelect = <OperationTypeSelect operationId={op.id} selectedValue={op.type} />;

    let categorySelect = <CategorySelect operationId={op.id} selectedValue={op.categoryId} />;

    let modalTitle = $t('client.operations.details');

    let modalBody = (
        <div>
            <div className="form-group clearfix">
                <label className="col-xs-4 control-label">
                    {$t('client.operations.full_label')}
                </label>
                <label className="col-xs-8">{op.raw}</label>
            </div>
            <div className="form-group clearfix">
                <label className="col-xs-4 control-label">
                    {$t('client.operations.custom_label')}
                </label>
                <div className="col-xs-8">
                    <LabelComponent operation={op} displayLabelIfNoCustom={false} />
                </div>
            </div>
            <div className="form-group clearfix">
                <label className="col-xs-4 control-label">{$t('client.operations.amount')}</label>
                <label className="col-xs-8">{props.formatCurrency(op.amount)}</label>
            </div>
            <div className="form-group clearfix">
                <label className="col-xs-4 control-label">{$t('client.operations.type')}</label>
                <div className="col-xs-8">{typeSelect}</div>
            </div>
            <div className="form-group clearfix">
                <label className="col-xs-4 control-label">{$t('client.operations.category')}</label>
                <div className="col-xs-8">{categorySelect}</div>
            </div>
            <div className="form-group clearfix">
                <label className="col-xs-4 control-label">{$t('client.operations.budget')}</label>
                <div className="col-xs-8">
                    <BudgetDateComponent operation={op} />
                </div>
            </div>
        </div>
    );

    let modalFooter = (
        <div>
            <div>
                <button type="button" onClick={askDeleteConfirm} className="btn btn-danger">
                    <span className="fa fa-trash" />&nbsp;
                    {$t('client.operations.delete_operation_button')}
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
            <div>{$t('client.operations.warning_delete')}</div>
            <div>{$t('client.operations.are_you_sure', { label, amount, date })}</div>
        </div>
    );

    let modalFooter = (
        <div>
            <button type="button" className="btn btn-default" onClick={showDetails}>
                {$t('client.confirmdeletemodal.dont_delete')}
            </button>
            <button
                type="button"
                className="btn btn-danger"
                data-dismiss="modal"
                onClick={onDelete}>
                {$t('client.confirmdeletemodal.confirm')}
            </button>
        </div>
    );

    return { modalTitle, modalBody, modalFooter };
};

let DetailsModal = props => {
    if (props.operation === null) {
        return null;
    }

    let views = {
        details: switchView => {
            return fillShowDetails(props, () => switchView('confirm-delete'));
        },
        'confirm-delete': switchView => {
            return fillConfirmDelete(
                props,
                () => switchView('details'),
                props.handleDeleteOperation
            );
        }
    };

    return <MultiStateModal initialView="details" views={views} modalId={MODAL_ID} />;
};

let ConnectedModal = connect(
    (state, props) => {
        let operation = props.operationId ? get.operationById(state, props.operationId) : null;
        return {
            operation
        };
    },
    (dispatch, props) => {
        return {
            handleDeleteOperation() {
                actions.deleteOperation(dispatch, props.operationId);
            }
        };
    }
)(DetailsModal);

ConnectedModal.propTypes /* remove-proptypes */ = {
    // An operation id (can be null) from which we may retrieve a full
    // operation.
    operationId: PropTypes.string,

    // Function called to format amounts.
    formatCurrency: PropTypes.func.isRequired
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
                operationId={this.state.selectedOperationId}
                formatCurrency={this.props.formatCurrency}
            />
        );
    }
}

export default Wrapper;
