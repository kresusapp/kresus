import { makeLogger } from '../helpers';
import AccountTypes from '../shared/account-types.json';

let log = makeLogger('models/accounttype');

// Maps external type id to name.
let typeToName = new Map();

for (let { weboobvalue: externalId, name } of AccountTypes) {
    typeToName.set(`${externalId}`, name);
}

// Sync function: returns the name associated to the id, or null if not found.
export function idToName(externalId) {
    if (!externalId) {
        return null;
    }

    let externalIdStr = `${externalId}`;

    if (!typeToName.has(externalIdStr)) {
        log.error(`Error: ${externalIdStr} is undefined, please contact a kresus maintainer`);
        return null;
    }

    return typeToName.get(externalIdStr);
}
