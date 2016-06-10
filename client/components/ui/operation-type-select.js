import React from 'react';

import { store } from '../../store';
import { has, debug } from '../../helpers';

import ButtonSelect from './button-select';

export default props => {
    let getThisTypeId = () => props.operation.operationTypeID;
    let getTypeLabel = id => store.operationTypeToLabel(id);
    return (
        <ButtonSelect
          operation={ props.operation }
          optionsArray={ store.getOperationTypes() }
          selectedId={ getThisTypeId }
          idToLabel={ getTypeLabel }
          onSelectId={ props.onSelectId.bind(this) }
        />
    );
};
