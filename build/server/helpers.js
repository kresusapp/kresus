'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.isEmailEnabled = exports.POLLER_START_HIGH_HOUR = exports.POLLER_START_LOW_HOUR = exports.MIN_WEBOOB_VERSION = exports.formatDate = exports.setupTranslator = exports.UNKNOWN_OPERATION_TYPE = exports.currency = exports.translate = exports.assert = exports.has = undefined;
exports.makeLogger = makeLogger;
exports.KError = KError;
exports.getErrorCode = getErrorCode;
exports.asyncErr = asyncErr;
exports.promisify = promisify;
exports.promisifyModel = promisifyModel;
exports.errorRequiresUserAction = errorRequiresUserAction;
exports.normalizeVersion = normalizeVersion;
exports.checkWeboobMinimalVersion = checkWeboobMinimalVersion;

var _semver = require('semver');

var _semver2 = _interopRequireDefault(_semver);

var _helpers = require('./shared/helpers.js');

var _errors = require('./shared/errors.json');

var _errors2 = _interopRequireDefault(_errors);

var _logger = require('./lib/logger');

var _logger2 = _interopRequireDefault(_logger);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const has = exports.has = _helpers.maybeHas;
const assert = exports.assert = _helpers.assert;
const translate = exports.translate = _helpers.translate;
const currency = exports.currency = _helpers.currency;
const UNKNOWN_OPERATION_TYPE = exports.UNKNOWN_OPERATION_TYPE = _helpers.UNKNOWN_OPERATION_TYPE;
const setupTranslator = exports.setupTranslator = _helpers.setupTranslator;
const formatDate = exports.formatDate = _helpers.formatDate;
const MIN_WEBOOB_VERSION = exports.MIN_WEBOOB_VERSION = _helpers.MIN_WEBOOB_VERSION;

function makeLogger(prefix) {
    return new _logger2.default(prefix);
}

let log = makeLogger('helpers');

function KError(msg = 'Internal server error', statusCode = 500, errCode = null, shortMessage = null) {
    this.message = msg;
    this.shortMessage = shortMessage;
    this.errCode = errCode;
    this.stack = Error().stack;
    if (statusCode === null) {
        switch (errCode) {
            case _errors2.default.INVALID_PARAMETERS:
            case _errors2.default.NO_PASSWORD:
                this.statusCode = 400;
                break;
            case _errors2.default.INVALID_PASSWORD:
                this.statusCode = 401;
                break;
            case _errors2.default.ACTION_NEEDED:
            case _errors2.default.EXPIRED_PASSWORD:
            case _errors2.default.DISABLED_ACCESS:
                this.statusCode = 403;
                break;
            case _errors2.default.WEBOOB_NOT_INSTALLED:
            case _errors2.default.GENERIC_EXCEPTION:
            case _errors2.default.INTERNAL_ERROR:
            case _errors2.default.NO_ACCOUNTS:
            case _errors2.default.UNKNOWN_WEBOOB_MODULE:
            case _errors2.default.CONNECTION_ERROR:
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
    if (typeof _errors2.default[name] !== 'undefined') {
        return _errors2.default[name];
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
        }
        statusCode = 500;
        errCode = null;
    }

    let message = err.message,
        shortMessage = err.shortMessage;


    log.error(`${context}: ${message}`);

    res.status(statusCode).send({
        code: errCode,
        shortMessage,
        message
    });

    return false;
}

// Transforms a function of the form (arg1, arg2, ..., argN, callback) into a
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
            });
            // Call the callback-based function
            func.apply(this, args);
        });
    };
}

// Promisifies a few cozy-db methods by default
function promisifyModel(model) {
    const statics = ['exists', 'find', 'create', 'save', 'updateAttributes', 'destroy', 'all'];

    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
        for (var _iterator = statics[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            let name = _step.value;

            let former = model[name];
            model[name] = promisify(former.bind(model));
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

    const methods = ['save', 'updateAttributes', 'destroy'];

    var _iteratorNormalCompletion2 = true;
    var _didIteratorError2 = false;
    var _iteratorError2 = undefined;

    try {
        for (var _iterator2 = methods[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
            let name = _step2.value;

            let former = model.prototype[name];
            model.prototype[name] = promisify(former);
        }
    } catch (err) {
        _didIteratorError2 = true;
        _iteratorError2 = err;
    } finally {
        try {
            if (!_iteratorNormalCompletion2 && _iterator2.return) {
                _iterator2.return();
            }
        } finally {
            if (_didIteratorError2) {
                throw _iteratorError2;
            }
        }
    }

    return model;
}

function errorRequiresUserAction(err) {
    return err.errCode === getErrorCode('INVALID_PASSWORD') || err.errCode === getErrorCode('EXPIRED_PASSWORD') || err.errCode === getErrorCode('INVALID_PARAMETERS') || err.errCode === getErrorCode('NO_PASSWORD') || err.errCode === getErrorCode('ACTION_NEEDED');
}

// Minimum hour of the day at which the automatic poll can occur.
const POLLER_START_LOW_HOUR = exports.POLLER_START_LOW_HOUR = 2;

// Maximum hour of the day at which the automatic poll can occur.
const POLLER_START_HIGH_HOUR = exports.POLLER_START_HIGH_HOUR = 4;

const isEmailEnabled = exports.isEmailEnabled = () => {
    return !!(process.kresus.emailFrom && process.kresus.emailFrom.length && (process.kresus.emailTransport === 'smtp' && process.kresus.smtpHost && process.kresus.smtpPort || process.kresus.emailTransport === 'sendmail'));
};

function normalizeVersion(version) {
    if (typeof version === 'undefined' || version === null) {
        return null;
    }
    let stringifiedVersion = version.toString();
    let cleanedVersion = _semver2.default.clean(stringifiedVersion);
    if (cleanedVersion !== null) {
        return cleanedVersion;
    }

    if (!/\d/.test(stringifiedVersion)) {
        throw new Error(`version should contain numbers: ${version}`);
    }

    let digits = stringifiedVersion.split('.');
    // Eliminate extra digits
    digits = digits.slice(0, 3);
    // Fill missing digits
    while (digits.length < 3) {
        digits.push('0');
    }
    // Replace fully string version with '0'
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
    return (0, _semver2.default)(normalizedVersion) && _semver2.default.gte(normalizedVersion, normalizeVersion(MIN_WEBOOB_VERSION));
}