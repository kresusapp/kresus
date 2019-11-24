"use strict";

var cozydb = _interopRequireWildcard(require("cozydb"));

var _accessFields = _interopRequireDefault(require("./access-fields"));

var _helpers = require("../../helpers");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function _getRequireWildcardCache() { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; if (obj != null) { var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _objectWithoutProperties(source, excluded) { if (source == null) return {}; var target = _objectWithoutPropertiesLoose(source, excluded); var key, i; if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }

function _objectWithoutPropertiesLoose(source, excluded) { if (source == null) return {}; var target = {}; var sourceKeys = Object.keys(source); var key, i; for (i = 0; i < sourceKeys.length; i++) { key = sourceKeys[i]; if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } return target; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

let log = (0, _helpers.makeLogger)('models/accesses');
let Access = cozydb.getModel('bankaccess', {
  // External (backend) unique identifier.
  vendorId: String,
  // Credentials to connect to the bank's website.
  login: String,
  password: {
    type: String,
    default: null
  },
  // Text status indicating whether the last poll was successful or not.
  fetchStatus: {
    type: String,
    default: _helpers.FETCH_STATUS_SUCCESS
  },
  // Text label set by the user.
  customLabel: {
    type: String,
    default: null
  },
  // ************************************************************************
  // DEPRECATED.
  // ************************************************************************
  website: String,
  enabled: Boolean,
  // External (backend) unique identifier. Renamed to vendorId.
  bank: String,
  // Any supplementary fields necessary to connect to the bank's website.
  // Moved to their own data structure.
  customFields: {
    type: String,
    default: null
  }
});
Access = (0, _helpers.promisifyModel)(Access);
Access.renamings = {
  bank: 'vendorId'
};
let request = (0, _helpers.promisify)(Access.request.bind(Access));

function attachFields(_x, _x2) {
  return _attachFields.apply(this, arguments);
}

function _attachFields() {
  _attachFields = _asyncToGenerator(function* (userId, access) {
    access.fields = yield _accessFields.default.allByAccessId(userId, access.id);
    return access;
  });
  return _attachFields.apply(this, arguments);
}

let olderCreate = Access.create;

Access.create =
/*#__PURE__*/
function () {
  var _ref = _asyncToGenerator(function* (userId, _ref2) {
    let _ref2$fields = _ref2.fields,
        fields = _ref2$fields === void 0 ? null : _ref2$fields,
        other = _objectWithoutProperties(_ref2, ["fields"]);

    (0, _helpers.assert)(userId === 0, 'Access.create first arg must be the userId.');
    let access = yield olderCreate(other);

    if (fields !== null) {
      yield _accessFields.default.batchCreate(userId, access.id, fields);
    }

    return yield attachFields(userId, access);
  });

  return function (_x3, _x4) {
    return _ref.apply(this, arguments);
  };
}();

let olderFind = Access.find;

Access.find =
/*#__PURE__*/
function () {
  var _ref3 = _asyncToGenerator(function* (userId, accessId) {
    (0, _helpers.assert)(userId === 0, 'Access.find first arg must be the userId.');
    let access = yield olderFind(accessId);
    return yield attachFields(userId, access);
  });

  return function (_x5, _x6) {
    return _ref3.apply(this, arguments);
  };
}();

let olderAll = Access.all;

Access.all =
/*#__PURE__*/
function () {
  var _ref4 = _asyncToGenerator(function* (userId) {
    (0, _helpers.assert)(userId === 0, 'Access.all first arg must be the userId.');
    let accesses = yield olderAll();
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = accesses[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        let access = _step.value;
        yield attachFields(userId, access);
      }
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

    return accesses;
  });

  return function (_x7) {
    return _ref4.apply(this, arguments);
  };
}();

let olderExists = Access.exists;

Access.exists =
/*#__PURE__*/
function () {
  var _ref5 = _asyncToGenerator(function* (userId, accessId) {
    (0, _helpers.assert)(userId === 0, 'Access.exists first arg must be the userId.');
    return yield olderExists(accessId);
  });

  return function (_x8, _x9) {
    return _ref5.apply(this, arguments);
  };
}();

let olderDestroy = Access.destroy;

Access.destroy =
/*#__PURE__*/
function () {
  var _ref6 = _asyncToGenerator(function* (userId, accessId) {
    (0, _helpers.assert)(userId === 0, 'Access.destroy first arg must be the userId.');
    yield _accessFields.default.destroyByAccessId(userId, accessId);
    return yield olderDestroy(accessId);
  });

  return function (_x10, _x11) {
    return _ref6.apply(this, arguments);
  };
}();

let olderUpdateAttributes = Access.updateAttributes;

Access.update =
/*#__PURE__*/
function () {
  var _ref7 = _asyncToGenerator(function* (userId, accessId, _ref8) {
    let _ref8$fields = _ref8.fields,
        fields = _ref8$fields === void 0 ? [] : _ref8$fields,
        other = _objectWithoutProperties(_ref8, ["fields"]);

    (0, _helpers.assert)(userId === 0, 'Access.update first arg must be the userId.');
    yield _accessFields.default.batchUpdateOrCreate(userId, accessId, fields);
    let updatedAccess = yield olderUpdateAttributes(accessId, other);
    return yield attachFields(userId, updatedAccess);
  });

  return function (_x12, _x13, _x14) {
    return _ref7.apply(this, arguments);
  };
}();

Access.updateAttributes = function () {
  (0, _helpers.assert)(false, 'Access.updateAttributes is deprecated. Please use Access.update');
};

Access.byVendorId =
/*#__PURE__*/
function () {
  var _byVendorId = _asyncToGenerator(function* (userId, bank) {
    (0, _helpers.assert)(userId === 0, 'Access.byVendorId first arg must be the userId.');

    if (typeof bank !== 'object' || typeof bank.uuid !== 'string') {
      log.warn('Access.byVendorId misuse: bank must be a Bank instance.');
    }

    let params = {
      key: bank.uuid
    };
    let accesses = yield request('allByVendorId', params);
    var _iteratorNormalCompletion2 = true;
    var _didIteratorError2 = false;
    var _iteratorError2 = undefined;

    try {
      for (var _iterator2 = accesses[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
        let access = _step2.value;
        yield attachFields(userId, access);
      }
    } catch (err) {
      _didIteratorError2 = true;
      _iteratorError2 = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion2 && _iterator2.return != null) {
          _iterator2.return();
        }
      } finally {
        if (_didIteratorError2) {
          throw _iteratorError2;
        }
      }
    }

    return accesses;
  });

  function byVendorId(_x15, _x16) {
    return _byVendorId.apply(this, arguments);
  }

  return byVendorId;
}(); // Sync function


Access.prototype.hasPassword = function () {
  return typeof this.password === 'string' && this.password.length > 0;
}; // Is the access enabled


Access.prototype.isEnabled = function () {
  return this.password !== null;
}; // Can the access be polled


Access.prototype.canBePolled = function () {
  return this.isEnabled() && this.fetchStatus !== 'INVALID_PASSWORD' && this.fetchStatus !== 'EXPIRED_PASSWORD' && this.fetchStatus !== 'INVALID_PARAMETERS' && this.fetchStatus !== 'NO_PASSWORD' && this.fetchStatus !== 'ACTION_NEEDED' && this.fetchStatus !== 'AUTH_METHOD_NYI';
};

module.exports = Access;