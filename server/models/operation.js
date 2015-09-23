import {module as americano} from '../db';

// Whenever you're adding something to the model, don't forget to add it to this
// list if it should be transferred when merging duplicates.
// Also, this should be kept in sync with the merging of operations on the
// client side.
let FieldsToTransferUponMerge = ['categoryId', 'operationTypeID', 'binary', 'attachments'];

let BankOperation = americano.getModel('bankoperation', {
    bankAccount: String,         // actually the account number as in the bank, not as in the data-system
    title: String,
    date: Date,
    amount: Number,
    raw: String,
    dateImport: Date,
    categoryId: String,
    attachments: Object,         // {linkTranslationKey: String, linkPlainEnglish: String, url: String}
    operationTypeID: String,
    // Binary is an object containing one field (file) that links to a binary
    // document via an id. The binary document has a binary file
    // as attachment.
    binary: function(x) { return x; }
});

BankOperation.FieldsToTransferUponMerge = FieldsToTransferUponMerge;

BankOperation.all = function(callback) {
    BankOperation.request("all", callback);
}

BankOperation.allFromBankAccount = function(account, callback) {
    let params = {
        key: account.accountNumber
    };
    BankOperation.request("allByBankAccount", params, callback);
}

BankOperation.allFromBankAccounts = function(accountNums, callback) {
    let params = {
        keys: accountNums
    };
    BankOperation.request("allByBankAccount", params, callback);
}

BankOperation.allFromBankAccountDate = function(account, callback) {
    let params = {
        startkey: [account.accountNumber + "0"],
        endkey: [account.accountNumber],
        descending: true
    };
    BankOperation.request("allByBankAccountAndDate", params, callback);
}

BankOperation.allLike = function(operation, callback) {
    let date = new Date(operation.date).toISOString();
    let amount = (+operation.amount).toFixed(2);
    let params = {
        key: [operation.bankAccount, date, amount, operation.raw]
    };
    BankOperation.request("allLike", params, callback);
}

BankOperation.destroyByAccount = function(accountNum, callback) {
    let params = {
        key: accountNum
    };
    BankOperation.requestDestroy("allByBankAccount", params, callback);
}

BankOperation.allByCategory = function(categoryId, callback) {
    if (typeof categoryId !== 'string')
        log.warn(`allByCategory API misuse: ${categoryId}`);

    let params = {
        key: categoryId
    };

    BankOperation.request("allByCategory", params, callback);
}

export default BankOperation;
