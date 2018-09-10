import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Select, { Creatable, createFilter } from 'react-select';

import { get } from '../../store';
import { assert } from '../../helpers.js';

const REACT_SELECT_FILTER = createFilter({
    ignoreCase: true,
    ignoreAccents: true,
    trim: true,
    matchFrom: 'any',
    stringify: ({ label }) => label.toString()
});

const FuzzyOrNativeSelect = connect(state => {
    return {
        useNativeSelect: get.isSmallScreen(state)
    };
})(
    class Export extends React.Component {
        handleChange = event => {
            let value;
            // Don't test against typeof X === 'undefined' here! The event is
            // a proxy which doesn't reflect typeof. It does reflect "in"
            // though, so use this instead.
            if (event && event.target && 'value' in event.target) {
                // That's the native select.
                value = event.target.value;
            } else if (event && 'value' in event) {
                // That's the default case of react-select, when a value is
                // selected.
                value = event.value;
            } else {
                // No values are selected.
                assert(event === null || (event instanceof Array && event.length === 0));
                value = null;
            }

            if (value !== this.props.value) {
                this.props.onChange(value);
            }
        };

        render() {
            let { className, options, placeholder, required, style, value } = this.props;

            if (this.props.useNativeSelect) {
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

                let nativeOptions = options.map(opt => {
                    return (
                        <option key={opt.value} value={opt.value}>
                            {opt.label}
                        </option>
                    );
                });

                return (
                    <select
                        onChange={this.handleChange}
                        value={value}
                        style={style}
                        className={className}
                        required={required}>
                        {emptyOption}
                        {nativeOptions}
                    </select>
                );
            }

            let FuzzySelect = this.props.creatable ? Creatable : Select;

            className += ' Select';
            if (required) {
                className += value ? ' valid-fuzzy' : ' invalid-fuzzy';
            }

            let defaultOption = options.find(opt => opt.value === value);

            return (
                <FuzzySelect
                    backspaceRemovesValue={this.props.backspaceRemovesValue}
                    className={className}
                    classNamePrefix="Select"
                    filterOption={REACT_SELECT_FILTER}
                    formatCreateLabel={this.props.formatCreateLabel}
                    isClearable={this.props.clearable}
                    noOptionsMessage={this.props.noOptionsMessage}
                    onChange={this.handleChange}
                    onCreateOption={this.props.onCreate}
                    options={options}
                    placeholder={placeholder}
                    value={defaultOption}
                />
            );
        }
    }
);

FuzzyOrNativeSelect.propTypes = {
    // Whether pressing Delete removes the current value if it's set.
    backspaceRemovesValue: PropTypes.bool,

    // A string describing the classes to apply to the select.
    className: PropTypes.string.isRequired,

    // A boolean telling whether the fuzzy-select should allow to clear the input.
    clearable: PropTypes.bool,

    // A boolean telling if the fuzzy-select should allow to create an option.
    creatable: PropTypes.bool,

    // A function returning the text to display when no such options are found,
    // in fuzzy mode.
    noOptionsMessage: PropTypes.func,

    // A callback to be called when the user selects a new value.
    onChange: PropTypes.func.isRequired,

    // A callback to be called when a new value is created, for a creatable, in
    // fuzzy mode.
    onCreate: PropTypes.func,

    // An array of options in the select.
    options: PropTypes.arrayOf(
        PropTypes.shape({ label: PropTypes.string.isRequired, value: PropTypes.string.isRequired })
    ),

    // A text to display when nothing is selected.
    placeholder: PropTypes.string,

    // A boolean telling whether the field is required.
    required: PropTypes.bool.isRequired,

    // The value that's selected at start.
    value: PropTypes.string.isRequired
};

FuzzyOrNativeSelect.defaultProps = {
    creatable: false,
    clearable: false,
    backspaceRemovesValue: true,
    required: false,
    className: ''
};

export default FuzzyOrNativeSelect;
