import React from 'react';
import { connect } from 'react-redux';

import { actions, get } from '../../../store';
import { translate as $t } from '../../../helpers';

class EmailConfig extends React.Component {
    getEmail = () => {
        return this.toEmail.value.trim();
    };

    handleSubmit = event => {
        event.preventDefault();
        let email = this.getEmail();
        if (!email) {
            return;
        }
        this.props.saveEmail(email);
    };

    handleSendTestEmail = () => {
        let email = this.getEmail();
        if (!email) {
            return;
        }
        this.props.sendTestEmail(email);
    };

    handleDeleteEmail = () => {
        this.props.saveEmail('');
        // Cross fingers here.
        this.toEmail.value = '';
    };

    toEmail = null;

    refToEmail = node => {
        this.toEmail = node;
    };

    render() {
        if (!this.props.emailsEnabled) {
            return <div>{$t('client.settings.emails.emails_not_enabled')}</div>;
        }

        return (
            <form onSubmit={this.handleSubmit} className="settings-form">
                <p>
                    <label htmlFor="email_send_to">{$t('client.settings.emails.send_to')}</label>
                    <input
                        id="email_send_to"
                        type="email"
                        ref={this.refToEmail}
                        defaultValue={this.props.toEmail}
                    />
                </p>

                <p className="buttons-toolbar">
                    <input
                        type="button"
                        className="btn danger"
                        onClick={this.handleDeleteEmail}
                        value={$t('client.settings.emails.delete_email')}
                    />
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
