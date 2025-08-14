"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.transactionTypeIdToName = transactionTypeIdToName;
exports.isKnownTransactionTypeName = isKnownTransactionTypeName;
const helpers_1 = require("../helpers");
const transaction_types_json_1 = __importDefault(require("../shared/transaction-types.json"));
const log = (0, helpers_1.makeLogger)('lib/transaction-types');
// Maps external transaction type id to name.
const TransactionTypeToName = new Map();
for (const { woob_id: externalId, name } of transaction_types_json_1.default) {
    TransactionTypeToName.set(`${externalId}`, name);
}
// Returns the name associated to the transaction type id, or null if not found.
function transactionTypeIdToName(externalId) {
    if (typeof externalId === 'undefined' || externalId === null) {
        return null;
    }
    const externalIdStr = `${externalId}`;
    if (!TransactionTypeToName.has(externalIdStr)) {
        log.error(`Error: ${externalIdStr} is undefined, please contact a kresus maintainer`);
        return null;
    }
    return TransactionTypeToName.get(externalIdStr);
}
function isKnownTransactionTypeName(typeName) {
    return transaction_types_json_1.default.some(type => type.name === typeName);
}
