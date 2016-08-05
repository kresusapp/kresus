'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.updateWeboob = exports.save = undefined;

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var save = exports.save = function () {
    var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(req, res) {
        var pair, found;
        return _regenerator2.default.wrap(function _callee$(_context) {
            while (1) {
                switch (_context.prev = _context.next) {
                    case 0:
                        _context.prev = 0;
                        pair = req.body;

                        if (!(typeof pair.key === 'undefined')) {
                            _context.next = 4;
                            break;
                        }

                        throw new _helpers.KError('Missing key when saving a setting', 400);

                    case 4:
                        if (!(typeof pair.value === 'undefined')) {
                            _context.next = 6;
                            break;
                        }

                        throw new _helpers.KError('Missing value when saving a setting', 400);

                    case 6:
                        _context.next = 8;
                        return _config2.default.findOrCreateByName(pair.key, pair.value);

                    case 8:
                        found = _context.sent;

                        if (!(found.value !== pair.value)) {
                            _context.next = 13;
                            break;
                        }

                        found.value = pair.value;
                        _context.next = 13;
                        return found.save();

                    case 13:
                        res.sendStatus(200);
                        _context.next = 19;
                        break;

                    case 16:
                        _context.prev = 16;
                        _context.t0 = _context['catch'](0);
                        return _context.abrupt('return', (0, _helpers.asyncErr)(res, _context.t0, 'when saving a setting'));

                    case 19:
                    case 'end':
                        return _context.stop();
                }
            }
        }, _callee, this, [[0, 16]]);
    }));

    return function save(_x, _x2) {
        return _ref.apply(this, arguments);
    };
}();

var updateWeboob = exports.updateWeboob = function () {
    var _ref2 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee2(req, res) {
        return _regenerator2.default.wrap(function _callee2$(_context2) {
            while (1) {
                switch (_context2.prev = _context2.next) {
                    case 0:
                        _context2.prev = 0;
                        _context2.next = 3;
                        return weboob.updateWeboobModules();

                    case 3:
                        res.sendStatus(200);
                        _context2.next = 9;
                        break;

                    case 6:
                        _context2.prev = 6;
                        _context2.t0 = _context2['catch'](0);
                        return _context2.abrupt('return', (0, _helpers.asyncErr)(res, _context2.t0, 'when updating weboob'));

                    case 9:
                    case 'end':
                        return _context2.stop();
                }
            }
        }, _callee2, this, [[0, 6]]);
    }));

    return function updateWeboob(_x3, _x4) {
        return _ref2.apply(this, arguments);
    };
}();

var _config = require('../models/config');

var _config2 = _interopRequireDefault(_config);

var _weboob = require('../lib/sources/weboob');

var weboob = _interopRequireWildcard(_weboob);

var _helpers = require('../helpers');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }