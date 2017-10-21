'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _context;

var _cozydb = require('cozydb');

var cozydb = _interopRequireWildcard(_cozydb);

var _helpers = require('../helpers');

var _operation = require('./operation');

var _operation2 = _interopRequireDefault(_operation);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

var log = (0, _helpers.makeLogger)('models/account');

var Account = cozydb.getModel('bankaccount', {
    // ************************************************************************
    // EXTERNAL LINKS
    // ************************************************************************

    // External (backend) bank module identifier, determining which source to use.
    // TODO could be removed, since this is in the linked access?
    bank: String,

    // Id of the bankaccess instance.
    bankAccess: String,

    // Account number provided by the source. Acts as an id for other models.
    accountNumber: String,

    // ************************************************************************
    // ACCOUNT INFORMATION
    // ************************************************************************

    // Date at which the account has been imported.
    importDate: Date,

    // Amount on the account, at the date at which it has been imported.
    initialAmount: Number,

    // Date at which the account has been polled for the last time.
    lastChecked: Date,

    // Label describing the account provided by the source.
    title: String,

    // IBAN provided by the source (optional).
    iban: String,

    // Currency used by the account.
    currency: String
});

Account = (0, _helpers.promisifyModel)(Account);

var request = (0, _helpers.promisify)((_context = Account).request.bind(_context));

Account.byBank = function () {
    var _ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee(bank) {
        var params;
        return regeneratorRuntime.wrap(function _callee$(_context2) {
            while (1) {
                switch (_context2.prev = _context2.next) {
                    case 0:
                        if ((typeof bank === 'undefined' ? 'undefined' : _typeof(bank)) !== 'object' || typeof bank.uuid !== 'string') {
                            log.warn('Account.byBank misuse: bank must be a Bank instance');
                        }

                        params = {
                            key: bank.uuid
                        };
                        _context2.next = 4;
                        return request('allByBank', params);

                    case 4:
                        return _context2.abrupt('return', _context2.sent);

                    case 5:
                    case 'end':
                        return _context2.stop();
                }
            }
        }, _callee, this);
    }));

    function byBank(_x) {
        return _ref.apply(this, arguments);
    }

    return byBank;
}();

Account.findMany = function () {
    var _ref2 = _asyncToGenerator(regeneratorRuntime.mark(function _callee2(accountIds) {
        var params;
        return regeneratorRuntime.wrap(function _callee2$(_context3) {
            while (1) {
                switch (_context3.prev = _context3.next) {
                    case 0:
                        if (!(accountIds instanceof Array)) {
                            log.warn('Account.findMany misuse: accountIds must be an Array');
                        }
                        if (accountIds.length && typeof accountIds[0] !== 'string') {
                            log.warn('Account.findMany misuse: accountIds must be a [String]');
                        }

                        params = {
                            keys: accountIds.slice()
                        };
                        _context3.next = 5;
                        return request('allByAccountNumber', params);

                    case 5:
                        return _context3.abrupt('return', _context3.sent);

                    case 6:
                    case 'end':
                        return _context3.stop();
                }
            }
        }, _callee2, this);
    }));

    function findMany(_x2) {
        return _ref2.apply(this, arguments);
    }

    return findMany;
}();

Account.byAccountNumber = function () {
    var _ref3 = _asyncToGenerator(regeneratorRuntime.mark(function _callee3(accountNumber) {
        var params;
        return regeneratorRuntime.wrap(function _callee3$(_context4) {
            while (1) {
                switch (_context4.prev = _context4.next) {
                    case 0:
                        if (typeof accountNumber !== 'string') {
                            log.warn('Account.byAccountNumber misuse: 1st param must be a string');
                        }

                        params = {
                            key: accountNumber
                        };
                        _context4.next = 4;
                        return request('allByAccountNumber', params);

                    case 4:
                        return _context4.abrupt('return', _context4.sent);

                    case 5:
                    case 'end':
                        return _context4.stop();
                }
            }
        }, _callee3, this);
    }));

    function byAccountNumber(_x3) {
        return _ref3.apply(this, arguments);
    }

    return byAccountNumber;
}();

Account.byAccess = function () {
    var _ref4 = _asyncToGenerator(regeneratorRuntime.mark(function _callee4(access) {
        var params;
        return regeneratorRuntime.wrap(function _callee4$(_context5) {
            while (1) {
                switch (_context5.prev = _context5.next) {
                    case 0:
                        if ((typeof access === 'undefined' ? 'undefined' : _typeof(access)) !== 'object' || typeof access.id !== 'string') {
                            log.warn('Account.byAccess misuse: access must be an Access instance');
                        }

                        params = {
                            key: access.id
                        };
                        _context5.next = 4;
                        return request('allByBankAccess', params);

                    case 4:
                        return _context5.abrupt('return', _context5.sent);

                    case 5:
                    case 'end':
                        return _context5.stop();
                }
            }
        }, _callee4, this);
    }));

    function byAccess(_x4) {
        return _ref4.apply(this, arguments);
    }

    return byAccess;
}();

Account.prototype.computeBalance = function () {
    var _ref5 = _asyncToGenerator(regeneratorRuntime.mark(function _callee5() {
        var ops, s;
        return regeneratorRuntime.wrap(function _callee5$(_context6) {
            while (1) {
                switch (_context6.prev = _context6.next) {
                    case 0:
                        _context6.next = 2;
                        return _operation2.default.byAccount(this);

                    case 2:
                        ops = _context6.sent;
                        s = ops.reduce(function (sum, op) {
                            return sum + op.amount;
                        }, this.initialAmount);
                        return _context6.abrupt('return', Math.round(s * 100) / 100);

                    case 5:
                    case 'end':
                        return _context6.stop();
                }
            }
        }, _callee5, this);
    }));

    function computeBalance() {
        return _ref5.apply(this, arguments);
    }

    return computeBalance;
}();

module.exports = Account;