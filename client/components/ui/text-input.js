import React from 'react';
import PropTypes from 'prop-types';

class TextInput extends React.Component {
    refInput = React.createRef();

    handleChange = event => {
        let {
            value,
            validity: { valid }
        } = event.target;
        value = value.trim();
        if (valid && value.length) {
            this.props.onChange(value);
        } else {
            this.props.onChange(null);
        }
    };

    clear() {
        this.input.clear();
        this.props.onChange(null);
    }

    render() {
        let className = 'form-element-block';
        if (this.props.required) {
            className += ' check-validity';
        }
        return (
            <input
                type="text"
                className={className}
                id={this.props.id}
                pattern={this.props.pattern || null}
                required={this.props.required}
                onChange={this.handleChange}
                placeholder={this.props.placeholder}
                defaultValue={this.props.value}
            />
        );
    }
}

TextInput.propTypes = {
    // Callback receiving the validated text input.
    onChange: PropTypes.func.isRequired,

    // CSS id for the text input.
    id: PropTypes.string.isRequired,

    // Placeholder of the input.
    placeholder: PropTypes.string,

    // A regular expression that the value will be checked against on form submission.
    pattern: PropTypes.string,

    // An initial value for the input.
    value: PropTypes.string,

    // Whether the text input is required.
    required: PropTypes.bool
};

TextInput.defaultProps = {
    value: '',
    required: false
};

export default TextInput;
