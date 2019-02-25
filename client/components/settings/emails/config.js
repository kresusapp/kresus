import React from 'react';
import { connect } from 'react-redux';

import { actions, get } from '../../../store';
import { translate as $t } from '../../../helpers';
import ClearableInput from '../../ui/clearable-input';

class EmailConfig extends React.Component {
    state = {
        email: this.props.toEmail
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
                <div>
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
                    <input
                        type="button"
                        className="btn"
                        disabled={this.props.sendingEmail}
                        onClick={this.handleSendTestEmail}
                        value={$t('client.settings.emails.send_test_email')}
                    />
                    <input
                        type="submit"
                        className="btn primary"
                        value={$t('client.settings.submit')}
                    />
                </p>
            </form>
        );
    }
}

export default connect(
    state => {
        return {
            emailsEnabled: get.boolSetting(state, 'emails-enabled'),
            toEmail: get.setting(state, 'email-recipient'),
            sendingEmail: get.isSendingTestEmail(state)
        };
    },
    dispatch => {
        return {
            saveEmail: email => actions.setSetting(dispatch, 'email-recipient', email),
            sendTestEmail: email => actions.sendTestEmail(dispatch, email)
        };
    }
)(EmailConfig);
