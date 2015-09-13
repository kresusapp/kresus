let americano = require('americano');
let i18n      = require('cozy-i18n-helper');

process.kresus = process.kresus || {};
process.kresus.prod = typeof process.env.NODE_ENV !== 'undefined'
                      && ["production", "prod"].indexOf(process.env.NODE_ENV) !== -1;
process.kresus.dev = !process.kresus.prod;

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
