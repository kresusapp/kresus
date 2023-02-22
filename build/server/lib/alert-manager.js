"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const helpers_1 = require("../helpers");
const models_1 = require("../models");
const notifications_1 = __importDefault(require("./notifications"));
const emailer_1 = __importDefault(require("./emailer"));
const translator_1 = require("./translator");
const log = (0, helpers_1.makeLogger)('alert-manager');
class AlertManager {
    wrapContent(i18n, content) {
        return `${(0, helpers_1.translate)(i18n, 'server.email.hello')}

${content}

${(0, helpers_1.translate)(i18n, 'server.email.seeyoulater.notifications')},
${(0, helpers_1.translate)(i18n, 'server.email.signature')}
`;
    }
    async send(userId, i18n, { subject, text }) {
        let sentNotifications = false;
        const notifier = (0, notifications_1.default)(userId);
        if (notifier !== null) {
            await notifier.send(subject, text);
            sentNotifications = true;
        }
        const emailer = (0, emailer_1.default)();
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
        }
        else {
            log.info('No notifier or email sender found, no notifications sent.');
        }
    }
    async checkAlertsForTransactions(userId, access, transactions) {
        try {
            if ((0, notifications_1.default)(userId) === null && (0, emailer_1.default)() === null) {
                log.info('No notifier or emailer found, skipping transactions alerts check.');
                return;
            }
            const i18n = await (0, translator_1.getTranslator)(userId);
            // Map account to names
            const accessLabel = access.getLabel();
            const accounts = await models_1.Account.byAccess(userId, access);
            const accountsMap = new Map();
            for (const a of accounts) {
                accountsMap.set(a.id, {
                    label: `${accessLabel} – ${(0, helpers_1.displayLabel)(a)}`,
                    formatCurrency: await a.getCurrencyFormatter(),
                });
            }
            // Map accounts to alerts
            const alertsByAccount = new Map();
            for (const tr of transactions) {
                // Memoize alerts by account
                let alerts;
                if (!alertsByAccount.has(tr.accountId)) {
                    alerts = await models_1.Alert.byAccountAndType(userId, tr.accountId, 'transaction');
                    alertsByAccount.set(tr.accountId, alerts);
                }
                else {
                    alerts = alertsByAccount.get(tr.accountId);
                }
                // Skip transactions for which the account has no alerts
                if (!alerts || !alerts.length) {
                    continue;
                }
                // Set the account information
                const { label: accountName, formatCurrency } = accountsMap.get(tr.accountId);
                for (const alert of alerts) {
                    if (!alert.testTransaction(tr)) {
                        continue;
                    }
                    const text = alert.formatTransactionMessage(i18n, tr, accountName, formatCurrency);
                    await this.send(userId, i18n, {
                        subject: (0, helpers_1.translate)(i18n, 'server.alert.transaction.title'),
                        text,
                    });
                }
            }
        }
        catch (err) {
            log.error(`Error when checking alerts for transactions: ${err}`);
        }
    }
    async checkAlertsForAccounts(userId, access) {
        try {
            if ((0, notifications_1.default)(userId) === null && (0, emailer_1.default)() === null) {
                log.info('No notifier or emailer found, skipping transactions alerts check.');
                return;
            }
            const i18n = await (0, translator_1.getTranslator)(userId);
            const accounts = await models_1.Account.byAccess(userId, access);
            const accessLabel = access.getLabel();
            for (const account of accounts) {
                const alerts = await models_1.Alert.byAccountAndType(userId, account.id, 'balance');
                if (!alerts) {
                    continue;
                }
                const balance = account.balance;
                for (const alert of alerts) {
                    if (!alert.testBalance(balance)) {
                        continue;
                    }
                    // Set the currency formatter
                    const formatCurrency = await account.getCurrencyFormatter();
                    const text = alert.formatAccountMessage(i18n, `${accessLabel} – ${(0, helpers_1.displayLabel)(account)}`, balance, formatCurrency);
                    await this.send(userId, i18n, {
                        subject: (0, helpers_1.translate)(i18n, 'server.alert.balance.title'),
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
