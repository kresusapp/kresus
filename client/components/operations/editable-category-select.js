import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import CategorySelect from './category-select';

import { actions } from '../../store';

const EditableCategorySelect = connect(
    null,
    (dispatch, props) => {
        return {
            onChange(value) {
                actions.setOperationCategory(dispatch, props.operationId, value, props.value);
            }
        };
    }
)(CategorySelect);

EditableCategorySelect.propTypes = {
    // The unique identifier of the operation for which the category has to be changed.
    operationId: PropTypes.string.isRequired,

    // The selected category id.
    value: PropTypes.string.isRequired
};

export default EditableCategorySelect;
