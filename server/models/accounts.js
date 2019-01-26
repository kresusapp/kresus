import * as cozydb from 'cozydb';
import { assert, makeLogger, promisify, promisifyModel, UNKNOWN_ACCOUNT_TYPE } from '../helpers';

import Transactions from './transactions';

let log = makeLogger('models/accounts');

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

    // external (backend) type id or UNKNOWN_ACCOUNT_TYPE.
    type: {
        type: String,
        default: UNKNOWN_ACCOUNT_TYPE
    },

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

    // description entered by the user.
    customLabel: String,

    // IBAN provided by the source (optional).
    iban: String,

    // Currency used by the account.
    currency: String,

    // If true, this account is not used to eval the balance of an access.
    excludeFromBalance: Boolean
});

Account = promisifyModel(Account);

let request = promisify(Account.request.bind(Account));

Account.byBank = async function byBank(userId, bank) {
    assert(userId === 0, 'Account.byBank first arg must be the userId.');

    if (typeof bank !== 'object' || typeof bank.uuid !== 'string') {
        log.warn('Account.byBank misuse: bank must be a Bank instance');
    }

    let params = {
        key: bank.uuid
    };
    return await request('allByBank', params);
};

Account.findMany = async function findMany(userId, accountIds) {
    assert(userId === 0, 'Account.findMany first arg must be the userId.');

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

Account.byAccess = async function byAccess(userId, access) {
    assert(userId === 0, 'Account.byAccess first arg must be the userId.');
    if (typeof access !== 'object' || typeof access.id !== 'string') {
        log.warn('Account.byAccess misuse: access must be an Access instance');
    }

    let params = {
        key: access.id
    };
    return await request('allByBankAccess', params);
};

let olderCreate = Account.create;
Account.create = async function(userId, attributes) {
    assert(userId === 0, 'Account.create first arg must be the userId.');
    return await olderCreate(attributes);
};

let olderFind = Account.find;
Account.find = async function(userId, accountId) {
    assert(userId === 0, 'Account.find first arg must be the userId.');
    return await olderFind(accountId);
};

let olderAll = Account.all;
Account.all = async function(userId) {
    assert(userId === 0, 'Account.all first arg must be the userId.');
    return await olderAll();
};

let olderDestroy = Account.destroy;
Account.destroy = async function(userId, accountId) {
    assert(userId === 0, 'Account.destroy first arg must be the userId.');
    return await olderDestroy(accountId);
};

let olderUpdateAttributes = Account.updateAttributes;
Account.update = async function(userId, accountId, fields) {
    assert(userId === 0, 'Account.update first arg must be the userId.');
    return await olderUpdateAttributes(accountId, fields);
};

Account.updateAttributes = function() {
    assert(false, 'Account.updateAttributes is deprecated. Please use Account.update');
};

Account.prototype.computeBalance = async function computeBalance() {
    let userId = await this.getUserId();
    let ops = await Transactions.byAccount(userId, this);
    let s = ops.reduce((sum, op) => sum + op.amount, this.initialAmount);
    return Math.round(s * 100) / 100;
};

Account.prototype.getUserId = async function getUserId() {
    return process.kresus.user.id;
};

module.exports = Account;
