import React from 'react';
import { connect } from 'react-redux';

import { actions, get } from '../../store';
import { has, debug } from '../../helpers';

import ButtonSelect from '../ui/button-select';

export default connect(state => {
    return {
        categories: get.categories(state),

        getCategoryTitle(id) {
            return get.categoryById(state, id).title;
        }
    };
}, (dispatch, props) => {
    let ret = {};

    // Only define setOperationCategory if none was provided.
    if (!props.onSelectId) {
        ret.onSelectId = function(id) {
            actions.setOperationCategory(dispatch, props.operation, id);
        };
    }

    return ret;
})(props => {
    let getThisCategoryId = () => props.operation.categoryId;
    return (
        <ButtonSelect
          operation={ props.operation }
          optionsArray={ props.categories }
          selectedId={ getThisCategoryId }
          idToLabel={ props.getCategoryTitle }
          onSelectId={ props.onSelectId }
        />
    );
});
