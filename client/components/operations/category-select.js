import React from 'react';
import PropTypes from 'prop-types';
import { createSelector } from 'reselect';
import { connect } from 'react-redux';

import { NONE_CATEGORY_ID } from '../../helpers';
import { actions, get } from '../../store';

const CategorySelect = props => {
    let style = props.borderColor ? { borderRight: `5px solid ${props.borderColor}` } : null;
    return (
        <select
          className="form-control btn-transparent"
          value={ props.selectedValue }
          style={ style }
          onChange={ props.onChange }>
            { props.categories }
        </select>
    );
};

function categoryToOption(cat) {
    return (
        <option
          key={ cat.id }
          value={ cat.id }>
            { cat.title }
        </option>
    );
}

const options = createSelector(
    state => get.categories(state),
    cats => {
        // Put "No category" on top of the list.
        return [
            cats.find(cat => cat.id === NONE_CATEGORY_ID),
            ...cats.filter(cat => cat.id !== NONE_CATEGORY_ID)
        ].map(categoryToOption);
    }
);

const Export = connect((state, props) => {
    let borderColor = props.selectedValue === NONE_CATEGORY_ID ?
                      null :
                      get.categoryById(state, props.selectedValue).color;
    return {
        categories: options(state),
        borderColor
    };
}, (dispatch, props) => {
    return {
        onChange(event) {
            actions.setOperationCategory(dispatch,
                                         props.operationId,
                                         event.target.value,
                                         props.selectedValue);
        }
    };
})(CategorySelect);

Export.propTypes = {
    // The operation unique identifier for which the category has to be selected.
    operationId: PropTypes.string.isRequired,

    // The selected category.
    selectedValue: PropTypes.string.isRequired
};

export default Export;
