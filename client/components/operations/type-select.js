import React from 'react';
import PropTypes from 'prop-types';
import { createSelector } from 'reselect';
import { connect } from 'react-redux';

import { get, actions } from '../../store';
import { translate as $t } from '../../helpers';

const TypeSelect = props => {
    let { options, selectedId, onChange } = props;
    return (
        <select
          className="form-control btn-transparent"
          onChange={ onChange }
          defaultValue={ selectedId }>
            { options }
        </select>
    );
};

// Memoize the type options so that they are only computed once.
const typesOptionsSelector = createSelector(
    state => get.types(state),
    types => types.map(({ id, name }) => (
        <option
          key={ id }
          value={ id }>
            { $t(`client.${name}`) }
        </option>
    ))
);

const Export = connect((state, props) => {
    let { type } = props.operation;
    return {
        options: typesOptionsSelector(state),
        selectedId: type
    };
}, (dispatch, props) => {
    return {
        onChange: event => (
            actions.setOperationType(dispatch, props.operation, event.target.value)
        )
    };
})(TypeSelect);

Export.propTypes = {
    // Operation for which we want to change the type.
    operation: PropTypes.object.isRequired,
};

export default Export;
