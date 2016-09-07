import React from 'react';

import { translate as $t } from '../../helpers';

class AmountInput extends React.Component {
    constructor(props) {
        super(props);

        if (this.props.defaultValue < 0) {
            throw Error(`Default value for AmounInput shall be positive.
Found:${this.props.defaultValue}. Consider use the sign prop of the component`);
        }
        this.state = {
            isNegative: this.props.defaultSign === '-',
            value: this.props.defaultValue
        };
        this.handleChange = this.handleChange.bind(this);
        this.handleClick = this.handleClick.bind(this);
        this.refInput = this.refInput.bind(this);
        this.runOnChangeProp = this.runOnChangeProp.bind(this);
    }

    refInput(node) {
        this.input = node;
    }

    handleChange() {
        let realValue = this.input.value;
        let value = parseFloat(realValue);
        let isNegative = this.state.isNegative;

        // Set the sign if the inputed value start with a - or a +
        if (typeof realValue === 'string') {
            if (this.props.togglable) {
                if (realValue[0] === '+') {
                    isNegative = false;
                } else if (realValue[0] === '-') {
                    isNegative = true;
                }
            }
        }

        if (!Number.isNaN(value) && Number.isFinite(value) && 1 / value !== -Infinity) {
            // Change the sign only in case the user set a negative value in the input
            if (this.props.togglable) {
                if (Math.sign(value) === -1) {
                    isNegative = true;
                }
            }
            value = Math.abs(value);
        } else {
            // For React, using an empty string is necesary to empty the input.
            value = '';
        }
        return this.setState({ isNegative, value }, this.runOnChangeProp);
    }

    runOnChangeProp() {
        if (typeof this.props.onChange !== 'undefined') {
            this.props.onChange(this.getValue());
        }
    }

    handleClick() {
        if (this.props.togglable) {
            this.setState({ isNegative: !this.state.isNegative }, this.runOnChangeProp);
        }
    }

    getValue() {
        let value = parseFloat(this.state.value);
        return this.state.isNegative ? -value : value;
    }

    setValue(value) {
        this.input.value = value;
    }

    render() {
        let mayBeTitle;
        let togglable = this.props.togglable;
        if (togglable) {
            mayBeTitle = $t('client.ui.toggle_sign');
        }
        return (
            <div className="input-group">
                <span className={ `input-group-addon ${togglable ? 'clickable' : 'not-clickable'}` }
                  onClick= { this.handleClick }
                  id="amount-sign"
                  title={ mayBeTitle }>
                    <i className={ `fa fa-${this.state.isNegative ? 'minus' : 'plus'}` }></i>
                </span>
                <input className="form-control"
                  onChange={ this.handleChange }  aria-describedby="amount-sign"
                  step={ this.props.step }
                  value={ this.state.value }
                  ref={ this.refInput }
                  id={ this.props.inputID }
                  max={ this.props.maxValue } min={ this.props.minValue }
                />
            </div>
        );
    }
}

AmountInput.propTypes = {
    // Function to handle change in the input
    onChange: React.PropTypes.func,

    // Default value of the input, type string is necessary to set a default empty value.
    defaultValue: React.PropTypes.oneOfType([React.PropTypes.number, React.PropTypes.string]),

    // Default sign of the input
    defaultSign: React.PropTypes.oneOf(['-', '+']),

    // Number step for the input
    step: React.PropTypes.number,

    // Tells if the sign shall be togglable
    togglable: React.PropTypes.bool,

    // Minimum value for the input, the type string is necessary to pass an empty minValue.
    minValue: React.PropTypes.oneOfType([React.PropTypes.number, React.PropTypes.string]),

    // Maximum value for the input, the type string is necessary to pass an empty maxValue.
    maxValue: React.PropTypes.oneOfType([React.PropTypes.number, React.PropTypes.string])

};

AmountInput.defaultProps = {
    step: 0.01,
    defaultSign: '-',
    togglable: true,
    minValue: '',
    maxValue: '',
    defaultValue: ''
};

export default AmountInput;
