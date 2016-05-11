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

var _config = require('../models/config');

var _config2 = _interopRequireDefault(_config);

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
            var ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee2(frequencyKey) {
                var alerts, includedAccounts, accounts, defaultCurrency, operationsByAccount, _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, a, curr, operations, timeFrame, count, _iteratorNormalCompletion2, _didIteratorError2, _iteratorError2, _iterator2, _step2, operation, account, date, _ref, subject, content;

                return _regenerator2.default.wrap(function _callee2$(_context2) {
                    while (1) {
                        switch (_context2.prev = _context2.next) {
                            case 0:
                                log.info('Checking if user has enabled ' + frequencyKey + ' report...');
                                _context2.next = 3;
                                return _alert2.default.reportsByFrequency(frequencyKey);

                            case 3:
                                alerts = _context2.sent;

                                if (!(!alerts || !alerts.length)) {
                                    _context2.next = 6;
                                    break;
                                }

                                return _context2.abrupt('return', log.info('User hasn\'t enabled ' + frequencyKey + ' report.'));

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
                                _context2.next = 15;
                                return _config2.default.byName('defaultCurrency').value;

                            case 15:
                                defaultCurrency = _context2.sent;
                                operationsByAccount = new _map2.default();
                                _iteratorNormalCompletion = true;
                                _didIteratorError = false;
                                _iteratorError = undefined;
                                _context2.prev = 20;

                                for (_iterator = (0, _getIterator3.default)(accounts); !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                                    a = _step.value;

                                    // We get the currency for this account, to format amounts correctly
                                    curr = a.currency ? a.currency : defaultCurrency;

                                    a.formatCurrency = _helpers.currency.makeFormat(curr);
                                    operationsByAccount.set(a.accountNumber, { account: a, operations: [] });
                                }

                                _context2.next = 28;
                                break;

                            case 24:
                                _context2.prev = 24;
                                _context2.t0 = _context2['catch'](20);
                                _didIteratorError = true;
                                _iteratorError = _context2.t0;

                            case 28:
                                _context2.prev = 28;
                                _context2.prev = 29;

                                if (!_iteratorNormalCompletion && _iterator.return) {
                                    _iterator.return();
                                }

                            case 31:
                                _context2.prev = 31;

                                if (!_didIteratorError) {
                                    _context2.next = 34;
                                    break;
                                }

                                throw _iteratorError;

                            case 34:
                                return _context2.finish(31);

                            case 35:
                                return _context2.finish(28);

                            case 36:
                                _context2.next = 38;
                                return _operation2.default.byAccounts(includedAccounts);

                            case 38:
                                operations = _context2.sent;
                                timeFrame = this.getTimeFrame(frequencyKey);
                                count = 0;
                                _iteratorNormalCompletion2 = true;
                                _didIteratorError2 = false;
                                _iteratorError2 = undefined;
                                _context2.prev = 44;
                                _iterator2 = (0, _getIterator3.default)(operations);

                            case 46:
                                if (_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done) {
                                    _context2.next = 58;
                                    break;
                                }

                                operation = _step2.value;
                                account = operation.bankAccount;
                                date = operation.dateImport || operation.date;

                                if (!(0, _moment2.default)(date).isAfter(timeFrame)) {
                                    _context2.next = 55;
                                    break;
                                }

                                if (operationsByAccount.has(account)) {
                                    _context2.next = 53;
                                    break;
                                }

                                throw new _helpers.KError("operation's account does not exist");

                            case 53:
                                operationsByAccount.get(account).operations.push(operation);
                                ++count;

                            case 55:
                                _iteratorNormalCompletion2 = true;
                                _context2.next = 46;
                                break;

                            case 58:
                                _context2.next = 64;
                                break;

                            case 60:
                                _context2.prev = 60;
                                _context2.t1 = _context2['catch'](44);
                                _didIteratorError2 = true;
                                _iteratorError2 = _context2.t1;

                            case 64:
                                _context2.prev = 64;
                                _context2.prev = 65;

                                if (!_iteratorNormalCompletion2 && _iterator2.return) {
                                    _iterator2.return();
                                }

                            case 67:
                                _context2.prev = 67;

                                if (!_didIteratorError2) {
                                    _context2.next = 70;
                                    break;
                                }

                                throw _iteratorError2;

                            case 70:
                                return _context2.finish(67);

                            case 71:
                                return _context2.finish(64);

                            case 72:
                                if (count) {
                                    _context2.next = 74;
                                    break;
                                }

                                return _context2.abrupt('return', log.info('no operations to show in the report.'));

                            case 74:
                                _context2.next = 76;
                                return this.getTextContent(accounts, operationsByAccount, frequencyKey);

                            case 76:
                                _ref = _context2.sent;
                                subject = _ref.subject;
                                content = _ref.content;
                                _context2.next = 81;
                                return this.sendReport(subject, content);

                            case 81:
                            case 'end':
                                return _context2.stop();
                        }
                    }
                }, _callee2, this, [[20, 24, 28, 36], [29,, 31, 35], [44, 60, 64, 72], [65,, 67, 71]]);
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
            var ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee4(accounts, operationsByAccount, frequencyKey) {
                var frequency, subject, today, content, _iteratorNormalCompletion3, _didIteratorError3, _iteratorError3, _iterator3, _step3, account, lastCheck, balance, _iteratorNormalCompletion4, _didIteratorError4, _iteratorError4, _iterator4, _step4, pair, operations, _iteratorNormalCompletion5, _didIteratorError5, _iteratorError5, _iterator5, _step5, op, date;

                return _regenerator2.default.wrap(function _callee4$(_context4) {
                    while (1) {
                        switch (_context4.prev = _context4.next) {
                            case 0:
                                frequency = void 0;
                                _context4.t0 = frequencyKey;
                                _context4.next = _context4.t0 === 'daily' ? 4 : _context4.t0 === 'weekly' ? 6 : _context4.t0 === 'monthly' ? 8 : 10;
                                break;

                            case 4:
                                frequency = (0, _helpers.translate)('server.email.report.daily');
                                return _context4.abrupt('break', 11);

                            case 6:
                                frequency = (0, _helpers.translate)('server.email.report.weekly');
                                return _context4.abrupt('break', 11);

                            case 8:
                                frequency = (0, _helpers.translate)('server.email.report.monthly');
                                return _context4.abrupt('break', 11);

                            case 10:
                                log.error('unexpected frequency in getTextContent');

                            case 11:
                                subject = void 0;

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
                                _context4.prev = 23;
                                _iterator3 = (0, _getIterator3.default)(accounts);

                            case 25:
                                if (_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done) {
                                    _context4.next = 38;
                                    break;
                                }

                                account = _step3.value;
                                lastCheck = (0, _moment2.default)(account.lastCheck).format('DD/MM/YYYY');
                                _context4.next = 30;
                                return account.computeBalance();

                            case 30:
                                balance = _context4.sent;

                                content += '\t* ' + account.title + ' : ';
                                content += account.formatCurrency(balance) + ' (';
                                content += (0, _helpers.translate)('server.email.report.last_sync');
                                content += ' ' + lastCheck + ')\n';

                            case 35:
                                _iteratorNormalCompletion3 = true;
                                _context4.next = 25;
                                break;

                            case 38:
                                _context4.next = 44;
                                break;

                            case 40:
                                _context4.prev = 40;
                                _context4.t1 = _context4['catch'](23);
                                _didIteratorError3 = true;
                                _iteratorError3 = _context4.t1;

                            case 44:
                                _context4.prev = 44;
                                _context4.prev = 45;

                                if (!_iteratorNormalCompletion3 && _iterator3.return) {
                                    _iterator3.return();
                                }

                            case 47:
                                _context4.prev = 47;

                                if (!_didIteratorError3) {
                                    _context4.next = 50;
                                    break;
                                }

                                throw _iteratorError3;

                            case 50:
                                return _context4.finish(47);

                            case 51:
                                return _context4.finish(44);

                            case 52:
                                if (!(0, _keys2.default)(operationsByAccount).length) {
                                    _context4.next = 103;
                                    break;
                                }

                                content += '\n';
                                content += (0, _helpers.translate)('server.email.report.new_operations');
                                content += '\n';
                                _iteratorNormalCompletion4 = true;
                                _didIteratorError4 = false;
                                _iteratorError4 = undefined;
                                _context4.prev = 59;
                                _iterator4 = (0, _getIterator3.default)(operationsByAccount.values());

                            case 61:
                                if (_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done) {
                                    _context4.next = 87;
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
                                _context4.prev = 68;
                                for (_iterator5 = (0, _getIterator3.default)(operations); !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
                                    op = _step5.value;
                                    date = (0, _moment2.default)(op.date).format('DD/MM/YYYY');

                                    content += '\t* ' + date + ' - ' + op.title + ' : ';
                                    content += pair.account.formatCurrency(op.amount) + '\n';
                                }
                                _context4.next = 76;
                                break;

                            case 72:
                                _context4.prev = 72;
                                _context4.t2 = _context4['catch'](68);
                                _didIteratorError5 = true;
                                _iteratorError5 = _context4.t2;

                            case 76:
                                _context4.prev = 76;
                                _context4.prev = 77;

                                if (!_iteratorNormalCompletion5 && _iterator5.return) {
                                    _iterator5.return();
                                }

                            case 79:
                                _context4.prev = 79;

                                if (!_didIteratorError5) {
                                    _context4.next = 82;
                                    break;
                                }

                                throw _iteratorError5;

                            case 82:
                                return _context4.finish(79);

                            case 83:
                                return _context4.finish(76);

                            case 84:
                                _iteratorNormalCompletion4 = true;
                                _context4.next = 61;
                                break;

                            case 87:
                                _context4.next = 93;
                                break;

                            case 89:
                                _context4.prev = 89;
                                _context4.t3 = _context4['catch'](59);
                                _didIteratorError4 = true;
                                _iteratorError4 = _context4.t3;

                            case 93:
                                _context4.prev = 93;
                                _context4.prev = 94;

                                if (!_iteratorNormalCompletion4 && _iterator4.return) {
                                    _iterator4.return();
                                }

                            case 96:
                                _context4.prev = 96;

                                if (!_didIteratorError4) {
                                    _context4.next = 99;
                                    break;
                                }

                                throw _iteratorError4;

                            case 99:
                                return _context4.finish(96);

                            case 100:
                                return _context4.finish(93);

                            case 101:
                                _context4.next = 104;
                                break;

                            case 103:
                                content += (0, _helpers.translate)('server.email.report.no_new_operations');

                            case 104:

                                content += '\n';
                                content += (0, _helpers.translate)('server.email.seeyoulater.report');
                                content += '\n\n';
                                content += (0, _helpers.translate)('server.email.signature');
                                return _context4.abrupt('return', { subject: subject, content: content });

                            case 109:
                            case 'end':
                                return _context4.stop();
                        }
                    }
                }, _callee4, this, [[23, 40, 44, 52], [45,, 47, 51], [59, 89, 93, 101], [68, 72, 76, 84], [77,, 79, 83], [94,, 96, 100]]);
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