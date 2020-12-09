import React from 'react';

import TextInput, { TextInputProps, TextInputRef } from './text-input';

const ValidatedTextInput = React.forwardRef<TextInputRef, TextInputProps>((props, ref) => {
    return <TextInput {...props} ref={ref} required={true} pattern="\S+.*" />;
});

ValidatedTextInput.defaultProps = {
    initialValue: '',
};

export type ValidatedTextInputRef = TextInputRef;

export default ValidatedTextInput;
