/**
 * Lazy-loads all the required polyfills prior to running the main code.
 */
import runKresus from './main';

if (!global.fetch) {
    // Load fetch polyfill and run app code
    require.ensure(['whatwg-fetch'], require => {
        // eslint-disable-next-line import/no-unassigned-import
        require('whatwg-fetch');
        runKresus();
    });
} else {
    runKresus();
}
