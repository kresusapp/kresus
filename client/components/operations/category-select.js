import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import ButtonSelect from '../ui/button-select';

import { get } from '../../store';

const CategorySelect = props => {
    return (
        <ButtonSelect
          optionsArray={ props.categoriesId }
          selectedId={ props.selectedCategoryId }
          mapIdToDescriptor={ props.mapIdToDescriptor }
          onSelectId={ props.onSelectId }
        />
    );
};

CategorySelect.propTypes = {
    // The selected category id.
    selectedCategoryId: PropTypes.string.isRequired,

    // A function called on change.
    onSelectId: PropTypes.func.isRequired
};

export default connect(state => {
    return {
        categoriesId: get.categoriesIds(state),
        mapIdToDescriptor: get.categoryMapAllIdToDescriptor(state)
    };
})(CategorySelect);
