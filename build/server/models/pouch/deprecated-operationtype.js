"use strict";

var cozydb = _interopRequireWildcard(require("cozydb"));

var _helpers = require("../../helpers");

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function _getRequireWildcardCache() { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; if (obj != null) { var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

// ************************************************************************
// MODEL KEPT ONLY FOR BACKWARD COMPATIBILITY, DO NOT MODIFY.
// ************************************************************************
let OperationType = cozydb.getModel('operationtype', {
  // Display name
  name: String,
  // Weboob unique id
  weboobvalue: Number
});
OperationType = (0, _helpers.promisifyModel)(OperationType);
module.exports = OperationType;