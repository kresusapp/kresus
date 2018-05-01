import React from 'react';
import { connect } from 'react-redux';

import { actions, get } from '../../../store';
import { translate as $t } from '../../../helpers';

class EmailConfig extends React.Component {
    getEmail = () => {
        return this.toEmail.value.trim();
    };

    handleSubmit = () => {
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
            return (
                <div className="top-panel">{$t('client.settings.emails.emails_not_enabled')}</div>
            );
        }

        return (
            <div className="top-panel form-group email-panel">
                <form onSubmit={this.handleSubmit}>
                    <div className="form-group">
                        <label className="col-xs-4 control-label" htmlFor="email_send_to">
                            {$t('client.settings.emails.send_to')}
                        </label>
                        <div className="col-xs-8">
                            <input
                                id="email_send_to"
                                type="email"
                                ref={this.refToEmail}
                                defaultValue={this.props.toEmail}
                            />
                        </div>
                    </div>

                    <div className="btn-toolbar pull-right">
                        <input
                            type="button"
                            className="btn btn-danger"
                            onClick={this.handleDeleteEmail}
                            value={$t('client.settings.emails.delete_email')}
                        />
                        <input
                            type="button"
                            className="btn btn-default"
                            disabled={this.props.sendingEmail}
                            onClick={this.handleSendTestEmail}
                            value={$t('client.settings.emails.send_test_email')}
                        />
                        <input
                            type="submit"
                            className="btn btn-primary"
                            value={$t('client.settings.submit')}
                        />
                    </div>
                </form>
            </div>
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
