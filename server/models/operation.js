import * as americano from 'cozydb';
import { makeLogger, promisify, promisifyModel, UNKNOWN_OPERATION_TYPE } from '../helpers';

let log = makeLogger('models/operations');

// Whenever you're adding something to the model, don't forget to modify
// Operation.prototype.mergeFrom.  Also, this should be kept in sync with the
// merging of operations on the client side.
let Operation = americano.getModel('bankoperation', {
    // external (backend) account id
    bankAccount: String,

    // internal id
    categoryId: String,
    type: { type: String, default: UNKNOWN_OPERATION_TYPE },
    title: String,
    date: Date,
    amount: Number,
    raw: String,
    dateImport: Date,
    customLabel: String,

    // Indicated from which operation this operation is derived.
    // internal id
    parentOperationId: String,

    // Tell if the user has created the operation by itself, or if weboob did.
    createdByUser: Boolean,

    // TODO: remove linkPlainEnglish?
    // {linkTranslationKey: String, linkPlainEnglish: String, url: String}
    attachments: Object,

    // Binary is an object containing one field (file) that links to a binary
    // document via an id. The binary document has a binary file
    // as attachment.
    binary: x => x,

    // internal id
    // Kept for backward compatibility
    operationTypeID: String
});

Operation = promisifyModel(Operation);

let request = promisify(::Operation.request);
let requestDestroy = promisify(::Operation.requestDestroy);

Operation.byAccount = async function byAccount(account) {
    if (typeof account !== 'object' ||
        typeof account.accountNumber !== 'string') {
        log.warn('Operation.byAccount misuse: account must be an Account');
    }

    let params = {
        key: account.accountNumber
    };
    return await request('allByBankAccount', params);
};

Operation.byAccounts = async function byAccounts(accountNums) {
    if (!(accountNums instanceof Array))
        log.warn('Operation.byAccounts misuse: accountNums must be an array');

    let params = {
        keys: accountNums
    };
    return await request('allByBankAccount', params);
};

Operation.byBankSortedByDate = async function byBankSortedByDate(account) {
    if (typeof account !== 'object' ||
        typeof account.accountNumber !== 'string') {
        log.warn(`Operation.byBankSortedByDate misuse: account must be an
                  Account`);
    }

    let params = {
        startkey: [`${account.accountNumber}0`],
        endkey: [account.accountNumber],
        descending: true
    };
    return await request('allByBankAccountAndDate', params);
};

Operation.allLike = async function allLike(operation) {
    if (typeof operation !== 'object')
        log.warn('Operation.allLike misuse: operation must be an object');

    let date = new Date(operation.date).toISOString();
    let amount = (+operation.amount).toFixed(2);
    let params = {
        key: [operation.bankAccount, date, amount, operation.raw]
    };
    return await request('allLike', params);
};

Operation.byParentOperation = async function byParentOperation(parentOperationId) {
    if (typeof parentOperationId !== 'string') {
        log.warn('Operation.byParentOperation misuse: parentOperationId must be a string');
    }
    return await request('allByParentOperation', { key: parentOperationId });
};

Operation.destroyByAccount = async function destroyByAccount(accountNum) {
    if (typeof accountNum !== 'string')
        log.warn(`Operation.destroyByAccount misuse: accountNum must be a
                  string`);

    let params = {
        key: accountNum,
        // Why the limit? See https://github.com/cozy/cozy-db/issues/41
        limit: 9999999
    };
    return await requestDestroy('allByBankAccount', params);
};

Operation.byCategory = async function byCategory(categoryId) {
    if (typeof categoryId !== 'string')
        log.warn(`Operation.byCategory API misuse: ${categoryId}`);

    let params = {
        key: categoryId
    };
    return await request('allByCategory', params);
};

Operation.allWithOperationTypesId = async function allWithOperationTypesId() {
    return await request('allWithOperationTypesId');
};

let hasCategory = op =>
    typeof op.categoryId !== 'undefined';

let hasType = op =>
    typeof op.type !== 'undefined' && op.type !== UNKNOWN_OPERATION_TYPE;

let hasCustomLabel = op =>
    typeof op.customLabel !== 'undefined';

Operation.prototype.mergeWith = function(other) {
    let needsSave = false;

    for (let field of ['binary', 'attachment']) {
        if (typeof other[field] !== 'undefined' &&
            typeof this[field] === 'undefined') {
            this[field] = other[field];
            needsSave = true;
        }
    }

    if (!hasCategory(this) && hasCategory(other)) {
        this.categoryId = other.categoryId;
        needsSave = true;
    }

    if (!hasType(this) && hasType(other)) {
        this.type = other.type;
        needsSave = true;
    }

    if (!hasCustomLabel(this) && hasCustomLabel(other)) {
        this.customLabel = other.customLabel;
        needsSave = true;
    }

    return needsSave;
};

Operation.isOperation = function(operation) {
    // We check the operation has the minimum parameters of an operations:
    // bankAccount
    // title
    // date
    // amount
    // operationTypeID
    return operation.hasOwnProperty('bankAccount') &&
           operation.hasOwnProperty('title') &&
           operation.hasOwnProperty('date') &&
           operation.hasOwnProperty('amount') &&
           operation.hasOwnProperty('type');
};

module.exports = Operation;
