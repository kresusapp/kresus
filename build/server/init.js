'use strict';

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _helpers = require('./helpers');

var _migrations = require('./models/migrations');

var Migrations = _interopRequireWildcard(_migrations);

var _config = require('./models/config');

var Settings = _interopRequireWildcard(_config);

var _poller = require('./lib/poller');

var _poller2 = _interopRequireDefault(_poller);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var log = (0, _helpers.makeLogger)('init');

// See comment in index.js.
module.exports = function () {
    var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(app, server, callback) {
        var locale;
        return _regenerator2.default.wrap(function _callee$(_context) {
            while (1) {
                switch (_context.prev = _context.next) {
                    case 0:
                        _context.prev = 0;
                        _context.next = 3;
                        return Settings.getLocale();

                    case 3:
                        locale = _context.sent;

                        (0, _helpers.setupTranslator)(locale);

                        // Do data migrations first
                        log.info('Applying data migrations...');
                        _context.next = 8;
                        return Migrations.run();

                    case 8:
                        log.info('Done running data migrations.');

                        // Start bank polling
                        log.info('Starting bank accounts polling et al...');
                        _context.next = 12;
                        return _poller2.default.runAtStartup();

                    case 12:

                        log.info("Server is ready, let's start the show!");

                        _context.next = 18;
                        break;

                    case 15:
                        _context.prev = 15;
                        _context.t0 = _context['catch'](0);

                        log.error('Error at initialization:\nMessage: ' + _context.t0.message + '\n' + _context.t0.stack);

                    case 18:
                        if (!callback) {
                            _context.next = 20;
                            break;
                        }

                        return _context.abrupt('return', callback(app, server));

                    case 20:
                    case 'end':
                        return _context.stop();
                }
            }
        }, _callee, this, [[0, 15]]);
    }));

    return function (_x, _x2, _x3) {
        return _ref.apply(this, arguments);
    };
}();