import * as cozydb from 'cozydb';

import { assert, makeLogger, promisify, promisifyModel, UNKNOWN_OPERATION_TYPE } from '../helpers';

let log = makeLogger('models/operations');

// Whenever you're adding something to the model, don't forget to modify
// Operation.prototype.mergeWith.

let Operation = cozydb.getModel('bankoperation', {
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
    title: String,

    // long description of what the operation is about.
    raw: String,

    // description entered by the user.
    customLabel: String,

    // ************************************************************************
    // DATE FIELDS
    // ************************************************************************

    // date at which the operation has been processed by the backend.
    date: Date,

    // date at which the operation has been imported into kresus.
    dateImport: Date,

    // date at which the operation has to be applied
    budgetDate: Date,

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
    bankAccount: String
});

Operation = promisifyModel(Operation);

let request = promisify(Operation.request.bind(Operation));

let olderCreate = Operation.create;
Operation.create = async function(userId, attributes) {
    assert(userId === 0, 'Operation.create first arg must be the userId.');
    return await olderCreate(attributes);
};

let olderFind = Operation.find;
Operation.find = async function(userId, opId) {
    assert(userId === 0, 'Operation.find first arg must be the userId.');
    return await olderFind(opId);
};

let olderAll = Operation.all;
Operation.all = async function(userId) {
    assert(userId === 0, 'Operation.all unique arg must be the userId.');
    return await olderAll();
};

let olderDestroy = Operation.destroy;
Operation.destroy = async function(userId, opId) {
    assert(userId === 0, 'Operation.destroy first arg must be the userId.');
    return await olderDestroy(opId);
};

let olderUpdateAttributes = Operation.updateAttributes;
Operation.update = async function(userId, operationId, fields) {
    assert(userId === 0, 'Operation.update first arg must be the userId.');
    return await olderUpdateAttributes(operationId, fields);
};

Operation.updateAttributes = function() {
    assert(false, 'Operation.updateAttributes is deprecated. Please use Operation.update');
};

Operation.byAccount = async function byAccount(userId, account) {
    assert(userId === 0, 'Operation.byAccount first arg must be the userId.');

    if (typeof account !== 'object' || typeof account.id !== 'string') {
        log.warn('Operation.byAccount misuse: account must be an Account');
    }

    let params = {
        key: account.id
    };
    return await request('allByBankAccount', params);
};

Operation.byAccounts = async function byAccounts(userId, accountIds) {
    assert(userId === 0, 'Operation.byAccounts first arg must be the userId.');

    if (!(accountIds instanceof Array)) {
        log.warn('Operation.byAccounts misuse: accountIds must be an array');
    }

    let params = {
        keys: accountIds
    };
    return await request('allByBankAccount', params);
};

async function byBankSortedByDateBetweenDates(userId, account, minDate, maxDate) {
    assert(userId === 0, 'Operation.byBankSortedByDateBetweenDates first arg must be the userId.');

    if (typeof account !== 'object' || typeof account.id !== 'string') {
        log.warn('Operation.byBankSortedByDateBetweenDates misuse: account must be an Account');
    }
    let params = {
        startkey: [`${account.id}`, maxDate.toISOString().replace(/T.*$/, 'T00:00:00.000Z')],
        endkey: [`${account.id}`, minDate.toISOString().replace(/T.*$/, 'T00:00:00.000Z')],
        descending: true
    };
    return await request('allByBankAccountAndDate', params);
}

Operation.byBankSortedByDateBetweenDates = byBankSortedByDateBetweenDates;

Operation.destroyByAccount = async function destroyByAccount(userId, accountId) {
    assert(userId === 0, 'Operation.destroyByAccount first arg must be the userId.');

    if (typeof accountId !== 'string') {
        log.warn('Operation.destroyByAccount misuse: accountId must be a string');
    }

    let ops = await Operation.byAccounts(userId, [accountId]);
    for (let op of ops) {
        await Operation.destroy(userId, op.id);
    }
};

Operation.byCategory = async function byCategory(userId, categoryId) {
    assert(userId === 0, 'Operation.byCategory first arg must be the userId.');

    if (typeof categoryId !== 'string') {
        log.warn(`Operation.byCategory API misuse: ${categoryId}`);
    }

    let params = {
        key: categoryId
    };
    return await request('allByCategory', params);
};

Operation.allWithOperationTypesId = async function allWithOperationTypesId(userId) {
    assert(userId === 0, 'Operation.allWithOperationTypesId first arg must be the userId.');

    return await request('allWithOperationTypesId');
};

const hasCategory = op => typeof op.categoryId === 'string';
const hasType = op => typeof op.type !== 'undefined' && op.type !== UNKNOWN_OPERATION_TYPE;
const hasCustomLabel = op => typeof op.customLabel === 'string';
const hasBudgetDate = op => typeof op.budgetDate !== 'undefined' && op.budgetDate !== null;

Operation.prototype.mergeWith = function(other) {
    let update = {};

    // Always trigger an update for the import date, to avoid duplicate
    // transactions to appear in reports around the date where the duplicate
    // has been imported.
    // This should be always true, but we stay defensive here.
    if (typeof other.dateImport !== 'undefined' && other.dateImport !== null) {
        update.dateImport = other.dateImport;
    }

    if (!hasCategory(this) && hasCategory(other)) {
        update.categoryId = other.categoryId;
    }

    if (!hasType(this) && hasType(other)) {
        update.type = other.type;
    }

    if (!hasCustomLabel(this) && hasCustomLabel(other)) {
        update.customLabel = other.customLabel;
    }

    if (!hasBudgetDate(this) && hasBudgetDate(other)) {
        update.budgetDate = other.budgetDate;
    }

    return update;
};

// Checks the input object has the minimum set of attributes required for being an operation:
// bankAccount
// title
// date
// amount
// operationTypeID
Operation.isOperation = function(input) {
    return (
        input.hasOwnProperty('accountId') &&
        input.hasOwnProperty('title') &&
        input.hasOwnProperty('date') &&
        input.hasOwnProperty('amount') &&
        input.hasOwnProperty('type')
    );
};

Operation.prototype.clone = function() {
    let clone = { ...this };
    delete clone.id;
    delete clone._id;
    delete clone._rev;
    return clone;
};

module.exports = Operation;
