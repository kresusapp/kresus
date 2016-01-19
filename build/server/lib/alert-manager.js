'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _getIterator2 = require('babel-runtime/core-js/get-iterator');

var _getIterator3 = _interopRequireDefault(_getIterator2);

var _map = require('babel-runtime/core-js/map');

var _map2 = _interopRequireDefault(_map);

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

var _alert2 = require('../models/alert');

var _alert3 = _interopRequireDefault(_alert2);

var _helpers = require('../helpers');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var log = (0, _helpers.makeLogger)('alert-manager');

var AlertManager = function () {
    function AlertManager() {
        (0, _classCallCheck3.default)(this, AlertManager);

        if (process.kresus.standalone) {
            log.warn('report manager not implemented yet in standalone mode');
            return;
        }
    }

    (0, _createClass3.default)(AlertManager, [{
        key: 'checkAlertsForOperations',
        value: function () {
            var ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(operations) {
                var alertsByAccount, _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, operation, alerts, _iteratorNormalCompletion2, _didIteratorError2, _iteratorError2, _iterator2, _step2, alert, content;

                return _regenerator2.default.wrap(function _callee$(_context) {
                    while (1) {
                        switch (_context.prev = _context.next) {
                            case 0:
                                _context.prev = 0;
                                alertsByAccount = new _map2.default();
                                _iteratorNormalCompletion = true;
                                _didIteratorError = false;
                                _iteratorError = undefined;
                                _context.prev = 5;
                                _iterator = (0, _getIterator3.default)(operations);

                            case 7:
                                if (_iteratorNormalCompletion = (_step = _iterator.next()).done) {
                                    _context.next = 51;
                                    break;
                                }

                                operation = _step.value;

                                // Memoize alerts by account
                                alerts = alertsByAccount.get(operation.bankAccount);

                                if (!(typeof alerts === 'undefined')) {
                                    _context.next = 15;
                                    break;
                                }

                                _context.next = 13;
                                return _alert3.default.byAccountAndType(operation.bankAccount, 'transaction');

                            case 13:
                                alerts = _context.sent;

                                alertsByAccount.set(operation.bankAccount, alerts);

                            case 15:
                                if (!(!alerts || !alerts.length)) {
                                    _context.next = 17;
                                    break;
                                }

                                return _context.abrupt('continue', 48);

                            case 17:
                                _iteratorNormalCompletion2 = true;
                                _didIteratorError2 = false;
                                _iteratorError2 = undefined;
                                _context.prev = 20;
                                _iterator2 = (0, _getIterator3.default)(alerts);

                            case 22:
                                if (_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done) {
                                    _context.next = 34;
                                    break;
                                }

                                alert = _step2.value;

                                if (alert.testTransaction(operation)) {
                                    _context.next = 26;
                                    break;
                                }

                                return _context.abrupt('continue', 31);

                            case 26:

                                // Send cozy notification
                                _notifications2.default.send(alert.formatOperationMessage(operation));

                                // Send email notification
                                // TODO i18n
                                content = 'Bonjour cher utilisateur de Kresus,\n\n' + alert.formatOperationMessage(operation) + '\n\nA bientôt pour de nouvelles notifications,\n\nVotre serviteur, Kresus.';
                                _context.next = 30;
                                return _emailer2.default.sendToUser({
                                    subject: 'Kresus - Alerte operation',
                                    content: content
                                });

                            case 30:

                                log.info('Notification sent.');

                            case 31:
                                _iteratorNormalCompletion2 = true;
                                _context.next = 22;
                                break;

                            case 34:
                                _context.next = 40;
                                break;

                            case 36:
                                _context.prev = 36;
                                _context.t0 = _context['catch'](20);
                                _didIteratorError2 = true;
                                _iteratorError2 = _context.t0;

                            case 40:
                                _context.prev = 40;
                                _context.prev = 41;

                                if (!_iteratorNormalCompletion2 && _iterator2.return) {
                                    _iterator2.return();
                                }

                            case 43:
                                _context.prev = 43;

                                if (!_didIteratorError2) {
                                    _context.next = 46;
                                    break;
                                }

                                throw _iteratorError2;

                            case 46:
                                return _context.finish(43);

                            case 47:
                                return _context.finish(40);

                            case 48:
                                _iteratorNormalCompletion = true;
                                _context.next = 7;
                                break;

                            case 51:
                                _context.next = 57;
                                break;

                            case 53:
                                _context.prev = 53;
                                _context.t1 = _context['catch'](5);
                                _didIteratorError = true;
                                _iteratorError = _context.t1;

                            case 57:
                                _context.prev = 57;
                                _context.prev = 58;

                                if (!_iteratorNormalCompletion && _iterator.return) {
                                    _iterator.return();
                                }

                            case 60:
                                _context.prev = 60;

                                if (!_didIteratorError) {
                                    _context.next = 63;
                                    break;
                                }

                                throw _iteratorError;

                            case 63:
                                return _context.finish(60);

                            case 64:
                                return _context.finish(57);

                            case 65:
                                _context.next = 70;
                                break;

                            case 67:
                                _context.prev = 67;
                                _context.t2 = _context['catch'](0);

                                log.error('Error when checking alerts for operations: ' + _context.t2);

                            case 70:
                            case 'end':
                                return _context.stop();
                        }
                    }
                }, _callee, this, [[0, 67], [5, 53, 57, 65], [20, 36, 40, 48], [41,, 43, 47], [58,, 60, 64]]);
            }));
            return function checkAlertsForOperations(_x) {
                return ref.apply(this, arguments);
            };
        }()
    }, {
        key: 'checkAlertsForAccounts',
        value: function () {
            var ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee2() {
                var accounts, _iteratorNormalCompletion3, _didIteratorError3, _iteratorError3, _iterator3, _step3, account, _alerts, balance, _iteratorNormalCompletion4, _didIteratorError4, _iteratorError4, _iterator4, _step4, _alert, message, _content;

                return _regenerator2.default.wrap(function _callee2$(_context2) {
                    while (1) {
                        switch (_context2.prev = _context2.next) {
                            case 0:
                                _context2.prev = 0;
                                _context2.next = 3;
                                return _account2.default.all();

                            case 3:
                                accounts = _context2.sent;
                                _iteratorNormalCompletion3 = true;
                                _didIteratorError3 = false;
                                _iteratorError3 = undefined;
                                _context2.prev = 7;
                                _iterator3 = (0, _getIterator3.default)(accounts);

                            case 9:
                                if (_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done) {
                                    _context2.next = 54;
                                    break;
                                }

                                account = _step3.value;
                                _context2.next = 13;
                                return _alert3.default.byAccountAndType(account.accountNumber, 'balance');

                            case 13:
                                _alerts = _context2.sent;

                                if (_alerts) {
                                    _context2.next = 16;
                                    break;
                                }

                                return _context2.abrupt('continue', 51);

                            case 16:
                                _context2.next = 18;
                                return account.computeBalance();

                            case 18:
                                balance = _context2.sent;
                                _iteratorNormalCompletion4 = true;
                                _didIteratorError4 = false;
                                _iteratorError4 = undefined;
                                _context2.prev = 22;
                                _iterator4 = (0, _getIterator3.default)(_alerts);

                            case 24:
                                if (_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done) {
                                    _context2.next = 37;
                                    break;
                                }

                                _alert = _step4.value;

                                if (_alert.testBalance(balance)) {
                                    _context2.next = 28;
                                    break;
                                }

                                return _context2.abrupt('continue', 34);

                            case 28:

                                // Cozy notification
                                message = _alert.formatAccountMessage(account.title, balance);

                                _notifications2.default.send(message);

                                // Send email notification
                                // TODO i18n
                                _content = 'Bonjour cher utilisateur de Kresus,\n\n' + _alert.formatAccountMessage(account.title, balance) + '\n\nA bientôt pour de nouvelles notifications,\n\nVotre serviteur, Kresus.';
                                _context2.next = 33;
                                return _emailer2.default.sendToUser({
                                    subject: 'Kresus - Alerte balance de compte',
                                    content: _content
                                });

                            case 33:

                                log.info('Notification sent.');

                            case 34:
                                _iteratorNormalCompletion4 = true;
                                _context2.next = 24;
                                break;

                            case 37:
                                _context2.next = 43;
                                break;

                            case 39:
                                _context2.prev = 39;
                                _context2.t0 = _context2['catch'](22);
                                _didIteratorError4 = true;
                                _iteratorError4 = _context2.t0;

                            case 43:
                                _context2.prev = 43;
                                _context2.prev = 44;

                                if (!_iteratorNormalCompletion4 && _iterator4.return) {
                                    _iterator4.return();
                                }

                            case 46:
                                _context2.prev = 46;

                                if (!_didIteratorError4) {
                                    _context2.next = 49;
                                    break;
                                }

                                throw _iteratorError4;

                            case 49:
                                return _context2.finish(46);

                            case 50:
                                return _context2.finish(43);

                            case 51:
                                _iteratorNormalCompletion3 = true;
                                _context2.next = 9;
                                break;

                            case 54:
                                _context2.next = 60;
                                break;

                            case 56:
                                _context2.prev = 56;
                                _context2.t1 = _context2['catch'](7);
                                _didIteratorError3 = true;
                                _iteratorError3 = _context2.t1;

                            case 60:
                                _context2.prev = 60;
                                _context2.prev = 61;

                                if (!_iteratorNormalCompletion3 && _iterator3.return) {
                                    _iterator3.return();
                                }

                            case 63:
                                _context2.prev = 63;

                                if (!_didIteratorError3) {
                                    _context2.next = 66;
                                    break;
                                }

                                throw _iteratorError3;

                            case 66:
                                return _context2.finish(63);

                            case 67:
                                return _context2.finish(60);

                            case 68:
                                _context2.next = 73;
                                break;

                            case 70:
                                _context2.prev = 70;
                                _context2.t2 = _context2['catch'](0);

                                log.error('Error when checking alerts for accounts: ' + _context2.t2);

                            case 73:
                            case 'end':
                                return _context2.stop();
                        }
                    }
                }, _callee2, this, [[0, 70], [7, 56, 60, 68], [22, 39, 43, 51], [44,, 46, 50], [61,, 63, 67]]);
            }));
            return function checkAlertsForAccounts() {
                return ref.apply(this, arguments);
            };
        }()
    }]);
    return AlertManager;
}();

exports.default = new AlertManager();