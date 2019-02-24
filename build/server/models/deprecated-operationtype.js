"use strict";

var cozydb = _interopRequireWildcard(require("cozydb"));

var _helpers = require("../helpers");

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

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