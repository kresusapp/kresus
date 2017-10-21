'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.fullPoll = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

// Can throw.
var updateWeboob = function () {
    var _ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee() {
        return regeneratorRuntime.wrap(function _callee$(_context) {
            while (1) {
                switch (_context.prev = _context.next) {
                    case 0:
                        _context.next = 2;
                        return _config2.default.findOrCreateDefaultBooleanValue('weboob-auto-update');

                    case 2:
                        if (!_context.sent) {
                            _context.next = 5;
                            break;
                        }

                        _context.next = 5;
                        return weboob.updateWeboobModules();

                    case 5:
                    case 'end':
                        return _context.stop();
                }
            }
        }, _callee, this);
    }));

    return function updateWeboob() {
        return _ref.apply(this, arguments);
    };
}();

var manageCredentialsErrors = function () {
    var _ref2 = _asyncToGenerator(regeneratorRuntime.mark(function _callee2(access, err) {
        var bank, error, subject, content;
        return regeneratorRuntime.wrap(function _callee2$(_context2) {
            while (1) {
                switch (_context2.prev = _context2.next) {
                    case 0:
                        if (err.errCode) {
                            _context2.next = 2;
                            break;
                        }

                        return _context2.abrupt('return');

                    case 2:

                        // We save the error status, so that the operations
                        // are not fetched on next poll instance.
                        access.fetchStatus = err.errCode;
                        _context2.next = 5;
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
                        _context2.prev = 18;
                        _context2.next = 21;
                        return _emailer2.default.sendToUser({
                            subject: subject,
                            content: content
                        });

                    case 21:
                        _context2.next = 26;
                        break;

                    case 23:
                        _context2.prev = 23;
                        _context2.t0 = _context2['catch'](18);

                        log.error('when sending an email to warn about credential errors: ' + _context2.t0.message);

                    case 26:
                    case 'end':
                        return _context2.stop();
                }
            }
        }, _callee2, this, [[18, 23]]);
    }));

    return function manageCredentialsErrors(_x, _x2) {
        return _ref2.apply(this, arguments);
    };
}();

// Can throw.


var pollAllAccounts = function () {
    var _ref3 = _asyncToGenerator(regeneratorRuntime.mark(function _callee3() {
        var accesses, _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, access, bank, enabled, login, error;

        return regeneratorRuntime.wrap(function _callee3$(_context3) {
            while (1) {
                switch (_context3.prev = _context3.next) {
                    case 0:
                        log.info('Checking accounts and operations for all accesses...');

                        _context3.next = 3;
                        return _access2.default.all();

                    case 3:
                        accesses = _context3.sent;
                        _iteratorNormalCompletion = true;
                        _didIteratorError = false;
                        _iteratorError = undefined;
                        _context3.prev = 7;
                        _iterator = accesses[Symbol.iterator]();

                    case 9:
                        if (_iteratorNormalCompletion = (_step = _iterator.next()).done) {
                            _context3.next = 32;
                            break;
                        }

                        access = _step.value;
                        _context3.prev = 11;

                        if (!access.canBePolled()) {
                            _context3.next = 19;
                            break;
                        }

                        _context3.next = 15;
                        return _accountsManager2.default.retrieveNewAccountsByAccess(access, false);

                    case 15:
                        _context3.next = 17;
                        return _accountsManager2.default.retrieveOperationsByAccess(access);

                    case 17:
                        _context3.next = 21;
                        break;

                    case 19:
                        bank = access.bank, enabled = access.enabled, login = access.login;

                        if (!enabled) {
                            log.info('Won\'t poll, access from bank ' + bank + ' with login ' + login + ' is disabled.');
                        } else {
                            error = access.fetchStatus;

                            log.info('Won\'t poll, access from bank ' + bank + ' with login ' + login + ' last fetch raised: ' + error + '.');
                        }

                    case 21:
                        _context3.next = 29;
                        break;

                    case 23:
                        _context3.prev = 23;
                        _context3.t0 = _context3['catch'](11);

                        log.error('Error when polling accounts: ' + _context3.t0.message);

                        if (!(_context3.t0.errCode && (0, _helpers.errorRequiresUserAction)(_context3.t0))) {
                            _context3.next = 29;
                            break;
                        }

                        _context3.next = 29;
                        return manageCredentialsErrors(access, _context3.t0);

                    case 29:
                        _iteratorNormalCompletion = true;
                        _context3.next = 9;
                        break;

                    case 32:
                        _context3.next = 38;
                        break;

                    case 34:
                        _context3.prev = 34;
                        _context3.t1 = _context3['catch'](7);
                        _didIteratorError = true;
                        _iteratorError = _context3.t1;

                    case 38:
                        _context3.prev = 38;
                        _context3.prev = 39;

                        if (!_iteratorNormalCompletion && _iterator.return) {
                            _iterator.return();
                        }

                    case 41:
                        _context3.prev = 41;

                        if (!_didIteratorError) {
                            _context3.next = 44;
                            break;
                        }

                        throw _iteratorError;

                    case 44:
                        return _context3.finish(41);

                    case 45:
                        return _context3.finish(38);

                    case 46:

                        log.info('All accounts have been polled.');

                    case 47:
                    case 'end':
                        return _context3.stop();
                }
            }
        }, _callee3, this, [[7, 34, 38, 46], [11, 23], [39,, 41, 45]]);
    }));

    return function pollAllAccounts() {
        return _ref3.apply(this, arguments);
    };
}();

// Can throw.


var sendReports = function () {
    var _ref4 = _asyncToGenerator(regeneratorRuntime.mark(function _callee4() {
        return regeneratorRuntime.wrap(function _callee4$(_context4) {
            while (1) {
                switch (_context4.prev = _context4.next) {
                    case 0:
                        log.info('Maybe sending reports...');
                        _context4.next = 3;
                        return _reportManager2.default.manageReports();

                    case 3:
                        log.info('Reports have been sent.');

                    case 4:
                    case 'end':
                        return _context4.stop();
                }
            }
        }, _callee4, this);
    }));

    return function sendReports() {
        return _ref4.apply(this, arguments);
    };
}();

// Can throw.


var fullPoll = exports.fullPoll = function () {
    var _ref5 = _asyncToGenerator(regeneratorRuntime.mark(function _callee5() {
        return regeneratorRuntime.wrap(function _callee5$(_context5) {
            while (1) {
                switch (_context5.prev = _context5.next) {
                    case 0:
                        _context5.next = 2;
                        return updateWeboob();

                    case 2:
                        _context5.next = 4;
                        return pollAllAccounts();

                    case 4:
                        _context5.next = 6;
                        return sendReports();

                    case 6:
                    case 'end':
                        return _context5.stop();
                }
            }
        }, _callee5, this);
    }));

    return function fullPoll() {
        return _ref5.apply(this, arguments);
    };
}();

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

var _cron = require('./cron');

var _cron2 = _interopRequireDefault(_cron);

var _reportManager = require('./report-manager');

var _reportManager2 = _interopRequireDefault(_reportManager);

var _emailer = require('./emailer');

var _emailer2 = _interopRequireDefault(_emailer);

var _weboob = require('./sources/weboob');

var weboob = _interopRequireWildcard(_weboob);

var _helpers = require('../helpers');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

var log = (0, _helpers.makeLogger)('poller');
var Poller = function () {
    function Poller() {
        _classCallCheck(this, Poller);

        this.run = this.run.bind(this);
        this.cron = new _cron2.default(this.run);
    }

    _createClass(Poller, [{
        key: 'programNextRun',
        value: function programNextRun() {
            // The next run is programmed to happen the next day, at a random hour
            // in [POLLER_START_LOW; POLLER_START_HOUR].
            var delta = Math.random() * (_helpers.POLLER_START_HIGH_HOUR - _helpers.POLLER_START_LOW_HOUR) * 60 | 0;

            var nextUpdate = (0, _moment2.default)().clone().add(1, 'days').hours(_helpers.POLLER_START_LOW_HOUR).minutes(delta).seconds(0);

            var format = 'DD/MM/YYYY [at] HH:mm:ss';
            log.info('> Next check of accounts on ' + nextUpdate.format(format));

            this.cron.setNextUpdate(nextUpdate);
        }
    }, {
        key: 'run',
        value: function () {
            var _ref6 = _asyncToGenerator(regeneratorRuntime.mark(function _callee6() {
                return regeneratorRuntime.wrap(function _callee6$(_context6) {
                    while (1) {
                        switch (_context6.prev = _context6.next) {
                            case 0:
                                try {
                                    // Ensure checks will continue even if we hit some error during the process.
                                    this.programNextRun();
                                } catch (err) {
                                    log.error('Error when preparing the next check: ' + err.message);
                                }

                                _context6.prev = 1;
                                _context6.next = 4;
                                return fullPoll();

                            case 4:
                                _context6.next = 9;
                                break;

                            case 6:
                                _context6.prev = 6;
                                _context6.t0 = _context6['catch'](1);

                                log.error('Error when doing an automatic poll: ' + _context6.t0.message);

                            case 9:
                            case 'end':
                                return _context6.stop();
                        }
                    }
                }, _callee6, this, [[1, 6]]);
            }));

            function run() {
                return _ref6.apply(this, arguments);
            }

            return run;
        }()
    }, {
        key: 'runAtStartup',
        value: function () {
            var _ref7 = _asyncToGenerator(regeneratorRuntime.mark(function _callee7() {
                return regeneratorRuntime.wrap(function _callee7$(_context7) {
                    while (1) {
                        switch (_context7.prev = _context7.next) {
                            case 0:
                                _context7.prev = 0;
                                _context7.next = 3;
                                return this.run();

                            case 3:
                                _context7.next = 8;
                                break;

                            case 5:
                                _context7.prev = 5;
                                _context7.t0 = _context7['catch'](0);

                                log.error('when polling accounts at startup: ' + _context7.t0.message);

                            case 8:
                            case 'end':
                                return _context7.stop();
                        }
                    }
                }, _callee7, this, [[0, 5]]);
            }));

            function runAtStartup() {
                return _ref7.apply(this, arguments);
            }

            return runAtStartup;
        }()
    }]);

    return Poller;
}();

var poller = new Poller();

exports.default = poller;