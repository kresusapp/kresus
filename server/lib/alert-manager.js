import Emailer       from './emailer';
import Notifications from './notifications';

import Account   from '../models/account';
import Alert     from '../models/alert';

import { makeLogger, translate as $t } from '../helpers';

let log = makeLogger('alert-manager');

class AlertManager
{
    constructor() {
        if (process.kresus.standalone) {
            log.warn('report manager not implemented yet in standalone mode');
            return;
        }
    }

    async checkAlertsForOperations(operations) {
        try {
            let alertsByAccount = new Map;

            for (let operation of operations) {

                // Memoize alerts by account
                let alerts = alertsByAccount.get(operation.bankAccount);
                if (typeof alerts === 'undefined') {
                    alerts = await Alert.byAccountAndType(operation.bankAccount,
                                                          'transaction');
                    alertsByAccount.set(operation.bankAccount, alerts);
                }
                if (!alerts || !alerts.length) {
                    continue;
                }

                for (let alert of alerts) {
                    if (!alert.testTransaction(operation))
                        continue;

                    // Send cozy notification
                    Notifications.send(alert.formatOperationMessage(operation));

                    // Send email notification
                    let content =
`${$t('server.email.hello')}

${alert.formatOperationMessage(operation)}

${$t('server.email.seeyoulater.notifications')},
${$t('server.email.signature')}
`;

                    let subject = $t('server.alert.operation.title');
                    subject = `Kresus - ${subject}`;

                    await Emailer.sendToUser({
                        subject,
                        content
                    });

                    log.info('Notification sent.');
                }
            }
        } catch (err) {
            log.error(`Error when checking alerts for operations: ${err}`);
        }
    }

    async checkAlertsForAccounts() {
        try {
            let accounts = await Account.all();
            for (let account of accounts) {
                let alerts = await Alert.byAccountAndType(account.accountNumber,
                                                          'balance');
                if (!alerts)
                    continue;

                let balance = await account.computeBalance();
                for (let alert of alerts) {
                    if (!alert.testBalance(balance))
                        continue;

                    // Cozy notification
                    let message =
                        alert.formatAccountMessage(account.title, balance);
                    Notifications.send(message);

                    // Send email notification
                    let content =
`${$t('server.email.hello')}

${alert.formatAccountMessage(account.title, balance)}

${$t('server.email.seeyoulater.notifications')},
${$t('server.email.signature')}
`;

                    await Emailer.sendToUser({
                        subject: `Kresus - ${$t('server.alert.balance.title')}`,
                        content
                    });

                    log.info('Notification sent.');
                }
            }
        } catch (err) {
            log.error(`Error when checking alerts for accounts: ${err}`);
        }
    }
}

export default new AlertManager();
