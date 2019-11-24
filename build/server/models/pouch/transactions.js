"use strict";

var cozydb = _interopRequireWildcard(require("cozydb"));

var _helpers = require("../../helpers");

var _helpers2 = require("./helpers");

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function _getRequireWildcardCache() { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; if (obj != null) { var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

let log = (0, _helpers.makeLogger)('models/transactions'); // Whenever you're adding something to the model, don't forget to modify
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
    default: _helpers.UNKNOWN_OPERATION_TYPE
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
Transaction = (0, _helpers.promisifyModel)(Transaction);
Transaction.renamings = {
  raw: 'rawLabel',
  dateImport: 'importDate',
  title: 'label'
};
let request = (0, _helpers.promisify)(Transaction.request.bind(Transaction));
let olderCreate = Transaction.create;

Transaction.create =
/*#__PURE__*/
function () {
  var _ref = _asyncToGenerator(function* (userId, attributes) {
    (0, _helpers.assert)(userId === 0, 'Transaction.create first arg must be the userId.');
    return yield olderCreate(attributes);
  });

  return function (_x, _x2) {
    return _ref.apply(this, arguments);
  };
}();

let olderFind = Transaction.find;

Transaction.find =
/*#__PURE__*/
function () {
  var _ref2 = _asyncToGenerator(function* (userId, opId) {
    (0, _helpers.assert)(userId === 0, 'Transaction.find first arg must be the userId.');
    return yield olderFind(opId);
  });

  return function (_x3, _x4) {
    return _ref2.apply(this, arguments);
  };
}();

let olderAll = Transaction.all;

Transaction.all =
/*#__PURE__*/
function () {
  var _ref3 = _asyncToGenerator(function* (userId) {
    (0, _helpers.assert)(userId === 0, 'Transaction.all unique arg must be the userId.');
    return yield olderAll();
  });

  return function (_x5) {
    return _ref3.apply(this, arguments);
  };
}();

let olderDestroy = Transaction.destroy;

Transaction.destroy =
/*#__PURE__*/
function () {
  var _ref4 = _asyncToGenerator(function* (userId, opId) {
    (0, _helpers.assert)(userId === 0, 'Transaction.destroy first arg must be the userId.');
    return yield olderDestroy(opId);
  });

  return function (_x6, _x7) {
    return _ref4.apply(this, arguments);
  };
}();

let olderUpdateAttributes = Transaction.updateAttributes;

Transaction.update =
/*#__PURE__*/
function () {
  var _ref5 = _asyncToGenerator(function* (userId, operationId, fields) {
    (0, _helpers.assert)(userId === 0, 'Transaction.update first arg must be the userId.');
    return yield olderUpdateAttributes(operationId, fields);
  });

  return function (_x8, _x9, _x10) {
    return _ref5.apply(this, arguments);
  };
}();

Transaction.updateAttributes = function () {
  (0, _helpers.assert)(false, 'Transaction.updateAttributes is deprecated. Please use Transaction.update');
};

Transaction.byAccount =
/*#__PURE__*/
function () {
  var _byAccount = _asyncToGenerator(function* (userId, account) {
    (0, _helpers.assert)(userId === 0, 'Transaction.byAccount first arg must be the userId.');

    if (typeof account !== 'object' || typeof account.id !== 'string') {
      log.warn('Transaction.byAccount misuse: account must be an Account');
    }

    let params = {
      key: account.id
    };
    return yield request('allByBankAccount', params);
  });

  function byAccount(_x11, _x12) {
    return _byAccount.apply(this, arguments);
  }

  return byAccount;
}();

Transaction.byAccounts =
/*#__PURE__*/
function () {
  var _byAccounts = _asyncToGenerator(function* (userId, accountIds) {
    (0, _helpers.assert)(userId === 0, 'Transaction.byAccounts first arg must be the userId.');

    if (!(accountIds instanceof Array)) {
      log.warn('Transaction.byAccounts misuse: accountIds must be an array');
    }

    let params = {
      keys: accountIds
    };
    return yield request('allByBankAccount', params);
  });

  function byAccounts(_x13, _x14) {
    return _byAccounts.apply(this, arguments);
  }

  return byAccounts;
}();

function byBankSortedByDateBetweenDates(_x15, _x16, _x17, _x18) {
  return _byBankSortedByDateBetweenDates.apply(this, arguments);
}

function _byBankSortedByDateBetweenDates() {
  _byBankSortedByDateBetweenDates = _asyncToGenerator(function* (userId, account, minDate, maxDate) {
    (0, _helpers.assert)(userId === 0, 'Transaction.byBankSortedByDateBetweenDates first arg must be the userId.');

    if (typeof account !== 'object' || typeof account.id !== 'string') {
      log.warn('Transaction.byBankSortedByDateBetweenDates misuse: account must be an Account');
    }

    let params = {
      startkey: [`${account.id}`, maxDate.toISOString().replace(/T.*$/, 'T00:00:00.000Z')],
      endkey: [`${account.id}`, minDate.toISOString().replace(/T.*$/, 'T00:00:00.000Z')],
      descending: true
    };
    return yield request('allByBankAccountAndDate', params);
  });
  return _byBankSortedByDateBetweenDates.apply(this, arguments);
}

Transaction.byBankSortedByDateBetweenDates = byBankSortedByDateBetweenDates;

Transaction.destroyByAccount =
/*#__PURE__*/
function () {
  var _destroyByAccount = _asyncToGenerator(function* (userId, accountId) {
    (0, _helpers.assert)(userId === 0, 'Transaction.destroyByAccount first arg must be the userId.');

    if (typeof accountId !== 'string') {
      log.warn('Transaction.destroyByAccount misuse: accountId must be a string');
    }

    let ops = yield Transaction.byAccounts(userId, [accountId]);
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = ops[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        let op = _step.value;
        yield Transaction.destroy(userId, op.id);
      }
    } catch (err) {
      _didIteratorError = true;
      _iteratorError = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion && _iterator.return != null) {
          _iterator.return();
        }
      } finally {
        if (_didIteratorError) {
          throw _iteratorError;
        }
      }
    }
  });

  function destroyByAccount(_x19, _x20) {
    return _destroyByAccount.apply(this, arguments);
  }

  return destroyByAccount;
}();

Transaction.byCategory =
/*#__PURE__*/
function () {
  var _byCategory = _asyncToGenerator(function* (userId, categoryId) {
    (0, _helpers.assert)(userId === 0, 'Transaction.byCategory first arg must be the userId.');

    if (typeof categoryId !== 'string') {
      log.warn(`Transaction.byCategory API misuse: ${categoryId}`);
    }

    let params = {
      key: categoryId
    };
    return yield request('allByCategory', params);
  });

  function byCategory(_x21, _x22) {
    return _byCategory.apply(this, arguments);
  }

  return byCategory;
}();

Transaction.allWithOperationTypesId =
/*#__PURE__*/
function () {
  var _allWithOperationTypesId = _asyncToGenerator(function* (userId) {
    (0, _helpers.assert)(userId === 0, 'Transaction.allWithOperationTypesId first arg must be the userId.');
    return yield request('allWithOperationTypesId');
  });

  function allWithOperationTypesId(_x23) {
    return _allWithOperationTypesId.apply(this, arguments);
  }

  return allWithOperationTypesId;
}();

Transaction.prototype.mergeWith = function (other) {
  return (0, _helpers2.mergeWith)(this, other);
}; // Checks the input object has the minimum set of attributes required for being an operation:
// bankAccount
// label
// date
// amount
// operationTypeID


Transaction.isOperation = function (input) {
  return input.hasOwnProperty('accountId') && input.hasOwnProperty('label') && input.hasOwnProperty('date') && input.hasOwnProperty('amount') && input.hasOwnProperty('type');
};

Transaction.prototype.clone = function () {
  let clone = _objectSpread({}, this);

  delete clone.id;
  delete clone._id;
  delete clone._rev;
  return clone;
};

module.exports = Transaction;