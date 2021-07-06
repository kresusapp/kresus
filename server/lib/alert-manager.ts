import { makeLogger, translate as $t, displayLabel } from '../helpers';

import { Account, Access, Alert, Transaction } from '../models';

import getNotifier from './notifications';
import getEmailer from './emailer';
import { I18NObject } from '../shared/helpers';
import { getTranslator } from './translator';

const log = makeLogger('alert-manager');

class AlertManager {
    private wrapContent(i18n: I18NObject, content: string): string {
        return `${$t(i18n, 'server.email.hello')}

${content}

${$t(i18n, 'server.email.seeyoulater.notifications')},
${$t(i18n, 'server.email.signature')}
`;
    }

    async send(
        userId: number,
        i18n: I18NObject,
        { subject, text }: { subject: string; text: string }
    ): Promise<void> {
        let sentNotifications = false;

        const notifier = getNotifier(userId);
        if (notifier !== null) {
            await notifier.send(subject, text);
            sentNotifications = true;
        }

        const emailer = getEmailer();
        if (emailer !== null) {
            // Send email notification
            const content = this.wrapContent(i18n, text);
            const fullSubject = `Kresus - ${subject}`;

            await emailer.sendToUser(userId, {
                subject: fullSubject,
                content,
            });

            sentNotifications = true;
        }

        if (sentNotifications) {
            log.info('Notifications have been sent.');
        } else {
            log.info('No notifier or email sender found, no notifications sent.');
        }
    }

    async checkAlertsForOperations(
        userId: number,
        access: Access,
        operations: Transaction[]
    ): Promise<void> {
        try {
            if (getNotifier(userId) === null && getEmailer() === null) {
                log.info('No notifier or emailer found, skipping transactions alerts check.');
                return;
            }

            const i18n = await getTranslator(userId);

            // Map account to names
            const accessLabel = access.getLabel();
            const accounts = await Account.byAccess(userId, access);
            const accountsMap = new Map();
            for (const a of accounts) {
                accountsMap.set(a.id, {
                    label: `${accessLabel} – ${displayLabel(a)}`,
                    formatCurrency: await a.getCurrencyFormatter(),
                });
            }

            // Map accounts to alerts
            const alertsByAccount = new Map();

            for (const operation of operations) {
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
                const { label: accountName, formatCurrency } = accountsMap.get(operation.accountId);

                for (const alert of alerts) {
                    if (!alert.testTransaction(operation)) {
                        continue;
                    }

                    const text = alert.formatOperationMessage(
                        i18n,
                        operation,
                        accountName,
                        formatCurrency
                    );
                    await this.send(userId, i18n, {
                        subject: $t(i18n, 'server.alert.operation.title'),
                        text,
                    });
                }
            }
        } catch (err) {
            log.error(`Error when checking alerts for operations: ${err}`);
        }
    }

    async checkAlertsForAccounts(userId: number, access: Access): Promise<void> {
        try {
            if (getNotifier(userId) === null && getEmailer() === null) {
                log.info('No notifier or emailer found, skipping transactions alerts check.');
                return;
            }

            const i18n = await getTranslator(userId);

            const accounts = await Account.byAccess(userId, access);
            const accessLabel = access.getLabel();
            for (const account of accounts) {
                const alerts = await Alert.byAccountAndType(userId, account.id, 'balance');
                if (!alerts) {
                    continue;
                }

                const balance = await account.computeBalance();
                for (const alert of alerts) {
                    if (!alert.testBalance(balance)) {
                        continue;
                    }

                    // Set the currency formatter
                    const formatCurrency = await account.getCurrencyFormatter();
                    const text = alert.formatAccountMessage(
                        i18n,
                        `${accessLabel} – ${displayLabel(account)}`,
                        balance,
                        formatCurrency
                    );
                    await this.send(userId, i18n, {
                        subject: $t(i18n, 'server.alert.balance.title'),
                        text,
                    });
                }
            }
        } catch (err) {
            log.error(`Error when checking alerts for accounts: ${err}`);
        }
    }
}

export default new AlertManager();
