import React, { useCallback, useContext, useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { Link, Redirect, useHistory, useParams } from 'react-router-dom';

import rulesUrl from '../rules/urls';
import * as BanksStore from '../../store/banks';
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

import { BackLink, ButtonLink, Form, Popconfirm } from '../ui';
import Label from '../reports/label';
import TransactionTypeSelect from '../reports/editable-type-select';
import CategorySelect from '../reports/editable-category-select';
import DateComponent from './date';
import BudgetDateComponent from './budget-date';
import { DriverContext } from '../drivers';

const TransactionDetails = (props: { transactionId: number }) => {
    const { transactionId } = props;
    const driver = useContext(DriverContext);

    const backLink = useRef<HTMLSpanElement>(null);

    useEffect(() => {
        // The scroll might be kept from a previous screen, making the go back link out of sight
        // and hard to access on mobile where scrolling down often refreshes the page.
        if (backLink !== null && backLink.current !== null) {
            backLink.current.scrollIntoView(false);
        }
    });

    const transaction = useKresusState(state => {
        // Detect zombie child.
        return BanksStore.transactionExists(state.banks, transactionId)
            ? BanksStore.transactionById(state.banks, transactionId)
            : null;
    });

    const account = useKresusState(state => {
        return transaction !== null
            ? BanksStore.accountById(state.banks, transaction.accountId)
            : null;
    });

    const reportUrl = MainURLs.reports.url(driver);

    const history = useHistory();
    const dispatch = useDispatch();
    const deleteTransaction = useNotifyError(
        'client.transactions.deletion_error',
        useCallback(async () => {
            await dispatch(BanksStore.deleteTransaction(transactionId));
            notify.success($t('client.transactions.deletion_success'));
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
                <span ref={backLink}>
                    <BackLink to={reportUrl}>{$t('client.transactions.back_to_report')}</BackLink>
                </span>

                <h3>{$t('client.transactions.details')}</h3>

                <Form.Input id="raw-label" label={$t('client.transactions.full_label')}>
                    <span>{transaction.rawLabel}</span>
                </Form.Input>

                <Form.Input id="label" label={$t('client.transactions.custom_label')}>
                    <Label item={transaction} displayLabelIfNoCustom={false} forceEditMode={true} />
                </Form.Input>

                <Form.Input id="date" label={$t('client.transactions.date')}>
                    <DateComponent transaction={transaction} />
                </Form.Input>

                <Form.Input id="value" label={$t('client.transactions.amount')}>
                    <span>{account.formatCurrency(transaction.amount)}</span>
                </Form.Input>

                <Form.Input id="type" label={$t('client.transactions.type')}>
                    <TransactionTypeSelect
                        transactionId={transaction.id}
                        value={transaction.type}
                    />
                </Form.Input>

                <Form.Input
                    id="category"
                    label={$t('client.transactions.category')}
                    sub={
                        <ButtonLink
                            className="btn primary small"
                            to={rulesUrl.predefinedNew.url(
                                transaction.label,
                                transaction.amount,
                                transaction.categoryId
                            )}
                            aria={$t('client.transactions.create_categorization_rule')}
                            label={$t('client.transactions.create_categorization_rule')}
                            icon="magic"
                        />
                    }>
                    <CategorySelect transactionId={transaction.id} value={transaction.categoryId} />
                </Form.Input>

                <Form.Input
                    id="budget-date"
                    label={$t('client.transactions.budget')}
                    help={$t('client.transactions.budget_help')}>
                    <BudgetDateComponent transaction={transaction} />
                </Form.Input>
            </Form>
            <hr />
            <Form center={true}>
                <Form.Input
                    id="recurring-transaction-shortcut"
                    label={$t('client.recurring_transactions.new')}
                    help={`${$t('client.addtransaction.recurring_transaction')}.`}>
                    <ButtonLink
                        className="btn"
                        to={MainURLs.newRecurringTransaction.url(driver, {
                            label: transaction.rawLabel,
                            amount: transaction.amount,
                            day: transaction.date.getDate(),
                            type: transaction.type,
                        })}
                        aria={$t('client.transactions.create_recurring_transaction')}
                        label={$t('client.transactions.create_recurring_transaction')}
                        icon="calendar"
                    />
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
                                {$t('client.transactions.delete_transaction_button')}
                            </button>
                        }>
                        <p>
                            {$t('client.transactions.warning_delete')}{' '}
                            <Link to={MainURLs.duplicates.url(driver)}>
                                {$t('client.transactions.warning_delete_duplicates')}
                            </Link>
                            .
                        </p>
                        <p>{$t('client.transactions.warning_delete_local')}</p>
                        <p>
                            {$t('client.transactions.are_you_sure', {
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

export default () => {
    const driver = useContext(DriverContext);

    const { transactionId: strTransactionId } = useParams<{ transactionId: string }>();
    const transactionId = Number.parseInt(strTransactionId, 10);

    const exists = useKresusState(state =>
        BanksStore.transactionExists(state.banks, transactionId)
    );
    if (!exists) {
        return <Redirect to={MainURLs.reports.url(driver)} />;
    }

    return <TransactionDetails transactionId={transactionId} />;
};
