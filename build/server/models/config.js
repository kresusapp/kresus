'use strict';

// Returns a pair {name, value} or the default value if not found.
let findOrCreateByName = (() => {
    var _ref2 = _asyncToGenerator(function* (name, defaultValue) {
        let found = yield request('byName', { key: name });
        if (!found || !found.length) {
            let pair = {
                name,
                value: defaultValue
            };
            pair = yield Config.create(pair);
            return pair;
        }
        return found[0];
    });

    return function findOrCreateByName(_x2, _x3) {
        return _ref2.apply(this, arguments);
    };
})();

// Returns a pair {name, value} or the preset default value if not found.
let findOrCreateDefault = (() => {
    var _ref3 = _asyncToGenerator(function* (name) {
        if (!_defaultSettings2.default.has(name)) {
            throw new _helpers.KError(`Setting ${name} has no default value!`);
        }

        let defaultValue = _defaultSettings2.default.get(name);
        return yield findOrCreateByName(name, defaultValue);
    });

    return function findOrCreateDefault(_x4) {
        return _ref3.apply(this, arguments);
    };
})();

// Returns a boolean value for a given key, or the preset default.
let findOrCreateDefaultBooleanValue = (() => {
    var _ref4 = _asyncToGenerator(function* (name) {
        let pair = yield findOrCreateDefault(name);
        return pair.value === 'true';
    });

    return function findOrCreateDefaultBooleanValue(_x5) {
        return _ref4.apply(this, arguments);
    };
})();

var _cozydb = require('cozydb');

var cozydb = _interopRequireWildcard(_cozydb);

var _helpers = require('../helpers');

var _defaultSettings = require('../shared/default-settings');

var _defaultSettings2 = _interopRequireDefault(_defaultSettings);

var _weboob = require('../lib/sources/weboob');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

let log = (0, _helpers.makeLogger)('models/config');

// A simple key/value configuration pair.
let Config = cozydb.getModel('kresusconfig', {
    name: String,
    value: String
});

Config = (0, _helpers.promisifyModel)(Config);

let request = (0, _helpers.promisify)(Config.request.bind(Config));

// Returns a pair {name, value} or null if not found.
Config.byName = (() => {
    var _ref = _asyncToGenerator(function* (name) {
        if (typeof name !== 'string') {
            log.warn('Config.byName misuse: name must be a string');
        }

        let founds = yield request('byName', { key: name });
        if (founds && founds.length) {
            return founds[0];
        }

        return null;
    });

    function byName(_x) {
        return _ref.apply(this, arguments);
    }

    return byName;
})();
Config.findOrCreateByName = findOrCreateByName;
Config.findOrCreateDefault = findOrCreateDefault;
Config.findOrCreateDefaultBooleanValue = findOrCreateDefaultBooleanValue;

Config.getLocale = _asyncToGenerator(function* () {
    return (yield Config.findOrCreateDefault('locale')).value;
});

let oldAll = Config.all.bind(Config);

// A list of all the settings that are implied at runtime and should not be
// saved into the database.
// *Never* ever remove a name from this list, since these are used also to
// know which settings shouldn't be imported or exported.
Config.ghostSettings = new Set(['weboob-version', 'weboob-installed', 'standalone-mode', 'url-prefix', 'emails-enabled']);

// Returns all the config name/value pairs, except for the ghost ones that are
// implied at runtime.
Config.allWithoutGhost = _asyncToGenerator(function* () {
    const values = yield oldAll();

    let nameSet = new Set(values.map(function (v) {
        return v.name;
    }));
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
        for (var _iterator = Config.ghostSettings.keys()[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            let ghostName = _step.value;

            (0, _helpers.assert)(!nameSet.has(ghostName), `${ghostName} shouldn't be saved into the database.`);
        }

        // Add a pair for the locale.
    } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
    } finally {
        try {
            if (!_iteratorNormalCompletion && _iterator.return) {
                _iterator.return();
            }
        } finally {
            if (_didIteratorError) {
                throw _iteratorError;
            }
        }
    }

    if (!nameSet.has('locale')) {
        values.push({
            name: 'locale',
            value: yield Config.getLocale()
        });
    }

    return values;
});

// Returns all the config name/value pairs, including those which are generated
// at runtime.
Config.all = _asyncToGenerator(function* () {
    let values = yield Config.allWithoutGhost();

    let version = yield (0, _weboob.getVersion)();
    values.push({
        name: 'weboob-version',
        value: version
    });

    // Add a pair to indicate weboob install status.
    let isWeboobInstalled = (0, _helpers.checkWeboobMinimalVersion)(version);
    values.push({
        name: 'weboob-installed',
        value: isWeboobInstalled.toString()
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

    return values;
});

module.exports = Config;