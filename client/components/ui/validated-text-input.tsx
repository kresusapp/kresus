import { forwardRef } from 'react';

import TextInput, { TextInputProps, TextInputRef } from './text-input';

const ValidatedTextInput = forwardRef<TextInputRef, TextInputProps>(
    ({ initialValue = '', ...rest }, ref) => {
        return (
            <TextInput
                {...rest}
                initialValue={initialValue}
                ref={ref}
                required={true}
                pattern="\S+.*"
            />
        );
    }
);

export type ValidatedTextInputRef = TextInputRef;

export default ValidatedTextInput;
