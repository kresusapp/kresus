'use strict';

let start = (() => {
    var _ref = _asyncToGenerator(function* (options = {}) {
        options.name = 'Kresus';
        options.port = process.kresus.port;
        options.host = process.kresus.host;
        options.root = options.root || _path2.default.join(__dirname, '..');

        yield configureCozyDB(options);

        // Spawn the Express app.
        const app = (0, _express2.default)();

        // Middlewares.

        // Middleware for removing the url prefix, if it's set.
        if (process.kresus.urlPrefix !== '/') {
            let rootRegexp = makeUrlPrefixRegExp(process.kresus.urlPrefix);
            app.use(function (req, res, next) {
                req.url = req.url.replace(rootRegexp, '/');
                return next();
            });
        }

        // Generic express middlewares.
        app.use(_log4js2.default.connectLogger(_log4js2.default.getLogger('HTTP'), {
            level: 'auto',
            format: ':method :url - :status (:response-time ms)'
        }));

        app.use(_bodyParser2.default.json({
            limit: '100mb'
        }));

        app.use(_bodyParser2.default.urlencoded({
            extended: true,
            limit: '10mb'
        }));

        app.use((0, _methodOverride2.default)());

        app.use(_express2.default.static(`${__dirname}/../client`, {}));

        if (process.env.NODE_ENV === 'development') {
            // In development mode, allow any cross-origin resource sharing.
            // Note that having both Allow-Origin set to "*" and credentials in a
            // request are disallowed, so we just reflect the origin header back in
            // the allow-origin CORS header.
            app.use(function (req, res, next) {
                res.header('Access-Control-Allow-Origin', req.headers.origin);
                res.header('Access-Control-Allow-Headers', 'content-type');
                res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
                res.header('Access-Control-Allow-Credentials', true);
                next();
            });
        }

        // Routes.

        // If we try to import the routes at the top-level with `import`, its
        // transitive closure of imports will be resolved before cozydb is
        // initialized. As a matter of fact, default parameters of cozydb will be
        // used (so no pouchdb). Consequently, `routes` and `init` have to be
        // dynamically imported after cozydb has been configured.
        const routes = require('./controllers/routes');
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
            for (var _iterator = Object.keys(routes)[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                let reqpath = _step.value;

                let descriptor = routes[reqpath];
                var _iteratorNormalCompletion2 = true;
                var _didIteratorError2 = false;
                var _iteratorError2 = undefined;

                try {
                    for (var _iterator2 = Object.keys(descriptor)[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                        let verb = _step2.value;

                        let controller = descriptor[verb];
                        if (verb === 'param') {
                            app.param(reqpath.split('/').pop(), controller);
                        } else {
                            app[verb](`/${reqpath}`, controller);
                        }
                    }
                } catch (err) {
                    _didIteratorError2 = true;
                    _iteratorError2 = err;
                } finally {
                    try {
                        if (!_iteratorNormalCompletion2 && _iterator2.return) {
                            _iterator2.return();
                        }
                    } finally {
                        if (_didIteratorError2) {
                            throw _iteratorError2;
                        }
                    }
                }
            }

            // It matters that error handling is specified after all the other routes.
        } catch (err) {
            _didIteratorError = true;
            _iteratorError = err;
        } finally {
            try {
                if (!_iteratorNormalCompletion && _iterator.return) {
                    _iterator.return();
                }
            } finally {
                if (_didIteratorError) {
                    throw _iteratorError;
                }
            }
        }

        app.use((0, _errorhandler2.default)({
            dumpExceptions: true,
            showStack: true
        }));

        const server = app.listen(options.port, options.host);

        // Raise the timeout limit, since some banking modules can be quite
        // long at fetching new operations. Time is in milliseconds.
        server.timeout = 5 * 60 * 1000;

        // See comments above the routes code above.
        yield require('./init')();
    });

    return function start() {
        return _ref.apply(this, arguments);
    };
})();

var _cozydb = require('cozydb');

var _cozydb2 = _interopRequireDefault(_cozydb);

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _bodyParser = require('body-parser');

var _bodyParser2 = _interopRequireDefault(_bodyParser);

var _errorhandler = require('errorhandler');

var _errorhandler2 = _interopRequireDefault(_errorhandler);

var _methodOverride = require('method-override');

var _methodOverride2 = _interopRequireDefault(_methodOverride);

var _log4js = require('log4js');

var _log4js2 = _interopRequireDefault(_log4js);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function makeUrlPrefixRegExp(urlPrefix) {
    return new RegExp(`^${urlPrefix}/?`);
}

function configureCozyDB(options) {
    return new Promise((resolve, reject) => {
        _cozydb2.default.configure(options, null, err => {
            if (err) {
                return reject(err);
            }
            resolve();
        });
    });
}

if (typeof module.parent === 'undefined' || !module.parent) {
    start();
}

module.exports = {
    start,
    makeUrlPrefixRegExp
};