"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.transactionTypeIdToName = transactionTypeIdToName;
exports.isKnownTransactionTypeName = isKnownTransactionTypeName;

var _helpers = require("../helpers");

var _operationTypes = _interopRequireDefault(require("../shared/operation-types.json"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

let log = (0, _helpers.makeLogger)('lib/transaction-types'); // Maps external transaction type id to name.

let TransactionTypeToName = new Map();
var _iteratorNormalCompletion = true;
var _didIteratorError = false;
var _iteratorError = undefined;

try {
  for (var _iterator = _operationTypes.default[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
    let _step$value = _step.value,
        externalId = _step$value.weboobvalue,
        name = _step$value.name;
    TransactionTypeToName.set(`${externalId}`, name);
  } // Returns the name associated to the transaction type id, or null if not found.

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

function transactionTypeIdToName(externalId) {
  if (typeof externalId === 'undefined' || externalId === null) {
    return null;
  }

  let externalIdStr = `${externalId}`;

  if (!TransactionTypeToName.has(externalIdStr)) {
    log.error(`Error: ${externalIdStr} is undefined, please contact a kresus maintainer`);
    return null;
  }

  return TransactionTypeToName.get(externalIdStr);
}

function isKnownTransactionTypeName(typeName) {
  return _operationTypes.default.some(type => type.name === typeName);
}