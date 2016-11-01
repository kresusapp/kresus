import React from 'react';

import ButtonSelect from '../ui/button-select';

const CategorySelect = props => {
    let getThisCategoryId = () => props.operation.categoryId;

    return (
        <ButtonSelect
          key={ `category-select-operation${props.operation.id}` }
          operation={ props.operation }
          optionsArray={ props.categories }
          selectedId={ getThisCategoryId }
          idToLabel={ props.getCategoryTitle }
          colorToLabel={ props.getCategoryColor }
          onSelectId={ props.onSelectId }
        />
    );
};

CategorySelect.propTypes = {
    // The operation which own the category selector
    operation: React.PropTypes.object.isRequired,

    // The list of categories
    categories: React.PropTypes.array.isRequired,

    // A function mapping category id => title.
    getCategoryTitle: React.PropTypes.func.isRequired,

    // A function mapping category id => color.
    getCategoryColor: React.PropTypes.func.isRequired,

    // A function called on change
    onSelectId: React.PropTypes.func.isRequired
};

export default CategorySelect;
