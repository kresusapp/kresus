import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import { get, actions } from '../../../store';

import DatePicker from '../../ui/date-picker';

const MaxDatePicker = props => {
    return (
        <DatePicker
          onSelect={ props.handleSelect }
          defaultValue={ props.defaultValue }
          minDate={ props.minDate }
          id={ props.id }
          ref={ props.refDatepicker }
        />
    );
};

const Export = connect(state => {
    return {
        defaultValue: get.searchFields(state).dateHigh,
        minDate: get.searchFields(state).dateLow
    };
}, dispatch => {
    return {
        handleSelect(dateHigh) {
            actions.setSearchField(dispatch, 'dateHigh', dateHigh);
        }
    };
})(MaxDatePicker);

Export.propTypes = {
    // A string to link the input to a label for exemple.
    id: PropTypes.string,
    // A call back to access the Datepicker's methods
    refDatepicker: PropTypes.func
};

export default Export;
