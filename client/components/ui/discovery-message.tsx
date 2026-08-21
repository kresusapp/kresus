import { useCallback } from 'react';
import { DISCOVERY_MODE } from '../../../shared/settings';
import { translate as $t } from '../../helpers';
import { useNotifyError } from '../../hooks';
import { useKresusDispatch, useKresusState } from '../../store';
import * as SettingsStore from '../../store/settings';
import DisplayIf from './display-if';
import { Popconfirm } from './index';

interface DiscoveryMessageProps {
    // The help message to display.
    message: string;

    // The alert level. "info" if omitted.
    level?: string;
}

const DiscoveryMessage = (props: DiscoveryMessageProps) => {
    const enabled = useKresusState(state => SettingsStore.getBool(state.settings, DISCOVERY_MODE));

    const dispatch = useKresusDispatch();
    const handleDisable = useNotifyError(
        'client.settings.customization.update_setting_error',
        useCallback(async () => {
            await dispatch(SettingsStore.setBool(DISCOVERY_MODE, false)).unwrap();
        }, [dispatch])
    );

    const level = props.level || 'info';

    return (
        <DisplayIf condition={enabled}>
            <p className={`alerts ${level} with-action`}>
                <span>{props.message}</span>
                <Popconfirm
                    trigger={<button className="fa fa-times-circle" />}
                    onConfirm={handleDisable}
                    confirmClass="success"
                >
                    <p>{$t('client.settings.customization.confirm_disable_discovery')}</p>
                </Popconfirm>
            </p>
        </DisplayIf>
    );
};

DiscoveryMessage.displayName = 'DiscoveryMessage';

export default DiscoveryMessage;
