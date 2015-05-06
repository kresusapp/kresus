americano = require 'americano'
hashmap = require 'hashmap'
module.exports = OperationType = americano.getModel 'operationtype',
    name: String
    weboobValue: Number

ListOperationType = new hashmap()

OperationType.all = (callback) ->
    OperationType.request "all", callback


OperationType.checkAndCreate = (operationtype, callback) ->
    params = key: operationtype.weboobValue
    OperationType.request "byWeboobValue", params, (err, found) ->
        if err?
            callback err
            return

        if found?.length and found.length is 1
            ListOperationType.set found[0].weboobValue, found[0].name
            console.log "Operationtype with weboobValue #{operationtype.weboobValue} already exists!"
            return

        console.log "Creating operationtype with weboobvalue #{operationtype.weboobValue}..."
        OperationType.create operationtype, (err) -> 
            if err?
                callback err

            ListOperationType.set operationtype.weboobWalue, operationtype.name
            return

OperationType.getOperationName = (weboobValue) ->
    operationtypename = ListOperationType.get weboobValue
    if operationtypename?
        return operationtypename
    else
        return "unknown"
