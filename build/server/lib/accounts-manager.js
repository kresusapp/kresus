'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _getIterator2 = require('babel-runtime/core-js/get-iterator');

var _getIterator3 = _interopRequireDefault(_getIterator2);

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

var _operation = require('../models/operation');

var _operation2 = _interopRequireDefault(_operation);

var _alert = require('../models/alert');

var _alert2 = _interopRequireDefault(_alert);

var _account2 = require('../models/account');

var _account3 = _interopRequireDefault(_account2);

var _operationtype = require('../models/operationtype');

var _operationtype2 = _interopRequireDefault(_operationtype);

var _errors = require('../controllers/errors');

var _errors2 = _interopRequireDefault(_errors);

var _helpers = require('../helpers');

var _alertManager = require('./alert-manager');

var _alertManager2 = _interopRequireDefault(_alertManager);

var _notifications = require('./notifications');

var _notifications2 = _interopRequireDefault(_notifications);

var _mock = require('./sources/mock');

var mockBackend = _interopRequireWildcard(_mock);

var _weboob = require('./sources/weboob');

var weboobBackend = _interopRequireWildcard(_weboob);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var log = (0, _helpers.makeLogger)('accounts-manager');

var SOURCE_HANDLERS = {};
function addBackend(exportObject) {
    if (typeof exportObject.SOURCE_NAME === 'undefined' || typeof exportObject.fetchAccounts === 'undefined' || typeof exportObject.fetchOperations === 'undefined') {
        throw "Backend doesn't implement basic functionalty";
    }

    SOURCE_HANDLERS[exportObject.SOURCE_NAME] = exportObject;
}

// Add backends here.

addBackend(mockBackend);
addBackend(weboobBackend);

// Connect static bank information to their backends.
var ALL_BANKS = require('../shared/banks.json');
var BANK_HANDLERS = {};
var _iteratorNormalCompletion = true;
var _didIteratorError = false;
var _iteratorError = undefined;

try {
    for (var _iterator = (0, _getIterator3.default)(ALL_BANKS), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var bank = _step.value;

        if (!bank.backend || !(bank.backend in SOURCE_HANDLERS)) throw 'Bank handler not described or not imported.';
        BANK_HANDLERS[bank.uuid] = SOURCE_HANDLERS[bank.backend];
    }

    // Sync function
} catch (err) {
    _didIteratorError = true;
    _iteratorError = err;
} finally {
    try {
        if (!_iteratorNormalCompletion && _iterator.return) {
            _iterator.return();
        }
    } finally {
        if (_didIteratorError) {
            throw _iteratorError;
        }
    }
}

function tryMatchAccount(target, accounts) {
    var _iteratorNormalCompletion2 = true;
    var _didIteratorError2 = false;
    var _iteratorError2 = undefined;

    try {

        for (var _iterator2 = (0, _getIterator3.default)(accounts), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
            var a = _step2.value;

            if (a.bank !== target.bank) log.info('data inconsistency when trying to match accounts with\n                     existing ones: "bank" attributes are different', a.bank, target.bank);

            // Remove spaces (e.g. Credit Mutuel would randomly add spaces in
            // account names) and lower case.
            var oldTitle = a.title.replace(/ /g, '').toLowerCase();
            var newTitle = target.title.replace(/ /g, '').toLowerCase();

            // Keep in sync with the check at the top of mergeAccounts.
            if (oldTitle === newTitle && a.accountNumber === target.accountNumber && a.iban === target.iban) {
                return { found: true };
            }

            if (oldTitle === newTitle || a.accountNumber === target.accountNumber) {
                return {
                    mergeCandidates: {
                        old: a,
                        new: target
                    }
                };
            }
        }
    } catch (err) {
        _didIteratorError2 = true;
        _iteratorError2 = err;
    } finally {
        try {
            if (!_iteratorNormalCompletion2 && _iterator2.return) {
                _iterator2.return();
            }
        } finally {
            if (_didIteratorError2) {
                throw _iteratorError2;
            }
        }
    }

    return { found: false };
}

var mergeAccounts = (function () {
    var ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(old, kid) {
        var ops, _iteratorNormalCompletion3, _didIteratorError3, _iteratorError3, _iterator3, _step3, op, alerts, _iteratorNormalCompletion4, _didIteratorError4, _iteratorError4, _iterator4, _step4, alert, newAccount;

        return _regenerator2.default.wrap(function _callee$(_context) {
            while (1) {
                switch (_context.prev = _context.next) {
                    case 0:
                        if (!(old.accountNumber === kid.accountNumber && old.title === kid.title && old.iban === kid.iban)) {
                            _context.next = 2;
                            break;
                        }

                        throw "mergeAccounts shouldn't have been called in the first place!";

                    case 2:

                        log.info('Merging (' + old.accountNumber + ', ' + old.title + ') with\n             (' + kid.accountNumber + ', ' + kid.title + ').');

                        _context.next = 5;
                        return _operation2.default.byAccount(old);

                    case 5:
                        ops = _context.sent;
                        _iteratorNormalCompletion3 = true;
                        _didIteratorError3 = false;
                        _iteratorError3 = undefined;
                        _context.prev = 9;
                        _iterator3 = (0, _getIterator3.default)(ops);

                    case 11:
                        if (_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done) {
                            _context.next = 19;
                            break;
                        }

                        op = _step3.value;

                        if (!(op.bankAccount !== kid.accountNumber)) {
                            _context.next = 16;
                            break;
                        }

                        _context.next = 16;
                        return op.updateAttributes({ bankAccount: kid.accountNumber });

                    case 16:
                        _iteratorNormalCompletion3 = true;
                        _context.next = 11;
                        break;

                    case 19:
                        _context.next = 25;
                        break;

                    case 21:
                        _context.prev = 21;
                        _context.t0 = _context['catch'](9);
                        _didIteratorError3 = true;
                        _iteratorError3 = _context.t0;

                    case 25:
                        _context.prev = 25;
                        _context.prev = 26;

                        if (!_iteratorNormalCompletion3 && _iterator3.return) {
                            _iterator3.return();
                        }

                    case 28:
                        _context.prev = 28;

                        if (!_didIteratorError3) {
                            _context.next = 31;
                            break;
                        }

                        throw _iteratorError3;

                    case 31:
                        return _context.finish(28);

                    case 32:
                        return _context.finish(25);

                    case 33:
                        _context.next = 35;
                        return _alert2.default.byAccount(old);

                    case 35:
                        alerts = _context.sent;
                        _iteratorNormalCompletion4 = true;
                        _didIteratorError4 = false;
                        _iteratorError4 = undefined;
                        _context.prev = 39;
                        _iterator4 = (0, _getIterator3.default)(alerts);

                    case 41:
                        if (_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done) {
                            _context.next = 49;
                            break;
                        }

                        alert = _step4.value;

                        if (!(alert.bankAccount !== kid.accountNumber)) {
                            _context.next = 46;
                            break;
                        }

                        _context.next = 46;
                        return alert.updateAttributes({ bankAccount: kid.accountNumber });

                    case 46:
                        _iteratorNormalCompletion4 = true;
                        _context.next = 41;
                        break;

                    case 49:
                        _context.next = 55;
                        break;

                    case 51:
                        _context.prev = 51;
                        _context.t1 = _context['catch'](39);
                        _didIteratorError4 = true;
                        _iteratorError4 = _context.t1;

                    case 55:
                        _context.prev = 55;
                        _context.prev = 56;

                        if (!_iteratorNormalCompletion4 && _iterator4.return) {
                            _iterator4.return();
                        }

                    case 58:
                        _context.prev = 58;

                        if (!_didIteratorError4) {
                            _context.next = 61;
                            break;
                        }

                        throw _iteratorError4;

                    case 61:
                        return _context.finish(58);

                    case 62:
                        return _context.finish(55);

                    case 63:
                        newAccount = {
                            accountNumber: kid.accountNumber,
                            title: kid.title,
                            iban: kid.iban
                        };
                        _context.next = 66;
                        return old.updateAttributes(newAccount);

                    case 66:
                    case 'end':
                        return _context.stop();
                }
            }
        }, _callee, this, [[9, 21, 25, 33], [26,, 28, 32], [39, 51, 55, 63], [56,, 58, 62]]);
    }));
    return function mergeAccounts(_x, _x2) {
        return ref.apply(this, arguments);
    };
})();

var AccountManager = (function () {
    function AccountManager() {
        (0, _classCallCheck3.default)(this, AccountManager);

        this.newAccounts = [];
        this.newOperations = [];
    }

    (0, _createClass3.default)(AccountManager, [{
        key: 'retrieveAndAddAccountsByAccess',
        value: (function () {
            var ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee2(access) {
                return _regenerator2.default.wrap(function _callee2$(_context2) {
                    while (1) {
                        switch (_context2.prev = _context2.next) {
                            case 0:
                                _context2.next = 2;
                                return this.retrieveAccountsByAccess(access, true);

                            case 2:
                                return _context2.abrupt('return', _context2.sent);

                            case 3:
                            case 'end':
                                return _context2.stop();
                        }
                    }
                }, _callee2, this);
            }));
            return function retrieveAndAddAccountsByAccess(_x3) {
                return ref.apply(this, arguments);
            };
        })()
    }, {
        key: 'retrieveAccountsByAccess',
        value: (function () {
            var ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee3(access, shouldAddNewAccounts) {
                var body, accountsWeboob, accounts, _iteratorNormalCompletion5, _didIteratorError5, _iteratorError5, _iterator5, _step5, accountWeboob, account, oldAccounts, _iteratorNormalCompletion6, _didIteratorError6, _iteratorError6, _iterator6, _step6, matches, m, newAccount;

                return _regenerator2.default.wrap(function _callee3$(_context3) {
                    while (1) {
                        switch (_context3.prev = _context3.next) {
                            case 0:
                                if (access.hasPassword()) {
                                    _context3.next = 3;
                                    break;
                                }

                                log.warn("Skipping accounts fetching -- password isn't present");
                                throw {
                                    status: 500,
                                    code: (0, _errors2.default)('NO_PASSWORD'),
                                    message: "Access' password is not set"
                                };

                            case 3:
                                _context3.next = 5;
                                return BANK_HANDLERS[access.bank].fetchAccounts(access);

                            case 5:
                                body = _context3.sent;
                                accountsWeboob = body['' + access.bank];
                                accounts = [];
                                _iteratorNormalCompletion5 = true;
                                _didIteratorError5 = false;
                                _iteratorError5 = undefined;
                                _context3.prev = 11;

                                for (_iterator5 = (0, _getIterator3.default)(accountsWeboob); !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
                                    accountWeboob = _step5.value;
                                    account = {
                                        accountNumber: accountWeboob.accountNumber,
                                        bank: access.bank,
                                        bankAccess: access.id,
                                        iban: accountWeboob.iban,
                                        title: accountWeboob.label,
                                        initialAmount: accountWeboob.balance,
                                        lastChecked: new Date()
                                    };

                                    accounts.push(account);
                                }

                                _context3.next = 19;
                                break;

                            case 15:
                                _context3.prev = 15;
                                _context3.t0 = _context3['catch'](11);
                                _didIteratorError5 = true;
                                _iteratorError5 = _context3.t0;

                            case 19:
                                _context3.prev = 19;
                                _context3.prev = 20;

                                if (!_iteratorNormalCompletion5 && _iterator5.return) {
                                    _iterator5.return();
                                }

                            case 22:
                                _context3.prev = 22;

                                if (!_didIteratorError5) {
                                    _context3.next = 25;
                                    break;
                                }

                                throw _iteratorError5;

                            case 25:
                                return _context3.finish(22);

                            case 26:
                                return _context3.finish(19);

                            case 27:
                                log.info('-> ' + accounts.length + ' bank account(s) found');
                                _context3.next = 30;
                                return _account3.default.byAccess(access);

                            case 30:
                                oldAccounts = _context3.sent;
                                _iteratorNormalCompletion6 = true;
                                _didIteratorError6 = false;
                                _iteratorError6 = undefined;
                                _context3.prev = 34;
                                _iterator6 = (0, _getIterator3.default)(accounts);

                            case 36:
                                if (_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done) {
                                    _context3.next = 57;
                                    break;
                                }

                                account = _step6.value;
                                matches = tryMatchAccount(account, oldAccounts);

                                if (!matches.found) {
                                    _context3.next = 42;
                                    break;
                                }

                                log.info('Account was already present.');
                                return _context3.abrupt('continue', 54);

                            case 42:
                                if (!matches.mergeCandidates) {
                                    _context3.next = 48;
                                    break;
                                }

                                m = matches.mergeCandidates;

                                log.info('Found candidates for merging!');
                                _context3.next = 47;
                                return mergeAccounts(m.old, m.new);

                            case 47:
                                return _context3.abrupt('continue', 54);

                            case 48:
                                if (!shouldAddNewAccounts) {
                                    _context3.next = 54;
                                    break;
                                }

                                log.info('New account found.');
                                _context3.next = 52;
                                return _account3.default.create(account);

                            case 52:
                                newAccount = _context3.sent;

                                this.newAccounts.push(newAccount);

                            case 54:
                                _iteratorNormalCompletion6 = true;
                                _context3.next = 36;
                                break;

                            case 57:
                                _context3.next = 63;
                                break;

                            case 59:
                                _context3.prev = 59;
                                _context3.t1 = _context3['catch'](34);
                                _didIteratorError6 = true;
                                _iteratorError6 = _context3.t1;

                            case 63:
                                _context3.prev = 63;
                                _context3.prev = 64;

                                if (!_iteratorNormalCompletion6 && _iterator6.return) {
                                    _iterator6.return();
                                }

                            case 66:
                                _context3.prev = 66;

                                if (!_didIteratorError6) {
                                    _context3.next = 69;
                                    break;
                                }

                                throw _iteratorError6;

                            case 69:
                                return _context3.finish(66);

                            case 70:
                                return _context3.finish(63);

                            case 71:
                            case 'end':
                                return _context3.stop();
                        }
                    }
                }, _callee3, this, [[11, 15, 19, 27], [20,, 22, 26], [34, 59, 63, 71], [64,, 66, 70]]);
            }));
            return function retrieveAccountsByAccess(_x4, _x5) {
                return ref.apply(this, arguments);
            };
        })()
    }, {
        key: 'retrieveOperationsByAccess',
        value: (function () {
            var ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee4(access) {
                var body, operationsWeboob, operations, now, _iteratorNormalCompletion7, _didIteratorError7, _iteratorError7, _iterator7, _step7, operationWeboob, relatedAccount, operation, weboobType, operationType, _iteratorNormalCompletion8, _didIteratorError8, _iteratorError8, _iterator8, _step8, similarOperations, newOperation;

                return _regenerator2.default.wrap(function _callee4$(_context4) {
                    while (1) {
                        switch (_context4.prev = _context4.next) {
                            case 0:
                                if (access.hasPassword()) {
                                    _context4.next = 3;
                                    break;
                                }

                                log.warn("Skipping operations fetching -- password isn't present");
                                throw {
                                    status: 500,
                                    code: (0, _errors2.default)('NO_PASSWORD'),
                                    message: "Access' password is not set"
                                };

                            case 3:
                                _context4.next = 5;
                                return BANK_HANDLERS[access.bank].fetchOperations(access);

                            case 5:
                                body = _context4.sent;
                                operationsWeboob = body['' + access.bank];
                                operations = [];
                                now = (0, _moment2.default)();

                                // Normalize weboob information
                                // TODO could be done in the weboob source directly

                                _iteratorNormalCompletion7 = true;
                                _didIteratorError7 = false;
                                _iteratorError7 = undefined;
                                _context4.prev = 12;
                                for (_iterator7 = (0, _getIterator3.default)(operationsWeboob); !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
                                    operationWeboob = _step7.value;
                                    relatedAccount = operationWeboob.account;
                                    operation = {
                                        title: operationWeboob.label,
                                        amount: operationWeboob.amount,
                                        date: operationWeboob.rdate,
                                        dateImport: now.format('YYYY-MM-DDTHH:mm:ss.000Z'),
                                        raw: operationWeboob.raw,
                                        bankAccount: relatedAccount
                                    };
                                    weboobType = operationWeboob.type;
                                    operationType = _operationtype2.default.getOperationTypeID(weboobType);

                                    if (operationType !== null) operation.operationTypeID = operationType;
                                    operations.push(operation);
                                }

                                // Create real new operations
                                _context4.next = 20;
                                break;

                            case 16:
                                _context4.prev = 16;
                                _context4.t0 = _context4['catch'](12);
                                _didIteratorError7 = true;
                                _iteratorError7 = _context4.t0;

                            case 20:
                                _context4.prev = 20;
                                _context4.prev = 21;

                                if (!_iteratorNormalCompletion7 && _iterator7.return) {
                                    _iterator7.return();
                                }

                            case 23:
                                _context4.prev = 23;

                                if (!_didIteratorError7) {
                                    _context4.next = 26;
                                    break;
                                }

                                throw _iteratorError7;

                            case 26:
                                return _context4.finish(23);

                            case 27:
                                return _context4.finish(20);

                            case 28:
                                _iteratorNormalCompletion8 = true;
                                _didIteratorError8 = false;
                                _iteratorError8 = undefined;
                                _context4.prev = 31;
                                _iterator8 = (0, _getIterator3.default)(operations);

                            case 33:
                                if (_iteratorNormalCompletion8 = (_step8 = _iterator8.next()).done) {
                                    _context4.next = 48;
                                    break;
                                }

                                operation = _step8.value;
                                _context4.next = 37;
                                return _operation2.default.allLike(operation);

                            case 37:
                                similarOperations = _context4.sent;

                                if (!(similarOperations && similarOperations.length)) {
                                    _context4.next = 40;
                                    break;
                                }

                                return _context4.abrupt('continue', 45);

                            case 40:

                                log.info('New operation found!');
                                _context4.next = 43;
                                return _operation2.default.create(operation);

                            case 43:
                                newOperation = _context4.sent;

                                this.newOperations.push(newOperation);

                            case 45:
                                _iteratorNormalCompletion8 = true;
                                _context4.next = 33;
                                break;

                            case 48:
                                _context4.next = 54;
                                break;

                            case 50:
                                _context4.prev = 50;
                                _context4.t1 = _context4['catch'](31);
                                _didIteratorError8 = true;
                                _iteratorError8 = _context4.t1;

                            case 54:
                                _context4.prev = 54;
                                _context4.prev = 55;

                                if (!_iteratorNormalCompletion8 && _iterator8.return) {
                                    _iterator8.return();
                                }

                            case 57:
                                _context4.prev = 57;

                                if (!_didIteratorError8) {
                                    _context4.next = 60;
                                    break;
                                }

                                throw _iteratorError8;

                            case 60:
                                return _context4.finish(57);

                            case 61:
                                return _context4.finish(54);

                            case 62:
                                _context4.next = 64;
                                return this.afterOperationsRetrieved(access);

                            case 64:
                            case 'end':
                                return _context4.stop();
                        }
                    }
                }, _callee4, this, [[12, 16, 20, 28], [21,, 23, 27], [31, 50, 54, 62], [55,, 57, 61]]);
            }));
            return function retrieveOperationsByAccess(_x6) {
                return ref.apply(this, arguments);
            };
        })()
    }, {
        key: 'afterOperationsRetrieved',
        value: (function () {
            var ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee5(access) {
                var _this = this;

                var reducer, _iteratorNormalCompletion9, _didIteratorError9, _iteratorError9, _loop, _iterator9, _step9, _ret, allAccounts, _iteratorNormalCompletion10, _didIteratorError10, _iteratorError10, _iterator10, _step10, _account, operationsCount;

                return _regenerator2.default.wrap(function _callee5$(_context6) {
                    while (1) {
                        switch (_context6.prev = _context6.next) {
                            case 0:
                                if (this.newAccounts && this.newAccounts.length) {
                                    log.info('Updating initial amount of newly imported accounts...');
                                }

                                reducer = function reducer(sum, op) {
                                    return sum + op.amount;
                                };

                                _iteratorNormalCompletion9 = true;
                                _didIteratorError9 = false;
                                _iteratorError9 = undefined;
                                _context6.prev = 5;
                                _loop = _regenerator2.default.mark(function _loop() {
                                    var account, relatedOperations, offset;
                                    return _regenerator2.default.wrap(function _loop$(_context5) {
                                        while (1) {
                                            switch (_context5.prev = _context5.next) {
                                                case 0:
                                                    account = _step9.value;
                                                    relatedOperations = _this.newOperations.slice();

                                                    relatedOperations = relatedOperations.filter(function (op) {
                                                        return op.bankAccount === account.accountNumber;
                                                    });

                                                    if (relatedOperations.length) {
                                                        _context5.next = 5;
                                                        break;
                                                    }

                                                    return _context5.abrupt('return', 'continue');

                                                case 5:
                                                    offset = relatedOperations.reduce(reducer, 0);

                                                    account.initialAmount -= offset;
                                                    _context5.next = 9;
                                                    return account.save();

                                                case 9:
                                                case 'end':
                                                    return _context5.stop();
                                            }
                                        }
                                    }, _loop, _this);
                                });
                                _iterator9 = (0, _getIterator3.default)(this.newAccounts);

                            case 8:
                                if (_iteratorNormalCompletion9 = (_step9 = _iterator9.next()).done) {
                                    _context6.next = 16;
                                    break;
                                }

                                return _context6.delegateYield(_loop(), 't0', 10);

                            case 10:
                                _ret = _context6.t0;

                                if (!(_ret === 'continue')) {
                                    _context6.next = 13;
                                    break;
                                }

                                return _context6.abrupt('continue', 13);

                            case 13:
                                _iteratorNormalCompletion9 = true;
                                _context6.next = 8;
                                break;

                            case 16:
                                _context6.next = 22;
                                break;

                            case 18:
                                _context6.prev = 18;
                                _context6.t1 = _context6['catch'](5);
                                _didIteratorError9 = true;
                                _iteratorError9 = _context6.t1;

                            case 22:
                                _context6.prev = 22;
                                _context6.prev = 23;

                                if (!_iteratorNormalCompletion9 && _iterator9.return) {
                                    _iterator9.return();
                                }

                            case 25:
                                _context6.prev = 25;

                                if (!_didIteratorError9) {
                                    _context6.next = 28;
                                    break;
                                }

                                throw _iteratorError9;

                            case 28:
                                return _context6.finish(25);

                            case 29:
                                return _context6.finish(22);

                            case 30:

                                log.info("Updating 'last checked' for linked accounts...");
                                _context6.next = 33;
                                return _account3.default.byAccess(access);

                            case 33:
                                allAccounts = _context6.sent;
                                _iteratorNormalCompletion10 = true;
                                _didIteratorError10 = false;
                                _iteratorError10 = undefined;
                                _context6.prev = 37;
                                _iterator10 = (0, _getIterator3.default)(allAccounts);

                            case 39:
                                if (_iteratorNormalCompletion10 = (_step10 = _iterator10.next()).done) {
                                    _context6.next = 46;
                                    break;
                                }

                                _account = _step10.value;
                                _context6.next = 43;
                                return _account.updateAttributes({ lastChecked: new Date() });

                            case 43:
                                _iteratorNormalCompletion10 = true;
                                _context6.next = 39;
                                break;

                            case 46:
                                _context6.next = 52;
                                break;

                            case 48:
                                _context6.prev = 48;
                                _context6.t2 = _context6['catch'](37);
                                _didIteratorError10 = true;
                                _iteratorError10 = _context6.t2;

                            case 52:
                                _context6.prev = 52;
                                _context6.prev = 53;

                                if (!_iteratorNormalCompletion10 && _iterator10.return) {
                                    _iterator10.return();
                                }

                            case 55:
                                _context6.prev = 55;

                                if (!_didIteratorError10) {
                                    _context6.next = 58;
                                    break;
                                }

                                throw _iteratorError10;

                            case 58:
                                return _context6.finish(55);

                            case 59:
                                return _context6.finish(52);

                            case 60:

                                log.info('Informing user new operations have been imported...');
                                operationsCount = this.newOperations.length;
                                // Don't show the notification after importing a new account.

                                if (operationsCount > 0 && this.newAccounts.length === 0) {
                                    _notifications2.default.send('Kresus: ' + operationsCount + ' new transaction(s) imported.');
                                }

                                log.info('Checking alerts for accounts balance...');

                                if (!this.newOperations.length) {
                                    _context6.next = 67;
                                    break;
                                }

                                _context6.next = 67;
                                return _alertManager2.default.checkAlertsForAccounts();

                            case 67:

                                log.info('Checking alerts for operations amount...');
                                _context6.next = 70;
                                return _alertManager2.default.checkAlertsForOperations(this.newOperations);

                            case 70:

                                log.info('Post process: done.');

                                // reset object
                                this.newAccounts = [];
                                this.newOperations = [];

                            case 73:
                            case 'end':
                                return _context6.stop();
                        }
                    }
                }, _callee5, this, [[5, 18, 22, 30], [23,, 25, 29], [37, 48, 52, 60], [53,, 55, 59]]);
            }));
            return function afterOperationsRetrieved(_x7) {
                return ref.apply(this, arguments);
            };
        })()
    }]);
    return AccountManager;
})();

exports.default = AccountManager;