import { makeLogger, panic } from '../helpers';
import AccountTypes from '../shared/account-types.json';

const log = makeLogger('lib/account-types');

// Maps external account type id to name.
const AccountTypeToName = new Map();
for (const { weboobvalue: externalId, name } of AccountTypes) {
    AccountTypeToName.set(`${externalId}`, name);
}

// Returns the name associated to the account type id, or null if not found.
export function accountTypeIdToName(externalId: number | null): string | null {
    if (externalId === null) {
        return null;
    }

    const externalIdStr = `${externalId}`;
    if (!AccountTypeToName.has(externalIdStr)) {
        log.error(
            `Error: account type with id ${externalIdStr} has no known name, please contact a kresus maintainer`
        );
        return null;
    }

    return AccountTypeToName.get(externalIdStr);
}

// Returns the external id associated to the account type name, or -1 if not found.
export function accountTypeNameToId(name: string): number {
    const id = AccountTypes.find(type => type.name === name);
    if (!id) {
        panic(`Kresus could not find any type id for the name "${name}"`);
    }
    return id.weboobvalue;
}
