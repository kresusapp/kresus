"use strict";

var cozydb = _interopRequireWildcard(require("cozydb"));

var _helpers = require("../../helpers");

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function _getRequireWildcardCache() { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; if (obj != null) { var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

let Category = cozydb.getModel('bankcategory', {
  // Internal category id.
  parentId: String,
  // Label of the category.
  label: String,
  // Hexadecimal RGB format.
  color: String,
  // ************************************************************************
  // DEPRECATED
  // ************************************************************************
  // Threshold used in the budget section, defined by the user.
  threshold: {
    type: Number,
    default: 0
  },
  // Label of the category; replaced by label.
  title: String
});
Category = (0, _helpers.promisifyModel)(Category);
Category.renamings = {
  title: 'label'
};
let olderFind = Category.find;

Category.find =
/*#__PURE__*/
function () {
  var _ref = _asyncToGenerator(function* (userId, categoryId) {
    (0, _helpers.assert)(userId === 0, 'Category.find first arg must be the userId.');
    return yield olderFind(categoryId);
  });

  return function (_x, _x2) {
    return _ref.apply(this, arguments);
  };
}();

let olderExists = Category.exists;

Category.exists =
/*#__PURE__*/
function () {
  var _ref2 = _asyncToGenerator(function* (userId, categoryId) {
    (0, _helpers.assert)(userId === 0, 'Category.exists first arg must be the userId.');
    return yield olderExists(categoryId);
  });

  return function (_x3, _x4) {
    return _ref2.apply(this, arguments);
  };
}();

let olderAll = Category.all;

Category.all =
/*#__PURE__*/
function () {
  var _ref3 = _asyncToGenerator(function* (userId) {
    (0, _helpers.assert)(userId === 0, 'Category.all first arg must be the userId.');
    return yield olderAll();
  });

  return function (_x5) {
    return _ref3.apply(this, arguments);
  };
}();

let olderCreate = Category.create;

Category.create =
/*#__PURE__*/
function () {
  var _ref4 = _asyncToGenerator(function* (userId, attributes) {
    (0, _helpers.assert)(userId === 0, 'Category.create first arg must be the userId.');
    return yield olderCreate(attributes);
  });

  return function (_x6, _x7) {
    return _ref4.apply(this, arguments);
  };
}();

let olderDestroy = Category.destroy;

Category.destroy =
/*#__PURE__*/
function () {
  var _ref5 = _asyncToGenerator(function* (userId, categoryId) {
    (0, _helpers.assert)(userId === 0, 'Category.destroy first arg must be the userId.');
    return yield olderDestroy(categoryId);
  });

  return function (_x8, _x9) {
    return _ref5.apply(this, arguments);
  };
}();

let olderUpdateAttributes = Category.updateAttributes;

Category.update =
/*#__PURE__*/
function () {
  var _ref6 = _asyncToGenerator(function* (userId, categoryId, fields) {
    (0, _helpers.assert)(userId === 0, 'Category.update first arg must be the userId.');
    return yield olderUpdateAttributes(categoryId, fields);
  });

  return function (_x10, _x11, _x12) {
    return _ref6.apply(this, arguments);
  };
}();

Category.updateAttributes = function () {
  (0, _helpers.assert)(false, 'Category.updateAttributes is deprecated. Please use Category.update');
};

module.exports = Category;