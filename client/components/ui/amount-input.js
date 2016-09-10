import React from 'react';

import { translate as $t } from '../../helpers';

class AmountInput extends React.Component {
    constructor(props) {
        super(props);

        if (this.props.defaultValue < 0) {
            throw Error(`Default value for AmounInput shall be positive.
Found:${this.props.defaultValue}. Consider use the sign prop of the component`);
        }

        this.state = { isNegative: this.props.defaultSign === '-' };
        this.handleChange = this.handleChange.bind(this);
        this.handleClick = this.handleClick.bind(this);
    }

    handleChange() {
        let value = this.refs['input-amount'].value;
        // Manage the case where the user set a negative value in the input
        if (value < 0) {
            this.setValue(-value);
            if (!this.state.isNegative) {
                this.setState({ isNegative: true }, this.handleChange);
            }
        }

        if (typeof this.props.onChange !== 'undefined') {
            this.props.onChange();
        }
    }

    handleClick() {
        this.setState({ isNegative: !this.state.isNegative },  this.handleChange);
    }

    getValue() {
        let value = Number.parseFloat(this.refs['input-amount'].value);
        if (!Number.isNaN(value) && Number.isFinite(value) && 1 / value !== -Infinity) {
            return this.state.isNegative ? -value : value;
        }
        // This prevents the propagation of NaN, which causes weird behaviours
        // in the other componenents
        return this.refs['input-amount'].value;
    }

    setValue(value) {
        this.refs['input-amount'].value = value;
    }

    render() {
        return (
            <div className="input-group">
                <span className="input-group-addon" onClick= { this.handleClick } id="amount-sign"
                  title={ $t('client.ui.toggle_sign') }>
                    <i className={ `fa fa-${this.state.isNegative ? 'minus' : 'plus'}` }></i>
                </span>
                <input type="number" className="form-control" ref={ 'input-amount' }
                  onChange={ this.handleChange }  aria-describedby="amount-sign"
                  defaultValue={ this.props.defaultValue } step={ this.props.step }
                  id={ this.props.inputID }
                />
            </div>
        );
    }
}

AmountInput.propTypes = {
    // Function to handle change in the input
    onChange: React.PropTypes.func,

    // Default value of the input
    defaultValue: React.PropTypes.number,

    // Default sign of the input
    defaultSign: React.PropTypes.oneOf(['-', '+']),

    // Unique identifier of input
    inputID: React.PropTypes.string,

    // Number step for the input
    step: React.PropTypes.number
};

AmountInput.defaultProps = {
    inputID: '',
    step: 0.01
};

export default AmountInput;
