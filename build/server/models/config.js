'use strict';

var _context;

// Returns a pair {name, value} or the default value if not found.
var findOrCreateByName = function () {
    var _ref2 = _asyncToGenerator(regeneratorRuntime.mark(function _callee2(name, defaultValue) {
        var found, pair;
        return regeneratorRuntime.wrap(function _callee2$(_context3) {
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
        return _ref2.apply(this, arguments);
    };
}();

// Returns a pair {name, value} or the preset default value if not found.
var findOrCreateDefault = function () {
    var _ref3 = _asyncToGenerator(regeneratorRuntime.mark(function _callee3(name) {
        var defaultValue;
        return regeneratorRuntime.wrap(function _callee3$(_context4) {
            while (1) {
                switch (_context4.prev = _context4.next) {
                    case 0:
                        if (_defaultSettings2.default.has(name)) {
                            _context4.next = 2;
                            break;
                        }

                        throw new _helpers.KError('Setting ' + name + ' has no default value!');

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
        return _ref3.apply(this, arguments);
    };
}();

// Returns a boolean value for a given key, or the preset default.
var findOrCreateDefaultBooleanValue = function () {
    var _ref4 = _asyncToGenerator(regeneratorRuntime.mark(function _callee4(name) {
        var pair;
        return regeneratorRuntime.wrap(function _callee4$(_context5) {
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
        return _ref4.apply(this, arguments);
    };
}();

var getWeboobVersion = function () {
    var _ref7 = _asyncToGenerator(regeneratorRuntime.mark(function _callee7() {
        var forceFetch = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
        var version;
        return regeneratorRuntime.wrap(function _callee7$(_context8) {
            while (1) {
                switch (_context8.prev = _context8.next) {
                    case 0:
                        Weboob = Weboob || require('../lib/sources/weboob');

                        if (!(cachedWeboobVersion === 0 || !(0, _helpers.checkWeboobMinimalVersion)(cachedWeboobVersion) || forceFetch)) {
                            _context8.next = 6;
                            break;
                        }

                        _context8.next = 4;
                        return Weboob.getVersion();

                    case 4:
                        version = _context8.sent;

                        cachedWeboobVersion = version !== '?' ? version : 0;

                    case 6:
                        return _context8.abrupt('return', cachedWeboobVersion);

                    case 7:
                    case 'end':
                        return _context8.stop();
                }
            }
        }, _callee7, this);
    }));

    return function getWeboobVersion() {
        return _ref7.apply(this, arguments);
    };
}();

var _cozydb = require('cozydb');

var cozydb = _interopRequireWildcard(_cozydb);

var _helpers = require('../helpers');

var _defaultSettings = require('../shared/default-settings');

var _defaultSettings2 = _interopRequireDefault(_defaultSettings);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

var log = (0, _helpers.makeLogger)('models/config');

// A simple key/value configuration pair.
var Config = cozydb.getModel('kresusconfig', {
    name: String,
    value: String
});

Config = (0, _helpers.promisifyModel)(Config);

var request = (0, _helpers.promisify)((_context = Config).request.bind(_context));

// Returns a pair {name, value} or null if not found.
Config.byName = function () {
    var _ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee(name) {
        var founds;
        return regeneratorRuntime.wrap(function _callee$(_context2) {
            while (1) {
                switch (_context2.prev = _context2.next) {
                    case 0:
                        if (typeof name !== 'string') {
                            log.warn('Config.byName misuse: name must be a string');
                        }

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

    function byName(_x) {
        return _ref.apply(this, arguments);
    }

    return byName;
}();
Config.findOrCreateByName = findOrCreateByName;
Config.findOrCreateDefault = findOrCreateDefault;
Config.findOrCreateDefaultBooleanValue = findOrCreateDefaultBooleanValue;

var getCozyLocale = (0, _helpers.promisify)((_context = cozydb.api).getCozyLocale.bind(_context));

Config.getLocale = _asyncToGenerator(regeneratorRuntime.mark(function _callee5() {
    var locale;
    return regeneratorRuntime.wrap(function _callee5$(_context6) {
        while (1) {
            switch (_context6.prev = _context6.next) {
                case 0:
                    locale = void 0;

                    if (!process.kresus.standalone) {
                        _context6.next = 7;
                        break;
                    }

                    _context6.next = 4;
                    return Config.findOrCreateDefault('locale');

                case 4:
                    locale = _context6.sent.value;
                    _context6.next = 10;
                    break;

                case 7:
                    _context6.next = 9;
                    return getCozyLocale();

                case 9:
                    locale = _context6.sent;

                case 10:
                    return _context6.abrupt('return', locale);

                case 11:
                case 'end':
                    return _context6.stop();
            }
        }
    }, _callee5, this);
}));

var oldAll = (_context = Config).all.bind(_context);

// A list of all the settings that are implied at runtime and should not be
// saved into the database.
Config.ghostSettings = new Set(['weboob-installed', 'standalone-mode', 'url-prefix', 'emails-enabled']);

// Returns all the config name/value pairs, except for the ghost ones that are
// implied at runtime.
Config.allWithoutGhost = _asyncToGenerator(regeneratorRuntime.mark(function _callee6() {
    var values, nameSet, _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, ghostName;

    return regeneratorRuntime.wrap(function _callee6$(_context7) {
        while (1) {
            switch (_context7.prev = _context7.next) {
                case 0:
                    _context7.next = 2;
                    return oldAll();

                case 2:
                    values = _context7.sent;
                    nameSet = new Set(values.map(function (v) {
                        return v.name;
                    }));
                    _iteratorNormalCompletion = true;
                    _didIteratorError = false;
                    _iteratorError = undefined;
                    _context7.prev = 7;

                    for (_iterator = Config.ghostSettings.keys()[Symbol.iterator](); !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                        ghostName = _step.value;

                        (0, _helpers.assert)(!nameSet.has(ghostName), ghostName + ' shouldn\'t be saved into the database.');
                    }

                    // Add a pair for the locale.
                    _context7.next = 15;
                    break;

                case 11:
                    _context7.prev = 11;
                    _context7.t0 = _context7['catch'](7);
                    _didIteratorError = true;
                    _iteratorError = _context7.t0;

                case 15:
                    _context7.prev = 15;
                    _context7.prev = 16;

                    if (!_iteratorNormalCompletion && _iterator.return) {
                        _iterator.return();
                    }

                case 18:
                    _context7.prev = 18;

                    if (!_didIteratorError) {
                        _context7.next = 21;
                        break;
                    }

                    throw _iteratorError;

                case 21:
                    return _context7.finish(18);

                case 22:
                    return _context7.finish(15);

                case 23:
                    if (nameSet.has('locale')) {
                        _context7.next = 30;
                        break;
                    }

                    _context7.t1 = values;
                    _context7.next = 27;
                    return Config.getLocale();

                case 27:
                    _context7.t2 = _context7.sent;
                    _context7.t3 = {
                        name: 'locale',
                        value: _context7.t2
                    };

                    _context7.t1.push.call(_context7.t1, _context7.t3);

                case 30:
                    return _context7.abrupt('return', values);

                case 31:
                case 'end':
                    return _context7.stop();
            }
        }
    }, _callee6, this, [[7, 11, 15, 23], [16,, 18, 22]]);
}));

var cachedWeboobVersion = 0;

var Weboob = null;


Config.getWeboobVersion = getWeboobVersion;

Config.invalidateWeboobVersionCache = function () {
    cachedWeboobVersion = 0;
};

// Returns all the config name/value pairs, including those which are generated
// at runtime.
Config.all = _asyncToGenerator(regeneratorRuntime.mark(function _callee8() {
    var values, version, isWeboobInstalled;
    return regeneratorRuntime.wrap(function _callee8$(_context9) {
        while (1) {
            switch (_context9.prev = _context9.next) {
                case 0:
                    _context9.next = 2;
                    return Config.allWithoutGhost();

                case 2:
                    values = _context9.sent;
                    _context9.next = 5;
                    return getWeboobVersion();

                case 5:
                    version = _context9.sent;
                    isWeboobInstalled = (0, _helpers.checkWeboobMinimalVersion)(version);

                    values.push({
                        name: 'weboob-installed',
                        value: isWeboobInstalled.toString()
                    });

                    // Indicate whether Kresus is running in standalone mode or within cozy.
                    values.push({
                        name: 'standalone-mode',
                        value: String(process.kresus.standalone)
                    });

                    // Indicates at which path Kresus is served.
                    values.push({
                        name: 'url-prefix',
                        value: String(process.kresus.urlPrefix)
                    });

                    // Have emails been enabled by the administrator?
                    values.push({
                        name: 'emails-enabled',
                        value: String((0, _helpers.isEmailEnabled)())
                    });

                    return _context9.abrupt('return', values);

                case 12:
                case 'end':
                    return _context9.stop();
            }
        }
    }, _callee8, this);
}));

module.exports = Config;