import React from 'react';

import TextInput from './text-input';

// A ValidatedTextInput is a form group for a text input with a hint that it
// must not be empty.
interface ValidatedTextInputProps {
    // Callback receiving the validated text input.
    onChange: (value: string | null) => void;

    // CSS id for the text input.
    id?: string;

    // Placeholder of the input.
    placeholder?: string;

    // An initial value for the input.
    value?: string;
}

const ValidatedTextInput = React.forwardRef<TextInput, ValidatedTextInputProps>((props, ref) => {
    return <TextInput {...props} ref={ref} required={true} pattern="\S+.*" />;
});

ValidatedTextInput.defaultProps = {
    value: '',
};

export default ValidatedTextInput;
