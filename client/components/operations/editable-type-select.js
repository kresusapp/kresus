import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import TypeSelect from './type-select';

import { actions } from '../../store';

const EditableTypeSelect = connect(null, (dispatch, props) => {
    return {
        onChange(value) {
            actions.setOperationType(dispatch, props.operationId, value, props.selectedValue);
        }
    };
})(TypeSelect);

EditableTypeSelect.propTypes = {
    // The unique identifier of the operation for which the type has to be changed.
    operationId: PropTypes.string.isRequired,

    // The selected type id.
    selectedValue: PropTypes.string.isRequired
};

export default EditableTypeSelect;
