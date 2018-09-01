import React from 'react';
import PropTypes from 'prop-types';

// A ValidableInputText is a form group for a text input with a hint that it
// must not be empty.

class ValidableInputText extends React.Component {
    refInput = node => (this.input = node);

    handleChange = event => {
        this.props.onChange(event.target.validity.valid ? event.target.value.trim() : null);
    };

    clear() {
        this.input.clear();
        this.props.onChange(null);
    }

    render() {
        return (
            <input
                type="text"
                className="form-element-block check-validity"
                id={this.props.id}
                required={true}
                pattern="\S+.*"
                onChange={this.handleChange}
                placeholder={this.props.placeholder}
                defaultValue={this.props.value}
            />
        );
    }
}

ValidableInputText.propTypes = {
    // Callback receiving the validated text input.
    onChange: PropTypes.func.isRequired,

    // CSS id for the text input.
    id: PropTypes.string.isRequired,

    // Placeholder of the input.
    placeholder: PropTypes.string,

    // An initial value for the input.
    value: PropTypes.string
};

ValidableInputText.defaultProps = {
    value: ''
};

export default ValidableInputText;
