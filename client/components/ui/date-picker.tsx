import React, { useCallback } from 'react';

import Flatpickr from './flatpickr';

import moment from 'moment';

import { get } from '../../store';

import DisplayIf from './display-if';

import { translate as $t, useKresusState } from '../../helpers';
import { LOCALE } from '../../../shared/settings';

const DatePickerWrapper = (props: {
    // Callback getting the new date, whenever it changes.
    onSelect: (date: Date | null) => void;

    // Initial date value.
    value?: Date | null;

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

    // Whether the date input can be cleared.
    clearable: boolean;
}) => {
    const locale = useKresusState(state => get.setting(state, LOCALE));

    const value = props.value || null;

    const { onSelect } = props;
    const handleChange = useCallback(
        (dateArray: Date[]) => {
            if (dateArray.length) {
                const newValue = dateArray[0];
                if (!value || value.getTime() !== newValue.getTime()) {
                    onSelect(newValue);
                }
            } else if (value !== null && props.clearable) {
                onSelect(null);
            }
        },
        [value, onSelect, props.clearable]
    );

    const handleClear = useCallback(() => {
        if (props.clearable) {
            handleChange([]);
        }
    }, [handleChange, props.clearable]);

    const placeholder =
        typeof props.placeholder !== 'undefined'
            ? props.placeholder
            : moment().format($t('client.datepicker.moment_format'));

    const maybeClassName = props.className ? props.className : '';

    const minDate = props.minDate || undefined;
    const maxDate = props.maxDate || undefined;

    const options = {
        dateFormat: $t('client.datepicker.flatpickr_format'),
        // Flatpickr predefines accepted locales; just ignore and say we ones
        // we feed are valid.
        locale: locale as any,
        allowInput: true,
        errorHandler: () => {
            // Do nothing when errors are thrown due to invalid input.
        },
        minDate,
        maxDate,
    };

    return (
        <div className={`input-with-addon ${maybeClassName}`}>
            <Flatpickr
                options={options}
                id={props.id}
                onChange={handleChange}
                value={value || undefined}
                placeholder={placeholder}
            />
            <DisplayIf condition={props.clearable}>
                <button
                    type="button"
                    className="btn"
                    onClick={handleClear}
                    title={$t('client.search.clear')}>
                    <span className="screen-reader-text">X</span>
                    <i className="fa fa-times" aria-hidden="true" />
                </button>
            </DisplayIf>
        </div>
    );
};

DatePickerWrapper.displayName = 'DatePickerWrapper';

export default DatePickerWrapper;
