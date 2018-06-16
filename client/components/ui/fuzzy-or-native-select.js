import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Select, { Creatable } from 'react-select';
import { createSelector } from 'reselect';

import { get } from '../../store';

const makeNativeOptions = createSelector(
    (_, options) => options,
    options => {
        return options.map(opt => {
            return (
                <option key={opt.value} value={opt.value}>
                    {opt.label}
                </option>
            );
        });
    }
);

const FuzzyOrNativeSelect = connect((state, props) => {
    return {
        nativeOptions: makeNativeOptions(state, props.options),
        useNativeSelect: get.isSmallScreen(state)
    };
})(
    class Export extends React.Component {
        handleChange = event => {
            let value;
            if (event && event.target && event.target.value) {
                value = event.target.value;
            } else if (event && event.value) {
                value = event.value;
            } else {
                value = event;
            }

            if (value !== this.props.value) {
                this.props.onChange(value);
            }
        };

        render() {
            let {
                useNativeSelect,
                options,
                nativeOptions,
                creatable,
                value,
                className,
                style,
                ...otherProps
            } = this.props;
            delete otherProps.onChange;
            let FuzzySelect = creatable ? Creatable : Select;
            return useNativeSelect ? (
                <select
                    onChange={this.handleChange}
                    value={value}
                    style={style}
                    className={className}>
                    {nativeOptions}
                </select>
            ) : (
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
    clearable: false
};

export default FuzzyOrNativeSelect;
