'use strict';

var _americano = require('americano');

var _americano2 = _interopRequireDefault(_americano);

var _pathExtra = require('path-extra');

var _pathExtra2 = _interopRequireDefault(_pathExtra);

var _helpers = require('./helpers');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var log = (0, _helpers.makeLogger)('index');

var application = function application() {
    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    var callback = arguments[1];

    options.name = 'Kresus';
    options.root = options.root || _pathExtra2.default.join(__dirname, '..');
    options.port = process.env.PORT || 9876;
    options.host = process.env.HOST || '127.0.0.1';

    // If we try to import 'init', this has to be done at the global scope
    // level. In this case, we will import init and its transitive closure of
    // imports before americano is initialized. As a matter of fact, default
    // parameters of americano will be taken into account (no routes, no
    // models, no standalone cozydb). So the 'init' import has to be
    // synchronous, at the last minute.
    _americano2.default.start(options, function (err, app, server) {
        if (err) {
            return log.error('Error when starting americano: ' + err);
        }

        // Raise the timeout limit, since some banking modules can be quite
        // long at fetching new operations. Time is in milliseconds.
        server.timeout = 5 * 60 * 1000;

        require('./init')(app, server, callback);
    });
};

if (typeof module.parent === 'undefined' || !module.parent) application();

module.exports = application;