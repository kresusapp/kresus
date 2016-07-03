import React from 'react';
import { connect } from 'react-redux';

import { actions, get } from '../../store';
import { has, debug } from '../../helpers';

import ButtonSelect from './button-select';

export default connect(state => {
    return {
        categories: get.categories(state),

        getCategoryTitle(id) {
            return get.categoryById(state, id).title;
        }
    };
}, dispatch => {
    return {
        setOperationCategory(operation, id) {
            actions.setOperationCategory(dispatch, operation, id);
        }
    };
})(props => {
    let getThisCategoryId = () => props.operation.categoryId;
    return (
        <ButtonSelect
          operation={ props.operation }
          optionsArray={ props.categories }
          selectedId={ getThisCategoryId }
          idToLabel={ props.getCategoryTitle }
          onSelectId={ id => props.setOperationCategory(props.operation, id) }
        />
    );
});
