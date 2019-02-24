"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.makeLogger = makeLogger;
exports.assert = assert;
exports.displayLabel = displayLabel;
exports.KError = KError;
exports.getErrorCode = getErrorCode;
exports.asyncErr = asyncErr;
exports.promisify = promisify;
exports.promisifyModel = promisifyModel;
exports.errorRequiresUserAction = errorRequiresUserAction;
exports.normalizeVersion = normalizeVersion;
exports.checkWeboobMinimalVersion = checkWeboobMinimalVersion;
exports.isEmailEnabled = exports.POLLER_START_HIGH_HOUR = exports.POLLER_START_LOW_HOUR = exports.MIN_WEBOOB_VERSION = exports.formatDate = exports.setupTranslator = exports.UNKNOWN_ACCOUNT_TYPE = exports.UNKNOWN_OPERATION_TYPE = exports.currency = exports.translate = exports.has = void 0;

var _semver = _interopRequireDefault(require("semver"));

var _helpers = require("./shared/helpers.js");

var _errors = _interopRequireDefault(require("./shared/errors.json"));

var _logger = _interopRequireDefault(require("./lib/logger"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

const has = _helpers.maybeHas;
exports.has = has;
const translate = _helpers.translate;
exports.translate = translate;
const currency = _helpers.currency;
exports.currency = currency;
const UNKNOWN_OPERATION_TYPE = _helpers.UNKNOWN_OPERATION_TYPE;
exports.UNKNOWN_OPERATION_TYPE = UNKNOWN_OPERATION_TYPE;
const UNKNOWN_ACCOUNT_TYPE = _helpers.UNKNOWN_ACCOUNT_TYPE;
exports.UNKNOWN_ACCOUNT_TYPE = UNKNOWN_ACCOUNT_TYPE;
const setupTranslator = _helpers.setupTranslator;
exports.setupTranslator = setupTranslator;
const formatDate = _helpers.formatDate;
exports.formatDate = formatDate;
const MIN_WEBOOB_VERSION = _helpers.MIN_WEBOOB_VERSION;
exports.MIN_WEBOOB_VERSION = MIN_WEBOOB_VERSION;

function makeLogger(prefix) {
  return new _logger.default(prefix);
}

let log = makeLogger('helpers');

function assert(x, wat) {
  if (!x) {
    let text = `Assertion error: ${wat ? wat : ''}\n${new Error().stack}`;
    log.error(text);
    throw new Error(text);
  }
}

function displayLabel(obj) {
  if (!(0, _helpers.maybeHas)(obj, 'title')) {
    log.error('The parameter of displayLabel shall have "title" property.');
  }

  return obj.customLabel || obj.title;
}

function KError(msg = 'Internal server error', statusCode = 500, errCode = null, shortMessage = null) {
  this.message = msg;
  this.shortMessage = shortMessage;
  this.errCode = errCode;
  this.stack = Error().stack;

  if (statusCode === null) {
    switch (errCode) {
      case _errors.default.INVALID_PARAMETERS:
      case _errors.default.NO_PASSWORD:
      case _errors.default.INVALID_ENCRYPTED_EXPORT:
      case _errors.default.INVALID_PASSWORD_JSON_EXPORT:
        this.statusCode = 400;
        break;

      case _errors.default.INVALID_PASSWORD:
        this.statusCode = 401;
        break;

      case _errors.default.ACTION_NEEDED:
      case _errors.default.EXPIRED_PASSWORD:
      case _errors.default.DISABLED_ACCESS:
        this.statusCode = 403;
        break;

      case _errors.default.WEBOOB_NOT_INSTALLED:
      case _errors.default.GENERIC_EXCEPTION:
      case _errors.default.INTERNAL_ERROR:
      case _errors.default.NO_ACCOUNTS:
      case _errors.default.UNKNOWN_WEBOOB_MODULE:
      case _errors.default.CONNECTION_ERROR:
        this.statusCode = 500;
        break;

      default:
        this.statusCode = 500;
        break;
    }
  } else {
    this.statusCode = statusCode;
  }
}

KError.prototype = new Error();
KError.prototype.name = 'KError';

function getErrorCode(name) {
  if (typeof _errors.default[name] !== 'undefined') {
    return _errors.default[name];
  }

  throw new KError('Unknown error code!');
}

function asyncErr(res, err, context) {
  let statusCode;
  let errCode;

  if (err instanceof KError) {
    statusCode = err.statusCode;
    errCode = err.errCode;
  } else {
    if (!(err instanceof Error)) {
      log.warn('err should be either a KError or an Error');
    } // If it exists, use the status set by cozy-db/pouchdb.


    statusCode = err.status ? err.status : 500;
    errCode = null;
  }

  let message = err.message,
      shortMessage = err.shortMessage;
  log.error(`${context}: ${message}`);
  log.info(err.stack);
  res.status(statusCode).send({
    code: errCode,
    shortMessage,
    message
  });
  return false;
} // Transforms a function of the form (arg1, arg2, ..., argN, callback) into a
// Promise-based function (arg1, arg2, ..., argN) that will resolve with the
// results of the callback if there's no error, or reject if there's any error.
// TODO How to make sure the function hasn't been passed to promisify once
// already?


function promisify(func) {
  return function (...args) {
    // Note: "this" is extracted from this scope.
    return new Promise((accept, reject) => {
      // Add the callback function to the list of args
      args.push((err, ...rest) => {
        if (typeof err !== 'undefined' && err !== null) {
          reject(err);
          return;
        }

        if (rest.length === 1) {
          accept(rest[0]);
        } else {
          accept(...rest);
        }
      }); // Call the callback-based function

      func.apply(this, args);
    });
  };
} // Promisifies a few cozy-db methods by default


function promisifyModel(Model) {
  const statics = ['exists', 'find', 'create', 'destroy', 'all'];

  for (var _i = 0; _i < statics.length; _i++) {
    let name = statics[_i];
    let former = Model[name];
    Model[name] = promisify(former.bind(Model));
  } // Theses methods have to be bound directly from the adapter of the model,
  // as the model methods are already bound to the cozy-db model.
  // The others cannot because the generic cozy-db model does extra
  // processing on data.


  const adapters = ['updateAttributes'];

  for (var _i2 = 0; _i2 < adapters.length; _i2++) {
    let name = adapters[_i2];
    let former = Model.adapter[name];
    let promisifiedFunc = promisify(former);

    Model[name] =
    /*#__PURE__*/
    function () {
      var _ref = _asyncToGenerator(function* (...args) {
        return new Model((yield promisifiedFunc.call(Model, ...args)));
      });

      return function () {
        return _ref.apply(this, arguments);
      };
    }();
  }

  const deprecatedStatics = [{
    method: 'save',
    fallback: 'updateAttributes'
  }];

  for (var _i3 = 0; _i3 < deprecatedStatics.length; _i3++) {
    let _deprecatedStatics$_i = deprecatedStatics[_i3],
        method = _deprecatedStatics$_i.method,
        fallback = _deprecatedStatics$_i.fallback;

    Model[method] = function () {
      assert(false, `Method ${method} is deprecated for model ${Model.displayName}.
Please use ${fallback} instead.`);
    };
  }

  const deprecatedMethods = ['save', 'updateAttributes', 'destroy'];

  for (var _i4 = 0; _i4 < deprecatedMethods.length; _i4++) {
    let name = deprecatedMethods[_i4];

    Model.prototype[name] = function () {
      assert(false, `Method ${name} is deprecated for model ${Model.displayName}.
Please use static method instead.`);
    };
  }

  return Model;
}

function errorRequiresUserAction(err) {
  return err.errCode === getErrorCode('INVALID_PASSWORD') || err.errCode === getErrorCode('EXPIRED_PASSWORD') || err.errCode === getErrorCode('INVALID_PARAMETERS') || err.errCode === getErrorCode('NO_PASSWORD') || err.errCode === getErrorCode('ACTION_NEEDED');
} // Minimum hour of the day at which the automatic poll can occur.


const POLLER_START_LOW_HOUR = 2; // Maximum hour of the day at which the automatic poll can occur.

exports.POLLER_START_LOW_HOUR = POLLER_START_LOW_HOUR;
const POLLER_START_HIGH_HOUR = 4;
exports.POLLER_START_HIGH_HOUR = POLLER_START_HIGH_HOUR;

const isEmailEnabled = () => {
  return !!(process.kresus.emailFrom && process.kresus.emailFrom.length && (process.kresus.emailTransport === 'smtp' && process.kresus.smtpHost && process.kresus.smtpPort || process.kresus.emailTransport === 'sendmail'));
};

exports.isEmailEnabled = isEmailEnabled;

function normalizeVersion(version) {
  if (typeof version === 'undefined' || version === null) {
    return null;
  }

  let stringifiedVersion = version.toString();

  let cleanedVersion = _semver.default.clean(stringifiedVersion);

  if (cleanedVersion !== null) {
    return cleanedVersion;
  }

  if (!/\d/.test(stringifiedVersion)) {
    throw new Error(`version should contain numbers: ${version}`);
  }

  let digits = stringifiedVersion.split('.'); // Eliminate extra digits

  digits = digits.slice(0, 3); // Fill missing digits

  while (digits.length < 3) {
    digits.push('0');
  } // Replace fully string version with '0'


  digits = digits.map(digit => {
    if (typeof digit === 'string' && /^\D*$/.test(digit)) {
      return '0';
    }

    return digit;
  });
  return digits.join('.');
}

function checkWeboobMinimalVersion(version) {
  let normalizedVersion = normalizeVersion(version);
  return (0, _semver.default)(normalizedVersion) && _semver.default.gte(normalizedVersion, normalizeVersion(MIN_WEBOOB_VERSION));
}