import React from 'react';
import { connect } from 'react-redux';

import { actions, get } from '../../../store';
import { translate as $t } from '../../../helpers';

const EmailConfig = props => {
    // In the Cozy mode, no need to allow the user to configurate their own
    // email service, since the platform does it for use.
    if (!props.standalone) {
        return null;
    }

    if (!props.emailsEnabled) {
        return <div className="top-panel">{$t('client.settings.emails.emails_not_enabled')}</div>;
    }

    let toEmail = null;

    let refToEmail = node => {
        toEmail = node;
    };

    const getEmail = () => {
        return toEmail.value.trim();
    };

    const handleSubmit = () => {
        let email = getEmail();
        if (!email) return;
        props.saveEmail(email);
    };

    const handleSendTestEmail = () => {
        let email = getEmail();
        if (!email) return;
        props.sendTestEmail(email);
    };

    const handleDeleteEmail = () => {
        props.saveEmail('');
        // Cross fingers here.
        toEmail.value = '';
    };

    return (
        <div className="top-panel form-group">
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label className="col-xs-4 control-label" htmlFor="email_send_to">
                        {$t('client.settings.emails.send_to')}
                    </label>
                    <div className="col-xs-8">
                        <input
                            id="email_send_to"
                            className="form-control"
                            type="email"
                            ref={refToEmail}
                            defaultValue={props.toEmail}
                        />
                    </div>
                </div>

                <div className="btn-toolbar pull-right">
                    <input
                        type="button"
                        className="btn btn-danger"
                        onClick={handleDeleteEmail}
                        value={$t('client.settings.emails.delete_email')}
                    />
                    <input
                        type="button"
                        className="btn btn-default"
                        disabled={props.sendingEmail}
                        onClick={handleSendTestEmail}
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
};

export default connect(
    state => {
        return {
            standalone: get.boolSetting(state, 'standalone-mode'),
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
