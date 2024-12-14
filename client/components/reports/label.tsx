import React, { useCallback } from 'react';

import { shortLabel } from '../../../shared/helpers';
import { Transaction } from '../../models';

import { useKresusDispatch } from '../../store';
import * as BanksStore from '../../store/banks';
import LabelComponent from '../ui/label';

const TransactionLabel = (props: {
    id?: string;
    item: Transaction;
    inputClassName?: string;
    forceEditMode?: boolean;
    displayLabelIfNoCustom?: boolean;
}) => {
    const { item } = props;

    const dispatch = useKresusDispatch();
    const setCustomLabel = useCallback(
        async (label: string) => {
            await dispatch(
                BanksStore.setTransactionCustomLabel({ transaction: item, customLabel: label })
            ).unwrap();
        },
        [dispatch, item]
    );

    const getLabel = useCallback(() => {
        return shortLabel(item);
    }, [item]);

    return <LabelComponent {...props} getLabel={getLabel} setCustomLabel={setCustomLabel} />;
};

TransactionLabel.displayName = 'TransactionLabel';

export default TransactionLabel;
