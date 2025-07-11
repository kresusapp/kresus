import React, { useCallback, useContext, useState } from 'react';
import { useHistory } from 'react-router-dom';

import { useKresusDispatch, useKresusState } from '../../store';
import * as BanksStore from '../../store/banks';
import URL from '../../urls';
import {
    translate as $t,
    NONE_CATEGORY_ID,
    UNKNOWN_TRANSACTION_TYPE,
    notify,
    assert,
} from '../../helpers';

import CategorySelect from '../reports/category-select';
import TypeSelect from '../reports/type-select';

import AccountSelect from '../ui/account-select';
import AmountInput from '../ui/amount-input';
import DisplayIf from '../ui/display-if';
import ValidatedDatePicker from '../ui/validated-date-picker';
import ValidatedTextInput from '../ui/validated-text-input';
import { BackLink, Form } from '../ui';
import DiscoveryMessage from '../ui/discovery-message';
import { DriverContext } from '../drivers';

const CreateTransaction = () => {
    const history = useHistory();
    const driver = useContext(DriverContext);

    const accounts = useKresusState(state => driver.getAccounts(state));
    const accountsIdsToExcludeFromSelector = useKresusState(state => {
        const allAccountsIds = Object.values(BanksStore.getAccountMap(state.banks)).map(
            acc => acc.id
        );
        const validAccountsIds = accounts.map(acc => acc.id);
        return allAccountsIds.filter(accountId => !validAccountsIds.includes(accountId));
    });

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [date, setDate] = useState<Date | undefined | null>(tomorrow);
    const [label, setLabel] = useState<string | null>(null);
    const [amount, setAmount] = useState<number | null>(null);
    const [categoryId, setCategoryId] = useState<number | undefined>(NONE_CATEGORY_ID);
    const [type, setType] = useState<string>(UNKNOWN_TRANSACTION_TYPE);
    const [accountId, setAccountId] = useState<number>(accounts[0].id);

    const handleSetCategoryId = useCallback(
        (newVal: number | null) => {
            // Normalize null into undefined.
            setCategoryId(newVal === null ? undefined : newVal);
        },
        [setCategoryId]
    );

    const dispatch = useKresusDispatch();
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
                    accountId,
                })
            ).unwrap();
            history.push(URL.reports.url(driver));
        } catch (err) {
            notify.error(err.message);
        }
    }, [driver, dispatch, history, date, label, amount, categoryId, type, accountId]);

    const allowSubmit = date && label && label.trim().length && amount && !Number.isNaN(amount);
    const reportUrl = URL.reports.url(driver);

    const displayWarning = useKresusState(state => {
        for (const account of accounts) {
            const access = BanksStore.accessById(state.banks, account.accessId);
            if (access.vendorId !== 'manual') {
                return true;
            }
        }

        return false;
    });

    return (
        <Form center={true} onSubmit={onSubmit}>
            <BackLink to={reportUrl}>{$t('client.transactions.back_to_report')}</BackLink>

            <h3>{$t('client.addtransaction.add_transaction')}</h3>

            <p>{$t('client.addtransaction.description')}</p>

            <p className="alerts info">
                {$t('client.addtransaction.recurring_transaction')}
                {$t('client.general.colon_with_whitespace')}
                <a href={`#${URL.accountRecurringTransactions.url(accountId)}`}>
                    {$t('client.addtransaction.recurring_transaction_create')}
                </a>
                .
            </p>

            <DisplayIf condition={displayWarning}>
                <DiscoveryMessage level="warning" message={$t('client.addtransaction.warning')} />
            </DisplayIf>

            <Form.Input id="amount" label={$t('client.addtransaction.amount')}>
                <AmountInput
                    signId={`sign${accountId}`}
                    onChange={setAmount}
                    checkValidity={true}
                    className="block"
                    preferNegativePolarity={true}
                    autoFocus={true}
                />
            </Form.Input>

            <DisplayIf condition={accounts.length > 1}>
                <Form.Input id="account" label={$t('client.addtransaction.account')}>
                    <AccountSelect
                        onChange={setAccountId}
                        exclude={accountsIdsToExcludeFromSelector}
                    />
                </Form.Input>
            </DisplayIf>

            <Form.Input id="label" label={$t('client.addtransaction.label')}>
                <ValidatedTextInput id={`label${accountId}`} onChange={setLabel} />
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

export default CreateTransaction;
