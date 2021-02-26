import React, { useCallback } from 'react';
import { useDispatch } from 'react-redux';

import { get, actions } from '../../store';
import { translate as $t, useKresusState } from '../../helpers';

import { Popconfirm } from '../ui';
import { useGenericError } from '../../hooks';

export default () => {
    const isDemoMode = useKresusState(state => get.isDemoMode(state));
    const dispatch = useDispatch();
    const handleDisable = useGenericError(
        useCallback(() => actions.disableDemoMode(dispatch), [dispatch])
    );

    if (!isDemoMode) {
        return null;
    }

    return (
        <Popconfirm
            trigger={
                <button type="reset" className="btn warning disable-demo-mode">
                    {$t('client.demo.disable')}
                </button>
            }
            onConfirm={handleDisable}
            confirmClass="warning">
            <p>{$t('client.demo.disable_warning')}</p>
        </Popconfirm>
    );
};
