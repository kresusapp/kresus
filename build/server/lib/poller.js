'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _getIterator2 = require('babel-runtime/core-js/get-iterator');

var _getIterator3 = _interopRequireDefault(_getIterator2);

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
        key: 'updateWeboob',
        value: function () {
            var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee() {
                return _regenerator2.default.wrap(function _callee$(_context) {
                    while (1) {
                        switch (_context.prev = _context.next) {
                            case 0:
                                _context.prev = 0;
                                _context.next = 3;
                                return _config2.default.findOrCreateDefaultBooleanValue('weboob-auto-update');

                            case 3:
                                if (!_context.sent) {
                                    _context.next = 6;
                                    break;
                                }

                                _context.next = 6;
                                return weboob.updateWeboobModules();

                            case 6:
                                _context.next = 11;
                                break;

                            case 8:
                                _context.prev = 8;
                                _context.t0 = _context['catch'](0);

                                log.error('Error when updating Weboob in polling: ' + _context.t0.message);

                            case 11:
                            case 'end':
                                return _context.stop();
                        }
                    }
                }, _callee, this, [[0, 8]]);
            }));

            function updateWeboob() {
                return _ref.apply(this, arguments);
            }

            return updateWeboob;
        }()
    }, {
        key: 'run',
        value: function () {
            var _ref2 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee2(cb) {
                var accesses, _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, access, error;

                return _regenerator2.default.wrap(function _callee2$(_context2) {
                    while (1) {
                        switch (_context2.prev = _context2.next) {
                            case 0:
                                try {
                                    // Ensure checks will continue even if we hit some error during the process.
                                    this.programNextRun();
                                } catch (err) {
                                    log.error('Error when preparting the next check: ' + err.message);
                                }

                                _context2.next = 3;
                                return this.updateWeboob();

                            case 3:

                                log.info('Checking accounts and operations for all accesses...');

                                _context2.prev = 4;
                                _context2.next = 7;
                                return _access2.default.all();

                            case 7:
                                accesses = _context2.sent;
                                _iteratorNormalCompletion = true;
                                _didIteratorError = false;
                                _iteratorError = undefined;
                                _context2.prev = 11;
                                _iterator = (0, _getIterator3.default)(accesses);

                            case 13:
                                if (_iteratorNormalCompletion = (_step = _iterator.next()).done) {
                                    _context2.next = 36;
                                    break;
                                }

                                access = _step.value;
                                _context2.prev = 15;

                                if (!access.canBePolled()) {
                                    _context2.next = 23;
                                    break;
                                }

                                _context2.next = 19;
                                return _accountsManager2.default.retrieveNewAccountsByAccess(access, false);

                            case 19:
                                _context2.next = 21;
                                return _accountsManager2.default.retrieveOperationsByAccess(access, cb);

                            case 21:
                                _context2.next = 25;
                                break;

                            case 23:
                                error = access.fetchStatus;

                                log.info('Cannot poll, last fetch raised: ' + error);

                            case 25:
                                _context2.next = 33;
                                break;

                            case 27:
                                _context2.prev = 27;
                                _context2.t0 = _context2['catch'](15);

                                log.error('Error when polling accounts: ' + _context2.t0.message);

                                if (!(_context2.t0.errCode && (0, _helpers.isCredentialError)(_context2.t0))) {
                                    _context2.next = 33;
                                    break;
                                }

                                _context2.next = 33;
                                return this.manageCredentialErrors(access, _context2.t0);

                            case 33:
                                _iteratorNormalCompletion = true;
                                _context2.next = 13;
                                break;

                            case 36:
                                _context2.next = 42;
                                break;

                            case 38:
                                _context2.prev = 38;
                                _context2.t1 = _context2['catch'](11);
                                _didIteratorError = true;
                                _iteratorError = _context2.t1;

                            case 42:
                                _context2.prev = 42;
                                _context2.prev = 43;

                                if (!_iteratorNormalCompletion && _iterator.return) {
                                    _iterator.return();
                                }

                            case 45:
                                _context2.prev = 45;

                                if (!_didIteratorError) {
                                    _context2.next = 48;
                                    break;
                                }

                                throw _iteratorError;

                            case 48:
                                return _context2.finish(45);

                            case 49:
                                return _context2.finish(42);

                            case 50:

                                // Reports
                                log.info('Maybe sending reports...');
                                _context2.next = 53;
                                return _reportManager2.default.manageReports();

                            case 53:

                                // Done!
                                log.info('All accounts have been polled.');
                                _context2.next = 59;
                                break;

                            case 56:
                                _context2.prev = 56;
                                _context2.t2 = _context2['catch'](4);

                                log.error('Error when polling accounts: ' + _context2.t2.message);

                            case 59:
                            case 'end':
                                return _context2.stop();
                        }
                    }
                }, _callee2, this, [[4, 56], [11, 38, 42, 50], [15, 27], [43,, 45, 49]]);
            }));

            function run(_x) {
                return _ref2.apply(this, arguments);
            }

            return run;
        }()
    }, {
        key: 'runAtStartup',
        value: function () {
            var _ref3 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee3(cb) {
                return _regenerator2.default.wrap(function _callee3$(_context3) {
                    while (1) {
                        switch (_context3.prev = _context3.next) {
                            case 0:
                                _context3.prev = 0;
                                _context3.next = 3;
                                return this.run(cb);

                            case 3:
                                _context3.next = 8;
                                break;

                            case 5:
                                _context3.prev = 5;
                                _context3.t0 = _context3['catch'](0);

                                log.error('when polling accounts at startup: ' + _context3.t0.message);

                            case 8:
                            case 'end':
                                return _context3.stop();
                        }
                    }
                }, _callee3, this, [[0, 5]]);
            }));

            function runAtStartup(_x2) {
                return _ref3.apply(this, arguments);
            }

            return runAtStartup;
        }()
    }, {
        key: 'manageCredentialErrors',
        value: function () {
            var _ref4 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee4(access, err) {
                var bank, error, subject, content;
                return _regenerator2.default.wrap(function _callee4$(_context4) {
                    while (1) {
                        switch (_context4.prev = _context4.next) {
                            case 0:
                                if (err.errCode) {
                                    _context4.next = 2;
                                    break;
                                }

                                return _context4.abrupt('return');

                            case 2:

                                // We save the error status, so that the operations
                                // are not fetched on next poll instance.
                                access.fetchStatus = err.errCode;
                                _context4.next = 5;
                                return access.save();

                            case 5:
                                bank = _bank2.default.byUuid(access.bank);

                                (0, _helpers.assert)(bank, 'The bank must be known');
                                bank = bank.name;

                                // Retrieve the human readable error code.
                                error = (0, _helpers.translate)('server.email.fetch_error.' + err.errCode);
                                subject = (0, _helpers.translate)('server.email.fetch_error.subject');
                                content = (0, _helpers.translate)('server.email.hello');

                                content += '\n\n';
                                content += (0, _helpers.translate)('server.email.fetch_error.text', {
                                    bank: bank,
                                    error: error,
                                    message: err.message
                                });
                                content += '\n';
                                content += (0, _helpers.translate)('server.email.fetch_error.pause_poll');
                                content += '\n\n';
                                content += (0, _helpers.translate)('server.email.signature');

                                log.info('Warning the user that an error was detected');
                                _context4.prev = 18;
                                _context4.next = 21;
                                return _emailer2.default.sendToUser({
                                    subject: subject,
                                    content: content
                                });

                            case 21:
                                _context4.next = 26;
                                break;

                            case 23:
                                _context4.prev = 23;
                                _context4.t0 = _context4['catch'](18);

                                log.error('when sending an email to warn about credential errors: ' + _context4.t0.message);

                            case 26:
                            case 'end':
                                return _context4.stop();
                        }
                    }
                }, _callee4, this, [[18, 23]]);
            }));

            function manageCredentialErrors(_x3, _x4) {
                return _ref4.apply(this, arguments);
            }

            return manageCredentialErrors;
        }()
    }]);
    return Poller;
}();

var poller = new Poller();

exports.default = poller;