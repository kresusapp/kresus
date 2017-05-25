import React from 'react';

import { translate as $t } from '../../helpers';

import DatePicker from 'react-datepicker';
import moment from 'moment';

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

        this.props.onSelect(date ? date.valueOf() : null);
    }

    clear() {
        this.setState({
            defaultDate: null
        });
    }

    render() {
        let minDate;
        if (this.props.minDate) {
            minDate = moment(this.props.minDate);
        }

        let maxDate;
        if (this.props.maxDate) {
            maxDate = moment(this.props.maxDate);
        }

        return (
            <DatePicker
              dateFormat="YYYY/MM/DD"
              selected={ this.state.defaultDate }
              minDate={ minDate }
              maxDate={ maxDate }
              className="form-control"
              onChange={ this.handleChange }
              isClearable={ true }
              todayButton={ $t('client.datepicker.today') }
            />
        );
    }
}

DatePickerWrapper.propTypes = {
    // Callback getting the new date, whenever it changes.
    onSelect: React.PropTypes.func.isRequired,

    // Initial date value.
    defaultValue: React.PropTypes.number,

    // Linter can't detect dynamic uses of proptypes.
    /* eslint react/no-unused-prop-types: 0 */

    // Minimum date that is allowed to select.
    minDate: React.PropTypes.number,

    // Maximum date that is allowed to select.
    maxDate: React.PropTypes.number
};

export default DatePickerWrapper;
