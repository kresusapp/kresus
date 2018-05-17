import React from 'react';
import { connect } from 'react-redux';

import { get } from '../../../store';
import { translate as $t } from '../../../helpers';

import Alerts from './alert-list';
import EmailConfig from './config';
import Reports from './report-list';

function EmailsParameters(props) {
    let maybeEditors = null;
    if (props.enableEditors) {
        maybeEditors = (
            <div>
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

                <Reports />
            </div>
        );
    }

    return (
        <div className="emails settings-container">
            <EmailConfig />
            {maybeEditors ? <hr /> : null}
            {maybeEditors}
        </div>
    );
}

export default connect(state => {
    // Only enable the editors if emails are enabled and a recipient email
    // address has been set.
    let enableEditors =
        get.boolSetting(state, 'emails-enabled') &&
        get.setting(state, 'email-recipient').length > 0;
    return {
        enableEditors
    };
})(EmailsParameters);
