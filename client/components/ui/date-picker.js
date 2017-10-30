import React from 'react';
import PropTypes from 'prop-types';

import { connect } from 'react-redux';

import Flatpickr from 'react-flatpickr';
import moment from 'moment';

import { get } from '../../store';

import { translate as $t } from '../../helpers';

class DatePickerWrapper extends React.PureComponent {
    constructor(props) {
        super(props);

        this.handleChange = this.handleChange.bind(this);
        this.handleClear = this.clear.bind(this);
    }

    handleChange(dateArray) {
        let date = null;
        if (dateArray.length) {
            date = dateArray[0];
        }

        if (date) {
            let actualDate = new Date(date.valueOf());
            actualDate.setMinutes(actualDate.getMinutes() - actualDate.getTimezoneOffset());
            this.props.onSelect(+actualDate);
        } else {
            this.props.onSelect(null);
        }
    }

    clear() {
        this.handleChange([]);
    }

    render() {
        let value = this.props.value ? moment(this.props.value).toDate() : null;

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

        if (this.props.locale !== 'en') {
            // Set locale if needed, "en" does not need it as it is the default
            // locale.
            options.locale = this.props.locale;
        }

        return (
            <div className="input-group">
                <Flatpickr
                    options={options}
                    id={this.props.id}
                    className="form-control"
                    onChange={this.handleChange}
                    value={value}
                />
                <span className="input-group-btn">
                    <button type="button" className="btn btn-secondary" onClick={this.handleClear}>
                        <i
                            className="fa fa-times"
                            aria-hidden="true"
                            title={$t('client.search.clear')}
                        />
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
    value: PropTypes.number,

    // Linter can't detect dynamic uses of proptypes.
    /* eslint react/no-unused-prop-types: 0 */

    // Minimum date that is allowed to select.
    minDate: PropTypes.number,

    // Maximum date that is allowed to select.
    maxDate: PropTypes.number,

    // An id to link the input to a label for instance.
    id: PropTypes.string
};

export default connect(state => {
    return {
        locale: get.setting(state, 'locale')
    };
})(DatePickerWrapper);
