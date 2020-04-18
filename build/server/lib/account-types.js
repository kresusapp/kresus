"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const helpers_1 = require("../helpers");
const account_types_json_1 = __importDefault(require("../shared/account-types.json"));
let log = helpers_1.makeLogger('lib/account-types');
// Maps external account type id to name.
let AccountTypeToName = new Map();
for (let { weboobvalue: externalId, name } of account_types_json_1.default) {
    AccountTypeToName.set(`${externalId}`, name);
}
// Returns the name associated to the account type id, or null if not found.
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
}
exports.accountTypeIdToName = accountTypeIdToName;
// Returns the external id associated to the account type name, or -1 if not found.
function accountTypeNameToId(name) {
    let id = account_types_json_1.default.find(type => type.name === name);
    return id ? id.weboobvalue : -1;
}
exports.accountTypeNameToId = accountTypeNameToId;
