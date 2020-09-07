import React, { useRef } from 'react';
import PropTypes from 'prop-types';

import RcColorPicker from 'rc-color-picker';

import 'rc-color-picker/assets/index.css';
import './color-picker.css';

const supportsColorInput = (() => {
    if (typeof document === 'undefined') {
        // Testing support!
        return false;
    }
    let input = document.createElement('input');
    input.setAttribute('type', 'color');
    return input.type === 'color';
})();

const ColorPicker = props => {
    let timer = null;
    let refInput = useRef();

    let onChange = rcColorPickerValue => {
        if (timer) {
            clearTimeout(timer);
        }

        timer = setTimeout(() => {
            timer = null;
            let newColor = supportsColorInput ? refInput.current.value : rcColorPickerValue.color;
            if (props.onChange) {
                props.onChange(newColor);
            }
        }, 250);
    };

    const childProps = {
        className: 'color-picker',
        onChange,
        ref: refInput,
    };

    if (supportsColorInput) {
        // Input color field.
        return <input type="color" defaultValue={props.defaultValue} {...childProps} />;
    }

    // Fallback on react color picker.
    childProps.className += ' form-element-block';
    return (
        <RcColorPicker
            defaultColor={props.defaultValue}
            placement="topLeft"
            animation="slide-up"
            {...childProps}
        />
    );
};

ColorPicker.propTypes = {
    // Callback getting the new color whenever the selected one changes.
    onChange: PropTypes.func.isRequired,

    // The initial color selected.
    defaultValue: PropTypes.string,
};

export default ColorPicker;
