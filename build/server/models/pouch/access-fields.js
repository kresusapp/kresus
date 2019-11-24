"use strict";

var cozydb = _interopRequireWildcard(require("cozydb"));

var _helpers = require("../../helpers");

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function _getRequireWildcardCache() { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; if (obj != null) { var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

let Model = cozydb.getModel('access-field', {
  // The name of the field.
  name: String,
  // The value of the field.
  value: String,
  // The access internal string unique identifier of the access the field is attached to.
  accessId: String
});
const AccessFields = (0, _helpers.promisifyModel)(Model);
let request = (0, _helpers.promisify)(AccessFields.request.bind(AccessFields));
let olderCreate = AccessFields.create;

AccessFields.create =
/*#__PURE__*/
function () {
  var _ref = _asyncToGenerator(function* (userId, attributes) {
    (0, _helpers.assert)(userId === 0, 'AccessFields.create first arg must be the userId.');
    let accessId = attributes.accessId;
    (0, _helpers.assert)(typeof accessId === 'string' && accessId.length, 'AccessFields.create second arg should have "accessId" String property');
    return yield olderCreate(attributes);
  });

  return function (_x, _x2) {
    return _ref.apply(this, arguments);
  };
}();

let olderFind = AccessFields.find;

AccessFields.find =
/*#__PURE__*/
function () {
  var _ref2 = _asyncToGenerator(function* (userId, fieldId) {
    (0, _helpers.assert)(userId === 0, 'AccessFields.find first arg must be the userId.');
    return yield olderFind(fieldId);
  });

  return function (_x3, _x4) {
    return _ref2.apply(this, arguments);
  };
}();

let olderAll = AccessFields.all;

AccessFields.all =
/*#__PURE__*/
function () {
  var _ref3 = _asyncToGenerator(function* (userId) {
    (0, _helpers.assert)(userId === 0, 'AccessFields.all first arg must be the userId.');
    return yield olderAll();
  });

  return function (_x5) {
    return _ref3.apply(this, arguments);
  };
}();

let olderExists = AccessFields.exists;

AccessFields.exists =
/*#__PURE__*/
function () {
  var _ref4 = _asyncToGenerator(function* (userId, fieldId) {
    (0, _helpers.assert)(userId === 0, 'AccessFields.exists first arg must be the userId.');
    return yield olderExists(fieldId);
  });

  return function (_x6, _x7) {
    return _ref4.apply(this, arguments);
  };
}();

let olderDestroy = AccessFields.destroy;

AccessFields.destroy =
/*#__PURE__*/
function () {
  var _ref5 = _asyncToGenerator(function* (userId, fieldId) {
    (0, _helpers.assert)(userId === 0, 'AccessFields.destroy first arg must be the userId.');
    return yield olderDestroy(fieldId);
  });

  return function (_x8, _x9) {
    return _ref5.apply(this, arguments);
  };
}();

let olderUpdateAttributes = AccessFields.updateAttributes;

AccessFields.update =
/*#__PURE__*/
function () {
  var _ref6 = _asyncToGenerator(function* (userId, fieldId, fields) {
    (0, _helpers.assert)(userId === 0, 'AccessFields.update first arg must be the userId.');
    return yield olderUpdateAttributes(fieldId, fields);
  });

  return function (_x10, _x11, _x12) {
    return _ref6.apply(this, arguments);
  };
}();

AccessFields.batchCreate =
/*#__PURE__*/
function () {
  var _batchCreate = _asyncToGenerator(function* (userId, accessId, fields) {
    (0, _helpers.assert)(userId === 0, 'AccessFields.batchCreate first arg must be the userId.');
    (0, _helpers.assert)(typeof accessId === 'string' && accessId.length, 'AccessFields.batchCreate second arg should be a string "accessId"');
    (0, _helpers.assert)(fields instanceof Array, 'AccessFields.batchCreate third arg should be an array.');
    let fieldsFromDb = [];
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = fields[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        let field = _step.value;
        fieldsFromDb.push((yield AccessFields.create(userId, _objectSpread({}, field, {
          accessId
        }))));
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

    return fieldsFromDb;
  });

  function batchCreate(_x13, _x14, _x15) {
    return _batchCreate.apply(this, arguments);
  }

  return batchCreate;
}();

AccessFields.allByAccessId =
/*#__PURE__*/
function () {
  var _allByAccessId = _asyncToGenerator(function* (userId, accessId) {
    (0, _helpers.assert)(userId === 0, 'AccessFields.allByAccessId first arg must be the userId.');
    (0, _helpers.assert)(typeof accessId === 'string' && accessId.length, 'AccessFields.allByAccessId second arg should be a string "accessId".');
    return yield request('allByAccessId', {
      key: accessId
    });
  });

  function allByAccessId(_x16, _x17) {
    return _allByAccessId.apply(this, arguments);
  }

  return allByAccessId;
}();

AccessFields.destroyByAccessId =
/*#__PURE__*/
function () {
  var _destroyByAccessId = _asyncToGenerator(function* (userId, accessId) {
    (0, _helpers.assert)(userId === 0, 'AccessFields.destroyByAccessId first arg must be the userId.');
    (0, _helpers.assert)(typeof accessId === 'string' && accessId.length, 'AccessFields.destroyByAccessId second arg should be a string "accessId".');
    let fields = yield AccessFields.allByAccessId(userId, accessId);
    var _iteratorNormalCompletion2 = true;
    var _didIteratorError2 = false;
    var _iteratorError2 = undefined;

    try {
      for (var _iterator2 = fields[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
        let field = _step2.value;
        yield AccessFields.destroy(userId, field.id);
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
  });

  function destroyByAccessId(_x18, _x19) {
    return _destroyByAccessId.apply(this, arguments);
  }

  return destroyByAccessId;
}();

AccessFields.updateOrCreateByAccessIdAndName =
/*#__PURE__*/
function () {
  var _ref7 = _asyncToGenerator(function* (userId, accessId, name, value) {
    (0, _helpers.assert)(userId === 0, 'AccessFields.updateOrCreateByAccessIdAndName first arg must be the userId.');
    let field = yield request('allByAccessIdAndName', {
      key: [accessId, name]
    });

    if (field instanceof Array && field.length) {
      (0, _helpers.assert)(field.length === 1, 'more than one value set for a given custom field');
      field = field[0];

      if (value === null) {
        return yield AccessFields.destroy(userId, field.id);
      }

      return yield AccessFields.update(userId, field.id, {
        value
      });
    }

    if (value !== null) {
      return yield AccessFields.create(userId, {
        name,
        value,
        accessId
      });
    }
  });

  return function (_x20, _x21, _x22, _x23) {
    return _ref7.apply(this, arguments);
  };
}();

AccessFields.batchUpdateOrCreate =
/*#__PURE__*/
function () {
  var _batchUpdateOrCreate = _asyncToGenerator(function* (userId, accessId, fields = []) {
    (0, _helpers.assert)(userId === 0, 'AccessFields.batchUpdateOrCreate first arg must be the userId.');
    (0, _helpers.assert)(fields instanceof Array, 'AccessFields.batchUpdateOrCreate third arg must be an array.');
    var _iteratorNormalCompletion3 = true;
    var _didIteratorError3 = false;
    var _iteratorError3 = undefined;

    try {
      for (var _iterator3 = fields[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
        let field = _step3.value;
        yield AccessFields.updateOrCreateByAccessIdAndName(userId, accessId, field.name, field.value);
      }
    } catch (err) {
      _didIteratorError3 = true;
      _iteratorError3 = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion3 && _iterator3.return != null) {
          _iterator3.return();
        }
      } finally {
        if (_didIteratorError3) {
          throw _iteratorError3;
        }
      }
    }
  });

  function batchUpdateOrCreate(_x24, _x25) {
    return _batchUpdateOrCreate.apply(this, arguments);
  }

  return batchUpdateOrCreate;
}();

AccessFields.updateAttributes = function updateAttributes() {
  (0, _helpers.assert)(false, 'AccessFields.updateAttributes is deprecated. Please use AccessFields.update');
};

module.exports = AccessFields;