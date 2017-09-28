import React from 'react';
import PropTypes from 'prop-types';

import AmountInput from './amount-input';

// A ValidatedAmountInput is a form group for an amount input, with a hint that
// the amount entered has to be correct (can't be a NaN or a weird
// floating-point value).

class ValidatedAmountInput extends React.Component {
    constructor(props) {
        super(props);

        this.state = { valid: false };

        this.refInput = node => {
            this.input = node;
        };

        this.handleChange = this.handleChange.bind(this);
    }

    clear() {
        this.input.clear();
        this.setState({ valid: false });
    }

    handleChange(value) {
        let valid = !Number.isNaN(parseFloat(value));
        this.setState({ valid }, () => {
            this.props.onChange(valid ? value : null);
        });
    }

    render() {
        let iconClass = this.state.valid ? 'fa-check' : 'fa-times';
        iconClass = `fa ${iconClass} form-control-feedback`;

        return (
            <div className="form-group has-feedback">
                <label className="control-label" htmlFor={this.props.inputID}>
                    {this.props.label}
                </label>

                <AmountInput
                    onChange={this.handleChange}
                    ref={this.refInput}
                    signId={`sign${this.props.inputID}`}
                    id={this.props.inputID}
                />

                <span className={iconClass} aria-hidden="true" />
            </div>
        );
    }
}

ValidatedAmountInput.propTypes = {
    // Callback receiving the new value or null whenever it changes.
    onChange: PropTypes.func.isRequired,

    // Description of the number input (shown to the user).
    label: PropTypes.string.isRequired,

    // CSS id for the number input.
    inputID: PropTypes.string.isRequired
};

export default ValidatedAmountInput;
