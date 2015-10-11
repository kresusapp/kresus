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
        let alerts = await Alert.allReportsByFrequency(frequency);
        if (!alerts || !alerts.length) {
            return log.info(`User hasn't enabled ${frequency} report.`);
        }

        let includedAccounts = alerts.map((alert) => alert.bankAccount);

        let operations = await Operation.allFromBankAccounts(includedAccounts);
        let operationsByAccount = {};
        let timeFrame = this.getTimeFrame(frequency);
        for (let operation of operations) {
            let account = operation.bankAccount;
            let date = operation.dateImport || operation.date;
            if (moment(date).isAfter(timeFrame)) {
                operationsByAccount[account] = operationsByAccount[account] || [];
                operationsByAccount[account].push(operation);
            }
        }

        let accounts = await Account.findMany(includedAccounts);
        if (!accounts || !accounts.length) {
            throw "consistency error: an operation's account is not existing!";
        }

        let textContent = await this.getTextContent(operationsByAccount, accounts, frequency);
        await this.sendReport(frequency, textContent);
    }

    async sendReport(frequency, textContent) {
        let data = {
            from: "Kresus <kresus-noreply@cozycloud.cc>",
            subject: `[Kresus] ${frequency} report`,
            content: textContent,
            //html: textContent // TODO deactivated at the moment, make a nice
            //message later
        }

        await this.client.post("mail/to-user/", data);
        log.info("Report sent.");
    }

    async computeBalance(account) {
        let ops = await Operation.allFromBankAccount(account);
        return ops.reduce((sum, op) => sum + op.amount, account.initialAmount);
    }

    async getTextContent(operationsByAccount, accounts, frequency) {
        let today = moment().format("DD/MM/YYYY");
        let output =
            `Votre rapport bancaire du ${today}:

Solde de vos comptes:
            `;

        for (let account of accounts) {
            let lastCheck = moment(account.lastCheck).format("DD/MM/YYYY");
            output += `\t* ${account.accountNumber} (${account.title}) : ${await this.computeBalance(account)}€
                      (Dernière vérification : ${lastCheck})\n`;
        }

        if (Object.keys(operationsByAccount).length) {
            output += "\nNouvelles opérations importées :\n";
            for (let account in operationsByAccount) {
                let operations = operationsByAccount[account];
                output += `Compte n°${account}\n`;
                for (let operation of operations) {
                    output += `\t* ${operation.title} : ${operation.amount}€
                              (${moment(operation.date).format("DD/MM/YYYY")})\n`;
                }
            }
        } else {
            output += "Aucune nouvelle opération n'a été importée ${frequency}.";
        }
        return output;
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
