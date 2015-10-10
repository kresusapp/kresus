let log = require('printit')({
    prefix: 'models/operationtype',
    date: true
});

import * as americano from 'cozydb';
import {promisify, promisifyModel} from '../helpers';

let OperationType = americano.getModel('operationtype', {
    name: String,
    weboobvalue: Number
});

OperationType = promisifyModel(OperationType);

let MapOperationType = {};

// Sync function
function RecordOperationType(name, weboobId, id) {
    MapOperationType[`${weboobId}`] = {
        name,
        id
    };
}

let request = promisify(::OperationType.request);

OperationType.createOrUpdate = async function createOrUpdate(operationtype) {

    let params = {
        key: operationtype.weboobvalue
    };

    let found = await request("byWeboobValue", params);
    if (found && found.length) {
        RecordOperationType(operationtype.name, found[0].weboobvalue, found[0].id);
        if (found[0].name !== operationtype.name) {
            await found[0].updateAttributes({name: operationtype.name});
            log.info(`Updated label of Operationtype with weboobvalue ${operationtype.weboobvalue}`);
            return;
        }
        log.info(`Operationtype with weboobvalue ${operationtype.weboobvalue} already exists!`);
        return;
    }

    log.info(`Creating operationtype with weboobvalue ${operationtype.weboobvalue}...`);
    let created = await OperationType.create(operationtype);

    log.info(`Operation type ${operationtype.weboobvalue} has been created.`);
    RecordOperationType(created.name, created.weboobvalue, created.id);
}

// Sync function
OperationType.getOperationTypeID = function(weboobvalue) {
    if (!weboobvalue)
        return undefined;

    weboobvalue = `${weboobvalue}`;

    if (typeof MapOperationType[weboobvalue] === 'undefined') {
        log.error(`Error: ${weboobvalue} is undefined, please contact a kresus maintainer`);
        return undefined;
    }

    return MapOperationType[weboobvalue].id;
}

// Sync function
OperationType.getAllOperationType = function() {
    return MapOperationType;
}

export default OperationType;
