'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _context;

var _cozydb = require('cozydb');

var cozydb = _interopRequireWildcard(_cozydb);

var _helpers = require('../helpers');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

var log = (0, _helpers.makeLogger)('models/alert');

var Alert = cozydb.getModel('bankalert', {
    // external (backend) account id.
    bankAccount: String,

    // possible options are: report, balance, transaction.
    type: String,

    // only for reports : daily, weekly, monthly.
    frequency: String,

    // only for balance/transaction.
    limit: Number,

    // only for balance/transaction: gt, lt.
    order: String,

    // when did the alert get triggered for the last time?
    lastTriggeredDate: Date
});

Alert = (0, _helpers.promisifyModel)(Alert);

var request = (0, _helpers.promisify)((_context = Alert).request.bind(_context));
var requestDestroy = (0, _helpers.promisify)((_context = Alert).requestDestroy.bind(_context));

Alert.byAccount = function () {
    var _ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee(account) {
        var params;
        return regeneratorRuntime.wrap(function _callee$(_context2) {
            while (1) {
                switch (_context2.prev = _context2.next) {
                    case 0:
                        if ((typeof account === 'undefined' ? 'undefined' : _typeof(account)) !== 'object' || typeof account.id !== 'string') {
                            log.warn('Alert.byAccount misuse: account must be an Account instance');
                        }

                        params = {
                            key: account.id
                        };
                        _context2.next = 4;
                        return request('allByBankAccount', params);

                    case 4:
                        return _context2.abrupt('return', _context2.sent);

                    case 5:
                    case 'end':
                        return _context2.stop();
                }
            }
        }, _callee, this);
    }));

    function byAccount(_x) {
        return _ref.apply(this, arguments);
    }

    return byAccount;
}();

Alert.byAccountAndType = function () {
    var _ref2 = _asyncToGenerator(regeneratorRuntime.mark(function _callee2(accountID, type) {
        var params;
        return regeneratorRuntime.wrap(function _callee2$(_context3) {
            while (1) {
                switch (_context3.prev = _context3.next) {
                    case 0:
                        if (typeof accountID !== 'string') {
                            log.warn('Alert.byAccountAndType misuse: accountID must be a string');
                        }
                        if (typeof type !== 'string') {
                            log.warn('Alert.byAccountAndType misuse: type must be a string');
                        }

                        params = {
                            key: [accountID, type]
                        };
                        _context3.next = 5;
                        return request('allByBankAccountAndType', params);

                    case 5:
                        return _context3.abrupt('return', _context3.sent);

                    case 6:
                    case 'end':
                        return _context3.stop();
                }
            }
        }, _callee2, this);
    }));

    function byAccountAndType(_x2, _x3) {
        return _ref2.apply(this, arguments);
    }

    return byAccountAndType;
}();

Alert.reportsByFrequency = function () {
    var _ref3 = _asyncToGenerator(regeneratorRuntime.mark(function _callee3(frequency) {
        var params;
        return regeneratorRuntime.wrap(function _callee3$(_context4) {
            while (1) {
                switch (_context4.prev = _context4.next) {
                    case 0:
                        if (typeof frequency !== 'string') {
                            log.warn('Alert.reportsByFrequency misuse: frequency must be a string');
                        }

                        params = {
                            key: ['report', frequency]
                        };
                        _context4.next = 4;
                        return request('allReportsByFrequency', params);

                    case 4:
                        return _context4.abrupt('return', _context4.sent);

                    case 5:
                    case 'end':
                        return _context4.stop();
                }
            }
        }, _callee3, this);
    }));

    function reportsByFrequency(_x4) {
        return _ref3.apply(this, arguments);
    }

    return reportsByFrequency;
}();

Alert.destroyByAccount = function () {
    var _ref4 = _asyncToGenerator(regeneratorRuntime.mark(function _callee4(id) {
        var params;
        return regeneratorRuntime.wrap(function _callee4$(_context5) {
            while (1) {
                switch (_context5.prev = _context5.next) {
                    case 0:
                        if (typeof id !== 'string') {
                            log.warn("Alert.destroyByAccount API misuse: id isn't a string");
                        }

                        params = {
                            key: id,
                            // Why the limit? See https://github.com/cozy/cozy-db/issues/41
                            limit: 9999999
                        };
                        _context5.next = 4;
                        return requestDestroy('allByBankAccount', params);

                    case 4:
                        return _context5.abrupt('return', _context5.sent);

                    case 5:
                    case 'end':
                        return _context5.stop();
                }
            }
        }, _callee4, this);
    }));

    function destroyByAccount(_x5) {
        return _ref4.apply(this, arguments);
    }

    return destroyByAccount;
}();

// Sync function
Alert.prototype.testTransaction = function (operation) {
    if (this.type !== 'transaction') {
        return false;
    }

    var alertLimit = +this.limit;
    var amount = Math.abs(operation.amount);
    return this.order === 'lt' && amount <= alertLimit || this.order === 'gt' && amount >= alertLimit;
};

// Sync function
Alert.prototype.testBalance = function (balance) {
    if (this.type !== 'balance') {
        return false;
    }

    var alertLimit = +this.limit;
    return this.order === 'lt' && balance <= alertLimit || this.order === 'gt' && balance >= alertLimit;
};

Alert.prototype.formatOperationMessage = function (operation, accountName, formatCurrency) {
    var cmp = this.order === 'lt' ? (0, _helpers.translate)('server.alert.operation.lessThan') : (0, _helpers.translate)('server.alert.operation.greaterThan');

    var amount = formatCurrency(operation.amount);
    var date = _helpers.formatDate.toShortString(operation.date);
    var limit = formatCurrency(this.limit);

    return (0, _helpers.translate)('server.alert.operation.content', {
        title: operation.title,
        account: accountName,
        amount: amount,
        cmp: cmp,
        date: date,
        limit: limit
    });
};

Alert.prototype.formatAccountMessage = function (title, balance, formatCurrency) {
    var cmp = this.order === 'lt' ? (0, _helpers.translate)('server.alert.balance.lessThan') : (0, _helpers.translate)('server.alert.balance.greaterThan');

    var limit = formatCurrency(this.limit);
    var formattedBalance = formatCurrency(balance);

    return (0, _helpers.translate)('server.alert.balance.content', {
        title: title,
        cmp: cmp,
        limit: limit,
        balance: formattedBalance
    });
};

module.exports = Alert;