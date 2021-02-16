import React, { forwardRef, useCallback, useImperativeHandle, useState } from 'react';

import DatePicker from './date-picker';

// A validated date input is form group for a date picker, with a special hint
// next to the date picker showing whether the date is valid or not.

interface Props {
    // Callback receiving the validated date input.
    onSelect: (d: Date) => void;

    // CSS id for the date picker.
    id: string;

    // Input value
    value?: Date;

    className?: string;
}

interface ExposedMethods {
    clear: () => void;
}

const ValidatedDatePicker = forwardRef<ExposedMethods, Props>((props, ref) => {
    const [valid, setValid] = useState(false);

    const { onSelect } = props;

    const handleSelect = useCallback(
        date => {
            setValid(!!date);
            onSelect(date);
        },
        [setValid, onSelect]
    );

    useImperativeHandle(
        ref,
        () => ({
            clear() {
                handleSelect(null);
            },
        }),
        [handleSelect]
    );

    let className = props.className || '';
    className += valid ? ' valid-date' : ' invalid-date';

    return (
        <DatePicker
            id={props.id}
            className={className}
            onSelect={handleSelect}
            value={props.value}
        />
    );
});

ValidatedDatePicker.displayName = 'ValidatedDatePicker';

export default ValidatedDatePicker;
