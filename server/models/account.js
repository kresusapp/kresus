import * as americano from 'cozydb';
import {makeLogger, promisify, promisifyModel} from '../helpers';

import Operation from './operation';

let log = makeLogger('models/account');

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

Account.byBank = async function byBank(bank, callback) {
    if (typeof bank !== 'object' || typeof bank.uuid !== 'string')
        log.warn("Account.byBank API misuse: bank is probably not a Bank object");

    let params = {
        key: bank.uuid
    };
    return await request("allByBank", params);
}

Account.findMany = async function findMany(accountIds, callback) {
    if (!(accountIds instanceof Array))
        log.warn("Account.findMany API misuse: accountIds isn't an Array");
    if (accountIds.length && typeof accountIds[0] !== 'string')
        log.warn("Account.findMany API misuse: accountIds isn't an Array of strings");

    let params = {
        keys: accountIds.slice()
    };
    return await request("allByAccountNumber", params);
}

Account.byAccountNumber = async function byAccountNumber(accountNumber, callback) {
    if (typeof accountNumber !== 'string')
        log.warn("Account.byAccountNumber API misuse: accountNumber isn't a string");

    let params = {
        key: accountNumber
    };
    return await request("allByAccountNumber", params);
}

Account.byAccess = async function byAccess(access, callback) {
    if (typeof access !== 'object' || typeof access.id !== 'string')
        log.warn("Account.byAccess API misuse: access is probably not an Access");

    let params = {
        key: access.id
    };
    return await request("allByBankAccess", params);
}

Account.prototype.computeBalance = async function computeBalance() {
    let ops = await Operation.byAccount(this);
    let s = ops.reduce((sum, op) => sum + op.amount, this.initialAmount);
    return Math.round(s * 100) / 100;
}

export default Account;
