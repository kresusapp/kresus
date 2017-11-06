import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import { translate as $t } from '../../helpers';
import { get, actions } from '../../store';

import { registerModal } from '../ui/new-modal';
import LabelComponent from './label';
import OperationTypeSelect from './editable-type-select';
import CategorySelect from './editable-category-select';
import ModalContent from '../ui/modal-content';

const MODAL_SLUG = 'operation-details-modal';
const MODAL_SLUG_DELETE = 'confirm-delete-operation';

const Body = connect(state => {
    let operationId = get.modal(state).state;
    let operation = get.operationById(state, operationId);

    return {
        operationId,
        operation,
        formatCurrency: get.accountByNumber(state, operation.bankAccount).formatCurrency
    };
})(props => {
    let { operation } = props;

    return (
        <div>
            <div className="form-group clearfix">
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
        </div>
    );
});

const Footer = connect(
    state => {
        return {
            operationId: get.modal(state).state
        };
    },
    dispatch => ({
        dispatch
    }),
    ({ operationId }, { dispatch }) => {
        return {
            handleClickDelete() {
                actions.showModal(dispatch, MODAL_SLUG_DELETE, operationId);
            }
        };
    }
)(props => {
    return (
        <div>
            <div>
                <button type="button" onClick={props.handleClickDelete} className="btn btn-danger">
                    <span className="fa fa-trash" />&nbsp;
                    {$t('client.operations.delete_operation_button')}
                </button>
            </div>
        </div>
    );
});

registerModal(
    MODAL_SLUG,
    <ModalContent title={$t('client.operations.details')} body={<Body />} footer={<Footer />} />
);

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

const DeleteBody = connect(state => {
    let operationId = get.modal(state).state;
    let operation = get.operationById(state, operationId);

    return {
        operation,
        formatCurrency: get.accountByNumber(state, operation.bankAccount).formatCurrency
    };
})(props => {
    let { operation } = props;
    let label = `"${operation.customLabel ? operation.customLabel : operation.title}"`;
    let amount = props.formatCurrency(operation.amount);
    let date = operation.date.toLocaleDateString();
    return (
        <div>
            <div>{$t('client.operations.warning_delete')}</div>
            <div>{$t('client.operations.are_you_sure', { label, amount, date })}</div>
        </div>
    );
});

const DeleteFooter = connect(
    state => {
        return {
            operationId: get.modal(state).state
        };
    },
    dispatch => ({ dispatch }),
    ({ operationId }, { dispatch }) => {
        return {
            handleClickDelete() {
                actions.deleteOperation(dispatch, operationId);
            },
            handleClickCancel() {
                actions.showModal(dispatch, MODAL_SLUG, operationId);
            }
        };
    }
)(props => {
    return (
        <div>
            <button type="button" className="btn btn-default" onClick={props.handleClickCancel}>
                {$t('client.confirmdeletemodal.dont_delete')}
            </button>
            <button type="button" className="btn btn-danger" onClick={props.handleClickDelete}>
                {$t('client.confirmdeletemodal.confirm')}
            </button>
        </div>
    );
});
registerModal(
    MODAL_SLUG_DELETE,
    <ModalContent
        title={$t('client.confirmdeletemodal.title')}
        body={<DeleteBody />}
        footer={<DeleteFooter />}
    />
);
