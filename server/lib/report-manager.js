import moment from 'moment';

import {JsonClient as Client} from 'request-json';
import {promisify} from '../helpers';

import Account   from '../models/account';
import Alert     from '../models/alert';
import Operation from '../models/operation';

let log = require('printit')({
    prefix: 'report-manager',
    date: true
});

class ReportManager
{
    constructor() {
        this.client = new Client("http://localhost:9101/");
        this.client.post = promisify(::this.client.post);

        if (process.kresus.standalone) {
            log.warn("report manager not implemented yet in standalone mode");
            return;
        }
        this.enabled = !process.kresus.standalone;

        if (process.kresus.prod)
            this.client.setBasicAuth(process.env.NAME, process.env.TOKEN);
    }

    async manageReports() {
        try {
            let now = moment();
            await this.prepareReport('daily');
            if (now.day() === 1)
                await this.prepareReport('weekly');
            if (now.date() === 1)
                await this.prepareReport('monthly');
        } catch(err) {
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
        let includedAccounts = alerts.map((alert) => alert.bankAccount);
        let accounts = await Account.findMany(includedAccounts);
        if (!accounts || !accounts.length) {
            throw "consistency error: an alert's account is not existing!";
        }

        let operationsByAccount = new Map;
        for (let a of accounts) {
            operationsByAccount.set(a.accountNumber, {account: a, operations: []});
        }

        let operations = await Operation.byAccounts(includedAccounts);
        let timeFrame = this.getTimeFrame(frequency);
        for (let operation of operations) {
            let account = operation.bankAccount;
            let date = operation.dateImport || operation.date;
            if (moment(date).isAfter(timeFrame)) {
                if (!operationsByAccount.has(account)) {
                    throw "consistency error: an operation's account is not existing!";
                }
                operationsByAccount.get(account).operations.push(operation);
            }
        }

        let {subject, content} = await this.getTextContent(accounts, operationsByAccount, frequency);
        await this.sendReport(frequency, subject, content);
    }

    async sendReport(frequency, subject, content) {
        let data = {
            from: "Kresus <kresus-noreply@cozycloud.cc>",
            subject,
            content,
            //html: content // TODO disabled at the moment, make a nice message later
        }

        await this.client.post("mail/to-user/", data);
        log.info("Report sent.");
    }

    async computeBalance(account) {
        let ops = await Operation.byAccount(account);
        return ops.reduce((sum, op) => sum + op.amount, account.initialAmount);
    }

    async getTextContent(accounts, operationsByAccount, frequency) {
        let subject = frequency === 'daily' ? 'quotidien'
                                            : frequency === 'weekly' ? 'hebdomadaire' : 'mensuel';
        subject = `Kresus - Votre rapport bancaire ${subject}`;

        let today = moment().format("DD/MM/YYYY");
        let content =
`Bonjour cher utilisateur de Kresus,

Voici votre rapport bancaire du ${today}, tout droit sorti du four.

Solde de vos comptes:
`;

        for (let account of accounts) {
            let lastCheck = moment(account.lastCheck).format("DD/MM/YYYY");
            let balance = Math.round(await this.computeBalance(account) * 100) / 100;
            content += `\t* ${account.title} : ${balance}€ (synchronisé pour la dernière fois le ${lastCheck})\n`;
        }

        if (Object.keys(operationsByAccount).length) {
            content += "\nNouvelles opérations importées au cours de cette période :\n";
            for (let pair of operationsByAccount.values()) {
                let operations = pair.operations;
                content += `\nCompte ${pair.account.title}:\n`;
                for (let operation of operations) {
                    let date = moment(operation.date).format("DD/MM/YYYY");
                    content += `\t* ${date} - ${operation.title} : ${operation.amount}€\n`;
                }
            }
        } else {
            content += "Aucune nouvelle opération n'a été importée au cours de cette période.";
        }

        content +=
`\nA bientôt pour un autre rapport,

Votre serviteur, Kresus.`

        return {subject, content};
    }

    getTimeFrame(frequency) {
        let timeFrame = moment().hours(0).minutes(0).seconds(0);
        switch(frequency) {
          case "daily":
            return timeFrame.subtract("days", 1);
          case "weekly":
            return timeFrame.subtract("days", 7);
          case "monthly":
            return timeFrame.subtract("months", 1).days(0);
        }
        log.error("unexpected timeframe in report-manager");
    }
};

export default new ReportManager();
