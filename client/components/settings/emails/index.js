import React from 'react';
import { connect } from 'react-redux';

import { get } from '../../../store';
import { translate as $t } from '../../../helpers';
import { EMAILS_ENABLED, NOTIFICATIONS_ENABLED } from '../../../../shared/instance';
import { APPRISE_URL, EMAIL_RECIPIENT } from '../../../../shared/settings';

import Alerts from './alert-list';
import EmailConfig from './email-config';
import NotificationsConfig from './notifications-config';
import Reports from './report-list';
import DisplayIf from '../../ui/display-if';

import './alerts.css';

function EmailsParameters(props) {
    return (
        <div className="emails settings-container">
            <EmailConfig />
            <hr />
            <NotificationsConfig />
            <DisplayIf condition={props.enableAlerts || props.enableReports}>
                <hr />
            </DisplayIf>
            <DisplayIf condition={props.enableAlerts}>
                <Alerts
                    alertType="balance"
                    sendIfText={$t('client.settings.emails.send_if_balance_is')}
                    titleTranslationKey="client.settings.emails.add_balance"
                    panelTitleKey="client.settings.emails.balance_title"
                    panelDescriptionKey="client.settings.emails.balance_desc"
                />

                <Alerts
                    alertType="transaction"
                    sendIfText={$t('client.settings.emails.send_if_transaction_is')}
                    titleTranslationKey="client.settings.emails.add_transaction"
                    panelTitleKey="client.settings.emails.transaction_title"
                    panelDescriptionKey="client.settings.emails.transaction_desc"
                />
            </DisplayIf>
            <DisplayIf condition={props.enableReports}>
                <Reports />
            </DisplayIf>
        </div>
    );
}

export default connect(state => {
    const emailsEnabled =
        get.boolInstanceProperty(state, EMAILS_ENABLED) &&
        get.setting(state, EMAIL_RECIPIENT).length > 0;
    const notificationsEnabled =
        get.boolInstanceProperty(state, NOTIFICATIONS_ENABLED) &&
        get.setting(state, APPRISE_URL).length > 0;

    return {
        // Only enable the alerts editors if emails are enabled and a recipient email
        // address has been set or if notifications are enabled.
        enableAlerts: emailsEnabled || notificationsEnabled,

        // Only enable the reports if emails are enabled as notifications do not support them yet.
        enableReports: emailsEnabled,
    };
})(EmailsParameters);
