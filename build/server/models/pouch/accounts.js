"use strict";

var cozydb = _interopRequireWildcard(require("cozydb"));

var _moment = _interopRequireDefault(require("moment"));

var _helpers = require("../../helpers");

var _settings = _interopRequireDefault(require("./settings"));

var _transactions = _interopRequireDefault(require("./transactions"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function _getRequireWildcardCache() { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; if (obj != null) { var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

let log = (0, _helpers.makeLogger)('models/accounts');
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
    default: _helpers.UNKNOWN_ACCOUNT_TYPE
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
Account = (0, _helpers.promisifyModel)(Account);
Account.renamings = {
  initialAmount: 'initialBalance',
  bank: 'vendorId',
  lastChecked: 'lastCheckDate',
  bankAccess: 'accessId',
  accountNumber: 'vendorAccountId',
  title: 'label'
};
let request = (0, _helpers.promisify)(Account.request.bind(Account));

Account.byVendorId =
/*#__PURE__*/
function () {
  var _byVendorId = _asyncToGenerator(function* (userId, bank) {
    (0, _helpers.assert)(userId === 0, 'Account.byVendorId first arg must be the userId.');

    if (typeof bank !== 'object' || typeof bank.uuid !== 'string') {
      log.warn('Account.byVendorId misuse: bank must be a Bank instance');
    }

    let params = {
      key: bank.uuid
    };
    return yield request('allByVendorId', params);
  });

  function byVendorId(_x, _x2) {
    return _byVendorId.apply(this, arguments);
  }

  return byVendorId;
}();

Account.findMany =
/*#__PURE__*/
function () {
  var _findMany = _asyncToGenerator(function* (userId, accountIds) {
    (0, _helpers.assert)(userId === 0, 'Account.findMany first arg must be the userId.');

    if (!(accountIds instanceof Array)) {
      log.warn('Account.findMany misuse: accountIds must be an Array');
    }

    if (accountIds.length && typeof accountIds[0] !== 'string') {
      log.warn('Account.findMany misuse: accountIds must be a [String]');
    }

    let params = {
      keys: accountIds.slice()
    };
    return yield request('allByAccountIds', params);
  });

  function findMany(_x3, _x4) {
    return _findMany.apply(this, arguments);
  }

  return findMany;
}();

Account.byAccess =
/*#__PURE__*/
function () {
  var _byAccess = _asyncToGenerator(function* (userId, access) {
    (0, _helpers.assert)(userId === 0, 'Account.byAccess first arg must be the userId.');

    if (typeof access !== 'object' || typeof access.id !== 'string') {
      log.warn('Account.byAccess misuse: access must be an Access instance');
    }

    let params = {
      key: access.id
    };
    return yield request('allByAccessId', params);
  });

  function byAccess(_x5, _x6) {
    return _byAccess.apply(this, arguments);
  }

  return byAccess;
}();

let olderCreate = Account.create;

Account.create =
/*#__PURE__*/
function () {
  var _ref = _asyncToGenerator(function* (userId, attributes) {
    (0, _helpers.assert)(userId === 0, 'Account.create first arg must be the userId.');
    return yield olderCreate(attributes);
  });

  return function (_x7, _x8) {
    return _ref.apply(this, arguments);
  };
}();

let olderFind = Account.find;

Account.find =
/*#__PURE__*/
function () {
  var _ref2 = _asyncToGenerator(function* (userId, accountId) {
    (0, _helpers.assert)(userId === 0, 'Account.find first arg must be the userId.');
    return yield olderFind(accountId);
  });

  return function (_x9, _x10) {
    return _ref2.apply(this, arguments);
  };
}();

let olderAll = Account.all;

Account.all =
/*#__PURE__*/
function () {
  var _ref3 = _asyncToGenerator(function* (userId) {
    (0, _helpers.assert)(userId === 0, 'Account.all first arg must be the userId.');
    return yield olderAll();
  });

  return function (_x11) {
    return _ref3.apply(this, arguments);
  };
}();

let olderDestroy = Account.destroy;

Account.destroy =
/*#__PURE__*/
function () {
  var _ref4 = _asyncToGenerator(function* (userId, accountId) {
    (0, _helpers.assert)(userId === 0, 'Account.destroy first arg must be the userId.');
    return yield olderDestroy(accountId);
  });

  return function (_x12, _x13) {
    return _ref4.apply(this, arguments);
  };
}();

let olderUpdateAttributes = Account.updateAttributes;

Account.update =
/*#__PURE__*/
function () {
  var _ref5 = _asyncToGenerator(function* (userId, accountId, fields) {
    (0, _helpers.assert)(userId === 0, 'Account.update first arg must be the userId.');
    return yield olderUpdateAttributes(accountId, fields);
  });

  return function (_x14, _x15, _x16) {
    return _ref5.apply(this, arguments);
  };
}();

Account.updateAttributes = function () {
  (0, _helpers.assert)(false, 'Account.updateAttributes is deprecated. Please use Account.update');
};

Account.prototype.computeBalance =
/*#__PURE__*/
function () {
  var _computeBalance = _asyncToGenerator(function* () {
    let userId = yield this.getUserId();
    let ops = yield _transactions.default.byAccount(userId, this);
    let today = (0, _moment.default)();
    let s = ops.filter(op => (0, _helpers.shouldIncludeInBalance)(op, today, this.type)).reduce((sum, op) => sum + op.amount, this.initialBalance);
    return Math.round(s * 100) / 100;
  });

  function computeBalance() {
    return _computeBalance.apply(this, arguments);
  }

  return computeBalance;
}();

Account.prototype.computeOutstandingSum =
/*#__PURE__*/
function () {
  var _computeOutstandingSum = _asyncToGenerator(function* () {
    let userId = yield this.getUserId();
    let ops = yield _transactions.default.byAccount(userId, this);
    let s = ops.filter(op => (0, _helpers.shouldIncludeInOutstandingSum)(op)).reduce((sum, op) => sum + op.amount, 0);
    return Math.round(s * 100) / 100;
  });

  function computeOutstandingSum() {
    return _computeOutstandingSum.apply(this, arguments);
  }

  return computeOutstandingSum;
}();

Account.prototype.getUserId =
/*#__PURE__*/
function () {
  var _getUserId = _asyncToGenerator(function* () {
    return process.kresus.user.id;
  });

  function getUserId() {
    return _getUserId.apply(this, arguments);
  }

  return getUserId;
}();

Account.prototype.getCurrencyFormatter =
/*#__PURE__*/
function () {
  var _getCurrencyFormatter = _asyncToGenerator(function* () {
    let curr = _helpers.currency.isKnown(this.currency) ? this.currency : (yield _settings.default.findOrCreateDefault((yield this.getUserId()), 'default-currency')).value;
    return _helpers.currency.makeFormat(curr);
  });

  function getCurrencyFormatter() {
    return _getCurrencyFormatter.apply(this, arguments);
  }

  return getCurrencyFormatter;
}();

module.exports = Account;