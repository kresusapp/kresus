"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isAppriseApiEnabled = exports.isEmailEnabled = exports.POLLER_START_HIGH_HOUR = exports.POLLER_START_LOW_HOUR = exports.KError = exports.INTERNAL_TRANSFER_TYPE = exports.DEFERRED_CARD_TYPE = exports.TRANSACTION_CARD_TYPE = exports.FETCH_STATUS_SUCCESS = exports.shouldIncludeInOutstandingSum = exports.shouldIncludeInBalance = exports.UNKNOWN_WOOB_VERSION = exports.MIN_WOOB_VERSION = exports.formatDate = exports.UNKNOWN_ACCOUNT_TYPE = exports.UNKNOWN_TRANSACTION_TYPE = exports.currency = exports.translate = exports.has = void 0;
exports.makeLogger = makeLogger;
exports.panic = panic;
exports.assert = assert;
exports.unwrap = unwrap;
exports.displayLabel = displayLabel;
exports.getErrorCode = getErrorCode;
exports.asyncErr = asyncErr;
exports.errorRequiresUserAction = errorRequiresUserAction;
exports.normalizeVersion = normalizeVersion;
exports.checkMinimalWoobVersion = checkMinimalWoobVersion;
exports.makeUrlPrefixRegExp = makeUrlPrefixRegExp;
exports.currencyFormatter = currencyFormatter;
const semver_1 = __importDefault(require("semver"));
const helpers_1 = require("./shared/helpers");
Object.defineProperty(exports, "has", { enumerable: true, get: function () { return helpers_1.maybeHas; } });
Object.defineProperty(exports, "translate", { enumerable: true, get: function () { return helpers_1.translate; } });
Object.defineProperty(exports, "currency", { enumerable: true, get: function () { return helpers_1.currency; } });
Object.defineProperty(exports, "UNKNOWN_TRANSACTION_TYPE", { enumerable: true, get: function () { return helpers_1.UNKNOWN_TRANSACTION_TYPE; } });
Object.defineProperty(exports, "UNKNOWN_ACCOUNT_TYPE", { enumerable: true, get: function () { return helpers_1.UNKNOWN_ACCOUNT_TYPE; } });
Object.defineProperty(exports, "formatDate", { enumerable: true, get: function () { return helpers_1.formatDate; } });
Object.defineProperty(exports, "MIN_WOOB_VERSION", { enumerable: true, get: function () { return helpers_1.MIN_WOOB_VERSION; } });
Object.defineProperty(exports, "UNKNOWN_WOOB_VERSION", { enumerable: true, get: function () { return helpers_1.UNKNOWN_WOOB_VERSION; } });
Object.defineProperty(exports, "shouldIncludeInBalance", { enumerable: true, get: function () { return helpers_1.shouldIncludeInBalance; } });
Object.defineProperty(exports, "shouldIncludeInOutstandingSum", { enumerable: true, get: function () { return helpers_1.shouldIncludeInOutstandingSum; } });
Object.defineProperty(exports, "FETCH_STATUS_SUCCESS", { enumerable: true, get: function () { return helpers_1.FETCH_STATUS_SUCCESS; } });
Object.defineProperty(exports, "TRANSACTION_CARD_TYPE", { enumerable: true, get: function () { return helpers_1.TRANSACTION_CARD_TYPE; } });
Object.defineProperty(exports, "DEFERRED_CARD_TYPE", { enumerable: true, get: function () { return helpers_1.DEFERRED_CARD_TYPE; } });
Object.defineProperty(exports, "INTERNAL_TRANSFER_TYPE", { enumerable: true, get: function () { return helpers_1.INTERNAL_TRANSFER_TYPE; } });
const errors_json_1 = __importDefault(require("./shared/errors.json"));
const logger_1 = __importDefault(require("./lib/logger"));
function makeLogger(prefix) {
    return new logger_1.default(prefix);
}
const log = makeLogger('helpers');
function panic(wat) {
    const text = `Assertion error: ${wat}\n${new Error().stack}`;
    log.error(text);
    throw new Error(text);
}
function assert(x, wat) {
    if (!x) {
        panic(wat);
    }
}
function unwrap(x) {
    if (typeof x === 'undefined') {
        panic('Expected variable to be defined');
    }
    if (x === null) {
        panic('Expected variable to be not null');
    }
    return x;
}
function displayLabel({ label, customLabel, }) {
    return customLabel || label;
}
class KError extends Error {
    constructor(msg = 'Internal server error', statusCode = 500, errCode = null, shortMessage = null) {
        super();
        this.message = msg;
        this.shortMessage = shortMessage;
        this.errCode = errCode;
        this.stack = Error().stack;
        if (statusCode === null) {
            switch (errCode) {
                case errors_json_1.default.INVALID_PARAMETERS:
                case errors_json_1.default.NO_PASSWORD:
                case errors_json_1.default.INVALID_ENCRYPTED_EXPORT:
                case errors_json_1.default.INVALID_PASSWORD_JSON_EXPORT:
                    this.statusCode = 400;
                    break;
                case errors_json_1.default.INVALID_PASSWORD:
                    this.statusCode = 401;
                    break;
                case errors_json_1.default.ACTION_NEEDED:
                case errors_json_1.default.EXPIRED_PASSWORD:
                case errors_json_1.default.DISABLED_ACCESS:
                    this.statusCode = 403;
                    break;
                case errors_json_1.default.WOOB_NOT_INSTALLED:
                case errors_json_1.default.GENERIC_EXCEPTION:
                case errors_json_1.default.INTERNAL_ERROR:
                case errors_json_1.default.NO_ACCOUNTS:
                case errors_json_1.default.UNKNOWN_WOOB_MODULE:
                case errors_json_1.default.CONNECTION_ERROR:
                    this.statusCode = 500;
                    break;
                default:
                    this.statusCode = 500;
                    break;
            }
        }
        else {
            this.statusCode = statusCode;
        }
    }
}
exports.KError = KError;
function getErrorCode(name) {
    const match = errors_json_1.default[name];
    if (typeof match === 'string') {
        return match;
    }
    throw new KError('Unknown error code!');
}
function asyncErr(res, err, context) {
    let statusCode = 500;
    let errCode = null;
    let shortMessage = null;
    if (err instanceof KError) {
        statusCode = err.statusCode;
        errCode = err.errCode;
        shortMessage = err.shortMessage;
    }
    const { message } = err;
    log.error(`${context}: ${message}`);
    log.info(err.stack);
    res.status(statusCode).send({
        code: errCode,
        shortMessage,
        message,
    });
    return false;
}
function errorRequiresUserAction(err) {
    return (err.errCode === getErrorCode('INVALID_PASSWORD') ||
        err.errCode === getErrorCode('EXPIRED_PASSWORD') ||
        err.errCode === getErrorCode('INVALID_PARAMETERS') ||
        err.errCode === getErrorCode('NO_PASSWORD') ||
        err.errCode === getErrorCode('ACTION_NEEDED') ||
        err.errCode === getErrorCode('REQUIRES_INTERACTIVE'));
}
// Minimum hour of the day at which the automatic poll can occur.
exports.POLLER_START_LOW_HOUR = 2;
// Maximum hour of the day at which the automatic poll can occur.
exports.POLLER_START_HIGH_HOUR = 4;
const isEmailEnabled = () => {
    return !!(process.kresus.emailFrom &&
        process.kresus.emailFrom.length &&
        ((process.kresus.emailTransport === 'smtp' &&
            process.kresus.smtpHost &&
            process.kresus.smtpPort) ||
            process.kresus.emailTransport === 'sendmail'));
};
exports.isEmailEnabled = isEmailEnabled;
const isAppriseApiEnabled = () => {
    return !!(process.kresus.appriseApiBaseUrl && process.kresus.appriseApiBaseUrl.length);
};
exports.isAppriseApiEnabled = isAppriseApiEnabled;
function normalizeVersion(version) {
    if (version === null) {
        return null;
    }
    const stringifiedVersion = version.toString();
    const cleanedVersion = semver_1.default.clean(stringifiedVersion);
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
function checkMinimalWoobVersion(version) {
    const actualVersion = normalizeVersion(version);
    const expectedVersion = normalizeVersion(helpers_1.MIN_WOOB_VERSION);
    return (actualVersion !== null &&
        expectedVersion !== null &&
        semver_1.default.gte(actualVersion, expectedVersion));
}
function makeUrlPrefixRegExp(urlPrefix) {
    return new RegExp(`^${urlPrefix}/?`);
}
const currencyFormatterCache = {};
function currencyFormatter(someCurrency) {
    if (typeof currencyFormatterCache[someCurrency] === 'undefined') {
        currencyFormatterCache[someCurrency] = helpers_1.currency.makeFormat(someCurrency);
    }
    return currencyFormatterCache[someCurrency];
}
