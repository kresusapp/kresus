import React from 'react';

import { translate as $t, maybeHas as has } from '../../helpers';

class AmountInput extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            isNegative: this.props.isInitiallyNegative,
            value: this.props.defaultValue
        };

        this.handleChangeProp = () => {
            this.props.onChange(this.getValue());
        };

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
            isNegative: this.props.isInitiallyNegative
        }, this.handleChangeProp);
    }

    reset() {
        this.setState({
            value: this.props.defaultValue,
            isNegative: this.props.isInitiallyNegative
        }, this.handleChangeProp);
    }

    handleChange(e) {
        let realValue = e.target.value;
        let value = Number.parseFloat(realValue);

        let isNegative = this.state.isNegative;
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
            value = null;
        }
        this.setState({ isNegative, value }, this.handleChangeProp);
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
        let value;
        if (this.state.value === null || Number.isNaN(this.state.value)) {
            value = '';
        } else {
            value = this.state.value;
        }
        return (
            <div className="input-group">
                <span
                  className={ `input-group-addon ${togglable ? 'clickable' : 'not-clickable'}` }
                  onClick={ this.handleClick }
                  id={ this.props.signId }
                  title={ maybeTitle }>
                    <i
                      className={ `fa fa-${this.state.isNegative ? 'minus' : 'plus'}` }
                    />
                </span>
                <input
                  className="form-control"
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
        if (!has(props, propName) && (props[propName] === null ||
            typeof props[propName] === 'number' && props[propName]  >= 0)) {
            return new Error(`Invalid prop: ${componentName} should have prop ${propName} of type\
number or should be null`);
        }
    },

    // Id for the sign span.
    signId: React.PropTypes.string.isRequired,

    // Default sign of the input
    isInitiallyNegative: React.PropTypes.bool,

    // Tells if the sign shall be togglable
    togglable: React.PropTypes.bool
};

AmountInput.defaultProps = {
    isInitiallyNegative: true,
    togglable: true,
    defaultValue: null
};

export default AmountInput;
