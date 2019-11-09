"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.fullPoll = fullPoll;
exports.default = void 0;

var _moment = _interopRequireDefault(require("moment"));

var _accesses = _interopRequireDefault(require("../models/accesses"));

var _settings = _interopRequireDefault(require("../models/settings"));

var _users = _interopRequireDefault(require("../models/users"));

var _accountsManager = _interopRequireDefault(require("./accounts-manager"));

var _cron = _interopRequireDefault(require("./cron"));

var _reportManager = _interopRequireDefault(require("./report-manager"));

var _emailer = _interopRequireDefault(require("./emailer"));

var _bankVendors = require("./bank-vendors");

var _helpers = require("../helpers");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

let log = (0, _helpers.makeLogger)('poller');

function manageCredentialsErrors(_x, _x2, _x3) {
  return _manageCredentialsErrors.apply(this, arguments);
} // Can throw.


function _manageCredentialsErrors() {
  _manageCredentialsErrors = _asyncToGenerator(function* (userId, access, err) {
    if (!err.errCode) {
      return;
    }

    let bank = (0, _bankVendors.bankVendorByUuid)(access.vendorId);
    (0, _helpers.assert)(bank, 'The bank must be known');
    bank = access.customLabel || bank.name; // Retrieve the human readable error code.

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
      yield _emailer.default.sendToUser(userId, {
        subject,
        content
      });
    } catch (e) {
      log.error(`when sending an email to warn about credential errors: ${e.message}`);
    }
  });
  return _manageCredentialsErrors.apply(this, arguments);
}

function fullPoll(_x4) {
  return _fullPoll.apply(this, arguments);
}

function _fullPoll() {
  _fullPoll = _asyncToGenerator(function* (userId) {
    log.info('Checking accounts and operations for all accesses...');
    let needUpdate = yield _settings.default.findOrCreateDefaultBooleanValue(userId, 'weboob-auto-update');
    let accesses = yield _accesses.default.all(userId);
    var _iteratorNormalCompletion2 = true;
    var _didIteratorError2 = false;
    var _iteratorError2 = undefined;

    try {
      for (var _iterator2 = accesses[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
        let access = _step2.value;

        try {
          let vendorId = access.vendorId,
              login = access.login; // Don't try to fetch accesses for deprecated modules.

          let staticBank = (0, _bankVendors.bankVendorByUuid)(vendorId);

          if (!staticBank || staticBank.deprecated) {
            log.info(`Won't poll, module for bank ${vendorId} with login ${login} is deprecated.`);
            continue;
          } // Only import if last poll did not raise a login/parameter error.


          if (access.canBePolled()) {
            yield _accountsManager.default.retrieveNewAccountsByAccess(userId, access, false, needUpdate); // Update the repos only once.

            needUpdate = false;
            yield _accountsManager.default.retrieveOperationsByAccess(userId, access);
          } else if (!access.isEnabled()) {
            log.info(`Won't poll, access from bank ${vendorId} with login ${login} is disabled.`);
          } else {
            let error = access.fetchStatus;
            log.info(`Won't poll, access from bank ${vendorId} with login ${login} last fetch raised: ${error}.`);
          }
        } catch (err) {
          log.error(`Error when polling accounts: ${err.message}\n`, err);

          if (err.errCode && (0, _helpers.errorRequiresUserAction)(err)) {
            yield manageCredentialsErrors(userId, access, err);
          }
        }
      }
    } catch (err) {
      _didIteratorError2 = true;
      _iteratorError2 = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion2 && _iterator2.return != null) {
          _iterator2.return();
        }
      } finally {
        if (_didIteratorError2) {
          throw _iteratorError2;
        }
      }
    }

    log.info('All accounts have been polled.');
    log.info('Maybe sending reports...');
    yield _reportManager.default.manageReports(userId);
    log.info('Reports have been sent.');
  });
  return _fullPoll.apply(this, arguments);
}

class Poller {
  constructor() {
    this.run = this.run.bind(this);
    this.cron = new _cron.default(this.run);
  }

  programNextRun() {
    // The next run is programmed to happen the next day, at a random hour
    // in [POLLER_START_LOW; POLLER_START_HOUR].
    let delta = Math.random() * (_helpers.POLLER_START_HIGH_HOUR - _helpers.POLLER_START_LOW_HOUR) * 60 | 0;
    let nextUpdate = (0, _moment.default)().clone().add(1, 'days').hours(_helpers.POLLER_START_LOW_HOUR).minutes(delta).seconds(0);
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
        let users = yield _users.default.all();
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
          for (var _iterator = users[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            let user = _step.value;

            // If polling fails for a user, log the error and continue.
            try {
              yield fullPoll(user.id);
            } catch (err) {
              log.error(`Error when doing poll for user with id=${user.id}: ${err.message}`);
            }
          }
        } catch (err) {
          _didIteratorError = true;
          _iteratorError = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion && _iterator.return != null) {
              _iterator.return();
            }
          } finally {
            if (_didIteratorError) {
              throw _iteratorError;
            }
          }
        }
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
var _default = poller;
exports.default = _default;