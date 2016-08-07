import Emailer       from './emailer';
import Notifications from './notifications';

import Account   from '../models/account';
import Alert     from '../models/alert';
import Config    from '../models/config';

import { makeLogger, translate as $t, currency } from '../helpers';

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

    async checkAlertsForOperations(access, operations) {
        try {
            let defaultCurrency = await Config.byName('defaultCurrency').value;

            // Map account to names
            let accounts = await Account.byAccess(access);
            let accountsMap = new Map;
            for (let a of accounts) {
                accountsMap.set(a.accountNumber, {
                    title: a.title,
                    formatter: currency.makeFormat(a.currency || defaultCurrency)
                });
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

                // Set the account information
                let { title: accountName, formatter } = accountsMap.get(operation.bankAccount);

                for (let alert of alerts) {
                    if (!alert.testTransaction(operation))
                        continue;

                    let text =
                        alert.formatOperationMessage(operation, accountName, formatter);
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

    async checkAlertsForAccounts(access) {
        try {
            let defaultCurrency = await Config.byName('defaultCurrency').value;

            let accounts = await Account.byAccess(access);
            for (let account of accounts) {
                let alerts = await Alert.byAccountAndType(account.accountNumber, 'balance');
                if (!alerts)
                    continue;

                let balance = await account.computeBalance();
                for (let alert of alerts) {
                    if (!alert.testBalance(balance))
                        continue;

                    // Set the currency formatter
                    let curr = account.currency || defaultCurrency;
                    let currencyFormatter = currency.makeFormat(curr);
                    let text =
                        alert.formatAccountMessage(account.title, balance, currencyFormatter);
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
