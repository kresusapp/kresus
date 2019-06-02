import React from 'react';
import { connect } from 'react-redux';

import { formatDate, translate as $t, displayLabel } from '../../helpers';
import { get, actions } from '../../store';

import { registerModal } from '../ui/modal';
import ModalContent from '../ui/modal/content';
import CancelAndDelete from '../ui/modal/cancel-and-delete-buttons';

import LabelComponent from './label';
import OperationTypeSelect from './editable-type-select';
import CategorySelect from './editable-category-select';
import BudgetDateComponent from './budget-date';

const DetailsModal = connect(
    state => {
        let operationId = get.modal(state).state;
        let operation = get.operationById(state, operationId);
        return {
            operation,
            formatCurrency: get.accountById(state, operation.accountId).formatCurrency
        };
    },

    dispatch => {
        return {
            confirmDeleteOperation(operationId) {
                actions.showModal(dispatch, MODAL_SLUG_DELETE, operationId);
            }
        };
    },

    ({ operation, formatCurrency }, { confirmDeleteOperation }) => {
        return {
            operation,
            formatCurrency,
            handleDelete() {
                confirmDeleteOperation(operation.id);
            }
        };
    }
)(props => {
    const { operation } = props;

    const body = (
        <React.Fragment>
            <p className="cols-with-label">
                <label>{$t('client.operations.full_label')}</label>
                <span>{operation.rawLabel}</span>
            </p>
            <div className="cols-with-label">
                <label>{$t('client.operations.custom_label')}</label>
                <LabelComponent
                    item={operation}
                    displayLabelIfNoCustom={false}
                    forceEditMode={true}
                />
            </div>
            <p className="cols-with-label">
                <label>{$t('client.operations.date')}</label>
                <span>{formatDate.toDayString(operation.date)}</span>
            </p>
            <p className="cols-with-label">
                <label>{$t('client.operations.amount')}</label>
                <span>{props.formatCurrency(operation.amount)}</span>
            </p>
            <div className="cols-with-label">
                <label>{$t('client.operations.type')}</label>
                <OperationTypeSelect operationId={operation.id} value={operation.type} />
            </div>
            <div className="cols-with-label">
                <label>{$t('client.operations.category')}</label>
                <CategorySelect operationId={operation.id} value={operation.categoryId} />
            </div>
            <div className="cols-with-label">
                <label>{$t('client.operations.budget')}</label>
                <BudgetDateComponent operation={operation} />
            </div>
        </React.Fragment>
    );

    const footer = (
        <button type="button" onClick={props.handleDelete} className="btn danger">
            <span className="fa fa-trash" />
            &nbsp;
            {$t('client.operations.delete_operation_button')}
        </button>
    );
    return <ModalContent title={$t('client.operations.details')} body={body} footer={footer} />;
});

export const MODAL_SLUG = 'operation-details-modal';

registerModal(MODAL_SLUG, () => <DetailsModal />);

const DeleteOperationModal = connect(
    state => {
        let operationId = get.modal(state).state;
        let operation = get.operationById(state, operationId);
        return {
            operation,
            formatCurrency: get.accountById(state, operation.accountId).formatCurrency
        };
    },

    dispatch => {
        return {
            showDetailsModal(operationId) {
                actions.showModal(dispatch, MODAL_SLUG, operationId);
            },
            deleteOperation(operationId) {
                actions.deleteOperation(dispatch, operationId);
            }
        };
    },

    ({ operation, formatCurrency }, { showDetailsModal, deleteOperation }) => {
        return {
            operation,
            formatCurrency,
            handleCancel() {
                showDetailsModal(operation.id);
            },
            handleDelete() {
                deleteOperation(operation.id);
            }
        };
    }
)(props => {
    let { operation, formatCurrency } = props;
    let label = displayLabel(operation);
    let amount = formatCurrency(operation.amount);
    let date = operation.date.toLocaleDateString();
    const body = (
        <React.Fragment>
            <div>{$t('client.operations.warning_delete')}</div>
            <div>{$t('client.operations.are_you_sure', { label, amount, date })}</div>
        </React.Fragment>
    );
    const footer = <CancelAndDelete onDelete={props.handleDelete} onCancel={props.handleCancel} />;
    return (
        <ModalContent title={$t('client.confirmdeletemodal.title')} body={body} footer={footer} />
    );
});

const MODAL_SLUG_DELETE = 'confirm-delete-operation';

registerModal(MODAL_SLUG_DELETE, () => <DeleteOperationModal />);
