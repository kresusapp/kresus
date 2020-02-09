import { Response } from 'express';
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

export function makeLogger(prefix: string): Logger {
    return new Logger(prefix);
}

const log = makeLogger('helpers');

export function panic(wat: string): never {
    const text = `Assertion error: ${wat}\n${new Error().stack}`;
    log.error(text);
    throw new Error(text);
}

export function assert(x: boolean, wat: string): never | void {
    if (!x) {
        panic(wat);
    }
}

export function unwrap<T>(x: T | undefined): T | never {
    if (typeof x === 'undefined') {
        panic('Expected variable to be defined');
    }
    return x;
}

export function displayLabel({
    label,
    customLabel
}: {
    label: string;
    customLabel?: string | null;
}): string {
    return customLabel || label;
}

export class KError extends Error {
    message: string;
    shortMessage: string | null;
    errCode: string | null;
    statusCode: number;

    constructor(
        msg = 'Internal server error',
        statusCode: number | null = 500,
        errCode: string | null = null,
        shortMessage = null
    ) {
        super();
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
}

export function getErrorCode(name: string): string | never {
    if (typeof errors[name] === 'string') {
        return errors[name];
    }
    throw new KError('Unknown error code!');
}

export function asyncErr(res: Response, err: Error, context: string): false {
    let statusCode = 500;
    let errCode: string | null = null;
    let shortMessage: string | null = null;

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
        message
    });

    return false;
}

export function errorRequiresUserAction(err: KError): boolean {
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

export const isEmailEnabled = (): boolean => {
    return !!(
        process.kresus.emailFrom &&
        process.kresus.emailFrom.length &&
        ((process.kresus.emailTransport === 'smtp' &&
            process.kresus.smtpHost &&
            process.kresus.smtpPort) ||
            process.kresus.emailTransport === 'sendmail')
    );
};

export function normalizeVersion(version: string | null): string | null {
    if (version === null) {
        return null;
    }
    const stringifiedVersion = version.toString();
    const cleanedVersion = semver.clean(stringifiedVersion);
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

export function checkWeboobMinimalVersion(version: string | null): boolean {
    const normalizedVersion = normalizeVersion(version);
    const normalizedWeboobVersion = normalizeVersion(MIN_WEBOOB_VERSION);
    return (
        normalizedVersion !== null &&
        normalizedWeboobVersion !== null &&
        semver.gte(normalizedVersion, normalizedWeboobVersion)
    );
}

export function makeUrlPrefixRegExp(urlPrefix: string): RegExp {
    return new RegExp(`^${urlPrefix}/?`);
}

const currencyFormatterCache: { [key: string]: Function } = {};

export function currencyFormatter(someCurrency: string): Function {
    if (typeof currencyFormatterCache[someCurrency] === 'undefined') {
        currencyFormatterCache[someCurrency] = currency.makeFormat(someCurrency);
    }
    return currencyFormatterCache[someCurrency];
}
