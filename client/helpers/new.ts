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
