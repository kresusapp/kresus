'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

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

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

var _helpers = require('../helpers');

var _emailer = require('./emailer');

var _emailer2 = _interopRequireDefault(_emailer);

var _account = require('../models/account');

var _account2 = _interopRequireDefault(_account);

var _alert = require('../models/alert');

var _alert2 = _interopRequireDefault(_alert);

var _operation = require('../models/operation');

var _operation2 = _interopRequireDefault(_operation);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var log = (0, _helpers.makeLogger)('report-manager');

var ReportManager = function () {
    function ReportManager() {
        (0, _classCallCheck3.default)(this, ReportManager);
    }

    (0, _createClass3.default)(ReportManager, [{
        key: 'manageReports',
        value: function () {
            var ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee() {
                var now;
                return _regenerator2.default.wrap(function _callee$(_context) {
                    while (1) {
                        switch (_context.prev = _context.next) {
                            case 0:
                                _context.prev = 0;
                                now = (0, _moment2.default)();
                                _context.next = 4;
                                return this.prepareReport('daily');

                            case 4:
                                if (!(now.day() === 1)) {
                                    _context.next = 7;
                                    break;
                                }

                                _context.next = 7;
                                return this.prepareReport('weekly');

                            case 7:
                                if (!(now.date() === 1)) {
                                    _context.next = 10;
                                    break;
                                }

                                _context.next = 10;
                                return this.prepareReport('monthly');

                            case 10:
                                _context.next = 15;
                                break;

                            case 12:
                                _context.prev = 12;
                                _context.t0 = _context['catch'](0);

                                log.warn('Error when preparing reports: ' + _context.t0 + '\n' + _context.t0.stack);

                            case 15:
                            case 'end':
                                return _context.stop();
                        }
                    }
                }, _callee, this, [[0, 12]]);
            }));

            function manageReports() {
                return ref.apply(this, arguments);
            }

            return manageReports;
        }()
    }, {
        key: 'prepareReport',
        value: function () {
            var ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee2(frequency) {
                var alerts, includedAccounts, accounts, operationsByAccount, _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, a, operations, timeFrame, count, _iteratorNormalCompletion2, _didIteratorError2, _iteratorError2, _iterator2, _step2, operation, account, date, _ref, subject, content;

                return _regenerator2.default.wrap(function _callee2$(_context2) {
                    while (1) {
                        switch (_context2.prev = _context2.next) {
                            case 0:
                                log.info('Checking if user has enabled ' + frequency + ' report...');
                                _context2.next = 3;
                                return _alert2.default.reportsByFrequency(frequency);

                            case 3:
                                alerts = _context2.sent;

                                if (!(!alerts || !alerts.length)) {
                                    _context2.next = 6;
                                    break;
                                }

                                return _context2.abrupt('return', log.info('User hasn\'t enabled ' + frequency + ' report.'));

                            case 6:

                                log.info('Report enabled, generating it...');
                                includedAccounts = alerts.map(function (alert) {
                                    return alert.bankAccount;
                                });
                                _context2.next = 10;
                                return _account2.default.findMany(includedAccounts);

                            case 10:
                                accounts = _context2.sent;

                                if (!(!accounts || !accounts.length)) {
                                    _context2.next = 13;
                                    break;
                                }

                                throw new _helpers.KError("alert's account does not exist");

                            case 13:
                                operationsByAccount = new _map2.default();
                                _iteratorNormalCompletion = true;
                                _didIteratorError = false;
                                _iteratorError = undefined;
                                _context2.prev = 17;

                                for (_iterator = (0, _getIterator3.default)(accounts); !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                                    a = _step.value;

                                    operationsByAccount.set(a.accountNumber, { account: a, operations: [] });
                                }

                                _context2.next = 25;
                                break;

                            case 21:
                                _context2.prev = 21;
                                _context2.t0 = _context2['catch'](17);
                                _didIteratorError = true;
                                _iteratorError = _context2.t0;

                            case 25:
                                _context2.prev = 25;
                                _context2.prev = 26;

                                if (!_iteratorNormalCompletion && _iterator.return) {
                                    _iterator.return();
                                }

                            case 28:
                                _context2.prev = 28;

                                if (!_didIteratorError) {
                                    _context2.next = 31;
                                    break;
                                }

                                throw _iteratorError;

                            case 31:
                                return _context2.finish(28);

                            case 32:
                                return _context2.finish(25);

                            case 33:
                                _context2.next = 35;
                                return _operation2.default.byAccounts(includedAccounts);

                            case 35:
                                operations = _context2.sent;
                                timeFrame = this.getTimeFrame(frequency);
                                count = 0;
                                _iteratorNormalCompletion2 = true;
                                _didIteratorError2 = false;
                                _iteratorError2 = undefined;
                                _context2.prev = 41;
                                _iterator2 = (0, _getIterator3.default)(operations);

                            case 43:
                                if (_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done) {
                                    _context2.next = 55;
                                    break;
                                }

                                operation = _step2.value;
                                account = operation.bankAccount;
                                date = operation.dateImport || operation.date;

                                if (!(0, _moment2.default)(date).isAfter(timeFrame)) {
                                    _context2.next = 52;
                                    break;
                                }

                                if (operationsByAccount.has(account)) {
                                    _context2.next = 50;
                                    break;
                                }

                                throw new _helpers.KError("operation's account does not exist");

                            case 50:
                                operationsByAccount.get(account).operations.push(operation);
                                ++count;

                            case 52:
                                _iteratorNormalCompletion2 = true;
                                _context2.next = 43;
                                break;

                            case 55:
                                _context2.next = 61;
                                break;

                            case 57:
                                _context2.prev = 57;
                                _context2.t1 = _context2['catch'](41);
                                _didIteratorError2 = true;
                                _iteratorError2 = _context2.t1;

                            case 61:
                                _context2.prev = 61;
                                _context2.prev = 62;

                                if (!_iteratorNormalCompletion2 && _iterator2.return) {
                                    _iterator2.return();
                                }

                            case 64:
                                _context2.prev = 64;

                                if (!_didIteratorError2) {
                                    _context2.next = 67;
                                    break;
                                }

                                throw _iteratorError2;

                            case 67:
                                return _context2.finish(64);

                            case 68:
                                return _context2.finish(61);

                            case 69:
                                if (count) {
                                    _context2.next = 71;
                                    break;
                                }

                                return _context2.abrupt('return', log.info('no operations to show in the report.'));

                            case 71:
                                _context2.next = 73;
                                return this.getTextContent(accounts, operationsByAccount, frequency);

                            case 73:
                                _ref = _context2.sent;
                                subject = _ref.subject;
                                content = _ref.content;
                                _context2.next = 78;
                                return this.sendReport(subject, content);

                            case 78:
                            case 'end':
                                return _context2.stop();
                        }
                    }
                }, _callee2, this, [[17, 21, 25, 33], [26,, 28, 32], [41, 57, 61, 69], [62,, 64, 68]]);
            }));

            function prepareReport(_x) {
                return ref.apply(this, arguments);
            }

            return prepareReport;
        }()
    }, {
        key: 'sendReport',
        value: function () {
            var ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee3(subject, content) {
                return _regenerator2.default.wrap(function _callee3$(_context3) {
                    while (1) {
                        switch (_context3.prev = _context3.next) {
                            case 0:
                                _context3.next = 2;
                                return _emailer2.default.sendToUser({
                                    subject: subject,
                                    content: content
                                });

                            case 2:
                                log.info('Report sent.');

                            case 3:
                            case 'end':
                                return _context3.stop();
                        }
                    }
                }, _callee3, this);
            }));

            function sendReport(_x2, _x3) {
                return ref.apply(this, arguments);
            }

            return sendReport;
        }()
    }, {
        key: 'getTextContent',
        value: function () {
            var ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee4(accounts, operationsByAccount, frequency) {
                var subject, today, content, _iteratorNormalCompletion3, _didIteratorError3, _iteratorError3, _iterator3, _step3, account, lastCheck, balance, _iteratorNormalCompletion4, _didIteratorError4, _iteratorError4, _iterator4, _step4, pair, operations, _iteratorNormalCompletion5, _didIteratorError5, _iteratorError5, _iterator5, _step5, op, date;

                return _regenerator2.default.wrap(function _callee4$(_context4) {
                    while (1) {
                        switch (_context4.prev = _context4.next) {
                            case 0:
                                subject = void 0;
                                _context4.t0 = frequency;
                                _context4.next = _context4.t0 === 'daily' ? 4 : _context4.t0 === 'weekly' ? 6 : _context4.t0 === 'monthly' ? 8 : 10;
                                break;

                            case 4:
                                subject = (0, _helpers.translate)('server.email.report.daily');return _context4.abrupt('break', 11);

                            case 6:
                                subject = (0, _helpers.translate)('server.email.report.weekly');return _context4.abrupt('break', 11);

                            case 8:
                                subject = (0, _helpers.translate)('server.email.report.monthly');return _context4.abrupt('break', 11);

                            case 10:
                                log.error('unexpected frequency in getTextContent');

                            case 11:

                                subject = (0, _helpers.translate)('server.email.report.subject', { frequency: frequency });
                                subject = 'Kresus - ' + subject;

                                today = (0, _moment2.default)().format('DD/MM/YYYY');
                                content = void 0;


                                content = (0, _helpers.translate)('server.email.hello');
                                content += '\n\n';
                                content += (0, _helpers.translate)('server.email.report.pre', { today: today });
                                content += '\n';

                                _iteratorNormalCompletion3 = true;
                                _didIteratorError3 = false;
                                _iteratorError3 = undefined;
                                _context4.prev = 22;
                                _iterator3 = (0, _getIterator3.default)(accounts);

                            case 24:
                                if (_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done) {
                                    _context4.next = 36;
                                    break;
                                }

                                account = _step3.value;
                                lastCheck = (0, _moment2.default)(account.lastCheck).format('DD/MM/YYYY');
                                _context4.next = 29;
                                return account.computeBalance();

                            case 29:
                                balance = _context4.sent;

                                content += '\t* ' + account.title + ' : ' + balance + '€ (';
                                content += (0, _helpers.translate)('server.email.report.last_sync');
                                content += ' ' + lastCheck + ')\n';

                            case 33:
                                _iteratorNormalCompletion3 = true;
                                _context4.next = 24;
                                break;

                            case 36:
                                _context4.next = 42;
                                break;

                            case 38:
                                _context4.prev = 38;
                                _context4.t1 = _context4['catch'](22);
                                _didIteratorError3 = true;
                                _iteratorError3 = _context4.t1;

                            case 42:
                                _context4.prev = 42;
                                _context4.prev = 43;

                                if (!_iteratorNormalCompletion3 && _iterator3.return) {
                                    _iterator3.return();
                                }

                            case 45:
                                _context4.prev = 45;

                                if (!_didIteratorError3) {
                                    _context4.next = 48;
                                    break;
                                }

                                throw _iteratorError3;

                            case 48:
                                return _context4.finish(45);

                            case 49:
                                return _context4.finish(42);

                            case 50:
                                if (!(0, _keys2.default)(operationsByAccount).length) {
                                    _context4.next = 101;
                                    break;
                                }

                                content += '\n';
                                content += (0, _helpers.translate)('server.email.report.new_operations');
                                content += '\n';
                                _iteratorNormalCompletion4 = true;
                                _didIteratorError4 = false;
                                _iteratorError4 = undefined;
                                _context4.prev = 57;
                                _iterator4 = (0, _getIterator3.default)(operationsByAccount.values());

                            case 59:
                                if (_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done) {
                                    _context4.next = 85;
                                    break;
                                }

                                pair = _step4.value;


                                // Sort operations by date or import date
                                operations = pair.operations.sort(function (a, b) {
                                    var ad = a.date || a.dateImport;
                                    var bd = b.date || b.dateImport;
                                    if (ad < bd) return -1;
                                    if (ad === bd) return 0;
                                    return 1;
                                });


                                content += '\n' + pair.account.title + ':\n';
                                _iteratorNormalCompletion5 = true;
                                _didIteratorError5 = false;
                                _iteratorError5 = undefined;
                                _context4.prev = 66;
                                for (_iterator5 = (0, _getIterator3.default)(operations); !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
                                    op = _step5.value;
                                    date = (0, _moment2.default)(op.date).format('DD/MM/YYYY');

                                    content += '\t* ' + date + ' - ' + op.title + ' : ' + op.amount + '€\n';
                                }
                                _context4.next = 74;
                                break;

                            case 70:
                                _context4.prev = 70;
                                _context4.t2 = _context4['catch'](66);
                                _didIteratorError5 = true;
                                _iteratorError5 = _context4.t2;

                            case 74:
                                _context4.prev = 74;
                                _context4.prev = 75;

                                if (!_iteratorNormalCompletion5 && _iterator5.return) {
                                    _iterator5.return();
                                }

                            case 77:
                                _context4.prev = 77;

                                if (!_didIteratorError5) {
                                    _context4.next = 80;
                                    break;
                                }

                                throw _iteratorError5;

                            case 80:
                                return _context4.finish(77);

                            case 81:
                                return _context4.finish(74);

                            case 82:
                                _iteratorNormalCompletion4 = true;
                                _context4.next = 59;
                                break;

                            case 85:
                                _context4.next = 91;
                                break;

                            case 87:
                                _context4.prev = 87;
                                _context4.t3 = _context4['catch'](57);
                                _didIteratorError4 = true;
                                _iteratorError4 = _context4.t3;

                            case 91:
                                _context4.prev = 91;
                                _context4.prev = 92;

                                if (!_iteratorNormalCompletion4 && _iterator4.return) {
                                    _iterator4.return();
                                }

                            case 94:
                                _context4.prev = 94;

                                if (!_didIteratorError4) {
                                    _context4.next = 97;
                                    break;
                                }

                                throw _iteratorError4;

                            case 97:
                                return _context4.finish(94);

                            case 98:
                                return _context4.finish(91);

                            case 99:
                                _context4.next = 102;
                                break;

                            case 101:
                                content += (0, _helpers.translate)('server.email.report.no_new_operations');

                            case 102:

                                content += '\n';
                                content += (0, _helpers.translate)('server.email.seeyoulater.report');
                                content += '\n\n';
                                content += (0, _helpers.translate)('server.email.signature');

                                return _context4.abrupt('return', { subject: subject, content: content });

                            case 107:
                            case 'end':
                                return _context4.stop();
                        }
                    }
                }, _callee4, this, [[22, 38, 42, 50], [43,, 45, 49], [57, 87, 91, 99], [66, 70, 74, 82], [75,, 77, 81], [92,, 94, 98]]);
            }));

            function getTextContent(_x4, _x5, _x6) {
                return ref.apply(this, arguments);
            }

            return getTextContent;
        }()
    }, {
        key: 'getTimeFrame',
        value: function getTimeFrame(frequency) {
            var timeFrame = (0, _moment2.default)().hours(0).minutes(0).seconds(0);
            switch (frequency) {
                case 'daily':
                    return timeFrame.subtract(1, 'days');
                case 'weekly':
                    return timeFrame.subtract(7, 'days');
                case 'monthly':
                    return timeFrame.subtract(1, 'months').days(0);
                default:
                    break;
            }
            log.error('unexpected timeframe in report-manager');
        }
    }]);
    return ReportManager;
}();

exports.default = new ReportManager();