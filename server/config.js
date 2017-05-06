import * as path from 'path';

import americano from 'americano';
import i18n from 'cozy-i18n-helper';

const nodeEnv = process.env.NODE_ENV;
process.kresus = process.kresus || {};
process.kresus.prod = typeof nodeEnv !== 'undefined' &&
                      ['production', 'prod'].indexOf(nodeEnv) !== -1;
process.kresus.dev = !process.kresus.prod;
process.kresus.standalone = process.kresus.standalone || false;

const ROOT = process.env.KRESUS_URL_PREFIX;

let common = [
    americano.bodyParser({ limit: '10mb' }),
    americano.methodOverride(),
    americano.errorHandler({
        dumpExceptions: true,
        showStack: true
    }),
    americano.static(path.join(__dirname, '..', 'client'), {
        maxAge: 86400000
    }),
    i18n.middleware
];

if (typeof ROOT === 'string' && ROOT.length) {
    // If there's a root, add a middleware that removes it from incoming URLs
    // if it appears in a prefix position.

    let root = path.posix.resolve('/', ROOT);
    let rootRegexp = new RegExp(`^${root}/?`);

    let removePrefix = (req, res, next) => {
        req.url = req.url.replace(rootRegexp, '/');
        return next();
    };

    common.splice(0, 0, removePrefix);
}

// Config is loaded from americano, which doesn't support babel default export.
module.exports = {
    common,

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
