/* eslint no-console: 0 */

// Locales
// Force importing locales here, so that the module system loads them ahead
// of time.
const localesPath = './locales/';

require('./locales/fr');
require('./locales/en');

import Polyglot from 'node-polyglot';
import { format as currencyFormatter, findCurrency } from 'currency-formatter';

const ASSERTS = true;

export function assert(x, wat) {
    if (!x) {
        let text = `Assertion error: ${wat ? wat : ''}\n${new Error().stack}`;
        if (ASSERTS) {
            if (window && window.alert) {
                alert(text);
            }
            console.error(text);
        }
        return false;
    }
    return true;
}

export function maybeHas(obj, prop) {
    return obj && obj.hasOwnProperty(prop);
}

export function assertHas(obj, prop, errorMsg) {
    return assert(maybeHas(obj, prop), errorMsg || `object should have property ${prop}`);
}

export function NYI() {
    throw 'Not yet implemented';
}

let appLocale = null;
let translator = null;
let alertMissing = null;

export function setupTranslator(locale) {
    let p = new Polyglot({ allowMissing: true });
    let found = false;
    try {
        p.extend(require(localesPath + locale));
        found = true;
    } catch (e) {
        // Default locale is 'en', so the error shouldn't be shown in this
        // case.
        if (locale !== 'en') {
            console.log(e);
            p.extend(require(`${localesPath}en`));
        }
    }
    translator = p.t.bind(p);
    appLocale = locale;
    alertMissing = found;
}

export function translate(format, bindings = {}) {
    let augmentedBindings = bindings;
    augmentedBindings._ = '';

    let ret = translator(format, augmentedBindings);
    if (ret === '' && alertMissing) {
        console.log(`Missing translation key for "${format}"`);
        return format;
    }

    return ret;
}

export let localeComparator = (function() {
    if (typeof Intl !== 'undefined' && typeof Intl.Collator !== 'undefined') {
        let cache = new Map;
        return function(a, b) {
            if (!cache.has(appLocale)) {
                cache.set(appLocale, new Intl.Collator(appLocale, { sensitivity: 'base' }));
            }
            return cache.get(appLocale).compare(a, b);
        };
    }

    if (typeof String.prototype.localeCompare === 'function') {
        return function(a, b) {
            return a.localeCompare(b, appLocale, { sensitivity: 'base' });
        };
    }

    return function(a, b) {
        let af = a.toLowerCase();
        let bf = b.toLowerCase();
        if (af < bf) return -1;
        if (af > bf) return 1;
        return 0;
    };
})();

export let currency = {
    isKnown: c => typeof findCurrency(c) !== 'undefined',
    symbolFor: c => findCurrency(c).symbol,
    makeFormat: c => amount => currencyFormatter(amount, { code: c })
};

export const UNKNOWN_OPERATION_TYPE = 'type.unknown';

export const OUT_OF_BALANCE_TYPES = [ 'type.deferred_card' ];

export const OUT_OF_FUTURE_BALANCE_TYPES = [ 'type.card_summary' ];
