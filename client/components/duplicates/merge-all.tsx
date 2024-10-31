import React, { useCallback } from 'react';
import { useDispatch } from 'react-redux';

import { translate as $t } from '../../helpers';

import { Popform } from '../ui';
import { useGenericError } from '../../hooks';
import { Transaction } from '../../models';
import * as BanksStore from '../../store/banks';

interface MergeAllProps {
    pairs: Transaction[][];
}

const MergeAll = ({ pairs }: MergeAllProps) => {
    const dispatch = useDispatch();

    const mergeAllHandler = useCallback(async () => {
        const removedElements = new Set();
        // For each duplicate detected
        for (const pair of pairs) {
            // Ensure neither the element to keep nor to remove has not been removed by a previous duplicate detection
            if (!removedElements.has(pair[0].id) && !removedElements.has(pair[1].id)) {
                await dispatch(
                    BanksStore.mergeTransactions({ toKeep: pair[0], toRemove: pair[1] })
                );
                removedElements.add(pair[1].id);
            }
        }
    }, [dispatch, pairs]);

    const handleSubmit = useGenericError(mergeAllHandler);

    return (
        <Popform
            small={false}
            trigger={
                <button className="btn">
                    <span>{$t('client.general.merge_all')}</span>
                </button>
            }
            confirmClass="warning"
            onConfirm={handleSubmit}>
            <h4>{$t('client.transactions.warning_merge_all')}</h4>
            <p>
                <strong>{$t('client.transactions.warning_irrevocable')}</strong>
            </p>
        </Popform>
    );
};

MergeAll.displayName = 'MergeAll';

export default MergeAll;
