import React, { useCallback, useContext, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';

import * as BanksStore from '../../store/banks';
import URL from '../../urls';
import {
    translate as $t,
    NONE_CATEGORY_ID,
    UNKNOWN_TRANSACTION_TYPE,
    displayLabel,
    notify,
    assert,
    useKresusState,
} from '../../helpers';

import CategorySelect from '../reports/category-select';
import TypeSelect from '../reports/type-select';

import AmountInput from '../ui/amount-input';
import DisplayIf from '../ui/display-if';
import ValidatedDatePicker from '../ui/validated-date-picker';
import ValidatedTextInput from '../ui/validated-text-input';
import { BackLink, Form } from '../ui';
import DiscoveryMessage from '../ui/discovery-message';
import { ViewContext } from '../drivers';
import { RedirectIfNotAccount } from '../../main';

const CreateTransaction = () => {
    const history = useHistory();
    const view = useContext(ViewContext);

    const account = view.account;
    assert(account !== null, 'account is set');

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [date, setDate] = useState<Date | undefined | null>(tomorrow);
    const [label, setLabel] = useState<string | null>(null);
    const [amount, setAmount] = useState<number | null>(null);
    const [categoryId, setCategoryId] = useState<number | undefined>(NONE_CATEGORY_ID);
    const [type, setType] = useState<string>(UNKNOWN_TRANSACTION_TYPE);

    const handleSetCategoryId = useCallback(
        (newVal: number | null) => {
            // Normalize null into undefined.
            setCategoryId(newVal === null ? undefined : newVal);
        },
        [setCategoryId]
    );

    const dispatch = useDispatch();
    const onSubmit = useCallback(async () => {
        assert(typeof date !== 'undefined' && date !== null, 'date is set');
        assert(label !== null, 'label is set');
        assert(amount !== null, 'amount is set');
        try {
            await dispatch(
                BanksStore.createTransaction({
                    date,
                    label,
                    amount,
                    categoryId,
                    type,
                    accountId: account.id,
                })
            );
            history.push(URL.reports.url(view.driver));
        } catch (err) {
            notify.error(err.message);
        }
    }, [view.driver, dispatch, history, date, label, amount, categoryId, type, account]);

    const accountLabel = displayLabel(account);
    const allowSubmit = date && label && label.trim().length && amount && !Number.isNaN(amount);
    const reportUrl = URL.reports.url(view.driver);

    const access = useKresusState(state => {
        return BanksStore.accessById(state.banks, account.accessId);
    });

    return (
        <Form center={true} onSubmit={onSubmit}>
            <BackLink to={reportUrl}>{$t('client.transactions.back_to_report')}</BackLink>

            <h3>
                {$t('client.addtransaction.add_transaction', {
                    account: accountLabel,
                })}
            </h3>

            <p>
                {$t('client.addtransaction.description', {
                    account: accountLabel,
                })}
            </p>

            <p className="alerts info">
                {$t('client.addtransaction.recurring_transaction')}
                {$t('client.general.colon_with_whitespace')}
                <a href={`#${URL.recurringTransactions.url(view.driver)}`}>
                    {$t('client.addtransaction.recurring_transaction_create')}
                </a>
                .
            </p>

            <DisplayIf condition={access.vendorId !== 'manual'}>
                <DiscoveryMessage level="warning" message={$t('client.addtransaction.warning')} />
            </DisplayIf>

            <Form.Input id="amount" label={$t('client.addtransaction.amount')}>
                <AmountInput
                    signId={`sign${account.id}`}
                    onChange={setAmount}
                    checkValidity={true}
                    className="block"
                    preferNegativePolarity={true}
                    autoFocus={true}
                />
            </Form.Input>

            <Form.Input id="label" label={$t('client.addtransaction.label')}>
                <ValidatedTextInput id={`label${account.id}`} onChange={setLabel} />
            </Form.Input>

            <Form.Input id="date" label={$t('client.addtransaction.date')}>
                <ValidatedDatePicker
                    onSelect={setDate}
                    value={date}
                    className="block"
                    clearable={true}
                />
            </Form.Input>

            <Form.Input id="category" label={$t('client.addtransaction.category')}>
                <CategorySelect onChange={handleSetCategoryId} value={categoryId} />
            </Form.Input>

            <Form.Input id="type" label={$t('client.addtransaction.type')}>
                <TypeSelect onChange={setType} value={type} />
            </Form.Input>

            <button className="btn success" type="submit" disabled={!allowSubmit}>
                {$t('client.addtransaction.submit')}
            </button>
        </Form>
    );
};

CreateTransaction.displayName = 'CreateTransaction';

export default () => {
    return (
        <RedirectIfNotAccount>
            <CreateTransaction />
        </RedirectIfNotAccount>
    );
};
