import { makeLogger } from '../helpers';
import TransactionTypes from '../shared/operation-types.json';

const log = makeLogger('lib/transaction-types');

// Maps external transaction type id to name.
const TransactionTypeToName = new Map();
for (const { woob_id: externalId, name } of TransactionTypes) {
    TransactionTypeToName.set(`${externalId}`, name);
}

// Returns the name associated to the transaction type id, or null if not found.
export function transactionTypeIdToName(externalId?: number | null): string | null {
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

export function isKnownTransactionTypeName(typeName: string): boolean {
    return TransactionTypes.some(type => type.name === typeName);
}
