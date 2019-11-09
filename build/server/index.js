"use strict";

var _cozydb = _interopRequireDefault(require("cozydb"));

var _express = _interopRequireDefault(require("express"));

var _bodyParser = _interopRequireDefault(require("body-parser"));

var _errorhandler = _interopRequireDefault(require("errorhandler"));

var _methodOverride = _interopRequireDefault(require("method-override"));

var _log4js = _interopRequireDefault(require("log4js"));

var _path = _interopRequireDefault(require("path"));

var _pouchdb = _interopRequireDefault(require("pouchdb"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function makeUrlPrefixRegExp(urlPrefix) {
  return new RegExp(`^${urlPrefix}/?`);
}

function configureCozyDB(options) {
  return new Promise((resolve, reject) => {
    _cozydb.default.configure(options, null, err => {
      if (err) {
        return reject(err);
      }

      resolve();
    });
  });
}

function start() {
  return _start.apply(this, arguments);
}

function _start() {
  _start = _asyncToGenerator(function* (options = {}) {
    options.name = 'Kresus';
    options.port = process.kresus.port;
    options.host = process.kresus.host;
    options.root = options.root || _path.default.join(__dirname, '..'); // eslint-disable-next-line camelcase

    options.db = new _pouchdb.default(options.dbName, {
      auto_compaction: true
    });
    options.modelsPath = _path.default.join(__dirname, 'models', 'pouch');
    yield configureCozyDB(options); // Spawn the Express app.

    const app = (0, _express.default)(); // Middlewares.
    // Middleware for removing the url prefix, if it's set.

    if (process.kresus.urlPrefix !== '/') {
      let rootRegexp = makeUrlPrefixRegExp(process.kresus.urlPrefix);
      app.use((req, res, next) => {
        req.url = req.url.replace(rootRegexp, '/');
        return next();
      });
    } // Generic express middlewares.


    app.use(_log4js.default.connectLogger(_log4js.default.getLogger('HTTP'), {
      level: 'auto',
      format: ':method :url - :status (:response-time ms)',
      // By default all 3xx status codes, whereas not harmful, will emit a warning message.
      // Only keep the warning for 300 (multiple choices) & 310 (too many redirections).
      statusRules: [{
        from: 301,
        to: 309,
        level: 'info'
      }]
    }));
    app.use(_bodyParser.default.json({
      limit: '100mb'
    }));
    app.use(_bodyParser.default.urlencoded({
      extended: true,
      limit: '10mb'
    }));
    app.use(_bodyParser.default.text({
      limit: '100mb'
    }));
    app.use((0, _methodOverride.default)());
    app.use(_express.default.static(`${__dirname}/../client`, {}));

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
    } // Use a passportjs compatible middleware for logging the only current
    // user.


    app.use((req, res, next) => {
      req.user = {
        id: process.kresus.user.id
      };
      next();
    }); // Routes.
    // If we try to import the routes at the top-level with `import`, its
    // transitive closure of imports will be resolved before cozydb is
    // initialized. As a matter of fact, default parameters of cozydb will be
    // used (so no pouchdb). Consequently, `routes` and `init` have to be
    // dynamically imported after cozydb has been configured.

    const routes = require('./controllers/routes');

    for (var _i = 0, _Object$keys = Object.keys(routes); _i < _Object$keys.length; _i++) {
      let reqpath = _Object$keys[_i];
      let descriptor = routes[reqpath];

      for (var _i2 = 0, _Object$keys2 = Object.keys(descriptor); _i2 < _Object$keys2.length; _i2++) {
        let verb = _Object$keys2[_i2];
        let controller = descriptor[verb];

        if (verb === 'param') {
          app.param(reqpath.split('/').pop(), controller);
        } else {
          app[verb](`/${reqpath}`, controller);
        }
      }
    } // It matters that error handling is specified after all the other routes.


    app.use((0, _errorhandler.default)({
      dumpExceptions: true,
      showStack: true
    }));
    const server = app.listen(options.port, options.host); // Raise the timeout limit, since some banking modules can be quite
    // long at fetching new operations. Time is in milliseconds.

    server.timeout = 5 * 60 * 1000; // See comments above the routes code above.

    yield require('./init')();
  });
  return _start.apply(this, arguments);
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