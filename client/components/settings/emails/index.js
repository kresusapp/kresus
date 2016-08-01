import React from 'react';

import { translate as $t } from '../../../helpers';

import Alerts from './alert-list';
import Reports from './report-list';

export default function EmailsParameters() {
    return (
        <div className="emails">
            <Alerts
              alertType="balance"
              sendIfText={ $t('client.settings.emails.send_if_balance_is') }
              titleTranslationKey="client.settings.emails.add_balance"
              panelTitleKey="client.settings.emails.balance_title"
            />

            <Alerts
              alertType="transaction"
              sendIfText={ $t('client.settings.emails.send_if_transaction_is') }
              titleTranslationKey="client.settings.emails.add_transaction"
              panelTitleKey="client.settings.emails.transaction_title"
            />

            <Reports />
        </div>
    );
}
