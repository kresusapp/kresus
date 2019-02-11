import React from 'react';
import PropTypes from 'prop-types';

import 'rc-color-picker/assets/index.css';
import RcColorPicker from 'rc-color-picker';

const supportsColorInput = (() => {
    let input = document.createElement('input');
    input.setAttribute('type', 'color');
    return input.type === 'color';
})();

class ColorPicker extends React.Component {
    timer = null;
    refInput = React.createRef();

    handleChange = () => {
        if (this.timer) {
            clearTimeout(this.timer);
        }

        this.timer = setTimeout(() => {
            this.timer = null;
            let newColor = supportsColorInput
                ? this.refInput.current.value
                : this.refInput.current.state.color;
            if (this.props.onChange) {
                this.props.onChange(newColor);
            }
        }, 250);
    };

    render() {
        const props = {
            className: 'category-color',
            onChange: this.handleChange,
            ref: this.refInput
        };

        if (supportsColorInput) {
            // Input color field
            return <input type="color" defaultValue={this.props.defaultValue} {...props} />;
        }

        props.className += ' form-element-block';

        // Fallback on react color picker
        return (
            <RcColorPicker
                defaultColor={this.props.defaultValue}
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
