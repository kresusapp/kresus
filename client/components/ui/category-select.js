import React from 'react';

import { store } from '../../store';
import { has, debug } from '../../helpers';

import ButtonSelect from './button-select';

export default props => {
    let getThisCategoryId = () => props.operation.categoryId;
    let getCategoryTitle = id => store.getCategoryFromId(id).title;
    return (
        <ButtonSelect
          operation={ props.operation }
          optionsArray={ store.getCategories() }
          selectedId={ getThisCategoryId }
          idToLabel={ getCategoryTitle }
          onSelectId={ props.onSelectId.bind(this) }
        />
    );
};
