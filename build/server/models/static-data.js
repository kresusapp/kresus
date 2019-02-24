"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.accountTypeIdToName = accountTypeIdToName;
exports.accountTypeNameToId = accountTypeNameToId;
exports.transactionTypeIdToName = transactionTypeIdToName;
exports.isKnownTransactionTypeName = isKnownTransactionTypeName;
exports.bankVendorByUuid = bankVendorByUuid;
exports.ConfigGhostSettings = void 0;

var _helpers = require("../helpers");

var _accountTypes = _interopRequireDefault(require("../shared/account-types.json"));

var _banks = _interopRequireDefault(require("../shared/banks.json"));

var _operationTypes = _interopRequireDefault(require("../shared/operation-types.json"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

let log = (0, _helpers.makeLogger)('models/static-data'); // A list of all the settings that are implied at runtime and should not be
// saved into the database.
// *Never* ever remove a name from this list, since these are used also to
// know which settings shouldn't be imported or exported.

const ConfigGhostSettings = new Set(['weboob-version', 'weboob-installed', 'standalone-mode', 'url-prefix', 'emails-enabled', 'can-encrypt']); // ACCOUNT TYPES,
// Maps external account type id to name.

exports.ConfigGhostSettings = ConfigGhostSettings;
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
} // TRANSACTION TYPES.
// Maps external transaction type id to name.


let TransactionTypeToName = new Map();
var _iteratorNormalCompletion2 = true;
var _didIteratorError2 = false;
var _iteratorError2 = undefined;

try {
  for (var _iterator2 = _operationTypes.default[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
    let _step2$value = _step2.value,
        externalId = _step2$value.weboobvalue,
        name = _step2$value.name;
    TransactionTypeToName.set(`${externalId}`, name);
  } // Returns the name associated to the transaction type id, or null if not found.

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
} // BANKS.


function bankVendorByUuid(uuid) {
  if (typeof uuid !== 'string') {
    log.warn('Bank.byUuid misuse: uuid must be a String');
  }

  return _banks.default.find(vendor => vendor.uuid === uuid);
}