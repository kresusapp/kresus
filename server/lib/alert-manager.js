import NotificationsHelper from 'cozy-notifications-helper';

import BankAccount         from '../models/account';
import BankAlert           from '../models/alert';

import appData             from '../../package.json';

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

    async checkAlertsForOperations(operations) {
        try {
            for (let operation of operations) {
                let alerts = await BankAlert.allByAccountAndType(operation.bankAccount, "transaction");
                if (!alerts)
                    continue;

                for (let alert of alerts) {
                    if (!alert.testTransaction(operation))
                        continue;

                    // TODO fix this: this should be inherent to testTransaction + i10n
                    let comparator = alert.order === "lt" ? "inférieur" : "supérieur";
                    let text = `Alerte : transaction d'un montant ${comparator} à ${alert.limit}€`;
                    let params = {
                        text: `${text} (${operation.amount}€)`
                    };
                    this.notificator.createTemporary(params);
                }
            }
        } catch(err) {
            log.error(`Error when checking alerts for operations: ${err}`);
        }
    }

    async checkAlertsForAccounts() {
        try {
            // TODO incorrect if you have several bank accounts
            let accounts = await BankAccount.all();
            for (let account of accounts) {
                let alerts = await BankAlert.allByAccountAndType(account.id, "balance");
                if (!alerts)
                    continue;

                for (let alert of alerts) {

                    if (!alert.testBalance(account))
                        continue;

                    // TODO fix this too (see also the other function)
                    let threshold = alert.order === "lt" ? "sous le seuil de" : "au dessus du seuil de";
                    let text = `Alerte : ${account.title} ${threshold} ${alert.limit}€ (${account.getBalance()}€)`;
                    let params = { text };
                    this.notificator.createTemporary(params);
                }

            }
        } catch(err) {
            log.error(`Error when checking alerts for accounts: ${err}`);
        }
    }
}; // class

export default new AlertManager();
