import React from 'react';
import PropTypes from 'prop-types';

// A ValidableInputText is a form group for a text input with a hint that it
// must not be empty.

class ValidableInputText extends React.Component {
    constructor(props) {
        super(props);

        this.refInput = node => {
            this.input = node;
        };

        this.state = { valid: false };
        this.handleChange = this.handleChange.bind(this);
    }

    handleChange() {
        let title = this.input.value.trim();
        let valid = title.length > 0;
        this.setState({ valid }, () => this.props.onChange(valid ? title : null));
    }

    clear() {
        this.input.value = '';
        this.handleChange();
    }

    render() {
        let maybeValidClass = '';
        if (this.input && this.input.value.trim()) {
            maybeValidClass = this.state.valid ? 'valid-input' : 'invalid-input';
        }

        return (
            <input
                type="text"
                className={`form-control ${maybeValidClass}`}
                id={this.props.id}
                ref={this.refInput}
                required={true}
                onChange={this.handleChange}
            />
        );
    }
}

ValidableInputText.propTypes = {
    // Callback receiving the validated text input.
    onChange: PropTypes.func.isRequired,

    // CSS id for the text input.
    id: PropTypes.string.isRequired
};

export default ValidableInputText;
