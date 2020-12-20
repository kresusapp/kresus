import React, { useCallback, useState } from 'react';
import { connect } from 'react-redux';

import { actions, get } from '../../../store';
import { translate as $t, notify } from '../../../helpers';
import { EMAILS_ENABLED } from '../../../../shared/instance';
import { EMAIL_RECIPIENT } from '../../../../shared/settings';

import ClearableInput from '../../ui/clearable-input';
import LoadingButton from '../../ui/loading-button';
import { useNotifyError } from '../../../hooks';

const SendTestButton = ({ onClick: propOnClick, disabled }) => {
    const [isLoading, setIsLoading] = useState(false);

    const safeOnclick = useNotifyError('client.settings.emails.send_test_email_error', propOnClick);

    const onClick = useCallback(async () => {
        setIsLoading(true);
        await safeOnclick();
        setIsLoading(false);
    }, [setIsLoading, safeOnclick]);

    return (
        <LoadingButton
            isLoading={isLoading}
            disabled={disabled}
            label={$t('client.settings.emails.send_test_email')}
            onClick={onClick}
        />
    );
};

class EmailConfig extends React.Component {
    state = {
        email: this.props.toEmail,
    };

    handleEmailChange = value => {
        this.setState({ email: value });
    };

    handleSubmit = event => {
        event.preventDefault();
        this.props.saveEmail(this.state.email);
    };

    handleSendTestEmail = async () => {
        if (!this.state.email) {
            return;
        }
        await actions.sendTestEmail(this.state.email);
        notify.success($t('client.settings.emails.send_test_email_success'));
    };

    render() {
        if (!this.props.emailsEnabled) {
            return <div>{$t('client.settings.emails.emails_not_enabled')}</div>;
        }

        return (
            <form onSubmit={this.handleSubmit} className="settings-form">
                <div className="wrap-on-mobile">
                    <label htmlFor="email_send_to">{$t('client.settings.emails.send_to')}</label>
                    <ClearableInput
                        id="email_send_to"
                        type="email"
                        value={this.state.email}
                        placeholder="name@example.com"
                        onChange={this.handleEmailChange}
                    />
                </div>

                <p className="buttons-toolbar">
                    <SendTestButton
                        onClick={this.handleSendTestEmail}
                        disabled={!this.state.email}
                    />
                    <button type="submit" className="btn primary">
                        {$t('client.settings.submit')}
                    </button>
                </p>
            </form>
        );
    }
}

export default connect(
    state => {
        return {
            emailsEnabled: get.boolInstanceProperty(state, EMAILS_ENABLED),
            toEmail: get.setting(state, EMAIL_RECIPIENT),
        };
    },
    dispatch => {
        return {
            saveEmail: email => actions.setSetting(dispatch, EMAIL_RECIPIENT, email),
        };
    }
)(EmailConfig);
