import React, { useCallback } from 'react';

import { useDispatch } from 'react-redux';
import { Operation } from '../../models';

import { actions } from '../../store';
import LabelComponent from '../ui/label';

// If the length of the short label (of an operation) is smaller than this
// threshold, the raw label of the operation will be displayed in lieu of the
// short label, in the operations list.
const SMALL_LABEL_THRESHOLD = 4;

const TransactionLabel = (props: {
    id?: string;
    item: Operation;
    inputClassName?: string;
    forceEditMode?: boolean;
    displayLabelIfNoCustom?: boolean;
}) => {
    const { item } = props;

    const dispatch = useDispatch();
    const setCustomLabel = useCallback(
        async (label: string) => {
            await actions.setOperationCustomLabel(dispatch, item, label);
        },
        [dispatch, item]
    );

    const getLabel = useCallback(() => {
        let label;
        if (item.label.length < SMALL_LABEL_THRESHOLD) {
            label = item.rawLabel;
            if (item.label.length) {
                label += ` (${item.label})`;
            }
        } else {
            label = item.label;
        }
        return label.trim();
    }, [item]);

    return <LabelComponent {...props} getLabel={getLabel} setCustomLabel={setCustomLabel} />;
};

TransactionLabel.displayName = 'TransactionLabel';

export default TransactionLabel;
