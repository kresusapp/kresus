'use strict';

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _typeof2 = require('babel-runtime/helpers/typeof');

var _typeof3 = _interopRequireDefault(_typeof2);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _context;

var _cozydb = require('cozydb');

var americano = _interopRequireWildcard(_cozydb);

var _helpers = require('../helpers');

var _operation = require('./operation');

var _operation2 = _interopRequireDefault(_operation);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var log = (0, _helpers.makeLogger)('models/account');

var Account = americano.getModel('bankaccount', {
    // Weboob module name
    bank: String,

    // bankAccess is an internal (couchdb) id
    bankAccess: String,

    title: String,
    accountNumber: String,
    iban: String,
    initialAmount: Number,
    currency: String,
    lastChecked: Date,
    importDate: Date
});

Account = (0, _helpers.promisifyModel)(Account);

var request = (0, _helpers.promisify)((_context = Account).request.bind(_context));

Account.byBank = function () {
    var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(bank) {
        var params;
        return _regenerator2.default.wrap(function _callee$(_context2) {
            while (1) {
                switch (_context2.prev = _context2.next) {
                    case 0:
                        if ((typeof bank === 'undefined' ? 'undefined' : (0, _typeof3.default)(bank)) !== 'object' || typeof bank.uuid !== 'string') log.warn('Account.byBank misuse: bank must be a Bank instance');

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
    var _ref2 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee2(accountIds) {
        var params;
        return _regenerator2.default.wrap(function _callee2$(_context3) {
            while (1) {
                switch (_context3.prev = _context3.next) {
                    case 0:
                        if (!(accountIds instanceof Array)) log.warn('Account.findMany misuse: accountIds must be an Array');
                        if (accountIds.length && typeof accountIds[0] !== 'string') log.warn('Account.findMany misuse: accountIds must be a [String]');

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
    var _ref3 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee3(accountNumber) {
        var params;
        return _regenerator2.default.wrap(function _callee3$(_context4) {
            while (1) {
                switch (_context4.prev = _context4.next) {
                    case 0:
                        if (typeof accountNumber !== 'string') log.warn('Account.byAccountNumber misuse: 1st param must be a string');

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
    var _ref4 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee4(access) {
        var params;
        return _regenerator2.default.wrap(function _callee4$(_context5) {
            while (1) {
                switch (_context5.prev = _context5.next) {
                    case 0:
                        if ((typeof access === 'undefined' ? 'undefined' : (0, _typeof3.default)(access)) !== 'object' || typeof access.id !== 'string') log.warn('Account.byAccess misuse: access must be an Access instance');

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
    var _ref5 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee5() {
        var ops, s;
        return _regenerator2.default.wrap(function _callee5$(_context6) {
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