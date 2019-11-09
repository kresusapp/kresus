"use strict";

var cozydb = _interopRequireWildcard(require("cozydb"));

var _helpers = require("../../helpers");

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function _getRequireWildcardCache() { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

let log = (0, _helpers.makeLogger)('models/alert');
let Alert = cozydb.getModel('bankalert', {
  // internal account id.
  accountId: String,
  // possible options are: report, balance, transaction.
  type: String,
  // only for reports : daily, weekly, monthly.
  frequency: String,
  // only for balance/transaction.
  limit: Number,
  // only for balance/transaction: gt, lt.
  order: String,
  // when did the alert get triggered for the last time?
  lastTriggeredDate: Date,
  // ///////////////////////////////////////////////////
  // // DEPRECATED
  // //////////////////////////////////////////////////
  // external (backend) account id.
  bankAccount: String
});
Alert = (0, _helpers.promisifyModel)(Alert);
let request = (0, _helpers.promisify)(Alert.request.bind(Alert));

Alert.byAccountAndType =
/*#__PURE__*/
function () {
  var _byAccountAndType = _asyncToGenerator(function* (userId, accountID, type) {
    (0, _helpers.assert)(userId === 0, 'Alert.byAccountAndType first arg must be the userId.');

    if (typeof accountID !== 'string') {
      log.warn('Alert.byAccountAndType misuse: accountID must be a string');
    }

    if (typeof type !== 'string') {
      log.warn('Alert.byAccountAndType misuse: type must be a string');
    }

    let params = {
      key: [accountID, type]
    };
    return yield request('allByBankAccountAndType', params);
  });

  function byAccountAndType(_x, _x2, _x3) {
    return _byAccountAndType.apply(this, arguments);
  }

  return byAccountAndType;
}();

Alert.reportsByFrequency =
/*#__PURE__*/
function () {
  var _reportsByFrequency = _asyncToGenerator(function* (userId, frequency) {
    (0, _helpers.assert)(userId === 0, 'Alert.reportsByFrequency first arg must be the userId.');

    if (typeof frequency !== 'string') {
      log.warn('Alert.reportsByFrequency misuse: frequency must be a string');
    }

    let params = {
      key: ['report', frequency]
    };
    return yield request('allReportsByFrequency', params);
  });

  function reportsByFrequency(_x4, _x5) {
    return _reportsByFrequency.apply(this, arguments);
  }

  return reportsByFrequency;
}();

Alert.destroyByAccount =
/*#__PURE__*/
function () {
  var _destroyByAccount = _asyncToGenerator(function* (userId, id) {
    (0, _helpers.assert)(userId === 0, 'Alert.destroyByAccount first arg must be the userId.');

    if (typeof id !== 'string') {
      log.warn("Alert.destroyByAccount API misuse: id isn't a string");
    }

    let params = {
      key: id
    };
    let alerts = yield request('allByBankAccount', params);
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = alerts[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        let alert = _step.value;
        yield Alert.destroy(userId, alert.id);
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

  function destroyByAccount(_x6, _x7) {
    return _destroyByAccount.apply(this, arguments);
  }

  return destroyByAccount;
}();

let olderCreate = Alert.create;

Alert.create =
/*#__PURE__*/
function () {
  var _ref = _asyncToGenerator(function* (userId, attributes) {
    (0, _helpers.assert)(userId === 0, 'Alert.create first arg must be the userId.');
    return yield olderCreate(attributes);
  });

  return function (_x8, _x9) {
    return _ref.apply(this, arguments);
  };
}();

let olderFind = Alert.find;

Alert.find =
/*#__PURE__*/
function () {
  var _ref2 = _asyncToGenerator(function* (userId, alertId) {
    (0, _helpers.assert)(userId === 0, 'Alert.find first arg must be the userId.');
    return yield olderFind(alertId);
  });

  return function (_x10, _x11) {
    return _ref2.apply(this, arguments);
  };
}();

let olderAll = Alert.all;

Alert.all =
/*#__PURE__*/
function () {
  var _ref3 = _asyncToGenerator(function* (userId) {
    (0, _helpers.assert)(userId === 0, 'Alert.all first arg must be the userId.');
    return yield olderAll();
  });

  return function (_x12) {
    return _ref3.apply(this, arguments);
  };
}();

let olderDestroy = Alert.destroy;

Alert.destroy =
/*#__PURE__*/
function () {
  var _ref4 = _asyncToGenerator(function* (userId, alertId) {
    (0, _helpers.assert)(userId === 0, 'Alert.destroy first arg must be the userId.');
    return yield olderDestroy(alertId);
  });

  return function (_x13, _x14) {
    return _ref4.apply(this, arguments);
  };
}();

let olderUpdateAttributes = Alert.updateAttributes;

Alert.update =
/*#__PURE__*/
function () {
  var _ref5 = _asyncToGenerator(function* (userId, alertId, fields) {
    (0, _helpers.assert)(userId === 0, 'Alert.update first arg must be the userId.');
    return yield olderUpdateAttributes(alertId, fields);
  });

  return function (_x15, _x16, _x17) {
    return _ref5.apply(this, arguments);
  };
}();

Alert.updateAttributes = function () {
  (0, _helpers.assert)(false, 'Alert.updateAttributes is deprecated. Please use Alert.update');
}; // Sync function


Alert.prototype.testTransaction = function (operation) {
  if (this.type !== 'transaction') {
    return false;
  }

  let alertLimit = +this.limit;
  let amount = Math.abs(operation.amount);
  return this.order === 'lt' && amount <= alertLimit || this.order === 'gt' && amount >= alertLimit;
}; // Sync function


Alert.prototype.testBalance = function (balance) {
  if (this.type !== 'balance') {
    return false;
  }

  let alertLimit = +this.limit;
  return this.order === 'lt' && balance <= alertLimit || this.order === 'gt' && balance >= alertLimit;
};

Alert.prototype.formatOperationMessage = function (operation, accountName, formatCurrency) {
  let cmp = this.order === 'lt' ? (0, _helpers.translate)('server.alert.operation.lessThan') : (0, _helpers.translate)('server.alert.operation.greaterThan');
  let amount = formatCurrency(operation.amount);

  let date = _helpers.formatDate.toShortString(operation.date);

  let limit = formatCurrency(this.limit);
  return (0, _helpers.translate)('server.alert.operation.content', {
    label: operation.label,
    account: accountName,
    amount,
    cmp,
    date,
    limit
  });
};

Alert.prototype.formatAccountMessage = function (label, balance, formatCurrency) {
  let cmp = this.order === 'lt' ? (0, _helpers.translate)('server.alert.balance.lessThan') : (0, _helpers.translate)('server.alert.balance.greaterThan');
  let limit = formatCurrency(this.limit);
  let formattedBalance = formatCurrency(balance);
  return (0, _helpers.translate)('server.alert.balance.content', {
    label,
    cmp,
    limit,
    balance: formattedBalance
  });
};

Alert.prototype.clone = function () {
  let clone = _objectSpread({}, this);

  delete clone.id;
  delete clone._id;
  delete clone._rev;
  return clone;
};

module.exports = Alert;