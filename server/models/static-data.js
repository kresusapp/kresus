import { makeLogger } from '../helpers';

import AccountTypes from '../shared/account-types.json';
import BankVendors from '../shared/banks.json';
import TransactionTypes from '../shared/operation-types.json';

let log = makeLogger('models/static-data');

// A list of all the settings that are implied at runtime and should not be
// saved into the database.
// *Never* ever remove a name from this list, since these are used also to
// know which settings shouldn't be imported or exported.
export const ConfigGhostSettings = new Set([
    'weboob-version',
    'weboob-installed',
    'standalone-mode',
    'url-prefix',
    'emails-enabled',
    'can-encrypt'
]);

// ACCOUNT TYPES,

// Maps external account type id to name.
let AccountTypeToName = new Map();
for (let { weboobvalue: externalId, name } of AccountTypes) {
    AccountTypeToName.set(`${externalId}`, name);
}

// Returns the name associated to the account type id, or null if not found.
export function accountTypeIdToName(externalId) {
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

// Returns the external id associated to the account type name, or -1 if not found.
export function accountTypeNameToId(name) {
    let id = AccountTypes.find(type => type.name === name);
    return id ? id.weboobvalue : -1;
}

// TRANSACTION TYPES.

// Maps external transaction type id to name.
let TransactionTypeToName = new Map();
for (let { weboobvalue: externalId, name } of TransactionTypes) {
    TransactionTypeToName.set(`${externalId}`, name);
}

// Returns the name associated to the transaction type id, or null if not found.
export function transactionTypeIdToName(externalId) {
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

export function isKnownTransactionTypeName(typeName) {
    return TransactionTypes.some(type => type.name === typeName);
}

// BANKS.

export function bankVendorByUuid(uuid) {
    if (typeof uuid !== 'string') {
        log.warn('Bank.byUuid misuse: uuid must be a String');
    }
    return BankVendors.find(vendor => vendor.uuid === uuid);
}
