import React, { useCallback } from 'react';
import { useDispatch } from 'react-redux';

import { translate as $t } from '../../../helpers';
import { useGenericError } from '../../../hooks';
import * as BanksStore from '../../../store/banks';

import { Popconfirm } from '../../ui';

const DeleteButton = (props: {
    // The alert identifier.
    alertId: number;

    // The type of alert.
    type: 'alert' | 'report';
}) => {
    const dispatch = useDispatch();

    const { alertId } = props;
    const onConfirm = useGenericError(
        useCallback(() => {
            return dispatch(BanksStore.deleteAlert(alertId));
        }, [alertId, dispatch])
    );

    return (
        <Popconfirm
            trigger={
                <button
                    type="button"
                    className="fa fa-times-circle"
                    aria-label="remove alert/report"
                    title={$t(`client.settings.emails.delete_${props.type}`)}
                />
            }
            onConfirm={onConfirm}>
            <p>{$t(`client.settings.emails.delete_${props.type}_full_text`)}</p>
        </Popconfirm>
    );
};

DeleteButton.displayName = 'DeleteAlertOrReportButton';

export default DeleteButton;
