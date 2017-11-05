/*
 * HELPERS
 */

/* eslint no-console: 0 */

import {
    assert as assert_,
    assertHas as assertHas_,
    maybeHas as maybeHas_,
    NYI as NYI_,
    setupTranslator as setupTranslator_,
    translate as translate_,
    currency as currency_,
    localeComparator as localeComparator_,
    UNKNOWN_OPERATION_TYPE as UNKNOWN_OPERATION_TYPE_,
    formatDate as formatDate_,
    MIN_WEBOOB_VERSION as MIN_WEBOOB_VERSION_
} from '../shared/helpers.js';

export const assert = assert_;
export const assertHas = assertHas_;
export const maybeHas = maybeHas_;
export const NYI = NYI_;
export const setupTranslator = setupTranslator_;
export const translate = translate_;
export const localeComparator = localeComparator_;
export const currency = currency_;
export const UNKNOWN_OPERATION_TYPE = UNKNOWN_OPERATION_TYPE_;
export const formatDate = formatDate_;
export const MIN_WEBOOB_VERSION = MIN_WEBOOB_VERSION_;

export const AlertTypes = ['balance', 'transaction'];

const DEBUG = true;

export function debug(...args) {
    if (DEBUG) {
        console.log(...args);
    }
}

export function assertDefined(x) {
    assert(typeof x !== 'undefined', 'unexpected undefined');
}

export function round2(x) {
    return Math.round(x * 100) / 100;
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
        let s = ((hash >> (i * 8)) & 0xff).toString(16);
        while (s.length < 2) {
            s += '0';
        }
        color += s;
    }

    return color;
}

export const wellsColors = {
    BALANCE: '#00BFF3',
    RECEIVED: '#00A651',
    SPENT: '#F26C4F',
    SAVED: '#0072BC'
};

export function isAprilFirstDay() {
    let d = new Date();
    return d.getMonth() === 3 && d.getDate() === 1;
}
