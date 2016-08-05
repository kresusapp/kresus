'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.destroy = exports.getAccounts = exports.preloadBank = undefined;

var _getIterator2 = require('babel-runtime/core-js/get-iterator');

var _getIterator3 = _interopRequireDefault(_getIterator2);

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

// Preloads @bank in a request
var preloadBank = exports.preloadBank = function () {
    var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(req, res, next, bankID) {
        var bank;
        return _regenerator2.default.wrap(function _callee$(_context) {
            while (1) {
                switch (_context.prev = _context.next) {
                    case 0:
                        _context.prev = 0;
                        _context.next = 3;
                        return _bank2.default.find(bankID);

                    case 3:
                        bank = _context.sent;

                        req.preloaded = { bank: bank };
                        next();
                        _context.next = 11;
                        break;

                    case 8:
                        _context.prev = 8;
                        _context.t0 = _context['catch'](0);
                        return _context.abrupt('return', (0, _helpers.asyncErr)(_context.t0, res, 'when preloading a bank'));

                    case 11:
                    case 'end':
                        return _context.stop();
                }
            }
        }, _callee, this, [[0, 8]]);
    }));

    return function preloadBank(_x, _x2, _x3, _x4) {
        return _ref.apply(this, arguments);
    };
}();

// Returns accounts of the queried bank.


var getAccounts = exports.getAccounts = function () {
    var _ref2 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee2(req, res) {
        var accounts;
        return _regenerator2.default.wrap(function _callee2$(_context2) {
            while (1) {
                switch (_context2.prev = _context2.next) {
                    case 0:
                        _context2.prev = 0;
                        _context2.next = 3;
                        return _account2.default.byBank(req.preloaded.bank);

                    case 3:
                        accounts = _context2.sent;

                        res.status(200).send(accounts);
                        _context2.next = 10;
                        break;

                    case 7:
                        _context2.prev = 7;
                        _context2.t0 = _context2['catch'](0);
                        return _context2.abrupt('return', (0, _helpers.asyncErr)(_context2.t0, res, 'when getting accounts for a bank'));

                    case 10:
                    case 'end':
                        return _context2.stop();
                }
            }
        }, _callee2, this, [[0, 7]]);
    }));

    return function getAccounts(_x5, _x6) {
        return _ref2.apply(this, arguments);
    };
}();

// Erase all accesses bounds to the queried bank (triggering deletion of
// accounts as well).


var destroy = exports.destroy = function () {
    var _ref3 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee3(req, res) {
        var accesses, _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, access, accounts, _iteratorNormalCompletion2, _didIteratorError2, _iteratorError2, _iterator2, _step2, account;

        return _regenerator2.default.wrap(function _callee3$(_context3) {
            while (1) {
                switch (_context3.prev = _context3.next) {
                    case 0:
                        _context3.prev = 0;

                        log.info('Deleting all accesses for bank ' + req.preloaded.bank.uuid);

                        _context3.next = 4;
                        return _access2.default.byBank(req.preloaded.bank);

                    case 4:
                        accesses = _context3.sent;
                        _iteratorNormalCompletion = true;
                        _didIteratorError = false;
                        _iteratorError = undefined;
                        _context3.prev = 8;
                        _iterator = (0, _getIterator3.default)(accesses);

                    case 10:
                        if (_iteratorNormalCompletion = (_step = _iterator.next()).done) {
                            _context3.next = 46;
                            break;
                        }

                        access = _step.value;

                        log.info('Removing access ' + access.id + ' for bank ' + access.bank + '...');
                        _context3.next = 15;
                        return _account2.default.byAccess(access);

                    case 15:
                        accounts = _context3.sent;
                        _iteratorNormalCompletion2 = true;
                        _didIteratorError2 = false;
                        _iteratorError2 = undefined;
                        _context3.prev = 19;
                        _iterator2 = (0, _getIterator3.default)(accounts);

                    case 21:
                        if (_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done) {
                            _context3.next = 28;
                            break;
                        }

                        account = _step2.value;
                        _context3.next = 25;
                        return AccountController.destroyWithOperations(account);

                    case 25:
                        _iteratorNormalCompletion2 = true;
                        _context3.next = 21;
                        break;

                    case 28:
                        _context3.next = 34;
                        break;

                    case 30:
                        _context3.prev = 30;
                        _context3.t0 = _context3['catch'](19);
                        _didIteratorError2 = true;
                        _iteratorError2 = _context3.t0;

                    case 34:
                        _context3.prev = 34;
                        _context3.prev = 35;

                        if (!_iteratorNormalCompletion2 && _iterator2.return) {
                            _iterator2.return();
                        }

                    case 37:
                        _context3.prev = 37;

                        if (!_didIteratorError2) {
                            _context3.next = 40;
                            break;
                        }

                        throw _iteratorError2;

                    case 40:
                        return _context3.finish(37);

                    case 41:
                        return _context3.finish(34);

                    case 42:
                        log.info('Done!');

                    case 43:
                        _iteratorNormalCompletion = true;
                        _context3.next = 10;
                        break;

                    case 46:
                        _context3.next = 52;
                        break;

                    case 48:
                        _context3.prev = 48;
                        _context3.t1 = _context3['catch'](8);
                        _didIteratorError = true;
                        _iteratorError = _context3.t1;

                    case 52:
                        _context3.prev = 52;
                        _context3.prev = 53;

                        if (!_iteratorNormalCompletion && _iterator.return) {
                            _iterator.return();
                        }

                    case 55:
                        _context3.prev = 55;

                        if (!_didIteratorError) {
                            _context3.next = 58;
                            break;
                        }

                        throw _iteratorError;

                    case 58:
                        return _context3.finish(55);

                    case 59:
                        return _context3.finish(52);

                    case 60:

                        res.sendStatus(204);
                        _context3.next = 66;
                        break;

                    case 63:
                        _context3.prev = 63;
                        _context3.t2 = _context3['catch'](0);
                        return _context3.abrupt('return', (0, _helpers.asyncErr)(res, _context3.t2, 'when destroying an account'));

                    case 66:
                    case 'end':
                        return _context3.stop();
                }
            }
        }, _callee3, this, [[0, 63], [8, 48, 52, 60], [19, 30, 34, 42], [35,, 37, 41], [53,, 55, 59]]);
    }));

    return function destroy(_x7, _x8) {
        return _ref3.apply(this, arguments);
    };
}();

var _bank = require('../models/bank');

var _bank2 = _interopRequireDefault(_bank);

var _access = require('../models/access');

var _access2 = _interopRequireDefault(_access);

var _account = require('../models/account');

var _account2 = _interopRequireDefault(_account);

var _accounts = require('./accounts');

var AccountController = _interopRequireWildcard(_accounts);

var _helpers = require('../helpers');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var log = (0, _helpers.makeLogger)('controllers/banks');