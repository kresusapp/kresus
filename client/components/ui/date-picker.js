import React from 'react';
import PropTypes from 'prop-types';

import Flatpickr from 'react-flatpickr';
import moment from 'moment';

import { translate as $t } from '../../helpers';

class DatePickerWrapper extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            defaultDate: this.props.defaultValue ? moment(this.props.defaultValue).toDate() : null
        };

        this.handleChange = this.handleChange.bind(this);
        this.clear = this.clear.bind(this);
    }

    handleChange(dateArray) {
        let date = null;
        if (dateArray.length) {
            date = dateArray[0];
        }

        if (date !== this.state.defaultDate) {
        this.setState({
            defaultDate: date
        });

        if (date) {
            let actualDate = new Date(date.valueOf());
            actualDate.setMinutes(actualDate.getMinutes() - actualDate.getTimezoneOffset());
            this.props.onSelect(+actualDate);
        } else {
            this.props.onSelect(null);
        }
        }
    }

    clear() {
        this.handleChange([]);
    }

    render() {
        let minDate;
        if (this.props.minDate) {
            minDate = moment(this.props.minDate).toDate();
        }

        let maxDate;
        if (this.props.maxDate) {
            maxDate = moment(this.props.maxDate).toDate();
        }

        let options = {
            dateFormat: $t('client.datepicker.format'),
            minDate,
            maxDate
        };

        return (
            <div className="input-group">
                <Flatpickr
                    options={options}
                    id={this.props.id}
                    className="form-control"
                    onChange={this.handleChange}
                    value={this.state.defaultDate}
                />
                <span className="input-group-btn">
                    <button type="button" className="btn btn-secondary" onClick={this.clear}>
                        <i className="fa fa-times" aria-hidden="true" title="Clear"></i>
                        <span className="sr-only">X</span>
                    </button>
                </span>
            </div>
        );
    }
}

DatePickerWrapper.propTypes = {
    // Callback getting the new date, whenever it changes.
    onSelect: PropTypes.func.isRequired,

    // Initial date value.
    defaultValue: PropTypes.number,

    // Linter can't detect dynamic uses of proptypes.
    /* eslint react/no-unused-prop-types: 0 */

    // Minimum date that is allowed to select.
    minDate: PropTypes.number,

    // Maximum date that is allowed to select.
    maxDate: PropTypes.number,

    // An id to link the input to a label for instance.
    id: PropTypes.string
};

export default DatePickerWrapper;
