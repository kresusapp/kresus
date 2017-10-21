'use strict';

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

var _morgan = require('morgan');

var _morgan2 = _interopRequireDefault(_morgan);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

// Pollute global scope with Babel polyfills prior to anything else.
// Note: eslint doesn't like unassigned imports.
/* eslint-disable */
require('babel-polyfill');
/* eslint-enable */

// Could have been set by bin/kresus.js;
if (!process.kresus) {
    require('./apply-config')( /* standalone */false);
}

function makeUrlPrefixRegExp(urlPrefix) {
    return new RegExp('^' + urlPrefix + '/?');
}

function configureCozyDB(options) {
    return new Promise(function (resolve, reject) {
        _cozydb2.default.configure(options, null, function (err) {
            if (err) {
                return reject(err);
            }
            resolve();
        });
    });
}

var start = function () {
    var _ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee() {
        var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

        var app, rootRegexp, routes, _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, reqpath, descriptor, _iteratorNormalCompletion2, _didIteratorError2, _iteratorError2, _iterator2, _step2, verb, controller, server;

        return regeneratorRuntime.wrap(function _callee$(_context) {
            while (1) {
                switch (_context.prev = _context.next) {
                    case 0:
                        options.name = 'Kresus';
                        options.port = process.kresus.port;
                        options.host = process.kresus.host;
                        options.root = options.root || _path2.default.join(__dirname, '..');

                        _context.next = 6;
                        return configureCozyDB(options);

                    case 6:

                        // Spawn the Express app.
                        app = (0, _express2.default)();

                        // Middlewares.

                        // Middleware for removing the url prefix, if it's set.

                        if (process.kresus.urlPrefix !== '/') {
                            rootRegexp = makeUrlPrefixRegExp(process.kresus.urlPrefix);

                            app.use(function (req, res, next) {
                                req.url = req.url.replace(rootRegexp, '/');
                                return next();
                            });
                        }

                        // Generic express middlewares.
                        app.use((0, _morgan2.default)('[:date[iso]] :method :url - :status (:response-time ms)'));

                        app.use(_bodyParser2.default.json({
                            limit: '100mb'
                        }));

                        app.use(_bodyParser2.default.urlencoded({
                            extended: true,
                            limit: '10mb'
                        }));

                        app.use((0, _methodOverride2.default)());

                        app.use(_express2.default.static(__dirname + '/../client', {}));

                        // Routes.

                        // If we try to import the routes at the top-level with `import`, its
                        // transitive closure of imports will be resolved before cozydb is
                        // initialized. As a matter of fact, default parameters of cozydb will be
                        // used (so no pouchdb). Consequently, `routes` and `init` have to be
                        // dynamically imported after cozydb has been configured.
                        routes = require('./controllers/routes');
                        _iteratorNormalCompletion = true;
                        _didIteratorError = false;
                        _iteratorError = undefined;
                        _context.prev = 17;
                        _iterator = Object.keys(routes)[Symbol.iterator]();

                    case 19:
                        if (_iteratorNormalCompletion = (_step = _iterator.next()).done) {
                            _context.next = 44;
                            break;
                        }

                        reqpath = _step.value;
                        descriptor = routes[reqpath];
                        _iteratorNormalCompletion2 = true;
                        _didIteratorError2 = false;
                        _iteratorError2 = undefined;
                        _context.prev = 25;

                        for (_iterator2 = Object.keys(descriptor)[Symbol.iterator](); !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                            verb = _step2.value;
                            controller = descriptor[verb];

                            if (verb === 'param') {
                                app.param(reqpath.split('/').pop(), controller);
                            } else {
                                app[verb]('/' + reqpath, controller);
                            }
                        }
                        _context.next = 33;
                        break;

                    case 29:
                        _context.prev = 29;
                        _context.t0 = _context['catch'](25);
                        _didIteratorError2 = true;
                        _iteratorError2 = _context.t0;

                    case 33:
                        _context.prev = 33;
                        _context.prev = 34;

                        if (!_iteratorNormalCompletion2 && _iterator2.return) {
                            _iterator2.return();
                        }

                    case 36:
                        _context.prev = 36;

                        if (!_didIteratorError2) {
                            _context.next = 39;
                            break;
                        }

                        throw _iteratorError2;

                    case 39:
                        return _context.finish(36);

                    case 40:
                        return _context.finish(33);

                    case 41:
                        _iteratorNormalCompletion = true;
                        _context.next = 19;
                        break;

                    case 44:
                        _context.next = 50;
                        break;

                    case 46:
                        _context.prev = 46;
                        _context.t1 = _context['catch'](17);
                        _didIteratorError = true;
                        _iteratorError = _context.t1;

                    case 50:
                        _context.prev = 50;
                        _context.prev = 51;

                        if (!_iteratorNormalCompletion && _iterator.return) {
                            _iterator.return();
                        }

                    case 53:
                        _context.prev = 53;

                        if (!_didIteratorError) {
                            _context.next = 56;
                            break;
                        }

                        throw _iteratorError;

                    case 56:
                        return _context.finish(53);

                    case 57:
                        return _context.finish(50);

                    case 58:

                        // It matters that error handling is specified after all the other routes.
                        app.use((0, _errorhandler2.default)({
                            dumpExceptions: true,
                            showStack: true
                        }));

                        server = app.listen(options.port, options.host);

                        // Raise the timeout limit, since some banking modules can be quite
                        // long at fetching new operations. Time is in milliseconds.

                        server.timeout = 5 * 60 * 1000;

                        // See comments above the routes code above.
                        _context.next = 63;
                        return require('./init')();

                    case 63:
                    case 'end':
                        return _context.stop();
                }
            }
        }, _callee, undefined, [[17, 46, 50, 58], [25, 29, 33, 41], [34,, 36, 40], [51,, 53, 57]]);
    }));

    return function start() {
        return _ref.apply(this, arguments);
    };
}();

if (typeof module.parent === 'undefined' || !module.parent) start();

module.exports = {
    start: start,
    makeUrlPrefixRegExp: makeUrlPrefixRegExp
};