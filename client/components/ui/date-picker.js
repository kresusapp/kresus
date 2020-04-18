import React from 'react';
import PropTypes from 'prop-types';

import { connect } from 'react-redux';

import Flatpickr from 'react-flatpickr';
import moment from 'moment';

import { get } from '../../store';

import { translate as $t } from '../../helpers';

class DatePickerWrapper extends React.PureComponent {
    handleChange = dateArray => {
        if (dateArray.length) {
            const newValue = dateArray[0];
            if (!this.props.value || this.props.value.getTime() !== newValue.getTime()) {
                this.props.onSelect(newValue);
            }
        } else if (this.props.value !== null) {
            this.props.onSelect(null);
        }
    };

    handleClear = () => {
        this.handleChange([]);
    };

    render() {
        let value = this.props.value || null;

        let placeholder = this.props.placeholder
            ? this.props.placeholder
            : moment().format($t('client.datepicker.moment_format'));

        let maybeClassName = this.props.className ? this.props.className : '';

        const minDate = this.props.minDate || null;

        const maxDate = this.props.maxDate || null;

        let options = {
            dateFormat: $t('client.datepicker.flatpickr_format'),
            locale: this.props.locale,
            allowInput: true,
            errorHandler: () => {
                // Do nothing when errors are thrown due to invalid input.
            },
            minDate,
            maxDate
        };

        return (
            <div className={`input-with-addon ${maybeClassName}`}>
                <Flatpickr
                    options={options}
                    id={this.props.id}
                    onChange={this.handleChange}
                    value={value}
                    placeholder={placeholder}
                />
                <button
                    type="button"
                    className="btn"
                    onClick={this.handleClear}
                    title={$t('client.search.clear')}>
                    <span className="screen-reader-text">X</span>
                    <i className="fa fa-times" aria-hidden="true" />
                </button>
            </div>
        );
    }
}

DatePickerWrapper.propTypes = {
    // Callback getting the new date, whenever it changes.
    onSelect: PropTypes.func.isRequired,

    // Initial date value.
    value: PropTypes.instanceOf(Date),

    // Linter can't detect dynamic uses of proptypes.
    /* eslint react/no-unused-prop-types: 0 */

    // Minimum date that is allowed to select.
    minDate: PropTypes.instanceOf(Date),

    // Maximum date that is allowed to select.
    maxDate: PropTypes.instanceOf(Date),

    // An id to link the input to a label for instance.
    id: PropTypes.string,

    // Extra class names to pass to the input.
    className: PropTypes.string
};

export default connect(state => {
    return {
        locale: get.setting(state, 'locale')
    };
})(DatePickerWrapper);
