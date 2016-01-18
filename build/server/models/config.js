'use strict';

var _context;

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _cozydb = require('cozydb');

var americano = _interopRequireWildcard(_cozydb);

var _helpers = require('../helpers');

var _weboob = require('../lib/sources/weboob');

var _defaultSettings = require('../shared/default-settings');

var _defaultSettings2 = _interopRequireDefault(_defaultSettings);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var log = (0, _helpers.makeLogger)('models/config');

var Config = americano.getModel('kresusconfig', {
    name: String,
    value: String
});

Config = (0, _helpers.promisifyModel)(Config);

var request = (0, _helpers.promisify)((_context = Config).request.bind(_context));

// Returns a pair {name, value}
Config.byName = (function () {
    var ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(name) {
        var founds;
        return _regenerator2.default.wrap(function _callee$(_context2) {
            while (1) {
                switch (_context2.prev = _context2.next) {
                    case 0:
                        if (typeof name !== 'string') log.warn('Config.byName misuse: name must be a string');
                        _context2.next = 3;
                        return request('byName', { key: name });

                    case 3:
                        founds = _context2.sent;

                        if (!(founds && founds.length)) {
                            _context2.next = 6;
                            break;
                        }

                        return _context2.abrupt('return', founds[0]);

                    case 6:
                        return _context2.abrupt('return', null);

                    case 7:
                    case 'end':
                        return _context2.stop();
                }
            }
        }, _callee, this);
    }));
    return function byName(_x) {
        return ref.apply(this, arguments);
    };
})();

// Returns a pair {name, value}

var findOrCreateByName = (function () {
    var ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee2(name, defaultValue) {
        var found, pair;
        return _regenerator2.default.wrap(function _callee2$(_context3) {
            while (1) {
                switch (_context3.prev = _context3.next) {
                    case 0:
                        _context3.next = 2;
                        return request('byName', { key: name });

                    case 2:
                        found = _context3.sent;

                        if (!(!found || !found.length)) {
                            _context3.next = 9;
                            break;
                        }

                        pair = {
                            name: name,
                            value: defaultValue
                        };
                        _context3.next = 7;
                        return Config.create(pair);

                    case 7:
                        pair = _context3.sent;
                        return _context3.abrupt('return', pair);

                    case 9:
                        return _context3.abrupt('return', found[0]);

                    case 10:
                    case 'end':
                        return _context3.stop();
                }
            }
        }, _callee2, this);
    }));
    return function findOrCreateByName(_x2, _x3) {
        return ref.apply(this, arguments);
    };
})();

Config.findOrCreateByName = findOrCreateByName;

// Returns a pair {name, value}

var findOrCreateDefault = (function () {
    var ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee3(name) {
        var defaultValue;
        return _regenerator2.default.wrap(function _callee3$(_context4) {
            while (1) {
                switch (_context4.prev = _context4.next) {
                    case 0:
                        if (_defaultSettings2.default.has(name)) {
                            _context4.next = 2;
                            break;
                        }

                        throw new Error('Setting ' + name + ' has no default value!');

                    case 2:
                        defaultValue = _defaultSettings2.default.get(name);
                        _context4.next = 5;
                        return findOrCreateByName(name, defaultValue);

                    case 5:
                        return _context4.abrupt('return', _context4.sent);

                    case 6:
                    case 'end':
                        return _context4.stop();
                }
            }
        }, _callee3, this);
    }));
    return function findOrCreateDefault(_x4) {
        return ref.apply(this, arguments);
    };
})();

Config.findOrCreateDefault = findOrCreateDefault;

// Returns the boolean value

var findOrCreateDefaultBooleanValue = (function () {
    var ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee4(name) {
        var pair;
        return _regenerator2.default.wrap(function _callee4$(_context5) {
            while (1) {
                switch (_context5.prev = _context5.next) {
                    case 0:
                        _context5.next = 2;
                        return findOrCreateDefault(name);

                    case 2:
                        pair = _context5.sent;
                        return _context5.abrupt('return', pair.value === 'true');

                    case 4:
                    case 'end':
                        return _context5.stop();
                }
            }
        }, _callee4, this);
    }));
    return function findOrCreateDefaultBooleanValue(_x5) {
        return ref.apply(this, arguments);
    };
})();

Config.findOrCreateDefaultBooleanValue = findOrCreateDefaultBooleanValue;

var oldAll = (_context = Config).all.bind(_context);
Config.all = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee5() {
    var values, pair;
    return _regenerator2.default.wrap(function _callee5$(_context6) {
        while (1) {
            switch (_context6.prev = _context6.next) {
                case 0:
                    _context6.next = 2;
                    return oldAll();

                case 2:
                    values = _context6.sent;
                    _context6.next = 5;
                    return (0, _weboob.testInstall)();

                case 5:
                    _context6.t0 = _context6.sent.toString();
                    pair = {
                        name: 'weboob-installed',
                        value: _context6.t0
                    };

                    values.push(pair);
                    return _context6.abrupt('return', values);

                case 9:
                case 'end':
                    return _context6.stop();
            }
        }
    }, _callee5, this);
}));

module.exports = Config;