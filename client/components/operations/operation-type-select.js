import React from 'react';
import { connect } from 'react-redux';

import { actions, get } from '../../store';
import { has, debug } from '../../helpers';

import ButtonSelect from '../ui/button-select';

export default connect(state => {
    return {
        operationTypes: get.operationTypes(state),
        getTypeLabel(id) {
            return get.labelOfOperationType(state, id);
        }
    };
}, (dispatch, props) => {
    let ret = {};

    // Only define handleSelectId if none was provided.
    if (!props.onSelectId) {
        ret.onSelectId = function(id) {
            actions.setOperationType(dispatch, props.operation, id);
        };
    }

    return ret;
})(props => {
    let getThisTypeId = () => props.operation.operationTypeID;
    return (
        <ButtonSelect
          optionsArray={ props.operationTypes }
          selectedId={ getThisTypeId }
          idToLabel={ props.getTypeLabel }
          onSelectId={ props.onSelectId }
        />
    );
});
