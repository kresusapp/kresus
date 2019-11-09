import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Select, { createFilter } from 'react-select';
import Creatable from 'react-select/creatable';

import { get } from '../../store';
import { assert } from '../../helpers';

const REACT_SELECT_FILTER = createFilter({
    ignoreCase: true,
    ignoreAccents: true,
    trim: true,
    matchFrom: 'any',
    stringify: ({ label }) => label.toString()
});

const FuzzyOrNativeSelect = connect((state, props) => {
    let isSmallScreen = get.isSmallScreen(state);
    return {
        useNativeSelect: isSmallScreen && !props.isMulti,
        isSearchable: !isSmallScreen && props.isSearchable
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
            } else if (event instanceof Array && this.props.isMulti) {
                // react-select with multiple values.
                value = event.map(e => e.value);
            } else {
                // No values are selected.
                assert(event === null || (event instanceof Array && event.length === 0));
                value = null;
            }

            let hasChanged = false;
            if (this.props.isMulti) {
                hasChanged =
                    (value === null && this.props.value.length > 0) ||
                    value.length !== this.props.value.length ||
                    !value.every(v => this.props.value.includes(v));
            } else {
                hasChanged = value !== this.props.value;
            }

            if (hasChanged) {
                this.props.onChange(value);
            }
        };

        render() {
            let { className, options, placeholder, required, value } = this.props;

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

            let defaultOption;
            if (this.props.isMulti) {
                defaultOption = options.filter(opt => value.includes(opt.value));
            } else {
                defaultOption = options.find(opt => opt.value === value);
            }

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
                    isMulti={this.props.isMulti}
                    isSearchable={this.props.isSearchable}
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
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.arrayOf(PropTypes.string)]).isRequired,

    // A boolean telling whether the select allows several values.
    isMulti: PropTypes.bool.isRequired
};

FuzzyOrNativeSelect.defaultProps = {
    creatable: false,
    clearable: false,
    backspaceRemovesValue: true,
    required: false,
    className: '',
    isMulti: false,
    isSearchable: true
};

export default FuzzyOrNativeSelect;
