import americano from 'americano';
import i18n      from 'cozy-i18n-helper';

process.kresus = process.kresus || {};
process.kresus.prod = typeof process.env.NODE_ENV !== 'undefined'
                      && ["production", "prod"].indexOf(process.env.NODE_ENV) !== -1;
process.kresus.dev = !process.kresus.prod;

import {name as dbPlugin} from './db';

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
