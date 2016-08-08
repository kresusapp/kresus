import React from 'react';
import { connect } from 'react-redux';

import { actions } from '../../store';
import { translate as $t } from '../../helpers';
import ButtonSelect from '../ui/button-select';

import OperationTypes from '../../../shared/operation-types.json';

export default connect(null, (dispatch, props) => {
    let ret = {};

    // Only define handleSelectId if none was provided.
    if (!props.onSelectId) {
        ret.onSelectId = function(type) {
            actions.setOperationType(dispatch, props.operation, type);
        };
    }

    return ret;
})(props => {
    let getThisType = () => props.operation.type;
    let idToLabel = type => $t(`client.${type}`);
    let opTypes = [];
    for (let type of OperationTypes) {
        type.id = type.name;
        opTypes.push(type);
    }
    return (
        <ButtonSelect
          key={ `operation-type-select-operation-${props.operation.id}` }
          optionsArray={ opTypes }
          selectedId={ getThisType }
          idToLabel={ idToLabel }
          onSelectId={ props.onSelectId }
        />
    );
});
