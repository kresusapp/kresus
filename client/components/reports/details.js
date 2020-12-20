import React from 'react';
import { connect } from 'react-redux';

import { formatDate, translate as $t, displayLabel } from '../../helpers';
import { get, actions } from '../../store';

import { Popconfirm } from '../ui';
import { registerModal } from '../ui/modal';
import ModalContent from '../ui/modal/content';

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
            formatCurrency: get.accountById(state, operation.accountId).formatCurrency,
        };
    },

    dispatch => {
        return {
            deleteOperation(operationId) {
                actions.deleteOperation(dispatch, operationId);
            },
        };
    },

    ({ ...state }, { deleteOperation }) => {
        return {
            handleDelete() {
                deleteOperation(state.operation.id);
            },
            ...state,
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
        <Popconfirm
            onConfirm={props.handleDelete}
            trigger={
                <button type="button" className="btn danger">
                    <span className="fa fa-trash" />
                    &nbsp;
                    {$t('client.operations.delete_operation_button')}
                </button>
            }>
            <p>{$t('client.operations.warning_delete')}</p>
            <p>
                {$t('client.operations.are_you_sure', {
                    label: displayLabel(props.operation),
                    amount: props.formatCurrency(props.operation.amount),
                    date: formatDate.toDayString(props.operation.date),
                })}
            </p>
        </Popconfirm>
    );

    return <ModalContent title={$t('client.operations.details')} body={body} footer={footer} />;
});

export const MODAL_SLUG = 'operation-details-modal';

registerModal(MODAL_SLUG, () => <DetailsModal />);
