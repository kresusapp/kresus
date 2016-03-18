import React from 'react';

import { has } from '../../helpers';

export default class ValidableInputNumber extends React.Component {
    constructor(props) {
        has(props, 'returnInputValue');
        has(props, 'inputID');
        has(props, 'step');
        has(props, 'label');
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
                <input className="form-control" type="number" id={ this.props.inputID }
                  step={ this.props.step } ref="number" onChange={ this.handleChange }
                  required={ true }
                />
                { this.showValidity() }
            </div>
        );
    }
}
