/**
 * Lazy-loads all the required polyfills prior to running the main code.
 */
import runKresus from './main';

if (!window.fetch) {
    // Load fetch polyfill and run app code
    (require as any).ensure(['whatwg-fetch'], (require: NodeRequire) => {
        // eslint-disable-next-line import/no-unassigned-import
        require('whatwg-fetch');
        void runKresus();
    });
} else {
    void runKresus();
}
