"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const moment_1 = __importDefault(require("moment"));
const helpers_1 = require("../helpers");
const models_1 = require("../models");
const helpers_2 = require("../shared/helpers");
const emailer_1 = __importDefault(require("./emailer"));
const translator_1 = require("./translator");
const log = (0, helpers_1.makeLogger)('report-manager');
// Minimum duration between two reports: let T be any time, in the worst case,
// a report is sent at T + POLLER_START_HIGH_HOUR and the next one is sent at
// T + 24 + POLLER_START_LOW_HOUR.
const MIN_DURATION_BETWEEN_REPORTS = (24 + helpers_1.POLLER_START_LOW_HOUR - helpers_1.POLLER_START_HIGH_HOUR) * 60 * 60 * 1000;
class ReportManager {
    async manageReports(userId) {
        try {
            const emailer = (0, emailer_1.default)();
            if (emailer === null) {
                log.info('No emailer found, skipping reports management.');
                return;
            }
            const now = new Date();
            await this.prepareReport(emailer, userId, 'daily');
            // getDay is indexed from 0, meaning Sunday.
            if (now.getDay() === 1) {
                await this.prepareReport(emailer, userId, 'weekly');
            }
            // getDate starts from 1.
            if (now.getDate() === 1) {
                await this.prepareReport(emailer, userId, 'monthly');
            }
        }
        catch (err) {
            log.warn(`Error when preparing reports: ${err}\n${err.stack}`);
        }
    }
    async sendReport(emailer, userId, subject, content) {
        await emailer.sendToUser(userId, {
            subject,
            content,
        });
        log.info('Report sent.');
    }
    async prepareReport(emailer, userId, frequencyKey) {
        log.info(`Checking if user has enabled ${frequencyKey} report...`);
        const i18n = await (0, translator_1.getTranslator)(userId);
        let reports = await models_1.Alert.reportsByFrequency(userId, frequencyKey);
        if (!reports || !reports.length) {
            return log.info(`User hasn't enabled ${frequencyKey} report.`);
        }
        const now = Date.now();
        // Prevent two reports to be sent on the same day (in case of restart).
        reports = reports.filter(al => {
            return (al.lastTriggeredDate === null ||
                now - al.lastTriggeredDate.getTime() >= MIN_DURATION_BETWEEN_REPORTS);
        });
        if (!reports || !reports.length) {
            return log.info('No report to send (already sent for this frequency).');
        }
        log.info('Report enabled and never sent, generating it...');
        const includedAccounts = reports.map(report => report.accountId);
        const accounts = await models_1.Account.findMany(userId, includedAccounts);
        if (!accounts || !accounts.length) {
            throw new helpers_1.KError("report's account does not exist");
        }
        const transactionsByAccount = new Map();
        for (const a of accounts) {
            transactionsByAccount.set(a.id, {
                account: a,
                transactions: [],
            });
        }
        const reportsMap = new Map();
        for (const report of reports) {
            reportsMap.set(report.accountId, report);
        }
        const transactions = await models_1.Transaction.byAccounts(userId, includedAccounts);
        let count = 0;
        for (const transaction of transactions) {
            const { accountId } = transaction;
            const report = (0, helpers_1.unwrap)(reportsMap.get(accountId));
            const includeAfter = report.lastTriggeredDate || this.computeIncludeAfter(frequencyKey);
            const date = transaction.importDate || transaction.date;
            if ((0, moment_1.default)(date).isAfter(includeAfter)) {
                if (!transactionsByAccount.has(accountId)) {
                    throw new helpers_1.KError("transaction's account does not exist");
                }
                (0, helpers_1.unwrap)(transactionsByAccount.get(accountId)).transactions.push(transaction);
                ++count;
            }
        }
        if (count) {
            const categoryToName = new Map();
            const categories = await models_1.Category.all(userId);
            for (const category of categories) {
                categoryToName.set(category.id, category.label);
            }
            const email = await this.getTextContent(userId, i18n, accounts, categoryToName, transactionsByAccount, frequencyKey);
            const { subject, content } = email;
            await this.sendReport(emailer, userId, subject, content);
        }
        else {
            log.info('no transactions to show in the report.');
        }
        // Update the last trigger even if there are no emails to send.
        const lastTriggeredDate = new Date();
        for (const report of reports) {
            await models_1.Alert.update(userId, report.id, { lastTriggeredDate });
        }
    }
    async getTextContent(userId, i18n, accounts, categoryToName, transactionsByAccount, frequencyKey) {
        let frequency;
        switch (frequencyKey) {
            case 'daily':
                frequency = (0, helpers_1.translate)(i18n, 'server.email.report.daily');
                break;
            case 'weekly':
                frequency = (0, helpers_1.translate)(i18n, 'server.email.report.weekly');
                break;
            case 'monthly':
                frequency = (0, helpers_1.translate)(i18n, 'server.email.report.monthly');
                break;
            default:
                break;
        }
        const today = (0, helpers_1.formatDate)(i18n.localeId).toShortString(new Date());
        let content;
        content = (0, helpers_1.translate)(i18n, 'server.email.hello');
        content += '\n\n';
        content += (0, helpers_1.translate)(i18n, 'server.email.report.pre', { today });
        content += '\n';
        const accountsNameMap = new Map();
        const compareTransactionsDates = (a, b) => {
            const ad = a.date || a.importDate;
            const bd = b.date || b.importDate;
            if (ad < bd) {
                return -1;
            }
            if (ad.getTime() === bd.getTime()) {
                return 0;
            }
            return 1;
        };
        for (const account of accounts) {
            if (!accountsNameMap.has(account.id)) {
                const access = (0, helpers_1.unwrap)(await models_1.Access.find(userId, account.accessId));
                accountsNameMap.set(account.id, `${access.getLabel()} – ${(0, helpers_1.displayLabel)(account)}`);
            }
            const formatCurrency = await account.getCurrencyFormatter();
            const lastCheckDate = (0, helpers_1.formatDate)(i18n.localeId).toShortString(account.lastCheckDate);
            content += `\t* ${accountsNameMap.get(account.id)} : `;
            content += `${formatCurrency(account.balance)} (`;
            content += (0, helpers_1.translate)(i18n, 'server.email.report.last_sync');
            content += ` ${lastCheckDate})\n`;
        }
        if (transactionsByAccount.size) {
            content += '\n';
            content += (0, helpers_1.translate)(i18n, 'server.email.report.new_transactions');
            content += '\n';
            for (const pair of transactionsByAccount.values()) {
                // Sort transactions by date or import date.
                const transactions = pair.transactions.sort(compareTransactionsDates);
                content += `\n${accountsNameMap.get(pair.account.id)}:\n`;
                if (transactions.length === 0) {
                    content += `\t${(0, helpers_1.translate)(i18n, 'server.email.report.no_new_transactions')}\n`;
                }
                else {
                    const formatCurrency = await pair.account.getCurrencyFormatter();
                    for (const transaction of transactions) {
                        const categoryString = categoryToName.get(transaction.categoryId);
                        const maybeCategory = categoryString ? `(${categoryString}) ` : '';
                        const date = (0, helpers_1.formatDate)(i18n.localeId).toShortString(transaction.date);
                        content += `\t* ${date} - ${transaction.customLabel || (0, helpers_2.shortLabel)(transaction)} ${maybeCategory}: `;
                        content += `${formatCurrency(transaction.amount)}\n`;
                    }
                }
            }
        }
        else {
            content += (0, helpers_1.translate)(i18n, 'server.email.report.no_new_transactions');
        }
        content += '\n';
        content += (0, helpers_1.translate)(i18n, 'server.email.seeyoulater.report');
        content += '\n\n';
        content += (0, helpers_1.translate)(i18n, 'server.email.signature');
        const subject = `Kresus - ${(0, helpers_1.translate)(i18n, 'server.email.report.subject', { frequency })}`;
        return {
            subject,
            content,
        };
    }
    computeIncludeAfter(frequency) {
        const includeAfter = (0, moment_1.default)();
        switch (frequency) {
            case 'daily':
                includeAfter.subtract(1, 'days');
                break;
            case 'weekly':
                includeAfter.subtract(7, 'days');
                break;
            case 'monthly':
                includeAfter.subtract(1, 'months').days(0);
                break;
            default:
                break;
        }
        // The report is sent only for transactions imported after
        // POLLER_START_HIGH_HOUR in the morning.
        includeAfter.hours(helpers_1.POLLER_START_HIGH_HOUR).minutes(0).seconds(0);
        return includeAfter.toDate();
    }
}
exports.default = new ReportManager();
