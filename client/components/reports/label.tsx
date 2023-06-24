import React, { useCallback } from 'react';

import { useDispatch } from 'react-redux';
import { Transaction } from '../../models';

import { actions } from '../../store';
import LabelComponent from '../ui/label';

// If the length of the short label (of an transaction) is smaller than this
// threshold, the raw label of the transaction will be displayed in lieu of the
// short label, in the transaction list.
const SMALL_LABEL_THRESHOLD = 4;

const TransactionLabel = (props: {
    id?: string;
    item: Transaction;
    inputClassName?: string;
    forceEditMode?: boolean;
    displayLabelIfNoCustom?: boolean;
}) => {
    const { item } = props;

    const dispatch = useDispatch();
    const setCustomLabel = useCallback(
        async (label: string) => {
            await actions.setTransactionCustomLabel(dispatch, item, label);
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
