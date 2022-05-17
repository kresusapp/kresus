import React, { useCallback } from 'react';

import Select, {
    createFilter,
    components,
    MenuProps,
    ValueContainerProps,
    OptionProps,
    OnChangeValue,
} from 'react-select';

import { translate as $t } from '../../helpers';

import './multiple-select.css';

const REACT_SELECT_FILTER = createFilter({
    ignoreCase: true,
    ignoreAccents: true,
    trim: true,
    matchFrom: 'any',
    stringify: ({ label }) => label.toString(),
});

// The type the value key of an option of the multiselect can be.
type MultiSelectOptionValue = string | number;

// A type to tell that the select is a multiselect.
type IsMulti = true;

// The type of a single multiselect's option.
interface MultiSelectOptionProps {
    label: string;
    value: MultiSelectOptionValue;
}

const Menu = (props: MenuProps<MultiSelectOptionProps, IsMulti>) => {
    const {
        className,
        cx,
        innerProps,
        innerRef,
        children,
        setValue,
        options: actualOptions,
    } = props;

    const options = actualOptions as MultiSelectOptionProps[]; // we're not using groups

    const selectedOptions = props.getValue() || [];
    const isAllSelected = options.every(o => selectedOptions.includes(o));

    const toggleAll = useCallback(() => {
        if (isAllSelected) {
            // Work around incorrect type declaration in react-select.
            setValue([], 'select-option', undefined as any as MultiSelectOptionProps);
        } else {
            setValue(options, 'select-option', undefined as any as MultiSelectOptionProps);
        }
    }, [setValue, options, isAllSelected]);

    return (
        <components.Menu {...props}>
            <>
                {/* wrap the children in a fragment as components.Menu expects a single child. */}
                <div
                    ref={innerRef}
                    className={cx(
                        {
                            menu: true,
                            'multiple-select-menu': true,
                        },
                        className
                    )}
                    {...innerProps}
                    onClick={toggleAll}
                    onTouchEnd={toggleAll}>
                    <input type="checkbox" checked={isAllSelected} readOnly={true} />
                    <label>{$t('client.general.select_all')}</label>
                </div>
                {children}
            </>
        </components.Menu>
    );
};

// Checks that the node is a components.Input or not.
const isInput = (node: React.ReactNode) =>
    React.isValidElement(node) && node.type === components.Input;

const ValueContainer = ({
    children,
    ...props
}: ValueContainerProps<MultiSelectOptionProps, IsMulti>) => {
    const { hasValue, selectProps } = props;
    const filter = (child: React.ReactNode) => (!hasValue || isInput(child) ? child : null);
    return (
        <components.ValueContainer {...props}>
            {React.Children.map(children, filter)}
            {hasValue && !selectProps.inputValue && selectProps.placeholder}
        </components.ValueContainer>
    );
};

const Option = (props: OptionProps<MultiSelectOptionProps, IsMulti>) => {
    const { cx, className } = props;
    return (
        <components.Option {...props}>
            <div
                className={cx(
                    {
                        option: true,
                        'multiple-select-menu': true,
                    },
                    className
                )}>
                <input type="checkbox" checked={props.isSelected} readOnly={true} />
                <label>{props.label}</label>
            </div>
        </components.Option>
    );
};

interface MultipleSelectProps {
    // A string describing the classes to apply to the select.
    className?: string;

    // A function returning the text to display when no such options are found,
    // in fuzzy mode.
    noOptionsMessage: () => string;

    // A callback to be called when the user selects a new value.
    onChange: (value: MultiSelectOptionValue[]) => void;

    // An array of options in the select.
    options?: MultiSelectOptionProps[];

    // A text to display when nothing is selected.
    placeholder?: string;

    // A boolean telling whether the field is required.
    required?: boolean;

    // The value that's selected at start.
    values?: MultiSelectOptionValue[];

    // An optional HTML id to link the select to a label.
    id?: string;
}

const customComponents = {
    ValueContainer,
    Option,
    Menu,
};

const MultipleSelect = (props: MultipleSelectProps) => {
    const {
        options,
        placeholder,
        required = false,
        values: parentValues = [],
        className: parentClassName = '',
        onChange,
    } = props;

    const handleChange = useCallback(
        (event: OnChangeValue<MultiSelectOptionProps, IsMulti>): void => {
            // Ensure we return an array of MultiSelectOptionValue.
            const values = event ? event.map(e => e.value) : [];

            if (
                values.length !== parentValues.length ||
                values.some(v => !parentValues.includes(v)) ||
                parentValues.some(v => !values.includes(v))
            ) {
                onChange(values);
            }
        },
        [onChange, parentValues]
    );

    let className = `${parentClassName} Select`;
    if (required) {
        className += parentValues.length ? ' valid-fuzzy' : ' invalid-fuzzy';
    }

    let currentValues: MultiSelectOptionProps[] = [];
    if (parentValues.length && options) {
        currentValues = options.filter(opt => parentValues.includes(opt.value));
    }

    return (
        <Select
            backspaceRemovesValue={true}
            className={className}
            classNamePrefix="Select"
            filterOption={REACT_SELECT_FILTER}
            isClearable={true}
            noOptionsMessage={props.noOptionsMessage}
            onChange={handleChange}
            options={options}
            placeholder={placeholder}
            value={currentValues}
            isMulti={true}
            hideSelectedOptions={false}
            closeMenuOnSelect={false}
            components={customComponents}
            inputId={props.id}
        />
    );
};

export default MultipleSelect;
