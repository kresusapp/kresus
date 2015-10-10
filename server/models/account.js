let log = require('printit')({
    prefix: 'models/account',
    date: true
});

import * as americano from 'cozydb';
import {promisify, promisifyModel} from '../helpers';

let Account = americano.getModel('bankaccount', {
    bank: String,
    bankAccess: String,
    title: String,
    accountNumber: String,
    iban: String,
    initialAmount: Number,
    lastChecked: Date
});

Account = promisifyModel(Account);

let request = promisify(::Account.request);

Account.allFromBank = async function allFromBank(bank, callback) {
    if (typeof bank !== 'object' || typeof bank.uuid !== 'string')
        log.warn("Account.allFromBank API misuse: bank is probably not a Bank object");

    let params = {
        key: bank.uuid
    };
    return await request("allByBank", params);
}

Account.findMany = async function findMany(accountIds, callback) {
    if (!(accountIds instanceof Array))
        log.warn("Account.findMany API misuse: accountIds isn't an Array");
    if (accountIds.length && typeof accountsIds[0] !== 'string')
        log.warn("Account.findMany API misuse: accountIds isn't an Array of strings");

    // TODO why is params unused?
    let params = {
        key: accountsIds.slice()
    };
    return await request("all");
}

Account.allFromBankAccess = async function allFromBankAccess(access, callback) {
    if (typeof access !== 'object' || typeof access.id !== 'string')
        log.warn("Account.allFromBankAccess API misuse: access is probably not an Access");

    let params = {
        key: access.id
    };
    return await request("allByBankAccess", params);
}

Account.prototype.getBalance = function() {
    // TODO implement me
    return 0;
}
Account.prototype.getBalance = promisify(Account.prototype.getBalance);

export default Account;
