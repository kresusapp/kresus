import React from 'react';
import PropTypes from 'prop-types';

import DatePicker from './date-picker';

// A validated date input is form group for a date picker, with a special hint
// next to the date picker showing whether the date is valid or not.

class ValidatedDatePicker extends React.Component {
    constructor(props) {
        super(props);
        this.state = { valid: false };
        this.refInput = node => {
            this.input = node;
        };
        this.handleSelect = this.handleSelect.bind(this);
    }

    clear() {
        this.handleSelect(null);
    }

    handleSelect(date) {
        this.setState({ valid: !!date }, () => {
            this.props.onSelect(date);
        });
    }

    render() {
        let maybeValidClass = '';
        if (this.props.value) {
            maybeValidClass = this.state.valid ? 'valid-input' : 'invalid-input';
        }

        return (
            <DatePicker
                id={this.props.id}
                className={maybeValidClass}
                required={true}
                onSelect={this.handleSelect}
                ref={this.refInput}
                value={this.props.value}
            />
        );
    }
}

ValidatedDatePicker.propTypes = {
    // Callback receiving the validated date input.
    onSelect: PropTypes.func.isRequired,

    // CSS id for the date picker.
    id: PropTypes.string.isRequired,

    // Input value
    value: PropTypes.number
};

export default ValidatedDatePicker;
