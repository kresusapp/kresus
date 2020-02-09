/*
 * HELPERS
 */

/* eslint no-console: 0 */
import { toast } from 'react-toastify';

import {
    maybeHas,
    setupTranslator,
    translate,
    currency,
    localeComparator,
    UNKNOWN_ACCOUNT_TYPE,
    UNKNOWN_OPERATION_TYPE,
    formatDate,
    MIN_WEBOOB_VERSION,
    UNKNOWN_WEBOOB_VERSION,
    validatePassword,
    shouldIncludeInBalance,
    shouldIncludeInOutstandingSum,
    FETCH_STATUS_SUCCESS
} from '../shared/helpers';

export {
    maybeHas,
    setupTranslator,
    translate,
    localeComparator,
    currency,
    UNKNOWN_ACCOUNT_TYPE,
    UNKNOWN_OPERATION_TYPE,
    formatDate,
    MIN_WEBOOB_VERSION,
    UNKNOWN_WEBOOB_VERSION,
    validatePassword,
    shouldIncludeInBalance,
    shouldIncludeInOutstandingSum,
    FETCH_STATUS_SUCCESS
};

export const AlertTypes = ['balance', 'transaction'];

const SMALL_SCREEN_MAX_WIDTH = 768;

const ASSERTS = true;
const DEBUG = true;

export function debug(...args) {
    if (DEBUG) {
        console.log(...args);
    }
}

export function assert(x, wat) {
    if (!x) {
        let text = `Assertion error: ${wat ? wat : ''}\n${new Error().stack}`;
        if (process.env.NODE_ENV === 'test') {
            // During testing, errors should be fatal.
            throw new Error(text);
        }
        if (ASSERTS) {
            window.alert(text);
            console.error(text);
        }
        return false;
    }
    return true;
}

export function assertHas(obj, prop, errorMsg) {
    return assert(maybeHas(obj, prop), errorMsg || `object should have property ${prop}`);
}

export function displayLabel(obj) {
    assertHas(obj, 'label', 'The parameter of displayLabel shall have "label" property.');
    return obj.customLabel || obj.label;
}

export function assertDefined(x) {
    assert(typeof x !== 'undefined', 'unexpected undefined');
}

export function round2(x) {
    return Math.round(x * 100) / 100;
}

export const NONE_CATEGORY_ID = -1;

export function stringToColor(str) {
    let hash = 0;
    let color = '#';

    // String to hash.
    for (let i = 0, size = str.length; i < size; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }

    // Int/hash to hex.
    for (let i = 0; i < 3; i++) {
        let s = ((hash >> (i * 8)) & 0xff).toString(16);
        while (s.length < 2) {
            s += '0';
        }
        color += s;
    }

    return color;
}

function convertRGBToHex(rgb) {
    let hexRed = rgb.r.toString(16).toUpperCase();
    if (hexRed.length < 2) {
        hexRed += hexRed;
    }

    let hexGreen = rgb.g.toString(16).toUpperCase();
    if (hexGreen.length < 2) {
        hexGreen += hexGreen;
    }

    let hexBlue = rgb.b.toString(16).toUpperCase();
    if (hexBlue.length < 2) {
        hexBlue += hexBlue;
    }

    return `#${hexRed}${hexGreen}${hexBlue}`;
}

function generatePrimaryColor(ranges) {
    // Select random range and remove.
    let r = ranges.splice(Math.floor(Math.random() * ranges.length), 1)[0];

    // Pick a random number from within the range.
    let [low, high] = r;

    return Math.floor(Math.random() * (high - low)) + low;
}

export function generateColor() {
    // Ranges of bright colors.
    let ranges = [[100, 255], [50, 200], [10, 100]];

    return convertRGBToHex({
        r: generatePrimaryColor(ranges),
        g: generatePrimaryColor(ranges),
        b: generatePrimaryColor(ranges)
    });
}

// Those values are fallback values in case CSS variables are not supported
// (IE11) or the theme does not specify them.

let cachedTheme = {
    name: null,
    wellsColors: {},
    chartsColors: {}
};

function maybeReloadTheme(theme) {
    if (cachedTheme.name === theme) {
        return;
    }

    const rootElementStyles = window.getComputedStyle(document.documentElement);

    let color = rootElementStyles.getPropertyValue('--wells-balance-color').trim();
    cachedTheme.wellsColors.BALANCE = color || '#00BFF3';

    color = rootElementStyles.getPropertyValue('--wells-received-color').trim();
    cachedTheme.wellsColors.RECEIVED = color || '#00A651';

    color = rootElementStyles.getPropertyValue('--wells-spent-color').trim();
    cachedTheme.wellsColors.SPENT = color || '#F26C4F';

    color = rootElementStyles.getPropertyValue('--wells-saved-color').trim();
    cachedTheme.wellsColors.SAVED = color || '#0072BC';

    color = rootElementStyles.getPropertyValue('--charts-lines-color').trim();
    cachedTheme.chartsColors.LINES = color || '#008080';

    color = rootElementStyles.getPropertyValue('--charts-axis-color').trim();
    cachedTheme.chartsColors.AXIS = color || '#000000';

    cachedTheme.name = theme;
}

export function getWellsColors(theme) {
    maybeReloadTheme(theme);
    return cachedTheme.wellsColors;
}

export function getChartsDefaultColors(theme) {
    maybeReloadTheme(theme);
    return cachedTheme.chartsColors;
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

export const notify = {
    success: msg => toast.success(msg),
    error: msg => toast.error(msg, { autoClose: false })
};
