import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';

import { translate as $t } from '../../../helpers';
import { actions } from '../../../store';

import { Popconfirm } from '../../ui';

const DeleteButton = props => {
    const dispatch = useDispatch();

    const { alertId } = props;
    const onConfirm = useCallback(() => {
        actions.deleteAlert(dispatch, alertId);
    }, [alertId, dispatch]);

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

DeleteButton.propTypes = {
    // The alert identifier.
    alertId: PropTypes.number.isRequired,

    // The type of alert.
    type: PropTypes.oneOf(['alert', 'report']).isRequired,
};

export default DeleteButton;
