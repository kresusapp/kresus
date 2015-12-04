import * as americano from 'cozydb';
import { makeLogger, promisify, promisifyModel } from '../helpers';

let log = makeLogger('models/operationtype');

let OperationType = americano.getModel('operationtype', {
    name: String,
    weboobvalue: Number
});

OperationType = promisifyModel(OperationType);

// Maps weboob-ids to {name, internal-cozydb-id}
let MapOperationType = new Map;

// Sync function
function recordOperationType(name, weboobId, id) {
    MapOperationType.set(`${weboobId}`, {
        name,
        id
    });
}

let request = promisify(::OperationType.request);

OperationType.createOrUpdate = async function createOrUpdate(operationtype) {

    let wValue = operationtype.weboobvalue;
    let params = {
        key: wValue
    };

    let found = await request('byWeboobValue', params);
    if (found && found.length) {
        recordOperationType(operationtype.name,
                            found[0].weboobvalue, found[0].id);
        if (found[0].name !== operationtype.name) {
            await found[0].updateAttributes({ name: operationtype.name });
            log.info(`Updated label of Operationtype with
                      weboobvalue ${wValue}`);
            return;
        }
        log.info(`Operationtype with weboobvalue ${wValue} already exists!`);
        return;
    }

    log.info(`Creating operationtype with weboobvalue ${wValue}...`);
    let created = await OperationType.create(operationtype);

    log.info(`Operation type has been created.`);
    recordOperationType(created.name, created.weboobvalue, created.id);
};

// Sync function
OperationType.getOperationTypeID = function(weboobvalue) {
    if (!weboobvalue)
        return null;

    let weboobStr = `${weboobvalue}`;

    if (!MapOperationType.has(weboobStr) === 'undefined') {
        log.error(`Error: ${weboobStr} is undefined,
                   please contact a kresus maintainer`);
        return null;
    }

    return MapOperationType.get(weboobStr).id;
};

// Sync function
OperationType.getUnknownTypeId = function() {
    for (let type of MapOperationType.values()) {
        if (type.name === 'type.unknown')
            return type.id;
    }
    log.error("Error: unknown type id isn't defined.");
    return null;
};

module.exports = OperationType;
