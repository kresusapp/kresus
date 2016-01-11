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
        return format;
    }

    return ret;
}

export var compareLocale = (function() {
    if (typeof Intl !== 'undefined' && typeof Intl.Collator !== 'undefined') {
        let cache = new Map;
        return function(a, b, locale) {
            if (!cache.has(locale)) {
                cache.set(locale, new Intl.Collator(locale, { sensitivity: 'base' }));
            }
            return cache.get(locale).compare(a, b);
        }
    }

    if (typeof String.prototype.localeCompare === 'function') {
        return function(a, b, locale) {
            return a.localeCompare(b, locale, { sensitivity : 'base' });
        }
    }

    return function(a, b, locale) {
        let af = a.toLowerCase();
        let bf = b.toLowerCase();
        if (af < bf) return -1;
        if (af > bf) return 1;
        return 0;
    }
})();

export function stringToColor(str) {
    let hash = 0;
    let color = '#';

    // String to hash
    for (let i = 0, size = str.length; i < size; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }

    // Int/hash to hex
    for (let i = 0; i < 3; i++) {
        color += ('00' + ((hash >> i * 8) & 0xFF).toString(16)).slice(-2);
    }

    return color;
}
