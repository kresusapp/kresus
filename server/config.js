import americano from 'americano';
import i18n      from 'cozy-i18n-helper';

const nodeEnv = process.env.NODE_ENV;
process.kresus = process.kresus || {};
process.kresus.prod = typeof nodeEnv !== 'undefined' && ["production", "prod"].indexOf(nodeEnv) !== -1;
process.kresus.dev = !process.kresus.prod;
process.kresus.standalone = process.kresus.standalone || false;

// Config is loaded from americano, which doesn't support babel default export.
module.exports = {
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
        'cozydb'
    ]
};
