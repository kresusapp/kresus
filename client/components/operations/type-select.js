import React from 'react';
import PropTypes from 'prop-types';
import { createSelector } from 'reselect';
import { connect } from 'react-redux';

import { translate as $t } from '../../helpers';
import { get } from '../../store';

const TypeSelect = props => {
    const onChange = event => props.onChange(event.target.value);
    return (
        <select
            className="form-control btn-transparent"
            value={props.selectedValue}
            onChange={onChange}>
            {props.types}
        </select>
    );
};

const options = createSelector(
    state => get.types(state),
    types => {
        return types.map(type => (
            <option key={`operation-type-select-operation-${type.id}`} value={type.name}>
                {$t(`client.${type.name}`)}
            </option>
        ));
    }
);

const Export = connect(state => {
    return {
        types: options(state)
    };
})(TypeSelect);

Export.propTypes = {
    // The selected type.
    selectedValue: PropTypes.string.isRequired,

    // A callback to be called when the select value changes.
    onChange: PropTypes.func.isRequired
};

export default Export;
