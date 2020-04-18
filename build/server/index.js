"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_basic_auth_1 = __importDefault(require("express-basic-auth"));
const body_parser_1 = __importDefault(require("body-parser"));
const errorhandler_1 = __importDefault(require("errorhandler"));
const method_override_1 = __importDefault(require("method-override"));
const log4js_1 = __importDefault(require("log4js"));
const helpers_1 = require("./helpers");
const routes_1 = __importDefault(require("./controllers/routes"));
const init_1 = __importDefault(require("./init"));
async function start(root, cozyDbName) {
    // Spawn the Express app.
    const app = express_1.default();
    // Middlewares.
    // Middleware for removing the url prefix, if it's set.
    if (process.kresus.urlPrefix !== '/') {
        const rootRegexp = helpers_1.makeUrlPrefixRegExp(process.kresus.urlPrefix);
        app.use((req, res, next) => {
            req.url = req.url.replace(rootRegexp, '/');
            return next();
        });
    }
    // Generic express middlewares.
    app.use(log4js_1.default.connectLogger(log4js_1.default.getLogger('HTTP'), {
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
    }));
    if (process.kresus.basicAuth) {
        app.use(express_basic_auth_1.default({
            users: process.kresus.basicAuth,
            challenge: true,
            realm: 'Kresus Basic Auth'
        }));
    }
    app.use(body_parser_1.default.json({
        limit: '100mb'
    }));
    app.use(body_parser_1.default.urlencoded({
        extended: true,
        limit: '10mb'
    }));
    app.use(body_parser_1.default.text({
        limit: '100mb'
    }));
    app.use(method_override_1.default());
    app.use(express_1.default.static(`${__dirname}/../client`, {}));
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
    for (const reqpath of Object.keys(routes_1.default)) {
        const descriptor = routes_1.default[reqpath];
        for (const verb of Object.keys(descriptor)) {
            const controller = descriptor[verb];
            if (verb === 'param') {
                const paramName = reqpath.split('/').pop();
                // paramName can never be undefined due to reqpath.split() returning always
                // an array with at least one item, but as Array.pop can be undefined,
                // TypeScript wants the check.
                if (typeof paramName !== 'undefined') {
                    app.param(paramName, controller);
                }
            }
            else {
                app[verb](`/${reqpath}`, controller);
            }
        }
    }
    // It matters that error handling is specified after all the other routes.
    app.use(errorhandler_1.default({
        dumpExceptions: true,
        showStack: true
    }));
    const server = app.listen(process.kresus.port, process.kresus.host);
    // Raise the timeout limit, since some banking modules can be quite
    // long at fetching new operations. Time is in milliseconds.
    server.timeout = 5 * 60 * 1000;
    await init_1.default(root, cozyDbName);
}
module.exports = {
    start
};
