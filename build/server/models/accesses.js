"use strict";

var cozydb = _interopRequireWildcard(require("cozydb"));

var _helpers = require("../helpers");

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

let log = (0, _helpers.makeLogger)('models/accesses');
let Access = cozydb.getModel('bankaccess', {
  // External (backend) unique identifier.
  bank: String,
  // Credentials to connect to the bank's website.
  login: String,
  password: {
    type: String,
    default: null
  },
  // Any supplementary fields necessary to connect to the bank's website.
  customFields: {
    type: String,
    default: '[]'
  },
  // Text status indicating whether the last poll was successful or not.
  fetchStatus: {
    type: String,
    default: 'OK'
  },
  // Boolean indicating if the access is enabled or not.
  enabled: {
    type: Boolean,
    default: true
  },
  // Text label set by the user.
  customLabel: {
    type: String,
    default: null
  },
  // ************************************************************************
  // DEPRECATED.
  // ************************************************************************
  website: String
});
Access = (0, _helpers.promisifyModel)(Access);
let request = (0, _helpers.promisify)(Access.request.bind(Access));
let olderCreate = Access.create;

Access.create =
/*#__PURE__*/
function () {
  var _ref = _asyncToGenerator(function* (userId, attributes) {
    (0, _helpers.assert)(userId === 0, 'Access.create first arg must be the userId.');
    return yield olderCreate(attributes);
  });

  return function (_x, _x2) {
    return _ref.apply(this, arguments);
  };
}();

let olderFind = Access.find;

Access.find =
/*#__PURE__*/
function () {
  var _ref2 = _asyncToGenerator(function* (userId, accessId) {
    (0, _helpers.assert)(userId === 0, 'Access.find first arg must be the userId.');
    return yield olderFind(accessId);
  });

  return function (_x3, _x4) {
    return _ref2.apply(this, arguments);
  };
}();

let olderAll = Access.all;

Access.all =
/*#__PURE__*/
function () {
  var _ref3 = _asyncToGenerator(function* (userId) {
    (0, _helpers.assert)(userId === 0, 'Access.all first arg must be the userId.');
    return yield olderAll();
  });

  return function (_x5) {
    return _ref3.apply(this, arguments);
  };
}();

let olderExists = Access.exists;

Access.exists =
/*#__PURE__*/
function () {
  var _ref4 = _asyncToGenerator(function* (userId, accessId) {
    (0, _helpers.assert)(userId === 0, 'Access.exists first arg must be the userId.');
    return yield olderExists(accessId);
  });

  return function (_x6, _x7) {
    return _ref4.apply(this, arguments);
  };
}();

let olderDestroy = Access.destroy;

Access.destroy =
/*#__PURE__*/
function () {
  var _ref5 = _asyncToGenerator(function* (userId, accessId) {
    (0, _helpers.assert)(userId === 0, 'Access.destroy first arg must be the userId.');
    return yield olderDestroy(accessId);
  });

  return function (_x8, _x9) {
    return _ref5.apply(this, arguments);
  };
}();

let olderUpdateAttributes = Access.updateAttributes;

Access.update =
/*#__PURE__*/
function () {
  var _ref6 = _asyncToGenerator(function* (userId, accessId, fields) {
    (0, _helpers.assert)(userId === 0, 'Access.update first arg must be the userId.');
    return yield olderUpdateAttributes(accessId, fields);
  });

  return function (_x10, _x11, _x12) {
    return _ref6.apply(this, arguments);
  };
}();

Access.updateAttributes = function () {
  (0, _helpers.assert)(false, 'Access.updateAttributes is deprecated. Please use Access.update');
};

Access.byBank =
/*#__PURE__*/
function () {
  var _byBank = _asyncToGenerator(function* (userId, bank) {
    (0, _helpers.assert)(userId === 0, 'Access.byBank first arg must be the userId.');

    if (typeof bank !== 'object' || typeof bank.uuid !== 'string') {
      log.warn('Access.byBank misuse: bank must be a Bank instance.');
    }

    let params = {
      key: bank.uuid
    };
    return yield request('allByBank', params);
  });

  function byBank(_x13, _x14) {
    return _byBank.apply(this, arguments);
  }

  return byBank;
}(); // Sync function


Access.prototype.hasPassword = function () {
  return typeof this.password === 'string' && this.password.length > 0;
}; // Can the access be polled


Access.prototype.canBePolled = function () {
  return this.enabled && this.fetchStatus !== 'INVALID_PASSWORD' && this.fetchStatus !== 'EXPIRED_PASSWORD' && this.fetchStatus !== 'INVALID_PARAMETERS' && this.fetchStatus !== 'NO_PASSWORD' && this.fetchStatus !== 'ACTION_NEEDED' && this.fetchStatus !== 'AUTH_METHOD_NYI';
};

module.exports = Access;