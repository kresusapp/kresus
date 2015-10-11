import NotificationsHelper from 'cozy-notifications-helper';

import Account         from '../models/account';
import Alert           from '../models/alert';
import Operation       from '../models/operation';

import appData             from '../../package.json';

let log = require('printit')({
    prefix: 'alert-manager',
    date: true
});

class AlertManager
{
    constructor() {
        this.notificator = new NotificationsHelper(appData.name);
        if (process.kresus.standalone) {
            log.warn("report manager not implemented yet in standalone mode");
            return;
        }
    }

    async checkAlertsForOperations(operations) {
        try {
            for (let operation of operations) {
                let alerts = await Alert.allByAccountAndType(operation.bankAccount, "transaction");
                if (!alerts)
                    continue;

                for (let alert of alerts) {
                    if (!alert.testTransaction(operation))
                        continue;
                    let params = {
                        text: alert.formatOperationMessage(operation.amount)
                    };
                    this.notificator.createTemporary(params);
                    log.info("Sent notification: ${params.text}");
                }
            }
        } catch(err) {
            log.error(`Error when checking alerts for operations: ${err}`);
        }
    }

    async computeBalance(account) {
        let ops = await Operation.allFromAccount(account.accountNumber);
        return ops.reduce((sum, op) => sum + op.amount, account.initialNumber);
    }

    async checkAlertsForAccounts() {
        try {
            let accounts = await Account.all();
            for (let account of accounts) {
                let alerts = await Alert.allByAccountAndType(account.accountNumber, "balance");
                if (!alerts)
                    continue;

                let balance = await this.computeBalance(account);
                for (let alert of alerts) {
                    if (!alert.testBalance(balance))
                        continue;

                    let params = {
                        text: alert.formatAccountMessage(account.title, balance)
                    };
                    this.notificator.createTemporary(params);
                    log.info("Sent notification: ${params.text}");
                }
            }
        } catch(err) {
            log.error(`Error when checking alerts for accounts: ${err}`);
        }
    }
}; // class

export default new AlertManager();
