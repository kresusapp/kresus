import React, { useState, useCallback } from 'react';
import { useDispatch } from 'react-redux';

import * as SettingsStore from '../../../store/settings';
import * as InstanceStore from '../../../store/instance';
import { translate as $t, notify, useKresusState, assert } from '../../../helpers';
import { NOTIFICATIONS_ENABLED } from '../../../../shared/instance';
import { APPRISE_URL } from '../../../../shared/settings';

import ClearableInput from '../../ui/clearable-input';
import ExternalLink from '../../ui/external-link';
import LoadingButton from '../../ui/loading-button';
import { useGenericError, useNotifyError } from '../../../hooks';
import { Form } from '../../ui';

const SendTestButton = (props: { onClick: () => Promise<any>; disabled: boolean }) => {
    const [isLoading, setIsLoading] = useState(false);

    const propsOnClick = props.onClick;
    const onClick = useCallback(async () => {
        setIsLoading(true);
        await propsOnClick();
        setIsLoading(false);
    }, [setIsLoading, propsOnClick]);

    return (
        <LoadingButton
            isLoading={isLoading}
            disabled={props.disabled}
            label={$t('client.settings.notifications.send_test_notification')}
            onClick={onClick}
        />
    );
};

const NotificationsConfig = () => {
    const notificationsEnabled = useKresusState(state =>
        InstanceStore.getBool(state.instance, NOTIFICATIONS_ENABLED)
    );
    const initialAppriseUrl = useKresusState(state =>
        SettingsStore.get(state.settings, APPRISE_URL)
    );

    const [appriseUrl, setAppriseUrl] = useState<string | null>(initialAppriseUrl);

    const dispatch = useDispatch();
    const handleSubmit = useGenericError(
        useCallback(async () => {
            assert(appriseUrl !== null, 'apprise url must be set');
            await dispatch(SettingsStore.set(APPRISE_URL, appriseUrl));
            notify.success($t('client.settings.notifications.save_url_success'));
        }, [appriseUrl, dispatch])
    );

    const handleSendTestNotification = useNotifyError(
        'client.settings.notifications.send_test_notification_error',
        useCallback(async () => {
            if (!appriseUrl) {
                return;
            }
            await InstanceStore.sendTestNotification(appriseUrl);
            notify.success($t('client.settings.notifications.send_test_notification_success'));
        }, [appriseUrl])
    );

    if (!notificationsEnabled) {
        return <div>{$t('client.settings.notifications.notifications_not_enabled')}</div>;
    }

    return (
        <Form onSubmit={handleSubmit}>
            <p className="alerts info">
                <span className="fa fa-question-circle" />
                {$t('client.settings.notifications.apprise_description')}
                &nbsp;
                {/* eslint-disable-next-line max-len */}
                <ExternalLink href="https://github.com/caronc/apprise/wiki#notification-services">
                    {$t('client.settings.notifications.apprise_description_link')}
                </ExternalLink>
            </p>

            <Form.Input id="apprise_url" label={$t('client.settings.notifications.apprise_url')}>
                <ClearableInput
                    type="text"
                    value={appriseUrl !== null ? appriseUrl : undefined}
                    placeholder="gotify://gotify.server.local/abcdefghijklmn"
                    onChange={setAppriseUrl}
                />
            </Form.Input>

            <Form.Toolbar align="right">
                <SendTestButton onClick={handleSendTestNotification} disabled={!appriseUrl} />
                <button type="submit" className="btn primary">
                    {$t('client.settings.submit')}
                </button>
            </Form.Toolbar>
        </Form>
    );
};

NotificationsConfig.displayName = 'NotificationsConfig';

export default NotificationsConfig;
