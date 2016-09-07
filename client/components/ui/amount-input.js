import React from 'react';

import { translate as $t } from '../../helpers';

export default class AmountInput extends React.Component {
    constructor(props) {
        super(props);
        this.state = { isNegative: true };
        this.handleChange = this.handleChange.bind(this);
        this.handleClick = this.handleClick.bind(this);
    }

    handleChange() {
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
        return value;
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
                  defaultValue={ this.props.defaulValue || 0 } step={ this.props.step || 0.01 }
                  id={ this.props.inputID || '' }
                />
            </div>
        );
    }
}
