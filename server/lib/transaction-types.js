import { makeLogger } from '../helpers';
import TransactionTypes from '../shared/operation-types.json';

let log = makeLogger('lib/transaction-types');

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
