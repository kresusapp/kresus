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
