'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _cozydb = require('cozydb');

var cozydb = _interopRequireWildcard(_cozydb);

var _helpers = require('../helpers');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

let log = (0, _helpers.makeLogger)('models/operations');

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
        default: _helpers.UNKNOWN_OPERATION_TYPE
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

Operation = (0, _helpers.promisifyModel)(Operation);

let request = (0, _helpers.promisify)(Operation.request.bind(Operation));
let requestDestroy = (0, _helpers.promisify)(Operation.requestDestroy.bind(Operation));

Operation.byAccount = (() => {
    var _ref = _asyncToGenerator(function* (account) {
        if (typeof account !== 'object' || typeof account.id !== 'string') {
            log.warn('Operation.byAccount misuse: account must be an Account');
        }

        let params = {
            key: account.id
        };
        return yield request('allByBankAccount', params);
    });

    function byAccount(_x) {
        return _ref.apply(this, arguments);
    }

    return byAccount;
})();

Operation.byAccounts = (() => {
    var _ref2 = _asyncToGenerator(function* (accountIds) {
        if (!(accountIds instanceof Array)) {
            log.warn('Operation.byAccounts misuse: accountIds must be an array');
        }

        let params = {
            keys: accountIds
        };
        return yield request('allByBankAccount', params);
    });

    function byAccounts(_x2) {
        return _ref2.apply(this, arguments);
    }

    return byAccounts;
})();

Operation.byBankSortedByDate = (() => {
    var _ref3 = _asyncToGenerator(function* (account) {
        if (typeof account !== 'object' || typeof account.id !== 'string') {
            log.warn('Operation.byBankSortedByDate misuse: account must be an Account');
        }

        let params = {
            startkey: [`${account.id}0`],
            endkey: [account.id],
            descending: true
        };
        return yield request('allByBankAccountAndDate', params);
    });

    function byBankSortedByDate(_x3) {
        return _ref3.apply(this, arguments);
    }

    return byBankSortedByDate;
})();

Operation.allLike = (() => {
    var _ref4 = _asyncToGenerator(function* (operation) {
        if (typeof operation !== 'object') {
            log.warn('Operation.allLike misuse: operation must be an object');
        }

        let date = new Date(operation.date).toISOString();
        let amount = (+operation.amount).toFixed(2);
        let params = {
            key: [operation.accountId, date, amount, operation.raw]
        };
        return yield request('allLike', params);
    });

    function allLike(_x4) {
        return _ref4.apply(this, arguments);
    }

    return allLike;
})();

Operation.destroyByAccount = (() => {
    var _ref5 = _asyncToGenerator(function* (accountId) {
        if (typeof accountId !== 'string') {
            log.warn('Operation.destroyByAccount misuse: accountNum must be a string');
        }

        let params = {
            key: accountId,
            // Why the limit? See https://github.com/cozy/cozy-db/issues/41
            limit: 9999999
        };
        return yield requestDestroy('allByBankAccount', params);
    });

    function destroyByAccount(_x5) {
        return _ref5.apply(this, arguments);
    }

    return destroyByAccount;
})();

Operation.byCategory = (() => {
    var _ref6 = _asyncToGenerator(function* (categoryId) {
        if (typeof categoryId !== 'string') {
            log.warn(`Operation.byCategory API misuse: ${categoryId}`);
        }

        let params = {
            key: categoryId
        };
        return yield request('allByCategory', params);
    });

    function byCategory(_x6) {
        return _ref6.apply(this, arguments);
    }

    return byCategory;
})();

Operation.allWithOperationTypesId = (() => {
    var _ref7 = _asyncToGenerator(function* () {
        return yield request('allWithOperationTypesId');
    });

    function allWithOperationTypesId() {
        return _ref7.apply(this, arguments);
    }

    return allWithOperationTypesId;
})();

let hasCategory = op => typeof op.categoryId !== 'undefined';

let hasType = op => typeof op.type !== 'undefined' && op.type !== _helpers.UNKNOWN_OPERATION_TYPE;

let hasCustomLabel = op => typeof op.customLabel !== 'undefined';

Operation.prototype.mergeWith = function (other) {
    let needsSave = false;

    var _arr = ['binary', 'attachment'];
    for (var _i = 0; _i < _arr.length; _i++) {
        let field = _arr[_i];
        if (typeof other[field] !== 'undefined' && typeof this[field] === 'undefined') {
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

// Checks the input object has the minimum set of attributes required for being an operation:
// bankAccount
// title
// date
// amount
// operationTypeID
Operation.isOperation = function (input) {
    return input.hasOwnProperty('accountId') && input.hasOwnProperty('title') && input.hasOwnProperty('date') && input.hasOwnProperty('amount') && input.hasOwnProperty('type');
};

Operation.prototype.clone = function () {
    let clone = _extends({}, this);
    delete clone.id;
    delete clone._id;
    delete clone._rev;
    return clone;
};

module.exports = Operation;