import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import TypeSelect from './type-select';

import { UNKNOWN_OPERATION_TYPE } from '../../helpers';
import { actions } from '../../store';

const EditableTypeSelect = connect(
    null,
    (dispatch, props) => {
        return {
            onChange(value) {
                let newValue = value !== null ? value : UNKNOWN_OPERATION_TYPE;
                if (newValue !== props.value) {
                    actions.setOperationType(dispatch, props.operationId, newValue, props.value);
                }
            }
        };
    }
)(TypeSelect);

EditableTypeSelect.propTypes = {
    // The unique identifier of the operation for which the type has to be changed.
    operationId: PropTypes.string.isRequired,

    // The selected type id.
    value: PropTypes.string.isRequired
};

export default EditableTypeSelect;
