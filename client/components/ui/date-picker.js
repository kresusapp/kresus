import React from 'react';
import PropTypes from 'prop-types';

import DatePicker from 'react-datepicker';
import moment from 'moment';

import { translate as $t } from '../../helpers';

class DatePickerWrapper extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            defaultDate: this.props.defaultValue ? moment(this.props.defaultValue) : null
        };

        this.handleChange = this.handleChange.bind(this);
    }

    handleChange(date) {
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

    clear() {
        this.setState({
            defaultDate: null
        });
    }

    render() {
        let todayButton = $t('client.datepicker.today');
        let today = moment().utc().hours(0).minutes(0).seconds(0).milliseconds(0);

        let minDate;
        if (this.props.minDate) {
            minDate = moment(this.props.minDate);
            if (minDate.isAfter(today)) {
                todayButton = null;
            }
        }

        let maxDate;
        if (this.props.maxDate) {
            maxDate = moment(this.props.maxDate);
            if (maxDate.isBefore(today)) {
                todayButton = null;
            }
        }

        return (
            <DatePicker
              dateFormat={ $t('client.datepicker.format') }
              selected={ this.state.defaultDate }
              minDate={ minDate }
              maxDate={ maxDate }
              className="form-control"
              onChange={ this.handleChange }
              isClearable={ true }
              todayButton={ todayButton }
            />
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
    maxDate: PropTypes.number
};

export default DatePickerWrapper;
