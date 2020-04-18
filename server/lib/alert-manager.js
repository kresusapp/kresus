import { makeLogger, translate as $t, displayLabel } from '../helpers';

import { Account, Alert } from '../models';

import getNotifier from './notifications';
import getEmailer from './emailer';

let log = makeLogger('alert-manager');

class AlertManager {
    wrapContent(content) {
        return `${$t('server.email.hello')}

${content}

${$t('server.email.seeyoulater.notifications')},
${$t('server.email.signature')}
`;
    }

    async send(userId, { subject, text }) {
        await getNotifier(userId).send(subject, text);

        // Send email notification
        let content = this.wrapContent(text);
        let fullSubject = `Kresus - ${subject}`;

        await getEmailer().sendToUser(userId, {
            subject: fullSubject,
            content
        });

        log.info('Notification sent.');
    }

    async checkAlertsForOperations(userId, access, operations) {
        try {
            // Map account to names
            let accessLabel = access.getLabel();
            let accounts = await Account.byAccess(userId, access);
            let accountsMap = new Map();
            for (let a of accounts) {
                accountsMap.set(a.id, {
                    label: `${accessLabel} – ${displayLabel(a)}`,
                    formatCurrency: await a.getCurrencyFormatter()
                });
            }

            // Map accounts to alerts
            let alertsByAccount = new Map();

            for (let operation of operations) {
                // Memoize alerts by account
                let alerts;
                if (!alertsByAccount.has(operation.accountId)) {
                    alerts = await Alert.byAccountAndType(
                        userId,
                        operation.accountId,
                        'transaction'
                    );
                    alertsByAccount.set(operation.accountId, alerts);
                } else {
                    alerts = alertsByAccount.get(operation.accountId);
                }

                // Skip operations for which the account has no alerts
                if (!alerts || !alerts.length) {
                    continue;
                }

                // Set the account information
                let { label: accountName, formatCurrency } = accountsMap.get(operation.accountId);

                for (let alert of alerts) {
                    if (!alert.testTransaction(operation)) {
                        continue;
                    }

                    let text = alert.formatOperationMessage(operation, accountName, formatCurrency);
                    await this.send(userId, {
                        subject: $t('server.alert.operation.title'),
                        text
                    });
                }
            }
        } catch (err) {
            log.error(`Error when checking alerts for operations: ${err}`);
        }
    }

    async checkAlertsForAccounts(userId, access) {
        try {
            let accounts = await Account.byAccess(userId, access);
            let accessLabel = access.getLabel();
            for (let account of accounts) {
                let alerts = await Alert.byAccountAndType(userId, account.id, 'balance');
                if (!alerts) {
                    continue;
                }

                let balance = await account.computeBalance();
                for (let alert of alerts) {
                    if (!alert.testBalance(balance)) {
                        continue;
                    }

                    // Set the currency formatter
                    let formatCurrency = await account.getCurrencyFormatter();
                    let text = alert.formatAccountMessage(
                        `${accessLabel} – ${displayLabel(account)}`,
                        balance,
                        formatCurrency
                    );
                    await this.send(userId, {
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
