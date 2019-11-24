"use strict";

var cozydb = _interopRequireWildcard(require("cozydb"));

var _helpers = require("../../helpers");

var _defaultSettings = _interopRequireDefault(require("../../shared/default-settings"));

var _weboob = require("../../lib/sources/weboob");

var _ghostSettings = require("../../lib/ghost-settings");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function _getRequireWildcardCache() { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; if (obj != null) { var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

let log = (0, _helpers.makeLogger)('models/settings'); // A simple key/value configuration pair.

let Setting = cozydb.getModel('kresusconfig', {
  key: String,
  value: String,
  // Deprecated (renamed to key).
  name: String
});
Setting = (0, _helpers.promisifyModel)(Setting);
Setting.renamings = {
  name: 'key'
};
let request = (0, _helpers.promisify)(Setting.request.bind(Setting));
let olderCreate = Setting.create;

Setting.create =
/*#__PURE__*/
function () {
  var _ref = _asyncToGenerator(function* (userId, pair) {
    (0, _helpers.assert)(userId === 0, 'Setting.create first arg must be the userId.');
    return yield olderCreate(pair);
  });

  return function (_x, _x2) {
    return _ref.apply(this, arguments);
  };
}();

let olderUpdateAttributes = Setting.updateAttributes;

Setting.update =
/*#__PURE__*/
function () {
  var _ref2 = _asyncToGenerator(function* (userId, configId, fields) {
    (0, _helpers.assert)(userId === 0, 'Setting.update first arg must be the userId.');
    return yield olderUpdateAttributes(configId, fields);
  });

  return function (_x3, _x4, _x5) {
    return _ref2.apply(this, arguments);
  };
}();

Setting.updateAttributes =
/*#__PURE__*/
_asyncToGenerator(function* () {
  (0, _helpers.assert)(false, 'Setting.updateAttributes is deprecated. Please use Setting.update');
});

Setting.updateByKey =
/*#__PURE__*/
function () {
  var _ref4 = _asyncToGenerator(function* (userId, key, value) {
    (0, _helpers.assert)(userId === 0, 'Setting.updateByKey first arg must be the userId.');
    let config = yield Setting.findOrCreateByKey(userId, key, value);

    if (config.value === value) {
      return config;
    }

    return Setting.update(userId, config.id, {
      value
    });
  });

  return function (_x6, _x7, _x8) {
    return _ref4.apply(this, arguments);
  };
}(); // Returns a pair {key, value} or null if not found.


Setting.byKey =
/*#__PURE__*/
function () {
  var _byKey = _asyncToGenerator(function* (userId, key) {
    (0, _helpers.assert)(userId === 0, 'Setting.byKey first arg must be the userId.');

    if (typeof key !== 'string') {
      log.warn('Setting.byKey misuse: key must be a string');
    }

    let founds = yield request('byKey', {
      key
    });

    if (founds && founds.length) {
      return founds[0];
    }

    return null;
  });

  function byKey(_x9, _x10) {
    return _byKey.apply(this, arguments);
  }

  return byKey;
}(); // Returns a pair {key, value} or the default value if not found.


function findOrCreateByKey(_x11, _x12, _x13) {
  return _findOrCreateByKey.apply(this, arguments);
}

function _findOrCreateByKey() {
  _findOrCreateByKey = _asyncToGenerator(function* (userId, key, defaultValue) {
    (0, _helpers.assert)(userId === 0, 'Setting.findOrCreateByKey first arg must be the userId.');
    let found = yield Setting.byKey(userId, key);

    if (found === null) {
      let pair = {
        key,
        value: defaultValue
      };
      pair = yield Setting.create(userId, pair);
      return pair;
    }

    return found;
  });
  return _findOrCreateByKey.apply(this, arguments);
}

Setting.findOrCreateByKey = findOrCreateByKey; // Returns a pair {key, value} or the preset default value if not found.

function findOrCreateDefault(_x14, _x15) {
  return _findOrCreateDefault.apply(this, arguments);
}

function _findOrCreateDefault() {
  _findOrCreateDefault = _asyncToGenerator(function* (userId, key) {
    (0, _helpers.assert)(userId === 0, 'Setting.findOrCreateDefault first arg must be the userId.');

    if (!_defaultSettings.default.has(key)) {
      throw new _helpers.KError(`Setting ${key} has no default value!`);
    }

    let defaultValue = _defaultSettings.default.get(key);

    return yield findOrCreateByKey(userId, key, defaultValue);
  });
  return _findOrCreateDefault.apply(this, arguments);
}

Setting.findOrCreateDefault = findOrCreateDefault; // Returns a boolean value for a given key, or the preset default.

function findOrCreateDefaultBooleanValue(_x16, _x17) {
  return _findOrCreateDefaultBooleanValue.apply(this, arguments);
}

function _findOrCreateDefaultBooleanValue() {
  _findOrCreateDefaultBooleanValue = _asyncToGenerator(function* (userId, key) {
    let pair = yield findOrCreateDefault(userId, key);
    return pair.value === 'true';
  });
  return _findOrCreateDefaultBooleanValue.apply(this, arguments);
}

Setting.findOrCreateDefaultBooleanValue = findOrCreateDefaultBooleanValue;

Setting.getLocale =
/*#__PURE__*/
function () {
  var _ref5 = _asyncToGenerator(function* (userId) {
    return (yield Setting.findOrCreateDefault(userId, 'locale')).value;
  });

  return function (_x18) {
    return _ref5.apply(this, arguments);
  };
}();

let oldAll = Setting.all.bind(Setting); // Returns all the config key/value pairs, except for the ghost ones that are
// implied at runtime.

Setting.allWithoutGhost =
/*#__PURE__*/
function () {
  var _ref6 = _asyncToGenerator(function* (userId) {
    const values = yield oldAll();
    let keySet = new Set(values.map(v => v.key));
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = _ghostSettings.ConfigGhostSettings.keys()[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        let ghostKey = _step.value;
        (0, _helpers.assert)(!keySet.has(ghostKey), `${ghostKey} shouldn't be saved into the database.`);
      } // Add a pair for the locale.

    } catch (err) {
      _didIteratorError = true;
      _iteratorError = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion && _iterator.return != null) {
          _iterator.return();
        }
      } finally {
        if (_didIteratorError) {
          throw _iteratorError;
        }
      }
    }

    if (!keySet.has('locale')) {
      const localeSetting = yield Setting.findOrCreateDefault(userId, 'locale');
      values.push(localeSetting);
    }

    return values;
  });

  return function (_x19) {
    return _ref6.apply(this, arguments);
  };
}(); // Returns all the config key/value pairs, including those which are generated
// at runtime.


Setting.all =
/*#__PURE__*/
function () {
  var _ref7 = _asyncToGenerator(function* (userId) {
    let values = yield Setting.allWithoutGhost(userId);
    let version = yield (0, _weboob.getVersion)();
    values.push({
      key: 'weboob-version',
      value: version
    }); // Add a pair to indicate weboob install status.

    let isWeboobInstalled = (0, _helpers.checkWeboobMinimalVersion)(version);
    values.push({
      key: 'weboob-installed',
      value: isWeboobInstalled.toString()
    }); // Indicates at which path Kresus is served.

    values.push({
      key: 'url-prefix',
      value: String(process.kresus.urlPrefix)
    }); // Have emails been enabled by the administrator?

    values.push({
      key: 'emails-enabled',
      value: String((0, _helpers.isEmailEnabled)())
    }); // Is encryption enabled on the server?

    values.push({
      key: 'can-encrypt',
      value: String(process.kresus.salt !== null)
    }); // Is the server set up for demo?

    values.push({
      key: 'force-demo-mode',
      value: String(!!process.kresus.forceDemoMode)
    });
    return values;
  });

  return function (_x20) {
    return _ref7.apply(this, arguments);
  };
}();

let olderDestroy = Setting.destroy;

Setting.destroy =
/*#__PURE__*/
function () {
  var _ref8 = _asyncToGenerator(function* (userId, configId) {
    (0, _helpers.assert)(userId === 0, 'Setting.destroy first arg must be the userId.');
    return yield olderDestroy(configId);
  });

  return function (_x21, _x22) {
    return _ref8.apply(this, arguments);
  };
}();

Setting.testing = {
  oldAll
};
module.exports = Setting;