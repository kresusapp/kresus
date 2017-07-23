import React from 'react';
import PropTypes from 'prop-types';
import { createSelector } from 'reselect';
import { connect } from 'react-redux';

import { get, actions } from '../../store';

const CategorySelect = props => {
    let { color, options, categoryId, makeOnChange } = props;
    const onChange = makeOnChange(categoryId);
    let borderColor;
    if (color) {
        borderColor = { borderRight: `5px solid ${color}` };
    }

    return (
        <select
          className="form-control btn-transparent"
          onChange={ onChange }
          style={ borderColor }
          value={ categoryId }>
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
    let { categoryId } = get.operationById(state, props.operationId);
    let { color } = get.categoryById(state, categoryId);
    return {
        options: categoriesOptionsSelector(state),
        categoryId,
        color
    };
}, (dispatch, props) => {
    return {
        makeOnChange: catId => event => (
            actions.setOperationCategory(dispatch, props.operationId, event.target.value, catId)
        )
    };
})(CategorySelect);

Export.propTypes = {
    // The operation id which owns the category selector.
    operationId: PropTypes.string.isRequired
};

export default Export;
