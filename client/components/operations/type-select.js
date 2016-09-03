import React from 'react';

import { assertHas, translate as $t } from '../../helpers';

import ButtonSelect from '../ui/button-select';

import OperationTypes from '../../../shared/operation-types.json';

for (let type of OperationTypes) {
    type.id = type.name;
}

export default props => {
    assertHas(props, 'operation');
    assertHas(props, 'onSelectId');

    let getThisType = () => props.operation.type;
    let idToLabel = type => $t(`client.${type}`);

    return (
        <ButtonSelect
          key={ `operation-type-select-operation-${props.operation.id}` }
          optionsArray={ OperationTypes }
          selectedId={ getThisType }
          idToLabel={ idToLabel }
          onSelectId={ props.onSelectId }
        />
    );
};
