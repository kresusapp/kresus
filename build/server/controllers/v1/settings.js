'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.testEmail = exports.updateWeboob = exports.getWeboobVersion = exports.save = undefined;

var save = exports.save = function () {
    var _ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee(req, res) {
        var pair, found;
        return regeneratorRuntime.wrap(function _callee$(_context) {
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

                        postSave(pair.key, pair.value);

                        res.status(200).end();
                        _context.next = 20;
                        break;

                    case 17:
                        _context.prev = 17;
                        _context.t0 = _context['catch'](0);
                        return _context.abrupt('return', (0, _helpers.asyncErr)(res, _context.t0, 'when saving a setting'));

                    case 20:
                    case 'end':
                        return _context.stop();
                }
            }
        }, _callee, this, [[0, 17]]);
    }));

    return function save(_x, _x2) {
        return _ref.apply(this, arguments);
    };
}();

var getWeboobVersion = exports.getWeboobVersion = function () {
    var _ref2 = _asyncToGenerator(regeneratorRuntime.mark(function _callee2(req, res) {
        var version;
        return regeneratorRuntime.wrap(function _callee2$(_context2) {
            while (1) {
                switch (_context2.prev = _context2.next) {
                    case 0:
                        _context2.prev = 0;
                        _context2.next = 3;
                        return _config2.default.getWeboobVersion( /* force = */true);

                    case 3:
                        version = _context2.sent;

                        if (!(version <= 0)) {
                            _context2.next = 6;
                            break;
                        }

                        throw new _helpers.KError('cannot get weboob version', 500, _errors.WEBOOB_NOT_INSTALLED);

                    case 6:
                        res.json({
                            data: {
                                version: version,
                                isInstalled: (0, _helpers.checkWeboobMinimalVersion)(version)
                            }
                        });
                        _context2.next = 12;
                        break;

                    case 9:
                        _context2.prev = 9;
                        _context2.t0 = _context2['catch'](0);
                        return _context2.abrupt('return', (0, _helpers.asyncErr)(res, _context2.t0, 'when getting weboob version'));

                    case 12:
                    case 'end':
                        return _context2.stop();
                }
            }
        }, _callee2, this, [[0, 9]]);
    }));

    return function getWeboobVersion(_x3, _x4) {
        return _ref2.apply(this, arguments);
    };
}();

var updateWeboob = exports.updateWeboob = function () {
    var _ref3 = _asyncToGenerator(regeneratorRuntime.mark(function _callee3(req, res) {
        return regeneratorRuntime.wrap(function _callee3$(_context3) {
            while (1) {
                switch (_context3.prev = _context3.next) {
                    case 0:
                        _context3.prev = 0;
                        _context3.next = 3;
                        return weboob.updateWeboobModules();

                    case 3:
                        res.status(200).end();
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
    var _ref4 = _asyncToGenerator(regeneratorRuntime.mark(function _callee4(req, res) {
        var email;
        return regeneratorRuntime.wrap(function _callee4$(_context4) {
            while (1) {
                switch (_context4.prev = _context4.next) {
                    case 0:
                        _context4.prev = 0;
                        email = req.body.email;

                        if (email) {
                            _context4.next = 4;
                            break;
                        }

                        throw new _helpers.KError('Missing email recipient address when sending a test email', 400);

                    case 4:
                        _context4.next = 6;
                        return _emailer2.default.sendTestEmail(email);

                    case 6:
                        res.status(200).end();
                        _context4.next = 12;
                        break;

                    case 9:
                        _context4.prev = 9;
                        _context4.t0 = _context4['catch'](0);
                        return _context4.abrupt('return', (0, _helpers.asyncErr)(res, _context4.t0, 'when trying to send an email'));

                    case 12:
                    case 'end':
                        return _context4.stop();
                }
            }
        }, _callee4, this, [[0, 9]]);
    }));

    return function testEmail(_x7, _x8) {
        return _ref4.apply(this, arguments);
    };
}();

var _config = require('../../models/config');

var _config2 = _interopRequireDefault(_config);

var _weboob = require('../../lib/sources/weboob');

var weboob = _interopRequireWildcard(_weboob);

var _emailer = require('../../lib/emailer');

var _emailer2 = _interopRequireDefault(_emailer);

var _errors = require('../../shared/errors');

var _helpers = require('../../helpers');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function postSave(key, value) {
    switch (key) {
        case 'email-recipient':
            _emailer2.default.forceReinit(value);
            break;
        case 'locale':
            (0, _helpers.setupTranslator)(value);
            break;
        default:
            break;
    }
}