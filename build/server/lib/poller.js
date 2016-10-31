'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _getIterator2 = require('babel-runtime/core-js/get-iterator');

var _getIterator3 = _interopRequireDefault(_getIterator2);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

var _access = require('../models/access');

var _access2 = _interopRequireDefault(_access);

var _config = require('../models/config');

var _config2 = _interopRequireDefault(_config);

var _bank = require('../models/bank');

var _bank2 = _interopRequireDefault(_bank);

var _accountsManager = require('./accounts-manager');

var _accountsManager2 = _interopRequireDefault(_accountsManager);

var _reportManager = require('./report-manager');

var _reportManager2 = _interopRequireDefault(_reportManager);

var _emailer = require('./emailer');

var _emailer2 = _interopRequireDefault(_emailer);

var _weboob = require('./sources/weboob');

var weboob = _interopRequireWildcard(_weboob);

var _helpers = require('../helpers');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var log = (0, _helpers.makeLogger)('poller');

// Raise an event in the event loop every 20 min to maintain the process awaken
// to work around a timer bug on low-end devices like Raspberry PI

var WAKEUP_INTERVAL = 20 * 60 * 1000;

var Poller = function () {
    function Poller() {
        (0, _classCallCheck3.default)(this, Poller);

        this.runTimeout = null;
        this.run = this.run.bind(this);
        this.timeToNextRun = null;
        this.wakeupInterval = null;
    }

    (0, _createClass3.default)(Poller, [{
        key: 'programNextRun',
        value: function programNextRun() {
            var _this = this;

            // The next run is programmed to happen the next day, at a random hour
            // in [POLLER_START_LOW; POLLER_START_HOUR].
            var delta = Math.random() * (_helpers.POLLER_START_HIGH_HOUR - _helpers.POLLER_START_LOW_HOUR) * 60 | 0;

            var now = (0, _moment2.default)();
            var nextUpdate = now.clone().add(1, 'days').hours(_helpers.POLLER_START_LOW_HOUR).minutes(delta).seconds(0);

            var format = 'DD/MM/YYYY [at] HH:mm:ss';
            log.info('> Next check of accounts on ' + nextUpdate.format(format));

            if (this.runTimeout !== null) {
                clearTimeout(this.runTimeout);
                this.runTimeout = null;
            }

            this.timeToNextRun = nextUpdate.diff(now);

            if (this.timeToNextRun < WAKEUP_INTERVAL) {
                this.wakeupInterval = setTimeout(this.run, this.timeToNextRun);
            } else {
                this.timeToNextRun = this.timeToNextRun - WAKEUP_INTERVAL;
                this.wakeupInterval = setInterval(function () {
                    if (_this.timeToNextRun < WAKEUP_INTERVAL) {
                        // Clean the setInterval to ensure it to be stopped when this.run is called
                        if (_this.wakeupInterval !== null) {
                            clearInterval(_this.wakeupInterval);
                            _this.wakeupInterval = null;
                        }
                        _this.runTimeout = setTimeout(_this.run, _this.timeToNextRun);
                    } else {
                        _this.timeToNextRun = _this.timeToNextRun - WAKEUP_INTERVAL;
                    }
                }, WAKEUP_INTERVAL);
            }
        }
    }, {
        key: 'run',
        value: function () {
            var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(cb) {
                var updateWeboob, checkAccounts, accesses, _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, access, accountManager, error;

                return _regenerator2.default.wrap(function _callee$(_context) {
                    while (1) {
                        switch (_context.prev = _context.next) {
                            case 0:
                                // Ensure checks will continue even if we hit some error during the
                                // process.
                                try {
                                    this.programNextRun();
                                } catch (err) {
                                    log.error('Error when preparting the next check: ' + err.message);
                                }

                                // Separate try/catch, so that failing to update weboob doesn't prevent
                                // accounts/operations to be fetched.
                                _context.prev = 1;
                                _context.next = 4;
                                return _config2.default.findOrCreateDefaultBooleanValue('weboob-auto-update');

                            case 4:
                                updateWeboob = _context.sent;

                                if (!updateWeboob) {
                                    _context.next = 8;
                                    break;
                                }

                                _context.next = 8;
                                return weboob.updateWeboobModules();

                            case 8:
                                _context.next = 13;
                                break;

                            case 10:
                                _context.prev = 10;
                                _context.t0 = _context['catch'](1);

                                log.error('Error when updating Weboob in polling: ' + _context.t0.message);

                            case 13:
                                checkAccounts = false;
                                _context.prev = 14;
                                _context.next = 17;
                                return _config2.default.findOrCreateDefaultBooleanValue('weboob-auto-merge-accounts');

                            case 17:
                                checkAccounts = _context.sent;
                                _context.next = 23;
                                break;

                            case 20:
                                _context.prev = 20;
                                _context.t1 = _context['catch'](14);

                                log.error('Could not retrieve \'weboob-auto-merge-accounts\':\n                ' + _context.t1.toString());

                            case 23:

                                // We go on even if the parameter weboob-auto-merge-accounts is
                                // not caught. By default, the merge is not done.
                                log.info('Checking new operations for all accesses...');
                                if (checkAccounts) {
                                    log.info('\t(will also check for accounts to merge)');
                                }

                                _context.prev = 25;
                                _context.next = 28;
                                return _access2.default.all();

                            case 28:
                                accesses = _context.sent;
                                _iteratorNormalCompletion = true;
                                _didIteratorError = false;
                                _iteratorError = undefined;
                                _context.prev = 32;
                                _iterator = (0, _getIterator3.default)(accesses);

                            case 34:
                                if (_iteratorNormalCompletion = (_step = _iterator.next()).done) {
                                    _context.next = 59;
                                    break;
                                }

                                access = _step.value;
                                accountManager = new _accountsManager2.default();
                                _context.prev = 37;

                                if (!access.canAccessBePolled()) {
                                    _context.next = 46;
                                    break;
                                }

                                if (!checkAccounts) {
                                    _context.next = 42;
                                    break;
                                }

                                _context.next = 42;
                                return accountManager.retrieveNewAccountsByAccess(access, false);

                            case 42:
                                _context.next = 44;
                                return accountManager.retrieveOperationsByAccess(access, cb);

                            case 44:
                                _context.next = 48;
                                break;

                            case 46:
                                error = access.fetchStatus;

                                log.info('Cannot poll, last fetch raised: ' + error);

                            case 48:
                                _context.next = 56;
                                break;

                            case 50:
                                _context.prev = 50;
                                _context.t2 = _context['catch'](37);

                                log.error('Error when polling accounts: ' + _context.t2.message);

                                if (!(_context.t2.errCode && (0, _helpers.isCredentialError)(_context.t2))) {
                                    _context.next = 56;
                                    break;
                                }

                                _context.next = 56;
                                return this.manageCredentialErrors(access, _context.t2);

                            case 56:
                                _iteratorNormalCompletion = true;
                                _context.next = 34;
                                break;

                            case 59:
                                _context.next = 65;
                                break;

                            case 61:
                                _context.prev = 61;
                                _context.t3 = _context['catch'](32);
                                _didIteratorError = true;
                                _iteratorError = _context.t3;

                            case 65:
                                _context.prev = 65;
                                _context.prev = 66;

                                if (!_iteratorNormalCompletion && _iterator.return) {
                                    _iterator.return();
                                }

                            case 68:
                                _context.prev = 68;

                                if (!_didIteratorError) {
                                    _context.next = 71;
                                    break;
                                }

                                throw _iteratorError;

                            case 71:
                                return _context.finish(68);

                            case 72:
                                return _context.finish(65);

                            case 73:

                                // Reports
                                log.info('Maybe sending reports...');
                                _context.next = 76;
                                return _reportManager2.default.manageReports();

                            case 76:

                                // Done!
                                log.info('All accounts have been polled.');

                                _context.next = 82;
                                break;

                            case 79:
                                _context.prev = 79;
                                _context.t4 = _context['catch'](25);

                                log.error('Error when polling accounts: ' + _context.t4.message);

                            case 82:
                            case 'end':
                                return _context.stop();
                        }
                    }
                }, _callee, this, [[1, 10], [14, 20], [25, 79], [32, 61, 65, 73], [37, 50], [66,, 68, 72]]);
            }));

            function run(_x) {
                return _ref.apply(this, arguments);
            }

            return run;
        }()
    }, {
        key: 'runAtStartup',
        value: function () {
            var _ref2 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee2(cb) {
                return _regenerator2.default.wrap(function _callee2$(_context2) {
                    while (1) {
                        switch (_context2.prev = _context2.next) {
                            case 0:
                                _context2.prev = 0;
                                _context2.next = 3;
                                return this.run(cb);

                            case 3:
                                _context2.next = 8;
                                break;

                            case 5:
                                _context2.prev = 5;
                                _context2.t0 = _context2['catch'](0);

                                log.error('when polling accounts at startup: ' + _context2.t0.message);

                            case 8:
                            case 'end':
                                return _context2.stop();
                        }
                    }
                }, _callee2, this, [[0, 5]]);
            }));

            function runAtStartup(_x2) {
                return _ref2.apply(this, arguments);
            }

            return runAtStartup;
        }()
    }, {
        key: 'manageCredentialErrors',
        value: function () {
            var _ref3 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee3(access, err) {
                var bank, bankName, error, subject, content;
                return _regenerator2.default.wrap(function _callee3$(_context3) {
                    while (1) {
                        switch (_context3.prev = _context3.next) {
                            case 0:
                                if (err.errCode) {
                                    _context3.next = 2;
                                    break;
                                }

                                return _context3.abrupt('return');

                            case 2:

                                // We save the error status, so that the operations
                                // are not fetched on next poll instance.
                                access.fetchStatus = err.errCode;
                                _context3.next = 5;
                                return access.save();

                            case 5:
                                _context3.next = 7;
                                return _bank2.default.byUuid(access.bank);

                            case 7:
                                bank = _context3.sent;
                                bankName = bank[0].name;

                                // Retrieve the human readable error code.

                                error = (0, _helpers.translate)('server.email.fetch_error.' + err.errCode);
                                subject = (0, _helpers.translate)('server.email.fetch_error.subject');
                                content = (0, _helpers.translate)('server.email.hello') + '\n\n';

                                content += (0, _helpers.translate)('server.email.fetch_error.text', { bank: bankName, error: error, message: err.message }) + '\n';
                                content += (0, _helpers.translate)('server.email.fetch_error.pause_poll') + '\n\n';
                                content += '' + (0, _helpers.translate)('server.email.signature');

                                log.info('Warning the user that an error was detected');
                                _context3.next = 18;
                                return _emailer2.default.sendToUser({ subject: subject, content: content });

                            case 18:
                            case 'end':
                                return _context3.stop();
                        }
                    }
                }, _callee3, this);
            }));

            function manageCredentialErrors(_x3, _x4) {
                return _ref3.apply(this, arguments);
            }

            return manageCredentialErrors;
        }()
    }]);
    return Poller;
}();

var poller = new Poller();

exports.default = poller;