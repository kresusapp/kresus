import errors from '../weboob/errors.json';
import {translate as t} from './Helpers';

function get(name) {
    if (typeof errors[name] !== 'undefined')
        return errors[name];
    throw "unknown exception code!";
}

var Errors = {
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
            alert(t('sync.wrong_password') || 'Wrong password!');
            break;
        case Errors.EXPIRED_PASSWORD:
            alert(t('sync.expired_password') || 'Your password has expired. Please change it on your bank website and update it in Kresus.');
            break;
        case Errors.UNKNOWN_MODULE:
            alert(t('sync.unknown_module') || 'Unknown bank module. Please try updating Weboob.');
            break;
        default:
            alert(t('sync.unknown_error', {content: err.content}) || 'Unknown error, please report: ' + err.content);
            break;
    }
}
