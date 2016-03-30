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

var _errors = require('../controllers/errors');

var _errors2 = _interopRequireDefault(_errors);

var _helpers = require('../helpers');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var log = (0, _helpers.makeLogger)('poller');

var Poller = function () {
    function Poller() {
        (0, _classCallCheck3.default)(this, Poller);

        this.prepareNextCheck();
        this.timeout = null;
    }

    (0, _createClass3.default)(Poller, [{
        key: 'prepareNextCheck',
        value: function prepareNextCheck() {

            if (this.timeout !== null) {
                clearTimeout(this.timeout);
                this.timeout = null;
            }

            // day after between 02:00am and 04:00am UTC
            var delta = Math.random() * 120 | 0;
            var now = (0, _moment2.default)();
            var nextUpdate = now.clone().add(1, 'days').hours(2).minutes(delta).seconds(0);

            var format = 'DD/MM/YYYY [at] HH:mm:ss';
            log.info('> Next check of accounts on ' + nextUpdate.format(format));

            this.timeout = setTimeout(this.checkAllAccesses.bind(this), nextUpdate.diff(now));

            this.sentNoPasswordNotification = false;
        }
    }, {
        key: 'checkAllAccesses',
        value: function () {
            var ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(cb) {
                var updateWeboob, checkAccounts, accesses, _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, access, accountManager;

                return _regenerator2.default.wrap(function _callee$(_context) {
                    while (1) {
                        switch (_context.prev = _context.next) {
                            case 0:
                                _context.prev = 0;
                                _context.next = 3;
                                return _config2.default.findOrCreateDefaultBooleanValue('weboob-auto-update');

                            case 3:
                                updateWeboob = _context.sent;

                                if (!updateWeboob) {
                                    _context.next = 7;
                                    break;
                                }

                                _context.next = 7;
                                return weboob.updateWeboobModules();

                            case 7:
                                _context.next = 12;
                                break;

                            case 9:
                                _context.prev = 9;
                                _context.t0 = _context['catch'](0);

                                log.error('Error when updating Weboob in polling: ' + _context.t0.message);

                            case 12:
                                _context.prev = 12;
                                _context.next = 15;
                                return _config2.default.findOrCreateDefaultBooleanValue('weboob-auto-merge-accounts');

                            case 15:
                                checkAccounts = _context.sent;


                                log.info('Checking new operations for all accesses...');
                                if (checkAccounts) {
                                    log.info('\t(will also check for accounts to merge)');
                                }

                                _context.next = 20;
                                return _access2.default.all();

                            case 20:
                                accesses = _context.sent;
                                _iteratorNormalCompletion = true;
                                _didIteratorError = false;
                                _iteratorError = undefined;
                                _context.prev = 24;
                                _iterator = (0, _getIterator3.default)(accesses);

                            case 26:
                                if (_iteratorNormalCompletion = (_step = _iterator.next()).done) {
                                    _context.next = 37;
                                    break;
                                }

                                access = _step.value;
                                accountManager = new _accountsManager2.default();

                                if (!checkAccounts) {
                                    _context.next = 32;
                                    break;
                                }

                                _context.next = 32;
                                return accountManager.retrieveAccountsByAccess(access, false);

                            case 32:
                                _context.next = 34;
                                return accountManager.retrieveOperationsByAccess(access, cb);

                            case 34:
                                _iteratorNormalCompletion = true;
                                _context.next = 26;
                                break;

                            case 37:
                                _context.next = 43;
                                break;

                            case 39:
                                _context.prev = 39;
                                _context.t1 = _context['catch'](24);
                                _didIteratorError = true;
                                _iteratorError = _context.t1;

                            case 43:
                                _context.prev = 43;
                                _context.prev = 44;

                                if (!_iteratorNormalCompletion && _iterator.return) {
                                    _iterator.return();
                                }

                            case 46:
                                _context.prev = 46;

                                if (!_didIteratorError) {
                                    _context.next = 49;
                                    break;
                                }

                                throw _iteratorError;

                            case 49:
                                return _context.finish(46);

                            case 50:
                                return _context.finish(43);

                            case 51:

                                // Reports
                                log.info('Maybe sending reports...');
                                _context.next = 54;
                                return _reportManager2.default.manageReports();

                            case 54:

                                // Done!
                                log.info('All accounts have been polled.');
                                this.prepareNextCheck();
                                this.sentNoPasswordNotification = false;
                                _context.next = 63;
                                break;

                            case 59:
                                _context.prev = 59;
                                _context.t2 = _context['catch'](12);

                                log.error('Error when polling accounts: ' + _context.t2.toString());

                                if (_context.t2.code && _context.t2.code === (0, _errors2.default)('NO_PASSWORD') && !this.sentNoPasswordNotification) {
                                    // TODO do something with this
                                    this.sentNoPasswordNotification = true;
                                }

                            case 63:
                            case 'end':
                                return _context.stop();
                        }
                    }
                }, _callee, this, [[0, 9], [12, 59], [24, 39, 43, 51], [44,, 46, 50]]);
            }));

            function checkAllAccesses(_x) {
                return ref.apply(this, arguments);
            }

            return checkAllAccesses;
        }()
    }, {
        key: 'runAtStartup',
        value: function () {
            var ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee2(callback) {
                return _regenerator2.default.wrap(function _callee2$(_context2) {
                    while (1) {
                        switch (_context2.prev = _context2.next) {
                            case 0:
                                _context2.prev = 0;
                                _context2.next = 3;
                                return this.checkAllAccesses(callback);

                            case 3:
                                _context2.next = 8;
                                break;

                            case 5:
                                _context2.prev = 5;
                                _context2.t0 = _context2['catch'](0);

                                log.error('when polling accounts at startup: ' + _context2.t0.toString());

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