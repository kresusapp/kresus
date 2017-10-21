'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

// Effectively does a merge of two accounts that have been identified to be duplicates.
// - known is the former Account instance (known in Kresus's database).
// - provided is the new Account instance provided by the source backend.
var mergeAccounts = function () {
    var _ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee(known, provided) {
        var ops, _iteratorNormalCompletion2, _didIteratorError2, _iteratorError2, _iterator2, _step2, op, alerts, _iteratorNormalCompletion3, _didIteratorError3, _iteratorError3, _iterator3, _step3, alert, newProps;

        return regeneratorRuntime.wrap(function _callee$(_context) {
            while (1) {
                switch (_context.prev = _context.next) {
                    case 0:
                        if (!(known.accountNumber !== provided.accountNumber)) {
                            _context.next = 59;
                            break;
                        }

                        _context.next = 3;
                        return _operation2.default.byAccount(known);

                    case 3:
                        ops = _context.sent;
                        _iteratorNormalCompletion2 = true;
                        _didIteratorError2 = false;
                        _iteratorError2 = undefined;
                        _context.prev = 7;
                        _iterator2 = ops[Symbol.iterator]();

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
                        _iterator3 = alerts[Symbol.iterator]();

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
    var _ref2 = _asyncToGenerator(regeneratorRuntime.mark(function _callee2(access) {
        var errcode, sourceAccounts, accounts, _iteratorNormalCompletion4, _didIteratorError4, _iteratorError4, _iterator4, _step4, accountWeboob, account;

        return regeneratorRuntime.wrap(function _callee2$(_context2) {
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

                        log.info('Retrieve all accounts from access ' + access.bank + ' with login ' + access.login);
                        _context2.next = 7;
                        return handler(access).fetchAccounts(access);

                    case 7:
                        sourceAccounts = _context2.sent;
                        accounts = [];
                        _iteratorNormalCompletion4 = true;
                        _didIteratorError4 = false;
                        _iteratorError4 = undefined;
                        _context2.prev = 12;

                        for (_iterator4 = sourceAccounts[Symbol.iterator](); !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
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

                        _context2.next = 20;
                        break;

                    case 16:
                        _context2.prev = 16;
                        _context2.t0 = _context2['catch'](12);
                        _didIteratorError4 = true;
                        _iteratorError4 = _context2.t0;

                    case 20:
                        _context2.prev = 20;
                        _context2.prev = 21;

                        if (!_iteratorNormalCompletion4 && _iterator4.return) {
                            _iterator4.return();
                        }

                    case 23:
                        _context2.prev = 23;

                        if (!_didIteratorError4) {
                            _context2.next = 26;
                            break;
                        }

                        throw _iteratorError4;

                    case 26:
                        return _context2.finish(23);

                    case 27:
                        return _context2.finish(20);

                    case 28:
                        log.info('-> ' + accounts.length + ' bank account(s) found');

                        return _context2.abrupt('return', accounts);

                    case 30:
                    case 'end':
                        return _context2.stop();
                }
            }
        }, _callee2, this, [[12, 16, 20, 28], [21,, 23, 27]]);
    }));

    return function retrieveAllAccountsByAccess(_x3) {
        return _ref2.apply(this, arguments);
    };
}();

// Sends notification for a given access, considering a list of newOperations
// and an accountMap (mapping accountId -> account).


var notifyNewOperations = function () {
    var _ref3 = _asyncToGenerator(regeneratorRuntime.mark(function _callee3(access, newOperations, accountMap) {
        var newOpsPerAccount, _iteratorNormalCompletion5, _didIteratorError5, _iteratorError5, _iterator5, _step5, newOp, opAccountId, bank, _iteratorNormalCompletion6, _didIteratorError6, _iteratorError6, _iterator6, _step6, _ref4, _ref5, accountId, ops, _accountMap$get, account, params, formatCurrency;

        return regeneratorRuntime.wrap(function _callee3$(_context3) {
            while (1) {
                switch (_context3.prev = _context3.next) {
                    case 0:
                        newOpsPerAccount = new Map();
                        _iteratorNormalCompletion5 = true;
                        _didIteratorError5 = false;
                        _iteratorError5 = undefined;
                        _context3.prev = 4;


                        for (_iterator5 = newOperations[Symbol.iterator](); !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
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
                        for (_iterator6 = newOpsPerAccount.entries()[Symbol.iterator](); !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
                            _ref4 = _step6.value;
                            _ref5 = _slicedToArray(_ref4, 2);
                            accountId = _ref5[0];
                            ops = _ref5[1];
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

var _operation = require('../models/operation');

var _operation2 = _interopRequireDefault(_operation);

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

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

var log = (0, _helpers.makeLogger)('accounts-manager');

var SOURCE_HANDLERS = {};
function addBackend(exportObject) {
    if (typeof exportObject.SOURCE_NAME === 'undefined' || typeof exportObject.fetchAccounts === 'undefined' || typeof exportObject.fetchOperations === 'undefined') {
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
    for (var _iterator = ALL_BANKS[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
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
        _classCallCheck(this, AccountManager);

        this.newAccountsMap = new Map();
        this.q = new _asyncQueue2.default();

        this.retrieveNewAccountsByAccess = this.q.wrap(this.retrieveNewAccountsByAccess.bind(this));
        this.retrieveOperationsByAccess = this.q.wrap(this.retrieveOperationsByAccess.bind(this));
        this.resyncAccountBalance = this.q.wrap(this.resyncAccountBalance.bind(this));
    }

    _createClass(AccountManager, [{
        key: 'retrieveNewAccountsByAccess',
        value: function () {
            var _ref6 = _asyncToGenerator(regeneratorRuntime.mark(function _callee4(access, shouldAddNewAccounts) {
                var accounts, oldAccounts, diff, _iteratorNormalCompletion7, _didIteratorError7, _iteratorError7, _iterator7, _step7, _ref7, _ref8, known, _iteratorNormalCompletion8, _didIteratorError8, _iteratorError8, _iterator8, _step8, account, newAccountInfo, existingOperations, offset, newAccount, _iteratorNormalCompletion9, _didIteratorError9, _iteratorError9, _iterator9, _step9, _account, shouldMergeAccounts, _iteratorNormalCompletion10, _didIteratorError10, _iteratorError10, _iterator10, _step10, _ref9, _ref10, _known, provided;

                return regeneratorRuntime.wrap(function _callee4$(_context4) {
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


                                for (_iterator7 = diff.perfectMatches[Symbol.iterator](); !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
                                    _ref7 = _step7.value;
                                    _ref8 = _slicedToArray(_ref7, 1);
                                    known = _ref8[0];

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
                                _iterator8 = diff.providerOrphans[Symbol.iterator]();

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
                                return _operation2.default.byAccount(account);

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


                                for (_iterator9 = diff.knownOrphans[Symbol.iterator](); !(_iteratorNormalCompletion9 = (_step9 = _iterator9.next()).done); _iteratorNormalCompletion9 = true) {
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
                                    _context4.next = 121;
                                    break;
                                }

                                _iteratorNormalCompletion10 = true;
                                _didIteratorError10 = false;
                                _iteratorError10 = undefined;
                                _context4.prev = 92;
                                _iterator10 = diff.duplicateCandidates[Symbol.iterator]();

                            case 94:
                                if (_iteratorNormalCompletion10 = (_step10 = _iterator10.next()).done) {
                                    _context4.next = 105;
                                    break;
                                }

                                _ref9 = _step10.value;
                                _ref10 = _slicedToArray(_ref9, 2);
                                _known = _ref10[0];
                                provided = _ref10[1];

                                log.info('Found candidates for accounts merging:\n- ' + _known.accountNumber + ' / ' + _known.title + '\n- ' + provided.accountNumber + ' / ' + provided.title);
                                _context4.next = 102;
                                return mergeAccounts(_known, provided);

                            case 102:
                                _iteratorNormalCompletion10 = true;
                                _context4.next = 94;
                                break;

                            case 105:
                                _context4.next = 111;
                                break;

                            case 107:
                                _context4.prev = 107;
                                _context4.t3 = _context4['catch'](92);
                                _didIteratorError10 = true;
                                _iteratorError10 = _context4.t3;

                            case 111:
                                _context4.prev = 111;
                                _context4.prev = 112;

                                if (!_iteratorNormalCompletion10 && _iterator10.return) {
                                    _iterator10.return();
                                }

                            case 114:
                                _context4.prev = 114;

                                if (!_didIteratorError10) {
                                    _context4.next = 117;
                                    break;
                                }

                                throw _iteratorError10;

                            case 117:
                                return _context4.finish(114);

                            case 118:
                                return _context4.finish(111);

                            case 119:
                                _context4.next = 122;
                                break;

                            case 121:
                                log.info('Found ' + diff.duplicateCandidates.length + ' candidates for merging, but not\nmerging as per request');

                            case 122:
                            case 'end':
                                return _context4.stop();
                        }
                    }
                }, _callee4, this, [[11, 15, 19, 27], [20,, 22, 26], [30, 54, 58, 66], [59,, 61, 65], [69, 73, 77, 85], [78,, 80, 84], [92, 107, 111, 119], [112,, 114, 118]]);
            }));

            function retrieveNewAccountsByAccess(_x7, _x8) {
                return _ref6.apply(this, arguments);
            }

            return retrieveNewAccountsByAccess;
        }()

        // Not wrapped in the sequential queue: this would introduce a deadlock
        // since retrieveNewAccountsByAccess is wrapped!

    }, {
        key: 'retrieveAndAddAccountsByAccess',
        value: function () {
            var _ref11 = _asyncToGenerator(regeneratorRuntime.mark(function _callee5(access) {
                return regeneratorRuntime.wrap(function _callee5$(_context5) {
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
                return _ref11.apply(this, arguments);
            }

            return retrieveAndAddAccountsByAccess;
        }()
    }, {
        key: 'retrieveOperationsByAccess',
        value: function () {
            var _ref12 = _asyncToGenerator(regeneratorRuntime.mark(function _callee6(access) {
                var errcode, operations, now, allAccounts, accountMap, _iteratorNormalCompletion11, _didIteratorError11, _iteratorError11, _iterator11, _step11, account, oldEntry, sourceOps, _iteratorNormalCompletion12, _didIteratorError12, _iteratorError12, _iterator12, _step12, sourceOp, operation, operationType, newOperations, _iteratorNormalCompletion13, _didIteratorError13, _iteratorError13, _iterator13, _step13, similarOperations, debitDate, accountInfo, numNewOperations, toCreate, _iteratorNormalCompletion14, _didIteratorError14, _iteratorError14, _iterator14, _step14, operationToCreate, created, _iteratorNormalCompletion15, _didIteratorError15, _iteratorError15, _iterator15, _step15, _ref13, _account2, balanceOffset, accounts, _iteratorNormalCompletion16, _didIteratorError16, _iteratorError16, _iterator16, _step16, _account3, updated;

                return regeneratorRuntime.wrap(function _callee6$(_context6) {
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
                                operations = [];
                                now = (0, _moment2.default)().format('YYYY-MM-DDTHH:mm:ss.000Z');
                                _context6.next = 8;
                                return _account5.default.byAccess(access);

                            case 8:
                                allAccounts = _context6.sent;
                                accountMap = new Map();
                                _iteratorNormalCompletion11 = true;
                                _didIteratorError11 = false;
                                _iteratorError11 = undefined;
                                _context6.prev = 13;
                                _iterator11 = allAccounts[Symbol.iterator]();

                            case 15:
                                if (_iteratorNormalCompletion11 = (_step11 = _iterator11.next()).done) {
                                    _context6.next = 25;
                                    break;
                                }

                                account = _step11.value;

                                if (!this.newAccountsMap.has(account.accountNumber)) {
                                    _context6.next = 21;
                                    break;
                                }

                                oldEntry = this.newAccountsMap.get(account.accountNumber);

                                accountMap.set(account.accountNumber, oldEntry);
                                return _context6.abrupt('continue', 22);

                            case 21:

                                accountMap.set(account.accountNumber, {
                                    account: account,
                                    balanceOffset: 0
                                });

                            case 22:
                                _iteratorNormalCompletion11 = true;
                                _context6.next = 15;
                                break;

                            case 25:
                                _context6.next = 31;
                                break;

                            case 27:
                                _context6.prev = 27;
                                _context6.t0 = _context6['catch'](13);
                                _didIteratorError11 = true;
                                _iteratorError11 = _context6.t0;

                            case 31:
                                _context6.prev = 31;
                                _context6.prev = 32;

                                if (!_iteratorNormalCompletion11 && _iterator11.return) {
                                    _iterator11.return();
                                }

                            case 34:
                                _context6.prev = 34;

                                if (!_didIteratorError11) {
                                    _context6.next = 37;
                                    break;
                                }

                                throw _iteratorError11;

                            case 37:
                                return _context6.finish(34);

                            case 38:
                                return _context6.finish(31);

                            case 39:

                                // Eagerly clear state.
                                this.newAccountsMap.clear();

                                // Fetch source operations
                                _context6.next = 42;
                                return handler(access).fetchOperations(access);

                            case 42:
                                sourceOps = _context6.sent;


                                log.info('Normalizing source information...');
                                _iteratorNormalCompletion12 = true;
                                _didIteratorError12 = false;
                                _iteratorError12 = undefined;
                                _context6.prev = 47;
                                for (_iterator12 = sourceOps[Symbol.iterator](); !(_iteratorNormalCompletion12 = (_step12 = _iterator12.next()).done); _iteratorNormalCompletion12 = true) {
                                    sourceOp = _step12.value;
                                    operation = {
                                        bankAccount: sourceOp.account,
                                        amount: sourceOp.amount,
                                        raw: sourceOp.raw,
                                        date: sourceOp.date,
                                        title: sourceOp.title,
                                        binary: sourceOp.binary,
                                        debitDate: sourceOp.debit_date
                                    };


                                    operation.title = operation.title || operation.raw || '';
                                    operation.date = operation.date || now;
                                    operation.debitDate = operation.debitDate || now;
                                    operation.dateImport = now;

                                    operationType = _operationtype2.default.idToName(sourceOp.type);

                                    // The default type's value is directly set by the operation model.

                                    if (operationType !== null) operation.type = operationType;

                                    operations.push(operation);
                                }

                                _context6.next = 55;
                                break;

                            case 51:
                                _context6.prev = 51;
                                _context6.t1 = _context6['catch'](47);
                                _didIteratorError12 = true;
                                _iteratorError12 = _context6.t1;

                            case 55:
                                _context6.prev = 55;
                                _context6.prev = 56;

                                if (!_iteratorNormalCompletion12 && _iterator12.return) {
                                    _iterator12.return();
                                }

                            case 58:
                                _context6.prev = 58;

                                if (!_didIteratorError12) {
                                    _context6.next = 61;
                                    break;
                                }

                                throw _iteratorError12;

                            case 61:
                                return _context6.finish(58);

                            case 62:
                                return _context6.finish(55);

                            case 63:
                                log.info('Comparing with database to ignore already known operations…');
                                newOperations = [];
                                _iteratorNormalCompletion13 = true;
                                _didIteratorError13 = false;
                                _iteratorError13 = undefined;
                                _context6.prev = 68;
                                _iterator13 = operations[Symbol.iterator]();

                            case 70:
                                if (_iteratorNormalCompletion13 = (_step13 = _iterator13.next()).done) {
                                    _context6.next = 87;
                                    break;
                                }

                                operation = _step13.value;

                                if (accountMap.has(operation.bankAccount)) {
                                    _context6.next = 74;
                                    break;
                                }

                                return _context6.abrupt('continue', 84);

                            case 74:
                                _context6.next = 76;
                                return _operation2.default.allLike(operation);

                            case 76:
                                similarOperations = _context6.sent;

                                if (!(similarOperations && similarOperations.length)) {
                                    _context6.next = 79;
                                    break;
                                }

                                return _context6.abrupt('continue', 84);

                            case 79:

                                // It is definitely a new operation.
                                debitDate = (0, _moment2.default)(operation.debitDate);

                                delete operation.debitDate;

                                newOperations.push(operation);

                                // Remember amounts of operations older than the import, to resync balance.
                                accountInfo = accountMap.get(operation.bankAccount);

                                if (+debitDate < +accountInfo.account.importDate) {
                                    accountInfo.balanceOffset += +operation.amount;
                                }

                            case 84:
                                _iteratorNormalCompletion13 = true;
                                _context6.next = 70;
                                break;

                            case 87:
                                _context6.next = 93;
                                break;

                            case 89:
                                _context6.prev = 89;
                                _context6.t2 = _context6['catch'](68);
                                _didIteratorError13 = true;
                                _iteratorError13 = _context6.t2;

                            case 93:
                                _context6.prev = 93;
                                _context6.prev = 94;

                                if (!_iteratorNormalCompletion13 && _iterator13.return) {
                                    _iterator13.return();
                                }

                            case 96:
                                _context6.prev = 96;

                                if (!_didIteratorError13) {
                                    _context6.next = 99;
                                    break;
                                }

                                throw _iteratorError13;

                            case 99:
                                return _context6.finish(96);

                            case 100:
                                return _context6.finish(93);

                            case 101:

                                // Create the new operations
                                numNewOperations = newOperations.length;

                                if (numNewOperations) {
                                    log.info(newOperations.length + ' new operations found!');
                                }

                                toCreate = newOperations;

                                newOperations = [];
                                if (toCreate.length > 0) {
                                    log.info('Creating new operations…');
                                }

                                _iteratorNormalCompletion14 = true;
                                _didIteratorError14 = false;
                                _iteratorError14 = undefined;
                                _context6.prev = 109;
                                _iterator14 = toCreate[Symbol.iterator]();

                            case 111:
                                if (_iteratorNormalCompletion14 = (_step14 = _iterator14.next()).done) {
                                    _context6.next = 120;
                                    break;
                                }

                                operationToCreate = _step14.value;
                                _context6.next = 115;
                                return _operation2.default.create(operationToCreate);

                            case 115:
                                created = _context6.sent;

                                newOperations.push(created);

                            case 117:
                                _iteratorNormalCompletion14 = true;
                                _context6.next = 111;
                                break;

                            case 120:
                                _context6.next = 126;
                                break;

                            case 122:
                                _context6.prev = 122;
                                _context6.t3 = _context6['catch'](109);
                                _didIteratorError14 = true;
                                _iteratorError14 = _context6.t3;

                            case 126:
                                _context6.prev = 126;
                                _context6.prev = 127;

                                if (!_iteratorNormalCompletion14 && _iterator14.return) {
                                    _iterator14.return();
                                }

                            case 129:
                                _context6.prev = 129;

                                if (!_didIteratorError14) {
                                    _context6.next = 132;
                                    break;
                                }

                                throw _iteratorError14;

                            case 132:
                                return _context6.finish(129);

                            case 133:
                                return _context6.finish(126);

                            case 134:

                                log.info('Updating accounts balances…');
                                _iteratorNormalCompletion15 = true;
                                _didIteratorError15 = false;
                                _iteratorError15 = undefined;
                                _context6.prev = 138;
                                _iterator15 = accountMap.values()[Symbol.iterator]();

                            case 140:
                                if (_iteratorNormalCompletion15 = (_step15 = _iterator15.next()).done) {
                                    _context6.next = 151;
                                    break;
                                }

                                _ref13 = _step15.value;
                                _account2 = _ref13.account, balanceOffset = _ref13.balanceOffset;

                                if (!balanceOffset) {
                                    _context6.next = 148;
                                    break;
                                }

                                log.info('Account ' + _account2.title + ' initial balance is going to be resynced, by an\noffset of ' + balanceOffset + '.');
                                _account2.initialAmount -= balanceOffset;
                                _context6.next = 148;
                                return _account2.save();

                            case 148:
                                _iteratorNormalCompletion15 = true;
                                _context6.next = 140;
                                break;

                            case 151:
                                _context6.next = 157;
                                break;

                            case 153:
                                _context6.prev = 153;
                                _context6.t4 = _context6['catch'](138);
                                _didIteratorError15 = true;
                                _iteratorError15 = _context6.t4;

                            case 157:
                                _context6.prev = 157;
                                _context6.prev = 158;

                                if (!_iteratorNormalCompletion15 && _iterator15.return) {
                                    _iterator15.return();
                                }

                            case 160:
                                _context6.prev = 160;

                                if (!_didIteratorError15) {
                                    _context6.next = 163;
                                    break;
                                }

                                throw _iteratorError15;

                            case 163:
                                return _context6.finish(160);

                            case 164:
                                return _context6.finish(157);

                            case 165:

                                // Carry over all the triggers on new operations.
                                log.info("Updating 'last checked' for linked accounts...");
                                accounts = [];
                                _iteratorNormalCompletion16 = true;
                                _didIteratorError16 = false;
                                _iteratorError16 = undefined;
                                _context6.prev = 170;
                                _iterator16 = allAccounts[Symbol.iterator]();

                            case 172:
                                if (_iteratorNormalCompletion16 = (_step16 = _iterator16.next()).done) {
                                    _context6.next = 181;
                                    break;
                                }

                                _account3 = _step16.value;
                                _context6.next = 176;
                                return _account3.updateAttributes({ lastChecked: new Date() });

                            case 176:
                                updated = _context6.sent;

                                accounts.push(updated);

                            case 178:
                                _iteratorNormalCompletion16 = true;
                                _context6.next = 172;
                                break;

                            case 181:
                                _context6.next = 187;
                                break;

                            case 183:
                                _context6.prev = 183;
                                _context6.t5 = _context6['catch'](170);
                                _didIteratorError16 = true;
                                _iteratorError16 = _context6.t5;

                            case 187:
                                _context6.prev = 187;
                                _context6.prev = 188;

                                if (!_iteratorNormalCompletion16 && _iterator16.return) {
                                    _iterator16.return();
                                }

                            case 190:
                                _context6.prev = 190;

                                if (!_didIteratorError16) {
                                    _context6.next = 193;
                                    break;
                                }

                                throw _iteratorError16;

                            case 193:
                                return _context6.finish(190);

                            case 194:
                                return _context6.finish(187);

                            case 195:
                                if (!(numNewOperations > 0)) {
                                    _context6.next = 199;
                                    break;
                                }

                                log.info('Informing user ' + numNewOperations + ' new operations have been imported...');
                                _context6.next = 199;
                                return notifyNewOperations(access, newOperations, accountMap);

                            case 199:

                                log.info('Checking alerts for accounts balance...');

                                if (!numNewOperations) {
                                    _context6.next = 203;
                                    break;
                                }

                                _context6.next = 203;
                                return _alertManager2.default.checkAlertsForAccounts(access);

                            case 203:

                                log.info('Checking alerts for operations amount...');
                                _context6.next = 206;
                                return _alertManager2.default.checkAlertsForOperations(access, newOperations);

                            case 206:

                                access.fetchStatus = 'OK';
                                _context6.next = 209;
                                return access.save();

                            case 209:
                                log.info('Post process: done.');

                                return _context6.abrupt('return', { accounts: accounts, newOperations: newOperations });

                            case 211:
                            case 'end':
                                return _context6.stop();
                        }
                    }
                }, _callee6, this, [[13, 27, 31, 39], [32,, 34, 38], [47, 51, 55, 63], [56,, 58, 62], [68, 89, 93, 101], [94,, 96, 100], [109, 122, 126, 134], [127,, 129, 133], [138, 153, 157, 165], [158,, 160, 164], [170, 183, 187, 195], [188,, 190, 194]]);
            }));

            function retrieveOperationsByAccess(_x10) {
                return _ref12.apply(this, arguments);
            }

            return retrieveOperationsByAccess;
        }()
    }, {
        key: 'resyncAccountBalance',
        value: function () {
            var _ref14 = _asyncToGenerator(regeneratorRuntime.mark(function _callee7(account) {
                var access, accounts, retrievedAccount, realBalance, operations, operationsSum, kresusBalance;
                return regeneratorRuntime.wrap(function _callee7$(_context7) {
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
                                return _operation2.default.byAccount(account);

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
                return _ref14.apply(this, arguments);
            }

            return resyncAccountBalance;
        }()
    }]);

    return AccountManager;
}();

exports.default = new AccountManager();