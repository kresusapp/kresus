"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.testInstall = testInstall;
exports.getVersion = getVersion;
exports.fetchAccounts = fetchAccounts;
exports.fetchOperations = fetchOperations;
exports.updateWeboobModules = updateWeboobModules;
exports.testing = exports.SOURCE_NAME = void 0;

var _child_process = require("child_process");

var path = _interopRequireWildcard(require("path"));

var _helpers = require("../../helpers");

var _errors = require("../../shared/errors.json");

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

let log = (0, _helpers.makeLogger)('sources/weboob');
const ARGPARSE_MALFORMED_OPTIONS_CODE = 2;
const SOURCE_NAME = 'weboob'; // A map to store session information attached to an access (cookies, last visited URL...).
// The access' id is the key to get the session information.

exports.SOURCE_NAME = SOURCE_NAME;
const SessionsMap = new Map(); // The list of errors which should trigger a reset of the session when raised.

const RESET_SESSION_ERRORS = [_errors.INVALID_PARAMETERS, _errors.INVALID_PASSWORD, _errors.EXPIRED_PASSWORD]; // Possible commands include:
// - test: test whether weboob is accessible from the current kresus user.
// - version: get weboob's version number.
// - update: updates weboob modules.
// All the following commands require $bank $login $password $customFields:
// - accounts
// - operations
// To enable Weboob debug, one should pass an extra `--debug` argument.

function callWeboob(command, access, debug = false, forceUpdate = false) {
  return new Promise((accept, reject) => {
    log.info(`Calling weboob: command ${command}...`); // We need to copy the whole `process.env` to ensure we don't break any
    // user setup, such as virtualenvs, NODE_ENV, etc.

    let env = _objectSpread({}, process.env);

    if (process.kresus.weboobDir) {
      env.WEBOOB_DIR = process.kresus.weboobDir;
    }

    if (process.kresus.weboobSourcesList) {
      env.WEBOOB_SOURCES_LIST = process.kresus.weboobSourcesList;
    }

    env.KRESUS_DIR = process.kresus.dataDir; // Variable for PyExecJS, necessary for the Paypal module.

    env.EXECJS_RUNTIME = 'Node';
    let weboobArgs = [command];

    if (debug) {
      weboobArgs.push('--debug');
    }

    if (forceUpdate) {
      weboobArgs.push('--update');
      log.info(`Weboob will be updated prior to command "${command}"`);
    }

    if (command === 'accounts' || command === 'operations') {
      weboobArgs.push('--module', access.bank, '--login', access.login); // Pass the password via an environment variable to hide it.

      env.KRESUS_WEBOOB_PWD = access.password; // Pass the session information as environment variable to hide it.

      if (SessionsMap.has(access.id)) {
        env.KRESUS_WEBOOB_SESSION = JSON.stringify(SessionsMap.get(access.id));
      }

      if (typeof access.customFields !== 'undefined') {
        try {
          let customFields = JSON.parse(access.customFields);
          var _iteratorNormalCompletion = true;
          var _didIteratorError = false;
          var _iteratorError = undefined;

          try {
            for (var _iterator = customFields[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
              let _step$value = _step.value,
                  name = _step$value.name,
                  value = _step$value.value;

              if (typeof name === 'undefined' || typeof value === 'undefined') {
                throw new Error();
              }

              weboobArgs.push('--field', name, value);
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
          log.error(`Invalid JSON for customFields: ${access.customFields}`);
          return reject(new _helpers.KError(`Invalid JSON for customFields: ${access.customFields}`, null, _errors.INVALID_PARAMETERS));
        }
      }
    }

    let script = (0, _child_process.spawn)(process.kresus.pythonExec, [path.join(path.dirname(__filename), '..', '..', 'weboob/main.py')].concat(weboobArgs), {
      env
    });
    let stdout = Buffer.from('');
    script.stdout.on('data', data => {
      stdout = Buffer.concat([stdout, data]);
    });
    let stderr = Buffer.from('');
    script.stderr.on('data', data => {
      stderr = Buffer.concat([stderr, data]);
    });
    script.on('close', code => {
      log.info(`exited with code ${code}.`);
      stderr = stderr.toString('utf8');
      stdout = stdout.toString('utf8');

      if (stderr.trim().length) {
        // Log anything that went to stderr.
        log.warn(`stderr: ${stderr}`);
      } // Parse JSON response
      // Any error (be it a crash of the Python script or a legit error
      // from Weboob) will result in a non-zero error code. Hence, we
      // should first try to parse stdout as JSON, to retrieve an
      // eventual legit error, and THEN check the return code.


      try {
        stdout = JSON.parse(stdout);
      } catch (e) {
        // We got an invalid JSON response, there is a real and
        // important error.
        if (code === ARGPARSE_MALFORMED_OPTIONS_CODE) {
          return reject(new _helpers.KError('Options are malformed', null, _errors.INTERNAL_ERROR));
        }

        if (code !== 0) {
          // If code is non-zero, treat as stderr, that is a crash of
          // the Python script.
          return reject(new _helpers.KError(`Process exited with non-zero error code ${code}. Unknown error. Stderr was ${stderr}`));
        } // Else, treat it as invalid JSON
        // This should never happen, it would be a programming error.


        return reject(new _helpers.KError(`Invalid JSON response: ${e.message}.`));
      } // If valid JSON output, check for an error within JSON


      if (typeof stdout.error_code !== 'undefined') {
        log.info('Command returned an error code.');

        if (access && stdout.error_code in RESET_SESSION_ERRORS && SessionsMap.has(access.id)) {
          log.warn(`Resetting session for access from bank ${access.bank} with login ${access.login}`);
          SessionsMap.delete(access.id);
        }

        return reject(new _helpers.KError(stdout.error_message ? stdout.error_message : stdout.error_code, null, stdout.error_code, stdout.error_short));
      }

      log.info('OK: weboob exited normally with non-empty JSON content.');

      if (access && stdout.session) {
        log.info(`Saving session for access from bank ${access.bank} with login ${access.login}`);
        SessionsMap.set(access.id, stdout.session);
      }

      accept(stdout.values);
    });
  });
}

let cachedWeboobVersion = 0;

function testInstall() {
  return _testInstall.apply(this, arguments);
}

function _testInstall() {
  _testInstall = _asyncToGenerator(function* () {
    try {
      log.info('Checking that weboob is installed and can actually be called…');
      yield callWeboob('test');
      return true;
    } catch (err) {
      log.error(`When testing install: ${err}`);
      cachedWeboobVersion = 0;
      return false;
    }
  });
  return _testInstall.apply(this, arguments);
}

function getVersion() {
  return _getVersion.apply(this, arguments);
}

function _getVersion() {
  _getVersion = _asyncToGenerator(function* (forceFetch = false) {
    if (cachedWeboobVersion === 0 || !(0, _helpers.checkWeboobMinimalVersion)(cachedWeboobVersion) || forceFetch) {
      try {
        cachedWeboobVersion = yield callWeboob('version');

        if (cachedWeboobVersion === '?') {
          cachedWeboobVersion = 0;
        }
      } catch (err) {
        log.error(`When getting Weboob version: ${err}`);
        cachedWeboobVersion = 0;
      }
    }

    return cachedWeboobVersion;
  });
  return _getVersion.apply(this, arguments);
}

function _fetchHelper(_x, _x2, _x3) {
  return _fetchHelper2.apply(this, arguments);
}

function _fetchHelper2() {
  _fetchHelper2 = _asyncToGenerator(function* (command, access, isDebugEnabled, forceUpdate = false) {
    try {
      return yield callWeboob(command, access, isDebugEnabled, forceUpdate);
    } catch (err) {
      if ([_errors.WEBOOB_NOT_INSTALLED, _errors.INTERNAL_ERROR, _errors.GENERIC_EXCEPTION, _errors.UNKNOWN_WEBOOB_MODULE].includes(err.errCode) && !(yield testInstall())) {
        throw new _helpers.KError("Weboob doesn't seem to be installed, skipping fetch.", null, _errors.WEBOOB_NOT_INSTALLED);
      }

      log.error(`Got error while running command "${command}": ${err.message}`);

      if (typeof err.errCode !== 'undefined') {
        log.error(`\t(error code: ${err.errCode})`);
      }

      throw err;
    }
  });
  return _fetchHelper2.apply(this, arguments);
}

function fetchAccounts(_x4) {
  return _fetchAccounts.apply(this, arguments);
}

function _fetchAccounts() {
  _fetchAccounts = _asyncToGenerator(function* ({
    access,
    debug,
    update
  }) {
    return yield _fetchHelper('accounts', access, debug, update);
  });
  return _fetchAccounts.apply(this, arguments);
}

function fetchOperations(_x5) {
  return _fetchOperations.apply(this, arguments);
} // Can throw.


function _fetchOperations() {
  _fetchOperations = _asyncToGenerator(function* ({
    access,
    debug
  }) {
    return yield _fetchHelper('operations', access, debug);
  });
  return _fetchOperations.apply(this, arguments);
}

function updateWeboobModules() {
  return _updateWeboobModules.apply(this, arguments);
}

function _updateWeboobModules() {
  _updateWeboobModules = _asyncToGenerator(function* () {
    yield callWeboob('test',
    /* access = */
    {},
    /* debug = */
    false,
    /* forceUpdate = */
    true);
  });
  return _updateWeboobModules.apply(this, arguments);
}

const testing = {
  callWeboob,
  SessionsMap
};
exports.testing = testing;