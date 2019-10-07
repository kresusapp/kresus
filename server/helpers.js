import semver from 'semver';

import {
    maybeHas as maybeHas_,
    setupTranslator as setupTranslator_,
    translate as translate_,
    currency as currency_,
    UNKNOWN_OPERATION_TYPE as UNKNOWN_OPERATION_TYPE_,
    UNKNOWN_ACCOUNT_TYPE as UNKNOWN_ACCOUNT_TYPE_,
    formatDate as formatDate_,
    MIN_WEBOOB_VERSION as MIN_WEBOOB_VERSION_,
    shouldIncludeInBalance as shouldIncludeInBalance_,
    shouldIncludeInOutstandingSum as shouldIncludeInOutstandingSum_,
    FETCH_STATUS_SUCCESS as FETCH_STATUS_SUCCESS_
} from './shared/helpers';

import errors from './shared/errors.json';
import Logger from './lib/logger';

export const has = maybeHas_;
export const translate = translate_;
export const currency = currency_;
export const UNKNOWN_OPERATION_TYPE = UNKNOWN_OPERATION_TYPE_;
export const UNKNOWN_ACCOUNT_TYPE = UNKNOWN_ACCOUNT_TYPE_;
export const setupTranslator = setupTranslator_;
export const formatDate = formatDate_;
export const MIN_WEBOOB_VERSION = MIN_WEBOOB_VERSION_;
export const shouldIncludeInBalance = shouldIncludeInBalance_;
export const shouldIncludeInOutstandingSum = shouldIncludeInOutstandingSum_;
export const FETCH_STATUS_SUCCESS = FETCH_STATUS_SUCCESS_;

export function makeLogger(prefix) {
    return new Logger(prefix);
}

let log = makeLogger('helpers');

export function assert(x, wat) {
    if (!x) {
        let text = `Assertion error: ${wat ? wat : ''}\n${new Error().stack}`;
        log.error(text);
        throw new Error(text);
    }
}

export function displayLabel(obj) {
    if (!maybeHas_(obj, 'label')) {
        log.error('The parameter of displayLabel shall have "label" property.');
    }
    return obj.customLabel || obj.label;
}

export function KError(
    msg = 'Internal server error',
    statusCode = 500,
    errCode = null,
    shortMessage = null
) {
    this.message = msg;
    this.shortMessage = shortMessage;
    this.errCode = errCode;
    this.stack = Error().stack;
    if (statusCode === null) {
        switch (errCode) {
            case errors.INVALID_PARAMETERS:
            case errors.NO_PASSWORD:
            case errors.INVALID_ENCRYPTED_EXPORT:
            case errors.INVALID_PASSWORD_JSON_EXPORT:
                this.statusCode = 400;
                break;
            case errors.INVALID_PASSWORD:
                this.statusCode = 401;
                break;
            case errors.ACTION_NEEDED:
            case errors.EXPIRED_PASSWORD:
            case errors.DISABLED_ACCESS:
                this.statusCode = 403;
                break;
            case errors.WEBOOB_NOT_INSTALLED:
            case errors.GENERIC_EXCEPTION:
            case errors.INTERNAL_ERROR:
            case errors.NO_ACCOUNTS:
            case errors.UNKNOWN_WEBOOB_MODULE:
            case errors.CONNECTION_ERROR:
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

export function getErrorCode(name) {
    if (typeof errors[name] !== 'undefined') {
        return errors[name];
    }
    throw new KError('Unknown error code!');
}

export function asyncErr(res, err, context) {
    let statusCode;
    let errCode;
    if (err instanceof KError) {
        statusCode = err.statusCode;
        errCode = err.errCode;
    } else {
        if (!(err instanceof Error)) {
            log.warn('err should be either a KError or an Error');
        }
        // If it exists, use the status set by cozy-db/pouchdb.
        statusCode = err.status ? err.status : 500;
        errCode = null;
    }

    let { message, shortMessage } = err;

    log.error(`${context}: ${message}`);
    log.info(err.stack);

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
export function promisify(func) {
    return function(...args) {
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
export function promisifyModel(Model) {
    const statics = ['exists', 'find', 'create', 'destroy', 'all'];

    for (let name of statics) {
        let former = Model[name];
        Model[name] = promisify(former.bind(Model));
    }

    // Theses methods have to be bound directly from the adapter of the model,
    // as the model methods are already bound to the cozy-db model.
    // The others cannot because the generic cozy-db model does extra
    // processing on data.
    const adapters = ['updateAttributes'];

    for (let name of adapters) {
        let former = Model.adapter[name];
        let promisifiedFunc = promisify(former);
        Model[name] = async function(...args) {
            return new Model(await promisifiedFunc.call(Model, ...args));
        };
    }

    const deprecatedStatics = [{ method: 'save', fallback: 'updateAttributes' }];

    for (let { method, fallback } of deprecatedStatics) {
        Model[method] = function() {
            assert(
                false,
                `Method ${method} is deprecated for model ${Model.displayName}.
Please use ${fallback} instead.`
            );
        };
    }

    const deprecatedMethods = ['save', 'updateAttributes', 'destroy'];

    for (let name of deprecatedMethods) {
        Model.prototype[name] = function() {
            assert(
                false,
                `Method ${name} is deprecated for model ${Model.displayName}.
Please use static method instead.`
            );
        };
    }

    return Model;
}

export function errorRequiresUserAction(err) {
    return (
        err.errCode === getErrorCode('INVALID_PASSWORD') ||
        err.errCode === getErrorCode('EXPIRED_PASSWORD') ||
        err.errCode === getErrorCode('INVALID_PARAMETERS') ||
        err.errCode === getErrorCode('NO_PASSWORD') ||
        err.errCode === getErrorCode('ACTION_NEEDED')
    );
}

// Minimum hour of the day at which the automatic poll can occur.
export const POLLER_START_LOW_HOUR = 2;

// Maximum hour of the day at which the automatic poll can occur.
export const POLLER_START_HIGH_HOUR = 4;

export const isEmailEnabled = () => {
    return !!(
        process.kresus.emailFrom &&
        process.kresus.emailFrom.length &&
        ((process.kresus.emailTransport === 'smtp' &&
            process.kresus.smtpHost &&
            process.kresus.smtpPort) ||
            process.kresus.emailTransport === 'sendmail')
    );
};

export function normalizeVersion(version) {
    if (typeof version === 'undefined' || version === null) {
        return null;
    }
    let stringifiedVersion = version.toString();
    let cleanedVersion = semver.clean(stringifiedVersion);
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

export function checkWeboobMinimalVersion(version) {
    let normalizedVersion = normalizeVersion(version);
    return (
        semver(normalizedVersion) &&
        semver.gte(normalizedVersion, normalizeVersion(MIN_WEBOOB_VERSION))
    );
}
