import React from 'react';
import PropTypes from 'prop-types';

import 'rc-color-picker/assets/index.css';
import RcColorPicker from 'rc-color-picker';

function convertRGBToHex(rgb) {
    let hexRed = rgb.r.toString(16).toUpperCase();
    if (hexRed.length < 2) {
        hexRed += hexRed;
    }

    let hexGreen = rgb.g.toString(16).toUpperCase();
    if (hexGreen.length < 2) {
        hexGreen += hexGreen;
    }

    let hexBlue = rgb.b.toString(16).toUpperCase();
    if (hexBlue.length < 2) {
        hexBlue += hexBlue;
    }

    return `#${hexRed}${hexGreen}${hexBlue}`;
}

function generatePrimaryColor(ranges) {
    // Select random range and remove
    let r = ranges.splice(Math.floor(Math.random() * ranges.length), 1)[0];

    // Pick a random number from within the range
    let [low, high] = r;

    return Math.floor(Math.random() * (high - low)) + low;
}

function generateColor() {
    // Ranges of bright colors
    let ranges = [[100, 255], [50, 200], [10, 100]];

    return convertRGBToHex({
        r: generatePrimaryColor(ranges),
        g: generatePrimaryColor(ranges),
        b: generatePrimaryColor(ranges)
    });
}

const supportsColorInput = (() => {
    let input = document.createElement('input');
    input.setAttribute('type', 'color');
    return input.type === 'color';
})();

class ColorPicker extends React.Component {
    constructor(props) {
        super(props);

        this.handleChange = this.handleChange.bind(this);
        this.timer = null;
        this.input = null;
    }

    handleChange(e) {
        if (this.timer) {
            clearTimeout(this.timer);
        }

        this.timer = setTimeout(() => {
            this.timer = null;

            if (this.props.onChange) {
                this.props.onChange(e);
            }
        }, 250);
    }

    getValue() {
        if (supportsColorInput) {
            return this.input.value;
        }
        // Fallback with rc-color-picker
        return this.input.state.color;
    }

    render() {
        let refInput = input => {
            this.input = input;
        };

        const props = {
            className: 'category-color',
            onChange: this.handleChange,
            ref: refInput
        };

        if (supportsColorInput) {
            // Input color field
            return (
                <input
                    type="color"
                    defaultValue={this.props.defaultValue || generateColor()}
                    {...props}
                />
            );
        }
        // Fallback on react color picker
        return (
            <RcColorPicker
                defaultColor={this.props.defaultValue || generateColor()}
                placement="topLeft"
                animation="slide-up"
                {...props}
            />
        );
    }
}

ColorPicker.propTypes = {
    // Callback getting the new color whenever the selected one changes.
    onChange: PropTypes.func.isRequired,

    // The initial color selected.
    defaultValue: PropTypes.string
};

export default ColorPicker;
