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

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var log = (0, _helpers.makeLogger)('report-manager');

// Minimum duration between two reports: let T be any time, in the worst case,
// a report is sent at T + POLLER_START_HIGH_HOUR and the next one is sent at
// T + 24 + POLLER_START_LOW_HOUR.
var MIN_DURATION_BETWEEN_REPORTS = (24 + _helpers.POLLER_START_LOW_HOUR - _helpers.POLLER_START_HIGH_HOUR) * 60 * 60 * 1000;

var ReportManager = function () {
    function ReportManager() {
        (0, _classCallCheck3.default)(this, ReportManager);
    }

    (0, _createClass3.default)(ReportManager, [{
        key: 'sendReport',
        value: function () {
            var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(subject, content) {
                return _regenerator2.default.wrap(function _callee$(_context) {
                    while (1) {
                        switch (_context.prev = _context.next) {
                            case 0:
                                _context.next = 2;
                                return _emailer2.default.sendToUser({
                                    subject: subject,
                                    content: content
                                });

                            case 2:
                                log.info('Report sent.');

                            case 3:
                            case 'end':
                                return _context.stop();
                        }
                    }
                }, _callee, this);
            }));

            function sendReport(_x, _x2) {
                return _ref.apply(this, arguments);
            }

            return sendReport;
        }()
    }, {
        key: 'manageReports',
        value: function () {
            var _ref2 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee2() {
                var now;
                return _regenerator2.default.wrap(function _callee2$(_context2) {
                    while (1) {
                        switch (_context2.prev = _context2.next) {
                            case 0:
                                _context2.prev = 0;
                                now = (0, _moment2.default)();
                                _context2.next = 4;
                                return this.prepareReport('daily');

                            case 4:
                                if (!(now.day() === 1)) {
                                    _context2.next = 7;
                                    break;
                                }

                                _context2.next = 7;
                                return this.prepareReport('weekly');

                            case 7:
                                if (!(now.date() === 1)) {
                                    _context2.next = 10;
                                    break;
                                }

                                _context2.next = 10;
                                return this.prepareReport('monthly');

                            case 10:
                                _context2.next = 15;
                                break;

                            case 12:
                                _context2.prev = 12;
                                _context2.t0 = _context2['catch'](0);

                                log.warn('Error when preparing reports: ' + _context2.t0 + '\n' + _context2.t0.stack);

                            case 15:
                            case 'end':
                                return _context2.stop();
                        }
                    }
                }, _callee2, this, [[0, 12]]);
            }));

            function manageReports() {
                return _ref2.apply(this, arguments);
            }

            return manageReports;
        }()
    }, {
        key: 'prepareReport',
        value: function () {
            var _ref3 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee3(frequencyKey) {
                var reports, now, includedAccounts, accounts, defaultCurrency, operationsByAccount, _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, a, curr, reportsMap, _iteratorNormalCompletion2, _didIteratorError2, _iteratorError2, _iterator2, _step2, report, operations, count, _iteratorNormalCompletion3, _didIteratorError3, _iteratorError3, _iterator3, _step3, operation, account, _report, includeAfter, date, triggerDate, _iteratorNormalCompletion4, _didIteratorError4, _iteratorError4, _iterator4, _step4, _report2, email, subject, content;

                return _regenerator2.default.wrap(function _callee3$(_context3) {
                    while (1) {
                        switch (_context3.prev = _context3.next) {
                            case 0:
                                log.info('Checking if user has enabled ' + frequencyKey + ' report...');

                                _context3.next = 3;
                                return _alert2.default.reportsByFrequency(frequencyKey);

                            case 3:
                                reports = _context3.sent;

                                if (!(!reports || !reports.length)) {
                                    _context3.next = 6;
                                    break;
                                }

                                return _context3.abrupt('return', log.info('User hasn\'t enabled ' + frequencyKey + ' report.'));

                            case 6:
                                now = (0, _moment2.default)();

                                // Prevent two reports to be sent on the same day (in case of restart).

                                reports = reports.filter(function (al) {
                                    return typeof al.lastTriggeredDate === 'undefined' || now.diff(al.lastTriggeredDate) >= MIN_DURATION_BETWEEN_REPORTS;
                                });

                                if (!(!reports || !reports.length)) {
                                    _context3.next = 10;
                                    break;
                                }

                                return _context3.abrupt('return', log.info('No report to send (already sent for this frequency).'));

                            case 10:

                                log.info('Report enabled and never sent, generating it...');
                                includedAccounts = reports.map(function (report) {
                                    return report.bankAccount;
                                });
                                _context3.next = 14;
                                return _account2.default.findMany(includedAccounts);

                            case 14:
                                accounts = _context3.sent;

                                if (!(!accounts || !accounts.length)) {
                                    _context3.next = 17;
                                    break;
                                }

                                throw new _helpers.KError("report's account does not exist");

                            case 17:
                                _context3.next = 19;
                                return _config2.default.byName('defaultCurrency').value;

                            case 19:
                                defaultCurrency = _context3.sent;
                                operationsByAccount = new _map2.default();
                                _iteratorNormalCompletion = true;
                                _didIteratorError = false;
                                _iteratorError = undefined;
                                _context3.prev = 24;

                                for (_iterator = (0, _getIterator3.default)(accounts); !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                                    a = _step.value;
                                    curr = a.currency ? a.currency : defaultCurrency;

                                    a.formatCurrency = _helpers.currency.makeFormat(curr);
                                    operationsByAccount.set(a.accountNumber, { account: a, operations: [] });
                                }

                                _context3.next = 32;
                                break;

                            case 28:
                                _context3.prev = 28;
                                _context3.t0 = _context3['catch'](24);
                                _didIteratorError = true;
                                _iteratorError = _context3.t0;

                            case 32:
                                _context3.prev = 32;
                                _context3.prev = 33;

                                if (!_iteratorNormalCompletion && _iterator.return) {
                                    _iterator.return();
                                }

                            case 35:
                                _context3.prev = 35;

                                if (!_didIteratorError) {
                                    _context3.next = 38;
                                    break;
                                }

                                throw _iteratorError;

                            case 38:
                                return _context3.finish(35);

                            case 39:
                                return _context3.finish(32);

                            case 40:
                                reportsMap = new _map2.default();
                                _iteratorNormalCompletion2 = true;
                                _didIteratorError2 = false;
                                _iteratorError2 = undefined;
                                _context3.prev = 44;

                                for (_iterator2 = (0, _getIterator3.default)(reports); !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                                    report = _step2.value;

                                    reportsMap.set(report.bankAccount, report);
                                }

                                _context3.next = 52;
                                break;

                            case 48:
                                _context3.prev = 48;
                                _context3.t1 = _context3['catch'](44);
                                _didIteratorError2 = true;
                                _iteratorError2 = _context3.t1;

                            case 52:
                                _context3.prev = 52;
                                _context3.prev = 53;

                                if (!_iteratorNormalCompletion2 && _iterator2.return) {
                                    _iterator2.return();
                                }

                            case 55:
                                _context3.prev = 55;

                                if (!_didIteratorError2) {
                                    _context3.next = 58;
                                    break;
                                }

                                throw _iteratorError2;

                            case 58:
                                return _context3.finish(55);

                            case 59:
                                return _context3.finish(52);

                            case 60:
                                _context3.next = 62;
                                return _operation2.default.byAccounts(includedAccounts);

                            case 62:
                                operations = _context3.sent;
                                count = 0;
                                _iteratorNormalCompletion3 = true;
                                _didIteratorError3 = false;
                                _iteratorError3 = undefined;
                                _context3.prev = 67;
                                _iterator3 = (0, _getIterator3.default)(operations);

                            case 69:
                                if (_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done) {
                                    _context3.next = 84;
                                    break;
                                }

                                operation = _step3.value;
                                account = operation.bankAccount;
                                _report = reportsMap.get(account);
                                includeAfter = _report.lastTriggeredDate || this.computeIncludeAfter(frequencyKey);

                                includeAfter = (0, _moment2.default)(includeAfter);

                                date = operation.dateImport || operation.date;

                                if (!(0, _moment2.default)(date).isAfter(includeAfter)) {
                                    _context3.next = 81;
                                    break;
                                }

                                if (operationsByAccount.has(account)) {
                                    _context3.next = 79;
                                    break;
                                }

                                throw new _helpers.KError("operation's account does not exist");

                            case 79:
                                operationsByAccount.get(account).operations.push(operation);
                                ++count;

                            case 81:
                                _iteratorNormalCompletion3 = true;
                                _context3.next = 69;
                                break;

                            case 84:
                                _context3.next = 90;
                                break;

                            case 86:
                                _context3.prev = 86;
                                _context3.t2 = _context3['catch'](67);
                                _didIteratorError3 = true;
                                _iteratorError3 = _context3.t2;

                            case 90:
                                _context3.prev = 90;
                                _context3.prev = 91;

                                if (!_iteratorNormalCompletion3 && _iterator3.return) {
                                    _iterator3.return();
                                }

                            case 93:
                                _context3.prev = 93;

                                if (!_didIteratorError3) {
                                    _context3.next = 96;
                                    break;
                                }

                                throw _iteratorError3;

                            case 96:
                                return _context3.finish(93);

                            case 97:
                                return _context3.finish(90);

                            case 98:

                                // Update the last trigger even if there are no emails to send.
                                triggerDate = new Date();
                                _iteratorNormalCompletion4 = true;
                                _didIteratorError4 = false;
                                _iteratorError4 = undefined;
                                _context3.prev = 102;
                                _iterator4 = (0, _getIterator3.default)(reports);

                            case 104:
                                if (_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done) {
                                    _context3.next = 112;
                                    break;
                                }

                                _report2 = _step4.value;

                                _report2.lastTriggeredDate = triggerDate;
                                _context3.next = 109;
                                return _report2.save();

                            case 109:
                                _iteratorNormalCompletion4 = true;
                                _context3.next = 104;
                                break;

                            case 112:
                                _context3.next = 118;
                                break;

                            case 114:
                                _context3.prev = 114;
                                _context3.t3 = _context3['catch'](102);
                                _didIteratorError4 = true;
                                _iteratorError4 = _context3.t3;

                            case 118:
                                _context3.prev = 118;
                                _context3.prev = 119;

                                if (!_iteratorNormalCompletion4 && _iterator4.return) {
                                    _iterator4.return();
                                }

                            case 121:
                                _context3.prev = 121;

                                if (!_didIteratorError4) {
                                    _context3.next = 124;
                                    break;
                                }

                                throw _iteratorError4;

                            case 124:
                                return _context3.finish(121);

                            case 125:
                                return _context3.finish(118);

                            case 126:
                                if (count) {
                                    _context3.next = 128;
                                    break;
                                }

                                return _context3.abrupt('return', log.info('no operations to show in the report.'));

                            case 128:
                                _context3.next = 130;
                                return this.getTextContent(accounts, operationsByAccount, frequencyKey);

                            case 130:
                                email = _context3.sent;
                                subject = email.subject, content = email.content;
                                _context3.next = 134;
                                return this.sendReport(subject, content);

                            case 134:
                            case 'end':
                                return _context3.stop();
                        }
                    }
                }, _callee3, this, [[24, 28, 32, 40], [33,, 35, 39], [44, 48, 52, 60], [53,, 55, 59], [67, 86, 90, 98], [91,, 93, 97], [102, 114, 118, 126], [119,, 121, 125]]);
            }));

            function prepareReport(_x3) {
                return _ref3.apply(this, arguments);
            }

            return prepareReport;
        }()
    }, {
        key: 'getTextContent',
        value: function () {
            var _ref4 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee4(accounts, operationsByAccount, frequencyKey) {
                var frequency, today, content, _iteratorNormalCompletion5, _didIteratorError5, _iteratorError5, _iterator5, _step5, account, lastCheck, balance, _iteratorNormalCompletion6, _didIteratorError6, _iteratorError6, _iterator6, _step6, pair, operations, _iteratorNormalCompletion7, _didIteratorError7, _iteratorError7, _iterator7, _step7, op, date, subject;

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
                                today = (0, _helpers.formatDateToLocaleString)();
                                content = void 0;

                                content = (0, _helpers.translate)('server.email.hello');
                                content += '\n\n';
                                content += (0, _helpers.translate)('server.email.report.pre', { today: today });
                                content += '\n';

                                _iteratorNormalCompletion5 = true;
                                _didIteratorError5 = false;
                                _iteratorError5 = undefined;
                                _context4.prev = 20;
                                _iterator5 = (0, _getIterator3.default)(accounts);

                            case 22:
                                if (_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done) {
                                    _context4.next = 35;
                                    break;
                                }

                                account = _step5.value;
                                lastCheck = (0, _helpers.formatDateToLocaleString)(account.lastCheck);
                                _context4.next = 27;
                                return account.computeBalance();

                            case 27:
                                balance = _context4.sent;

                                content += '\t* ' + account.title + ' : ';
                                content += account.formatCurrency(balance) + ' (';
                                content += (0, _helpers.translate)('server.email.report.last_sync');
                                content += ' ' + lastCheck + ')\n';

                            case 32:
                                _iteratorNormalCompletion5 = true;
                                _context4.next = 22;
                                break;

                            case 35:
                                _context4.next = 41;
                                break;

                            case 37:
                                _context4.prev = 37;
                                _context4.t1 = _context4['catch'](20);
                                _didIteratorError5 = true;
                                _iteratorError5 = _context4.t1;

                            case 41:
                                _context4.prev = 41;
                                _context4.prev = 42;

                                if (!_iteratorNormalCompletion5 && _iterator5.return) {
                                    _iterator5.return();
                                }

                            case 44:
                                _context4.prev = 44;

                                if (!_didIteratorError5) {
                                    _context4.next = 47;
                                    break;
                                }

                                throw _iteratorError5;

                            case 47:
                                return _context4.finish(44);

                            case 48:
                                return _context4.finish(41);

                            case 49:
                                if (!(0, _keys2.default)(operationsByAccount).length) {
                                    _context4.next = 100;
                                    break;
                                }

                                content += '\n';
                                content += (0, _helpers.translate)('server.email.report.new_operations');
                                content += '\n';
                                _iteratorNormalCompletion6 = true;
                                _didIteratorError6 = false;
                                _iteratorError6 = undefined;
                                _context4.prev = 56;
                                _iterator6 = (0, _getIterator3.default)(operationsByAccount.values());

                            case 58:
                                if (_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done) {
                                    _context4.next = 84;
                                    break;
                                }

                                pair = _step6.value;


                                // Sort operations by date or import date
                                operations = pair.operations.sort(function (a, b) {
                                    var ad = a.date || a.dateImport;
                                    var bd = b.date || b.dateImport;
                                    if (ad < bd) return -1;
                                    if (ad === bd) return 0;
                                    return 1;
                                });


                                content += '\n' + pair.account.title + ':\n';
                                _iteratorNormalCompletion7 = true;
                                _didIteratorError7 = false;
                                _iteratorError7 = undefined;
                                _context4.prev = 65;
                                for (_iterator7 = (0, _getIterator3.default)(operations); !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
                                    op = _step7.value;
                                    date = (0, _helpers.formatDateToLocaleString)(op.date);

                                    content += '\t* ' + date + ' - ' + op.title + ' : ';
                                    content += pair.account.formatCurrency(op.amount) + '\n';
                                }
                                _context4.next = 73;
                                break;

                            case 69:
                                _context4.prev = 69;
                                _context4.t2 = _context4['catch'](65);
                                _didIteratorError7 = true;
                                _iteratorError7 = _context4.t2;

                            case 73:
                                _context4.prev = 73;
                                _context4.prev = 74;

                                if (!_iteratorNormalCompletion7 && _iterator7.return) {
                                    _iterator7.return();
                                }

                            case 76:
                                _context4.prev = 76;

                                if (!_didIteratorError7) {
                                    _context4.next = 79;
                                    break;
                                }

                                throw _iteratorError7;

                            case 79:
                                return _context4.finish(76);

                            case 80:
                                return _context4.finish(73);

                            case 81:
                                _iteratorNormalCompletion6 = true;
                                _context4.next = 58;
                                break;

                            case 84:
                                _context4.next = 90;
                                break;

                            case 86:
                                _context4.prev = 86;
                                _context4.t3 = _context4['catch'](56);
                                _didIteratorError6 = true;
                                _iteratorError6 = _context4.t3;

                            case 90:
                                _context4.prev = 90;
                                _context4.prev = 91;

                                if (!_iteratorNormalCompletion6 && _iterator6.return) {
                                    _iterator6.return();
                                }

                            case 93:
                                _context4.prev = 93;

                                if (!_didIteratorError6) {
                                    _context4.next = 96;
                                    break;
                                }

                                throw _iteratorError6;

                            case 96:
                                return _context4.finish(93);

                            case 97:
                                return _context4.finish(90);

                            case 98:
                                _context4.next = 101;
                                break;

                            case 100:
                                content += (0, _helpers.translate)('server.email.report.no_new_operations');

                            case 101:

                                content += '\n';
                                content += (0, _helpers.translate)('server.email.seeyoulater.report');
                                content += '\n\n';
                                content += (0, _helpers.translate)('server.email.signature');

                                subject = void 0;

                                subject = (0, _helpers.translate)('server.email.report.subject', { frequency: frequency });
                                subject = 'Kresus - ' + subject;

                                return _context4.abrupt('return', { subject: subject, content: content });

                            case 109:
                            case 'end':
                                return _context4.stop();
                        }
                    }
                }, _callee4, this, [[20, 37, 41, 49], [42,, 44, 48], [56, 86, 90, 98], [65, 69, 73, 81], [74,, 76, 80], [91,, 93, 97]]);
            }));

            function getTextContent(_x4, _x5, _x6) {
                return _ref4.apply(this, arguments);
            }

            return getTextContent;
        }()
    }, {
        key: 'computeIncludeAfter',
        value: function computeIncludeAfter(frequency) {

            var includeAfter = (0, _moment2.default)();
            switch (frequency) {
                case 'daily':
                    includeAfter.subtract(1, 'days');break;
                case 'weekly':
                    includeAfter.subtract(7, 'days');break;
                case 'monthly':
                    includeAfter.subtract(1, 'months').days(0);break;
                default:
                    log.error('unexpected frequency in report-manager');
            }

            // The report is sent only for operations imported after
            // POLLER_START_HIGH_HOUR in the morning.
            includeAfter.hours(_helpers.POLLER_START_HIGH_HOUR).minutes(0).seconds(0);

            return includeAfter;
        }
    }]);
    return ReportManager;
}();

exports.default = new ReportManager();