import React from 'react';
import PropTypes from 'prop-types';

import TextInput from './text-input';

// A ValidatedTextInput is a form group for a text input with a hint that it
// must not be empty.

const ValidatedTextInput = React.forwardRef((props, ref) => {
    return <TextInput {...props} ref={ref} required={true} pattern="\S+.*" />;
});

ValidatedTextInput.propTypes = {
    // Callback receiving the validated text input.
    onChange: PropTypes.func.isRequired,

    // CSS id for the text input.
    id: PropTypes.string.isRequired,

    // Placeholder of the input.
    placeholder: PropTypes.string,

    // An initial value for the input.
    value: PropTypes.string
};

ValidatedTextInput.defaultProps = {
    value: ''
};

export default ValidatedTextInput;
