import React, { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { useHistory, useParams } from 'react-router-dom';

import { actions, get } from '../../store';
import {
    assertNotNull,
    displayLabel,
    formatDate,
    notify,
    translate as $t,
    useKresusState,
} from '../../helpers';
import MainURLs from '../../urls';
import { useNotifyError } from '../../hooks';

import { BackLink, Form, Popconfirm } from '../ui';
import Label from '../reports/label';
import OperationTypeSelect from '../reports/editable-type-select';
import CategorySelect from '../reports/editable-category-select';
import BudgetDateComponent from './budget-date';

const TransactionDetails = () => {
    const { transactionId: strTransactionId } = useParams<{ transactionId: string }>();

    const transactionId = Number.parseInt(strTransactionId, 10);

    const transaction = useKresusState(
        useCallback(
            state => {
                return get.transactionExists(state, transactionId)
                    ? get.operationById(state, transactionId)
                    : null;
            },
            [transactionId]
        )
    );

    const accountId = transaction !== null ? transaction.accountId : '';
    const account = useKresusState(
        useCallback(
            state => {
                return transaction !== null ? get.accountById(state, transaction.accountId) : null;
            },
            [transaction]
        )
    );

    const reportUrl = MainURLs.reports.url(accountId);

    const history = useHistory();
    const dispatch = useDispatch();
    const deleteTransaction = useNotifyError(
        'client.operations.deletion_error',
        useCallback(async () => {
            await actions.deleteOperation(dispatch, transactionId);
            notify.success($t('client.operations.deletion_success'));
            history.replace(reportUrl);
        }, [history, dispatch, transactionId, reportUrl])
    );

    if (transaction === null) {
        return null;
    }

    assertNotNull(account);

    return (
        <>
            <Form center={true}>
                <Form.Toolbar>
                    <BackLink to={reportUrl}>{$t('client.operations.back_to_report')}</BackLink>
                </Form.Toolbar>

                <h3>{$t('client.operations.details')}</h3>

                <Form.Input id="raw-label" label={$t('client.operations.full_label')}>
                    <span>{transaction.rawLabel}</span>
                </Form.Input>

                <Form.Input id="label" label={$t('client.operations.custom_label')}>
                    <Label item={transaction} displayLabelIfNoCustom={false} forceEditMode={true} />
                </Form.Input>

                <Form.Input id="date" label={$t('client.operations.date')}>
                    <span>{formatDate.toDayString(transaction.date)}</span>
                </Form.Input>

                <Form.Input id="value" label={$t('client.operations.amount')}>
                    <span>{account.formatCurrency(transaction.amount)}</span>
                </Form.Input>

                <Form.Input id="type" label={$t('client.operations.type')}>
                    <OperationTypeSelect operationId={transaction.id} value={transaction.type} />
                </Form.Input>

                <Form.Input id="category" label={$t('client.operations.category')}>
                    <CategorySelect operationId={transaction.id} value={transaction.categoryId} />
                </Form.Input>

                <Form.Input
                    id="budget-date"
                    label={$t('client.operations.budget')}
                    help={$t('client.operations.budget-help')}>
                    <BudgetDateComponent operation={transaction} />
                </Form.Input>
            </Form>
            <hr />
            <Form center={true}>
                <h3>{$t('client.editaccess.danger_zone_title')}</h3>
                <Form.Toolbar>
                    <Popconfirm
                        onConfirm={deleteTransaction}
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
                                label: displayLabel(transaction),
                                amount: account.formatCurrency(transaction.amount),
                                date: formatDate.toDayString(transaction.date),
                            })}
                        </p>
                    </Popconfirm>
                </Form.Toolbar>
            </Form>
        </>
    );
};

TransactionDetails.displayName = 'TransactionDetails';

export default TransactionDetails;
