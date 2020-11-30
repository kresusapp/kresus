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
export function assertDefined<T>(x: T): asserts x is Exclude<T, undefined> {
    assert(typeof x !== 'undefined', 'unexpected undefined');
}

// A helper ensuring x is not null.
export function assertNotNull<T>(x: T): asserts x is Exclude<T, null> {
    assert(typeof x !== null, 'unexpected null');
}
