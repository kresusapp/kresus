import React, { useCallback } from 'react';
import { useDispatch } from 'react-redux';

import { get, actions } from '../../store';
import { translate as $t, useKresusState } from '../../helpers';
import { DISCOVERY_MODE } from '../../../shared/settings';

import DisplayIf from './display-if';
import { Popconfirm } from './index';
import { useNotifyError } from '../../hooks';

interface DiscoveryMessageProps {
    // The help message to display.
    message: string;
}

const DiscoveryMessage = (props: DiscoveryMessageProps) => {
    const enabled = useKresusState(state => get.boolSetting(state, DISCOVERY_MODE));

    const dispatch = useDispatch();
    const handleDisable = useNotifyError(
        'client.settings.customization.update_setting_error',
        useCallback(() => actions.setBoolSetting(dispatch, DISCOVERY_MODE, false), [dispatch])
    );

    return (
        <DisplayIf condition={enabled}>
            <p className="alerts info with-action">
                <span>{props.message}</span>
                <Popconfirm
                    trigger={<button className="fa fa-times-circle" />}
                    onConfirm={handleDisable}
                    confirmMessage="success">
                    <p>{$t('client.settings.customization.confirm_disable_discovery')}</p>
                </Popconfirm>
            </p>
        </DisplayIf>
    );
};

DiscoveryMessage.displayName = 'DiscoveryMessage';

export default DiscoveryMessage;
