import React from 'react';
import PropTypes from 'prop-types';
import { createSelector } from 'reselect';
import { connect } from 'react-redux';

import { get, actions } from '../../store';

const CategorySelect = props => {
    let { color, options, selectedId, onChange } = props;
    let borderColor;
    if (color) {
        borderColor = { borderRight: `5px solid ${color}` };
    }

    return (
        <select
          className="form-control btn-transparent"
          onChange={ onChange }
          style={ borderColor }
          defaultValue={ selectedId }>
            { options }
        </select>
    );
};

// Memoize the category options so that they are only computed once.
const categoriesOptionsSelector = createSelector(
    state => get.categories(state),
    categories => categories.map(({ id, title }) => (
        <option
          key={ id }
          value={ id }>
            { title }
        </option>
    ))
);

const Export = connect((state, props) => {
    let { categoryId } = props.operation;
    let { color } = get.categoryById(state, categoryId);
    return {
        options: categoriesOptionsSelector(state),
        selectedId: categoryId,
        color
    };
}, (dispatch, props) => {
    return {
        onChange: event => (
            actions.setOperationCategory(dispatch, props.operation, event.target.value)
        )
    };
})(CategorySelect);

Export.propTypes = {
    // The operation which owns the category selector.
    operation: PropTypes.object.isRequired
};

export default Export;
