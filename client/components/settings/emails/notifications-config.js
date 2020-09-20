import React from 'react';
import { connect } from 'react-redux';

import { actions, get } from '../../../store';
import { translate as $t, notify } from '../../../helpers';
import { NOTIFICATIONS_ENABLED } from '../../../../shared/instance';
import { APPRISE_URL } from '../../../../shared/settings';

import ClearableInput from '../../ui/clearable-input';
import ExternalLink from '../../ui/external-link';

class NotificationsConfig extends React.Component {
    state = {
        appriseUrl: this.props.appriseUrl,
    };

    handleAppriseUrlChange = value => {
        this.setState({ appriseUrl: value });
    };

    handleSubmit = event => {
        event.preventDefault();
        this.props.saveNotification(this.state.appriseUrl);
    };

    handleSendTestNotification = () => {
        if (!this.state.appriseUrl) {
            return;
        }
        this.props.sendTestNotification(this.state.appriseUrl);
    };

    render() {
        if (!this.props.notificationsEnabled) {
            return <div>{$t('client.settings.notifications.notifications_not_enabled')}</div>;
        }

        return (
            <form onSubmit={this.handleSubmit} className="settings-form">
                <p className="alerts info">
                    <span className="fa fa-question-circle" />
                    {$t('client.settings.notifications.apprise_description')}
                    &nbsp;
                    {/* eslint-disable-next-line max-len */}
                    <ExternalLink href="https://github.com/caronc/apprise/wiki#notification-services">
                        {$t('client.settings.notifications.apprise_description_link')}
                    </ExternalLink>
                </p>
                <div className="wrap-on-mobile">
                    <label htmlFor="apprise_url">
                        {$t('client.settings.notifications.apprise_url')}
                    </label>
                    <ClearableInput
                        id="apprise_url"
                        type="text"
                        value={this.state.appriseUrl}
                        placeholder="gotify://gotify.server.local/abcdefghijklmn"
                        onChange={this.handleAppriseUrlChange}
                    />
                </div>

                <p className="buttons-toolbar">
                    <button
                        type="button"
                        className="btn"
                        disabled={this.props.sendingNotification}
                        onClick={this.handleSendTestNotification}>
                        {$t('client.settings.notifications.send_test_notification')}
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
            notificationsEnabled: get.boolInstanceProperty(state, NOTIFICATIONS_ENABLED),
            appriseUrl: get.setting(state, APPRISE_URL),
            sendingNotification: get.isSendingTestNotification(state),
        };
    },
    dispatch => {
        return {
            saveNotification: appriseUrl => actions.setSetting(dispatch, APPRISE_URL, appriseUrl),
            async sendTestNotification(appriseUrl) {
                try {
                    await actions.sendTestNotification(dispatch, appriseUrl);
                    notify.success(
                        $t('client.settings.notifications.send_test_notification_success')
                    );
                } catch (err) {
                    notify.error(
                        $t('client.settings.notifications.send_test_notification_error', {
                            error: err.message,
                        })
                    );
                }
            },
        };
    }
)(NotificationsConfig);
