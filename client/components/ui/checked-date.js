import React from 'react';

import DatePicker from './date-picker';

class ValidableInputDate extends React.Component {
    constructor(props) {
        super(props);
        this.state = { valid: false };
        this.handleSelect = this.handleSelect.bind(this);
    }

    clear() {
        this.refs.inputdate.clear();
        this.handleSelect('');
    }

    showValidity() {
        if (this.state.valid) {
            return (<span
              className="fa fa-check form-control-feedback"
              aria-hidden="true"
            />);
        }
        return (<span
          className="fa fa-times form-control-feedback"
          aria-hidden="true"
        />);
    }

    handleSelect(date) {
        let hasDate = !!date;
        this.setState({ valid: hasDate }, this.props.returnInputValue(hasDate ? date : null));
    }

    render() {
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
                  ref="inputdate"
                />
                { this.showValidity() }
            </div>
        );
    }
}

ValidableInputDate.propTypes = {
    // Callback receiving the validated date input.
    returnInputValue: React.PropTypes.func.isRequired,

    // CSS id for the date picker.
    inputID: React.PropTypes.string.isRequired,

    // Description of the date picker (shown to the user).
    label: React.PropTypes.string.isRequired
};

export default ValidableInputDate;
