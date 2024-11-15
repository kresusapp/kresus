import React, { useCallback, useState } from 'react';

import { useKresusDispatch } from '../../../store';
import * as backend from '../../../store/backend';
import * as SettingsStore from '../../../store/settings';
import * as InstanceStore from '../../../store/instance';
import { translate as $t, notify, useKresusState } from '../../../helpers';
import { EMAILS_ENABLED } from '../../../../shared/instance';
import { EMAIL_RECIPIENT } from '../../../../shared/settings';

import ClearableInput from '../../ui/clearable-input';
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
            label={$t('client.settings.emails.send_test_email')}
            onClick={onClick}
        />
    );
};

const EmailConfig = () => {
    const emailsEnabled = useKresusState(state =>
        InstanceStore.getBool(state.instance, EMAILS_ENABLED)
    );
    const initialEmail = useKresusState(state =>
        SettingsStore.get(state.settings, EMAIL_RECIPIENT)
    );

    const [email, setEmail] = useState<string | null>(initialEmail);

    const dispatch = useKresusDispatch();
    const handleSubmit = useGenericError(
        useCallback(async () => {
            await dispatch(
                SettingsStore.set(EMAIL_RECIPIENT, email === null ? 'null' : email)
            ).unwrap();
            notify.success($t('client.settings.emails.save_email_success'));
        }, [dispatch, email])
    );

    const handleSendTestEmail = useNotifyError(
        'client.settings.emails.send_test_email_error',
        useCallback(async () => {
            if (!email) {
                return;
            }
            await backend.sendTestEmail(email);
            notify.success($t('client.settings.emails.send_test_email_success'));
        }, [email])
    );

    if (!emailsEnabled) {
        return <div>{$t('client.settings.emails.emails_not_enabled')}</div>;
    }

    return (
        <Form onSubmit={handleSubmit}>
            <Form.Input id="email_send_to" label={$t('client.settings.emails.send_to')}>
                <ClearableInput
                    type="email"
                    value={email !== null ? email : undefined}
                    placeholder="name@example.com"
                    onChange={setEmail}
                />
            </Form.Input>

            <Form.Toolbar align="right">
                <SendTestButton onClick={handleSendTestEmail} disabled={!email} />
                <button type="submit" className="btn primary">
                    {$t('client.settings.submit')}
                </button>
            </Form.Toolbar>
        </Form>
    );
};

EmailConfig.displayName = 'EmailConfig';

export default EmailConfig;
