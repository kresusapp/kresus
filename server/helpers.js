import printit from 'printit';

import {
    maybeHas as maybeHas_,
    assert as assert_,
    setupTranslator as setupTranslator_,
    translate as translate_,
    currency as currency_,
    UNKNOWN_OPERATION_TYPE as UNKNOWN_OPERATION_TYPE_
} from './shared/helpers.js';

import errors from './shared/errors.json';

import moment from 'moment';

export const has = maybeHas_;
export const assert = assert_;
export const translate = translate_;
export const currency = currency_;
export const UNKNOWN_OPERATION_TYPE = UNKNOWN_OPERATION_TYPE_;

export function makeLogger(prefix) {
    return printit({
        prefix,
        date: true
    });
}

let log = makeLogger('helpers');

export function KError(msg = 'Internal server error', statusCode = 500, errCode = null,
                       shortMessage = null) {
    this.message = msg;
    this.shortMessage = shortMessage;
    this.statusCode = statusCode;
    this.errCode = errCode;
    this.stack = Error().stack;
}

KError.prototype = new Error;
KError.prototype.name = 'KError';

export function getErrorCode(name) {
    if (typeof errors[name] !== 'undefined')
        return errors[name];
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
        statusCode = 500;
        errCode = null;
    }

    let { message, shortMessage } = err;

    log.error(`${context}: ${message}`);

    res.status(statusCode)
       .send({
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

                if (rest.length === 1)
                    accept(rest[0]);
                else
                    accept(...rest);
            });
            // Call the callback-based function
            func.apply(this, args);
        });
    };
}

// Promisifies a few cozy-db methods by default
export function promisifyModel(model) {

    const statics = ['exists', 'find', 'create', 'save', 'updateAttributes', 'destroy', 'all'];

    for (let name of statics) {
        let former = model[name];
        model[name] = promisify(model::former);
    }

    const methods = ['save', 'updateAttributes', 'destroy'];

    for (let name of methods) {
        let former = model.prototype[name];
        model.prototype[name] = promisify(former);
    }

    return model;
}

export function isCredentialError(err) {
    return err.errCode === getErrorCode('INVALID_PASSWORD') ||
           err.errCode === getErrorCode('EXPIRED_PASSWORD') ||
           err.errCode === getErrorCode('INVALID_PARAMETERS') ||
           err.errCode === getErrorCode('NO_PASSWORD');
}

export function setupTranslator(locale) {
    setupTranslator_(locale);
    if (locale) {
        moment.locale(locale);
    } else {
        moment.locale('en');
    }
}

export function formatDateToLocaleString(date) {
    return moment(date).format('L');
}

// Minimum hour of the day at which the automatic poll can occur.
export const POLLER_START_LOW_HOUR = 2;

// Maximum hour of the day at which the automatic poll can occur.
export const POLLER_START_HIGH_HOUR = 4;
