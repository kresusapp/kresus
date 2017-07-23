import React from 'react';
import PropTypes from 'prop-types';
import { createSelector } from 'reselect';
import { connect } from 'react-redux';

import { get, actions } from '../../store';
import { translate as $t } from '../../helpers';

const TypeSelect = props => {
    let { options, type, makeOnChange } = props;
    const onChange = makeOnChange(type);
    return (
        <select
          className="form-control btn-transparent"
          onChange={ onChange }
          value={ type }>
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
    let { type } = get.operationById(state, props.operationId);
    return {
        options: typesOptionsSelector(state),
        type
    };
}, (dispatch, props) => {
    return {
        makeOnChange: formerType => event => (
            actions.setOperationType(dispatch, props.operationId, event.target.value, formerType)
        )
    };
})(TypeSelect);

Export.propTypes = {
    // Operation id for which we want to change the type.
    operationId: PropTypes.string.isRequired,
};

export default Export;
