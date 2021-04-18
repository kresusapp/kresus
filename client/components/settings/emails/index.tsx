import React from 'react';

import { get } from '../../../store';
import { translate as $t, useKresusState } from '../../../helpers';
import { EMAILS_ENABLED, NOTIFICATIONS_ENABLED } from '../../../../shared/instance';
import { APPRISE_URL, EMAIL_RECIPIENT } from '../../../../shared/settings';

import AlertList from './alert-list';
import AlertForm from './alert-form';
import ReportForm from './report-form';
import EmailConfig from './email-config';
import NotificationsConfig from './notifications-config';
import Reports from './report-list';
import DisplayIf from '../../ui/display-if';

import './alerts.css';

import { Route, Switch } from 'react-router-dom';
import URL from './urls';

const AlertsAndReports = () => {
    const areEmailsEnabled = useKresusState(state => {
        return (
            get.boolInstanceProperty(state, EMAILS_ENABLED) &&
            get.setting(state, EMAIL_RECIPIENT).length > 0
        );
    });

    const areNotificationsEnabled = useKresusState(state => {
        return (
            get.boolInstanceProperty(state, NOTIFICATIONS_ENABLED) &&
            get.setting(state, APPRISE_URL).length > 0
        );
    });

    // Only enable the alerts editors if emails are enabled and a recipient email
    // address has been set or if notifications are enabled.
    const enableAlerts = areEmailsEnabled || areNotificationsEnabled;

    // Only enable the reports if emails are enabled as notifications do not support them yet.
    const enableReports = areEmailsEnabled;

    return (
        <div className="emails settings-container">
            <EmailConfig />
            <hr />
            <NotificationsConfig />
            <DisplayIf condition={enableAlerts || enableReports}>
                <hr />
            </DisplayIf>
            <DisplayIf condition={enableAlerts}>
                <AlertList
                    alertType="balance"
                    sendIfText={$t('client.settings.emails.send_if_balance_is')}
                    panelTitleKey="client.settings.emails.balance_title"
                    panelDescriptionKey="client.settings.emails.balance_desc"
                />

                <AlertList
                    alertType="transaction"
                    sendIfText={$t('client.settings.emails.send_if_transaction_is')}
                    panelTitleKey="client.settings.emails.transaction_title"
                    panelDescriptionKey="client.settings.emails.transaction_desc"
                />
            </DisplayIf>
            <DisplayIf condition={enableReports}>
                <Reports />
            </DisplayIf>
        </div>
    );
};

AlertsAndReports.displayName = 'AlertsAndReports';

export default () => {
    return (
        <Switch>
            <Route path={URL.newAlert.pattern}>
                <AlertForm />
            </Route>
            <Route path={URL.newReport.pattern}>
                <ReportForm />
            </Route>
            <Route path={URL.all}>
                <AlertsAndReports />
            </Route>
        </Switch>
    );
};
