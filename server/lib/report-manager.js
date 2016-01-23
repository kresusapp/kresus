import moment from 'moment';

import { makeLogger, KError } from '../helpers';
import Emailer from './emailer';

import Account   from '../models/account';
import Alert     from '../models/alert';
import Operation from '../models/operation';

let log = makeLogger('report-manager');

class ReportManager
{
    async manageReports() {
        try {
            let now = moment();
            await this.prepareReport('daily');
            if (now.day() === 1)
                await this.prepareReport('weekly');
            if (now.date() === 1)
                await this.prepareReport('monthly');
        } catch (err) {
            log.warn(`Error when preparing reports: ${err.toString()}`);
        }
    }

    async prepareReport(frequency) {
        log.info(`Checking if user has enabled ${frequency} report...`);
        let alerts = await Alert.reportsByFrequency(frequency);
        if (!alerts || !alerts.length) {
            return log.info(`User hasn't enabled ${frequency} report.`);
        }

        log.info('Report enabled, generating it...');
        let includedAccounts = alerts.map(alert => alert.bankAccount);
        let accounts = await Account.findMany(includedAccounts);
        if (!accounts || !accounts.length) {
            throw new KError("alert's account does not exist");
        }

        let operationsByAccount = new Map;
        for (let a of accounts) {
            operationsByAccount.set(a.accountNumber,
                                    { account: a, operations: [] });
        }

        let operations = await Operation.byAccounts(includedAccounts);
        let timeFrame = this.getTimeFrame(frequency);
        let count = 0;
        for (let operation of operations) {
            let account = operation.bankAccount;
            let date = operation.dateImport || operation.date;
            if (moment(date).isAfter(timeFrame)) {
                if (!operationsByAccount.has(account)) {
                    throw new KError("operation's account does not exist");
                }
                operationsByAccount.get(account).operations.push(operation);
                ++count;
            }
        }

        if (!count)
            return log.info('no operations to show in the report.');

        let { subject, content } =
            await this.getTextContent(accounts, operationsByAccount, frequency);
        await this.sendReport(subject, content);
    }

    async sendReport(subject, content) {
        await Emailer.sendToUser({
            subject,
            content
        });
        log.info('Report sent.');
    }

    async getTextContent(accounts, operationsByAccount, frequency) {

        let subject;
        switch (frequency) {
            case 'daily': subject = 'quotidien'; break;
            case 'weekly': subject = 'hebdomadaire'; break;
            case 'monthly': subject = 'mensuel'; break;
            default: log.error('unexpected frequency in getTextContent');
        }

        subject = `Kresus - Votre rapport bancaire ${subject}`;

        let today = moment().format('DD/MM/YYYY');
        let content =
`Bonjour cher utilisateur de Kresus,

Voici votre rapport bancaire du ${today}, tout droit sorti du four.

Solde de vos comptes:
`;

        for (let account of accounts) {
            let lastCheck = moment(account.lastCheck).format('DD/MM/YYYY');
            let balance = await account.computeBalance();
            content += `\t* ${account.title} : ${balance}€
                        (synchronisé pour la dernière fois le ${lastCheck})\n`;
        }

        if (Object.keys(operationsByAccount).length) {
            content +=
                '\nNouvelles opérations importées durant cette période :\n';
            for (let pair of operationsByAccount.values()) {

                // Sort operations by date or import date
                let operations = pair.operations.sort((a, b) => {
                    let ad = a.date || a.dateImport;
                    let bd = b.date || b.dateImport;
                    if (ad < bd)
                        return -1;
                    if (ad === bd)
                        return 0;
                    return 1;
                });

                content += `\nCompte ${pair.account.title}:\n`;
                for (let op of operations) {
                    let date = moment(op.date).format('DD/MM/YYYY');
                    content += `\t* ${date} - ${op.title} : ${op.amount}€\n`;
                }
            }
        } else {
            content +=
`Aucune nouvelle opération n'a été importée au cours de cette période.`;
        }

        content +=
`\nA bientôt pour un autre rapport,

Votre serviteur, Kresus.`;

        return { subject, content };
    }

    getTimeFrame(frequency) {
        let timeFrame = moment().hours(0).minutes(0).seconds(0);
        switch (frequency) {
            case 'daily':   return timeFrame.subtract('days', 1);
            case 'weekly':  return timeFrame.subtract('days', 7);
            case 'monthly': return timeFrame.subtract('months', 1).days(0);
            default: break;
        }
        log.error('unexpected timeframe in report-manager');
    }
}

export default new ReportManager();
