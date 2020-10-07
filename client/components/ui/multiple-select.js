import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Select, { createFilter } from 'react-select';

import { get } from '../../store';
import { assert } from '../../helpers';

const REACT_SELECT_FILTER = createFilter({
    ignoreCase: true,
    ignoreAccents: true,
    trim: true,
    matchFrom: 'any',
    stringify: ({ label }) => label.toString(),
});

const MultipleSelect = connect(state => {
    let isSmallScreen = get.isSmallScreen(state);
    return {
        isSearchable: !isSmallScreen,
    };
})(props => {
    let handleChange = event => {
        let values = [];
        if (event instanceof Array) {
            values = event.map(e => e.value);
        } else {
            // No values are selected.
            assert(event === null);
        }

        const currentValues = props.values || [];
        if (
            values.length !== currentValues.length ||
            values.some(v => !currentValues.includes(v)) ||
            currentValues.some(v => !values.includes(v))
        ) {
            props.onChange(values);
        }
    };

    let { className, options, placeholder, required, values } = props;

    className += ' Select';
    if (required) {
        className += values ? ' valid-fuzzy' : ' invalid-fuzzy';
    }

    const currentValues =
        values instanceof Array ? options.filter(opt => values.includes(opt.value)) : [];

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
            isSearchable={props.isSearchable}
            isMulti={true}
        />
    );
});

MultipleSelect.propTypes = {
    // A string describing the classes to apply to the select.
    className: PropTypes.string.isRequired,

    // A function returning the text to display when no such options are found,
    // in fuzzy mode.
    noOptionsMessage: PropTypes.func,

    // A callback to be called when the user selects a new value.
    onChange: PropTypes.func.isRequired,

    // An array of options in the select.
    options: PropTypes.arrayOf(
        PropTypes.shape({
            label: PropTypes.string.isRequired,
            value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
        })
    ),

    // A text to display when nothing is selected.
    placeholder: PropTypes.string,

    // A boolean telling whether the field is required.
    required: PropTypes.bool.isRequired,

    // The value that's selected at start.
    values: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.number, PropTypes.string])),
};

MultipleSelect.defaultProps = {
    required: false,
    className: '',
};

export default MultipleSelect;
