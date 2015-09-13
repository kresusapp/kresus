let americano = require('../db').module;

let log = require('printit')({
    prefix: 'models/operationtype',
    date: true
});

let OperationType = americano.getModel('operationtype', {
    name: String,
    weboobvalue: Number
});

let MapOperationType = {};

function RecordOperationType(name, weboobId, id) {
    MapOperationType[`${weboobId}`] = {
        name,
        id
    };
}


OperationType.all = function(callback) {
    OperationType.request("all", callback);
}


OperationType.checkAndCreate = function(operationtype, callback) {

    let params = {
        key: operationtype.weboobvalue
    };

    OperationType.request("byWeboobValue", params, (err, found) => {
        if (err)
            return callback(err);

        if (found && found.length) {

            RecordOperationType(operationtype.name, found[0].weboobvalue, found[0].id);

            if (found[0].name !== operationtype.name) {
                found[0].updateAttributes({name: operationtype.name}, (err) => {
                    if (err)
                        return callback(err);
                    log.info(`Updated label of Operationtype with weboobvalue ${operationtype.weboobvalue}`);
                    callback(null);
                    return;
                });
            } else {
                log.info(`Operationtype with weboobvalue ${operationtype.weboobvalue} already exists!`);
                callback(null);
                return;
            }

        } else {
            log.info(`Creating operationtype with weboobvalue ${operationtype.weboobvalue}...`);
            OperationType.create(operationtype, (err,created) => {
                if (err || !created)
                    return callback(err);

                log.info(`Operation type ${operationtype.weboobvalue} has been created.`);
                RecordOperationType(created.name, created.weboobvalue, created.id);
                callback(null);
                return;
            });
        }
    });
}


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


OperationType.getAllOperationType = function() {
    return MapOperationType;
}

export default OperationType;
