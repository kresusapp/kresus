import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { get, actions } from '../../../store';
import { translate as $t, NONE_CATEGORY_ID } from '../../../helpers';

const SearchCategorySelect = props => {
    let { defaultValue, categories, handleChange } = props;

    let noneCategory = categories.find(cat => cat.id === NONE_CATEGORY_ID);
    let newCategories = categories.filter(cat => cat.id !== NONE_CATEGORY_ID);

    let options = [
        <option
          key="_"
          value="">
            { $t('client.search.any_category') }
        </option>,
        <option
          key={ noneCategory.id }
          value={ noneCategory.id }>
            { noneCategory.title }
        </option>,
    ].concat(newCategories.map(cat => (
        <option
          key={ cat.id }
          value={ cat.id }>
            { cat.title }
        </option>
    )));

    return (
        <select
          className="form-control"
          id={ props.id }
          defaultValue={ defaultValue }
          onChange={ handleChange }>
            { options }
        </select>
    );
};

const Export = connect(state => {
    return {
        defaultValue: get.searchFields(state).categoryId,
        categories: get.categories(state)
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
