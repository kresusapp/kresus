/* eslint no-console: 0 */

import errors from '../shared/errors.json';
import { translate as $t, notify, wrapCatchError } from './helpers';

export function get(name) {
    if (typeof errors[name] !== 'undefined') {
        return errors[name];
    }
    throw 'unknown exception code!';
}

const Errors = {
    ACTION_NEEDED: get('ACTION_NEEDED'),
    AUTH_METHOD_NYI: get('AUTH_METHOD_NYI'),
    BROWSER_QUESTION: get('BROWSER_QUESTION'),
    EXPIRED_PASSWORD: get('EXPIRED_PASSWORD'),
    GENERIC_EXCEPTION: get('GENERIC_EXCEPTION'),
    INVALID_PARAMETERS: get('INVALID_PARAMETERS'),
    INVALID_PASSWORD: get('INVALID_PASSWORD'),
    NO_ACCOUNTS: get('NO_ACCOUNTS'),
    NO_PASSWORD: get('NO_PASSWORD'),
    UNKNOWN_MODULE: get('UNKNOWN_WEBOOB_MODULE'),
    WEBOOB_NOT_INSTALLED: get('WEBOOB_NOT_INSTALLED'),
    INTERNAL_ERROR: get('INTERNAL_ERROR'),
    REQUIRES_INTERACTIVE: get('REQUIRES_INTERACTIVE'),
};

export default Errors;

export function genericErrorHandler(err) {
    // Show the error in the console
    console.error(`A request has failed with the following information:
- code: ${err.code}
- short message: ${err.shortMessage}
- stack: ${err.stack || 'no stack'}
- message: ${err.message}
- stringified: ${JSON.stringify(err)}
`);

    let msg;
    if (err.shortMessage) {
        msg = err.shortMessage;
    } else {
        let maybeCode = err.code ? ` (code ${err.code})` : '';
        msg = err.message + maybeCode;
    }

    if (err.code && err.code === Errors.GENERIC_EXCEPTION) {
        msg += '\n';
        msg += $t('client.sync.unknown_error');
    }

    notify.error(`${msg}\n\n${$t('client.general.see_developers_console')}`);
}

export const wrapGenericError = wrapCatchError(genericErrorHandler);

const handleFirstSyncError = err => {
    switch (err.code) {
        case Errors.EXPIRED_PASSWORD:
            notify.error($t('client.sync.expired_password'));
            break;
        case Errors.INVALID_PARAMETERS:
            notify.error($t('client.sync.invalid_parameters', { content: err.content || '?' }));
            break;
        case Errors.INVALID_PASSWORD:
            notify.error($t('client.sync.first_time_wrong_password'));
            break;
        case Errors.NO_ACCOUNTS:
            notify.error($t('client.sync.no_accounts'));
            break;
        case Errors.UNKNOWN_MODULE:
            notify.error($t('client.sync.unknown_module'));
            break;
        case Errors.ACTION_NEEDED:
            notify.error($t('client.sync.action_needed'));
            break;
        case Errors.AUTH_METHOD_NYI:
            notify.error($t('client.sync.auth_method_nyi'));
            break;
        case Errors.BROWSER_QUESTION:
            notify.error($t('client.sync.browser_question'));
            break;
        default:
            genericErrorHandler(err);
            break;
    }
};

export const wrapFirstSyncError = wrapCatchError(handleFirstSyncError);

// Handle any synchronization error, after the first one.
export const handleSyncError = err => {
    switch (err.code) {
        case Errors.INVALID_PASSWORD:
            notify.error($t('client.sync.wrong_password'));
            break;
        case Errors.NO_PASSWORD:
            notify.error($t('client.sync.no_password'));
            break;
        default:
            handleFirstSyncError(err);
            break;
    }
};

export const wrapSyncError = wrapCatchError(handleSyncError);

export function fetchStatusToLabel(fetchStatus) {
    switch (get(fetchStatus)) {
        case 'UNKNOWN_WEBOOB_MODULE':
        case 'NO_ACCOUNTS':
        case 'NO_PASSWORD':
        case 'INVALID_PASSWORD':
        case 'EXPIRED_PASSWORD':
        case 'INVALID_PARAMETERS':
        case 'ACTION_NEEDED':
        case 'AUTH_METHOD_NYI':
        case 'CONNECTION_ERROR':
        case 'REQUIRES_INTERACTIVE':
            return $t(`client.fetch_error.short.${fetchStatus}`);
        default:
            return $t('client.fetch_error.short.GENERIC_EXCEPTION');
    }
}
