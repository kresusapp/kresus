"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const moment_1 = __importDefault(require("moment"));
const helpers_1 = require("../helpers");
const models_1 = require("../models");
const emailer_1 = __importDefault(require("./emailer"));
const log = helpers_1.makeLogger('report-manager');
// Minimum duration between two reports: let T be any time, in the worst case,
// a report is sent at T + POLLER_START_HIGH_HOUR and the next one is sent at
// T + 24 + POLLER_START_LOW_HOUR.
const MIN_DURATION_BETWEEN_REPORTS = (24 + helpers_1.POLLER_START_LOW_HOUR - helpers_1.POLLER_START_HIGH_HOUR) * 60 * 60 * 1000;
class ReportManager {
    async sendReport(userId, subject, content) {
        await emailer_1.default().sendToUser(userId, {
            subject,
            content
        });
        log.info('Report sent.');
    }
    async manageReports(userId) {
        try {
            const now = new Date();
            await this.prepareReport(userId, 'daily');
            // getDay is indexed from 0, meaning Sunday.
            if (now.getDay() === 1) {
                await this.prepareReport(userId, 'weekly');
            }
            // getDate starts from 1.
            if (now.getDate() === 1) {
                await this.prepareReport(userId, 'monthly');
            }
        }
        catch (err) {
            log.warn(`Error when preparing reports: ${err}\n${err.stack}`);
        }
    }
    async prepareReport(userId, frequencyKey) {
        log.info(`Checking if user has enabled ${frequencyKey} report...`);
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
        const operationsByAccount = new Map();
        for (const a of accounts) {
            operationsByAccount.set(a.id, {
                account: a,
                operations: []
            });
        }
        const reportsMap = new Map();
        for (const report of reports) {
            reportsMap.set(report.accountId, report);
        }
        const operations = await models_1.Transaction.byAccounts(userId, includedAccounts);
        let count = 0;
        for (const operation of operations) {
            const { accountId } = operation;
            const report = reportsMap.get(accountId);
            const includeAfter = report.lastTriggeredDate || this.computeIncludeAfter(frequencyKey);
            const date = operation.importDate || operation.date;
            if (moment_1.default(date).isAfter(includeAfter)) {
                if (!operationsByAccount.has(accountId)) {
                    throw new helpers_1.KError("operation's account does not exist");
                }
                operationsByAccount.get(accountId).operations.push(operation);
                ++count;
            }
        }
        if (count) {
            const email = await this.getTextContent(userId, accounts, operationsByAccount, frequencyKey);
            const { subject, content } = email;
            await this.sendReport(userId, subject, content);
        }
        else {
            log.info('no operations to show in the report.');
        }
        // Update the last trigger even if there are no emails to send.
        const lastTriggeredDate = new Date();
        for (const report of reports) {
            await models_1.Alert.update(userId, report.id, { lastTriggeredDate });
        }
    }
    async getTextContent(userId, accounts, operationsByAccount, frequencyKey) {
        let frequency;
        switch (frequencyKey) {
            case 'daily':
                frequency = helpers_1.translate('server.email.report.daily');
                break;
            case 'weekly':
                frequency = helpers_1.translate('server.email.report.weekly');
                break;
            case 'monthly':
                frequency = helpers_1.translate('server.email.report.monthly');
                break;
            default:
                log.error('unexpected frequency in getTextContent');
        }
        const today = helpers_1.formatDate.toShortString();
        let content;
        content = helpers_1.translate('server.email.hello');
        content += '\n\n';
        content += helpers_1.translate('server.email.report.pre', { today });
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
                const access = helpers_1.unwrap(await models_1.Access.find(userId, account.accessId));
                accountsNameMap.set(account.id, `${access.getLabel()} – ${helpers_1.displayLabel(account)}`);
            }
            const formatCurrency = await account.getCurrencyFormatter();
            const lastCheckDate = helpers_1.formatDate.toShortString(account.lastCheckDate);
            const balance = await account.computeBalance();
            content += `\t* ${accountsNameMap.get(account.id)} : `;
            content += `${formatCurrency(balance)} (`;
            content += helpers_1.translate('server.email.report.last_sync');
            content += ` ${lastCheckDate})\n`;
        }
        if (operationsByAccount.size) {
            content += '\n';
            content += helpers_1.translate('server.email.report.new_operations');
            content += '\n';
            for (const pair of operationsByAccount.values()) {
                // Sort operations by date or import date
                const operations = pair.operations.sort(compareTransactionsDates);
                const formatCurrency = await pair.account.getCurrencyFormatter();
                content += `\n${accountsNameMap.get(pair.account.id)}:\n`;
                for (const op of operations) {
                    const date = helpers_1.formatDate.toShortString(op.date);
                    content += `\t* ${date} - ${op.label} : `;
                    content += `${formatCurrency(op.amount)}\n`;
                }
            }
        }
        else {
            content += helpers_1.translate('server.email.report.no_new_operations');
        }
        content += '\n';
        content += helpers_1.translate('server.email.seeyoulater.report');
        content += '\n\n';
        content += helpers_1.translate('server.email.signature');
        const subject = `Kresus - ${helpers_1.translate('server.email.report.subject', { frequency })}`;
        return {
            subject,
            content
        };
    }
    computeIncludeAfter(frequency) {
        const includeAfter = moment_1.default();
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
                log.error('unexpected frequency in report-manager');
                break;
        }
        // The report is sent only for operations imported after
        // POLLER_START_HIGH_HOUR in the morning.
        includeAfter
            .hours(helpers_1.POLLER_START_HIGH_HOUR)
            .minutes(0)
            .seconds(0);
        return includeAfter.toDate();
    }
}
exports.default = new ReportManager();
