/*
 * HELPERS
 */

const DEBUG = true;
const ASSERTS = true;

export function debug() {
    DEBUG && console.log.apply(console, arguments);
};

export function assert(x, wat) {
    if (!x) {
        var text = 'Assertion error: ' + (wat?wat:'') + '\n' + new Error().stack;
        ASSERTS && alert(text);
        console.log(text);
        return false;
    }
    return true;
};

export function maybeHas(obj, prop) {
    return obj && obj.hasOwnProperty(prop);
}

export function has(obj, prop, wat) {
    return assert(maybeHas(obj, prop), wat || ('object should have property ' + prop));
}

export function NYI() {
    throw 'Not yet implemented';
}

export const NONE_CATEGORY_ID = '-1';

var translator = null;
var alertMissing = null;
export function setTranslator(polyglotInstance) {
    translator = polyglotInstance.t.bind(polyglotInstance);
}

export function setTranslatorAlertMissing(bool) {
    alertMissing = bool;
}

export function translate(format, bindings) {
    bindings = bindings || {};
    bindings['_'] = '';

    let ret = translator(format, bindings);
    if (ret === '' && alertMissing) {
        console.log(`Missing translation key for "${format}"`);
        return null;
    }

    return ret;
}

export const DEFAULT_TYPE_LABELS = {
    "type.none": "None",
    "type.unknown": "Unknown",
    "type.transfer": "Transfer",
    "type.order": "Order",
    "type.check": "Check",
    "type.deposit": "Deposit",
    "type.payback": "Payback",
    "type.withdrawal": "Withdrawal",
    "type.card": "Card",
    "type.loan_payment": "Loan payment",
    "type.bankfee": "Bank fee",
    "type.cash_deposit": "Cash deposit",
}
