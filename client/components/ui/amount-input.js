import React from 'react';
import PropTypes from 'prop-types';

import { translate as $t, maybeHas as has } from '../../helpers';
import DisplayIf from './display-if';

function extractValueFromText(realValue, isCurrentlyNegative, allowToggleSign) {
    let valueWithPeriod = realValue ? realValue.trim().replace(',', '.') : '';

    // Keep only the first period
    valueWithPeriod = valueWithPeriod
        .split('.')
        .splice(0, 2)
        .join('.');

    // Get the period and the zeroes at the end of the input.
    // When the user types "10.05" char by char, when the value is "10.0", it
    // will be transformed to 10, so we must remember what is after the decimal
    // separator so that the user can add "5" at the end to type "10.05".
    let match = valueWithPeriod.match(/\.\d*0*$/);
    let afterPeriod = match ? match[0] : '';

    let value = Number.parseFloat(valueWithPeriod);

    let isNegative = isCurrentlyNegative;
    if (typeof realValue === 'string' && allowToggleSign) {
        if (realValue[0] === '+') {
            isNegative = false;
        } else if (realValue[0] === '-') {
            isNegative = true;
        }
    }

    if (!Number.isNaN(value) && Number.isFinite(value) && 1 / value !== -Infinity) {
        // Change the sign only in case the user set a negative value in the input
        if (allowToggleSign && Math.sign(value) === -1) {
            isNegative = true;
        }
        value = Math.abs(value);
    } else {
        value = NaN;
    }

    return {
        isNegative,
        value,
        afterPeriod
    };
}

export const testing = {
    extractValueFromText
};

class AmountInput extends React.Component {
    state = {
        isNegative: this.props.initiallyNegative,
        value: Number.parseFloat(this.props.defaultValue),
        afterPeriod: ''
    };

    getValue() {
        let { value } = this.state;
        return this.state.isNegative ? -value : value;
    }

    // Calls the parent listeners on onChange events.
    onChange = () => {
        if (typeof this.props.onChange === 'function') {
            this.props.onChange(this.getValue());
        }
    };

    // Calls the parent listeners on onBlur/onKey=Enter events.
    onInput = () => {
        if (typeof this.props.onInput === 'function') {
            this.props.onInput(this.getValue());
        }
    };

    // Handles onKey=enter. Note that onInput() will be called by the resulting
    // onBlur event.
    handleKeyUp = e => {
        if (e.key === 'Enter') {
            e.target.blur();
        }
    };

    handleInput = () => {
        this.onInput();
    };

    handleChange = e => {
        let { isNegative, value, afterPeriod } = extractValueFromText(
            e.target.value,
            this.state.isNegative,
            this.props.togglable
        );
        this.setState(
            {
                isNegative,
                value,
                afterPeriod
            },
            this.onChange
        );
    };

    handleChangeSign = () => {
        this.onChange();
        this.onInput();
    };

    handleClick = () => {
        if (this.props.togglable) {
            this.setState({ isNegative: !this.state.isNegative }, this.handleChangeSign);
        }
    };

    clear() {
        this.setState({
            value: NaN,
            isNegative: this.props.initiallyNegative,
            afterPeriod: ''
        });
    }

    reset() {
        this.setState({
            value: Number.parseFloat(this.props.defaultValue),
            isNegative: this.props.initiallyNegative,
            afterPeriod: ''
        });
    }

    render() {
        let maybeTitle, clickableClass;
        let togglable = this.props.togglable;
        if (togglable) {
            maybeTitle = $t('client.ui.toggle_sign');
            clickableClass = 'clickable';
        } else {
            clickableClass = 'not-clickable';
        }

        let value = Number.isNaN(this.state.value) ? '' : this.state.value;

        // Add the period and what is after, if it exists.
        if (this.state.afterPeriod) {
            if (typeof value === 'number') {
                value = ~~value;
            }
            value += this.state.afterPeriod;
        }

        let signLabel = this.state.isNegative ? 'minus' : 'plus';
        let signClass = this.state.isNegative ? 'fa-minus' : 'fa-plus';

        let maybeClassName = this.props.className ? this.props.className : '';
        let maybeInputClassName = this.props.checkValidity ? 'check-validity' : '';

        return (
            <div className={`input-with-addon ${maybeClassName}`}>
                <button
                    type="button"
                    className={`btn ${clickableClass}`}
                    onClick={this.handleClick}
                    id={this.props.signId}
                    title={maybeTitle}>
                    <span className="screen-reader-text">{$t(`client.general.${signLabel}`)}</span>
                    <i className={`fa ${signClass}`} aria-hidden="true" />
                </button>

                <input
                    type="text"
                    className={maybeInputClassName}
                    onChange={this.handleChange}
                    aria-describedby={this.props.signId}
                    value={value}
                    onBlur={this.handleInput}
                    onKeyUp={this.handleKeyUp}
                    id={this.props.id}
                    required={this.props.checkValidity}
                />

                <DisplayIf condition={!!this.props.currencySymbol}>
                    <span>{this.props.currencySymbol}</span>
                </DisplayIf>
            </div>
        );
    }
}

AmountInput.propTypes = {
    // Input id
    id: PropTypes.string,

    // Function to handle change in the input
    onChange: PropTypes.func,

    // Function to handle the validation of the input by the user: on blur, on
    // hitting 'Enter' or when the sign has changed.
    onInput: PropTypes.func,

    // Default value of the input, type string is necessary to set a default empty value.
    defaultValue: (props, propName, componentName) => {
        if (
            !has(props, 'defaultValue') ||
            (typeof props.defaultValue === 'number' && props.defaultValue < 0)
        ) {
            return new Error(`Invalid prop: ${componentName} should have prop ${propName} of type\
number or should be null`);
        }
    },

    // Id for the sign span.
    signId: PropTypes.string.isRequired,

    // Default sign of the input.
    initiallyNegative: PropTypes.bool,

    // Whether the amount can be signed (true) or has to be non-negative (false).
    togglable: PropTypes.bool,

    // Extra class names to pass to the input.
    className: PropTypes.string,

    // Whether validity of the field value should be shown or not.
    checkValidity: PropTypes.bool
};

AmountInput.defaultProps = {
    initiallyNegative: true,
    togglable: true,
    defaultValue: null
};

export default AmountInput;
