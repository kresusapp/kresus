import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';

import { get, actions } from '../../store';

import ButtonSelect from '../ui/button-select';

const CategorySelect = props => {
    return (
        <ButtonSelect
          optionsArray={ props.categories }
          selectedId={ props.selectedId }
          idToDescriptor={ props.idToDescriptor }
          onSelectId={ props.onSelectId }
        />
    );
};

const descriptorSelector = createSelector(
    state => get.categories(state),
    categories => categories.reduce((map, cat) => {
        map[cat.id] = { label: cat.title, color: cat.color };
        return map;
    }, {})
);

const Export = connect(state => {
    return {
        categories: get.categories(state),
        idToDescriptor: descriptorSelector(state),
    };
}, (dispatch, props) => {
    return {
        onSelectId: category => (
            actions.setOperationCategory(dispatch, props.operationId, props.selectedId, category)
        )
    };
})(CategorySelect);

Export.propTypes = {
    selectedId: PropTypes.string.isRequired,
    // A function called on change.
    operationId: PropTypes.string.isRequired,
};

export default Export;
