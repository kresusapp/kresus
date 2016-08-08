/*
 * HELPERS
 */

/* eslint no-console: 0 */

import { assert as assert_,
         assertHas as assertHas_,
         maybeHas as maybeHas_,
         NYI as NYI_,
         setupTranslator as setupTranslator_,
         translate as translate_,
         currency as currency_,
         localeComparator as localeComparator_,
         UNKNOWN_OPERATION_TYPE as UNKNOWN_OPERATION_TYPE_ } from '../shared/helpers.js';

export let assert = assert_;
export let assertHas = assertHas_;
export let maybeHas = maybeHas_;
export let NYI = NYI_;
export let setupTranslator = setupTranslator_;
export let translate = translate_;
export let localeComparator = localeComparator_;
export let currency = currency_;
export let UNKNOWN_OPERATION_TYPE = UNKNOWN_OPERATION_TYPE_;

const DEBUG = true;

export function debug(...args) {
    if (DEBUG)
        console.log(...args);
}

export function assertDefined(x) {
    assert(typeof x !== 'undefined', 'unexpected undefined');
}

export const NONE_CATEGORY_ID = '-1';

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
