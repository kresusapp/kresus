import * as cozydb from 'cozydb';

import {
    assert,
    makeLogger,
    promisify,
    promisifyModel,
    UNKNOWN_OPERATION_TYPE
} from '../../helpers';
import { mergeWith } from './helpers';

let log = makeLogger('models/transactions');

// Whenever you're adding something to the model, don't forget to modify
// the mergeWith function in the helpers file.

let Transaction = cozydb.getModel('bankoperation', {
    // ************************************************************************
    // EXTERNAL LINKS
    // ************************************************************************

    // Internal account id, to which the transaction is attached
    accountId: String,

    // internal category id.
    categoryId: String,

    // external (backend) type id or UNKNOWN_OPERATION_TYPE.
    type: {
        type: String,
        default: UNKNOWN_OPERATION_TYPE
    },

    // ************************************************************************
    // TEXT FIELDS
    // ************************************************************************

    // short summary of what the operation is about.
    label: String,

    // long description of what the operation is about.
    rawLabel: String,

    // description entered by the user.
    customLabel: String,

    // ************************************************************************
    // DATE FIELDS
    // ************************************************************************

    // date at which the operation has been processed by the backend.
    date: Date,

    // date at which the operation has been imported into kresus.
    importDate: Date,

    // date at which the operation has to be applied
    budgetDate: Date,

    // date at which the transaction was (or will be) debited.
    debitDate: Date,

    // ************************************************************************
    // OTHER TRANSACTION FIELDS
    // ************************************************************************

    // amount of the operation, in a certain currency.
    amount: Number,

    // whether the user has created the operation by itself, or if the backend
    // did.
    createdByUser: Boolean,

    // ************************************************************************
    // DEPRECATED
    // ************************************************************************

    // TODO: remove linkPlainEnglish?
    // {linkTranslationKey: String, linkPlainEnglish: String, url: String}
    attachments: Object,

    // TODO merge with attachments?
    // Binary is an object containing one field (file) that links to a binary
    // document via an id. The binary document has a binary file
    // as attachment.
    binary: x => x,

    // internal operation type id.
    operationTypeID: String,

    // external (backend) account id.
    bankAccount: String,

    // renamed to rawLabel.
    raw: String,

    // renamed to importDate.
    dateImport: Date,

    // renamed to label.
    title: String
});

Transaction = promisifyModel(Transaction);

Transaction.renamings = {
    raw: 'rawLabel',
    dateImport: 'importDate',
    title: 'label'
};

let request = promisify(Transaction.request.bind(Transaction));

let olderCreate = Transaction.create;
Transaction.create = async function(userId, attributes) {
    assert(userId === 0, 'Transaction.create first arg must be the userId.');
    return await olderCreate(attributes);
};

let olderFind = Transaction.find;
Transaction.find = async function(userId, opId) {
    assert(userId === 0, 'Transaction.find first arg must be the userId.');
    return await olderFind(opId);
};

let olderAll = Transaction.all;
Transaction.all = async function(userId) {
    assert(userId === 0, 'Transaction.all unique arg must be the userId.');
    return await olderAll();
};

let olderDestroy = Transaction.destroy;
Transaction.destroy = async function(userId, opId) {
    assert(userId === 0, 'Transaction.destroy first arg must be the userId.');
    return await olderDestroy(opId);
};

let olderUpdateAttributes = Transaction.updateAttributes;
Transaction.update = async function(userId, operationId, fields) {
    assert(userId === 0, 'Transaction.update first arg must be the userId.');
    return await olderUpdateAttributes(operationId, fields);
};

Transaction.updateAttributes = function() {
    assert(false, 'Transaction.updateAttributes is deprecated. Please use Transaction.update');
};

Transaction.byAccount = async function byAccount(userId, account) {
    assert(userId === 0, 'Transaction.byAccount first arg must be the userId.');

    if (typeof account !== 'object' || typeof account.id !== 'string') {
        log.warn('Transaction.byAccount misuse: account must be an Account');
    }

    let params = {
        key: account.id
    };
    return await request('allByBankAccount', params);
};

Transaction.byAccounts = async function byAccounts(userId, accountIds) {
    assert(userId === 0, 'Transaction.byAccounts first arg must be the userId.');

    if (!(accountIds instanceof Array)) {
        log.warn('Transaction.byAccounts misuse: accountIds must be an array');
    }

    let params = {
        keys: accountIds
    };
    return await request('allByBankAccount', params);
};

async function byBankSortedByDateBetweenDates(userId, account, minDate, maxDate) {
    assert(
        userId === 0,
        'Transaction.byBankSortedByDateBetweenDates first arg must be the userId.'
    );

    if (typeof account !== 'object' || typeof account.id !== 'string') {
        log.warn('Transaction.byBankSortedByDateBetweenDates misuse: account must be an Account');
    }
    let params = {
        startkey: [`${account.id}`, maxDate.toISOString().replace(/T.*$/, 'T00:00:00.000Z')],
        endkey: [`${account.id}`, minDate.toISOString().replace(/T.*$/, 'T00:00:00.000Z')],
        descending: true
    };
    return await request('allByBankAccountAndDate', params);
}

Transaction.byBankSortedByDateBetweenDates = byBankSortedByDateBetweenDates;

Transaction.destroyByAccount = async function destroyByAccount(userId, accountId) {
    assert(userId === 0, 'Transaction.destroyByAccount first arg must be the userId.');

    if (typeof accountId !== 'string') {
        log.warn('Transaction.destroyByAccount misuse: accountId must be a string');
    }

    let ops = await Transaction.byAccounts(userId, [accountId]);
    for (let op of ops) {
        await Transaction.destroy(userId, op.id);
    }
};

Transaction.byCategory = async function byCategory(userId, categoryId) {
    assert(userId === 0, 'Transaction.byCategory first arg must be the userId.');

    if (typeof categoryId !== 'string') {
        log.warn(`Transaction.byCategory API misuse: ${categoryId}`);
    }

    let params = {
        key: categoryId
    };
    return await request('allByCategory', params);
};

Transaction.allWithOperationTypesId = async function allWithOperationTypesId(userId) {
    assert(userId === 0, 'Transaction.allWithOperationTypesId first arg must be the userId.');

    return await request('allWithOperationTypesId');
};

Transaction.prototype.mergeWith = function(other) {
    return mergeWith(this, other);
};

// Checks the input object has the minimum set of attributes required for being an operation:
// bankAccount
// label
// date
// amount
// operationTypeID
Transaction.isOperation = function(input) {
    return (
        input.hasOwnProperty('accountId') &&
        input.hasOwnProperty('label') &&
        input.hasOwnProperty('date') &&
        input.hasOwnProperty('amount') &&
        input.hasOwnProperty('type')
    );
};

Transaction.prototype.clone = function() {
    let clone = { ...this };
    delete clone.id;
    delete clone._id;
    delete clone._rev;
    return clone;
};

module.exports = Transaction;
