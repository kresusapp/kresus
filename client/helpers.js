/*
 * HELPERS
 */

/* eslint no-console: 0 */

import { assert as assert_,
         maybeHas as maybeHas_,
         has as has_,
         NYI as NYI_,
         setupTranslator as setupTranslator_,
         translate as translate_,
         currency as currency_ } from '../shared/helpers.js';

export let assert = assert_;
export let maybeHas = maybeHas_;
export let has = has_;
export let NYI = NYI_;
export let setupTranslator = setupTranslator_;
export let translate = translate_;
export let currency = currency_;
const DEBUG = true;

export function debug(...args) {
    if (DEBUG)
        console.log(...args);
}

export const NONE_CATEGORY_ID = '-1';

export let localeComparator = (function() {
    if (typeof Intl !== 'undefined' && typeof Intl.Collator !== 'undefined') {
        let cache = new Map;
        return function(a, b, locale) {
            if (!cache.has(locale)) {
                cache.set(locale, new Intl.Collator(locale, { sensitivity: 'base' }));
            }
            return cache.get(locale).compare(a, b);
        };
    }

    if (typeof String.prototype.localeCompare === 'function') {
        return function(a, b, locale) {
            return a.localeCompare(b, locale, { sensitivity: 'base' });
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

export function stringToColor(str) {
    let hash = 0;
    let color = '#';

    // String to hash
    for (let i = 0, size = str.length; i < size; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }

    // Int/hash to hex
    for (let i = 0; i < 3; i++) {
        let s = ((hash >> i * 8) & 0xFF).toString(16);
        while (s.length < 2) s += '0';
        color += s;
    }

    return color;
}
