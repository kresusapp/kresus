import React, { useCallback, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';

import {
    notify,
    translate as $t,
    UNKNOWN_TRANSACTION_TYPE,
    noValueFoundMessage,
} from '../../helpers';

import URL from './urls';

import { Form, ValidatedTextInput, BackLink } from '../ui';
import AmountInput from '../ui/amount-input';
import Select from '../ui/fuzzy-or-native-select';
import MultipleSelect from '../ui/multiple-select';

import TypeSelect from '../reports/type-select';

import moment from 'moment';
import { createRecurringTransaction } from '../../store/backend';

export default () => {
    const {
        accountId: accountIdStr,
        label: rawPredefinedLabel,
        amount: rawPredefinedAmount,
        day: rawPredefinedDay,
        type: predefinedType,
    } = useParams<{
        accountId: string;
        label?: string;
        amount?: string;
        day?: string;
        type?: string;
    }>();

    let predefinedLabel = rawPredefinedLabel;
    if (predefinedLabel) {
        predefinedLabel = window.decodeURIComponent(predefinedLabel);
    }

    let predefinedAmount = 0;
    if (rawPredefinedAmount) {
        predefinedAmount = Number.parseFloat(rawPredefinedAmount);
        if (isNaN(predefinedAmount)) {
            predefinedAmount = 0;
        }
    }

    let predefinedDay = 1;
    if (rawPredefinedDay) {
        predefinedDay = Number.parseInt(rawPredefinedDay, 10);
        if (Number.isNaN(predefinedDay) || predefinedDay < 1 || predefinedDay > 31) {
            predefinedDay = 1;
        }
    }

    const accountId = Number.parseInt(accountIdStr, 10);

    const listUrl = URL.listAccountRecurringTransactions(accountId);

    const daysList = [];
    for (let i = 1; i <= 31; ++i) {
        daysList.push({
            value: i,
            label: `${i}`,
        });
    }

    const monthsList = [];
    for (let i = 0; i < 12; ++i) {
        monthsList.push({
            // We use a 1-indexed list for the months.
            value: i + 1,
            label: moment.months(i),
        });
    }

    const [label, setLabel] = useState(predefinedLabel || '');
    const [type, setType] = useState(predefinedType || UNKNOWN_TRANSACTION_TYPE);
    const [amount, setAmount] = useState(predefinedAmount);
    const [dayOfMonth, setDayOfMonth] = useState(predefinedDay);
    const [listOfMonths, setListOfMonths] = useState(monthsList);

    const history = useHistory();

    const handleLabelChange = useCallback(
        (newValue: string | null) => {
            if (typeof newValue === 'string') {
                setLabel(newValue);
            }
        },
        [setLabel]
    );

    const handleAmountChange = useCallback(
        (newValue: number | null) => {
            if (typeof newValue === 'number') {
                setAmount(newValue);
            }
        },
        [setAmount]
    );

    const handleDayOfMonthChange = useCallback(
        (newValue: string | null) => {
            const numVal = parseInt(newValue || '', 10);
            if (!isNaN(numVal)) {
                setDayOfMonth(numVal);
            }
        },
        [setDayOfMonth]
    );

    const handleListOfMonthsChange = useCallback(
        (newValue: Array<string | number>) => {
            setListOfMonths(newValue.map(v => ({ value: v as number, label: '' })));
        },
        [setListOfMonths]
    );

    const onSubmit = useCallback(async () => {
        // Transform listOfMonths into string
        let monthsStr = 'all';
        if (listOfMonths.length < 12) {
            monthsStr = listOfMonths.map(m => m.value).join(';');
        }

        try {
            await createRecurringTransaction(accountId, {
                type,
                label,
                amount,
                dayOfMonth,
                listOfMonths: monthsStr,
            });
        } catch (err: any) {
            notify.error($t('client.general.unexpected_error', { error: err.message }));
            return;
        }

        notify.success($t('client.recurring_transactions.creation_success'));
        history.push(listUrl);
    }, [accountId, history, listUrl, label, type, amount, dayOfMonth, listOfMonths]);

    return (
        <Form center={true} onSubmit={onSubmit}>
            <BackLink to={listUrl}>{$t('client.recurring_transactions.list')}</BackLink>

            <h3>{$t('client.recurring_transactions.new')}</h3>

            <Form.Input id="recurring-transaction-label" label={$t('client.addtransaction.label')}>
                <ValidatedTextInput
                    onChange={handleLabelChange}
                    initialValue={label}
                    required={true}
                />
            </Form.Input>

            <Form.Input id="recurring-transaction-type" label={$t('client.addtransaction.type')}>
                <TypeSelect onChange={setType} value={type} />
            </Form.Input>

            <Form.Input
                id="recurring-transaction-amount"
                label={$t('client.addtransaction.amount')}>
                <AmountInput
                    signId="recurring-transaction-amount-sign"
                    onInput={handleAmountChange}
                    defaultValue={amount}
                    checkValidity={true}
                    className="block"
                />
            </Form.Input>

            <Form.Input
                id="recurring-transaction-dayofmonth"
                label={$t('client.recurring_transactions.day')}>
                <Select
                    onChange={handleDayOfMonthChange}
                    value={dayOfMonth}
                    options={daysList}
                    required={true}
                />
            </Form.Input>

            <Form.Input
                id="recurring-transaction-listofmonths"
                label={$t('client.recurring_transactions.every')}>
                <MultipleSelect
                    onChange={handleListOfMonthsChange}
                    values={listOfMonths.map(v => v.value)}
                    options={monthsList}
                    required={true}
                    noOptionsMessage={noValueFoundMessage}
                />
            </Form.Input>

            <input type="submit" className="btn success" value={$t('client.general.save')} />
        </Form>
    );
};
