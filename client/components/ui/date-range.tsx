import React, { useCallback } from 'react';

import Flatpickr from 'react-flatpickr';
import 'flatpickr/dist/themes/light.css';

import moment from 'moment';

import { get } from '../../store';

import { endOfMonth, startOfMonth, translate as $t, useKresusState } from '../../helpers';
import { LOCALE } from '../../../shared/settings';
import './date-range.css';

const DateRange = (props: {
    // Callback getting the new date, whenever it changes.
    onSelect: (dates: [Date, Date?] | null) => void;

    // Initial date values.
    value?: [Date] | [Date, Date];

    // Minimum date that is allowed to select.
    minDate?: Date;

    // Maximum date that is allowed to select.
    maxDate?: Date;

    // An id to link the input to a label for instance.
    id?: string;

    // Placeholder for the content.
    placeholder?: string;

    // Extra class names to pass to the input.
    className?: string;
}) => {
    const locale = useKresusState(state => get.setting(state, LOCALE));

    const value: Date[] | null = props.value || null;

    const { onSelect } = props;
    const onChange = useCallback(
        (dateArray: Date[] | null) => {
            if (dateArray && dateArray.length > 0) {
                if (!value || (dateArray[0] !== value[0] && dateArray[1] !== value[1])) {
                    onSelect([dateArray[0], dateArray[1]]);
                }
            } else if (value !== null) {
                onSelect(null);
            }
        },
        [value, onSelect]
    );

    const onClear = useCallback(() => {
        onChange(null);
    }, [onChange]);

    const placeholder =
        typeof props.placeholder !== 'undefined'
            ? props.placeholder
            : moment().format($t('client.datepicker.moment_format'));

    const maybeClassName = props.className ? props.className : '';

    const minDate = props.minDate || undefined;
    const maxDate = props.maxDate || undefined;

    const options: { mode: 'range'; [key: string]: any } = {
        dateFormat: $t('client.datepicker.flatpickr_format'),
        // Flatpicker predefines accepted locales; just ignore and say we ones
        // we feed are valid.
        locale: locale as any,
        allowInput: true,
        errorHandler: () => {
            // Do nothing when errors are thrown due to invalid input.
        },
        minDate,
        maxDate,
        mode: 'range',
    };

    return (
        <>
            <div className={`input-with-addon ${maybeClassName}`}>
                <Flatpickr
                    options={options}
                    id={props.id}
                    onChange={onChange}
                    value={value || undefined}
                    placeholder={placeholder}
                />
                <button
                    type="button"
                    className="btn"
                    onClick={onClear}
                    title={$t('client.search.clear')}>
                    <span className="screen-reader-text">X</span>
                    <i className="fa fa-times" aria-hidden="true" />
                </button>
            </div>
        </>
    );
};

DateRange.displayName = 'DateRange';

interface PredefinedDateRangesProps {
    // Function called whenever a predefined range is selected.
    onChange: (dates: [Date, Date]) => void;

    // Should current week/last week be included?
    includeWeeks?: boolean;

    // Should current month/last month/last N months be included?
    includeMonths?: boolean;

    // Should current year/last year be included?
    includeYears?: boolean;
}

const PredefinedDateRanges = (props: PredefinedDateRangesProps) => {
    const { onChange } = props;

    const selectThisMonth = useCallback(() => {
        onChange([startOfMonth(new Date()), endOfMonth(new Date())]);
    }, [onChange]);

    const selectPreviousMonth = useCallback(() => {
        const date = moment().subtract(1, 'month').toDate();
        onChange([startOfMonth(date), endOfMonth(date)]);
    }, [onChange]);

    const selectLastThreeMonths = useCallback(() => {
        // Note the voluntary off-by-one: last three months = this month plus
        // the two previous ones.
        const date = moment().subtract(2, 'month').toDate();
        onChange([startOfMonth(date), endOfMonth(new Date())]);
    }, [onChange]);

    const selectLastSixMonths = useCallback(() => {
        const date = moment().subtract(5, 'month').toDate();
        onChange([startOfMonth(date), endOfMonth(new Date())]);
    }, [onChange]);

    const selectCurrentWeek = useCallback(() => {
        const from = moment().startOf('week').toDate();
        const to = moment().endOf('week').toDate();
        onChange([from, to]);
    }, [onChange]);

    const selectLastWeek = useCallback(() => {
        const from = moment().subtract(1, 'week').startOf('week').toDate();
        const to = moment().subtract(1, 'week').endOf('week').toDate();
        onChange([from, to]);
    }, [onChange]);

    const selectCurrentYear = useCallback(() => {
        const from = moment().startOf('year').toDate();
        const to = moment().endOf('year').toDate();
        onChange([from, to]);
    }, [onChange]);

    const selectLastYear = useCallback(() => {
        const from = moment().subtract(1, 'year').startOf('year').toDate();
        const to = moment().subtract(1, 'year').endOf('year').toDate();
        onChange([from, to]);
    }, [onChange]);

    const weekButtons = props.includeWeeks ? (
        <>
            <button type="button" className="btn small" onClick={selectCurrentWeek}>
                {$t('client.charts.current_week')}
            </button>
            <button type="button" className="btn small" onClick={selectLastWeek}>
                {$t('client.charts.last_week')}
            </button>
        </>
    ) : null;

    const monthButtons = props.includeMonths ? (
        <>
            <button type="button" className="btn small" onClick={selectThisMonth}>
                {$t('client.charts.current_month')}
            </button>
            <button type="button" className="btn small" onClick={selectPreviousMonth}>
                {$t('client.charts.last_month')}
            </button>
            <button type="button" className="btn small" onClick={selectLastThreeMonths}>
                {$t('client.charts.three_months')}
            </button>
            <button type="button" className="btn small" onClick={selectLastSixMonths}>
                {$t('client.charts.six_months')}
            </button>
        </>
    ) : null;

    const yearButtons = props.includeYears ? (
        <>
            <button type="button" className="btn small" onClick={selectCurrentYear}>
                {$t('client.charts.current_year')}
            </button>
            <button type="button" className="btn small" onClick={selectLastYear}>
                {$t('client.charts.last_year')}
            </button>
        </>
    ) : null;

    return (
        <div className="predefined-date-ranges">
            {weekButtons}
            {monthButtons}
            {yearButtons}
        </div>
    );
};

PredefinedDateRanges.displayName = 'PredefinedDateRanges';

export { DateRange, PredefinedDateRanges };
