import React from 'react';
import { connect } from 'react-redux';

import { actions, get } from '../../../store';
import { translate as $t, notify } from '../../../helpers';
import { EMAILS_ENABLED } from '../../../../shared/instance';
import { EMAIL_RECIPIENT } from '../../../../shared/settings';

import ClearableInput from '../../ui/clearable-input';

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

    handleSendTestEmail = () => {
        if (!this.state.email) {
            return;
        }
        this.props.sendTestEmail(this.state.email);
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
                    <button
                        type="button"
                        className="btn"
                        disabled={this.props.sendingEmail}
                        onClick={this.handleSendTestEmail}>
                        {$t('client.settings.emails.send_test_email')}
                    </button>

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
            sendingEmail: get.isSendingTestEmail(state),
        };
    },
    dispatch => {
        return {
            saveEmail: email => actions.setSetting(dispatch, EMAIL_RECIPIENT, email),
            async sendTestEmail(email) {
                try {
                    await actions.sendTestEmail(dispatch, email);
                    notify.success($t('client.settings.emails.send_test_email_success'));
                } catch (err) {
                    if (err && typeof err.message === 'string') {
                        notify.error(
                            $t('client.settings.emails.send_test_email_error', {
                                error: err.message,
                            })
                        );
                    }
                }
            },
        };
    }
)(EmailConfig);
