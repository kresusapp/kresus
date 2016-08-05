'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _map = require('babel-runtime/core-js/map');

var _map2 = _interopRequireDefault(_map);

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

var mergeAccounts = function () {
    var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(old, kid) {
        var ops, _iteratorNormalCompletion3, _didIteratorError3, _iteratorError3, _iterator3, _step3, op, alerts, _iteratorNormalCompletion4, _didIteratorError4, _iteratorError4, _iterator4, _step4, alert, newAccount;

        return _regenerator2.default.wrap(function _callee$(_context) {
            while (1) {
                switch (_context.prev = _context.next) {
                    case 0:
                        if (!(old.accountNumber === kid.accountNumber && old.title === kid.title && old.iban === kid.iban && old.currency === kid.currency)) {
                            _context.next = 2;
                            break;
                        }

                        throw new _helpers.KError('trying to merge the same accounts');

                    case 2:

                        log.info('Merging (' + old.accountNumber + ', ' + old.title + ') with\n             (' + kid.accountNumber + ', ' + kid.title + ').');

                        _context.next = 5;
                        return _operation3.default.byAccount(old);

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
                            iban: kid.iban,
                            currency: kid.currency
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
        return _ref.apply(this, arguments);
    };
}();

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

var _operation2 = require('../models/operation');

var _operation3 = _interopRequireDefault(_operation2);

var _alert = require('../models/alert');

var _alert2 = _interopRequireDefault(_alert);

var _account4 = require('../models/account');

var _account5 = _interopRequireDefault(_account4);

var _operationtype = require('../models/operationtype');

var _operationtype2 = _interopRequireDefault(_operationtype);

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
    if (typeof exportObject.SOURCE_NAME === 'undefined' || typeof exportObject.fetchAccounts === 'undefined' || typeof exportObject.fetchTransactions === 'undefined') {
        throw new _helpers.KError("Backend doesn't implement basic functionalty");
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

        if (!bank.backend || !(bank.backend in SOURCE_HANDLERS)) throw new _helpers.KError('Bank handler not described or not imported.');
        BANK_HANDLERS[bank.uuid] = SOURCE_HANDLERS[bank.backend];
    }
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

function handler(access) {
    return BANK_HANDLERS[access.bank];
}

// Sync function
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
            if (oldTitle === newTitle && a.accountNumber === target.accountNumber && a.iban === target.iban && a.currency === target.currency) {
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

function sumOpAmounts(acc, op) {
    return acc + +op.amount;
}

var AccountManager = function () {
    function AccountManager() {
        (0, _classCallCheck3.default)(this, AccountManager);

        this.newAccountsMap = new _map2.default();
    }

    (0, _createClass3.default)(AccountManager, [{
        key: 'retrieveAndAddAccountsByAccess',
        value: function () {
            var _ref2 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee2(access) {
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

            function retrieveAndAddAccountsByAccess(_x3) {
                return _ref2.apply(this, arguments);
            }

            return retrieveAndAddAccountsByAccess;
        }()
    }, {
        key: 'retrieveAccountsByAccess',
        value: function () {
            var _ref3 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee3(access, shouldAddNewAccounts) {
                var errcode, sourceAccounts, accounts, _iteratorNormalCompletion5, _didIteratorError5, _iteratorError5, _iterator5, _step5, accountWeboob, account, oldAccounts, _iteratorNormalCompletion6, _didIteratorError6, _iteratorError6, _iterator6, _step6, _account, matches, m, newAccountInfo, existingOperations, offset, newAccount;

                return _regenerator2.default.wrap(function _callee3$(_context3) {
                    while (1) {
                        switch (_context3.prev = _context3.next) {
                            case 0:
                                if (this.newAccountsMap.size) {
                                    log.warn('At the start of retrieveAccountsByAccess, newAccountsMap\nshould be empty.');
                                    this.newAccountsMap.clear();
                                }

                                if (access.hasPassword()) {
                                    _context3.next = 5;
                                    break;
                                }

                                log.warn("Skipping accounts fetching -- password isn't present");
                                errcode = (0, _helpers.getErrorCode)('NO_PASSWORD');
                                throw new _helpers.KError("Access' password is not set", 500, errcode);

                            case 5:
                                _context3.next = 7;
                                return handler(access).fetchAccounts(access);

                            case 7:
                                sourceAccounts = _context3.sent;
                                accounts = [];
                                _iteratorNormalCompletion5 = true;
                                _didIteratorError5 = false;
                                _iteratorError5 = undefined;
                                _context3.prev = 12;

                                for (_iterator5 = (0, _getIterator3.default)(sourceAccounts); !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
                                    accountWeboob = _step5.value;
                                    account = {
                                        accountNumber: accountWeboob.accountNumber,
                                        bank: access.bank,
                                        bankAccess: access.id,
                                        iban: accountWeboob.iban,
                                        title: accountWeboob.label,
                                        initialAmount: accountWeboob.balance,
                                        lastChecked: new Date(),
                                        importDate: new Date()
                                    };

                                    if (_helpers.currency.isKnown(accountWeboob.currency)) {
                                        account.currency = accountWeboob.currency;
                                    }
                                    accounts.push(account);
                                }

                                _context3.next = 20;
                                break;

                            case 16:
                                _context3.prev = 16;
                                _context3.t0 = _context3['catch'](12);
                                _didIteratorError5 = true;
                                _iteratorError5 = _context3.t0;

                            case 20:
                                _context3.prev = 20;
                                _context3.prev = 21;

                                if (!_iteratorNormalCompletion5 && _iterator5.return) {
                                    _iterator5.return();
                                }

                            case 23:
                                _context3.prev = 23;

                                if (!_didIteratorError5) {
                                    _context3.next = 26;
                                    break;
                                }

                                throw _iteratorError5;

                            case 26:
                                return _context3.finish(23);

                            case 27:
                                return _context3.finish(20);

                            case 28:
                                log.info('-> ' + accounts.length + ' bank account(s) found');
                                _context3.next = 31;
                                return _account5.default.byAccess(access);

                            case 31:
                                oldAccounts = _context3.sent;
                                _iteratorNormalCompletion6 = true;
                                _didIteratorError6 = false;
                                _iteratorError6 = undefined;
                                _context3.prev = 35;
                                _iterator6 = (0, _getIterator3.default)(accounts);

                            case 37:
                                if (_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done) {
                                    _context3.next = 66;
                                    break;
                                }

                                _account = _step6.value;
                                matches = tryMatchAccount(_account, oldAccounts);

                                if (!matches.found) {
                                    _context3.next = 43;
                                    break;
                                }

                                log.info('Account was already present.');
                                return _context3.abrupt('continue', 63);

                            case 43:
                                if (!matches.mergeCandidates) {
                                    _context3.next = 49;
                                    break;
                                }

                                m = matches.mergeCandidates;

                                log.info('Found candidates for merging!');
                                _context3.next = 48;
                                return mergeAccounts(m.old, m.new);

                            case 48:
                                return _context3.abrupt('continue', 63);

                            case 49:
                                if (!shouldAddNewAccounts) {
                                    _context3.next = 62;
                                    break;
                                }

                                log.info('New account found, saving it as per request.');

                                newAccountInfo = {
                                    account: null,
                                    balanceOffset: 0
                                };

                                // Consider all the operations that could have been inserted
                                // before the fix in #405.

                                _context3.next = 54;
                                return _operation3.default.byAccount(_account);

                            case 54:
                                existingOperations = _context3.sent;


                                if (existingOperations.length) {
                                    offset = existingOperations.reduce(sumOpAmounts, 0);

                                    newAccountInfo.balanceOffset += offset;
                                }

                                // Save the account in DB and in the new accounts map.
                                _context3.next = 58;
                                return _account5.default.create(_account);

                            case 58:
                                newAccount = _context3.sent;

                                newAccountInfo.account = newAccount;

                                this.newAccountsMap.set(newAccount.accountNumber, newAccountInfo);
                                return _context3.abrupt('continue', 63);

                            case 62:

                                log.info('Unknown account found, not saving as per request.');

                            case 63:
                                _iteratorNormalCompletion6 = true;
                                _context3.next = 37;
                                break;

                            case 66:
                                _context3.next = 72;
                                break;

                            case 68:
                                _context3.prev = 68;
                                _context3.t1 = _context3['catch'](35);
                                _didIteratorError6 = true;
                                _iteratorError6 = _context3.t1;

                            case 72:
                                _context3.prev = 72;
                                _context3.prev = 73;

                                if (!_iteratorNormalCompletion6 && _iterator6.return) {
                                    _iterator6.return();
                                }

                            case 75:
                                _context3.prev = 75;

                                if (!_didIteratorError6) {
                                    _context3.next = 78;
                                    break;
                                }

                                throw _iteratorError6;

                            case 78:
                                return _context3.finish(75);

                            case 79:
                                return _context3.finish(72);

                            case 80:
                            case 'end':
                                return _context3.stop();
                        }
                    }
                }, _callee3, this, [[12, 16, 20, 28], [21,, 23, 27], [35, 68, 72, 80], [73,, 75, 79]]);
            }));

            function retrieveAccountsByAccess(_x4, _x5) {
                return _ref3.apply(this, arguments);
            }

            return retrieveAccountsByAccess;
        }()
    }, {
        key: 'retrieveOperationsByAccess',
        value: function () {
            var _ref4 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee4(access) {
                var errcode, sourceOps, operations, now, allAccounts, accountMap, _iteratorNormalCompletion7, _didIteratorError7, _iteratorError7, _iterator7, _step7, account, oldEntry, _iteratorNormalCompletion8, _didIteratorError8, _iteratorError8, _iterator8, _step8, sourceOp, operation, operationType, newOperations, _iteratorNormalCompletion9, _didIteratorError9, _iteratorError9, _iterator9, _step9, _operation, similarOperations, accountInfo, opDate, numNewOperations, _iteratorNormalCompletion10, _didIteratorError10, _iteratorError10, _iterator10, _step10, operationToCreate, _iteratorNormalCompletion11, _didIteratorError11, _iteratorError11, _iterator11, _step11, _step11$value, _account2, balanceOffset, _iteratorNormalCompletion12, _didIteratorError12, _iteratorError12, _iterator12, _step12, _account3, count;

                return _regenerator2.default.wrap(function _callee4$(_context4) {
                    while (1) {
                        switch (_context4.prev = _context4.next) {
                            case 0:
                                if (access.hasPassword()) {
                                    _context4.next = 4;
                                    break;
                                }

                                log.warn("Skipping operations fetching -- password isn't present");
                                errcode = (0, _helpers.getErrorCode)('NO_PASSWORD');
                                throw new _helpers.KError("Access' password is not set", 500, errcode);

                            case 4:
                                _context4.next = 6;
                                return handler(access).fetchTransactions(access);

                            case 6:
                                sourceOps = _context4.sent;
                                operations = [];
                                now = (0, _moment2.default)().format('YYYY-MM-DDTHH:mm:ss.000Z');
                                _context4.next = 11;
                                return _account5.default.byAccess(access);

                            case 11:
                                allAccounts = _context4.sent;
                                accountMap = new _map2.default();
                                _iteratorNormalCompletion7 = true;
                                _didIteratorError7 = false;
                                _iteratorError7 = undefined;
                                _context4.prev = 16;
                                _iterator7 = (0, _getIterator3.default)(allAccounts);

                            case 18:
                                if (_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done) {
                                    _context4.next = 28;
                                    break;
                                }

                                account = _step7.value;

                                if (!this.newAccountsMap.has(account.accountNumber)) {
                                    _context4.next = 24;
                                    break;
                                }

                                oldEntry = this.newAccountsMap.get(account.accountNumber);

                                accountMap.set(account.accountNumber, oldEntry);
                                return _context4.abrupt('continue', 25);

                            case 24:

                                accountMap.set(account.accountNumber, {
                                    account: account,
                                    balanceOffset: 0
                                });

                            case 25:
                                _iteratorNormalCompletion7 = true;
                                _context4.next = 18;
                                break;

                            case 28:
                                _context4.next = 34;
                                break;

                            case 30:
                                _context4.prev = 30;
                                _context4.t0 = _context4['catch'](16);
                                _didIteratorError7 = true;
                                _iteratorError7 = _context4.t0;

                            case 34:
                                _context4.prev = 34;
                                _context4.prev = 35;

                                if (!_iteratorNormalCompletion7 && _iterator7.return) {
                                    _iterator7.return();
                                }

                            case 37:
                                _context4.prev = 37;

                                if (!_didIteratorError7) {
                                    _context4.next = 40;
                                    break;
                                }

                                throw _iteratorError7;

                            case 40:
                                return _context4.finish(37);

                            case 41:
                                return _context4.finish(34);

                            case 42:

                                // Eagerly clear state.
                                this.newAccountsMap.clear();

                                // Normalize source information
                                _iteratorNormalCompletion8 = true;
                                _didIteratorError8 = false;
                                _iteratorError8 = undefined;
                                _context4.prev = 46;
                                for (_iterator8 = (0, _getIterator3.default)(sourceOps); !(_iteratorNormalCompletion8 = (_step8 = _iterator8.next()).done); _iteratorNormalCompletion8 = true) {
                                    sourceOp = _step8.value;
                                    operation = {
                                        bankAccount: sourceOp.account,
                                        amount: sourceOp.amount,
                                        raw: sourceOp.raw,
                                        date: sourceOp.date,
                                        title: sourceOp.title,
                                        binary: sourceOp.binary
                                    };


                                    operation.title = operation.title || operation.raw || '';
                                    operation.date = operation.date || now;
                                    operation.dateImport = now;

                                    operationType = _operationtype2.default.getOperationTypeID(sourceOp.type);

                                    if (operationType !== null) operation.operationTypeID = operationType;

                                    operations.push(operation);
                                }

                                _context4.next = 54;
                                break;

                            case 50:
                                _context4.prev = 50;
                                _context4.t1 = _context4['catch'](46);
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
                                newOperations = [];
                                _iteratorNormalCompletion9 = true;
                                _didIteratorError9 = false;
                                _iteratorError9 = undefined;
                                _context4.prev = 66;
                                _iterator9 = (0, _getIterator3.default)(operations);

                            case 68:
                                if (_iteratorNormalCompletion9 = (_step9 = _iterator9.next()).done) {
                                    _context4.next = 84;
                                    break;
                                }

                                _operation = _step9.value;

                                if (accountMap.has(_operation.bankAccount)) {
                                    _context4.next = 72;
                                    break;
                                }

                                return _context4.abrupt('continue', 81);

                            case 72:
                                _context4.next = 74;
                                return _operation3.default.allLike(_operation);

                            case 74:
                                similarOperations = _context4.sent;

                                if (!(similarOperations && similarOperations.length)) {
                                    _context4.next = 77;
                                    break;
                                }

                                return _context4.abrupt('continue', 81);

                            case 77:

                                // It is definitely a new operation.
                                newOperations.push(_operation);

                                // Remember amounts of transactions older than the import, to
                                // resync balance.
                                accountInfo = accountMap.get(_operation.bankAccount);
                                opDate = new Date(_operation.date);

                                if (+opDate <= +accountInfo.account.importDate) {
                                    accountInfo.balanceOffset += +_operation.amount;
                                }

                            case 81:
                                _iteratorNormalCompletion9 = true;
                                _context4.next = 68;
                                break;

                            case 84:
                                _context4.next = 90;
                                break;

                            case 86:
                                _context4.prev = 86;
                                _context4.t2 = _context4['catch'](66);
                                _didIteratorError9 = true;
                                _iteratorError9 = _context4.t2;

                            case 90:
                                _context4.prev = 90;
                                _context4.prev = 91;

                                if (!_iteratorNormalCompletion9 && _iterator9.return) {
                                    _iterator9.return();
                                }

                            case 93:
                                _context4.prev = 93;

                                if (!_didIteratorError9) {
                                    _context4.next = 96;
                                    break;
                                }

                                throw _iteratorError9;

                            case 96:
                                return _context4.finish(93);

                            case 97:
                                return _context4.finish(90);

                            case 98:

                                // Create the new operations
                                numNewOperations = newOperations.length;

                                if (numNewOperations) {
                                    log.info(newOperations.length + ' new operations found!');
                                }

                                _iteratorNormalCompletion10 = true;
                                _didIteratorError10 = false;
                                _iteratorError10 = undefined;
                                _context4.prev = 103;
                                _iterator10 = (0, _getIterator3.default)(newOperations);

                            case 105:
                                if (_iteratorNormalCompletion10 = (_step10 = _iterator10.next()).done) {
                                    _context4.next = 112;
                                    break;
                                }

                                operationToCreate = _step10.value;
                                _context4.next = 109;
                                return _operation3.default.create(operationToCreate);

                            case 109:
                                _iteratorNormalCompletion10 = true;
                                _context4.next = 105;
                                break;

                            case 112:
                                _context4.next = 118;
                                break;

                            case 114:
                                _context4.prev = 114;
                                _context4.t3 = _context4['catch'](103);
                                _didIteratorError10 = true;
                                _iteratorError10 = _context4.t3;

                            case 118:
                                _context4.prev = 118;
                                _context4.prev = 119;

                                if (!_iteratorNormalCompletion10 && _iterator10.return) {
                                    _iterator10.return();
                                }

                            case 121:
                                _context4.prev = 121;

                                if (!_didIteratorError10) {
                                    _context4.next = 124;
                                    break;
                                }

                                throw _iteratorError10;

                            case 124:
                                return _context4.finish(121);

                            case 125:
                                return _context4.finish(118);

                            case 126:

                                // Update account balances.
                                _iteratorNormalCompletion11 = true;
                                _didIteratorError11 = false;
                                _iteratorError11 = undefined;
                                _context4.prev = 129;
                                _iterator11 = (0, _getIterator3.default)(accountMap.values());

                            case 131:
                                if (_iteratorNormalCompletion11 = (_step11 = _iterator11.next()).done) {
                                    _context4.next = 143;
                                    break;
                                }

                                _step11$value = _step11.value;
                                _account2 = _step11$value.account;
                                balanceOffset = _step11$value.balanceOffset;

                                if (!balanceOffset) {
                                    _context4.next = 140;
                                    break;
                                }

                                log.info('Account ' + _account2.title + ' initial balance is going to be resynced, by an\noffset of ' + balanceOffset + '.');
                                _account2.initialAmount -= balanceOffset;
                                _context4.next = 140;
                                return _account2.save();

                            case 140:
                                _iteratorNormalCompletion11 = true;
                                _context4.next = 131;
                                break;

                            case 143:
                                _context4.next = 149;
                                break;

                            case 145:
                                _context4.prev = 145;
                                _context4.t4 = _context4['catch'](129);
                                _didIteratorError11 = true;
                                _iteratorError11 = _context4.t4;

                            case 149:
                                _context4.prev = 149;
                                _context4.prev = 150;

                                if (!_iteratorNormalCompletion11 && _iterator11.return) {
                                    _iterator11.return();
                                }

                            case 152:
                                _context4.prev = 152;

                                if (!_didIteratorError11) {
                                    _context4.next = 155;
                                    break;
                                }

                                throw _iteratorError11;

                            case 155:
                                return _context4.finish(152);

                            case 156:
                                return _context4.finish(149);

                            case 157:

                                // Carry over all the triggers on new operations.
                                log.info("Updating 'last checked' for linked accounts...");
                                _iteratorNormalCompletion12 = true;
                                _didIteratorError12 = false;
                                _iteratorError12 = undefined;
                                _context4.prev = 161;
                                _iterator12 = (0, _getIterator3.default)(allAccounts);

                            case 163:
                                if (_iteratorNormalCompletion12 = (_step12 = _iterator12.next()).done) {
                                    _context4.next = 170;
                                    break;
                                }

                                _account3 = _step12.value;
                                _context4.next = 167;
                                return _account3.updateAttributes({ lastChecked: new Date() });

                            case 167:
                                _iteratorNormalCompletion12 = true;
                                _context4.next = 163;
                                break;

                            case 170:
                                _context4.next = 176;
                                break;

                            case 172:
                                _context4.prev = 172;
                                _context4.t5 = _context4['catch'](161);
                                _didIteratorError12 = true;
                                _iteratorError12 = _context4.t5;

                            case 176:
                                _context4.prev = 176;
                                _context4.prev = 177;

                                if (!_iteratorNormalCompletion12 && _iterator12.return) {
                                    _iterator12.return();
                                }

                            case 179:
                                _context4.prev = 179;

                                if (!_didIteratorError12) {
                                    _context4.next = 182;
                                    break;
                                }

                                throw _iteratorError12;

                            case 182:
                                return _context4.finish(179);

                            case 183:
                                return _context4.finish(176);

                            case 184:

                                log.info('Informing user new operations have been imported...');
                                if (numNewOperations > 0) {

                                    /* eslint-disable camelcase */
                                    count = { smart_count: numNewOperations };

                                    _notifications2.default.send((0, _helpers.translate)('server.notification.new_operation', count));

                                    /* eslint-enable camelcase */
                                }

                                log.info('Checking alerts for accounts balance...');

                                if (!numNewOperations) {
                                    _context4.next = 190;
                                    break;
                                }

                                _context4.next = 190;
                                return _alertManager2.default.checkAlertsForAccounts();

                            case 190:

                                log.info('Checking alerts for operations amount...');
                                _context4.next = 193;
                                return _alertManager2.default.checkAlertsForOperations(newOperations);

                            case 193:

                                access.fetchStatus = 'OK';
                                _context4.next = 196;
                                return access.save();

                            case 196:
                                log.info('Post process: done.');

                            case 197:
                            case 'end':
                                return _context4.stop();
                        }
                    }
                }, _callee4, this, [[16, 30, 34, 42], [35,, 37, 41], [46, 50, 54, 62], [55,, 57, 61], [66, 86, 90, 98], [91,, 93, 97], [103, 114, 118, 126], [119,, 121, 125], [129, 145, 149, 157], [150,, 152, 156], [161, 172, 176, 184], [177,, 179, 183]]);
            }));

            function retrieveOperationsByAccess(_x6) {
                return _ref4.apply(this, arguments);
            }

            return retrieveOperationsByAccess;
        }()
    }]);
    return AccountManager;
}();

exports.default = AccountManager;