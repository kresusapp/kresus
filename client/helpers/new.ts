import { useSelector } from 'react-redux';
import { GlobalState } from '../store';

const ASSERTS = true;

export function assert(x: boolean, wat: string): asserts x {
    if (!x) {
        const text = `Assertion error: ${wat ? wat : ''}\n${new Error().stack}`;
        if (process.env.NODE_ENV === 'test') {
            // During testing, errors should be fatal.
            throw new Error(text);
        }
        if (ASSERTS) {
            window.alert(text);
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
    assert(typeof x !== null, 'unexpected null');
}

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
    };
} | null = null;

function maybeReloadTheme(theme: string) {
    if (cachedTheme && cachedTheme.name === theme) {
        return;
    }

    cachedTheme = {
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
