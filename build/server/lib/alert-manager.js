"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const helpers_1 = require("../helpers");
const models_1 = require("../models");
const notifications_1 = __importDefault(require("./notifications"));
const emailer_1 = __importDefault(require("./emailer"));
const log = helpers_1.makeLogger('alert-manager');
class AlertManager {
    wrapContent(content) {
        return `${helpers_1.translate('server.email.hello')}

${content}

${helpers_1.translate('server.email.seeyoulater.notifications')},
${helpers_1.translate('server.email.signature')}
`;
    }
    async send(userId, { subject, text }) {
        let sentNotifications = false;
        const notifier = notifications_1.default(userId);
        if (notifier !== null) {
            await notifier.send(subject, text);
            sentNotifications = true;
        }
        const emailer = emailer_1.default();
        if (emailer !== null) {
            // Send email notification
            const content = this.wrapContent(text);
            const fullSubject = `Kresus - ${subject}`;
            await emailer.sendToUser(userId, {
                subject: fullSubject,
                content,
            });
            sentNotifications = true;
        }
        if (sentNotifications) {
            log.info('Notifications have been sent.');
        }
        else {
            log.info('No notifier or email sender found, no notifications sent.');
        }
    }
    async checkAlertsForOperations(userId, access, operations) {
        try {
            if (notifications_1.default(userId) === null && emailer_1.default() === null) {
                log.info('No notifier or emailer found, skipping transactions alerts check.');
                return;
            }
            // Map account to names
            const accessLabel = access.getLabel();
            const accounts = await models_1.Account.byAccess(userId, access);
            const accountsMap = new Map();
            for (const a of accounts) {
                accountsMap.set(a.id, {
                    label: `${accessLabel} – ${helpers_1.displayLabel(a)}`,
                    formatCurrency: await a.getCurrencyFormatter(),
                });
            }
            // Map accounts to alerts
            const alertsByAccount = new Map();
            for (const operation of operations) {
                // Memoize alerts by account
                let alerts;
                if (!alertsByAccount.has(operation.accountId)) {
                    alerts = await models_1.Alert.byAccountAndType(userId, operation.accountId, 'transaction');
                    alertsByAccount.set(operation.accountId, alerts);
                }
                else {
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
                    const text = alert.formatOperationMessage(operation, accountName, formatCurrency);
                    await this.send(userId, {
                        subject: helpers_1.translate('server.alert.operation.title'),
                        text,
                    });
                }
            }
        }
        catch (err) {
            log.error(`Error when checking alerts for operations: ${err}`);
        }
    }
    async checkAlertsForAccounts(userId, access) {
        try {
            if (notifications_1.default(userId) === null && emailer_1.default() === null) {
                log.info('No notifier or emailer found, skipping transactions alerts check.');
                return;
            }
            const accounts = await models_1.Account.byAccess(userId, access);
            const accessLabel = access.getLabel();
            for (const account of accounts) {
                const alerts = await models_1.Alert.byAccountAndType(userId, account.id, 'balance');
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
                    const text = alert.formatAccountMessage(`${accessLabel} – ${helpers_1.displayLabel(account)}`, balance, formatCurrency);
                    await this.send(userId, {
                        subject: helpers_1.translate('server.alert.balance.title'),
                        text,
                    });
                }
            }
        }
        catch (err) {
            log.error(`Error when checking alerts for accounts: ${err}`);
        }
    }
}
exports.default = new AlertManager();
