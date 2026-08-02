import { useCallback, useRef } from 'react';

import './color-picker.css';
import { assert } from '../../helpers';

const ColorPicker = (props: {
    // Callback getting the new color whenever the selected one changes.
    onChange?: (color: string) => void;

    // The initial color selected.
    defaultValue: string;
}) => {
    const timer = useRef<number | null>(null);
    const ref = useRef<HTMLInputElement>(null);

    const { onChange: propsOnChange } = props;

    const inputOnChange = useCallback(() => {
        if (timer.current) {
            window.clearTimeout(timer.current);
        }
        // Debounce (250ms).
        timer.current = window.setTimeout(() => {
            timer.current = null;
            assert(ref.current !== null, 'ref input must be mounted');
            if (propsOnChange) {
                propsOnChange(ref.current.value);
            }
        }, 250);
    }, [propsOnChange]);

    // Native input color field.
    return (
        <input
            onChange={inputOnChange}
            type="color"
            defaultValue={props.defaultValue}
            className="color-picker"
            ref={ref}
        />
    );
};

ColorPicker.displayName = 'ColorPicker';

export default ColorPicker;
