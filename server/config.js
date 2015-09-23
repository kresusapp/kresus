import americano from 'americano';
import i18n      from 'cozy-i18n-helper';

process.kresus = process.kresus || {};
process.kresus.prod = typeof process.env.NODE_ENV !== 'undefined'
                      && ["production", "prod"].indexOf(process.env.NODE_ENV) !== -1;
process.kresus.dev = !process.kresus.prod;

// Note the use of require here: babel puts imports at the top level of the
// file, that is, above the definition of process.kresus. Sigh.
let dbPlugin = require('./db').name;

export default {

    common: [
        americano.bodyParser({limit: '10mb'}),
        americano.methodOverride(),
        americano.errorHandler({
            dumpExceptions: true,
            showStack: true
        }),
        americano.static(__dirname + '/../client', {
            maxAge: 86400000
        }),
        i18n.middleware
    ],

    development: [
        americano.logger('dev')
    ],

    production: [
        americano.logger('short')
    ],

    plugins: [
        dbPlugin
    ]
};
