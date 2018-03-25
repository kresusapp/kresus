'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.fullPoll = undefined;

let manageCredentialsErrors = (() => {
    var _ref = _asyncToGenerator(function* (access, err) {
        if (!err.errCode) {
            return;
        }

        // We save the error status, so that the operations
        // are not fetched on next poll instance.
        access.fetchStatus = err.errCode;
        yield access.save();

        let bank = _bank2.default.byUuid(access.bank);
        (0, _helpers.assert)(bank, 'The bank must be known');
        bank = bank.name;

        // Retrieve the human readable error code.
        let error = (0, _helpers.translate)(`server.email.fetch_error.${err.errCode}`);
        let subject = (0, _helpers.translate)('server.email.fetch_error.subject');
        let content = (0, _helpers.translate)('server.email.hello');
        content += '\n\n';
        content += (0, _helpers.translate)('server.email.fetch_error.text', {
            bank,
            error,
            message: err.message
        });
        content += '\n';
        content += (0, _helpers.translate)('server.email.fetch_error.pause_poll');
        content += '\n\n';
        content += (0, _helpers.translate)('server.email.signature');

        log.info('Warning the user that an error was detected');
        try {
            yield _emailer2.default.sendToUser({
                subject,
                content
            });
        } catch (e) {
            log.error(`when sending an email to warn about credential errors: ${e.message}`);
        }
    });

    return function manageCredentialsErrors(_x, _x2) {
        return _ref.apply(this, arguments);
    };
})();

// Can throw.


let fullPoll = exports.fullPoll = (() => {
    var _ref2 = _asyncToGenerator(function* () {
        log.info('Checking accounts and operations for all accesses...');

        let needUpdate = yield _config2.default.findOrCreateDefaultBooleanValue('weboob-auto-update');

        let accesses = yield _access2.default.all();
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
            for (var _iterator = accesses[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                let access = _step.value;

                try {
                    // Only import if last poll did not raise a login/parameter error.
                    if (access.canBePolled()) {
                        yield _accountsManager2.default.retrieveNewAccountsByAccess(access, false, needUpdate);
                        // Update the repos only once.
                        needUpdate = false;
                        yield _accountsManager2.default.retrieveOperationsByAccess(access);
                    } else {
                        let bank = access.bank,
                            enabled = access.enabled,
                            login = access.login;

                        if (!enabled) {
                            log.info(`Won't poll, access from bank ${bank} with login ${login} is disabled.`);
                        } else {
                            let error = access.fetchStatus;
                            log.info(`Won't poll, access from bank ${bank} with login ${login} last fetch raised: ${error}.`);
                        }
                    }
                } catch (err) {
                    log.error(`Error when polling accounts: ${err.message}\n`, err);
                    if (err.errCode && (0, _helpers.errorRequiresUserAction)(err)) {
                        yield manageCredentialsErrors(access, err);
                    }
                }
            }
        } catch (err) {
            _didIteratorError = true;
            _iteratorError = err;
        } finally {
            try {
                if (!_iteratorNormalCompletion && _iterator.return) {
                    _iterator.return();
                }
            } finally {
                if (_didIteratorError) {
                    throw _iteratorError;
                }
            }
        }

        log.info('All accounts have been polled.');
        log.info('Maybe sending reports...');
        yield _reportManager2.default.manageReports();
        log.info('Reports have been sent.');
    });

    return function fullPoll() {
        return _ref2.apply(this, arguments);
    };
})();

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

var _helpers = require('../helpers');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

let log = (0, _helpers.makeLogger)('poller');

class Poller {
    constructor() {
        this.run = this.run.bind(this);
        this.cron = new _cron2.default(this.run);
    }

    programNextRun() {
        // The next run is programmed to happen the next day, at a random hour
        // in [POLLER_START_LOW; POLLER_START_HOUR].
        let delta = Math.random() * (_helpers.POLLER_START_HIGH_HOUR - _helpers.POLLER_START_LOW_HOUR) * 60 | 0;

        let nextUpdate = (0, _moment2.default)().clone().add(1, 'days').hours(_helpers.POLLER_START_LOW_HOUR).minutes(delta).seconds(0);

        let format = 'DD/MM/YYYY [at] HH:mm:ss';
        log.info(`> Next check of accounts on ${nextUpdate.format(format)}`);

        this.cron.setNextUpdate(nextUpdate);
    }

    run() {
        var _this = this;

        return _asyncToGenerator(function* () {
            try {
                // Ensure checks will continue even if we hit some error during the process.
                _this.programNextRun();
            } catch (err) {
                log.error(`Error when preparing the next check: ${err.message}`);
            }

            try {
                yield fullPoll();
            } catch (err) {
                log.error(`Error when doing an automatic poll: ${err.message}`);
            }
        })();
    }

    runAtStartup() {
        var _this2 = this;

        return _asyncToGenerator(function* () {
            try {
                yield _this2.run();
            } catch (err) {
                log.error(`when polling accounts at startup: ${err.message}`);
            }
        })();
    }
}

const poller = new Poller();

exports.default = poller;