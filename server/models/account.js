import * as cozydb from 'cozydb';
import { makeLogger, promisify, promisifyModel } from '../helpers';

import Operation from './operation';

let log = makeLogger('models/account');

let Account = cozydb.getModel('bankaccount', {
    // ************************************************************************
    // EXTERNAL LINKS
    // ************************************************************************

    // External (backend) bank module identifier, determining which source to use.
    // TODO could be removed, since this is in the linked access?
    bank: String,

    // Id of the bankaccess instance.
    bankAccess: String,

    // Account number provided by the source. Acts as an id for other models.
    accountNumber: String,

    // ************************************************************************
    // ACCOUNT INFORMATION
    // ************************************************************************

    // Date at which the account has been imported.
    importDate: Date,

    // Amount on the account, at the date at which it has been imported.
    initialAmount: Number,

    // Date at which the account has been polled for the last time.
    lastChecked: Date,

    // Label describing the account provided by the source.
    title: String,

    // IBAN provided by the source (optional).
    iban: String,

    // Currency used by the account.
    currency: String,

    // If true, this account is not used to eval the balance of an access.
    excludeFromBalance: Boolean
});

Account = promisifyModel(Account);

let request = promisify(Account.request.bind(Account));

Account.byBank = async function byBank(bank) {
    if (typeof bank !== 'object' || typeof bank.uuid !== 'string') {
        log.warn('Account.byBank misuse: bank must be a Bank instance');
    }

    let params = {
        key: bank.uuid
    };
    return await request('allByBank', params);
};

Account.findMany = async function findMany(accountIds) {
    if (!(accountIds instanceof Array)) {
        log.warn('Account.findMany misuse: accountIds must be an Array');
    }
    if (accountIds.length && typeof accountIds[0] !== 'string') {
        log.warn('Account.findMany misuse: accountIds must be a [String]');
    }

    let params = {
        keys: accountIds.slice()
    };
    return await request('allByAccountIds', params);
};

Account.byAccess = async function byAccess(access) {
    if (typeof access !== 'object' || typeof access.id !== 'string') {
        log.warn('Account.byAccess misuse: access must be an Access instance');
    }

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
