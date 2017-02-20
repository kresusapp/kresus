'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.testEmail = exports.updateWeboob = exports.save = undefined;

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var postSave = function () {
    var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(key, value) {
        return _regenerator2.default.wrap(function _callee$(_context) {
            while (1) {
                switch (_context.prev = _context.next) {
                    case 0:
                        _context.t0 = key;
                        _context.next = _context.t0 === 'mail-config' ? 3 : _context.t0 === 'locale' ? 6 : 8;
                        break;

                    case 3:
                        _context.next = 5;
                        return _emailer2.default.forceReinit();

                    case 5:
                        return _context.abrupt('break', 9);

                    case 6:
                        (0, _helpers.setupTranslator)(value);
                        return _context.abrupt('break', 9);

                    case 8:
                        return _context.abrupt('break', 9);

                    case 9:
                    case 'end':
                        return _context.stop();
                }
            }
        }, _callee, this);
    }));

    return function postSave(_x, _x2) {
        return _ref.apply(this, arguments);
    };
}();

var save = exports.save = function () {
    var _ref2 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee2(req, res) {
        var pair, found;
        return _regenerator2.default.wrap(function _callee2$(_context2) {
            while (1) {
                switch (_context2.prev = _context2.next) {
                    case 0:
                        _context2.prev = 0;
                        pair = req.body;

                        if (!(typeof pair.key === 'undefined')) {
                            _context2.next = 4;
                            break;
                        }

                        throw new _helpers.KError('Missing key when saving a setting', 400);

                    case 4:
                        if (!(typeof pair.value === 'undefined')) {
                            _context2.next = 6;
                            break;
                        }

                        throw new _helpers.KError('Missing value when saving a setting', 400);

                    case 6:
                        _context2.next = 8;
                        return _config2.default.findOrCreateByName(pair.key, pair.value);

                    case 8:
                        found = _context2.sent;

                        if (!(found.value !== pair.value)) {
                            _context2.next = 13;
                            break;
                        }

                        found.value = pair.value;
                        _context2.next = 13;
                        return found.save();

                    case 13:
                        _context2.next = 15;
                        return postSave(pair.key, pair.value);

                    case 15:

                        res.sendStatus(200);
                        _context2.next = 21;
                        break;

                    case 18:
                        _context2.prev = 18;
                        _context2.t0 = _context2['catch'](0);
                        return _context2.abrupt('return', (0, _helpers.asyncErr)(res, _context2.t0, 'when saving a setting'));

                    case 21:
                    case 'end':
                        return _context2.stop();
                }
            }
        }, _callee2, this, [[0, 18]]);
    }));

    return function save(_x3, _x4) {
        return _ref2.apply(this, arguments);
    };
}();

var updateWeboob = exports.updateWeboob = function () {
    var _ref3 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee3(req, res) {
        return _regenerator2.default.wrap(function _callee3$(_context3) {
            while (1) {
                switch (_context3.prev = _context3.next) {
                    case 0:
                        _context3.prev = 0;
                        _context3.next = 3;
                        return weboob.updateWeboobModules();

                    case 3:
                        res.sendStatus(200);
                        _context3.next = 9;
                        break;

                    case 6:
                        _context3.prev = 6;
                        _context3.t0 = _context3['catch'](0);
                        return _context3.abrupt('return', (0, _helpers.asyncErr)(res, _context3.t0, 'when updating weboob'));

                    case 9:
                    case 'end':
                        return _context3.stop();
                }
            }
        }, _callee3, this, [[0, 6]]);
    }));

    return function updateWeboob(_x5, _x6) {
        return _ref3.apply(this, arguments);
    };
}();

var testEmail = exports.testEmail = function () {
    var _ref4 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee4(req, res) {
        var config;
        return _regenerator2.default.wrap(function _callee4$(_context4) {
            while (1) {
                switch (_context4.prev = _context4.next) {
                    case 0:
                        _context4.prev = 0;
                        config = req.body.config;

                        if (config) {
                            _context4.next = 4;
                            break;
                        }

                        throw new _helpers.KError('Missing configuration object when trying to send a test email', 400);

                    case 4:

                        if (config.tls && typeof config.tls.rejectUnauthorized === 'string') {
                            config.tls.rejectUnauthorized = config.tls.rejectUnauthorized === 'true';
                        }
                        if (config.secure && typeof config.secure === 'string') {
                            config.secure = config.secure === 'true';
                        }

                        _context4.next = 8;
                        return _emailer2.default.sendTestEmail(config);

                    case 8:
                        res.sendStatus(200);
                        _context4.next = 14;
                        break;

                    case 11:
                        _context4.prev = 11;
                        _context4.t0 = _context4['catch'](0);
                        return _context4.abrupt('return', (0, _helpers.asyncErr)(res, _context4.t0, 'when trying to send an email'));

                    case 14:
                    case 'end':
                        return _context4.stop();
                }
            }
        }, _callee4, this, [[0, 11]]);
    }));

    return function testEmail(_x7, _x8) {
        return _ref4.apply(this, arguments);
    };
}();

var _config = require('../models/config');

var _config2 = _interopRequireDefault(_config);

var _weboob = require('../lib/sources/weboob');

var weboob = _interopRequireWildcard(_weboob);

var _emailer = require('../lib/emailer');

var _emailer2 = _interopRequireDefault(_emailer);

var _helpers = require('../helpers');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }