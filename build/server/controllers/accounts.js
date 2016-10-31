'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.resyncBalance = exports.getOperations = exports.destroy = exports.destroyWithOperations = exports.preloadAccount = undefined;

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

// Prefills the @account field with a queried bank account.
var preloadAccount = exports.preloadAccount = function () {
    var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(req, res, next, accountID) {
        var account;
        return _regenerator2.default.wrap(function _callee$(_context) {
            while (1) {
                switch (_context.prev = _context.next) {
                    case 0:
                        _context.prev = 0;
                        _context.next = 3;
                        return _account2.default.find(accountID);

                    case 3:
                        account = _context.sent;

                        if (account) {
                            _context.next = 6;
                            break;
                        }

                        throw new _helpers.KError('Bank account not found', 404);

                    case 6:
                        req.preloaded = { account: account };
                        next();
                        _context.next = 13;
                        break;

                    case 10:
                        _context.prev = 10;
                        _context.t0 = _context['catch'](0);
                        return _context.abrupt('return', (0, _helpers.asyncErr)(res, _context.t0, 'when preloading a bank account'));

                    case 13:
                    case 'end':
                        return _context.stop();
                }
            }
        }, _callee, this, [[0, 10]]);
    }));

    return function preloadAccount(_x, _x2, _x3, _x4) {
        return _ref.apply(this, arguments);
    };
}();

// Destroy an account and all its operations, alerts, and accesses if no other
// accounts are bound to this access.


var destroyWithOperations = exports.destroyWithOperations = function () {
    var _ref2 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee2(account) {
        var found, accounts;
        return _regenerator2.default.wrap(function _callee2$(_context2) {
            while (1) {
                switch (_context2.prev = _context2.next) {
                    case 0:
                        log.info('Removing account ' + account.title + ' from database...');

                        log.info('\t-> Destroy operations for account ' + account.title);
                        _context2.next = 4;
                        return _operation2.default.destroyByAccount(account.accountNumber);

                    case 4:

                        log.info('\t-> Destroy alerts for account ' + account.title);
                        _context2.next = 7;
                        return _alert2.default.destroyByAccount(account.accountNumber);

                    case 7:

                        log.info('\t-> Checking if ' + account.title + ' is the default account');
                        _context2.next = 10;
                        return _config2.default.findOrCreateDefault('defaultAccountId');

                    case 10:
                        found = _context2.sent;

                        if (!(found && found.value === account.id)) {
                            _context2.next = 16;
                            break;
                        }

                        log.info('\t\t-> Removing the default account');
                        found.value = '';
                        _context2.next = 16;
                        return found.save();

                    case 16:

                        log.info('\t-> Destroy account ' + account.title);
                        _context2.next = 19;
                        return account.destroy();

                    case 19:
                        _context2.next = 21;
                        return _account2.default.byAccess({ id: account.bankAccess });

                    case 21:
                        accounts = _context2.sent;

                        if (!(accounts && accounts.length === 0)) {
                            _context2.next = 26;
                            break;
                        }

                        log.info('\t-> No other accounts bound: destroying access.');
                        _context2.next = 26;
                        return _access2.default.destroy(account.bankAccess);

                    case 26:
                    case 'end':
                        return _context2.stop();
                }
            }
        }, _callee2, this);
    }));

    return function destroyWithOperations(_x5) {
        return _ref2.apply(this, arguments);
    };
}();

// Delete account, operations and alerts.


var destroy = exports.destroy = function () {
    var _ref3 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee3(req, res) {
        return _regenerator2.default.wrap(function _callee3$(_context3) {
            while (1) {
                switch (_context3.prev = _context3.next) {
                    case 0:
                        _context3.prev = 0;
                        _context3.next = 3;
                        return destroyWithOperations(req.preloaded.account);

                    case 3:
                        res.sendStatus(204);
                        _context3.next = 9;
                        break;

                    case 6:
                        _context3.prev = 6;
                        _context3.t0 = _context3['catch'](0);
                        return _context3.abrupt('return', (0, _helpers.asyncErr)(res, _context3.t0, 'when destroying an account'));

                    case 9:
                    case 'end':
                        return _context3.stop();
                }
            }
        }, _callee3, this, [[0, 6]]);
    }));

    return function destroy(_x6, _x7) {
        return _ref3.apply(this, arguments);
    };
}();

// Get operations of a given bank account


var getOperations = exports.getOperations = function () {
    var _ref4 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee4(req, res) {
        var account, operations;
        return _regenerator2.default.wrap(function _callee4$(_context4) {
            while (1) {
                switch (_context4.prev = _context4.next) {
                    case 0:
                        _context4.prev = 0;
                        account = req.preloaded.account;
                        _context4.next = 4;
                        return _operation2.default.byBankSortedByDate(account);

                    case 4:
                        operations = _context4.sent;

                        res.status(200).send(operations);
                        _context4.next = 11;
                        break;

                    case 8:
                        _context4.prev = 8;
                        _context4.t0 = _context4['catch'](0);
                        return _context4.abrupt('return', (0, _helpers.asyncErr)(res, _context4.t0, 'when getting operations for a bank account'));

                    case 11:
                    case 'end':
                        return _context4.stop();
                }
            }
        }, _callee4, this, [[0, 8]]);
    }));

    return function getOperations(_x8, _x9) {
        return _ref4.apply(this, arguments);
    };
}();

var resyncBalance = exports.resyncBalance = function () {
    var _ref5 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee5(req, res) {
        var account, accountManager, updatedAccount;
        return _regenerator2.default.wrap(function _callee5$(_context5) {
            while (1) {
                switch (_context5.prev = _context5.next) {
                    case 0:
                        _context5.prev = 0;
                        account = req.preloaded.account;
                        accountManager = new _accountsManager2.default();
                        _context5.next = 5;
                        return accountManager.resyncBalanceOfAccount(account);

                    case 5:
                        updatedAccount = _context5.sent;

                        res.status(200).send(updatedAccount);
                        _context5.next = 12;
                        break;

                    case 9:
                        _context5.prev = 9;
                        _context5.t0 = _context5['catch'](0);
                        return _context5.abrupt('return', (0, _helpers.asyncErr)(res, _context5.t0, 'when getting balance of a bank account'));

                    case 12:
                    case 'end':
                        return _context5.stop();
                }
            }
        }, _callee5, this, [[0, 9]]);
    }));

    return function resyncBalance(_x10, _x11) {
        return _ref5.apply(this, arguments);
    };
}();

var _account = require('../models/account');

var _account2 = _interopRequireDefault(_account);

var _operation = require('../models/operation');

var _operation2 = _interopRequireDefault(_operation);

var _access = require('../models/access');

var _access2 = _interopRequireDefault(_access);

var _alert = require('../models/alert');

var _alert2 = _interopRequireDefault(_alert);

var _config = require('../models/config');

var _config2 = _interopRequireDefault(_config);

var _accountsManager = require('../lib/accounts-manager');

var _accountsManager2 = _interopRequireDefault(_accountsManager);

var _helpers = require('../helpers');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var log = (0, _helpers.makeLogger)('controllers/accounts');