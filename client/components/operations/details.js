import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import { translate as $t } from '../../helpers';
import { get, actions } from '../../store';

import { registerModal } from '../ui/new-modal';
import LabelComponent from './label';
import OperationTypeSelect from './editable-type-select';
import CategorySelect from './editable-category-select';
import BudgetDateComponent from './budget-date';
import ModalContent from '../ui/modal-content';
import CancelAndDelete from '../ui/modal-cancel-and-delete-button';

const MODAL_SLUG = 'operation-details-modal';
const MODAL_SLUG_DELETE = 'confirm-delete-operation';

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
            makeHandleClickDelete(operationId) {
                actions.showModal(dispatch, MODAL_SLUG_DELETE, operationId);
            }
        };
    },
    ({ operation, formatCurrency }, { makeHandleClickDelete }) => {
        return {
            operation,
            formatCurrency,
            handleClickDelete() {
                makeHandleClickDelete(operation.id);
            }
        };
    }
)(props => {
    const { operation } = props;
    const body = (
        <React.Fragment>
            <div className="form-group">
                <label className="col-xs-4 control-label">
                    {$t('client.operations.full_label')}
                </label>
                <label className="col-xs-8">{operation.raw}</label>
            </div>
            <div className="form-group clearfix">
                <label className="col-xs-4 control-label">
                    {$t('client.operations.custom_label')}
                </label>
                <div className="col-xs-8">
                    <LabelComponent operation={operation} displayLabelIfNoCustom={false} />
                </div>
            </div>
            <div className="form-group clearfix">
                <label className="col-xs-4 control-label">{$t('client.operations.amount')}</label>
                <label className="col-xs-8">{props.formatCurrency(operation.amount)}</label>
            </div>
            <div className="form-group clearfix">
                <label className="col-xs-4 control-label">{$t('client.operations.type')}</label>
                <div className="col-xs-8">
                    <OperationTypeSelect
                        operationId={operation.id}
                        selectedValue={operation.type}
                    />
                </div>
            </div>
            <div className="form-group clearfix">
                <label className="col-xs-4 control-label">{$t('client.operations.category')}</label>
                <div className="col-xs-8">
                    <CategorySelect
                        operationId={operation.id}
                        selectedValue={operation.categoryId}
                    />
                </div>
            </div>
            <div className="form-group clearfix">
                <label className="col-xs-4 control-label">{$t('client.operations.budget')}</label>
                <div className="col-xs-8">
                    <BudgetDateComponent operation={operation} />
                </div>
            </div>
        </React.Fragment>
    );

    const footer = (
        <button type="button" onClick={props.handleClickDelete} className="btn btn-danger">
            <span className="fa fa-trash" />&nbsp;
            {$t('client.operations.delete_operation_button')}
        </button>
    );
    return <ModalContent title={$t('client.operations.details')} body={body} footer={footer} />;
});

registerModal(MODAL_SLUG, <DetailsModal />);

export const ShowDetailsButton = connect(null, (dispatch, props) => {
    return {
        handleClick() {
            actions.showModal(dispatch, MODAL_SLUG, props.operationId);
        }
    };
})(props => {
    return (
        <button
            className="fa fa-plus-square"
            title={$t('client.operations.details')}
            onClick={props.handleClick}
        />
    );
});

ShowDetailsButton.propTypes = {
    // The unique id of the operation for which the details have to be shown.
    operationId: PropTypes.string.isRequired
};

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
            makeClickCancel(operationId) {
                actions.showModal(dispatch, MODAL_SLUG, operationId);
            },
            makeClickDelete(operationId) {
                actions.deleteOperation(dispatch, operationId);
            }
        };
    },
    ({ operation, formatCurrency }, { makeClickCancel, makeClickDelete }) => {
        return {
            operation,
            formatCurrency,
            handleClickCancel() {
                makeClickCancel(operation.id);
            },
            handleClickDelete() {
                makeClickDelete(operation.id);
            }
        };
    }
)(props => {
    let { operation, formatCurrency } = props;
    let label = `"${operation.customLabel ? operation.customLabel : operation.title}"`;
    let amount = formatCurrency(operation.amount);
    let date = operation.date.toLocaleDateString();
    const body = (
        <React.Fragment>
            <div>{$t('client.operations.warning_delete')}</div>
            <div>{$t('client.operations.are_you_sure', { label, amount, date })}</div>
        </React.Fragment>
    );
    const footer = (
        <CancelAndDelete
            onClickDelete={props.handleClickDelete}
            onClickCancel={props.handleClickCancel}
        />
    );
    return (
        <ModalContent title={$t('client.confirmdeletemodal.title')} body={body} footer={footer} />
    );
});

registerModal(MODAL_SLUG_DELETE, <DeleteOperationModal />);
