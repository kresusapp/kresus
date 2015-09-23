import {module as americano} from '../db';

let BankAlert = americano.getModel('bankalert', {
    bankAccount: String,
    type: String,        // possible options are: report, balance, transaction
    frequency: String,   // only for reports : daily, weekly, monthly
    limit: Number,       // only for balance/transaction
    order: String,       // only for balance/transaction: gt, lt
});

BankAlert.all = function(callback) {
    BankAlert.request("all", callback);
}

BankAlert.allFromBankAccount = function(account, callback) {
    let params = {
        key: account.id
    };
    BankAlert.request("allByBankAccount", params, callback);
}

BankAlert.allByAccountAndType = function(accountID, type, callback) {
    let params = {
        key: [accountID, type]
    };
    BankAlert.request("allByBankAccountAndType", params, callback);
}

BankAlert.allReportsByFrequency = function(frequency, callback) {
    let params = {
        key: ["report", frequency]
    };
    BankAlert.request("allReportsByFrequency", params, callback);
}

BankAlert.destroyByAccount = function(id, callback) {
    let params = {
        key: id
    };
    BankAlert.requestDestroy("allByBankAccount", params, callback);
}

BankAlert.prototype.testTransaction = function(operation) {
    if (this.type !== 'transaction')
        return false;

    let alertLimit = +this.limit;
    let amount = Math.abs(operation.amount);
    return (this.order === "lt" && amount <= alertLimit) ||
           (this.order === "gt" && amount >= alertLimit);
}

BankAlert.prototype.testBalance = function(account) {
    if (this.type !== 'balance')
        return false;

    let alertLimit = +this.limit;
    let balance = account.getBalance();
    return (this.order === "lt" && balance <= alertLimit) ||
           (this.order === "gt" && balance >= alertLimit);
}

export default BankAlert;
