'use strict';

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _getIterator2 = require('babel-runtime/core-js/get-iterator');

var _getIterator3 = _interopRequireDefault(_getIterator2);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _helpers = require('./helpers');

var _migrations = require('./models/migrations');

var Migrations = _interopRequireWildcard(_migrations);

var _bank = require('./models/bank');

var Bank = _interopRequireWildcard(_bank);

var _config = require('./models/config');

var Settings = _interopRequireWildcard(_config);

var _poller = require('./lib/poller');

var _poller2 = _interopRequireDefault(_poller);

var _banks = require('./shared/banks.json');

var _banks2 = _interopRequireDefault(_banks);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var log = (0, _helpers.makeLogger)('init');

// See comment in index.js.
module.exports = function () {
    var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(app, server, callback) {
        var locale, _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, bank;

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
                        (0, _helpers.setupMoment)(locale);

                        // Do data migrations first
                        log.info('Applying data migrations...');
                        _context.next = 9;
                        return Migrations.run();

                    case 9:
                        log.info('Done running data migrations.');

                        // Bank initialization
                        log.info('Maybe adding banks...');
                        _iteratorNormalCompletion = true;
                        _didIteratorError = false;
                        _iteratorError = undefined;
                        _context.prev = 14;
                        _iterator = (0, _getIterator3.default)(_banks2.default);

                    case 16:
                        if (_iteratorNormalCompletion = (_step = _iterator.next()).done) {
                            _context.next = 23;
                            break;
                        }

                        bank = _step.value;
                        _context.next = 20;
                        return Bank.createOrUpdate(bank);

                    case 20:
                        _iteratorNormalCompletion = true;
                        _context.next = 16;
                        break;

                    case 23:
                        _context.next = 29;
                        break;

                    case 25:
                        _context.prev = 25;
                        _context.t0 = _context['catch'](14);
                        _didIteratorError = true;
                        _iteratorError = _context.t0;

                    case 29:
                        _context.prev = 29;
                        _context.prev = 30;

                        if (!_iteratorNormalCompletion && _iterator.return) {
                            _iterator.return();
                        }

                    case 32:
                        _context.prev = 32;

                        if (!_didIteratorError) {
                            _context.next = 35;
                            break;
                        }

                        throw _iteratorError;

                    case 35:
                        return _context.finish(32);

                    case 36:
                        return _context.finish(29);

                    case 37:
                        log.info('Success: All banks added.');

                        // Start bank polling
                        log.info('Starting bank accounts polling et al...');
                        _context.next = 41;
                        return _poller2.default.runAtStartup();

                    case 41:

                        log.info("Server is ready, let's start the show!");

                        _context.next = 47;
                        break;

                    case 44:
                        _context.prev = 44;
                        _context.t1 = _context['catch'](0);

                        log.error('Error at initialization:\nMessage: ' + _context.t1.message + '\n' + _context.t1.stack);

                    case 47:

                        if (callback) callback(app, server);

                    case 48:
                    case 'end':
                        return _context.stop();
                }
            }
        }, _callee, this, [[0, 44], [14, 25, 29, 37], [30,, 32, 36]]);
    }));

    return function (_x, _x2, _x3) {
        return _ref.apply(this, arguments);
    };
}();