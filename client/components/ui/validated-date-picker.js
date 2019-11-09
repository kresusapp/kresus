import React from 'react';
import PropTypes from 'prop-types';

import DatePicker from './date-picker';

// A validated date input is form group for a date picker, with a special hint
// next to the date picker showing whether the date is valid or not.

class ValidatedDatePicker extends React.Component {
    state = {
        valid: false
    };

    clear = () => {
        this.handleSelect(null);
    };

    handleSelect = date => {
        this.setState({ valid: !!date }, () => {
            this.props.onSelect(date);
        });
    };

    render() {
        let className = this.props.className || '';
        className += this.state.valid ? ' valid-date' : ' invalid-date';

        return (
            <DatePicker
                id={this.props.id}
                className={className}
                required={true}
                onSelect={this.handleSelect}
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
    value: PropTypes.number,

    // Extra class names to pass to the input
    className: PropTypes.string
};

export default ValidatedDatePicker;
