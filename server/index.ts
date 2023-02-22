import express from 'express';
import basicAuth from 'express-basic-auth';
import log4js from 'log4js';

import { makeUrlPrefixRegExp } from './helpers';
import routes from './controllers/routes';
import init from './init';

async function start() {
    // Spawn the Express app.
    const app = express();

    // Middlewares.

    // Middleware for removing the url prefix, if it's set.
    if (process.kresus.urlPrefix !== '/') {
        const rootRegexp = makeUrlPrefixRegExp(process.kresus.urlPrefix);
        // We use a trick here, by having something that rewrites the URL by
        // removing the URL prefix if it was set.
        //
        // This means that if the browser tries to access any resource without
        // the URL prefix, this would work; so make sure to return 404 on these
        // accesses, to avoid hard-to-debug situations.
        app.use((req, res, next) => {
            // Safeguard against misuses.
            if (!req.url.startsWith(process.kresus.urlPrefix)) {
                res.status(404);
                return false;
            }
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
                    level: 'info',
                },
            ],
        })
    );

    if (process.kresus.basicAuth) {
        app.use(
            basicAuth({
                users: process.kresus.basicAuth,
                challenge: true,
                realm: 'Kresus Basic Auth',
            })
        );
    }

    app.use(
        express.json({
            limit: '100mb',
        })
    );

    app.use(
        express.urlencoded({
            extended: true,
            limit: '10mb',
        })
    );

    app.use(
        express.text({
            limit: '100mb',
        })
    );

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
    app.use((req, _res, next) => {
        req.user = {
            id: process.kresus.user.id,
        };
        next();
    });

    // Routes.
    for (const reqpath of Object.keys(routes)) {
        const descriptor = routes[reqpath];
        for (const [verb, controller] of Object.entries(descriptor)) {
            switch (verb) {
                case 'param': {
                    const paramName = reqpath.split('/').pop();
                    // paramName can never be undefined due to reqpath.split() returning always
                    // an array with at least one item, but as Array.pop can be undefined,
                    // TypeScript wants the check.
                    if (typeof paramName !== 'undefined') {
                        app.param(paramName, controller);
                    }
                    break;
                }
                case 'put':
                    app.put(`/${reqpath}`, controller);
                    break;
                case 'post':
                    app.post(`/${reqpath}`, controller);
                    break;
                case 'delete':
                    app.delete(`/${reqpath}`, controller);
                    break;
                case 'get':
                    app.get(`/${reqpath}`, controller);
                    break;

                default:
                    throw new Error(`unknown API verb used in index.ts: ${verb}`);
            }
        }
    }

    const server = app.listen(process.kresus.port, process.kresus.host);

    // Raise the timeout limit, since some banking modules can be quite
    // long at fetching new transactions. Time is in milliseconds.
    server.timeout = 5 * 60 * 1000;

    await init();
}

module.exports = {
    start,
};
