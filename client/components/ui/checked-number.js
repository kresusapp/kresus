import React from 'react';

import { assertHas } from '../../helpers';

import AmountInput from './amount-input';

export default class ValidableInputNumber extends React.Component {
    constructor(props) {
        assertHas(props, 'returnInputValue');
        assertHas(props, 'inputID');
        assertHas(props, 'step');
        assertHas(props, 'label');
        super(props);
        this.state = { valid: false };
        this.handleChange = this.handleChange.bind(this);
    }

    clear() {
        this.refs.amount.setValue();
        this.handleChange();
    }

    handleChange() {
        let number = this.refs.amount.getValue();
        if (!Number.isNaN(number) && Number.isFinite(number) && 1 / number !== -Infinity) {
            this.setState({ valid: true }, this.props.returnInputValue(number));
        } else {
            this.setState({ valid: false }, this.props.returnInputValue(null));
        }
    }

    showValidity() {
        if (this.state.valid) {
            return <span className="fa fa-check form-control-feedback" aria-hidden="true"></span>;
        }
        return <span className="fa fa-times form-control-feedback" aria-hidden="true"></span>;
    }

    render() {
        return (
            <div className="form-group has-feedback">
                <label className="control-label" htmlFor={ this.props.inputID } >
                    { this.props.label }
                </label>
                <AmountInput
                  onChange={ this.handleChange }
                  ref="amount"
                  step={ this.props.step }
                  id={ this.props.inputID }
                />
                { this.showValidity() }
            </div>
        );
    }
}
