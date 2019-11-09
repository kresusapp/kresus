"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.accountTypeIdToName = accountTypeIdToName;
exports.accountTypeNameToId = accountTypeNameToId;

var _helpers = require("../helpers");

var _accountTypes = _interopRequireDefault(require("../shared/account-types.json"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

let log = (0, _helpers.makeLogger)('lib/account-types'); // Maps external account type id to name.

let AccountTypeToName = new Map();
var _iteratorNormalCompletion = true;
var _didIteratorError = false;
var _iteratorError = undefined;

try {
  for (var _iterator = _accountTypes.default[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
    let _step$value = _step.value,
        externalId = _step$value.weboobvalue,
        name = _step$value.name;
    AccountTypeToName.set(`${externalId}`, name);
  } // Returns the name associated to the account type id, or null if not found.

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

function accountTypeIdToName(externalId) {
  if (!externalId) {
    return null;
  }

  let externalIdStr = `${externalId}`;

  if (!AccountTypeToName.has(externalIdStr)) {
    log.error(`Error: ${externalIdStr} is undefined, please contact a kresus maintainer`);
    return null;
  }

  return AccountTypeToName.get(externalIdStr);
} // Returns the external id associated to the account type name, or -1 if not found.


function accountTypeNameToId(name) {
  let id = _accountTypes.default.find(type => type.name === name);

  return id ? id.weboobvalue : -1;
}