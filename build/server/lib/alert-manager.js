"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const helpers_1 = require("../helpers");
const models_1 = require("../models");
const notifications_1 = __importDefault(require("./notifications"));
const emailer_1 = __importDefault(require("./emailer"));
let log = helpers_1.makeLogger('alert-manager');
class AlertManager {
    wrapContent(content) {
        return `${helpers_1.translate('server.email.hello')}

${content}

${helpers_1.translate('server.email.seeyoulater.notifications')},
${helpers_1.translate('server.email.signature')}
`;
    }
    async send(userId, { subject, text }) {
        await notifications_1.default(userId).send(subject, text);
        // Send email notification
        let content = this.wrapContent(text);
        let fullSubject = `Kresus - ${subject}`;
        await emailer_1.default().sendToUser(userId, {
            subject: fullSubject,
            content
        });
        log.info('Notification sent.');
    }
    async checkAlertsForOperations(userId, access, operations) {
        try {
            // Map account to names
            let accessLabel = access.getLabel();
            let accounts = await models_1.Account.byAccess(userId, access);
            let accountsMap = new Map();
            for (let a of accounts) {
                accountsMap.set(a.id, {
                    label: `${accessLabel} – ${helpers_1.displayLabel(a)}`,
                    formatCurrency: await a.getCurrencyFormatter()
                });
            }
            // Map accounts to alerts
            let alertsByAccount = new Map();
            for (let operation of operations) {
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
                let { label: accountName, formatCurrency } = accountsMap.get(operation.accountId);
                for (let alert of alerts) {
                    if (!alert.testTransaction(operation)) {
                        continue;
                    }
                    let text = alert.formatOperationMessage(operation, accountName, formatCurrency);
                    await this.send(userId, {
                        subject: helpers_1.translate('server.alert.operation.title'),
                        text
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
            let accounts = await models_1.Account.byAccess(userId, access);
            let accessLabel = access.getLabel();
            for (let account of accounts) {
                let alerts = await models_1.Alert.byAccountAndType(userId, account.id, 'balance');
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
                    let text = alert.formatAccountMessage(`${accessLabel} – ${helpers_1.displayLabel(account)}`, balance, formatCurrency);
                    await this.send(userId, {
                        subject: helpers_1.translate('server.alert.balance.title'),
                        text
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
