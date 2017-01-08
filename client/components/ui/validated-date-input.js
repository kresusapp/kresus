import React from 'react';

import DatePicker from './date-picker';

// A validated date input is form group for a date picker, with a special hint
// next to the date picker showing whether the date is valid or not.

class ValidatedDateInput extends React.Component {
    constructor(props) {
        super(props);
        this.state = { valid: false };
        this.refInput = node => {
            this.input = node;
        };
        this.handleSelect = this.handleSelect.bind(this);
    }

    clear() {
        this.input.clear();
        this.handleSelect(null);
    }

    handleSelect(date) {
        let hasDate = !!date;
        this.setState({ valid: hasDate }, () => {
            this.props.onChange(hasDate ? date : null);
        });
    }

    render() {
        let iconClass = this.state.valid ? 'fa-check' : 'fa-times';
        iconClass = `fa ${iconClass} form-control-feedback`;

        return (
            <div className="form-group has-feedback">
                <label
                  className="control-label"
                  htmlFor={ this.props.inputID } >
                    { this.props.label }
                </label>

                <DatePicker
                  id={ this.props.inputID }
                  required={ true }
                  onSelect={ this.handleSelect }
                  ref={ this.refInput }
                />

                <span
                  className={ iconClass }
                  aria-hidden="true"
                />
            </div>
        );
    }
}

ValidatedDateInput.propTypes = {
    // Callback receiving the validated date input.
    onChange: React.PropTypes.func.isRequired,

    // CSS id for the date picker.
    inputID: React.PropTypes.string.isRequired,

    // Description of the date picker (shown to the user).
    label: React.PropTypes.string.isRequired
};

export default ValidatedDateInput;
