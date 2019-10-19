import cozydb from 'cozydb';

import express from 'express';
import bodyParser from 'body-parser';
import errorHandler from 'errorhandler';
import methodOverride from 'method-override';
import log4js from 'log4js';
import path from 'path';
import PouchDB from 'pouchdb';

function makeUrlPrefixRegExp(urlPrefix) {
    return new RegExp(`^${urlPrefix}/?`);
}

function configureCozyDB(options) {
    return new Promise((resolve, reject) => {
        cozydb.configure(options, null, err => {
            if (err) {
                return reject(err);
            }
            resolve();
        });
    });
}

async function start(options = {}) {
    options.name = 'Kresus';
    options.port = process.kresus.port;
    options.host = process.kresus.host;
    options.root = options.root || path.join(__dirname, '..');

    // eslint-disable-next-line camelcase
    options.db = new PouchDB(options.dbName, { auto_compaction: true });
    options.modelsPath = path.join(__dirname, 'models', 'pouch');

    await configureCozyDB(options);

    // Spawn the Express app.
    const app = express();

    // Middlewares.

    // Middleware for removing the url prefix, if it's set.
    if (process.kresus.urlPrefix !== '/') {
        let rootRegexp = makeUrlPrefixRegExp(process.kresus.urlPrefix);
        app.use((req, res, next) => {
            req.url = req.url.replace(rootRegexp, '/');
            return next();
        });
    }

    // Generic express middlewares.
    app.use(
        log4js.connectLogger(log4js.getLogger('HTTP'), {
            level: 'auto',
            format: ':method :url - :status (:response-time ms)',

            // By default all 3xx status codes, whereas not harmful, will emit a warning message.
            // Only keep the warning for 300 (multiple choices) & 310 (too many redirections).
            statusRules: [
                {
                    from: 301,
                    to: 309,
                    level: 'info'
                }
            ]
        })
    );

    app.use(
        bodyParser.json({
            limit: '100mb'
        })
    );

    app.use(
        bodyParser.urlencoded({
            extended: true,
            limit: '10mb'
        })
    );

    app.use(
        bodyParser.text({
            limit: '100mb'
        })
    );

    app.use(methodOverride());

    app.use(express.static(`${__dirname}/../client`, {}));

    if (process.env.NODE_ENV === 'development') {
        // In development mode, allow any cross-origin resource sharing.
        // Note that having both Allow-Origin set to "*" and credentials in a
        // request are disallowed, so we just reflect the origin header back in
        // the allow-origin CORS header.
        app.use((req, res, next) => {
            res.header('Access-Control-Allow-Origin', req.headers.origin);
            res.header('Access-Control-Allow-Headers', 'content-type');
            res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
            res.header('Access-Control-Allow-Credentials', true);
            next();
        });
    }

    // Use a passportjs compatible middleware for logging the only current
    // user.
    app.use((req, res, next) => {
        req.user = {
            id: process.kresus.user.id
        };
        next();
    });

    // Routes.

    // If we try to import the routes at the top-level with `import`, its
    // transitive closure of imports will be resolved before cozydb is
    // initialized. As a matter of fact, default parameters of cozydb will be
    // used (so no pouchdb). Consequently, `routes` and `init` have to be
    // dynamically imported after cozydb has been configured.
    const routes = require('./controllers/routes');
    for (let reqpath of Object.keys(routes)) {
        let descriptor = routes[reqpath];
        for (let verb of Object.keys(descriptor)) {
            let controller = descriptor[verb];
            if (verb === 'param') {
                app.param(reqpath.split('/').pop(), controller);
            } else {
                app[verb](`/${reqpath}`, controller);
            }
        }
    }

    // It matters that error handling is specified after all the other routes.
    app.use(
        errorHandler({
            dumpExceptions: true,
            showStack: true
        })
    );

    const server = app.listen(options.port, options.host);

    // Raise the timeout limit, since some banking modules can be quite
    // long at fetching new operations. Time is in milliseconds.
    server.timeout = 5 * 60 * 1000;

    // See comments above the routes code above.
    await require('./init')();
}

if (typeof module.parent === 'undefined' || !module.parent) {
    start();
}

module.exports = {
    start,
    testing: {
        makeUrlPrefixRegExp,
        configureCozyDB
    }
};
