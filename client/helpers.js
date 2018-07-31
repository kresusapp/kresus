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
    UNKNOWN_ACCOUNT_TYPE as UNKNOWN_ACCOUNT_TYPE_,
    UNKNOWN_OPERATION_TYPE as UNKNOWN_OPERATION_TYPE_,
    formatDate as formatDate_,
    MIN_WEBOOB_VERSION as MIN_WEBOOB_VERSION_,
    displayLabel as displayLabel_
} from '../shared/helpers.js';

export const assert = assert_;
export const assertHas = assertHas_;
export const maybeHas = maybeHas_;
export const NYI = NYI_;
export const setupTranslator = setupTranslator_;
export const translate = translate_;
export const localeComparator = localeComparator_;
export const currency = currency_;
export const UNKNOWN_ACCOUNT_TYPE = UNKNOWN_ACCOUNT_TYPE_;
export const UNKNOWN_OPERATION_TYPE = UNKNOWN_OPERATION_TYPE_;
export const formatDate = formatDate_;
export const MIN_WEBOOB_VERSION = MIN_WEBOOB_VERSION_;
export const displayLabel = displayLabel_;

export const AlertTypes = ['balance', 'transaction'];

const SMALL_SCREEN_MAX_WIDTH = 768;

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

// Those values are fallback values in case CSS variables are not supported
// (IE11) or the theme does not specify them.
let _wellsColors = {};
let wellsColorsTheme = null;

export function getWellsColors(theme) {
    if (theme !== wellsColorsTheme) {
        wellsColorsTheme = theme;

        const rootElementStyles = window.getComputedStyle(document.documentElement);
        let color = rootElementStyles.getPropertyValue('--wells-balance-color').trim();
        _wellsColors.BALANCE = color || '#00BFF3';

        color = rootElementStyles.getPropertyValue('--wells-received-color').trim();
        _wellsColors.RECEIVED = color || '#00A651';

        color = rootElementStyles.getPropertyValue('--wells-spent-color').trim();
        _wellsColors.SPENT = color || '#F26C4F';

        color = rootElementStyles.getPropertyValue('--wells-saved-color').trim();
        _wellsColors.SAVED = color || '#0072BC';
    }

    return _wellsColors;
}

export function areWeFunYet() {
    let d = new Date();
    return d.getMonth() === 3 && d.getDate() === 1;
}

export function computeIsSmallScreen(width = null) {
    let actualWidth = width;
    if (width === null) {
        // Mocha does not know window, tests fail without testing window != undefined.
        actualWidth = typeof window !== 'undefined' ? window.innerWidth : +Infinity;
    }
    return actualWidth <= SMALL_SCREEN_MAX_WIDTH;
}
