import CategorySelect from './category-select';

import { NONE_CATEGORY_ID } from '../../helpers';
import { useKresusDispatch } from '../../store';
import * as BanksStore from '../../store/banks';
import React, { useCallback } from 'react';

interface Props {
    // The unique identifier of the transaction for which the category has to be changed.
    transactionId: number;

    // The selected category id.
    value: number;

    className?: string;
}

const EditableCategorySelect = (props: Props) => {
    const value = props.value;
    const transactionId = props.transactionId;

    const dispatch = useKresusDispatch();
    const onChange = useCallback(
        async (newValueOrNull: number | null) => {
            const newValue = newValueOrNull !== null ? newValueOrNull : NONE_CATEGORY_ID;
            if (value !== newValue) {
                await dispatch(
                    BanksStore.setTransactionCategory({
                        transactionId,
                        categoryId: newValue,
                        formerCategoryId: value,
                    })
                ).unwrap();
            }
        },
        [dispatch, transactionId, value]
    );

    return <CategorySelect className={props.className} onChange={onChange} value={props.value} />;
};

EditableCategorySelect.displayName = 'EditableCategorySelect';

export default EditableCategorySelect;
