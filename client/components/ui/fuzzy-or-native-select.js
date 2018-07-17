import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Select, { Creatable } from 'react-select';

import { get } from '../../store';
import { assert } from '../../helpers.js';

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
                value = event.target.value;
            } else if (event && 'value' in event) {
                value = event.value;
            } else {
                // Clearing the fuzzy selector will return null here.
                assert(event === null);
                value = null;
            }

            if (value !== this.props.value) {
                this.props.onChange(value);
            }
        };

        render() {
            let {
                useNativeSelect,
                options,
                creatable,
                value,
                className,
                style,
                ...otherProps
            } = this.props;

            delete otherProps.onChange;

            let FuzzySelect = creatable ? Creatable : Select;

            if (useNativeSelect) {
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
                        className={className}>
                        {nativeOptions}
                    </select>
                );
            }

            return (
                <FuzzySelect
                    {...otherProps}
                    value={value}
                    style={style}
                    onChange={this.handleChange}
                    options={options}
                    className={className}
                />
            );
        }
    }
);

FuzzyOrNativeSelect.propTypes = {
    // A boolean telling if the fuzzy-select should allow to create an option.
    creatable: PropTypes.bool,

    // A boolean telling whether the fuzzy-select should allow to clear the input.
    clearable: PropTypes.bool,

    // An array of options in the select.
    options: PropTypes.arrayOf(
        PropTypes.shape({ label: PropTypes.string.isRequired, value: PropTypes.string.isRequired })
    ),

    // A callback to be called when the user selects a new value.
    onChange: PropTypes.func.isRequired,

    // The value to be selected.
    value: PropTypes.string.isRequired
};

FuzzyOrNativeSelect.defaultProps = {
    creatable: false,
    clearable: false,
    backspaceRemoves: false,
    deleteRemoves: false
};

export default FuzzyOrNativeSelect;
