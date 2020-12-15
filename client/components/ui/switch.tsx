import React, { useCallback, ChangeEvent, ReactElement } from 'react';

interface SwitchProps {
    // Function called when the value changes.
    onChange: (state: boolean) => void;

    // Controlled value.
    checked: boolean;

    // An html id, for labels.
    id?: string;

    // Additional CSS classes.
    className?: string;

    // Aria label for screen readers.
    ariaLabel: string;
}

function Switch(props: SwitchProps): ReactElement {
    const { onChange: onChangeProps } = props;

    const onChange = useCallback(
        (ev: ChangeEvent<HTMLInputElement>) => {
            onChangeProps(ev.currentTarget.checked);
        },
        [onChangeProps]
    );

    const extraClasses = props.className ? props.className : '';

    return (
        <input
            id={props.id}
            type="checkbox"
            className={`switch ${extraClasses}`}
            onChange={onChange}
            aria-label={props.ariaLabel}
            checked={props.checked}
        />
    );
}

export default Switch;
