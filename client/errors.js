import {translate as $t} from './helpers';

import errors from '../shared/errors.json';

function get(name) {
    if (typeof errors[name] !== 'undefined')
        return errors[name];
    throw "unknown exception code!";
}

var Errors = {
    NO_PASSWORD: get('NO_PASSWORD'),
    INVALID_PASSWORD: get('INVALID_PASSWORD'),
    INVALID_PARAMETERS: get('INVALID_PARAMETERS'),
    EXPIRED_PASSWORD: get('EXPIRED_PASSWORD'),
    UNKNOWN_MODULE: get('UNKNOWN_WEBOOB_MODULE'),
    BANK_ALREADY_EXISTS: get('BANK_ALREADY_EXISTS'),
    GENERIC_EXCEPTION: get('GENERIC_EXCEPTION'),
};

export default Errors;

export function MaybeHandleSyncError(err) {

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
            alert($t('client.sync.unknown_error', {content: err.message}));
            break;
    }
}
