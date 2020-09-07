import React from 'react';
import PropTypes from 'prop-types';

const TextInput = React.forwardRef((props, ref) => {
    let handleChange = event => {
        let {
            value,
            validity: { valid },
        } = event.target;
        value = value.trim();
        if (valid && value.length) {
            props.onChange(value);
        } else {
            props.onChange(null);
        }
    };

    let className = 'form-element-block';
    if (props.required) {
        className += ' check-validity';
    }

    return (
        <input
            ref={ref}
            type="text"
            className={className}
            id={props.id}
            pattern={props.pattern || null}
            required={props.required}
            onChange={handleChange}
            placeholder={props.placeholder}
            defaultValue={props.value}
        />
    );
});

TextInput.propTypes = {
    // Callback receiving the validated text input.
    onChange: PropTypes.func.isRequired,

    // CSS id for the text input.
    id: PropTypes.string,

    // Placeholder of the input.
    placeholder: PropTypes.string,

    // A regular expression that the value will be checked against on form submission.
    pattern: PropTypes.string,

    // An initial value for the input.
    value: PropTypes.string,

    // Whether the text input is required.
    required: PropTypes.bool,
};

TextInput.defaultProps = {
    value: '',
    required: false,
};

export default TextInput;
