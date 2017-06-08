import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';

import { get, actions } from '../../../store';
import { translate as $t, NONE_CATEGORY_ID } from '../../../helpers';

const SearchCategorySelect = props => {
    return (
        <select
          className="form-control"
          id={ props.id }
          defaultValue={ props.defaultValue }
          onChange={ props.handleChange }>
            { props.options }
        </select>
    );
};

const categoriesOptionsSelector = createSelector(
    state => get.categories(state),
    categories => {
        let noneCategory = categories.find(cat => cat.id === NONE_CATEGORY_ID);
        let newCategories = [noneCategory].concat(categories.filter(cat =>
            cat.id !== NONE_CATEGORY_ID
        ));
        return [
            <option
              key="_"
              value="">
                { $t('client.search.any_category') }
            </option>
        ].concat(newCategories.map(cat => (
            <option
              key={ cat.id }
              value={ cat.id }>
                { cat.title }
            </option>
        )));
    }
);

const Export = connect(state => {
    return {
        defaultValue: get.searchFields(state).categoryId,
        options: categoriesOptionsSelector(state)
    };
}, dispatch => {
    return {
        handleChange(event) {
            actions.setSearchField(dispatch, 'categoryId', event.target.value);
        }
    };
})(SearchCategorySelect);

Export.propTypes = {
    // A string to link the input to a label for exemple.
    id: PropTypes.string
};

export default Export;
