import React from 'react';
import PropTypes from 'prop-types';
import { createSelector } from 'reselect';
import { connect } from 'react-redux';

import { translate as $t } from '../../helpers';
import { actions, get } from '../../store';

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

const Export = connect(
    state => {
        return {
            types: options(state)
        };
    },
    (dispatch, props) => {
        let onChange = props.onChange
            ? props.onChange
            : value => {
                  actions.setOperationType(dispatch, props.operationId, value, props.selectedValue);
              };
        return {
            onChange
        };
    }
)(TypeSelect);

Export.propTypes = {
    // The operation unique identifier for which the type has to be selected.
    operationId: PropTypes.string.isRequired,

    // The selected type.
    selectedValue: PropTypes.string.isRequired,

    // An optional callback to be called when the select valu chances to override
    // the one added in connect
    onChange: PropTypes.func
};

export default Export;
