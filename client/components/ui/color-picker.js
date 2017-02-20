/* globals Modernizr: false */
import React from 'react';

function convertRGBToHex(rgb) {
    let hexRed = rgb.r.toString(16).toUpperCase();
    if (hexRed.length < 2)
        hexRed += hexRed;

    let hexGreen = rgb.g.toString(16).toUpperCase();
    if (hexGreen.length < 2)
        hexGreen += hexGreen;

    let hexBlue = rgb.b.toString(16).toUpperCase();
    if (hexBlue.length < 2)
        hexBlue += hexBlue;

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
    let ranges = [
        [100, 255],
        [50, 200],
        [10, 100]
    ];

    return convertRGBToHex({
        r: generatePrimaryColor(ranges),
        g: generatePrimaryColor(ranges),
        b: generatePrimaryColor(ranges)
    });
}

class ColorPicker extends React.Component {

    constructor(props) {
        super(props);

        this.handleChange = this.handleChange.bind(this);
        this.timer = null;
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

    dom() {
        return this.refs.picker;
    }

    getValue() {
        return this.dom().value;
    }

    componentDidMount() {
        if (!Modernizr.inputtypes.color) {
            let config = {
                change: () => this.handleChange()
            };
            $(this.dom()).minicolors(config).parent().css('width', '100%');
        }
    }

    componentWillUnmount() {
        if (!Modernizr.inputtypes.color)
            $(this.dom()).minicolors('destroy');
    }

    render() {
        return (
            <input
              type={ Modernizr.inputtypes.color ? 'color' : 'hidden' }
              className="form-control category-color"
              defaultValue={ this.props.defaultValue || generateColor() }
              onChange={ this.handleChange }
              ref="picker"
            />);
    }
}

ColorPicker.propTypes = {
    // Callback getting the new color whenever the selected one changes.
    onChange: React.PropTypes.func.isRequired,

    // The initial color selected.
    defaultValue: React.PropTypes.string
};

export default ColorPicker;
