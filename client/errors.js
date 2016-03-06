/* eslint no-console: 0 */

import { translate as $t } from './helpers';

import errors from '../shared/errors.json';

function get(name) {
    if (typeof errors[name] !== 'undefined')
        return errors[name];
    throw 'unknown exception code!';
}

const Errors = {
    NO_PASSWORD: get('NO_PASSWORD'),
    INVALID_PASSWORD: get('INVALID_PASSWORD'),
    INVALID_PARAMETERS: get('INVALID_PARAMETERS'),
    EXPIRED_PASSWORD: get('EXPIRED_PASSWORD'),
    UNKNOWN_MODULE: get('UNKNOWN_WEBOOB_MODULE'),
    BANK_ALREADY_EXISTS: get('BANK_ALREADY_EXISTS'),
    GENERIC_EXCEPTION: get('GENERIC_EXCEPTION')
};

export default Errors;

export function genericErrorHandler(err) {
    // Show the error in the console
    console.error(`A request has failed with the following information:
- Code: ${err.code}
- Message: ${err.message}
- XHR Text: ${err.xhrText}
- XHR Error: ${err.xhrError}
- stringified: ${JSON.stringify(err)}
`);

    let maybeCode = err.code ? ` (code ${err.code})` : '';
    alert(`Error: ${err.message}${maybeCode}.
          Please refer to the developers' console for more information.`);
}

export function maybeHandleSyncError(err) {

    if (!err)
        return;

    switch (err.code) {
        case Errors.INVALID_PASSWORD:
            alert($t('client.sync.wrong_password'));
            break;
        case Errors.EXPIRED_PASSWORD:
            alert($t('client.sync.expired_password'));
            break;
        case Errors.UNKNOWN_MODULE:
            alert($t('client.sync.unknown_module'));
            break;
        case Errors.NO_PASSWORD:
            alert($t('client.sync.no_password'));
            break;
        default:
            genericErrorHandler(err);
            break;
    }
}
