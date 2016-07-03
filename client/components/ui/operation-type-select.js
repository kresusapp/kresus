import React from 'react';
import { connect } from 'react-redux';

import { actions, get } from '../../store';
import { has, debug } from '../../helpers';

import ButtonSelect from './button-select';

export default connect(state => {
    return {
        operationTypes: get.operationTypes(state),
        getTypeLabel(id) {
            return get.labelOfOperationType(state, id);
        }
    };
}, dispatch => {
    return {
        setOperationType(operation, id) {
            actions.setOperationType(dispatch, operation, id);
        }
    };
})(props => {
    let getThisTypeId = () => props.operation.operationTypeID;
    return (
        <ButtonSelect
          operation={ props.operation }
          optionsArray={ props.operationTypes }
          selectedId={ getThisTypeId }
          idToLabel={ props.getTypeLabel }
          onSelectId={ id => props.setOperationType(props.operation, id) }
        />
    );
});
