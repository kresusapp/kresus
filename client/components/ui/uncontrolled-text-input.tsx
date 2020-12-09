import React, { useCallback, useLayoutEffect, useRef } from 'react';
import { assert } from '../../helpers';

interface UncontrolledTextInputProps {
    // Callback called on blur or when the Enter key is pressed.
    onSubmit: (newValue: string | null) => Promise<any>;

    // HTML id for the text input.
    id?: string;

    // Placeholder of the input.
    placeholder?: string;

    // A regular expression that the value will be checked against on form submission.
    pattern?: string;

    // An initial value for the input.
    value?: string | null;

    // Whether the text input is required.
    required?: boolean;

    // Whether the text input is disabled.
    disabled?: boolean;
}

export default (props: UncontrolledTextInputProps) => {
    const { onSubmit: onSubmitProp } = props;

    let className = 'form-element-block';
    if (props.required) {
        className += ' check-validity';
    }

    const ref = useRef<HTMLInputElement>(null);

    const onSubmit = useCallback(
        event => {
            const {
                value,
                validity: { valid },
            } = event.target;
            const newValue = value.trim();
            if (valid && newValue.length) {
                onSubmitProp(newValue);
            } else {
                onSubmitProp(null);
            }
        },
        [onSubmitProp]
    );

    useLayoutEffect(() => {
        assert(ref.current !== null, 'input must be mounted');
        const currentRef = ref.current;
        currentRef.addEventListener('change', onSubmit);
        return () => {
            currentRef.removeEventListener('change', onSubmit);
        };
    }, [ref, onSubmit]);

    return (
        <input
            ref={ref}
            type="text"
            className={className}
            id={props.id}
            pattern={props.pattern}
            required={props.required}
            placeholder={props.placeholder}
            defaultValue={props.value === null ? '' : props.value}
            disabled={props.disabled}
        />
    );
};
