/* eslint no-console: 0 */

// Locales
// Force importing locales here, so that the module system loads them ahead
// of time.
const localesPath = './locales/';

require('./locales/fr');
require('./locales/en');

import Polyglot from 'node-polyglot';
import { format as currencyFormatter, currencies } from 'currency-formatter';

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

export function has(obj, prop, wat) {
    return assert(maybeHas(obj, prop), wat || `object should have property ${prop}`);
}

export function NYI() {
    throw 'Not yet implemented';
}

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

let find = c => currencies.find(curr => curr.code === c);

export let currency = {
    isKnown: c => typeof find(c) !== 'undefined',
    symbolFor: c => find(c).symbol,
    makeFormat: c => amount => currencyFormatter(amount, { code: c })
};
