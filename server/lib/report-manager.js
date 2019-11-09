import {
    makeLogger,
    KError,
    translate as $t,
    formatDate,
    POLLER_START_LOW_HOUR,
    POLLER_START_HIGH_HOUR,
    displayLabel
} from '../helpers';

import Emailer from './emailer';

import Accounts from '../models/accounts';
import Alerts from '../models/alerts';
import Transactions from '../models/transactions';

import moment from 'moment';

let log = makeLogger('report-manager');

// Minimum duration between two reports: let T be any time, in the worst case,
// a report is sent at T + POLLER_START_HIGH_HOUR and the next one is sent at
// T + 24 + POLLER_START_LOW_HOUR.
const MIN_DURATION_BETWEEN_REPORTS =
    (24 + POLLER_START_LOW_HOUR - POLLER_START_HIGH_HOUR) * 60 * 60 * 1000;

class ReportManager {
    async sendReport(userId, subject, content) {
        await Emailer.sendToUser(userId, {
            subject,
            content
        });
        log.info('Report sent.');
    }

    async manageReports(userId) {
        try {
            let now = moment();
            await this.prepareReport(userId, 'daily');
            if (now.day() === 1) {
                await this.prepareReport(userId, 'weekly');
            }
            if (now.date() === 1) {
                await this.prepareReport(userId, 'monthly');
            }
        } catch (err) {
            log.warn(`Error when preparing reports: ${err}\n${err.stack}`);
        }
    }

    async prepareReport(userId, frequencyKey) {
        log.info(`Checking if user has enabled ${frequencyKey} report...`);

        let reports = await Alerts.reportsByFrequency(userId, frequencyKey);
        if (!reports || !reports.length) {
            return log.info(`User hasn't enabled ${frequencyKey} report.`);
        }

        let now = moment();

        // Prevent two reports to be sent on the same day (in case of restart).
        reports = reports.filter(al => {
            return (
                typeof al.lastTriggeredDate === 'undefined' ||
                now.diff(al.lastTriggeredDate) >= MIN_DURATION_BETWEEN_REPORTS
            );
        });

        if (!reports || !reports.length) {
            return log.info('No report to send (already sent for this frequency).');
        }

        log.info('Report enabled and never sent, generating it...');
        let includedAccounts = reports.map(report => report.accountId);
        let accounts = await Accounts.findMany(userId, includedAccounts);
        if (!accounts || !accounts.length) {
            throw new KError("report's account does not exist");
        }

        let operationsByAccount = new Map();
        for (let a of accounts) {
            a.formatCurrency = await a.getCurrencyFormatter();
            operationsByAccount.set(a.id, {
                account: a,
                operations: []
            });
        }

        let reportsMap = new Map();
        for (let report of reports) {
            reportsMap.set(report.accountId, report);
        }

        let operations = await Transactions.byAccounts(userId, includedAccounts);
        let count = 0;

        for (let operation of operations) {
            let { accountId } = operation;

            let report = reportsMap.get(accountId);
            let includeAfter = report.lastTriggeredDate || this.computeIncludeAfter(frequencyKey);
            includeAfter = moment(includeAfter);

            let date = operation.importDate || operation.date;
            if (moment(date).isAfter(includeAfter)) {
                if (!operationsByAccount.has(accountId)) {
                    throw new KError("operation's account does not exist");
                }
                operationsByAccount.get(accountId).operations.push(operation);
                ++count;
            }
        }

        if (count) {
            let email = await this.getTextContent(accounts, operationsByAccount, frequencyKey);

            let { subject, content } = email;

            await this.sendReport(userId, subject, content);
        } else {
            log.info('no operations to show in the report.');
        }

        // Update the last trigger even if there are no emails to send.
        let lastTriggeredDate = new Date();
        for (let report of reports) {
            await Alerts.update(userId, report.id, { lastTriggeredDate });
        }
    }

    async getTextContent(accounts, operationsByAccount, frequencyKey) {
        let frequency;
        switch (frequencyKey) {
            case 'daily':
                frequency = $t('server.email.report.daily');
                break;
            case 'weekly':
                frequency = $t('server.email.report.weekly');
                break;
            case 'monthly':
                frequency = $t('server.email.report.monthly');
                break;
            default:
                log.error('unexpected frequency in getTextContent');
        }

        let today = formatDate.toShortString();

        let content;
        content = $t('server.email.hello');
        content += '\n\n';
        content += $t('server.email.report.pre', { today });
        content += '\n';

        for (let account of accounts) {
            let lastCheckDate = formatDate.toShortString(account.lastCheckDate);
            let balance = await account.computeBalance();
            content += `\t* ${displayLabel(account)} : `;
            content += `${account.formatCurrency(balance)} (`;
            content += $t('server.email.report.last_sync');
            content += ` ${lastCheckDate})\n`;
        }

        if (operationsByAccount.size) {
            content += '\n';
            content += $t('server.email.report.new_operations');
            content += '\n';
            for (let pair of operationsByAccount.values()) {
                // Sort operations by date or import date
                let operations = pair.operations.sort((a, b) => {
                    let ad = a.date || a.importDate;
                    let bd = b.date || b.importDate;
                    if (ad < bd) {
                        return -1;
                    }
                    if (ad === bd) {
                        return 0;
                    }
                    return 1;
                });

                content += `\n${displayLabel(pair.account)}:\n`;
                for (let op of operations) {
                    let date = formatDate.toShortString(op.date);
                    content += `\t* ${date} - ${op.label} : `;
                    content += `${pair.account.formatCurrency(op.amount)}\n`;
                }
            }
        } else {
            content += $t('server.email.report.no_new_operations');
        }

        content += '\n';
        content += $t('server.email.seeyoulater.report');
        content += '\n\n';
        content += $t('server.email.signature');

        let subject;
        subject = $t('server.email.report.subject', { frequency });
        subject = `Kresus - ${subject}`;

        return {
            subject,
            content
        };
    }

    computeIncludeAfter(frequency) {
        let includeAfter = moment();
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
            .hours(POLLER_START_HIGH_HOUR)
            .minutes(0)
            .seconds(0);

        return includeAfter;
    }
}

export default new ReportManager();
