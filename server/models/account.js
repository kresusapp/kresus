import {module as americano} from '../db';

let BankAccount = americano.getModel('bankaccount', {
    bank: String,
    bankAccess: String,
    title: String,
    accountNumber: String,
    iban: String,
    initialAmount: Number,
    lastChecked: Date
});

BankAccount.all = function(callback) {
    BankAccount.request("allByTitle", callback);
}

BankAccount.allFromBank = function(bank, callback) {
    let params = {
        key: bank.uuid
    };
    BankAccount.request("allByBank", params, callback);
}

BankAccount.findMany = function(accountIds, callback) {
    // TODO why is params unused?
    let params = {
        key: accountsIds.slice()
    };
    BankAccount.request("all", callback);
}

BankAccount.allFromBankAccess = function(bankAccess, callback) {
    let params = {
        key: bankAccess.id
    };
    BankAccount.request("allByBankAccess", params, callback);
}

BankAccount.prototype.getBalance = function() {
    // TODO implement me
    return 0;
}

export default BankAccount;
