import * as cozydb from 'cozydb';
import moment from 'moment';

import {
    assert,
    currency,
    makeLogger,
    promisify,
    promisifyModel,
    UNKNOWN_ACCOUNT_TYPE,
    shouldIncludeInBalance,
    shouldIncludeInOutstandingSum
} from '../../helpers';

import Settings from './settings';
import Transactions from './transactions';

let log = makeLogger('models/accounts');

let Account = cozydb.getModel('bankaccount', {
    // ************************************************************************
    // EXTERNAL LINKS
    // ************************************************************************

    // External (backend) bank module identifier, determining which source to use.
    // TODO could be removed, since this is in the linked access?
    vendorId: String,

    // Id of the bankaccess instance.
    accessId: String,

    // Account number provided by the source. Acts as an id for other models.
    vendorAccountId: String,

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

    // Balance on the account, at the date at which it has been imported.
    initialBalance: Number,

    // Date at which the account has been polled for the last time.
    lastCheckDate: Date,

    // Label describing the account provided by the source.
    label: String,

    // description entered by the user.
    customLabel: String,

    // IBAN provided by the source (optional).
    iban: String,

    // Currency used by the account.
    currency: String,

    // If true, this account is not used to eval the balance of an access.
    excludeFromBalance: Boolean,

    // DEPRECATED FIELDS

    // Former name of initialBalance.
    initialAmount: Number,

    // External (backend) bank module identifier, determining which source to
    // use. Replaced with vendorId.
    bank: String,

    // renamed to lastCheckDate.
    lastChecked: Date,

    // renamed to accessId.
    bankAccess: String,

    // renamed to vendorAccountId.
    accountNumber: String,

    // renamed to label.
    title: String
});

Account = promisifyModel(Account);

Account.renamings = {
    initialAmount: 'initialBalance',
    bank: 'vendorId',
    lastChecked: 'lastCheckDate',
    bankAccess: 'accessId',
    accountNumber: 'vendorAccountId',
    title: 'label'
};

let request = promisify(Account.request.bind(Account));

Account.byVendorId = async function byVendorId(userId, bank) {
    assert(userId === 0, 'Account.byVendorId first arg must be the userId.');

    if (typeof bank !== 'object' || typeof bank.uuid !== 'string') {
        log.warn('Account.byVendorId misuse: bank must be a Bank instance');
    }

    let params = {
        key: bank.uuid
    };
    return await request('allByVendorId', params);
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
    return await request('allByAccessId', params);
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
    let today = moment();
    let s = ops
        .filter(op => shouldIncludeInBalance(op, today, this.type))
        .reduce((sum, op) => sum + op.amount, this.initialBalance);
    return Math.round(s * 100) / 100;
};

Account.prototype.computeOutstandingSum = async function computeOutstandingSum() {
    let userId = await this.getUserId();
    let ops = await Transactions.byAccount(userId, this);
    let s = ops
        .filter(op => shouldIncludeInOutstandingSum(op))
        .reduce((sum, op) => sum + op.amount, 0);
    return Math.round(s * 100) / 100;
};

Account.prototype.getUserId = async function getUserId() {
    return process.kresus.user.id;
};

Account.prototype.getCurrencyFormatter = async function getCurrencyFormatter() {
    let curr = currency.isKnown(this.currency)
        ? this.currency
        : (await Settings.findOrCreateDefault(await this.getUserId(), 'default-currency')).value;

    return currency.makeFormat(curr);
};

module.exports = Account;
