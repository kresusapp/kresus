import { translate as $t } from '../../helpers';

import Alerts from './Alerts';
import Reports from './Reports';

export default class EmailsParameters extends React.Component {
    render() {
        return (
            <div>
                <Alerts
                  alertType="balance"
                  sendIfText={ $t('client.settings.emails.send_if_balance_is') }
                  titleTranslationKey="settings.emails.add_balance"
                  panelTitleKey="settings.emails.balance_title"
                />

                <Alerts
                  alertType="transaction"
                  sendIfText={ $t('client.settings.emails.send_if_transaction_is') }
                  titleTranslationKey="settings.emails.add_transaction"
                  panelTitleKey="settings.emails.transaction_title"
                />

                <Reports />
            </div>
        );
    }
}
