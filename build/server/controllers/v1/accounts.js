"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.preloadAccount = preloadAccount;
exports.destroyWithOperations = destroyWithOperations;
exports.update = update;
exports.destroy = destroy;
exports.resyncBalance = resyncBalance;

var _accesses = _interopRequireDefault(require("../../models/accesses"));

var _accounts = _interopRequireDefault(require("../../models/accounts"));

var _alerts = _interopRequireDefault(require("../../models/alerts"));

var _settings = _interopRequireDefault(require("../../models/settings"));

var _transactions = _interopRequireDefault(require("../../models/transactions"));

var _accountsManager = _interopRequireDefault(require("../../lib/accounts-manager"));

var _settings2 = require("./settings");

var _helpers = require("../../helpers");

var _validators = require("../../shared/validators");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

let log = (0, _helpers.makeLogger)('controllers/accounts'); // Prefills the @account field with a queried bank account.

function preloadAccount(_x, _x2, _x3, _x4) {
  return _preloadAccount.apply(this, arguments);
} // Destroy an account and all its operations, alerts, and accesses if no other
// accounts are bound to this access.


function _preloadAccount() {
  _preloadAccount = _asyncToGenerator(function* (req, res, next, accountID) {
    try {
      let userId = req.user.id;
      let account = yield _accounts.default.find(userId, accountID);

      if (!account) {
        throw new _helpers.KError('Bank account not found', 404);
      }

      req.preloaded = {
        account
      };
      return next();
    } catch (err) {
      return (0, _helpers.asyncErr)(res, err, 'when preloading a bank account');
    }
  });
  return _preloadAccount.apply(this, arguments);
}

function destroyWithOperations(_x5, _x6) {
  return _destroyWithOperations.apply(this, arguments);
}

function _destroyWithOperations() {
  _destroyWithOperations = _asyncToGenerator(function* (userId, account) {
    log.info(`Removing account ${account.label} from database...`);
    log.info(`\t-> Destroy operations for account ${account.label}`);
    yield _transactions.default.destroyByAccount(userId, account.id);
    log.info(`\t-> Destroy alerts for account ${account.label}`);
    yield _alerts.default.destroyByAccount(userId, account.id);
    log.info(`\t-> Checking if ${account.label} is the default account`);
    let found = yield _settings.default.findOrCreateDefault(userId, 'default-account-id');

    if (found && found.value === account.id) {
      log.info('\t\t-> Removing the default account');
      yield _settings.default.update(userId, found.id, {
        value: ''
      });
    }

    log.info(`\t-> Destroy account ${account.label}`);
    yield _accounts.default.destroy(userId, account.id);
    let accounts = yield _accounts.default.byAccess(userId, {
      id: account.accessId
    });

    if (accounts && accounts.length === 0) {
      log.info('\t-> No other accounts bound: destroying access.');
      yield _accesses.default.destroy(userId, account.accessId);
    }
  });
  return _destroyWithOperations.apply(this, arguments);
}

function update(_x7, _x8) {
  return _update.apply(this, arguments);
} // Delete account, operations and alerts.


function _update() {
  _update = _asyncToGenerator(function* (req, res) {
    try {
      let userId = req.user.id;
      let newFields = req.body;
      let error = (0, _validators.checkAllowedFields)(newFields, ['excludeFromBalance', 'customLabel']);

      if (error) {
        throw new _helpers.KError(`when updating an account: ${error}`, 400);
      }

      let account = req.preloaded.account;
      let newAccount = yield _accounts.default.update(userId, account.id, newFields);
      res.status(200).json(newAccount);
    } catch (err) {
      return (0, _helpers.asyncErr)(res, err, 'when updating an account');
    }
  });
  return _update.apply(this, arguments);
}

function destroy(_x9, _x10) {
  return _destroy.apply(this, arguments);
}

function _destroy() {
  _destroy = _asyncToGenerator(function* (req, res) {
    try {
      let userId = req.user.id;

      if (yield (0, _settings2.isDemoEnabled)(userId)) {
        throw new _helpers.KError("account deletion isn't allowed in demo mode", 400);
      }

      yield destroyWithOperations(userId, req.preloaded.account);
      res.status(204).end();
    } catch (err) {
      return (0, _helpers.asyncErr)(res, err, 'when destroying an account');
    }
  });
  return _destroy.apply(this, arguments);
}

function resyncBalance(_x11, _x12) {
  return _resyncBalance.apply(this, arguments);
}

function _resyncBalance() {
  _resyncBalance = _asyncToGenerator(function* (req, res) {
    try {
      let userId = req.user.id;
      let account = req.preloaded.account;
      let updatedAccount = yield _accountsManager.default.resyncAccountBalance(userId, account);
      res.status(200).json(updatedAccount);
    } catch (err) {
      return (0, _helpers.asyncErr)(res, err, 'when getting balance of a bank account');
    }
  });
  return _resyncBalance.apply(this, arguments);
}