let moment        = require('moment');
let Client        = require('request-json').JsonClient;
let jade          = require('jade');

let BankAlert     = require('../models/alert');
let BankOperation = require('../models/operation');
let BankAccount   = require('../models/account');

let log = require('printit')({
    prefix: 'report-manager',
    date: true
});

class ReportManager
{

    constructor() {
        this.client = new Client("http://localhost:9101/");

        // TODO fix this
        if (process.kresus.standalone) {
            log.warn("report manager not implemented yet in standalone mode");
            return;
        }

        if (process.kresus.prod)
            this.client.setBasicAuth(process.env.NAME, process.env.TOKEN);
    }

    start() {
        this.prepareNextCheck();
    }

    prepareNextCheck() {
        // day after between 02:00am and 04:00am
        // this must be triggered AFTER accounts were polled
        // TODO implement a system of notifications internal to the server
        let delta = Math.floor(Math.random() * 120);
        let now = moment();
        let nextUpdate = now.clone().add(1, 'days')
                            .hours(2)
                            .minutes(delta)
                            .seconds(0);

        let format = "DD/MM/YYYY [at] HH:mm:ss";
        log.info(`> Next check to send report ${nextUpdate.format(format)}`);
        this.timeout = setTimeout(this.manageReports.bind(this), nextUpdate.diff(now));
    }

    manageReports() {
        let now = moment();
        this.prepareReport('daily');
        if (now.day() === 1)
            this.prepareReport('weekly');
        if (now.date() === 1)
            this.prepareReport('monthly');
        this.prepareNextCheck();
    }

    prepareReport(frequency) {

        log.info(`Checking if user has enabled ${frequency} report...`);

        BankAlert.allReportsByFrequency(frequency, (err, alerts) => {

            if (err) {
                let msg = `Couldn't retrieve alerts -- ${err}`;
                log.info(msg);
                callback(msg);
                return;
            }

            // bank accounts for reports should be generated for
            let includedBankAccounts = alerts.map((alert) => alert.bankAccount);

            if (!alerts.length) {
                log.info `User hasn't enabled ${frequency} report.`;
                return;
            }

            this._prepareOperationsData(frequency, includedBankAccounts, (err, operationsByAccount) => {
                this._prepareBalancesData(frequency, includedBankAccounts, (err, accounts) => {
                    if (accounts.length > 0) {
                        let textContent = this._getTextContent(operationsByAccount, accounts, frequency);
                        let htmlContent = this._getHtmlContent(operationsByAccount, accounts, frequency);
                        this._sendReport(frequency, textContent, htmlContent);
                    }
                });
            });

        });
    }

    _prepareBalancesData(frequency, accounts, callback) {
        BankAccount.findMany(accounts, (err, accounts) => {
            if (err) {
                let msg = `Couldn't retrieve accounts -- ${err}`;
                log.info(msg);
                callback(msg);
                return;
            }

            callback(null, accounts);
        });
    }

    _prepareOperationsData(frequency, accounts, callback) {
        // FIXME broken: accounts is an array of accountId, but
        // allFromBankAccount expects accountNumber...
        BankOperation.allFromBankAccount(accounts, (err, operations) => {
            if (err) {
                let msg = `Couldn't retrieve operations -- ${err}`;
                log.info(msg);
                callback(msg);
                return;
            }

            // filter the ones which are in the right time frame
            let operationsByAccount = {};
            let timeFrame = this._getTimeFrame(frequency);
            for (let operation of operations) {
                let account = operation.bankAccount;
                let date = operation.dateImport || operation.date;
                if (moment(date).isAfter(timeFrame)) {
                    operationsByAccount[account] = operationsByAccount[account] || [];
                    operationsByAccount[account].push(operation);
                }
            }
            callback(null, operationsByAccount);
        });
    }

    _sendReport(frequency, textContent, htmlContent) {
        let data = {
            from: "Kresus <kresus-noreply@cozycloud.cc>",
            subject: `[Kresus] ${frequency} report`,
            content: textContent,
            html: htmlContent
        }
        this.client.post("mail/to-user/", data, (err, res, body) => {
            if (err) {
                let msg = "An error occurred while sending an email";
                log.info("${msg} -- ${err}");
                return;
            }
            log.info("Report sent.");
        });
    }

    _getTextContent(operationsByAccount, accounts, frequency) {
        let today = moment().format("DD/MM/YYYY");
        let output =
            `Votre rapport bancaire du ${today}:

            Solde de vos comptes:
            `;

        for (let account of accounts) {
            let lastCheck = moment(account.lastCheck).format("DD/MM/YYYY");
            output += `\t* ${account.accountNumber} (${account.title}) : ${account.getBalance()}€
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

    _getHtmlContent(operationsByAccount, accounts, frequency) {
        let today = moment().format("DD/MM/YYYY");
        let options = {
            today,
            accounts,
            operationsByAccount,
            moment
        }
        return jade.renderFile('./server/views/mail-report.jade', options);
    }

    _getTimeFrame(frequency) {
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
