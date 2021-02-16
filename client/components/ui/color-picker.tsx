import React, { useCallback, useRef } from 'react';

import RcColorPicker from 'rc-color-picker';

import 'rc-color-picker/assets/index.css';
import './color-picker.css';
import { assert } from '../../helpers';

const supportsColorInput = (() => {
    if (typeof document === 'undefined') {
        // Testing support!
        return false;
    }
    const input = document.createElement('input');
    input.setAttribute('type', 'color');
    return input.type === 'color';
})();

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
        timer.current = window.setTimeout(() => {
            timer.current = null;
            assert(ref.current !== null, 'ref input must be mounted');
            if (propsOnChange) {
                propsOnChange(ref.current.value);
            }
        }, 250);
    }, [propsOnChange]);

    const rcColorPickerOnChange = useCallback(
        (rcColorPickerValue: { color: string }) => {
            if (timer.current) {
                window.clearTimeout(timer.current);
            }
            timer.current = window.setTimeout(() => {
                timer.current = null;
                if (propsOnChange) {
                    propsOnChange(rcColorPickerValue.color);
                }
            }, 250);
        },
        [propsOnChange]
    );

    const childProps = {
        className: 'color-picker',
        ref,
    };

    if (supportsColorInput) {
        // Input color field.
        return (
            <input
                onChange={inputOnChange}
                type="color"
                defaultValue={props.defaultValue}
                {...childProps}
            />
        );
    }

    // Fallback on react color picker.
    childProps.className += ' form-element-block';
    return (
        <RcColorPicker
            onChange={rcColorPickerOnChange}
            defaultColor={props.defaultValue}
            placement="topLeft"
            animation="slide-up"
            {...childProps}
        />
    );
};

ColorPicker.displayName = 'ColorPicker';

export default ColorPicker;
