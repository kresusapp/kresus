'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _getIterator2 = require('babel-runtime/core-js/get-iterator');

var _getIterator3 = _interopRequireDefault(_getIterator2);

var _map = require('babel-runtime/core-js/map');

var _map2 = _interopRequireDefault(_map);

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _emailer = require('./emailer');

var _emailer2 = _interopRequireDefault(_emailer);

var _notifications = require('./notifications');

var _notifications2 = _interopRequireDefault(_notifications);

var _account = require('../models/account');

var _account2 = _interopRequireDefault(_account);

var _alert = require('../models/alert');

var _alert2 = _interopRequireDefault(_alert);

var _config = require('../models/config');

var _config2 = _interopRequireDefault(_config);

var _helpers = require('../helpers');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var log = (0, _helpers.makeLogger)('alert-manager');

var AlertManager = function () {
    function AlertManager() {
        (0, _classCallCheck3.default)(this, AlertManager);
    }

    (0, _createClass3.default)(AlertManager, [{
        key: 'wrapContent',
        value: function wrapContent(content) {
            return (0, _helpers.translate)('server.email.hello') + '\n\n' + content + '\n\n' + (0, _helpers.translate)('server.email.seeyoulater.notifications') + ',\n' + (0, _helpers.translate)('server.email.signature') + '\n';
        }
    }, {
        key: 'send',
        value: function () {
            var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(_ref2) {
                var subject = _ref2.subject,
                    text = _ref2.text;
                var content, fullSubject;
                return _regenerator2.default.wrap(function _callee$(_context) {
                    while (1) {
                        switch (_context.prev = _context.next) {
                            case 0:
                                // Send cozy notification
                                _notifications2.default.send(text);

                                // Send email notification
                                content = this.wrapContent(text);
                                fullSubject = 'Kresus - ' + subject;
                                _context.next = 5;
                                return _emailer2.default.sendToUser({
                                    subject: fullSubject,
                                    content: content
                                });

                            case 5:

                                log.info('Notification sent.');

                            case 6:
                            case 'end':
                                return _context.stop();
                        }
                    }
                }, _callee, this);
            }));

            function send(_x) {
                return _ref.apply(this, arguments);
            }

            return send;
        }()
    }, {
        key: 'checkAlertsForOperations',
        value: function () {
            var _ref3 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee2(access, operations) {
                var defaultCurrency, accounts, accountsMap, _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, a, alertsByAccount, _iteratorNormalCompletion2, _didIteratorError2, _iteratorError2, _iterator2, _step2, operation, alerts, _accountsMap$get, accountName, formatCurrency, _iteratorNormalCompletion3, _didIteratorError3, _iteratorError3, _iterator3, _step3, alert, text;

                return _regenerator2.default.wrap(function _callee2$(_context2) {
                    while (1) {
                        switch (_context2.prev = _context2.next) {
                            case 0:
                                _context2.prev = 0;
                                _context2.next = 3;
                                return _config2.default.byName('defaultCurrency').value;

                            case 3:
                                defaultCurrency = _context2.sent;
                                _context2.next = 6;
                                return _account2.default.byAccess(access);

                            case 6:
                                accounts = _context2.sent;
                                accountsMap = new _map2.default();
                                _iteratorNormalCompletion = true;
                                _didIteratorError = false;
                                _iteratorError = undefined;
                                _context2.prev = 11;

                                for (_iterator = (0, _getIterator3.default)(accounts); !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                                    a = _step.value;

                                    accountsMap.set(a.accountNumber, {
                                        title: a.title,
                                        formatCurrency: _helpers.currency.makeFormat(a.currency || defaultCurrency)
                                    });
                                }

                                // Map accounts to alerts
                                _context2.next = 19;
                                break;

                            case 15:
                                _context2.prev = 15;
                                _context2.t0 = _context2['catch'](11);
                                _didIteratorError = true;
                                _iteratorError = _context2.t0;

                            case 19:
                                _context2.prev = 19;
                                _context2.prev = 20;

                                if (!_iteratorNormalCompletion && _iterator.return) {
                                    _iterator.return();
                                }

                            case 22:
                                _context2.prev = 22;

                                if (!_didIteratorError) {
                                    _context2.next = 25;
                                    break;
                                }

                                throw _iteratorError;

                            case 25:
                                return _context2.finish(22);

                            case 26:
                                return _context2.finish(19);

                            case 27:
                                alertsByAccount = new _map2.default();
                                _iteratorNormalCompletion2 = true;
                                _didIteratorError2 = false;
                                _iteratorError2 = undefined;
                                _context2.prev = 31;
                                _iterator2 = (0, _getIterator3.default)(operations);

                            case 33:
                                if (_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done) {
                                    _context2.next = 79;
                                    break;
                                }

                                operation = _step2.value;


                                // Memoize alerts by account
                                alerts = void 0;

                                if (alertsByAccount.has(operation.bankAccount)) {
                                    _context2.next = 43;
                                    break;
                                }

                                _context2.next = 39;
                                return _alert2.default.byAccountAndType(operation.bankAccount, 'transaction');

                            case 39:
                                alerts = _context2.sent;

                                alertsByAccount.set(operation.bankAccount, alerts);
                                _context2.next = 44;
                                break;

                            case 43:
                                alerts = alertsByAccount.get(operation.bankAccount);

                            case 44:
                                if (!(!alerts || !alerts.length)) {
                                    _context2.next = 46;
                                    break;
                                }

                                return _context2.abrupt('continue', 76);

                            case 46:

                                // Set the account information
                                _accountsMap$get = accountsMap.get(operation.bankAccount), accountName = _accountsMap$get.title, formatCurrency = _accountsMap$get.formatCurrency;
                                _iteratorNormalCompletion3 = true;
                                _didIteratorError3 = false;
                                _iteratorError3 = undefined;
                                _context2.prev = 50;
                                _iterator3 = (0, _getIterator3.default)(alerts);

                            case 52:
                                if (_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done) {
                                    _context2.next = 62;
                                    break;
                                }

                                alert = _step3.value;

                                if (alert.testTransaction(operation)) {
                                    _context2.next = 56;
                                    break;
                                }

                                return _context2.abrupt('continue', 59);

                            case 56:
                                text = alert.formatOperationMessage(operation, accountName, formatCurrency);
                                _context2.next = 59;
                                return this.send({
                                    subject: (0, _helpers.translate)('server.alert.operation.title'),
                                    text: text
                                });

                            case 59:
                                _iteratorNormalCompletion3 = true;
                                _context2.next = 52;
                                break;

                            case 62:
                                _context2.next = 68;
                                break;

                            case 64:
                                _context2.prev = 64;
                                _context2.t1 = _context2['catch'](50);
                                _didIteratorError3 = true;
                                _iteratorError3 = _context2.t1;

                            case 68:
                                _context2.prev = 68;
                                _context2.prev = 69;

                                if (!_iteratorNormalCompletion3 && _iterator3.return) {
                                    _iterator3.return();
                                }

                            case 71:
                                _context2.prev = 71;

                                if (!_didIteratorError3) {
                                    _context2.next = 74;
                                    break;
                                }

                                throw _iteratorError3;

                            case 74:
                                return _context2.finish(71);

                            case 75:
                                return _context2.finish(68);

                            case 76:
                                _iteratorNormalCompletion2 = true;
                                _context2.next = 33;
                                break;

                            case 79:
                                _context2.next = 85;
                                break;

                            case 81:
                                _context2.prev = 81;
                                _context2.t2 = _context2['catch'](31);
                                _didIteratorError2 = true;
                                _iteratorError2 = _context2.t2;

                            case 85:
                                _context2.prev = 85;
                                _context2.prev = 86;

                                if (!_iteratorNormalCompletion2 && _iterator2.return) {
                                    _iterator2.return();
                                }

                            case 88:
                                _context2.prev = 88;

                                if (!_didIteratorError2) {
                                    _context2.next = 91;
                                    break;
                                }

                                throw _iteratorError2;

                            case 91:
                                return _context2.finish(88);

                            case 92:
                                return _context2.finish(85);

                            case 93:
                                _context2.next = 98;
                                break;

                            case 95:
                                _context2.prev = 95;
                                _context2.t3 = _context2['catch'](0);

                                log.error('Error when checking alerts for operations: ' + _context2.t3);

                            case 98:
                            case 'end':
                                return _context2.stop();
                        }
                    }
                }, _callee2, this, [[0, 95], [11, 15, 19, 27], [20,, 22, 26], [31, 81, 85, 93], [50, 64, 68, 76], [69,, 71, 75], [86,, 88, 92]]);
            }));

            function checkAlertsForOperations(_x2, _x3) {
                return _ref3.apply(this, arguments);
            }

            return checkAlertsForOperations;
        }()
    }, {
        key: 'checkAlertsForAccounts',
        value: function () {
            var _ref4 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee3(access) {
                var defaultCurrency, accounts, _iteratorNormalCompletion4, _didIteratorError4, _iteratorError4, _iterator4, _step4, account, alerts, balance, _iteratorNormalCompletion5, _didIteratorError5, _iteratorError5, _iterator5, _step5, alert, curr, formatCurrency, text;

                return _regenerator2.default.wrap(function _callee3$(_context3) {
                    while (1) {
                        switch (_context3.prev = _context3.next) {
                            case 0:
                                _context3.prev = 0;
                                _context3.next = 3;
                                return _config2.default.byName('defaultCurrency').value;

                            case 3:
                                defaultCurrency = _context3.sent;
                                _context3.next = 6;
                                return _account2.default.byAccess(access);

                            case 6:
                                accounts = _context3.sent;
                                _iteratorNormalCompletion4 = true;
                                _didIteratorError4 = false;
                                _iteratorError4 = undefined;
                                _context3.prev = 10;
                                _iterator4 = (0, _getIterator3.default)(accounts);

                            case 12:
                                if (_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done) {
                                    _context3.next = 56;
                                    break;
                                }

                                account = _step4.value;
                                _context3.next = 16;
                                return _alert2.default.byAccountAndType(account.accountNumber, 'balance');

                            case 16:
                                alerts = _context3.sent;

                                if (alerts) {
                                    _context3.next = 19;
                                    break;
                                }

                                return _context3.abrupt('continue', 53);

                            case 19:
                                _context3.next = 21;
                                return account.computeBalance();

                            case 21:
                                balance = _context3.sent;
                                _iteratorNormalCompletion5 = true;
                                _didIteratorError5 = false;
                                _iteratorError5 = undefined;
                                _context3.prev = 25;
                                _iterator5 = (0, _getIterator3.default)(alerts);

                            case 27:
                                if (_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done) {
                                    _context3.next = 39;
                                    break;
                                }

                                alert = _step5.value;

                                if (alert.testBalance(balance)) {
                                    _context3.next = 31;
                                    break;
                                }

                                return _context3.abrupt('continue', 36);

                            case 31:

                                // Set the currency formatter
                                curr = account.currency || defaultCurrency;
                                formatCurrency = _helpers.currency.makeFormat(curr);
                                text = alert.formatAccountMessage(account.title, balance, formatCurrency);
                                _context3.next = 36;
                                return this.send({
                                    subject: (0, _helpers.translate)('server.alert.balance.title'),
                                    text: text
                                });

                            case 36:
                                _iteratorNormalCompletion5 = true;
                                _context3.next = 27;
                                break;

                            case 39:
                                _context3.next = 45;
                                break;

                            case 41:
                                _context3.prev = 41;
                                _context3.t0 = _context3['catch'](25);
                                _didIteratorError5 = true;
                                _iteratorError5 = _context3.t0;

                            case 45:
                                _context3.prev = 45;
                                _context3.prev = 46;

                                if (!_iteratorNormalCompletion5 && _iterator5.return) {
                                    _iterator5.return();
                                }

                            case 48:
                                _context3.prev = 48;

                                if (!_didIteratorError5) {
                                    _context3.next = 51;
                                    break;
                                }

                                throw _iteratorError5;

                            case 51:
                                return _context3.finish(48);

                            case 52:
                                return _context3.finish(45);

                            case 53:
                                _iteratorNormalCompletion4 = true;
                                _context3.next = 12;
                                break;

                            case 56:
                                _context3.next = 62;
                                break;

                            case 58:
                                _context3.prev = 58;
                                _context3.t1 = _context3['catch'](10);
                                _didIteratorError4 = true;
                                _iteratorError4 = _context3.t1;

                            case 62:
                                _context3.prev = 62;
                                _context3.prev = 63;

                                if (!_iteratorNormalCompletion4 && _iterator4.return) {
                                    _iterator4.return();
                                }

                            case 65:
                                _context3.prev = 65;

                                if (!_didIteratorError4) {
                                    _context3.next = 68;
                                    break;
                                }

                                throw _iteratorError4;

                            case 68:
                                return _context3.finish(65);

                            case 69:
                                return _context3.finish(62);

                            case 70:
                                _context3.next = 75;
                                break;

                            case 72:
                                _context3.prev = 72;
                                _context3.t2 = _context3['catch'](0);

                                log.error('Error when checking alerts for accounts: ' + _context3.t2);

                            case 75:
                            case 'end':
                                return _context3.stop();
                        }
                    }
                }, _callee3, this, [[0, 72], [10, 58, 62, 70], [25, 41, 45, 53], [46,, 48, 52], [63,, 65, 69]]);
            }));

            function checkAlertsForAccounts(_x4) {
                return _ref4.apply(this, arguments);
            }

            return checkAlertsForAccounts;
        }()
    }]);
    return AlertManager;
}();

exports.default = new AlertManager();