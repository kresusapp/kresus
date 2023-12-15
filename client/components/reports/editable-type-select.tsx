import React, { useCallback } from 'react';
import { useDispatch } from 'react-redux';

import TypeSelect from './type-select';

import { UNKNOWN_TRANSACTION_TYPE } from '../../helpers';
import * as BanksStore from '../../store/banks';

interface Props {
    // The unique identifier of the transaction for which the type has to be changed.
    transactionId: number;

    // The selected type id.
    value: string;

    className?: string;
}

const EditableTypeSelect = (props: Props) => {
    const dispatch = useDispatch();
    const { value, transactionId } = props;
    const onChange = useCallback(
        async (newValueOrNull: string | null) => {
            const newValue = newValueOrNull !== null ? newValueOrNull : UNKNOWN_TRANSACTION_TYPE;
            if (newValue !== value) {
                await dispatch(BanksStore.setTransactionType(transactionId, newValue, value));
            }
        },
        [dispatch, value, transactionId]
    );
    return <TypeSelect className={props.className} onChange={onChange} value={props.value} />;
};

EditableTypeSelect.displayName = 'EditableTypeSelect';

export default EditableTypeSelect;
