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
        }
    }

    wrapContent(content) {
        return `${$t('server.email.hello')}

${content}

${$t('server.email.seeyoulater.notifications')},
${$t('server.email.signature')}
`;
    }

    async send({ subject, text }) {
        // Send cozy notification
        Notifications.send(text);

        // Send email notification
        let content = this.wrapContent(text);

        let fullSubject = `Kresus - ${subject}`;

        await Emailer.sendToUser({
            subject: fullSubject,
            content
        });

        log.info('Notification sent.');
    }

    async checkAlertsForOperations(operations) {
        try {
            // Map account to names
            let accounts = await Account.all();
            let accountNames = new Map;
            for (let a of accounts) {
                accountNames.set(a.accountNumber, a.title);
            }

            // Map accounts to alerts
            let alertsByAccount = new Map;

            for (let operation of operations) {

                // Memoize alerts by account
                let alerts;
                if (!alertsByAccount.has(operation.bankAccount)) {
                    alerts = await Alert.byAccountAndType(operation.bankAccount,
                                                          'transaction');
                    alertsByAccount.set(operation.bankAccount, alerts);
                } else {
                    alerts = alertsByAccount.get(operation.bankAccount);
                }

                // Skip operations for which the account has no alerts
                if (!alerts || !alerts.length) {
                    continue;
                }

                let accountName = accountNames.get(operation.bankAccount);
                for (let alert of alerts) {
                    if (!alert.testTransaction(operation))
                        continue;

                    let text =
                        alert.formatOperationMessage(operation, accountName);

                    await this.send({
                        subject: $t('server.alert.operation.title'),
                        text
                    });
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

                    let text =
                        alert.formatAccountMessage(account.title, balance);

                    await this.send({
                        subject: $t('server.alert.balance.title'),
                        text
                    });
                }
            }
        } catch (err) {
            log.error(`Error when checking alerts for accounts: ${err}`);
        }
    }
}

export default new AlertManager();
