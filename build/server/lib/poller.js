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

var _accountsManager = require('./accounts-manager');

var _accountsManager2 = _interopRequireDefault(_accountsManager);

var _reportManager = require('./report-manager');

var _reportManager2 = _interopRequireDefault(_reportManager);

var _weboob = require('./sources/weboob');

var weboob = _interopRequireWildcard(_weboob);

var _helpers = require('../helpers');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var log = (0, _helpers.makeLogger)('poller');

var Poller = function () {
    function Poller() {
        (0, _classCallCheck3.default)(this, Poller);

        this.timeout = null;
        this.run = this.run.bind(this);
    }

    (0, _createClass3.default)(Poller, [{
        key: 'programNextRun',
        value: function programNextRun() {
            // day after between 02:00am and 04:00am UTC
            var delta = Math.random() * 120 | 0;
            var now = (0, _moment2.default)();
            var nextUpdate = now.clone().add(1, 'days').hours(2).minutes(delta).seconds(0);

            var format = 'DD/MM/YYYY [at] HH:mm:ss';
            log.info('> Next check of accounts on ' + nextUpdate.format(format));

            if (this.timeout !== null) {
                clearTimeout(this.timeout);
                this.timeout = null;
            }

            this.timeout = setTimeout(this.run, nextUpdate.diff(now));

            this.sentNoPasswordNotification = false;
        }
    }, {
        key: 'run',
        value: function () {
            var ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(cb) {
                var updateWeboob, checkAccounts, accesses, _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, access, accountManager;

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
                                _context.prev = 13;
                                _context.next = 16;
                                return _config2.default.findOrCreateDefaultBooleanValue('weboob-auto-merge-accounts');

                            case 16:
                                checkAccounts = _context.sent;


                                log.info('Checking new operations for all accesses...');
                                if (checkAccounts) {
                                    log.info('\t(will also check for accounts to merge)');
                                }

                                _context.next = 21;
                                return _access2.default.all();

                            case 21:
                                accesses = _context.sent;
                                _iteratorNormalCompletion = true;
                                _didIteratorError = false;
                                _iteratorError = undefined;
                                _context.prev = 25;
                                _iterator = (0, _getIterator3.default)(accesses);

                            case 27:
                                if (_iteratorNormalCompletion = (_step = _iterator.next()).done) {
                                    _context.next = 38;
                                    break;
                                }

                                access = _step.value;
                                accountManager = new _accountsManager2.default();

                                if (!checkAccounts) {
                                    _context.next = 33;
                                    break;
                                }

                                _context.next = 33;
                                return accountManager.retrieveAccountsByAccess(access, false);

                            case 33:
                                _context.next = 35;
                                return accountManager.retrieveOperationsByAccess(access, cb);

                            case 35:
                                _iteratorNormalCompletion = true;
                                _context.next = 27;
                                break;

                            case 38:
                                _context.next = 44;
                                break;

                            case 40:
                                _context.prev = 40;
                                _context.t1 = _context['catch'](25);
                                _didIteratorError = true;
                                _iteratorError = _context.t1;

                            case 44:
                                _context.prev = 44;
                                _context.prev = 45;

                                if (!_iteratorNormalCompletion && _iterator.return) {
                                    _iterator.return();
                                }

                            case 47:
                                _context.prev = 47;

                                if (!_didIteratorError) {
                                    _context.next = 50;
                                    break;
                                }

                                throw _iteratorError;

                            case 50:
                                return _context.finish(47);

                            case 51:
                                return _context.finish(44);

                            case 52:

                                // Reports
                                log.info('Maybe sending reports...');
                                _context.next = 55;
                                return _reportManager2.default.manageReports();

                            case 55:

                                // Done!
                                log.info('All accounts have been polled.');
                                this.sentNoPasswordNotification = false;
                                _context.next = 63;
                                break;

                            case 59:
                                _context.prev = 59;
                                _context.t2 = _context['catch'](13);

                                log.error('Error when polling accounts: ' + _context.t2.message);

                                if (_context.t2.code && _context.t2.code === (0, _helpers.getErrorCode)('NO_PASSWORD') && !this.sentNoPasswordNotification) {
                                    // TODO do something with this
                                    this.sentNoPasswordNotification = true;
                                }

                            case 63:
                            case 'end':
                                return _context.stop();
                        }
                    }
                }, _callee, this, [[1, 10], [13, 59], [25, 40, 44, 52], [45,, 47, 51]]);
            }));

            function run(_x) {
                return ref.apply(this, arguments);
            }

            return run;
        }()
    }, {
        key: 'runAtStartup',
        value: function () {
            var ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee2(cb) {
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
                return ref.apply(this, arguments);
            }

            return runAtStartup;
        }()
    }]);
    return Poller;
}();

var poller = new Poller();

exports.default = poller;