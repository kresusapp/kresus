import React from 'react';

import AmountInput from './amount-input';

class ValidableInputNumber extends React.Component {
    constructor(props) {
        super(props);
        this.state = { valid: false };
        this.handleChange = this.handleChange.bind(this);
        this.refInput = this.refInput.bind(this);
    }

    refInput(node) {
        this.amount = node;
    }

    clear() {
        this.amount.clear();
        this.setState({ valid: false });
    }

    handleChange(value) {
        this.setState({ valid: !Number.isNaN(parseFloat(value)) }, this.props.onChange(value));
    }

    showValidity() {
        if (this.state.valid) {
            return (<span
              className="fa fa-check form-control-feedback"
              aria-hidden="true"
            />);
        }
        return (<span
          className="fa fa-times form-control-feedback"
          aria-hidden="true"
        />);
    }

    render() {
        return (
            <div className="form-group has-feedback">
                <label
                  className="control-label"
                  htmlFor={ this.props.inputID } >
                    { this.props.label }
                </label>
                <AmountInput
                  onChange={ this.handleChange }
                  ref={ this.refInput }
                  signId={ `sign${this.props.inputID}` }
                  id={ this.props.inputID }
                />
                { this.showValidity() }
            </div>
        );
    }
}

ValidableInputNumber.propTypes = {
    // Handler to get the new value in the input
    onChange: React.PropTypes.func.isRequired,

    // Label of the input
    label: React.PropTypes.string.isRequired,

    // Unique ID to link input and id
    inputID: React.PropTypes.string.isRequired
};

export default ValidableInputNumber;
