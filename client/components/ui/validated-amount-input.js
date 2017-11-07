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
        let maybeValidClass = '';
        if (this.input && this.input.getValue()) {
            maybeValidClass = this.state.valid ? 'valid-input' : 'invalid-input';
        }

        return (
            <AmountInput
                onChange={this.handleChange}
                ref={this.refInput}
                signId={`sign${this.props.id}`}
                id={this.props.id}
                className={maybeValidClass}
            />
        );
    }
}

ValidatedAmountInput.propTypes = {
    // Callback receiving the new value or null whenever it changes.
    onChange: PropTypes.func.isRequired,

    // CSS id for the number input.
    id: PropTypes.string.isRequired
};

export default ValidatedAmountInput;
