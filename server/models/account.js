import * as americano from 'cozydb';
import { makeLogger, promisify, promisifyModel } from '../helpers';

import Operation from './operation';

let log = makeLogger('models/account');

let Account = americano.getModel('bankaccount', {
    // Weboob module name
    bank: String,

    // bankAccess is an internal (couchdb) id
    bankAccess: String,

    title: String,
    accountNumber: String,
    iban: String,
    initialAmount: Number,
    currency: String,
    lastChecked: Date,
    importDate: Date
});

Account = promisifyModel(Account);

let request = promisify(::Account.request);

Account.byBank = async function byBank(bank) {
    if (typeof bank !== 'object' || typeof bank.uuid !== 'string')
        log.warn('Account.byBank misuse: bank must be a Bank instance');

    let params = {
        key: bank.uuid
    };
    return await request('allByBank', params);
};

Account.findMany = async function findMany(accountIds) {
    if (!(accountIds instanceof Array))
        log.warn('Account.findMany misuse: accountIds must be an Array');
    if (accountIds.length && typeof accountIds[0] !== 'string')
        log.warn('Account.findMany misuse: accountIds must be a [String]');

    let params = {
        keys: accountIds.slice()
    };
    return await request('allByAccountNumber', params);
};

Account.byAccountNumber = async function byAccountNumber(accountNumber) {
    if (typeof accountNumber !== 'string')
        log.warn('Account.byAccountNumber misuse: 1st param must be a string');

    let params = {
        key: accountNumber
    };
    return await request('allByAccountNumber', params);
};

Account.byAccess = async function byAccess(access) {
    if (typeof access !== 'object' || typeof access.id !== 'string')
        log.warn('Account.byAccess misuse: access must be an Access instance');

    let params = {
        key: access.id
    };
    return await request('allByBankAccess', params);
};

Account.prototype.computeBalance = async function computeBalance() {
    let ops = await Operation.byAccount(this);
    let s = ops.reduce((sum, op) => sum + op.amount, this.initialAmount);
    return Math.round(s * 100) / 100;
};

module.exports = Account;
