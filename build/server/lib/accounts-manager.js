'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _slicedToArray2 = require('babel-runtime/helpers/slicedToArray');

var _slicedToArray3 = _interopRequireDefault(_slicedToArray2);

var _map = require('babel-runtime/core-js/map');

var _map2 = _interopRequireDefault(_map);

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _getIterator2 = require('babel-runtime/core-js/get-iterator');

var _getIterator3 = _interopRequireDefault(_getIterator2);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

// Effectively does a merge of two accounts that have been identified to be duplicates.
// - known is the former Account instance (known in Kresus's database).
// - provided is the new Account instance provided by the source backend.
var mergeAccounts = function () {
    var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(known, provided) {
        var ops, _iteratorNormalCompletion2, _didIteratorError2, _iteratorError2, _iterator2, _step2, op, alerts, _iteratorNormalCompletion3, _didIteratorError3, _iteratorError3, _iterator3, _step3, alert, newProps;

        return _regenerator2.default.wrap(function _callee$(_context) {
            while (1) {
                switch (_context.prev = _context.next) {
                    case 0:
                        if (!(known.accountNumber !== provided.accountNumber)) {
                            _context.next = 59;
                            break;
                        }

                        _context.next = 3;
                        return _operation3.default.byAccount(known);

                    case 3:
                        ops = _context.sent;
                        _iteratorNormalCompletion2 = true;
                        _didIteratorError2 = false;
                        _iteratorError2 = undefined;
                        _context.prev = 7;
                        _iterator2 = (0, _getIterator3.default)(ops);

                    case 9:
                        if (_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done) {
                            _context.next = 16;
                            break;
                        }

                        op = _step2.value;
                        _context.next = 13;
                        return op.updateAttributes({ bankAccount: provided.accountNumber });

                    case 13:
                        _iteratorNormalCompletion2 = true;
                        _context.next = 9;
                        break;

                    case 16:
                        _context.next = 22;
                        break;

                    case 18:
                        _context.prev = 18;
                        _context.t0 = _context['catch'](7);
                        _didIteratorError2 = true;
                        _iteratorError2 = _context.t0;

                    case 22:
                        _context.prev = 22;
                        _context.prev = 23;

                        if (!_iteratorNormalCompletion2 && _iterator2.return) {
                            _iterator2.return();
                        }

                    case 25:
                        _context.prev = 25;

                        if (!_didIteratorError2) {
                            _context.next = 28;
                            break;
                        }

                        throw _iteratorError2;

                    case 28:
                        return _context.finish(25);

                    case 29:
                        return _context.finish(22);

                    case 30:
                        _context.next = 32;
                        return _alert2.default.byAccount(known);

                    case 32:
                        alerts = _context.sent;
                        _iteratorNormalCompletion3 = true;
                        _didIteratorError3 = false;
                        _iteratorError3 = undefined;
                        _context.prev = 36;
                        _iterator3 = (0, _getIterator3.default)(alerts);

                    case 38:
                        if (_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done) {
                            _context.next = 45;
                            break;
                        }

                        alert = _step3.value;
                        _context.next = 42;
                        return alert.updateAttributes({ bankAccount: provided.accountNumber });

                    case 42:
                        _iteratorNormalCompletion3 = true;
                        _context.next = 38;
                        break;

                    case 45:
                        _context.next = 51;
                        break;

                    case 47:
                        _context.prev = 47;
                        _context.t1 = _context['catch'](36);
                        _didIteratorError3 = true;
                        _iteratorError3 = _context.t1;

                    case 51:
                        _context.prev = 51;
                        _context.prev = 52;

                        if (!_iteratorNormalCompletion3 && _iterator3.return) {
                            _iterator3.return();
                        }

                    case 54:
                        _context.prev = 54;

                        if (!_didIteratorError3) {
                            _context.next = 57;
                            break;
                        }

                        throw _iteratorError3;

                    case 57:
                        return _context.finish(54);

                    case 58:
                        return _context.finish(51);

                    case 59:
                        newProps = {
                            accountNumber: provided.accountNumber,
                            title: provided.title,
                            iban: provided.iban,
                            currency: provided.currency
                        };
                        _context.next = 62;
                        return known.updateAttributes(newProps);

                    case 62:
                    case 'end':
                        return _context.stop();
                }
            }
        }, _callee, this, [[7, 18, 22, 30], [23,, 25, 29], [36, 47, 51, 59], [52,, 54, 58]]);
    }));

    return function mergeAccounts(_x, _x2) {
        return _ref.apply(this, arguments);
    };
}();

// Returns a list of all the accounts returned by the backend, associated to
// the given bankAccess.


var retrieveAllAccountsByAccess = function () {
    var _ref2 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee2(access) {
        var errcode, sourceAccounts, accounts, _iteratorNormalCompletion4, _didIteratorError4, _iteratorError4, _iterator4, _step4, accountWeboob, account;

        return _regenerator2.default.wrap(function _callee2$(_context2) {
            while (1) {
                switch (_context2.prev = _context2.next) {
                    case 0:
                        if (access.hasPassword()) {
                            _context2.next = 4;
                            break;
                        }

                        log.warn("Skipping accounts fetching -- password isn't present");
                        errcode = (0, _helpers.getErrorCode)('NO_PASSWORD');
                        throw new _helpers.KError("Access' password is not set", 500, errcode);

                    case 4:
                        _context2.next = 6;
                        return handler(access).fetchAccounts(access);

                    case 6:
                        sourceAccounts = _context2.sent;
                        accounts = [];
                        _iteratorNormalCompletion4 = true;
                        _didIteratorError4 = false;
                        _iteratorError4 = undefined;
                        _context2.prev = 11;

                        for (_iterator4 = (0, _getIterator3.default)(sourceAccounts); !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
                            accountWeboob = _step4.value;
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

                        _context2.next = 19;
                        break;

                    case 15:
                        _context2.prev = 15;
                        _context2.t0 = _context2['catch'](11);
                        _didIteratorError4 = true;
                        _iteratorError4 = _context2.t0;

                    case 19:
                        _context2.prev = 19;
                        _context2.prev = 20;

                        if (!_iteratorNormalCompletion4 && _iterator4.return) {
                            _iterator4.return();
                        }

                    case 22:
                        _context2.prev = 22;

                        if (!_didIteratorError4) {
                            _context2.next = 25;
                            break;
                        }

                        throw _iteratorError4;

                    case 25:
                        return _context2.finish(22);

                    case 26:
                        return _context2.finish(19);

                    case 27:
                        log.info('-> ' + accounts.length + ' bank account(s) found');

                        return _context2.abrupt('return', accounts);

                    case 29:
                    case 'end':
                        return _context2.stop();
                }
            }
        }, _callee2, this, [[11, 15, 19, 27], [20,, 22, 26]]);
    }));

    return function retrieveAllAccountsByAccess(_x3) {
        return _ref2.apply(this, arguments);
    };
}();

// Sends notification for a given access, considering a list of newOperations
// and an accountMap (mapping accountId -> account).


var notifyNewOperations = function () {
    var _ref3 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee3(access, newOperations, accountMap) {
        var newOpsPerAccount, _iteratorNormalCompletion5, _didIteratorError5, _iteratorError5, _iterator5, _step5, newOp, opAccountId, bank, _iteratorNormalCompletion6, _didIteratorError6, _iteratorError6, _iterator6, _step6, _step6$value, accountId, ops, _accountMap$get, account, params, formatCurrency;

        return _regenerator2.default.wrap(function _callee3$(_context3) {
            while (1) {
                switch (_context3.prev = _context3.next) {
                    case 0:
                        newOpsPerAccount = new _map2.default();
                        _iteratorNormalCompletion5 = true;
                        _didIteratorError5 = false;
                        _iteratorError5 = undefined;
                        _context3.prev = 4;


                        for (_iterator5 = (0, _getIterator3.default)(newOperations); !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
                            newOp = _step5.value;
                            opAccountId = newOp.bankAccount;

                            if (!newOpsPerAccount.has(opAccountId)) {
                                newOpsPerAccount.set(opAccountId, [newOp]);
                            } else {
                                newOpsPerAccount.get(opAccountId).push(newOp);
                            }
                        }

                        _context3.next = 12;
                        break;

                    case 8:
                        _context3.prev = 8;
                        _context3.t0 = _context3['catch'](4);
                        _didIteratorError5 = true;
                        _iteratorError5 = _context3.t0;

                    case 12:
                        _context3.prev = 12;
                        _context3.prev = 13;

                        if (!_iteratorNormalCompletion5 && _iterator5.return) {
                            _iterator5.return();
                        }

                    case 15:
                        _context3.prev = 15;

                        if (!_didIteratorError5) {
                            _context3.next = 18;
                            break;
                        }

                        throw _iteratorError5;

                    case 18:
                        return _context3.finish(15);

                    case 19:
                        return _context3.finish(12);

                    case 20:
                        bank = _bank2.default.byUuid(access.bank);

                        (0, _helpers.assert)(bank, 'The bank must be known');

                        _iteratorNormalCompletion6 = true;
                        _didIteratorError6 = false;
                        _iteratorError6 = undefined;
                        _context3.prev = 25;
                        for (_iterator6 = (0, _getIterator3.default)(newOpsPerAccount.entries()); !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
                            _step6$value = (0, _slicedToArray3.default)(_step6.value, 2), accountId = _step6$value[0], ops = _step6$value[1];
                            _accountMap$get = accountMap.get(accountId), account = _accountMap$get.account;

                            /* eslint-disable camelcase */

                            params = {
                                account_title: bank.name + ' - ' + account.title,
                                smart_count: ops.length
                            };


                            if (ops.length === 1) {
                                // Send a notification with the operation content
                                formatCurrency = _helpers.currency.makeFormat(account.currency);

                                params.operation_details = ops[0].title + ' ' + formatCurrency(ops[0].amount);
                            }

                            _notifications2.default.send((0, _helpers.translate)('server.notification.new_operation', params));
                            /* eslint-enable camelcase */
                        }
                        _context3.next = 33;
                        break;

                    case 29:
                        _context3.prev = 29;
                        _context3.t1 = _context3['catch'](25);
                        _didIteratorError6 = true;
                        _iteratorError6 = _context3.t1;

                    case 33:
                        _context3.prev = 33;
                        _context3.prev = 34;

                        if (!_iteratorNormalCompletion6 && _iterator6.return) {
                            _iterator6.return();
                        }

                    case 36:
                        _context3.prev = 36;

                        if (!_didIteratorError6) {
                            _context3.next = 39;
                            break;
                        }

                        throw _iteratorError6;

                    case 39:
                        return _context3.finish(36);

                    case 40:
                        return _context3.finish(33);

                    case 41:
                    case 'end':
                        return _context3.stop();
                }
            }
        }, _callee3, this, [[4, 8, 12, 20], [13,, 15, 19], [25, 29, 33, 41], [34,, 36, 40]]);
    }));

    return function notifyNewOperations(_x4, _x5, _x6) {
        return _ref3.apply(this, arguments);
    };
}();

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

var _access = require('../models/access');

var _access2 = _interopRequireDefault(_access);

var _account4 = require('../models/account');

var _account5 = _interopRequireDefault(_account4);

var _alert = require('../models/alert');

var _alert2 = _interopRequireDefault(_alert);

var _bank = require('../models/bank');

var _bank2 = _interopRequireDefault(_bank);

var _config = require('../models/config');

var _config2 = _interopRequireDefault(_config);

var _operation2 = require('../models/operation');

var _operation3 = _interopRequireDefault(_operation2);

var _operationtype = require('../models/operationtype');

var _operationtype2 = _interopRequireDefault(_operationtype);

var _helpers = require('../helpers');

var _asyncQueue = require('./async-queue');

var _asyncQueue2 = _interopRequireDefault(_asyncQueue);

var _alertManager = require('./alert-manager');

var _alertManager2 = _interopRequireDefault(_alertManager);

var _notifications = require('./notifications');

var _notifications2 = _interopRequireDefault(_notifications);

var _diffAccounts = require('./diff-accounts');

var _diffAccounts2 = _interopRequireDefault(_diffAccounts);

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
var AccountManager = function () {
    function AccountManager() {
        (0, _classCallCheck3.default)(this, AccountManager);

        this.newAccountsMap = new _map2.default();
        this.q = new _asyncQueue2.default();

        this.retrieveNewAccountsByAccess = this.q.wrap(this.retrieveNewAccountsByAccess.bind(this));
        this.retrieveOperationsByAccess = this.q.wrap(this.retrieveOperationsByAccess.bind(this));
        this.resyncAccountBalance = this.q.wrap(this.resyncAccountBalance.bind(this));
    }

    (0, _createClass3.default)(AccountManager, [{
        key: 'retrieveNewAccountsByAccess',
        value: function () {
            var _ref4 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee4(access, shouldAddNewAccounts) {
                var accounts, oldAccounts, diff, _iteratorNormalCompletion7, _didIteratorError7, _iteratorError7, _iterator7, _step7, _step7$value, known, _iteratorNormalCompletion8, _didIteratorError8, _iteratorError8, _iterator8, _step8, account, newAccountInfo, existingOperations, offset, newAccount, _iteratorNormalCompletion9, _didIteratorError9, _iteratorError9, _iterator9, _step9, _account, shouldMergeAccounts, _iteratorNormalCompletion10, _didIteratorError10, _iteratorError10, _iterator10, _step10, _step10$value, provided;

                return _regenerator2.default.wrap(function _callee4$(_context4) {
                    while (1) {
                        switch (_context4.prev = _context4.next) {
                            case 0:
                                if (this.newAccountsMap.size) {
                                    log.warn('At the top of retrieveNewAccountsByAccess, newAccountsMap must be empty.');
                                    this.newAccountsMap.clear();
                                }

                                _context4.next = 3;
                                return retrieveAllAccountsByAccess(access);

                            case 3:
                                accounts = _context4.sent;
                                _context4.next = 6;
                                return _account5.default.byAccess(access);

                            case 6:
                                oldAccounts = _context4.sent;
                                diff = (0, _diffAccounts2.default)(oldAccounts, accounts);
                                _iteratorNormalCompletion7 = true;
                                _didIteratorError7 = false;
                                _iteratorError7 = undefined;
                                _context4.prev = 11;


                                for (_iterator7 = (0, _getIterator3.default)(diff.perfectMatches); !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
                                    _step7$value = (0, _slicedToArray3.default)(_step7.value, 1), known = _step7$value[0];

                                    log.info('Account ' + known.id + ' already known and in Kresus\'s database');
                                }

                                _context4.next = 19;
                                break;

                            case 15:
                                _context4.prev = 15;
                                _context4.t0 = _context4['catch'](11);
                                _didIteratorError7 = true;
                                _iteratorError7 = _context4.t0;

                            case 19:
                                _context4.prev = 19;
                                _context4.prev = 20;

                                if (!_iteratorNormalCompletion7 && _iterator7.return) {
                                    _iterator7.return();
                                }

                            case 22:
                                _context4.prev = 22;

                                if (!_didIteratorError7) {
                                    _context4.next = 25;
                                    break;
                                }

                                throw _iteratorError7;

                            case 25:
                                return _context4.finish(22);

                            case 26:
                                return _context4.finish(19);

                            case 27:
                                _iteratorNormalCompletion8 = true;
                                _didIteratorError8 = false;
                                _iteratorError8 = undefined;
                                _context4.prev = 30;
                                _iterator8 = (0, _getIterator3.default)(diff.providerOrphans);

                            case 32:
                                if (_iteratorNormalCompletion8 = (_step8 = _iterator8.next()).done) {
                                    _context4.next = 52;
                                    break;
                                }

                                account = _step8.value;

                                log.info('New account found: ', account.title);

                                if (shouldAddNewAccounts) {
                                    _context4.next = 38;
                                    break;
                                }

                                log.info('=> Not saving it, as per request');
                                return _context4.abrupt('continue', 49);

                            case 38:

                                log.info('=> Saving it as per request.');

                                newAccountInfo = {
                                    account: null,
                                    balanceOffset: 0
                                };

                                // Consider all the operations that could have been inserted before the fix in #405.

                                _context4.next = 42;
                                return _operation3.default.byAccount(account);

                            case 42:
                                existingOperations = _context4.sent;

                                if (existingOperations.length) {
                                    offset = existingOperations.reduce(function (acc, op) {
                                        return acc + +op.amount;
                                    }, 0);

                                    newAccountInfo.balanceOffset += offset;
                                }

                                // Save the account in DB and in the new accounts map.
                                _context4.next = 46;
                                return _account5.default.create(account);

                            case 46:
                                newAccount = _context4.sent;

                                newAccountInfo.account = newAccount;

                                this.newAccountsMap.set(newAccount.accountNumber, newAccountInfo);

                            case 49:
                                _iteratorNormalCompletion8 = true;
                                _context4.next = 32;
                                break;

                            case 52:
                                _context4.next = 58;
                                break;

                            case 54:
                                _context4.prev = 54;
                                _context4.t1 = _context4['catch'](30);
                                _didIteratorError8 = true;
                                _iteratorError8 = _context4.t1;

                            case 58:
                                _context4.prev = 58;
                                _context4.prev = 59;

                                if (!_iteratorNormalCompletion8 && _iterator8.return) {
                                    _iterator8.return();
                                }

                            case 61:
                                _context4.prev = 61;

                                if (!_didIteratorError8) {
                                    _context4.next = 64;
                                    break;
                                }

                                throw _iteratorError8;

                            case 64:
                                return _context4.finish(61);

                            case 65:
                                return _context4.finish(58);

                            case 66:
                                _iteratorNormalCompletion9 = true;
                                _didIteratorError9 = false;
                                _iteratorError9 = undefined;
                                _context4.prev = 69;


                                for (_iterator9 = (0, _getIterator3.default)(diff.knownOrphans); !(_iteratorNormalCompletion9 = (_step9 = _iterator9.next()).done); _iteratorNormalCompletion9 = true) {
                                    _account = _step9.value;

                                    log.info("Orphan account found in Kresus's database: ", _account.id);
                                    // TODO do something with orphan accounts!
                                }

                                _context4.next = 77;
                                break;

                            case 73:
                                _context4.prev = 73;
                                _context4.t2 = _context4['catch'](69);
                                _didIteratorError9 = true;
                                _iteratorError9 = _context4.t2;

                            case 77:
                                _context4.prev = 77;
                                _context4.prev = 78;

                                if (!_iteratorNormalCompletion9 && _iterator9.return) {
                                    _iterator9.return();
                                }

                            case 80:
                                _context4.prev = 80;

                                if (!_didIteratorError9) {
                                    _context4.next = 83;
                                    break;
                                }

                                throw _iteratorError9;

                            case 83:
                                return _context4.finish(80);

                            case 84:
                                return _context4.finish(77);

                            case 85:
                                _context4.next = 87;
                                return _config2.default.findOrCreateDefaultBooleanValue('weboob-auto-merge-accounts');

                            case 87:
                                shouldMergeAccounts = _context4.sent;

                                if (!shouldMergeAccounts) {
                                    _context4.next = 118;
                                    break;
                                }

                                _iteratorNormalCompletion10 = true;
                                _didIteratorError10 = false;
                                _iteratorError10 = undefined;
                                _context4.prev = 92;
                                _iterator10 = (0, _getIterator3.default)(diff.duplicateCandidates);

                            case 94:
                                if (_iteratorNormalCompletion10 = (_step10 = _iterator10.next()).done) {
                                    _context4.next = 102;
                                    break;
                                }

                                _step10$value = (0, _slicedToArray3.default)(_step10.value, 2), known = _step10$value[0], provided = _step10$value[1];

                                log.info('Found candidates for accounts merging:\n- ' + known.accountNumber + ' / ' + known.title + '\n- ' + provided.accountNumber + ' / ' + provided.title);
                                _context4.next = 99;
                                return mergeAccounts(known, provided);

                            case 99:
                                _iteratorNormalCompletion10 = true;
                                _context4.next = 94;
                                break;

                            case 102:
                                _context4.next = 108;
                                break;

                            case 104:
                                _context4.prev = 104;
                                _context4.t3 = _context4['catch'](92);
                                _didIteratorError10 = true;
                                _iteratorError10 = _context4.t3;

                            case 108:
                                _context4.prev = 108;
                                _context4.prev = 109;

                                if (!_iteratorNormalCompletion10 && _iterator10.return) {
                                    _iterator10.return();
                                }

                            case 111:
                                _context4.prev = 111;

                                if (!_didIteratorError10) {
                                    _context4.next = 114;
                                    break;
                                }

                                throw _iteratorError10;

                            case 114:
                                return _context4.finish(111);

                            case 115:
                                return _context4.finish(108);

                            case 116:
                                _context4.next = 119;
                                break;

                            case 118:
                                log.info('Found ' + diff.duplicateCandidates.length + ' candidates for merging, but not\nmerging as per request');

                            case 119:
                            case 'end':
                                return _context4.stop();
                        }
                    }
                }, _callee4, this, [[11, 15, 19, 27], [20,, 22, 26], [30, 54, 58, 66], [59,, 61, 65], [69, 73, 77, 85], [78,, 80, 84], [92, 104, 108, 116], [109,, 111, 115]]);
            }));

            function retrieveNewAccountsByAccess(_x7, _x8) {
                return _ref4.apply(this, arguments);
            }

            return retrieveNewAccountsByAccess;
        }()

        // Not wrapped in the sequential queue: this would introduce a deadlock
        // since retrieveNewAccountsByAccess is wrapped!

    }, {
        key: 'retrieveAndAddAccountsByAccess',
        value: function () {
            var _ref5 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee5(access) {
                return _regenerator2.default.wrap(function _callee5$(_context5) {
                    while (1) {
                        switch (_context5.prev = _context5.next) {
                            case 0:
                                _context5.next = 2;
                                return this.retrieveNewAccountsByAccess(access, true);

                            case 2:
                                return _context5.abrupt('return', _context5.sent);

                            case 3:
                            case 'end':
                                return _context5.stop();
                        }
                    }
                }, _callee5, this);
            }));

            function retrieveAndAddAccountsByAccess(_x9) {
                return _ref5.apply(this, arguments);
            }

            return retrieveAndAddAccountsByAccess;
        }()
    }, {
        key: 'retrieveOperationsByAccess',
        value: function () {
            var _ref6 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee6(access) {
                var errcode, sourceOps, operations, now, allAccounts, accountMap, _iteratorNormalCompletion11, _didIteratorError11, _iteratorError11, _iterator11, _step11, account, oldEntry, _iteratorNormalCompletion12, _didIteratorError12, _iteratorError12, _iterator12, _step12, sourceOp, operation, operationType, newOperations, _iteratorNormalCompletion13, _didIteratorError13, _iteratorError13, _iterator13, _step13, _operation, similarOperations, accountInfo, opDate, numNewOperations, toCreate, _iteratorNormalCompletion14, _didIteratorError14, _iteratorError14, _iterator14, _step14, operationToCreate, created, _iteratorNormalCompletion15, _didIteratorError15, _iteratorError15, _iterator15, _step15, _ref8, _account2, balanceOffset, accounts, _iteratorNormalCompletion16, _didIteratorError16, _iteratorError16, _iterator16, _step16, _account3, updated;

                return _regenerator2.default.wrap(function _callee6$(_context6) {
                    while (1) {
                        switch (_context6.prev = _context6.next) {
                            case 0:
                                if (access.hasPassword()) {
                                    _context6.next = 4;
                                    break;
                                }

                                log.warn("Skipping operations fetching -- password isn't present");
                                errcode = (0, _helpers.getErrorCode)('NO_PASSWORD');
                                throw new _helpers.KError("Access' password is not set", 500, errcode);

                            case 4:
                                _context6.next = 6;
                                return handler(access).fetchTransactions(access);

                            case 6:
                                sourceOps = _context6.sent;
                                operations = [];
                                now = (0, _moment2.default)().format('YYYY-MM-DDTHH:mm:ss.000Z');
                                _context6.next = 11;
                                return _account5.default.byAccess(access);

                            case 11:
                                allAccounts = _context6.sent;
                                accountMap = new _map2.default();
                                _iteratorNormalCompletion11 = true;
                                _didIteratorError11 = false;
                                _iteratorError11 = undefined;
                                _context6.prev = 16;
                                _iterator11 = (0, _getIterator3.default)(allAccounts);

                            case 18:
                                if (_iteratorNormalCompletion11 = (_step11 = _iterator11.next()).done) {
                                    _context6.next = 28;
                                    break;
                                }

                                account = _step11.value;

                                if (!this.newAccountsMap.has(account.accountNumber)) {
                                    _context6.next = 24;
                                    break;
                                }

                                oldEntry = this.newAccountsMap.get(account.accountNumber);

                                accountMap.set(account.accountNumber, oldEntry);
                                return _context6.abrupt('continue', 25);

                            case 24:

                                accountMap.set(account.accountNumber, {
                                    account: account,
                                    balanceOffset: 0
                                });

                            case 25:
                                _iteratorNormalCompletion11 = true;
                                _context6.next = 18;
                                break;

                            case 28:
                                _context6.next = 34;
                                break;

                            case 30:
                                _context6.prev = 30;
                                _context6.t0 = _context6['catch'](16);
                                _didIteratorError11 = true;
                                _iteratorError11 = _context6.t0;

                            case 34:
                                _context6.prev = 34;
                                _context6.prev = 35;

                                if (!_iteratorNormalCompletion11 && _iterator11.return) {
                                    _iterator11.return();
                                }

                            case 37:
                                _context6.prev = 37;

                                if (!_didIteratorError11) {
                                    _context6.next = 40;
                                    break;
                                }

                                throw _iteratorError11;

                            case 40:
                                return _context6.finish(37);

                            case 41:
                                return _context6.finish(34);

                            case 42:

                                // Eagerly clear state.
                                this.newAccountsMap.clear();

                                // Normalize source information
                                _iteratorNormalCompletion12 = true;
                                _didIteratorError12 = false;
                                _iteratorError12 = undefined;
                                _context6.prev = 46;
                                for (_iterator12 = (0, _getIterator3.default)(sourceOps); !(_iteratorNormalCompletion12 = (_step12 = _iterator12.next()).done); _iteratorNormalCompletion12 = true) {
                                    sourceOp = _step12.value;
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

                                    operationType = _operationtype2.default.idToName(sourceOp.type);

                                    // The default type's value is directly set by the operation model.

                                    if (operationType !== null) operation.type = operationType;

                                    operations.push(operation);
                                }

                                _context6.next = 54;
                                break;

                            case 50:
                                _context6.prev = 50;
                                _context6.t1 = _context6['catch'](46);
                                _didIteratorError12 = true;
                                _iteratorError12 = _context6.t1;

                            case 54:
                                _context6.prev = 54;
                                _context6.prev = 55;

                                if (!_iteratorNormalCompletion12 && _iterator12.return) {
                                    _iterator12.return();
                                }

                            case 57:
                                _context6.prev = 57;

                                if (!_didIteratorError12) {
                                    _context6.next = 60;
                                    break;
                                }

                                throw _iteratorError12;

                            case 60:
                                return _context6.finish(57);

                            case 61:
                                return _context6.finish(54);

                            case 62:
                                newOperations = [];
                                _iteratorNormalCompletion13 = true;
                                _didIteratorError13 = false;
                                _iteratorError13 = undefined;
                                _context6.prev = 66;
                                _iterator13 = (0, _getIterator3.default)(operations);

                            case 68:
                                if (_iteratorNormalCompletion13 = (_step13 = _iterator13.next()).done) {
                                    _context6.next = 84;
                                    break;
                                }

                                _operation = _step13.value;

                                if (accountMap.has(_operation.bankAccount)) {
                                    _context6.next = 72;
                                    break;
                                }

                                return _context6.abrupt('continue', 81);

                            case 72:
                                _context6.next = 74;
                                return _operation3.default.allLike(_operation);

                            case 74:
                                similarOperations = _context6.sent;

                                if (!(similarOperations && similarOperations.length)) {
                                    _context6.next = 77;
                                    break;
                                }

                                return _context6.abrupt('continue', 81);

                            case 77:

                                // It is definitely a new operation.
                                newOperations.push(_operation);

                                // Remember amounts of transactions older than the import, to resync balance.
                                accountInfo = accountMap.get(_operation.bankAccount);
                                opDate = new Date(_operation.date);

                                if (+opDate <= +accountInfo.account.importDate) {
                                    accountInfo.balanceOffset += +_operation.amount;
                                }

                            case 81:
                                _iteratorNormalCompletion13 = true;
                                _context6.next = 68;
                                break;

                            case 84:
                                _context6.next = 90;
                                break;

                            case 86:
                                _context6.prev = 86;
                                _context6.t2 = _context6['catch'](66);
                                _didIteratorError13 = true;
                                _iteratorError13 = _context6.t2;

                            case 90:
                                _context6.prev = 90;
                                _context6.prev = 91;

                                if (!_iteratorNormalCompletion13 && _iterator13.return) {
                                    _iterator13.return();
                                }

                            case 93:
                                _context6.prev = 93;

                                if (!_didIteratorError13) {
                                    _context6.next = 96;
                                    break;
                                }

                                throw _iteratorError13;

                            case 96:
                                return _context6.finish(93);

                            case 97:
                                return _context6.finish(90);

                            case 98:

                                // Create the new operations
                                numNewOperations = newOperations.length;

                                if (numNewOperations) {
                                    log.info(newOperations.length + ' new operations found!');
                                }

                                toCreate = newOperations;

                                newOperations = [];
                                _iteratorNormalCompletion14 = true;
                                _didIteratorError14 = false;
                                _iteratorError14 = undefined;
                                _context6.prev = 105;
                                _iterator14 = (0, _getIterator3.default)(toCreate);

                            case 107:
                                if (_iteratorNormalCompletion14 = (_step14 = _iterator14.next()).done) {
                                    _context6.next = 116;
                                    break;
                                }

                                operationToCreate = _step14.value;
                                _context6.next = 111;
                                return _operation3.default.create(operationToCreate);

                            case 111:
                                created = _context6.sent;

                                newOperations.push(created);

                            case 113:
                                _iteratorNormalCompletion14 = true;
                                _context6.next = 107;
                                break;

                            case 116:
                                _context6.next = 122;
                                break;

                            case 118:
                                _context6.prev = 118;
                                _context6.t3 = _context6['catch'](105);
                                _didIteratorError14 = true;
                                _iteratorError14 = _context6.t3;

                            case 122:
                                _context6.prev = 122;
                                _context6.prev = 123;

                                if (!_iteratorNormalCompletion14 && _iterator14.return) {
                                    _iterator14.return();
                                }

                            case 125:
                                _context6.prev = 125;

                                if (!_didIteratorError14) {
                                    _context6.next = 128;
                                    break;
                                }

                                throw _iteratorError14;

                            case 128:
                                return _context6.finish(125);

                            case 129:
                                return _context6.finish(122);

                            case 130:

                                // Update account balances.
                                _iteratorNormalCompletion15 = true;
                                _didIteratorError15 = false;
                                _iteratorError15 = undefined;
                                _context6.prev = 133;
                                _iterator15 = (0, _getIterator3.default)(accountMap.values());

                            case 135:
                                if (_iteratorNormalCompletion15 = (_step15 = _iterator15.next()).done) {
                                    _context6.next = 146;
                                    break;
                                }

                                _ref8 = _step15.value;
                                _account2 = _ref8.account, balanceOffset = _ref8.balanceOffset;

                                if (!balanceOffset) {
                                    _context6.next = 143;
                                    break;
                                }

                                log.info('Account ' + _account2.title + ' initial balance is going to be resynced, by an\noffset of ' + balanceOffset + '.');
                                _account2.initialAmount -= balanceOffset;
                                _context6.next = 143;
                                return _account2.save();

                            case 143:
                                _iteratorNormalCompletion15 = true;
                                _context6.next = 135;
                                break;

                            case 146:
                                _context6.next = 152;
                                break;

                            case 148:
                                _context6.prev = 148;
                                _context6.t4 = _context6['catch'](133);
                                _didIteratorError15 = true;
                                _iteratorError15 = _context6.t4;

                            case 152:
                                _context6.prev = 152;
                                _context6.prev = 153;

                                if (!_iteratorNormalCompletion15 && _iterator15.return) {
                                    _iterator15.return();
                                }

                            case 155:
                                _context6.prev = 155;

                                if (!_didIteratorError15) {
                                    _context6.next = 158;
                                    break;
                                }

                                throw _iteratorError15;

                            case 158:
                                return _context6.finish(155);

                            case 159:
                                return _context6.finish(152);

                            case 160:

                                // Carry over all the triggers on new operations.
                                log.info("Updating 'last checked' for linked accounts...");
                                accounts = [];
                                _iteratorNormalCompletion16 = true;
                                _didIteratorError16 = false;
                                _iteratorError16 = undefined;
                                _context6.prev = 165;
                                _iterator16 = (0, _getIterator3.default)(allAccounts);

                            case 167:
                                if (_iteratorNormalCompletion16 = (_step16 = _iterator16.next()).done) {
                                    _context6.next = 176;
                                    break;
                                }

                                _account3 = _step16.value;
                                _context6.next = 171;
                                return _account3.updateAttributes({ lastChecked: new Date() });

                            case 171:
                                updated = _context6.sent;

                                accounts.push(updated);

                            case 173:
                                _iteratorNormalCompletion16 = true;
                                _context6.next = 167;
                                break;

                            case 176:
                                _context6.next = 182;
                                break;

                            case 178:
                                _context6.prev = 178;
                                _context6.t5 = _context6['catch'](165);
                                _didIteratorError16 = true;
                                _iteratorError16 = _context6.t5;

                            case 182:
                                _context6.prev = 182;
                                _context6.prev = 183;

                                if (!_iteratorNormalCompletion16 && _iterator16.return) {
                                    _iterator16.return();
                                }

                            case 185:
                                _context6.prev = 185;

                                if (!_didIteratorError16) {
                                    _context6.next = 188;
                                    break;
                                }

                                throw _iteratorError16;

                            case 188:
                                return _context6.finish(185);

                            case 189:
                                return _context6.finish(182);

                            case 190:

                                log.info('Informing user new operations have been imported...');

                                if (!(numNewOperations > 0)) {
                                    _context6.next = 194;
                                    break;
                                }

                                _context6.next = 194;
                                return notifyNewOperations(access, newOperations, accountMap);

                            case 194:

                                log.info('Checking alerts for accounts balance...');

                                if (!numNewOperations) {
                                    _context6.next = 198;
                                    break;
                                }

                                _context6.next = 198;
                                return _alertManager2.default.checkAlertsForAccounts(access);

                            case 198:

                                log.info('Checking alerts for operations amount...');
                                _context6.next = 201;
                                return _alertManager2.default.checkAlertsForOperations(access, newOperations);

                            case 201:

                                access.fetchStatus = 'OK';
                                _context6.next = 204;
                                return access.save();

                            case 204:
                                log.info('Post process: done.');

                                return _context6.abrupt('return', { accounts: accounts, newOperations: newOperations });

                            case 206:
                            case 'end':
                                return _context6.stop();
                        }
                    }
                }, _callee6, this, [[16, 30, 34, 42], [35,, 37, 41], [46, 50, 54, 62], [55,, 57, 61], [66, 86, 90, 98], [91,, 93, 97], [105, 118, 122, 130], [123,, 125, 129], [133, 148, 152, 160], [153,, 155, 159], [165, 178, 182, 190], [183,, 185, 189]]);
            }));

            function retrieveOperationsByAccess(_x10) {
                return _ref6.apply(this, arguments);
            }

            return retrieveOperationsByAccess;
        }()
    }, {
        key: 'resyncAccountBalance',
        value: function () {
            var _ref9 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee7(account) {
                var access, accounts, retrievedAccount, realBalance, operations, operationsSum, kresusBalance;
                return _regenerator2.default.wrap(function _callee7$(_context7) {
                    while (1) {
                        switch (_context7.prev = _context7.next) {
                            case 0:
                                _context7.next = 2;
                                return _access2.default.find(account.bankAccess);

                            case 2:
                                access = _context7.sent;
                                _context7.next = 5;
                                return retrieveAllAccountsByAccess(access);

                            case 5:
                                accounts = _context7.sent;
                                retrievedAccount = accounts.find(function (acc) {
                                    return acc.accountNumber === account.accountNumber;
                                });

                                if (!(typeof retrievedAccount !== 'undefined')) {
                                    _context7.next = 21;
                                    break;
                                }

                                realBalance = retrievedAccount.initialAmount;
                                _context7.next = 11;
                                return _operation3.default.byAccount(account);

                            case 11:
                                operations = _context7.sent;
                                operationsSum = operations.reduce(function (amount, op) {
                                    return amount + op.amount;
                                }, 0);
                                kresusBalance = operationsSum + account.initialAmount;

                                if (!(Math.abs(realBalance - kresusBalance) > 0.01)) {
                                    _context7.next = 19;
                                    break;
                                }

                                log.info('Updating balance for account ' + account.accountNumber);
                                account.initialAmount = realBalance - operationsSum;
                                _context7.next = 19;
                                return account.save();

                            case 19:
                                _context7.next = 22;
                                break;

                            case 21:
                                throw new _helpers.KError('account not found', 404);

                            case 22:
                                return _context7.abrupt('return', account);

                            case 23:
                            case 'end':
                                return _context7.stop();
                        }
                    }
                }, _callee7, this);
            }));

            function resyncAccountBalance(_x11) {
                return _ref9.apply(this, arguments);
            }

            return resyncAccountBalance;
        }()
    }]);
    return AccountManager;
}();

exports.default = new AccountManager();