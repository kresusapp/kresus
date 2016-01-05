import {translate as t} from './helpers';

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
            alert(t('client.sync.wrong_password') || 'Your password appears to be rejected by the bank website, please go to your Kresus settings and update it.');
            break;
        case Errors.EXPIRED_PASSWORD:
            alert(t('client.sync.expired_password') || 'Your password has expired. Please change it on your bank website and update it in Kresus.');
            break;
        case Errors.UNKNOWN_MODULE:
            alert(t('client.sync.unknown_module') || 'Unknown bank module. Please try updating Weboob.');
            break;
        case Errors.NO_PASSWORD:
            alert(t('client.sync.no_password') || "This access' password isn't set. Please set it in your bank settings and retry.");
            break;
        default:
            alert(t('client.sync.unknown_error', {content: err.message}) || 'Unknown error, please report: ' + err.message);
            break;
    }
}
