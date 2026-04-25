import React, { ChangeEvent, useCallback } from 'react';

export interface TextInputProps {
    // Callback receiving the validated text input.
    onChange: (value: string | null) => void;

    // HTML id for the text input.
    id?: string;

    // Placeholder of the input.
    placeholder?: string;

    // A regular expression that the value will be checked against on form submission.
    pattern?: string;

    // An initial value for the input.
    initialValue?: string | null;

    // Whether the text input is required.
    required?: boolean;

    // Whether the text input is disabled.
    disabled?: boolean;
}

// The type to use when making a reference to an instance of
// TextInput.
export type TextInputRef = HTMLInputElement;

const TextInput = React.forwardRef<TextInputRef, TextInputProps>(
    (
        {
            initialValue = '',
            required = false,
            disabled = false,
            onChange: onChangeProps,
            id,
            placeholder,
            pattern,
        },
        ref
    ) => {
        const onChange = useCallback(
            (event: ChangeEvent<HTMLInputElement>) => {
                const {
                    value,
                    validity: { valid },
                } = event.target;
                const newValue = value.trim();
                if (valid && newValue.length) {
                    onChangeProps(newValue);
                } else {
                    onChangeProps(null);
                }
            },
            [onChangeProps]
        );

        let className = 'form-element-block';
        if (required) {
            className += ' check-validity';
        }

        return (
            <input
                ref={ref}
                type="text"
                className={className}
                id={id}
                pattern={pattern}
                required={required}
                onChange={onChange}
                placeholder={placeholder}
                defaultValue={initialValue === null ? '' : initialValue}
                disabled={disabled}
            />
        );
    }
);

export default TextInput;
