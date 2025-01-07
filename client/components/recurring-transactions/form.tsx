import React, { useCallback, useState, ReactElement } from 'react';
import moment from 'moment';

import { translate as $t, UNKNOWN_TRANSACTION_TYPE, noValueFoundMessage } from '../../helpers';

import { RecurringTransaction } from '../../models';

import { Form, ValidatedTextInput } from '../ui';
import AmountInput from '../ui/amount-input';
import Select from '../ui/fuzzy-or-native-select';
import MultipleSelect, { MultiSelectOptionProps } from '../ui/multiple-select';

import TypeSelect from '../reports/type-select';

type OrphanRecurringTransaction = Omit<RecurringTransaction, 'id' | 'accountId'>;

export default (props: {
    title: string;
    initialValues: Partial<RecurringTransaction>;
    backLink: ReactElement;
    onSubmit: (data: OrphanRecurringTransaction) => any;
    submitButtonLabel: string;
}) => {
    const initialValues = props.initialValues;
    const title = props.title;

    const daysList: MultiSelectOptionProps[] = [];
    for (let i = 1; i <= 31; ++i) {
        daysList.push({
            value: i,
            label: `${i}`,
        });
    }

    const monthsList: MultiSelectOptionProps[] = [];
    for (let i = 0; i < 12; ++i) {
        monthsList.push({
            // We use a 1-indexed list for the months.
            value: i + 1,
            label: moment.months(i),
        });
    }

    let predefinedListOfMonths: MultiSelectOptionProps[] = [];
    if (initialValues.listOfMonths) {
        if (initialValues.listOfMonths === 'all') {
            predefinedListOfMonths = monthsList;
        } else {
            // Typescript pre 5.4 does not understand the last filter, so we have to rely on using `as`.
            predefinedListOfMonths = initialValues.listOfMonths
                .split(';')
                .map(v => monthsList.find(m => m.value === parseInt(v, 10) - 1))
                .filter(m => typeof m !== 'undefined') as MultiSelectOptionProps[];
        }
    }

    const [label, setLabel] = useState(initialValues.label || '');
    const [type, setType] = useState(initialValues.type || UNKNOWN_TRANSACTION_TYPE);
    const [amount, setAmount] = useState(initialValues.amount || 0);
    const [dayOfMonth, setDayOfMonth] = useState(initialValues.dayOfMonth || 1);
    const [listOfMonths, setListOfMonths] = useState(predefinedListOfMonths);

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

    const onSubmitCallback = props.onSubmit;
    const onSubmit = useCallback(async () => {
        // Transform listOfMonths into string
        let monthsStr = 'all';
        if (listOfMonths.length < 12) {
            monthsStr = listOfMonths.map(m => m.value).join(';');
        }

        const recurringTr: OrphanRecurringTransaction = {
            type,
            label,
            amount,
            dayOfMonth,
            listOfMonths: monthsStr,
        };

        onSubmitCallback(recurringTr);
    }, [label, type, amount, dayOfMonth, listOfMonths, onSubmitCallback]);

    return (
        <Form center={true} onSubmit={onSubmit}>
            {props.backLink}

            <h3>{title}</h3>

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

            <input type="submit" className="btn success" value={props.submitButtonLabel} />
        </Form>
    );
};
