import { useCallback, useRef } from 'react';

import Flatpickr, { type DateTimePickerHandle } from './flatpickr';

import moment from 'moment';

import { useKresusState } from '../../store';
import * as SettingsStore from '../../store/settings';

import DisplayIf from './display-if';

import { translate as $t } from '../../helpers';
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
    const locale = useKresusState(state => SettingsStore.get(state.settings, LOCALE));

    const value = props.value || null;

    const fp = useRef<DateTimePickerHandle>(null);

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
            fp.current?.flatpickr?.clear();
        }
    }, [props.clearable]);

    const placeholder =
        typeof props.placeholder !== 'undefined'
            ? props.placeholder
            : moment().format($t('client.datepicker.moment_format'));

    const maybeClassName = props.className ? props.className : '';

    const minDate = props.minDate || undefined;
    const maxDate = props.maxDate || undefined;

    const { id } = props;

    // Use a custom uncontrolled input to allow manual typing input.
    // See https://github.com/haoxins/react-flatpickr#flatpickr-instance
    const customInput = useCallback(
        (renderProps: { defaultValue?: string }, ref: (node: HTMLInputElement | null) => void) => (
            <input
                id={id}
                ref={ref}
                type="text"
                defaultValue={renderProps.defaultValue}
                placeholder={placeholder}
            />
        ),
        [id, placeholder]
    );

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
                ref={fp}
                options={options}
                onChange={handleChange}
                value={value || undefined}
                render={customInput}
            />
            <DisplayIf condition={props.clearable}>
                <button
                    type="button"
                    className="btn"
                    onClick={handleClear}
                    title={$t('client.search.clear')}
                >
                    <span className="screen-reader-text">X</span>
                    <i className="fa fa-times" aria-hidden="true" />
                </button>
            </DisplayIf>
        </div>
    );
};

DatePickerWrapper.displayName = 'DatePickerWrapper';

export default DatePickerWrapper;
