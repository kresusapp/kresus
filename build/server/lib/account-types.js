"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.accountTypeIdToName = accountTypeIdToName;
exports.accountTypeNameToId = accountTypeNameToId;
const helpers_1 = require("../helpers");
const account_types_json_1 = __importDefault(require("../shared/account-types.json"));
const log = (0, helpers_1.makeLogger)('lib/account-types');
// Maps external account type id to name.
const AccountTypeToName = new Map();
for (const { woob_id: externalId, name } of account_types_json_1.default) {
    AccountTypeToName.set(`${externalId}`, name);
}
// Returns the name associated to the account type id, or null if not found.
function accountTypeIdToName(externalId) {
    if (externalId === null) {
        return null;
    }
    const externalIdStr = `${externalId}`;
    if (!AccountTypeToName.has(externalIdStr)) {
        log.error(`Error: account type with id ${externalIdStr} has no known name, please contact a kresus maintainer`);
        return null;
    }
    return AccountTypeToName.get(externalIdStr);
}
// Returns the external id associated to the account type name, or -1 if not found.
function accountTypeNameToId(name) {
    const id = account_types_json_1.default.find(type => type.name === name);
    if (!id) {
        (0, helpers_1.panic)(`Kresus could not find any type id for the name "${name}"`);
    }
    return id.woob_id;
}
