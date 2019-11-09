"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _moment = _interopRequireDefault(require("moment"));

var _accesses = _interopRequireDefault(require("../models/accesses"));

var _accounts = _interopRequireDefault(require("../models/accounts"));

var _settings = _interopRequireDefault(require("../models/settings"));

var _transactions = _interopRequireDefault(require("../models/transactions"));

var _accountTypes = require("./account-types");

var _transactionTypes = require("./transaction-types");

var _bankVendors = require("./bank-vendors");

var _helpers = require("../helpers");

var _asyncQueue = _interopRequireDefault(require("./async-queue"));

var _alertManager = _interopRequireDefault(require("./alert-manager"));

var _notifications = _interopRequireDefault(require("./notifications"));

var _diffAccounts = _interopRequireDefault(require("./diff-accounts"));

var _diffOperations2 = _interopRequireDefault(require("./diff-operations"));

var demoBackend = _interopRequireWildcard(require("./sources/demo"));

var weboobBackend = _interopRequireWildcard(require("./sources/weboob"));

var manualBackend = _interopRequireWildcard(require("./sources/manual"));

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function _getRequireWildcardCache() { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { if (!(Symbol.iterator in Object(arr) || Object.prototype.toString.call(arr) === "[object Arguments]")) { return; } var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

let log = (0, _helpers.makeLogger)('accounts-manager');
const SOURCE_HANDLERS = {};

function addBackend(exportObject) {
  if (typeof exportObject.SOURCE_NAME === 'undefined' || typeof exportObject.fetchAccounts === 'undefined' || typeof exportObject.fetchOperations === 'undefined') {
    throw new _helpers.KError("Backend doesn't implement basic functionality.");
  }

  SOURCE_HANDLERS[exportObject.SOURCE_NAME] = exportObject;
} // Add backends here.


addBackend(demoBackend);
addBackend(weboobBackend);
addBackend(manualBackend); // Connect static bank information to their backends.

const ALL_BANKS = require('../shared/banks.json');

const BANK_HANDLERS = {};
var _iteratorNormalCompletion = true;
var _didIteratorError = false;
var _iteratorError = undefined;

try {
  for (var _iterator = ALL_BANKS[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
    let bank = _step.value;

    if (!bank.backend || !(bank.backend in SOURCE_HANDLERS)) {
      throw new _helpers.KError('Bank handler not described or not imported.');
    }

    BANK_HANDLERS[bank.uuid] = SOURCE_HANDLERS[bank.backend];
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

function handler(access) {
  return BANK_HANDLERS[access.vendorId];
}

const MAX_DIFFERENCE_BETWEEN_DUP_DATES_IN_DAYS = 2; // Effectively does a merge of two accounts that have been identified to be duplicates.
// - known is the former Account instance (known in Kresus's database).
// - provided is the new Account instance provided by the source backend.

function mergeAccounts(_x, _x2, _x3) {
  return _mergeAccounts.apply(this, arguments);
} // Returns a list of all the accounts returned by the backend, associated to
// the given accessId.


function _mergeAccounts() {
  _mergeAccounts = _asyncToGenerator(function* (userId, known, provided) {
    let newProps = {
      vendorAccountId: provided.vendorAccountId,
      label: provided.label,
      iban: provided.iban,
      currency: provided.currency,
      type: provided.type
    };
    yield _accounts.default.update(userId, known.id, newProps);
  });
  return _mergeAccounts.apply(this, arguments);
}

function retrieveAllAccountsByAccess(_x4, _x5) {
  return _retrieveAllAccountsByAccess.apply(this, arguments);
} // Sends notification for a given access, considering a list of newOperations
// and an accountMap (mapping accountId -> account).


function _retrieveAllAccountsByAccess() {
  _retrieveAllAccountsByAccess = _asyncToGenerator(function* (userId, access, forceUpdate = false) {
    if (!access.hasPassword()) {
      log.warn("Skipping accounts fetching -- password isn't present");
      let errcode = (0, _helpers.getErrorCode)('NO_PASSWORD');
      throw new _helpers.KError("Access' password is not set", 500, errcode);
    }

    log.info(`Retrieve all accounts from access ${access.vendorId} with login ${access.login}`);
    let isDebugEnabled = yield _settings.default.findOrCreateDefaultBooleanValue(userId, 'weboob-enable-debug');
    let sourceAccounts;

    try {
      sourceAccounts = yield handler(access).fetchAccounts({
        access,
        debug: isDebugEnabled,
        update: forceUpdate
      });
    } catch (err) {
      let errCode = err.errCode; // Only save the status code if the error was raised in the source, using a KError.

      if (errCode) {
        yield _accesses.default.update(userId, access.id, {
          fetchStatus: errCode
        });
      }

      throw err;
    }

    let accounts = [];
    var _iteratorNormalCompletion13 = true;
    var _didIteratorError13 = false;
    var _iteratorError13 = undefined;

    try {
      for (var _iterator13 = sourceAccounts[Symbol.iterator](), _step13; !(_iteratorNormalCompletion13 = (_step13 = _iterator13.next()).done); _iteratorNormalCompletion13 = true) {
        let accountWeboob = _step13.value;
        let account = {
          vendorAccountId: accountWeboob.vendorAccountId,
          vendorId: access.vendorId,
          accessId: access.id,
          iban: accountWeboob.iban,
          label: accountWeboob.label,
          initialBalance: Number.parseFloat(accountWeboob.balance) || 0,
          lastCheckDate: new Date(),
          importDate: new Date()
        };
        let accountType = (0, _accountTypes.accountTypeIdToName)(accountWeboob.type); // The default type's value is directly set by the account model.

        if (accountType !== null) {
          account.type = accountType;
        }

        if (_helpers.currency.isKnown(accountWeboob.currency)) {
          account.currency = accountWeboob.currency;
        }

        accounts.push(account);
      }
    } catch (err) {
      _didIteratorError13 = true;
      _iteratorError13 = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion13 && _iterator13.return != null) {
          _iterator13.return();
        }
      } finally {
        if (_didIteratorError13) {
          throw _iteratorError13;
        }
      }
    }

    log.info(`-> ${accounts.length} bank account(s) found`);
    return accounts;
  });
  return _retrieveAllAccountsByAccess.apply(this, arguments);
}

function notifyNewOperations(_x6, _x7, _x8) {
  return _notifyNewOperations.apply(this, arguments);
}

function _notifyNewOperations() {
  _notifyNewOperations = _asyncToGenerator(function* (access, newOperations, accountMap) {
    let newOpsPerAccount = new Map();
    var _iteratorNormalCompletion14 = true;
    var _didIteratorError14 = false;
    var _iteratorError14 = undefined;

    try {
      for (var _iterator14 = newOperations[Symbol.iterator](), _step14; !(_iteratorNormalCompletion14 = (_step14 = _iterator14.next()).done); _iteratorNormalCompletion14 = true) {
        let newOp = _step14.value;
        let opAccountId = newOp.accountId;

        if (!newOpsPerAccount.has(opAccountId)) {
          newOpsPerAccount.set(opAccountId, [newOp]);
        } else {
          newOpsPerAccount.get(opAccountId).push(newOp);
        }
      }
    } catch (err) {
      _didIteratorError14 = true;
      _iteratorError14 = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion14 && _iterator14.return != null) {
          _iterator14.return();
        }
      } finally {
        if (_didIteratorError14) {
          throw _iteratorError14;
        }
      }
    }

    let bank = (0, _bankVendors.bankVendorByUuid)(access.vendorId);
    (0, _helpers.assert)(bank, 'The bank must be known');
    var _iteratorNormalCompletion15 = true;
    var _didIteratorError15 = false;
    var _iteratorError15 = undefined;

    try {
      for (var _iterator15 = newOpsPerAccount.entries()[Symbol.iterator](), _step15; !(_iteratorNormalCompletion15 = (_step15 = _iterator15.next()).done); _iteratorNormalCompletion15 = true) {
        let _step15$value = _slicedToArray(_step15.value, 2),
            accountId = _step15$value[0],
            ops = _step15$value[1];

        let _accountMap$get = accountMap.get(accountId),
            account = _accountMap$get.account;
        /* eslint-disable camelcase */


        let params = {
          account_label: `${access.customLabel || bank.name} - ${(0, _helpers.displayLabel)(account)}`,
          smart_count: ops.length
        };

        if (ops.length === 1) {
          // Send a notification with the operation content
          let formatCurrency = yield account.getCurrencyFormatter();
          params.operation_details = `${ops[0].label} ${formatCurrency(ops[0].amount)}`;
        }

        _notifications.default.send((0, _helpers.translate)('server.notification.new_operation', params));
        /* eslint-enable camelcase */

      }
    } catch (err) {
      _didIteratorError15 = true;
      _iteratorError15 = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion15 && _iterator15.return != null) {
          _iterator15.return();
        }
      } finally {
        if (_didIteratorError15) {
          throw _iteratorError15;
        }
      }
    }
  });
  return _notifyNewOperations.apply(this, arguments);
}

class AccountManager {
  constructor() {
    this.newAccountsMap = new Map();
    this.q = new _asyncQueue.default();
    this.retrieveNewAccountsByAccess = this.q.wrap(this.retrieveNewAccountsByAccess.bind(this));
    this.retrieveOperationsByAccess = this.q.wrap(this.retrieveOperationsByAccess.bind(this));
    this.resyncAccountBalance = this.q.wrap(this.resyncAccountBalance.bind(this));
  }

  retrieveNewAccountsByAccess(userId, access, shouldAddNewAccounts, forceUpdate = false) {
    var _this = this;

    return _asyncToGenerator(function* () {
      if (_this.newAccountsMap.size) {
        log.warn('At the top of retrieveNewAccountsByAccess, newAccountsMap must be empty.');

        _this.newAccountsMap.clear();
      }

      let accounts = yield retrieveAllAccountsByAccess(userId, access, forceUpdate);
      let oldAccounts = yield _accounts.default.byAccess(userId, access);
      let diff = (0, _diffAccounts.default)(oldAccounts, accounts);
      var _iteratorNormalCompletion2 = true;
      var _didIteratorError2 = false;
      var _iteratorError2 = undefined;

      try {
        for (var _iterator2 = diff.perfectMatches[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
          let _step2$value = _slicedToArray(_step2.value, 1),
              known = _step2$value[0];

          log.info(`Account ${known.id} already known and in Kresus's database`);
        }
      } catch (err) {
        _didIteratorError2 = true;
        _iteratorError2 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion2 && _iterator2.return != null) {
            _iterator2.return();
          }
        } finally {
          if (_didIteratorError2) {
            throw _iteratorError2;
          }
        }
      }

      var _iteratorNormalCompletion3 = true;
      var _didIteratorError3 = false;
      var _iteratorError3 = undefined;

      try {
        for (var _iterator3 = diff.providerOrphans[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
          let account = _step3.value;
          log.info('New account found: ', account.label);

          if (!shouldAddNewAccounts) {
            log.info('=> Not saving it, as per request');
            continue;
          }

          log.info('=> Saving it as per request.');
          let newAccountInfo = {
            account: null,
            balanceOffset: 0
          }; // Save the account in DB and in the new accounts map.

          let newAccount = yield _accounts.default.create(userId, account);
          newAccountInfo.account = newAccount;

          _this.newAccountsMap.set(newAccount.id, newAccountInfo);
        }
      } catch (err) {
        _didIteratorError3 = true;
        _iteratorError3 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion3 && _iterator3.return != null) {
            _iterator3.return();
          }
        } finally {
          if (_didIteratorError3) {
            throw _iteratorError3;
          }
        }
      }

      var _iteratorNormalCompletion4 = true;
      var _didIteratorError4 = false;
      var _iteratorError4 = undefined;

      try {
        for (var _iterator4 = diff.knownOrphans[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
          let account = _step4.value;
          log.info("Orphan account found in Kresus's database: ", account.vendorAccountId); // TODO do something with orphan accounts!
        }
      } catch (err) {
        _didIteratorError4 = true;
        _iteratorError4 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion4 && _iterator4.return != null) {
            _iterator4.return();
          }
        } finally {
          if (_didIteratorError4) {
            throw _iteratorError4;
          }
        }
      }

      let shouldMergeAccounts = yield _settings.default.findOrCreateDefaultBooleanValue(userId, 'weboob-auto-merge-accounts');

      if (shouldMergeAccounts) {
        var _iteratorNormalCompletion5 = true;
        var _didIteratorError5 = false;
        var _iteratorError5 = undefined;

        try {
          for (var _iterator5 = diff.duplicateCandidates[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
            let _step5$value = _slicedToArray(_step5.value, 2),
                known = _step5$value[0],
                provided = _step5$value[1];

            log.info(`Found candidates for accounts merging:
- ${known.vendorAccountId} / ${known.label}
- ${provided.vendorAccountId} / ${provided.label}`);
            yield mergeAccounts(userId, known, provided);
          }
        } catch (err) {
          _didIteratorError5 = true;
          _iteratorError5 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion5 && _iterator5.return != null) {
              _iterator5.return();
            }
          } finally {
            if (_didIteratorError5) {
              throw _iteratorError5;
            }
          }
        }
      } else {
        log.info(`Found ${diff.duplicateCandidates.length} candidates for merging, but not
merging as per request`);
      }
    })();
  } // Not wrapped in the sequential queue: this would introduce a deadlock
  // since retrieveNewAccountsByAccess is wrapped!


  retrieveAndAddAccountsByAccess(userId, access) {
    var _this2 = this;

    return _asyncToGenerator(function* () {
      return yield _this2.retrieveNewAccountsByAccess(userId, access, true);
    })();
  }

  retrieveOperationsByAccess(userId, access, ignoreLastFetchDate = false) {
    var _this3 = this;

    return _asyncToGenerator(function* () {
      if (!access.hasPassword()) {
        log.warn("Skipping operations fetching -- password isn't present");
        let errcode = (0, _helpers.getErrorCode)('NO_PASSWORD');
        throw new _helpers.KError("Access' password is not set", 500, errcode);
      }

      let operations = [];
      let now = (0, _moment.default)().format('YYYY-MM-DDTHH:mm:ss.000Z');
      let allAccounts = yield _accounts.default.byAccess(userId, access);
      let oldestLastFetchDate = null;
      let accountMap = new Map();
      let vendorToOwnAccountIdMap = new Map();
      var _iteratorNormalCompletion6 = true;
      var _didIteratorError6 = false;
      var _iteratorError6 = undefined;

      try {
        for (var _iterator6 = allAccounts[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
          let account = _step6.value;
          vendorToOwnAccountIdMap.set(account.vendorAccountId, account.id);

          if (_this3.newAccountsMap.has(account.id)) {
            let oldEntry = _this3.newAccountsMap.get(account.id);

            accountMap.set(account.id, oldEntry);
            continue;
          }

          accountMap.set(account.id, {
            account,
            balanceOffset: 0
          });

          if (!ignoreLastFetchDate && (oldestLastFetchDate === null || account.lastCheckDate < oldestLastFetchDate)) {
            oldestLastFetchDate = account.lastCheckDate;
          }
        } // Eagerly clear state.

      } catch (err) {
        _didIteratorError6 = true;
        _iteratorError6 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion6 && _iterator6.return != null) {
            _iterator6.return();
          }
        } finally {
          if (_didIteratorError6) {
            throw _iteratorError6;
          }
        }
      }

      _this3.newAccountsMap.clear(); // Fetch source operations


      let isDebugEnabled = yield _settings.default.findOrCreateDefaultBooleanValue(userId, 'weboob-enable-debug');
      let fromDate = null;

      if (oldestLastFetchDate !== null) {
        const thresholdSetting = yield _settings.default.findOrCreateDefault(userId, 'weboob-fetch-threshold');
        const fetchThresholdInMonths = parseInt(thresholdSetting.value, 10);

        if (fetchThresholdInMonths > 0) {
          fromDate = (0, _moment.default)(oldestLastFetchDate).subtract(fetchThresholdInMonths, 'months').toDate();
        }
      }

      let sourceOps;

      try {
        sourceOps = yield handler(access).fetchOperations({
          access,
          debug: isDebugEnabled,
          fromDate
        });
      } catch (err) {
        let errCode = err.errCode; // Only save the status code if the error was raised in the source, using a KError.

        if (errCode) {
          yield _accesses.default.update(userId, access.id, {
            fetchStatus: errCode
          });
        }

        throw err;
      }

      log.info(`${sourceOps.length} operations retrieved from source.`);
      log.info('Normalizing source information...');
      var _iteratorNormalCompletion7 = true;
      var _didIteratorError7 = false;
      var _iteratorError7 = undefined;

      try {
        for (var _iterator7 = sourceOps[Symbol.iterator](), _step7; !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
          let sourceOp = _step7.value;

          if (!vendorToOwnAccountIdMap.has(sourceOp.account)) {
            log.error('Operation attached to an unknown account, skipping');
            continue;
          }

          if (!sourceOp.rawLabel && !sourceOp.label) {
            log.error('Operation without raw label or label, skipping');
            continue;
          }

          let operation = {
            accountId: vendorToOwnAccountIdMap.get(sourceOp.account),
            amount: Number.parseFloat(sourceOp.amount),
            rawLabel: sourceOp.rawLabel || sourceOp.label,
            date: new Date(sourceOp.date),
            label: sourceOp.label || sourceOp.rawLabel,
            binary: sourceOp.binary,
            debitDate: new Date(sourceOp.debit_date)
          };

          if (Number.isNaN(operation.amount)) {
            log.error('Operation with invalid amount, skipping');
            continue;
          }

          let hasInvalidDate = !(0, _moment.default)(operation.date).isValid();
          let hasInvalidDebitDate = !(0, _moment.default)(operation.debitDate).isValid();

          if (hasInvalidDate && hasInvalidDebitDate) {
            log.error('Operation with invalid date and debitDate, skipping');
            continue;
          }

          if (hasInvalidDate) {
            log.warn('Operation with invalid date, using debitDate instead');
            operation.date = operation.debitDate;
          }

          if (hasInvalidDebitDate) {
            log.warn('Operation with invalid debitDate, using date instead');
            operation.debitDate = operation.date;
          }

          operation.importDate = now;
          let operationType = (0, _transactionTypes.transactionTypeIdToName)(sourceOp.type);

          if (operationType !== null) {
            operation.type = operationType;
          } else {
            log.warn('unknown source operation type:', sourceOp.type);
            operation.type = _helpers.UNKNOWN_OPERATION_TYPE;
          }

          operations.push(operation);
        }
      } catch (err) {
        _didIteratorError7 = true;
        _iteratorError7 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion7 && _iterator7.return != null) {
            _iterator7.return();
          }
        } finally {
          if (_didIteratorError7) {
            throw _iteratorError7;
          }
        }
      }

      log.info('Comparing with database to ignore already known operations…');
      let newOperations = [];
      var _iteratorNormalCompletion8 = true;
      var _didIteratorError8 = false;
      var _iteratorError8 = undefined;

      try {
        for (var _iterator8 = accountMap.values()[Symbol.iterator](), _step8; !(_iteratorNormalCompletion8 = (_step8 = _iterator8.next()).done); _iteratorNormalCompletion8 = true) {
          let accountInfo = _step8.value;
          let account = accountInfo.account;
          let provideds = [];
          let remainingOperations = [];
          var _iteratorNormalCompletion12 = true;
          var _didIteratorError12 = false;
          var _iteratorError12 = undefined;

          try {
            for (var _iterator12 = operations[Symbol.iterator](), _step12; !(_iteratorNormalCompletion12 = (_step12 = _iterator12.next()).done); _iteratorNormalCompletion12 = true) {
              let op = _step12.value;

              if (op.accountId === account.id) {
                provideds.push(op);
              } else {
                remainingOperations.push(op);
              }
            }
          } catch (err) {
            _didIteratorError12 = true;
            _iteratorError12 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion12 && _iterator12.return != null) {
                _iterator12.return();
              }
            } finally {
              if (_didIteratorError12) {
                throw _iteratorError12;
              }
            }
          }

          operations = remainingOperations;

          if (provideds.length) {
            let minDate = (0, _moment.default)(new Date(provideds.reduce((min, op) => {
              return Math.min(+op.date, min);
            }, +provideds[0].date))).subtract(MAX_DIFFERENCE_BETWEEN_DUP_DATES_IN_DAYS, 'days').toDate();
            let maxDate = new Date(provideds.reduce((max, op) => {
              return Math.max(+op.date, max);
            }, +provideds[0].date));
            let knowns = yield _transactions.default.byBankSortedByDateBetweenDates(userId, account, minDate, maxDate);

            let _diffOperations = (0, _diffOperations2.default)(knowns, provideds),
                providerOrphans = _diffOperations.providerOrphans,
                duplicateCandidates = _diffOperations.duplicateCandidates; // For now, both orphans and duplicates are added to the database.


            newOperations = newOperations.concat(providerOrphans).concat(duplicateCandidates.map(dup => dup[1])); // Resync balance only if we are sure that the operation is a new one.

            let accountImportDate = new Date(account.importDate);
            accountInfo.balanceOffset = providerOrphans.filter(op => (0, _helpers.shouldIncludeInBalance)(op, accountImportDate, account.type)).reduce((sum, op) => sum + op.amount, 0);
          }
        }
      } catch (err) {
        _didIteratorError8 = true;
        _iteratorError8 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion8 && _iterator8.return != null) {
            _iterator8.return();
          }
        } finally {
          if (_didIteratorError8) {
            throw _iteratorError8;
          }
        }
      }

      let toCreate = newOperations;
      let numNewOperations = toCreate.length;
      newOperations = []; // Create the new operations.

      if (numNewOperations) {
        log.info(`${toCreate.length} new operations found!`);
        log.info('Creating new operations…');
        var _iteratorNormalCompletion9 = true;
        var _didIteratorError9 = false;
        var _iteratorError9 = undefined;

        try {
          for (var _iterator9 = toCreate[Symbol.iterator](), _step9; !(_iteratorNormalCompletion9 = (_step9 = _iterator9.next()).done); _iteratorNormalCompletion9 = true) {
            let operationToCreate = _step9.value;
            let created = yield _transactions.default.create(userId, operationToCreate);
            newOperations.push(created);
          }
        } catch (err) {
          _didIteratorError9 = true;
          _iteratorError9 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion9 && _iterator9.return != null) {
              _iterator9.return();
            }
          } finally {
            if (_didIteratorError9) {
              throw _iteratorError9;
            }
          }
        }
      }

      log.info('Updating accounts balances…');
      var _iteratorNormalCompletion10 = true;
      var _didIteratorError10 = false;
      var _iteratorError10 = undefined;

      try {
        for (var _iterator10 = accountMap.values()[Symbol.iterator](), _step10; !(_iteratorNormalCompletion10 = (_step10 = _iterator10.next()).done); _iteratorNormalCompletion10 = true) {
          let _step10$value = _step10.value,
              account = _step10$value.account,
              balanceOffset = _step10$value.balanceOffset;

          if (balanceOffset) {
            log.info(`Account ${account.label} initial balance is going
to be resynced, by an offset of ${balanceOffset}.`);
            let initialBalance = account.initialBalance - balanceOffset;
            yield _accounts.default.update(userId, account.id, {
              initialBalance
            });
          }
        } // Carry over all the triggers on new operations.

      } catch (err) {
        _didIteratorError10 = true;
        _iteratorError10 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion10 && _iterator10.return != null) {
            _iterator10.return();
          }
        } finally {
          if (_didIteratorError10) {
            throw _iteratorError10;
          }
        }
      }

      log.info("Updating 'last checked' for linked accounts...");
      let accounts = [];
      let lastCheckDate = new Date();
      var _iteratorNormalCompletion11 = true;
      var _didIteratorError11 = false;
      var _iteratorError11 = undefined;

      try {
        for (var _iterator11 = allAccounts[Symbol.iterator](), _step11; !(_iteratorNormalCompletion11 = (_step11 = _iterator11.next()).done); _iteratorNormalCompletion11 = true) {
          let account = _step11.value;
          let updated = yield _accounts.default.update(userId, account.id, {
            lastCheckDate
          });
          accounts.push(updated);
        }
      } catch (err) {
        _didIteratorError11 = true;
        _iteratorError11 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion11 && _iterator11.return != null) {
            _iterator11.return();
          }
        } finally {
          if (_didIteratorError11) {
            throw _iteratorError11;
          }
        }
      }

      if (numNewOperations > 0) {
        log.info(`Informing user ${numNewOperations} new operations have been imported...`);
        yield notifyNewOperations(access, newOperations, accountMap);
        log.info('Checking alerts for accounts balance...');
        yield _alertManager.default.checkAlertsForAccounts(userId, access);
        log.info('Checking alerts for operations amount...');
        yield _alertManager.default.checkAlertsForOperations(userId, access, newOperations);
      }

      yield _accesses.default.update(userId, access.id, {
        fetchStatus: _helpers.FETCH_STATUS_SUCCESS
      });
      log.info('Post process: done.');
      return {
        accounts,
        newOperations
      };
    })();
  }

  resyncAccountBalance(userId, account) {
    return _asyncToGenerator(function* () {
      let access = yield _accesses.default.find(userId, account.accessId); // Note: we do not fetch operations before, because this can lead to duplicates,
      // and compute a false initial balance.

      let accounts = yield retrieveAllAccountsByAccess(userId, access); // Ensure the account number is actually a string.

      let vendorAccountId = account.vendorAccountId.toString();
      let retrievedAccount = accounts.find(acc => acc.vendorAccountId === vendorAccountId);

      if (typeof retrievedAccount !== 'undefined') {
        let realBalance = retrievedAccount.initialBalance;
        let kresusBalance = yield account.computeBalance();
        let balanceDelta = realBalance - kresusBalance;

        if (Math.abs(balanceDelta) > 0.001) {
          log.info(`Updating balance for account ${account.vendorAccountId}`);
          let initialBalance = account.initialBalance + balanceDelta;
          return yield _accounts.default.update(userId, account.id, {
            initialBalance
          });
        }
      } else {
        // This case can happen if it's a known orphan.
        throw new _helpers.KError('account not found', 404);
      }

      return account;
    })();
  }

}

var _default = new AccountManager();

exports.default = _default;