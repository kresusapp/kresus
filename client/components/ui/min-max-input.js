import React from 'react';
import PropTypes from 'prop-types';

import { Range } from 'rc-slider';

class MinMaxInput extends React.Component {
    state = {
        lowValue:
            typeof this.props.low === 'number'
                ? Math.max(this.props.low, this.props.min)
                : this.props.min,
        tempLowValue:
            typeof this.props.low === 'number'
                ? Math.max(this.props.low, this.props.min)
                : this.props.min,
        highValue:
            typeof this.props.high === 'number'
                ? Math.min(this.props.high, this.props.max)
                : this.props.max,
        tempHighValue:
            typeof this.props.high === 'number'
                ? Math.min(this.props.high, this.props.max)
                : this.props.max,
    };

    handleInputChange = event => {
        let val = event.target.value;
        if (val !== '-' && val !== '') {
            val = Number.parseFloat(val);
            if (Number.isNaN(val)) {
                return;
            }
        }

        let type = event.target.dataset.type;
        if (type === 'low') {
            this.setState({ tempLowValue: val });
        } else if (type === 'high') {
            this.setState({ tempHighValue: val });
        }
    };

    handleLowValidation = event => {
        // When the user leaves the input (on blur) or validates (by hitting Enter), check the
        // temporary (in edition) value or default to the current value and trigger an onChange
        // event.
        if (
            this.state.tempLowValue !== '-' &&
            (event.type === 'blur' || (event.type === 'keypress' && event.key === 'Enter'))
        ) {
            let val = this.state.tempLowValue;
            if (val === '') {
                // Restore the current value.
                val = this.state.lowValue;
            }

            val = Math.min(val, this.state.highValue);

            const hasChanged = val !== this.state.lowValue;
            this.setState({ lowValue: val, tempLowValue: val }, () => {
                if (hasChanged) {
                    this.props.onChange([this.state.lowValue, this.state.highValue]);
                }
            });
        }
    };

    handleHighValidation = event => {
        // When the user leaves the input (on blur) or validates (by hitting Enter), check the
        // temporary (in edition) value or default to the current value and trigger an onChange
        // event.
        if (
            this.state.tempHighValue !== '-' &&
            (event.type === 'blur' || (event.type === 'keypress' && event.key === 'Enter'))
        ) {
            let val = this.state.tempHighValue;

            if (val === '') {
                // Restore the current value.
                val = this.state.highValue;
            }

            val = Math.max(val, this.state.lowValue);

            const hasChanged = val !== this.state.highValue;
            this.setState({ highValue: val, tempHighValue: val }, () => {
                if (hasChanged) {
                    this.props.onChange([this.state.lowValue, this.state.highValue]);
                }
            });
        }
    };

    handleSliderChange = values => {
        const lowValue = values[0];
        const highValue = values[1];
        const hasChanged = lowValue !== this.state.lowValue || highValue !== this.state.highValue;

        this.setState(
            {
                lowValue,
                tempLowValue: lowValue,
                highValue,
                tempHighValue: highValue,
            },
            () => {
                if (hasChanged) {
                    this.props.onChange([this.state.lowValue, this.state.highValue]);
                }
            }
        );
    };

    reset() {
        this.setState({
            lowValue: this.props.min,
            tempLowValue: this.props.min,
            highValue: this.props.max,
            tempHighValue: this.props.max,
        });
    }

    render() {
        return (
            <div className="min-max-input">
                <input
                    type="number"
                    min={this.props.min}
                    max={this.state.highValue}
                    data-type="low"
                    value={this.state.tempLowValue}
                    onChange={this.handleInputChange}
                    onBlur={this.handleLowValidation}
                    onKeyPress={this.handleLowValidation}
                />
                <Range
                    allowCross={false}
                    min={this.props.min}
                    max={this.props.max}
                    value={[this.state.lowValue, this.state.highValue]}
                    onChange={this.handleSliderChange}
                />
                <input
                    type="number"
                    min={this.state.lowValue}
                    max={this.props.max}
                    data-type="high"
                    value={this.state.tempHighValue}
                    onChange={this.handleInputChange}
                    onBlur={this.handleHighValidation}
                    onKeyPress={this.handleHighValidation}
                />
            </div>
        );
    }
}

MinMaxInput.propTypes = {
    // A function called when the input changes.
    onChange: PropTypes.func,

    // The minimum value of the input.
    min: PropTypes.number.isRequired,

    // The maximum value of the input.
    max: PropTypes.number.isRequired,

    // The current low value.
    low: PropTypes.number,

    // The current high value.
    high: PropTypes.number,
};

export default MinMaxInput;
