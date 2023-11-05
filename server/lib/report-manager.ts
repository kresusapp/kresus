import moment from 'moment';

import {
    makeLogger,
    KError,
    translate as $t,
    formatDate,
    POLLER_START_LOW_HOUR,
    POLLER_START_HIGH_HOUR,
    displayLabel,
    unwrap,
} from '../helpers';

import { Access, Account, Alert, Category, Transaction } from '../models';
import { I18NObject } from '../shared/helpers';
import getEmailer, { Emailer } from './emailer';
import { getTranslator } from './translator';

const log = makeLogger('report-manager');

// Minimum duration between two reports: let T be any time, in the worst case,
// a report is sent at T + POLLER_START_HIGH_HOUR and the next one is sent at
// T + 24 + POLLER_START_LOW_HOUR.
const MIN_DURATION_BETWEEN_REPORTS =
    (24 + POLLER_START_LOW_HOUR - POLLER_START_HIGH_HOUR) * 60 * 60 * 1000;

type FrequencyString = 'daily' | 'weekly' | 'monthly';

class ReportManager {
    public async manageReports(userId: number): Promise<void> {
        try {
            const emailer = getEmailer();
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
        } catch (err) {
            log.warn(`Error when preparing reports: ${err}\n${err.stack}`);
        }
    }

    private async sendReport(
        emailer: Emailer,
        userId: number,
        subject: string,
        content: string
    ): Promise<void> {
        await emailer.sendToUser(userId, {
            subject,
            content,
        });

        log.info('Report sent.');
    }

    private async prepareReport(
        emailer: Emailer,
        userId: number,
        frequencyKey: FrequencyString
    ): Promise<void> {
        log.info(`Checking if user has enabled ${frequencyKey} report...`);

        const i18n = await getTranslator(userId);

        let reports = await Alert.reportsByFrequency(userId, frequencyKey);
        if (!reports || !reports.length) {
            return log.info(`User hasn't enabled ${frequencyKey} report.`);
        }

        const now = Date.now();

        // Prevent two reports to be sent on the same day (in case of restart).
        reports = reports.filter(al => {
            return (
                al.lastTriggeredDate === null ||
                now - al.lastTriggeredDate.getTime() >= MIN_DURATION_BETWEEN_REPORTS
            );
        });

        if (!reports || !reports.length) {
            return log.info('No report to send (already sent for this frequency).');
        }

        log.info('Report enabled and never sent, generating it...');
        const includedAccounts = reports.map(report => report.accountId);
        const accounts = await Account.findMany(userId, includedAccounts);
        if (!accounts || !accounts.length) {
            throw new KError("report's account does not exist");
        }

        const transactionsByAccount: Map<
            number,
            { account: Account; transactions: Transaction[] }
        > = new Map();
        for (const a of accounts) {
            transactionsByAccount.set(a.id, {
                account: a,
                transactions: [],
            });
        }

        const reportsMap: Map<number, Alert> = new Map();
        for (const report of reports) {
            reportsMap.set(report.accountId, report);
        }

        const transactions = await Transaction.byAccounts(userId, includedAccounts);
        let count = 0;

        for (const transaction of transactions) {
            const { accountId } = transaction;

            const report = unwrap(reportsMap.get(accountId));
            const includeAfter = report.lastTriggeredDate || this.computeIncludeAfter(frequencyKey);

            const date = transaction.importDate || transaction.date;
            if (moment(date).isAfter(includeAfter)) {
                if (!transactionsByAccount.has(accountId)) {
                    throw new KError("transaction's account does not exist");
                }
                unwrap(transactionsByAccount.get(accountId)).transactions.push(transaction);
                ++count;
            }
        }

        if (count) {
            const categoryToName: Map<number, string> = new Map();

            const categories = await Category.all(userId);
            for (const category of categories) {
                categoryToName.set(category.id, category.label);
            }

            const email = await this.getTextContent(
                userId,
                i18n,
                accounts,
                categoryToName,
                transactionsByAccount,
                frequencyKey
            );

            const { subject, content } = email;

            await this.sendReport(emailer, userId, subject, content);
        } else {
            log.info('no transactions to show in the report.');
        }

        // Update the last trigger even if there are no emails to send.
        const lastTriggeredDate = new Date();
        for (const report of reports) {
            await Alert.update(userId, report.id, { lastTriggeredDate });
        }
    }

    private async getTextContent(
        userId: number,
        i18n: I18NObject,
        accounts: Account[],
        categoryToName: Map<number | null, string>,
        transactionsByAccount: Map<number, { account: Account; transactions: Transaction[] }>,
        frequencyKey: FrequencyString
    ): Promise<{ subject: string; content: string }> {
        let frequency;
        switch (frequencyKey) {
            case 'daily':
                frequency = $t(i18n, 'server.email.report.daily');
                break;
            case 'weekly':
                frequency = $t(i18n, 'server.email.report.weekly');
                break;
            case 'monthly':
                frequency = $t(i18n, 'server.email.report.monthly');
                break;
            default:
                break;
        }

        const today = formatDate(i18n.localeId).toShortString(new Date());

        let content;
        content = $t(i18n, 'server.email.hello');
        content += '\n\n';
        content += $t(i18n, 'server.email.report.pre', { today });
        content += '\n';

        const accountsNameMap: Map<number, string> = new Map();

        const compareTransactionsDates = (a: Transaction, b: Transaction): number => {
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
                const access = unwrap(await Access.find(userId, account.accessId));
                accountsNameMap.set(account.id, `${access.getLabel()} – ${displayLabel(account)}`);
            }

            const formatCurrency = await account.getCurrencyFormatter();

            const lastCheckDate = formatDate(i18n.localeId).toShortString(account.lastCheckDate);
            content += `\t* ${accountsNameMap.get(account.id)} : `;
            content += `${formatCurrency(account.balance as number)} (`;
            content += $t(i18n, 'server.email.report.last_sync');
            content += ` ${lastCheckDate})\n`;
        }

        if (transactionsByAccount.size) {
            content += '\n';
            content += $t(i18n, 'server.email.report.new_transactions');
            content += '\n';
            for (const pair of transactionsByAccount.values()) {
                // Sort transactions by date or import date.
                const transactions = pair.transactions.sort(compareTransactionsDates);

                content += `\n${accountsNameMap.get(pair.account.id)}:\n`;
                if (transactions.length === 0) {
                    content += `\t${$t(i18n, 'server.email.report.no_new_transactions')}\n`;
                } else {
                    const formatCurrency = await pair.account.getCurrencyFormatter();
                    for (const transaction of transactions) {
                        const categoryString = categoryToName.get(transaction.categoryId);
                        const maybeCategory = categoryString ? `(${categoryString}) ` : '';
                        const date = formatDate(i18n.localeId).toShortString(transaction.date);
                        content += `\t* ${date} - ${transaction.label} ${maybeCategory}: `;
                        content += `${formatCurrency(transaction.amount)}\n`;
                    }
                }
            }
        } else {
            content += $t(i18n, 'server.email.report.no_new_transactions');
        }

        content += '\n';
        content += $t(i18n, 'server.email.seeyoulater.report');
        content += '\n\n';
        content += $t(i18n, 'server.email.signature');

        const subject = `Kresus - ${$t(i18n, 'server.email.report.subject', { frequency })}`;

        return {
            subject,
            content,
        };
    }

    private computeIncludeAfter(frequency: FrequencyString): Date {
        const includeAfter = moment();
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
        includeAfter.hours(POLLER_START_HIGH_HOUR).minutes(0).seconds(0);

        return includeAfter.toDate();
    }
}

export default new ReportManager();
