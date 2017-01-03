import React from 'react';

import { translate as $t, maybeHas as has } from '../../helpers';

class AmountInput extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            isNegative: this.props.initiallyNegative,
            value: this.props.defaultValue,
            afterPeriod: ''
        };

        this.handleChangeProp = () => this.props.onChange(this.getValue());

        this.handleChange = this.handleChange.bind(this);
        this.handleClick = this.handleClick.bind(this);
        this.refInput = this.refInput.bind(this);
        this.handleChangeProp = this.handleChangeProp.bind(this);
    }

    refInput(node) {
        this.input = node;
    }

    clear() {
        this.setState({
            value: null,
            isNegative: this.props.initiallyNegative,
            afterPeriod: ''
        });
    }

    reset() {
        this.setState({
            value: this.props.defaultValue,
            isNegative: this.props.initiallyNegative,
            afterPeriod: ''
        });
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
        this.setState({ isNegative, value, afterPeriod  }, this.handleChangeProp);
    }

    handleClick() {
        if (this.props.togglable) {
            this.setState({ isNegative: !this.state.isNegative }, this.handleChangeProp);
        }
    }

    getValue() {
        let value = Number.parseFloat(this.state.value);
        return this.state.isNegative ? -value : value;
    }

    render() {
        let maybeTitle;
        let togglable = this.props.togglable;
        if (togglable) {
            maybeTitle = $t('client.ui.toggle_sign');
        }
        let className = togglable ? 'clickable' : 'not-clickable';
        let value = this.state.value === null ? '' : this.state.value;

        // Add the final period, if exists
        if (this.state.afterPeriod) {
            value += this.state.afterPeriod;
        }

        return (
            <div className="input-group">
                <span
                  className={ `input-group-addon ${className}` }
                  onClick={ this.handleClick }
                  id={ this.props.signId }
                  title={ maybeTitle }>
                    <i
                      className={ `fa fa-${this.state.isNegative ? 'minus' : 'plus'} ${className}` }
                    />
                </span>
                <input
                  className="form-control"
                  type="text"
                  onChange={ this.handleChange }
                  aria-describedby={ this.props.signId }
                  value={ value }
                  ref={ this.refInput }
                />
            </div>
        );
    }
}

AmountInput.propTypes = {
    // Function to handle change in the input
    onChange: React.PropTypes.func.isRequired,

    // Default value of the input, type string is necessary to set a default empty value.
    defaultValue: (props, propName, componentName) => {
        
        if ((!has(props, 'defaultValue') && props.defaultValue !== null) ||
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
