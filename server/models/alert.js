let log = require('printit')({
    prefix: 'models/alert',
    date: true
});

import {module as americano} from '../db';
import {promisify, promisifyModel} from '../helpers';

let Alert = americano.getModel('bankalert', {
    bankAccount: String,
    type: String,        // possible options are: report, balance, transaction
    frequency: String,   // only for reports : daily, weekly, monthly
    limit: Number,       // only for balance/transaction
    order: String,       // only for balance/transaction: gt, lt
});

Alert = promisifyModel(Alert);

let request = promisify(::Alert.request);
let requestDestroy = promisify(::Alert.requestDestroy);

Alert.allFromBankAccount = async function allFromBankAccount(account) {
    if (typeof account !== 'string' || typeof account.id !== 'string')
        log.warn("Alert.allfromBankAccount API misuse: account is probably not an instance of Alert");

    let params = {
        key: account.id
    };
    return await request("allByBankAccount", params);
}

Alert.allByAccountAndType = async function allByAccountAndType(accountID, type) {
    if (typeof accountID !== 'string')
        log.warn("Alert.allByAccountAndType API misuse: accountID isn't a string");
    if (typeof type !== 'string')
        log.warn("Alert.allByAccountAndType API misuse: type isn't a string");

    let params = {
        key: [accountID, type]
    };
    return await request("allByBankAccountAndType", params);
}

Alert.allReportsByFrequency = async function allReportsByFrequency(frequency) {
    if (typeof frequency !== 'string')
        log.warn("Alert.allReportsByFrequency API misuse: frequency isn't a string");

    let params = {
        key: ["report", frequency]
    };
    return await request("allReportsByFrequency", params);
}

Alert.destroyByAccount = async function destroyByAccount(id) {
    if (typeof id !== 'string')
        log.warn("Alert.allByBankAccount API misuse: id isn't a string");

    let params = {
        key: id,
        limit: 9999999 // https://github.com/cozy/cozy-db/issues/41
    };
    return await requestDestroy("allByBankAccount", params);
}

// Sync function
Alert.prototype.testTransaction = function(operation) {
    if (this.type !== 'transaction')
        return false;

    let alertLimit = +this.limit;
    let amount = Math.abs(operation.amount);
    return (this.order === "lt" && amount <= alertLimit) ||
           (this.order === "gt" && amount >= alertLimit);
}

// Sync function
Alert.prototype.testBalance = function(account) {
    if (this.type !== 'balance')
        return false;

    let alertLimit = +this.limit;
    let balance = account.getBalance();
    return (this.order === "lt" && balance <= alertLimit) ||
           (this.order === "gt" && balance >= alertLimit);
}

export default Alert;
