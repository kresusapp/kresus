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

var _helpers = require('../helpers');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var log = (0, _helpers.makeLogger)('alert-manager');

var AlertManager = function () {
    function AlertManager() {
        (0, _classCallCheck3.default)(this, AlertManager);

        if (process.kresus.standalone) {
            log.warn('report manager not implemented yet in standalone mode');
        }
    }

    (0, _createClass3.default)(AlertManager, [{
        key: 'wrapContent',
        value: function wrapContent(content) {
            return (0, _helpers.translate)('server.email.hello') + '\n\n' + content + '\n\n' + (0, _helpers.translate)('server.email.seeyoulater.notifications') + ',\n' + (0, _helpers.translate)('server.email.signature') + '\n';
        }
    }, {
        key: 'send',
        value: function () {
            var ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(_ref) {
                var subject = _ref.subject;
                var text = _ref.text;
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
                return ref.apply(this, arguments);
            }

            return send;
        }()
    }, {
        key: 'checkAlertsForOperations',
        value: function () {
            var ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee2(operations) {
                var accounts, accountNames, _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, a, alertsByAccount, _iteratorNormalCompletion2, _didIteratorError2, _iteratorError2, _iterator2, _step2, operation, alerts, accountName, _iteratorNormalCompletion3, _didIteratorError3, _iteratorError3, _iterator3, _step3, alert, text;

                return _regenerator2.default.wrap(function _callee2$(_context2) {
                    while (1) {
                        switch (_context2.prev = _context2.next) {
                            case 0:
                                _context2.prev = 0;
                                _context2.next = 3;
                                return _account2.default.all();

                            case 3:
                                accounts = _context2.sent;
                                accountNames = new _map2.default();
                                _iteratorNormalCompletion = true;
                                _didIteratorError = false;
                                _iteratorError = undefined;
                                _context2.prev = 8;

                                for (_iterator = (0, _getIterator3.default)(accounts); !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                                    a = _step.value;

                                    accountNames.set(a.accountNumber, a.title);
                                }

                                // Map accounts to alerts
                                _context2.next = 16;
                                break;

                            case 12:
                                _context2.prev = 12;
                                _context2.t0 = _context2['catch'](8);
                                _didIteratorError = true;
                                _iteratorError = _context2.t0;

                            case 16:
                                _context2.prev = 16;
                                _context2.prev = 17;

                                if (!_iteratorNormalCompletion && _iterator.return) {
                                    _iterator.return();
                                }

                            case 19:
                                _context2.prev = 19;

                                if (!_didIteratorError) {
                                    _context2.next = 22;
                                    break;
                                }

                                throw _iteratorError;

                            case 22:
                                return _context2.finish(19);

                            case 23:
                                return _context2.finish(16);

                            case 24:
                                alertsByAccount = new _map2.default();
                                _iteratorNormalCompletion2 = true;
                                _didIteratorError2 = false;
                                _iteratorError2 = undefined;
                                _context2.prev = 28;
                                _iterator2 = (0, _getIterator3.default)(operations);

                            case 30:
                                if (_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done) {
                                    _context2.next = 76;
                                    break;
                                }

                                operation = _step2.value;


                                // Memoize alerts by account
                                alerts = void 0;

                                if (alertsByAccount.has(operation.bankAccount)) {
                                    _context2.next = 40;
                                    break;
                                }

                                _context2.next = 36;
                                return _alert2.default.byAccountAndType(operation.bankAccount, 'transaction');

                            case 36:
                                alerts = _context2.sent;

                                alertsByAccount.set(operation.bankAccount, alerts);
                                _context2.next = 41;
                                break;

                            case 40:
                                alerts = alertsByAccount.get(operation.bankAccount);

                            case 41:
                                if (!(!alerts || !alerts.length)) {
                                    _context2.next = 43;
                                    break;
                                }

                                return _context2.abrupt('continue', 73);

                            case 43:
                                accountName = accountNames.get(operation.bankAccount);
                                _iteratorNormalCompletion3 = true;
                                _didIteratorError3 = false;
                                _iteratorError3 = undefined;
                                _context2.prev = 47;
                                _iterator3 = (0, _getIterator3.default)(alerts);

                            case 49:
                                if (_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done) {
                                    _context2.next = 59;
                                    break;
                                }

                                alert = _step3.value;

                                if (alert.testTransaction(operation)) {
                                    _context2.next = 53;
                                    break;
                                }

                                return _context2.abrupt('continue', 56);

                            case 53:
                                text = alert.formatOperationMessage(operation, accountName);
                                _context2.next = 56;
                                return this.send({
                                    subject: (0, _helpers.translate)('server.alert.operation.title'),
                                    text: text
                                });

                            case 56:
                                _iteratorNormalCompletion3 = true;
                                _context2.next = 49;
                                break;

                            case 59:
                                _context2.next = 65;
                                break;

                            case 61:
                                _context2.prev = 61;
                                _context2.t1 = _context2['catch'](47);
                                _didIteratorError3 = true;
                                _iteratorError3 = _context2.t1;

                            case 65:
                                _context2.prev = 65;
                                _context2.prev = 66;

                                if (!_iteratorNormalCompletion3 && _iterator3.return) {
                                    _iterator3.return();
                                }

                            case 68:
                                _context2.prev = 68;

                                if (!_didIteratorError3) {
                                    _context2.next = 71;
                                    break;
                                }

                                throw _iteratorError3;

                            case 71:
                                return _context2.finish(68);

                            case 72:
                                return _context2.finish(65);

                            case 73:
                                _iteratorNormalCompletion2 = true;
                                _context2.next = 30;
                                break;

                            case 76:
                                _context2.next = 82;
                                break;

                            case 78:
                                _context2.prev = 78;
                                _context2.t2 = _context2['catch'](28);
                                _didIteratorError2 = true;
                                _iteratorError2 = _context2.t2;

                            case 82:
                                _context2.prev = 82;
                                _context2.prev = 83;

                                if (!_iteratorNormalCompletion2 && _iterator2.return) {
                                    _iterator2.return();
                                }

                            case 85:
                                _context2.prev = 85;

                                if (!_didIteratorError2) {
                                    _context2.next = 88;
                                    break;
                                }

                                throw _iteratorError2;

                            case 88:
                                return _context2.finish(85);

                            case 89:
                                return _context2.finish(82);

                            case 90:
                                _context2.next = 95;
                                break;

                            case 92:
                                _context2.prev = 92;
                                _context2.t3 = _context2['catch'](0);

                                log.error('Error when checking alerts for operations: ' + _context2.t3);

                            case 95:
                            case 'end':
                                return _context2.stop();
                        }
                    }
                }, _callee2, this, [[0, 92], [8, 12, 16, 24], [17,, 19, 23], [28, 78, 82, 90], [47, 61, 65, 73], [66,, 68, 72], [83,, 85, 89]]);
            }));

            function checkAlertsForOperations(_x2) {
                return ref.apply(this, arguments);
            }

            return checkAlertsForOperations;
        }()
    }, {
        key: 'checkAlertsForAccounts',
        value: function () {
            var ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee3() {
                var accounts, _iteratorNormalCompletion4, _didIteratorError4, _iteratorError4, _iterator4, _step4, account, alerts, balance, _iteratorNormalCompletion5, _didIteratorError5, _iteratorError5, _iterator5, _step5, alert, text;

                return _regenerator2.default.wrap(function _callee3$(_context3) {
                    while (1) {
                        switch (_context3.prev = _context3.next) {
                            case 0:
                                _context3.prev = 0;
                                _context3.next = 3;
                                return _account2.default.all();

                            case 3:
                                accounts = _context3.sent;
                                _iteratorNormalCompletion4 = true;
                                _didIteratorError4 = false;
                                _iteratorError4 = undefined;
                                _context3.prev = 7;
                                _iterator4 = (0, _getIterator3.default)(accounts);

                            case 9:
                                if (_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done) {
                                    _context3.next = 51;
                                    break;
                                }

                                account = _step4.value;
                                _context3.next = 13;
                                return _alert2.default.byAccountAndType(account.accountNumber, 'balance');

                            case 13:
                                alerts = _context3.sent;

                                if (alerts) {
                                    _context3.next = 16;
                                    break;
                                }

                                return _context3.abrupt('continue', 48);

                            case 16:
                                _context3.next = 18;
                                return account.computeBalance();

                            case 18:
                                balance = _context3.sent;
                                _iteratorNormalCompletion5 = true;
                                _didIteratorError5 = false;
                                _iteratorError5 = undefined;
                                _context3.prev = 22;
                                _iterator5 = (0, _getIterator3.default)(alerts);

                            case 24:
                                if (_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done) {
                                    _context3.next = 34;
                                    break;
                                }

                                alert = _step5.value;

                                if (alert.testBalance(balance)) {
                                    _context3.next = 28;
                                    break;
                                }

                                return _context3.abrupt('continue', 31);

                            case 28:
                                text = alert.formatAccountMessage(account.title, balance);
                                _context3.next = 31;
                                return this.send({
                                    subject: (0, _helpers.translate)('server.alert.balance.title'),
                                    text: text
                                });

                            case 31:
                                _iteratorNormalCompletion5 = true;
                                _context3.next = 24;
                                break;

                            case 34:
                                _context3.next = 40;
                                break;

                            case 36:
                                _context3.prev = 36;
                                _context3.t0 = _context3['catch'](22);
                                _didIteratorError5 = true;
                                _iteratorError5 = _context3.t0;

                            case 40:
                                _context3.prev = 40;
                                _context3.prev = 41;

                                if (!_iteratorNormalCompletion5 && _iterator5.return) {
                                    _iterator5.return();
                                }

                            case 43:
                                _context3.prev = 43;

                                if (!_didIteratorError5) {
                                    _context3.next = 46;
                                    break;
                                }

                                throw _iteratorError5;

                            case 46:
                                return _context3.finish(43);

                            case 47:
                                return _context3.finish(40);

                            case 48:
                                _iteratorNormalCompletion4 = true;
                                _context3.next = 9;
                                break;

                            case 51:
                                _context3.next = 57;
                                break;

                            case 53:
                                _context3.prev = 53;
                                _context3.t1 = _context3['catch'](7);
                                _didIteratorError4 = true;
                                _iteratorError4 = _context3.t1;

                            case 57:
                                _context3.prev = 57;
                                _context3.prev = 58;

                                if (!_iteratorNormalCompletion4 && _iterator4.return) {
                                    _iterator4.return();
                                }

                            case 60:
                                _context3.prev = 60;

                                if (!_didIteratorError4) {
                                    _context3.next = 63;
                                    break;
                                }

                                throw _iteratorError4;

                            case 63:
                                return _context3.finish(60);

                            case 64:
                                return _context3.finish(57);

                            case 65:
                                _context3.next = 70;
                                break;

                            case 67:
                                _context3.prev = 67;
                                _context3.t2 = _context3['catch'](0);

                                log.error('Error when checking alerts for accounts: ' + _context3.t2);

                            case 70:
                            case 'end':
                                return _context3.stop();
                        }
                    }
                }, _callee3, this, [[0, 67], [7, 53, 57, 65], [22, 36, 40, 48], [41,, 43, 47], [58,, 60, 64]]);
            }));

            function checkAlertsForAccounts() {
                return ref.apply(this, arguments);
            }

            return checkAlertsForAccounts;
        }()
    }]);
    return AlertManager;
}();

exports.default = new AlertManager();