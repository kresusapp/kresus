let async               = require('async');

let BankAccount         = require('../models/account');
let BankAlert           = require('../models/alert');
let BankOperation       = require('../models/operation');

let NotificationsHelper = require('cozy-notifications-helper');
let appData             = require('../../package.json');

let log = require('printit')({
    prefix: 'alert-manager',
    date: true
});

class AlertManager
{

    constructor() {
        this.notificator = new NotificationsHelper(appData.name);

        // TODO fix this
        if (process.kresus.standalone) {
            log.warn("report manager not implemented yet in standalone mode");
            return;
        }
    }

    checkAlertsForOperations(operations, callback) {

        let process = (operation, callback) => {
            BankAlert.allByAccountAndType(operation.bankAccount, "transaction", (err, alerts) => {

                if (err)
                    return callback(err);

                if (!alerts)
                    return callback();

                for (let alert of alerts) {

                    if (alert.testTransaction(operation)) {
                        let comparator;
                        // TODO fix this: this should be inherent to
                        // testTransaction + i10n
                        if (alert.order === "lt")
                            comparator = "inférieur";
                        else
                            comparator = "supérieur";
                        let text = `Alerte : transaction d'un montant ${comparator} à ${alert.limit}€`;
                        let params = {
                            text: `${text} (${operation.amount}€)`
                        };
                        this.notificator.createTemporary(params);
                    }

                }

                callback();
            });
        }

        async.each(operations, process, callback);
    }

    checkAlertsForAccounts(callback) {
        // TODO incorrect if you have several bank accounts
        BankAccount.all((err, accounts) => {

            let process = (account, callback) => {
                BankAlert.allByAccountAndType(account.id, "balance", (err, alerts) => {

                    if (err)
                        return callback(err);

                    if (!alerts)
                        return callback();

                    for (let alert of alerts) {

                        if (alert.testBalance(account)) {
                            // TODO fix this too (see also the other function)
                            let threshold;
                            if (alert.order === "lt")
                                threshold = "sous le seuil de";
                            else
                                threshold = "au dessus du seuil de";
                            let text = `Alerte : ${account.title} ${threshold} ${alert.limit}€ (${account.getBalance()}€)`;
                            let params = {
                                text
                            };
                            this.notificator.createTemporary(params);
                        }

                    }

                    callback();
                });
            }

            async.each(accounts, process, callback);
        });
    }
}; // class

export default new AlertManager();
