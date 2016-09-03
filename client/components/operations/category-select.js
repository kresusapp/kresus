import React from 'react';

import { assertHas } from '../../helpers';

import ButtonSelect from '../ui/button-select';

export default props => {
    assertHas(props, 'operation');
    assertHas(props, 'categories');
    assertHas(props, 'getCategoryTitle');
    assertHas(props, 'onSelectId');

    let getThisCategoryId = () => props.operation.categoryId;

    return (
        <ButtonSelect
          key={ `category-select-operation${props.operation.id}` }
          operation={ props.operation }
          optionsArray={ props.categories }
          selectedId={ getThisCategoryId }
          idToLabel={ props.getCategoryTitle }
          onSelectId={ props.onSelectId }
        />
    );
};
