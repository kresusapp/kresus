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
export function setTranslator(polyglotInstance) {
    translator = polyglotInstance.t.bind(polyglotInstance);
}

export function translate(format, bindings) {
    return translator(format, bindings);
}
