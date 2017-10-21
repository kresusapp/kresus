'use strict';

var _helpers = require('./helpers');

var _migrations = require('./models/migrations');

var Migrations = _interopRequireWildcard(_migrations);

var _config = require('./models/config');

var Settings = _interopRequireWildcard(_config);

var _poller = require('./lib/poller');

var _poller2 = _interopRequireDefault(_poller);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

var log = (0, _helpers.makeLogger)('init');

// See comment in index.js.
module.exports = _asyncToGenerator(regeneratorRuntime.mark(function _callee() {
    var locale;
    return regeneratorRuntime.wrap(function _callee$(_context) {
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
                case 'end':
                    return _context.stop();
            }
        }
    }, _callee, this, [[0, 15]]);
}));