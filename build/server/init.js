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

var _weboob = require('./lib/sources/weboob');

var WeboobManager = _interopRequireWildcard(_weboob);

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

                        // Do data migrations first
                        log.info('Applying data migrations...');
                        _context.next = 4;
                        return Migrations.run();

                    case 4:
                        log.info('Done running data migrations.');

                        // Bank Operation type initialisation
                        log.info('Maybe adding operation types');
                        _iteratorNormalCompletion = true;
                        _didIteratorError = false;
                        _iteratorError = undefined;
                        _context.prev = 9;
                        _iterator = (0, _getIterator3.default)(_operationTypes2.default);

                    case 11:
                        if (_iteratorNormalCompletion = (_step = _iterator.next()).done) {
                            _context.next = 18;
                            break;
                        }

                        type = _step.value;
                        _context.next = 15;
                        return OperationType.createOrUpdate(type);

                    case 15:
                        _iteratorNormalCompletion = true;
                        _context.next = 11;
                        break;

                    case 18:
                        _context.next = 24;
                        break;

                    case 20:
                        _context.prev = 20;
                        _context.t0 = _context['catch'](9);
                        _didIteratorError = true;
                        _iteratorError = _context.t0;

                    case 24:
                        _context.prev = 24;
                        _context.prev = 25;

                        if (!_iteratorNormalCompletion && _iterator.return) {
                            _iterator.return();
                        }

                    case 27:
                        _context.prev = 27;

                        if (!_didIteratorError) {
                            _context.next = 30;
                            break;
                        }

                        throw _iteratorError;

                    case 30:
                        return _context.finish(27);

                    case 31:
                        return _context.finish(24);

                    case 32:
                        log.info('Success: all operation types added.');

                        // Bank initialization
                        log.info('Maybe adding banks...');
                        _iteratorNormalCompletion2 = true;
                        _didIteratorError2 = false;
                        _iteratorError2 = undefined;
                        _context.prev = 37;
                        _iterator2 = (0, _getIterator3.default)(_banks2.default);

                    case 39:
                        if (_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done) {
                            _context.next = 46;
                            break;
                        }

                        bank = _step2.value;
                        _context.next = 43;
                        return Bank.createOrUpdate(bank);

                    case 43:
                        _iteratorNormalCompletion2 = true;
                        _context.next = 39;
                        break;

                    case 46:
                        _context.next = 52;
                        break;

                    case 48:
                        _context.prev = 48;
                        _context.t1 = _context['catch'](37);
                        _didIteratorError2 = true;
                        _iteratorError2 = _context.t1;

                    case 52:
                        _context.prev = 52;
                        _context.prev = 53;

                        if (!_iteratorNormalCompletion2 && _iterator2.return) {
                            _iterator2.return();
                        }

                    case 55:
                        _context.prev = 55;

                        if (!_didIteratorError2) {
                            _context.next = 58;
                            break;
                        }

                        throw _iteratorError2;

                    case 58:
                        return _context.finish(55);

                    case 59:
                        return _context.finish(52);

                    case 60:
                        log.info('Success: All banks added.');

                        // Maybe install Weboob
                        _context.next = 63;
                        return WeboobManager.init();

                    case 63:

                        // Start bank polling
                        log.info('Starting bank accounts polling et al...');
                        _context.next = 66;
                        return _poller2.default.runAtStartup();

                    case 66:

                        log.info("Server is ready, let's start the show!");

                        _context.next = 72;
                        break;

                    case 69:
                        _context.prev = 69;
                        _context.t2 = _context['catch'](0);

                        log.error('Error at initialization: ' + _context.t2 + '\n        ' + _context.t2.stack);

                    case 72:

                        if (callback) callback(app, server);

                    case 73:
                    case 'end':
                        return _context.stop();
                }
            }
        }, _callee, this, [[0, 69], [9, 20, 24, 32], [25,, 27, 31], [37, 48, 52, 60], [53,, 55, 59]]);
    }));
    return function (_x, _x2, _x3) {
        return ref.apply(this, arguments);
    };
}();