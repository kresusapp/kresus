import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import CategorySelect from './category-select';

import { actions } from '../../store';

const EditableCategorySelect = connect(null, (dispatch, props) => {
    return {
        onChange(value) {
            actions.setOperationCategory(dispatch, props.operationId, value, props.selectedValue);
        }
    };
})(CategorySelect);

EditableCategorySelect.propTypes = {
    // The unique identifier for which the type has to be changed.
    operationId: PropTypes.string.isRequired,

    // The selected type id.
    selectedValue: PropTypes.string.isRequired
};

export default EditableCategorySelect;
