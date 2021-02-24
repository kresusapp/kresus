import React, { useCallback } from 'react';
import { useDispatch } from 'react-redux';

import { translate as $t } from '../../helpers';
import { actions } from '../../store';
import { ADD_OPERATION_MODAL_SLUG } from './add-operation-modal';

const AddTransactionButton = (props: { accountId: number }) => {
    const dispatch = useDispatch();
    const { accountId } = props;

    const handleClick = useCallback(() => {
        actions.showModal(dispatch, ADD_OPERATION_MODAL_SLUG, accountId);
    }, [dispatch, accountId]);

    return (
        <button
            type="button"
            className="btn"
            aria-label={$t('client.operations.add_operation')}
            onClick={handleClick}
            title={$t('client.operations.add_operation')}>
            <span className="label">{$t('client.operations.add_operation')}</span>
            <span className="fa fa-plus-circle" />
        </button>
    );
};

AddTransactionButton.displayName = 'AddTransactionButton';

export default AddTransactionButton;
