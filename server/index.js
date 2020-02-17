import express from 'express';
import basicAuth from 'express-basic-auth';
import bodyParser from 'body-parser';
import errorHandler from 'errorhandler';
import methodOverride from 'method-override';
import log4js from 'log4js';
import path from 'path';

import { makeUrlPrefixRegExp } from './helpers';
import routes from './controllers/routes';
import init from './init';

async function start(options = {}) {
    options.name = 'Kresus';
    options.port = process.kresus.port;
    options.host = process.kresus.host;
    options.root = options.root || path.join(__dirname, '..');

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

    if (process.kresus.basicAuth) {
        app.use(
            basicAuth({
                users: process.kresus.basicAuth,
                challenge: true,
                realm: 'Kresus Basic Auth'
            })
        );
    }

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
            res.header('Access-Control-Allow-Credentials', 'true');
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
    for (let reqpath of Object.keys(routes)) {
        let descriptor = routes[reqpath];
        for (let verb of Object.keys(descriptor)) {
            let controller = descriptor[verb];
            if (verb === 'param') {
                const paramName = reqpath.split('/').pop();
                // paramName can never be undefined due to reqpath.split() returning always
                // an array with at least one item, but as Array.pop can be undefined,
                // TypeScript wants the check.
                if (typeof paramName !== 'undefined') {
                    app.param(paramName, controller);
                }
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

    await init(options);
}

if (typeof module.parent === 'undefined' || !module.parent) {
    start();
}

module.exports = {
    start
};
