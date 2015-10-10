let log = require('printit')({
    prefix: 'models/operations',
    date: true
});

import {module as americano} from '../db';
import {promisify, promisifyModel} from '../helpers';

// Whenever you're adding something to the model, don't forget to add it to this
// list if it should be transferred when merging duplicates.
// Also, this should be kept in sync with the merging of operations on the
// client side.
let FieldsToTransferUponMerge = ['categoryId', 'operationTypeID', 'binary', 'attachments'];

let Operation = americano.getModel('bankoperation', {
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

Operation = promisifyModel(Operation);

Operation.FieldsToTransferUponMerge = FieldsToTransferUponMerge;

let request = promisify(::Operation.request);
let requestDestroy = promisify(::Operation.requestDestroy);

Operation.allFromBankAccount = async function allFromBankAccount(account) {
    if (typeof account !== 'object' || typeof account.accountNumber !== 'string')
        log.warn("Operation.allFromBankAccount API misuse: account is probably not an Account");

    let params = {
        key: account.accountNumber
    };
    return await request("allByBankAccount", params);
}

Operation.allFromBankAccounts = async function allFromBankAccounts(accountNums) {
    if (!(accountNums instanceof Array))
        log.warn("Operation.allFromBankAccounts API misuse: accountNums isn't an array");

    let params = {
        keys: accountNums
    };
    return await request("allByBankAccount", params);
}

Operation.allFromBankAccountDate = async function allFromBankAccountDate(account) {
    if (typeof account !== 'object' || typeof account.accountNumber !== 'string')
        log.warn("Operation.allFromBankAccountDate API misuse: account is probably not an Account");

    let params = {
        startkey: [account.accountNumber + "0"],
        endkey: [account.accountNumber],
        descending: true
    };
    return await request("allByBankAccountAndDate", params);
}

Operation.allLike = async function allLike(operation) {
    if (typeof operation !== 'object')
        log.warn("Operation.allLike API misuse: operation isn't an object");

    let date = new Date(operation.date).toISOString();
    let amount = (+operation.amount).toFixed(2);
    let params = {
        key: [operation.bankAccount, date, amount, operation.raw]
    };
    return await request("allLike", params);
}

Operation.destroyByAccount = async function destroyByAccount(accountNum) {
    if (typeof accountNum !== 'string')
        log.warn("Operation.destroyByAccount API misuse: accountNum isn't a string");

    let params = {
        key: accountNum,
        limit: 9999999 // https://github.com/cozy/cozy-db/issues/41
    };
    return await requestDestroy("allByBankAccount", params);
}

Operation.allByCategory = async function allByCategory(categoryId) {
    if (typeof categoryId !== 'string')
        log.warn(`allByCategory API misuse: ${categoryId}`);

    let params = {
        key: categoryId
    };
    return await request("allByCategory", params);
}

export default Operation;
