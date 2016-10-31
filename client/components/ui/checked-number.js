import React from 'react';

import { assertHas } from '../../helpers';

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
        this.refs.number.value = '';
        this.handleChange();
    }

    handleChange() {
        let number = Number.parseFloat(this.refs.number.value.trim());
        if (!Number.isNaN(number) && Number.isFinite(number) && 1 / number !== -Infinity) {
            this.setState({ valid: true }, this.props.returnInputValue(number));
        } else {
            this.setState({ valid: false }, this.props.returnInputValue(null));
        }
    }

    render() {
        return (
            <div className="form-group">
                <label className="control-label" htmlFor={ this.props.inputID } >
                    { this.props.label }
                </label>
            <div className={ `${this.state.valid ? 'has-success' : 'has-error'}` }>
                <input
                  className="form-control"
                  type="number" id={ this.props.inputID }
                  step={ this.props.step } ref="number" onChange={ this.handleChange }
                  required={ true }
                />
            </div>
            </div>
        );
    }
}
