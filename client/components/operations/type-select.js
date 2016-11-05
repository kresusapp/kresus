import React from 'react';

import { assertHas, translate as $t } from '../../helpers';

import ButtonSelect from '../ui/button-select';

export default props => {
    assertHas(props, 'operation');
    assertHas(props, 'onSelectId');
    assertHas(props, 'types');

    let getThisType = () => props.operation.type;
    let idToDescriptor = type => [$t(`client.${type}`)];

    return (
        <ButtonSelect
          key={ `operation-type-select-operation-${props.operation.id}` }
          optionsArray={ props.types }
          selectedId={ getThisType }
          idToDescriptor={ idToDescriptor }
          onSelectId={ props.onSelectId }
        />
    );
};
