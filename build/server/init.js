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

var _operationtype = require('./models/operationtype');

var OperationType = _interopRequireWildcard(_operationtype);

var _config = require('./models/config');

var Settings = _interopRequireWildcard(_config);

var _poller = require('./lib/poller');

var _poller2 = _interopRequireDefault(_poller);

var _banks = require('./shared/banks.json');

var _banks2 = _interopRequireDefault(_banks);

var _operationTypes = require('./shared/operation-types.json');

var _operationTypes2 = _interopRequireDefault(_operationTypes);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var log = (0, _helpers.makeLogger)('init');

// See comment in index.js.
module.exports = function () {
    var ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(app, server, callback) {
        var _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, type, _iteratorNormalCompletion2, _didIteratorError2, _iteratorError2, _iterator2, _step2, bank;

        return _regenerator2.default.wrap(function _callee$(_context) {
            while (1) {
                switch (_context.prev = _context.next) {
                    case 0:
                        _context.prev = 0;
                        _context.next = 3;
                        return Settings.getLocale();

                    case 3:
                        _context.t0 = _context.sent;
                        (0, _helpers.setupTranslator)(_context.t0);


                        // Do data migrations first
                        log.info('Applying data migrations...');
                        _context.next = 8;
                        return Migrations.run();

                    case 8:
                        log.info('Done running data migrations.');

                        // Bank Operation type initialisation
                        log.info('Maybe adding operation types');
                        _iteratorNormalCompletion = true;
                        _didIteratorError = false;
                        _iteratorError = undefined;
                        _context.prev = 13;
                        _iterator = (0, _getIterator3.default)(_operationTypes2.default);

                    case 15:
                        if (_iteratorNormalCompletion = (_step = _iterator.next()).done) {
                            _context.next = 22;
                            break;
                        }

                        type = _step.value;
                        _context.next = 19;
                        return OperationType.createOrUpdate(type);

                    case 19:
                        _iteratorNormalCompletion = true;
                        _context.next = 15;
                        break;

                    case 22:
                        _context.next = 28;
                        break;

                    case 24:
                        _context.prev = 24;
                        _context.t1 = _context['catch'](13);
                        _didIteratorError = true;
                        _iteratorError = _context.t1;

                    case 28:
                        _context.prev = 28;
                        _context.prev = 29;

                        if (!_iteratorNormalCompletion && _iterator.return) {
                            _iterator.return();
                        }

                    case 31:
                        _context.prev = 31;

                        if (!_didIteratorError) {
                            _context.next = 34;
                            break;
                        }

                        throw _iteratorError;

                    case 34:
                        return _context.finish(31);

                    case 35:
                        return _context.finish(28);

                    case 36:
                        log.info('Success: all operation types added.');

                        // Bank initialization
                        log.info('Maybe adding banks...');
                        _iteratorNormalCompletion2 = true;
                        _didIteratorError2 = false;
                        _iteratorError2 = undefined;
                        _context.prev = 41;
                        _iterator2 = (0, _getIterator3.default)(_banks2.default);

                    case 43:
                        if (_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done) {
                            _context.next = 50;
                            break;
                        }

                        bank = _step2.value;
                        _context.next = 47;
                        return Bank.createOrUpdate(bank);

                    case 47:
                        _iteratorNormalCompletion2 = true;
                        _context.next = 43;
                        break;

                    case 50:
                        _context.next = 56;
                        break;

                    case 52:
                        _context.prev = 52;
                        _context.t2 = _context['catch'](41);
                        _didIteratorError2 = true;
                        _iteratorError2 = _context.t2;

                    case 56:
                        _context.prev = 56;
                        _context.prev = 57;

                        if (!_iteratorNormalCompletion2 && _iterator2.return) {
                            _iterator2.return();
                        }

                    case 59:
                        _context.prev = 59;

                        if (!_didIteratorError2) {
                            _context.next = 62;
                            break;
                        }

                        throw _iteratorError2;

                    case 62:
                        return _context.finish(59);

                    case 63:
                        return _context.finish(56);

                    case 64:
                        log.info('Success: All banks added.');

                        // Start bank polling
                        log.info('Starting bank accounts polling et al...');
                        _context.next = 68;
                        return _poller2.default.runAtStartup();

                    case 68:

                        log.info("Server is ready, let's start the show!");

                        _context.next = 74;
                        break;

                    case 71:
                        _context.prev = 71;
                        _context.t3 = _context['catch'](0);

                        log.error('Error at initialization:\nMessage: ' + _context.t3.message + '\n' + _context.t3.stack);

                    case 74:

                        if (callback) callback(app, server);

                    case 75:
                    case 'end':
                        return _context.stop();
                }
            }
        }, _callee, this, [[0, 71], [13, 24, 28, 36], [29,, 31, 35], [41, 52, 56, 64], [57,, 59, 63]]);
    }));
    return function (_x, _x2, _x3) {
        return ref.apply(this, arguments);
    };
}();