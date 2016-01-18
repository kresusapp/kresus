'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.updateWeboob = exports.save = undefined;

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _config = require('../models/config');

var _config2 = _interopRequireDefault(_config);

var _weboob = require('../lib/sources/weboob');

var weboob = _interopRequireWildcard(_weboob);

var _helpers = require('../helpers');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var save = exports.save = (function () {
    var ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(req, res) {
        var pair, found;
        return _regenerator2.default.wrap(function _callee$(_context) {
            while (1) {
                switch (_context.prev = _context.next) {
                    case 0:
                        pair = req.body;

                        if (!(typeof pair.key === 'undefined')) {
                            _context.next = 3;
                            break;
                        }

                        return _context.abrupt('return', (0, _helpers.sendErr)(res, 'missing key in settings', 400, 'Missing key when saving a setting'));

                    case 3:
                        if (!(typeof pair.value === 'undefined')) {
                            _context.next = 5;
                            break;
                        }

                        return _context.abrupt('return', (0, _helpers.sendErr)(res, 'missing value in settings', 400, 'Missing value when saving a setting'));

                    case 5:
                        _context.prev = 5;
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
                        _context.t0 = _context['catch'](5);
                        return _context.abrupt('return', (0, _helpers.asyncErr)(res, _context.t0, 'when saving a setting'));

                    case 19:
                    case 'end':
                        return _context.stop();
                }
            }
        }, _callee, this, [[5, 16]]);
    }));
    return function save(_x, _x2) {
        return ref.apply(this, arguments);
    };
})();

var updateWeboob = exports.updateWeboob = (function () {
    var ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee2(req, res) {
        var body, action;
        return _regenerator2.default.wrap(function _callee2$(_context2) {
            while (1) {
                switch (_context2.prev = _context2.next) {
                    case 0:
                        body = req.body;
                        action = !body || !body.action ? 'core' : body.action;

                        if (!(['core', 'modules'].indexOf(action) === -1)) {
                            _context2.next = 4;
                            break;
                        }

                        return _context2.abrupt('return', (0, _helpers.sendErr)(res, 'Bad parameters for updateWeboob', 400, 'Bad parameters when trying to update weboob.'));

                    case 4:
                        _context2.prev = 4;

                        if (!(action === 'modules')) {
                            _context2.next = 10;
                            break;
                        }

                        _context2.next = 8;
                        return weboob.updateWeboobModules();

                    case 8:
                        _context2.next = 12;
                        break;

                    case 10:
                        _context2.next = 12;
                        return weboob.installOrUpdateWeboob(true);

                    case 12:
                        res.sendStatus(200);
                        _context2.next = 18;
                        break;

                    case 15:
                        _context2.prev = 15;
                        _context2.t0 = _context2['catch'](4);
                        return _context2.abrupt('return', (0, _helpers.asyncErr)(res, _context2.t0, 'when updating weboob'));

                    case 18:
                    case 'end':
                        return _context2.stop();
                }
            }
        }, _callee2, this, [[4, 15]]);
    }));
    return function updateWeboob(_x3, _x4) {
        return ref.apply(this, arguments);
    };
})();