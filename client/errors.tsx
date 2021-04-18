/* eslint no-console: 0 */

import errors from '../shared/errors.json';
import { translate as $t, notify } from './helpers';

export function get(name: string) {
    if (typeof (errors as any)[name] !== 'undefined') {
        return (errors as any)[name];
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
    UNKNOWN_MODULE: get('UNKNOWN_WOOB_MODULE'),
    WOOB_NOT_INSTALLED: get('WOOB_NOT_INSTALLED'),
    INTERNAL_ERROR: get('INTERNAL_ERROR'),
    REQUIRES_INTERACTIVE: get('REQUIRES_INTERACTIVE'),
};

export default Errors;

interface KError extends Error {
    code: string;
    shortMessage: string;
    stack?: string;
    message: string;
}

export function genericErrorHandler(err: any) {
    if (typeof err.code === 'undefined') {
        // Probably a simple error.
        const nativeErr = err as Error;

        console.error(`An error has occurred with the following information:
        - message: ${err.message}
        - stack: ${err.stack || 'no stack'}
        - stringified: ${JSON.stringify(err)}
        `);

        notify.error(`${nativeErr.message}\n\n${$t('client.general.see_developers_console')}`);
        return;
    }

    // Probably a KError: show the error in the console.
    const kerr = err as KError;

    console.error(`A request has failed with the following information:
- code: ${kerr.code}
- short message: ${kerr.shortMessage}
- stack: ${kerr.stack || 'no stack'}
- message: ${kerr.message}
- stringified: ${JSON.stringify(kerr)}
`);

    let msg;
    if (kerr.shortMessage) {
        msg = kerr.shortMessage;
    } else {
        const maybeCode = kerr.code ? ` (code ${kerr.code})` : '';
        msg = kerr.message + maybeCode;
    }

    if (kerr.code && kerr.code === Errors.GENERIC_EXCEPTION) {
        msg += '\n';
        msg += $t('client.sync.unknown_error');
    }

    notify.error(`${msg}\n\n${$t('client.general.see_developers_console')}`);
}

export const handleFirstSyncError = (err: any) => {
    switch (err.code) {
        case Errors.EXPIRED_PASSWORD:
            notify.error($t('client.sync.expired_password'));
            break;
        case Errors.INVALID_PARAMETERS:
            notify.error($t('client.sync.invalid_parameters', { content: err.message || '?' }));
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

// Handle any synchronization error, after the first one.
export const handleSyncError = (err: any) => {
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

export function fetchStatusToLabel(fetchStatus: string) {
    switch (get(fetchStatus)) {
        case 'UNKNOWN_WOOB_MODULE':
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
