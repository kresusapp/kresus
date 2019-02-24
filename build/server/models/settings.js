"use strict";

var cozydb = _interopRequireWildcard(require("cozydb"));

var _helpers = require("../helpers");

var _defaultSettings = _interopRequireDefault(require("../shared/default-settings"));

var _weboob = require("../lib/sources/weboob");

var _staticData = require("./static-data");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

let log = (0, _helpers.makeLogger)('models/settings'); // A simple key/value configuration pair.

let Setting = cozydb.getModel('kresusconfig', {
  name: String,
  value: String
});
Setting = (0, _helpers.promisifyModel)(Setting);
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
    let config = yield Setting.findOrCreateByName(userId, key, value);

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
}(); // Returns a pair {name, value} or null if not found.


Setting.byName =
/*#__PURE__*/
function () {
  var _byName = _asyncToGenerator(function* (userId, name) {
    (0, _helpers.assert)(userId === 0, 'Setting.byName first arg must be the userId.');

    if (typeof name !== 'string') {
      log.warn('Setting.byName misuse: name must be a string');
    }

    let founds = yield request('byName', {
      key: name
    });

    if (founds && founds.length) {
      return founds[0];
    }

    return null;
  });

  function byName(_x9, _x10) {
    return _byName.apply(this, arguments);
  }

  return byName;
}(); // Returns a pair {name, value} or the default value if not found.


function findOrCreateByName(_x11, _x12, _x13) {
  return _findOrCreateByName.apply(this, arguments);
}

function _findOrCreateByName() {
  _findOrCreateByName = _asyncToGenerator(function* (userId, name, defaultValue) {
    (0, _helpers.assert)(userId === 0, 'Setting.findOrCreateByName first arg must be the userId.');
    let found = yield Setting.byName(userId, name);

    if (found === null) {
      let pair = {
        name,
        value: defaultValue
      };
      pair = yield Setting.create(userId, pair);
      return pair;
    }

    return found;
  });
  return _findOrCreateByName.apply(this, arguments);
}

Setting.findOrCreateByName = findOrCreateByName; // Returns a pair {name, value} or the preset default value if not found.

function findOrCreateDefault(_x14, _x15) {
  return _findOrCreateDefault.apply(this, arguments);
}

function _findOrCreateDefault() {
  _findOrCreateDefault = _asyncToGenerator(function* (userId, name) {
    (0, _helpers.assert)(userId === 0, 'Setting.findOrCreateDefault first arg must be the userId.');

    if (!_defaultSettings.default.has(name)) {
      throw new _helpers.KError(`Setting ${name} has no default value!`);
    }

    let defaultValue = _defaultSettings.default.get(name);

    return yield findOrCreateByName(userId, name, defaultValue);
  });
  return _findOrCreateDefault.apply(this, arguments);
}

Setting.findOrCreateDefault = findOrCreateDefault; // Returns a boolean value for a given key, or the preset default.

function findOrCreateDefaultBooleanValue(_x16, _x17) {
  return _findOrCreateDefaultBooleanValue.apply(this, arguments);
}

function _findOrCreateDefaultBooleanValue() {
  _findOrCreateDefaultBooleanValue = _asyncToGenerator(function* (userId, name) {
    let pair = yield findOrCreateDefault(userId, name);
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

let oldAll = Setting.all.bind(Setting); // Returns all the config name/value pairs, except for the ghost ones that are
// implied at runtime.

Setting.allWithoutGhost =
/*#__PURE__*/
function () {
  var _ref6 = _asyncToGenerator(function* (userId) {
    const values = yield oldAll();
    let nameSet = new Set(values.map(v => v.name));
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = _staticData.ConfigGhostSettings.keys()[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        let ghostName = _step.value;
        (0, _helpers.assert)(!nameSet.has(ghostName), `${ghostName} shouldn't be saved into the database.`);
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

    if (!nameSet.has('locale')) {
      const localeSetting = yield Setting.findOrCreateDefault(userId, 'locale');
      values.push(localeSetting);
    }

    return values;
  });

  return function (_x19) {
    return _ref6.apply(this, arguments);
  };
}(); // Returns all the config name/value pairs, including those which are generated
// at runtime.


Setting.all =
/*#__PURE__*/
function () {
  var _ref7 = _asyncToGenerator(function* (userId) {
    let values = yield Setting.allWithoutGhost(userId);
    let version = yield (0, _weboob.getVersion)();
    values.push({
      name: 'weboob-version',
      value: version
    }); // Add a pair to indicate weboob install status.

    let isWeboobInstalled = (0, _helpers.checkWeboobMinimalVersion)(version);
    values.push({
      name: 'weboob-installed',
      value: isWeboobInstalled.toString()
    }); // Indicates at which path Kresus is served.

    values.push({
      name: 'url-prefix',
      value: String(process.kresus.urlPrefix)
    }); // Have emails been enabled by the administrator?

    values.push({
      name: 'emails-enabled',
      value: String((0, _helpers.isEmailEnabled)())
    }); // Is encryption enabled on the server?

    values.push({
      name: 'can-encrypt',
      value: String(process.kresus.salt !== null)
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