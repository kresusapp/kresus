import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';

import { get, actions } from '../../store';
import { translate as $t } from '../../helpers';

import ButtonSelect from '../ui/button-select';

const TypeSelect = props => {
    return (
        <ButtonSelect
          optionsArray={ props.types }
          selectedId={ props.selectedId }
          idToDescriptor={ props.idToDescriptor }
          onSelectId={ props.onSelectId }
        />
    );
};

const descriptorSelector = createSelector(
    state => get.types(state),
    types => types.reduce((map, type) => {
        map[type.id] = { label: $t(`client.${type.name}`) };
        return map;
    }, {})
);

const Export = connect(state => {
    return {
        types: get.types(state),
        idToDescriptor: descriptorSelector(state),
    };
}, (dispatch, props) => {
    return {
        onSelectId: type => (
            actions.setOperationType(dispatch, props.operationId, props.selectedId, type)
        )
    };
})(TypeSelect);

Export.propTypes = {
    selectedId: PropTypes.string.isRequired,
    // A function called on change.
    operationId: PropTypes.string.isRequired,
};

export default Export;
