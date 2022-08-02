/*
 * HELPERS
 */

/* eslint no-console: 0 */

import moment from 'moment';
import { toast } from 'react-toastify';
import { useSelector } from 'react-redux';

export {
    maybeHas,
    currency,
    UNKNOWN_ACCOUNT_TYPE,
    UNKNOWN_TRANSACTION_TYPE,
    INTERNAL_TRANSFER_TYPE,
    MIN_WOOB_VERSION,
    UNKNOWN_WOOB_VERSION,
    validatePassword,
    shouldIncludeInBalance,
    shouldIncludeInOutstandingSum,
    FETCH_STATUS_SUCCESS,
} from '../../shared/helpers';

export { startOfDay, endOfDay, startOfMonth, endOfMonth } from '../../shared/helpers/dates';

import { GlobalState } from '../store';
import {
    setupTranslator as sharedSetupTranslator,
    getDefaultEnglishTranslator,
    maybeHas,
    translate as sharedTranslate,
    localeComparator as sharedLocaleComparator,
    formatDate as sharedFormatDate,
} from '../../shared/helpers';

export const AlertTypes = ['balance', 'transaction'];

const SMALL_SCREEN_MAX_WIDTH = 768;

const DEBUG = true;

export function debug(...args: any[]) {
    if (DEBUG) {
        console.log(...args);
    }
}

const ASSERTS = true;

export function assert(x: boolean, wat: string): asserts x {
    if (!x) {
        const shortText = `Assertion error: ${wat}`;
        const text = `${shortText}\n${new Error().stack}`;
        if (process.env.NODE_ENV === 'test') {
            // During testing, errors should be fatal.
            throw new Error(text);
        }
        if (ASSERTS) {
            window.alert(shortText);
            /* eslint-disable-next-line no-console */
            console.error(text);
        }
    }
}

// A helper ensuring x is not undefined.
export function assertDefined<T>(
    x: T,
    message = 'unexpected undefined'
): asserts x is Exclude<T, undefined> {
    assert(typeof x !== 'undefined', message);
}

// A helper ensuring x is not null.
export function assertNotNull<T>(x: T): asserts x is Exclude<T, null> {
    assert(x !== null, 'unexpected null');
}

// eslint-disable-next-line @typescript-eslint/ban-types
export function assertHas(obj: object, prop: string, errorMsg?: string) {
    return assert(maybeHas(obj, prop), errorMsg || `object should have property ${prop}`);
}

export function assertHasNonNull(obj: Record<string, unknown>, prop: string, errorMsg?: string) {
    return assert(
        maybeHas(obj, prop) && obj[prop] !== null,
        errorMsg || `object should have non null property ${prop}`
    );
}

export function displayLabel(obj: { customLabel: string | null; label: string }) {
    assertHasNonNull(obj, 'label', 'The parameter of displayLabel must have a "label" property.');
    return obj.customLabel || obj.label;
}

export function round2(x: number) {
    return Math.round(x * 100) / 100;
}

export const NONE_CATEGORY_ID = -1;

export function stringToColor(str: string) {
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

function convertRGBToHex(rgb: { r: number; g: number; b: number }) {
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

function generatePrimaryColor(ranges: number[][]) {
    // Select random range and remove.
    const r = ranges.splice(Math.floor(Math.random() * ranges.length), 1)[0];

    // Pick a random number from within the range.
    const [low, high] = r;

    return Math.floor(Math.random() * (high - low)) + low;
}

export function generateColor() {
    // Ranges of bright colors.
    const ranges = [
        [100, 255],
        [50, 200],
        [10, 100],
    ];

    return convertRGBToHex({
        r: generatePrimaryColor(ranges),
        g: generatePrimaryColor(ranges),
        b: generatePrimaryColor(ranges),
    });
}

export function areWeFunYet() {
    const d = new Date();
    return d.getMonth() === 3 && d.getDate() === 1;
}

export function computeIsSmallScreen(width: number | null = null) {
    let actualWidth;
    if (width === null) {
        // Mocha does not know window, tests fail without testing window != undefined.
        actualWidth = typeof window !== 'undefined' ? window.innerWidth : +Infinity;
    } else {
        actualWidth = width;
    }
    return actualWidth <= SMALL_SCREEN_MAX_WIDTH;
}

export const notify = {
    success: (msg: string) => toast.success(msg),
    error: (msg: string) => toast.error(msg, { autoClose: false }),
};

export function capitalize(text: string) {
    if (typeof text !== 'string') {
        return '';
    }
    return text.charAt(0).toUpperCase() + text.slice(1);
}

export const noValueFoundMessage = () => translate('client.general.no_value_found');

// A pre-typed useSelector that embeds the app's global state.
//
// The line below is necessary for eslint and prettier to behave.
// eslint-disable-next-line space-before-function-paren
export const useKresusState = function <T>(func: (state: GlobalState) => T): T {
    return useSelector<GlobalState, T>(func);
};

// Those values are fallback values in case CSS variables are not supported
// (IE11) or the theme does not specify them.

let cachedTheme: {
    name: string | null;
    wellsColors: {
        BALANCE: string;
        RECEIVED: string;
        SPENT: string;
        SAVED: string;
    };
    chartsColors: {
        LINES: string;
        AXIS: string;
        POSITIVE_FILL: string;
        NEGATIVE_FILL: string;
    };
    fontColor: string;
} | null = null;

function maybeReloadTheme(theme: string) {
    if (cachedTheme && cachedTheme.name === theme) {
        return;
    }

    cachedTheme = {
        fontColor: {},
        wellsColors: {},
        chartsColors: {},
    } as any;
    assert(!!cachedTheme, 'not null!');

    const styles = window.getComputedStyle(document.body);

    let color = styles.getPropertyValue('--wells-balance-color').trim();
    cachedTheme.wellsColors.BALANCE = color || '#00BFF3';

    color = styles.getPropertyValue('--wells-received-color').trim();
    cachedTheme.wellsColors.RECEIVED = color || '#00A651';

    color = styles.getPropertyValue('--wells-spent-color').trim();
    cachedTheme.wellsColors.SPENT = color || '#F26C4F';

    color = styles.getPropertyValue('--wells-saved-color').trim();
    cachedTheme.wellsColors.SAVED = color || '#0072BC';

    color = styles.getPropertyValue('--charts-lines-color').trim();
    cachedTheme.chartsColors.LINES = color || '#008080';

    color = styles.getPropertyValue('--charts-axis-color').trim();
    cachedTheme.chartsColors.AXIS = color || '#000000';

    color = styles.getPropertyValue('--charts-positive-fill-color').trim();
    cachedTheme.chartsColors.POSITIVE_FILL = color || '#D9ECEC';

    color = styles.getPropertyValue('--charts-negative-fill-color').trim();
    cachedTheme.chartsColors.NEGATIVE_FILL = color || '#F78B83';

    color = styles.getPropertyValue('--main-font-color').trim();
    cachedTheme.fontColor = color || '#000000';

    cachedTheme.name = theme;
}

export function getWellsColors(theme: string) {
    maybeReloadTheme(theme);
    assert(!!cachedTheme, 'theme reloaded');
    return cachedTheme.wellsColors;
}

export function getChartsDefaultColors(theme: string) {
    maybeReloadTheme(theme);
    assert(!!cachedTheme, 'theme reloaded');
    return cachedTheme.chartsColors;
}

export function getFontColor(theme: string) {
    maybeReloadTheme(theme);
    assert(!!cachedTheme, 'theme reloaded');
    return cachedTheme.fontColor;
}

// Global state for internationalization: there's only one active language per client.
let I18N = getDefaultEnglishTranslator();

type FORMAT_DATE_TYPE = ReturnType<typeof sharedFormatDate>;

// This little trick allows exported mutable bindings: the actual export
// binding is constant, so it can be referred to in other modules; but it's
// just a proxy to an internal object which value can change over time.
const FORMAT_DATE_CONTAINER = { inner: sharedFormatDate('en') };
export const formatDate: FORMAT_DATE_TYPE = new Proxy(FORMAT_DATE_CONTAINER, {
    get(obj, prop) {
        return (obj.inner as any)[prop];
    },
}) as any as FORMAT_DATE_TYPE; // ts sucks

export function setupTranslator(locale: string): void {
    I18N = sharedSetupTranslator(locale);
    FORMAT_DATE_CONTAINER.inner = sharedFormatDate(locale);
    moment.locale(locale);
}

export function translate(format: string, bindings: any = null): string {
    return sharedTranslate(I18N, format, bindings);
}

export function localeComparator(a: string, b: string): number {
    return sharedLocaleComparator(I18N, a, b);
}
