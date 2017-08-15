import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

import { get } from '../../../store';

import {
    isEmailConfigCorrect,
    translate as $t
} from '../../../helpers';

import Alerts from './alert-list';
import Reports from './report-list';

function EmailsParameters(props) {
    if (!isEmailConfigCorrect(props.emailConfig)) {
        let { currentAccountId } = props.match.params;
        return (
            <div className="emails top-panel">
                <Link to={ `/settings/admin/${currentAccountId}` }>
                    <p className="alert alert-info">
                        <span className="fa fa-question-circle pull-left" />
                        { $t('client.settings.emails.incomplete_config') }
                    </p>
                </Link>
            </div>
        );
    }

    return (
        <div className="emails">
            <Alerts
              alertType="balance"
              sendIfText={ $t('client.settings.emails.send_if_balance_is') }
              titleTranslationKey="client.settings.emails.add_balance"
              panelTitleKey="client.settings.emails.balance_title"
              panelDescriptionKey="client.settings.emails.balance_desc"
            />

            <Alerts
              alertType="transaction"
              sendIfText={ $t('client.settings.emails.send_if_transaction_is') }
              titleTranslationKey="client.settings.emails.add_transaction"
              panelTitleKey="client.settings.emails.transaction_title"
              panelDescriptionKey="client.settings.emails.transaction_desc"
            />

            <Reports />
        </div>
    );
}

export default connect(state => {
    return {
        emailConfig: JSON.parse(get.setting(state, 'mail-config'))
    };
})(EmailsParameters);
