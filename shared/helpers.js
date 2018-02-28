/* eslint no-console: 0 */

// Locales
// It is necessary to load the locale files statically,
// otherwise the files are not included in the client
const FR_LOCALE = require('./locales/fr.json');
const EN_LOCALE = require('./locales/en.json');

import Polyglot from 'node-polyglot';
import { format as currencyFormatter, findCurrency } from 'currency-formatter';
import moment from 'moment';

const ASSERTS = true;

export function assert(x, wat) {
    if (!x) {
        let text = `Assertion error: ${wat ? wat : ''}\n${new Error().stack}`;
        if (ASSERTS) {
            if (typeof window !== 'undefined' && typeof window.alert !== 'undefined') {
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

    let found = true;
    let checkedLocale = locale;
    switch (checkedLocale) {
        case 'fr':
            p.extend(FR_LOCALE);
            break;
        case 'en':
            p.extend(EN_LOCALE);
            break;
        default:
            console.log("Didn't find locale", checkedLocale, 'using en-us instead.');
            checkedLocale = 'en';
            found = false;
            p.extend(EN_LOCALE);
            break;
    }

    translator = p.t.bind(p);
    appLocale = checkedLocale;
    alertMissing = found;

    moment.locale(checkedLocale);
}

const toShortString = date => moment(date).format('L');
const toLongString = date => moment(date).format('LLLL');
const fromNow = date => moment(date).calendar();

export const formatDate = {
    toShortString,
    toLongString,
    fromNow
};

export function translate(format, bindings = {}) {
    let augmentedBindings = bindings;
    augmentedBindings._ = '';

    if (!translator) {
        console.log(
            'Translator not set up! This probably means the initial /all ' +
                'request failed; assuming "en" to help debugging.'
        );
        setupTranslator('en');
    }

    let ret = translator(format, augmentedBindings);
    if (ret === '' && alertMissing) {
        console.log(`Missing translation key for "${format}"`);
        return format;
    }

    return ret;
}

export const localeComparator = (function() {
    if (typeof Intl !== 'undefined' && typeof Intl.Collator !== 'undefined') {
        let cache = new Map();
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
        if (af < bf) {
            return -1;
        }
        if (af > bf) {
            return 1;
        }
        return 0;
    };
})();

export const currency = {
    isKnown: c => typeof findCurrency(c) !== 'undefined',
    symbolFor: c => findCurrency(c).symbol,
    makeFormat: c => amount => currencyFormatter(amount, { code: c })
};

export const UNKNOWN_OPERATION_TYPE = 'type.unknown';

export const MIN_WEBOOB_VERSION = '1.3';
