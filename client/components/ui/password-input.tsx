import React, { forwardRef, useCallback, useImperativeHandle, useState } from 'react';

import { assert, translate as $t } from '../../helpers';

// Note this password input doesn't accept passwords starting with or ending
// with spaces (or passwords only containing spaces).

interface PasswordInputProps {
    // The id attribute used to match labels.
    id?: string;

    // The input's placeholder.
    placeholder?: string;

    // A function called when the input changes.
    onChange: (passwd: string | null) => void;

    // The defaultValue of the input.
    defaultValue?: string | null;

    // Extra class names to pass to the input.
    className?: string;

    // Tells whether the input has focus on mounting the component.
    autoFocus?: boolean;

    // Whether the input is disabled.
    disabled?: boolean;
}

interface PasswordInputRef {
    focus: () => void;
}

const PasswordInput = forwardRef<PasswordInputRef, PasswordInputProps>((props, ref) => {
    const [showPassword, setShowPassword] = useState(false);

    const refInput = React.createRef<HTMLInputElement>();

    const handleClick = useCallback(() => {
        setShowPassword(!showPassword);
    }, [setShowPassword, showPassword]);

    const { onChange: propsOnChange } = props;
    const handleChange = useCallback(
        event => {
            const newValue = (event.target.value || '').trim();
            if (newValue.length) {
                propsOnChange(newValue);
            } else {
                propsOnChange(null);
            }
        },
        [propsOnChange]
    );

    useImperativeHandle(ref, () => ({
        focus() {
            assert(refInput.current !== null, 'input must be known');
            refInput.current.focus();
        },
    }));

    let iconClass;
    let type;
    let title;
    let accessibleIconClass;
    if (showPassword) {
        iconClass = 'eye-slash';
        type = 'text';
        title = $t('client.general.hide_password');
        accessibleIconClass = $t('client.general.hidden');
    } else {
        iconClass = 'eye';
        type = 'password';
        title = $t('client.general.show_password');
        accessibleIconClass = $t('client.general.shown');
    }

    const maybeClassName = props.className ? props.className : '';

    return (
        <div className={`input-with-addon ${maybeClassName}`}>
            <input
                type={type}
                id={props.id}
                ref={refInput}
                placeholder={props.placeholder}
                onChange={handleChange}
                autoComplete="new-password"
                autoFocus={props.autoFocus || false}
                className="check-validity"
                defaultValue={props.defaultValue || undefined}
                required={true}
                pattern="^\S(.*\S)?$"
                disabled={props.disabled || false}
            />
            <button type="button" className="btn" onClick={handleClick} title={title}>
                <span className="screen-reader-text">{accessibleIconClass}</span>
                <i className={`fa fa-${iconClass}`} aria-hidden="true" />
            </button>
        </div>
    );
});

export default PasswordInput;
