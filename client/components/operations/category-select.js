import React from "react";
import PropTypes from "prop-types";

import ButtonSelect from "../ui/button-select";
import { NONE_CATEGORY_ID } from "../../helpers";

const CategorySelect = props => {
  let getThisCategoryId = () => props.operation.categoryId;

  let idToDescriptor = categoryId => {
    let cat = props.getCategory(categoryId);
    return [cat.title, categoryId !== NONE_CATEGORY_ID ? cat.color : null];
  };

  return (
    <ButtonSelect
      key={`category-select-operation${props.operation.id}`}
      operation={props.operation}
      optionsArray={props.categories}
      selectedId={getThisCategoryId}
      idToDescriptor={idToDescriptor}
      onSelectId={props.onSelectId}
    />
  );
};

CategorySelect.propTypes = {
  // The operation which own the category selector.
  operation: PropTypes.object.isRequired,

  // The list of categories.
  categories: PropTypes.array.isRequired,

  // A function mapping category id => category.
  getCategory: PropTypes.func.isRequired,

  // A function called on change.
  onSelectId: PropTypes.func.isRequired
};

export default CategorySelect;
