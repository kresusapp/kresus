import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import CategorySelect from './category-select';

import { NONE_CATEGORY_ID } from '../../helpers';
import { actions } from '../../store';

const EditableCategorySelect = connect(
    null,
    (dispatch, props) => {
        return {
            onChange(value) {
                let newValue = value !== null ? value : NONE_CATEGORY_ID;
                if (props.value !== newValue) {
                    actions.setOperationCategory(
                        dispatch,
                        props.operationId,
                        newValue,
                        props.value
                    );
                }
            }
        };
    }
)(CategorySelect);

EditableCategorySelect.displayName = 'EditableCategorySelect';

EditableCategorySelect.propTypes = {
    // The unique identifier of the operation for which the category has to be changed.
    operationId: PropTypes.number.isRequired,

    // The selected category id.
    value: PropTypes.number.isRequired
};

export default EditableCategorySelect;
