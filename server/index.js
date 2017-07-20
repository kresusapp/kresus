import cozydb from 'cozydb';

import express from 'express';
import bodyParser from 'body-parser';
import errorHandler from 'errorhandler';
import methodOverride from 'method-override';
import morgan from 'morgan';
import path from 'path';

export const JSON_SPACES = 2;

// Could have been set by bin/kresus.js;
if (!process.kresus) {
    require('./apply-config')(/* standalone */ false);
}

export function makeUrlPrefixRegExp(urlPrefix) {
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

    await configureCozyDB(options);

    // Spawn the Express app.
    const app = express();
    app.set('json spaces', JSON_SPACES);

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
    app.use(morgan('[:date[iso]] :method :url - :status (:response-time ms)'));

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

    app.use(methodOverride());

    app.use(express.static(`${__dirname}/../client`, {}));

    // Routes.

    // If we try to import the routes at the top-level with `import`, its
    // transitive closure of imports will be resolved before cozydb is
    // initialized. As a matter of fact, default parameters of cozydb will be
    // used (so no pouchdb). Consequently, `routes` and `init` have to be
    // dynamically imported after cozydb has been configured.
    const mountRoutes = require('./controllers/routes');
    mountRoutes.forEach(routeBuilder => routeBuilder(app));

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

    return server;
}

if (typeof module.parent === 'undefined' || !module.parent) start();

module.exports = {
    start,
    makeUrlPrefixRegExp
};
