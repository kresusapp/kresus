/* eslint no-console: 0 */

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
- stack: ${err.stack || 'no stack'}
- XHR Text: ${err.xhrText}
- XHR Error: ${err.xhrError}
- stringified: ${JSON.stringify(err)}
- stack: ${err.stack}
`);

    let maybeCode = err.code ? ` (code ${err.code})` : '';
    alert(`Error: ${err.message}${maybeCode}.
          Please refer to the developers' console for more information.`);
}
