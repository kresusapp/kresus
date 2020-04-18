"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const helpers_1 = require("../helpers");
const operation_types_json_1 = __importDefault(require("../shared/operation-types.json"));
let log = helpers_1.makeLogger('lib/transaction-types');
// Maps external transaction type id to name.
let TransactionTypeToName = new Map();
for (let { weboobvalue: externalId, name } of operation_types_json_1.default) {
    TransactionTypeToName.set(`${externalId}`, name);
}
// Returns the name associated to the transaction type id, or null if not found.
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
exports.transactionTypeIdToName = transactionTypeIdToName;
function isKnownTransactionTypeName(typeName) {
    return operation_types_json_1.default.some(type => type.name === typeName);
}
exports.isKnownTransactionTypeName = isKnownTransactionTypeName;
