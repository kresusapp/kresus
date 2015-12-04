import Emailer       from './emailer';
import Notifications from './notifications';

import Account   from '../models/account';
import Alert     from '../models/alert';

import { makeLogger } from '../helpers';

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
                    // TODO i18n
                    let content =
`Bonjour cher utilisateur de Kresus,

${alert.formatOperationMessage(operation)}

A bientôt pour de nouvelles notifications,

Votre serviteur, Kresus.`;

                    await Emailer.sendToUser({
                        subject: 'Kresus - Alerte operation',
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
                    // TODO i18n
                    let content =
`Bonjour cher utilisateur de Kresus,

${alert.formatAccountMessage(account.title, balance)}

A bientôt pour de nouvelles notifications,

Votre serviteur, Kresus.`;

                    await Emailer.sendToUser({
                        subject: 'Kresus - Alerte balance de compte',
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
