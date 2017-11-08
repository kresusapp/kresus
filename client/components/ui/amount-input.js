import React from 'react';
import PropTypes from 'prop-types';

import { translate as $t, maybeHas as has, assert } from '../../helpers';

class AmountInput extends React.Component {
    constructor(props) {
        assert(
            (typeof props.onChange === 'function') ^ (typeof props.onInput === 'function'),
            'AmountInput should have either onChange xor onInput prop set'
        );
        super(props);

        this.state = {
            isNegative: this.props.initiallyNegative,
            value: Number.parseFloat(this.props.defaultValue),
            afterPeriod: '',
            isValid: null
        };

        // Handler of onChange event
        this.handleChangeProp = () => {
            if (typeof this.props.onChange === 'function') {
                this.props.onChange(this.getValue());
            }
        };

        // Handler of onBlur/onKey=Enter events
        this.handleInput = () => {
            if (typeof this.props.onInput === 'function') {
                this.props.onInput(this.getValue());
            }
        };
        this.handleChange = this.handleChange.bind(this);
        this.handleClick = this.handleClick.bind(this);

        this.handleKeyUp = this.handleKeyUp.bind(this);

        this.handleChangeSign = () => {
            this.handleChangeProp();
            this.handleInput();
        };
    }

    clear() {
        this.setState({
            value: NaN,
            isNegative: this.props.initiallyNegative,
            afterPeriod: '',
            isValid: null
        });
    }

    reset() {
        this.setState({
            value: Number.parseFloat(this.props.defaultValue),
            isNegative: this.props.initiallyNegative,
            afterPeriod: '',
            isValid: null
        });
    }

    handleKeyUp(e) {
        if (e.key === 'Enter') {
            this.handleInput();
            e.target.blur();
        }
    }

    handleChange(e) {
        let realValue = e.target.value;
        let valueWithPeriod = realValue ? realValue.trim().replace(',', '.') : '';

        // Keep only the first period
        valueWithPeriod = valueWithPeriod
            .split('.')
            .splice(0, 2)
            .join('.');

        // Get the period and the zeroes at the end of the input
        let match = valueWithPeriod.match(/\.0*$/);
        let afterPeriod = match ? match[0] : '';

        let value = Number.parseFloat(valueWithPeriod);

        let isNegative = this.state.isNegative;
        if (typeof realValue === 'string' && this.props.togglable) {
            if (realValue[0] === '+') {
                isNegative = false;
            } else if (realValue[0] === '-') {
                isNegative = true;
            }
        }

        if (!Number.isNaN(value) && Number.isFinite(value) && 1 / value !== -Infinity) {
            // Change the sign only in case the user set a negative value in the input
            if (this.props.togglable && Math.sign(value) === -1) {
                isNegative = true;
            }
            value = Math.abs(value);
        } else {
            value = null;
        }

        this.setState(
            {
                isNegative,
                value: Number.parseFloat(value),
                afterPeriod,
                isValid: e.target.validity.valid
            },
            this.handleChangeProp
        );
    }

    handleClick() {
        if (this.props.togglable) {
            this.setState({ isNegative: !this.state.isNegative }, this.handleChangeSign);
        }
    }

    getValue() {
        let value = this.state.value;
        return this.state.isNegative ? -value : +value;
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

        let maybeClassName = this.props.className ? this.props.className : '';

        // Add the period and what is after, if it exists
        if (this.state.afterPeriod) {
            value += this.state.afterPeriod;
        }

        let signLabel = this.state.isNegative ? 'minus' : 'plus';

        if (this.props.showValidity && this.state.isValid !== null) {
            maybeClassName += this.state.isValid ? ' valid-input' : ' invalid-input'
        }

        return (
            <div className="input-group">
                <span className={`input-group-btn ${maybeClassName}`}>
                    <button type="button" className={`btn btn-secondary ${clickableClass}`} onClick={this.handleClick} title={maybeTitle}>
                        <i
                            className={`fa fa-${signLabel}`}
                            aria-hidden="true"
                        />
                        <span className="sr-only">{ $t(`client.general.${signLabel}`) }</span>
                    </button>
                </span>
                {/*
                    We need to specify the lang to allow for commas and dots separators,
                    see https://github.com/spiral-project/ihatemoney/issues/235#issuecomment-339138461.
                  */}
                <input
                    className={`form-control ${maybeClassName}`}
                    type="number"
                    lang="en"
                    step="any"
                    onInput={this.handleChange}
                    aria-describedby={this.props.signId}
                    value={value}
                    onBlur={this.handleInput}
                    onKeyUp={this.handleKeyUp}
                    id={this.props.id}
                />
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

    // Default sign of the input
    initiallyNegative: PropTypes.bool,

    // Whether the amount can be signed (true) or has to be non-negative (false).
    togglable: PropTypes.bool,

    // Extra class names to pass to the input
    className: PropTypes.string,

    // Whether validity of the field value should be shown or not
    showValidity: PropTypes.bool
};

AmountInput.defaultProps = {
    initiallyNegative: true,
    togglable: true,
    defaultValue: null
};

export default AmountInput;
