import React, { useCallback } from 'react';
import Select, { createFilter } from 'react-select';
import Creatable from 'react-select/creatable';

import { useKresusState } from '../../store';
import * as UiStore from '../../store/ui';
import { assert, translate as $t } from '../../helpers';

const REACT_SELECT_FILTER = createFilter({
    ignoreCase: true,
    ignoreAccents: true,
    trim: true,
    matchFrom: 'any',
    stringify: ({ label }) => label.toString(),
});

type OptionsArray = { label: string; value: string | number }[];

export interface ComboboxProps {
    // Whether pressing Delete removes the current value if it's set.
    backspaceRemovesValue?: boolean;

    // A string describing the classes to apply to the select.
    className?: string;

    // A boolean telling whether the fuzzy-select should allow to clear the input.
    clearable?: boolean;

    // A function returning the text to display when no such options are found,
    // in fuzzy mode.
    noOptionsMessage?: () => string;

    // A callback to be called when the user selects a new value.
    onChange: (newValue: string | null) => void;

    // A callback to be called when a new value is created in fuzzy mode. If
    // absent, indicates that it's not possible to create new entries.
    onCreate?: (label: string) => void;

    // An array of options in the select.
    options: OptionsArray;

    // A text to display when nothing is selected.
    placeholder?: string;

    // A boolean telling whether the field is required.
    required?: boolean;

    // The value that's selected at start.
    value?: string | number;

    // An optional HTML id to link the select to a label, for example.
    id?: string;

    // Can we search in the select?
    isSearchable?: boolean;

    // How should the "create label" be displayed?
    formatCreateLabel?: (val: string) => string;
}

// To always display an helper to create a new option, anything that is typed or empty must be valid.
const alwaysValidNewOption = () => true;

const findOptionWithValue = (options: OptionsArray, value: string | number | null | undefined) => {
    return value !== null && typeof value !== 'undefined'
        ? options.find(opt => opt.value === value)
        : null;
};

const FuzzyOrNativeSelect = (props: ComboboxProps) => {
    const defaultOption = findOptionWithValue(props.options, props.value);

    const isSmallScreen = useKresusState(state => UiStore.isSmallScreen(state.ui));

    const useNativeSelect = isSmallScreen;
    const isSearchable = !isSmallScreen && (!!props.isSearchable || true);

    // Default values.
    const propsOnCreate = props.onCreate;
    const creatable = typeof propsOnCreate !== 'undefined';
    const clearable = !!props.clearable || false;
    const backspaceRemovesValue = !!props.backspaceRemovesValue || false;
    const required = !!props.required || false;
    let className = props.className || '';

    const { placeholder, value, options } = props;

    const { onChange: propsOnChange } = props;
    const handleChange = useCallback(
        (event: any) => {
            let newValue: string | null;
            // Don't test against typeof X === 'undefined' here! The event is
            // a proxy which doesn't reflect typeof. It does reflect "in"
            // though, so use this instead.
            if (event && event.target && 'value' in event.target) {
                // That's the native select.
                newValue = event.target.value;
            } else if (event && 'value' in event) {
                // That's the default case of react-select, when a value is
                // selected.
                newValue = `${event.value}`;
            } else {
                // No values are selected.
                assert(event === null, 'must have no events');
                newValue = null;
            }

            if (newValue !== value) {
                propsOnChange(newValue);
            }
        },
        [value, propsOnChange]
    );

    const customFormatCreateLabel = props.formatCreateLabel;
    const creationLabelFormatter = useCallback(
        (label: string) => {
            let displayedLabel = label;

            // If there is nothing typed yet to avoid confusion we display "(type something)"
            if (!displayedLabel) {
                displayedLabel = $t('client.general.create_select_empty');
            }

            if (customFormatCreateLabel) {
                return customFormatCreateLabel(displayedLabel);
            }

            return $t('client.general.create_select_option', {
                type: $t('client.general.default_select_option_type'),
                label: displayedLabel,
            });
        },
        [customFormatCreateLabel]
    );

    const handleCreate = useCallback(
        (inputValue: string) => {
            if (!creatable) {
                return;
            }

            const newValue = inputValue.trim();

            // Nothing was typed yet, do nothing.
            if (!newValue) {
                return;
            }

            // An option with the same value already exists, do nothing.
            if (options.some(opt => opt.value === newValue)) {
                return;
            }

            propsOnChange(newValue);

            if (propsOnCreate) {
                propsOnCreate(newValue);
            }
        },
        [creatable, options, propsOnChange, propsOnCreate]
    );

    if (useNativeSelect) {
        if (required) {
            className += ' check-validity';
        }

        let emptyOption = null;
        if (typeof placeholder === 'string' && placeholder.length > 0) {
            emptyOption = (
                <option key="placeholder" value="" disabled={true}>
                    {placeholder}
                </option>
            );
        }

        const nativeOptions = options.map(opt => {
            return (
                <option key={opt.value} value={opt.value}>
                    {opt.label}
                </option>
            );
        });

        return (
            <select
                id={props.id}
                onChange={handleChange}
                value={value}
                className={className}
                required={required}>
                {emptyOption}
                {nativeOptions}
            </select>
        );
    }

    className += ' Select';
    if (required) {
        className += value ? ' valid-fuzzy' : ' invalid-fuzzy';
    }

    if (creatable) {
        return (
            <Creatable
                backspaceRemovesValue={backspaceRemovesValue}
                className={className}
                classNamePrefix="Select"
                filterOption={REACT_SELECT_FILTER}
                formatCreateLabel={creationLabelFormatter}
                isValidNewOption={alwaysValidNewOption}
                createOptionPosition={'last'}
                isClearable={clearable}
                noOptionsMessage={props.noOptionsMessage}
                onChange={handleChange}
                onCreateOption={handleCreate}
                options={options}
                placeholder={placeholder}
                value={defaultOption}
                isSearchable={isSearchable}
                menuPlacement="auto"
                inputId={props.id}
            />
        );
    }

    return (
        <Select
            backspaceRemovesValue={backspaceRemovesValue}
            className={className}
            classNamePrefix="Select"
            filterOption={REACT_SELECT_FILTER}
            isClearable={clearable}
            noOptionsMessage={props.noOptionsMessage}
            onChange={handleChange}
            options={options}
            placeholder={placeholder}
            value={defaultOption}
            isSearchable={isSearchable}
            menuPlacement="auto"
            inputId={props.id}
        />
    );
};

FuzzyOrNativeSelect.displayName = 'FuzzyOrNativeSelect';

export default FuzzyOrNativeSelect;
