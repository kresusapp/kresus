import React from 'react';

import ButtonSelect from '../ui/button-select';
import { NONE_CATEGORY_ID } from '../../helpers';

const CategorySelect = props => {
    let getThisCategoryId = () => props.operation.categoryId;
    let idToLabel = categoryId => props.getCategory(categoryId).title;
    let idToColor = categoryId => {
        return (categoryId !== NONE_CATEGORY_ID) ? props.getCategory(categoryId).color : null;
    };

    return (
        <ButtonSelect
          key={ `category-select-operation${props.operation.id}` }
          operation={ props.operation }
          optionsArray={ props.categories }
          selectedId={ getThisCategoryId }
          idToLabel={ idToLabel }
          idToColor={ idToColor }
          onSelectId={ props.onSelectId }
        />
    );
};

CategorySelect.propTypes = {
    // The operation which own the category selector
    operation: React.PropTypes.object.isRequired,

    // The list of categories
    categories: React.PropTypes.array.isRequired,

    // A function mapping category id => category
    getCategory: React.PropTypes.func.isRequired,

    // A function called on change
    onSelectId: React.PropTypes.func.isRequired
};

export default CategorySelect;
