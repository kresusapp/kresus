import React from 'react';

import { translate as $t, maybeHas as has, assert } from '../../helpers';

class AmountInput extends React.Component {
    constructor(props) {
        assert((typeof props.onChange === 'function' ^ typeof props.onInput === 'function'),
        'AmountInput should have either onChange xor onInput prop set');
        super(props);

        this.state = {
            isNegative: this.props.initiallyNegative,
            value: Number.parseFloat(this.props.defaultValue),
            afterPeriod: ''
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
        // Handler for change of sign
        this.handleChangeSign = () => {
            this.handleChangeProp();
            this.handleInput();
        };
    }

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
        valueWithPeriod = valueWithPeriod.split('.').splice(0, 2).join('.');

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

        this.setState({
            isNegative,
            value: Number.parseFloat(value),
            afterPeriod
        }, this.handleChangeProp);
    }

    handleClick() {
        if (this.props.togglable) {
            this.setState({ isNegative: !this.state.isNegative }, this.handleChangeSign);
        }
    }

    getValue() {
        let value = this.state.value;
        return this.state.isNegative ? -value : value;
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

        // Add the period and what is after, if it exists
        if (this.state.afterPeriod) {
            value += this.state.afterPeriod;
        }

        return (
            <div className="input-group">
                <span
                  className={ `input-group-addon ${clickableClass}` }
                  onClick={ this.handleClick }
                  id={ this.props.signId }
                  title={ maybeTitle }>
                    <i
                      className={ `fa fa-${this.state.isNegative ? 'minus' : 'plus'} ${clickableClass}` }
                    />
                </span>
                <input
                  className="form-control"
                  type="text"
                  onChange={ this.handleChange }
                  aria-describedby={ this.props.signId }
                  value={ value }
                  onBlur={ this.handleInput }
                  onKeyUp={ this.handleKeyUp }
                />
            </div>
        );
    }
}

AmountInput.propTypes = {
    // Function to handle change in the input
    onChange: React.PropTypes.func,

    // Function to handle the validation of the input by the user: either on blur, either on
    // hitting 'Enter'
    onInput: React.PropTypes.func,

    // Default value of the input, type string is necessary to set a default empty value.
    defaultValue: (props, propName, componentName) => {
        if (!has(props, 'defaultValue') ||
            (typeof props.defaultValue === 'number' && props.defaultValue < 0)) {
            return new Error(`Invalid prop: ${componentName} should have prop ${propName} of type\
number or should be null`);
        }
    },

    // Id for the sign span.
    signId: React.PropTypes.string.isRequired,

    // Default sign of the input
    initiallyNegative: React.PropTypes.bool,

    // Whether the amount can be signed (true) or has to be non-negative (false).
    togglable: React.PropTypes.bool
};

AmountInput.defaultProps = {
    initiallyNegative: true,
    togglable: true,
    defaultValue: null
};

export default AmountInput;
