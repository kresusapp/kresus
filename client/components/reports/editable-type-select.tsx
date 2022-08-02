import React, { useCallback } from 'react';
import { useDispatch } from 'react-redux';

import TypeSelect from './type-select';

import { UNKNOWN_TRANSACTION_TYPE } from '../../helpers';
import { actions } from '../../store';

interface Props {
    // The unique identifier of the operation for which the type has to be changed.
    operationId: number;

    // The selected type id.
    value: string;

    className?: string;
}

const EditableTypeSelect = (props: Props) => {
    const dispatch = useDispatch();
    const { value, operationId } = props;
    const onChange = useCallback(
        async (newValueOrNull: string | null) => {
            const newValue = newValueOrNull !== null ? newValueOrNull : UNKNOWN_TRANSACTION_TYPE;
            if (newValue !== value) {
                await actions.setOperationType(dispatch, operationId, newValue, value);
            }
        },
        [dispatch, value, operationId]
    );
    return <TypeSelect className={props.className} onChange={onChange} value={props.value} />;
};

EditableTypeSelect.displayName = 'EditableTypeSelect';

export default EditableTypeSelect;
