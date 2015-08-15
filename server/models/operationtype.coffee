americano = require 'americano'

module.exports = OperationType = americano.getModel 'operationtype',
    name: String
    weboobvalue: Number

ListOperationType = {}

OperationType.all = (callback) ->
    OperationType.request "all", callback


OperationType.checkAndCreate = (operationtype, callback) ->
    params = key: operationtype.weboobvalue
    OperationType.request "byWeboobValue", params, (err, found) ->
        if err?
            callback err
            return

        if found? and found.length >= 1
            ListOperationType["#{found[0].weboobvalue}"] =
                name: found[0].name
                id: found[0].id
            console.log "Operationtype with weboobvalue #{operationtype.weboobvalue} already exists!"
            callback null
            return

        else
            console.log "Creating operationtype with weboobvalue #{operationtype.weboobvalue}..."
            OperationType.create operationtype, (err,created) ->
                if err?
                    callback err

                ListOperationType["#{operationtype.weboobvalue}"] =
                    name: created.name
                    id: created.id
                callback null
                return

OperationType.getOperationTypeID = (weboobvalue) ->
    if not weboobvalue?
        return undefined
    weboobvalue = '' + weboobvalue
    if ListOperationType[weboobvalue]?
        return ListOperationType[weboobvalue].id
    else
        console.error "Error: #{weboobvalue} is undefined, pleace contact a kresus maintainer"
        return ListOperationType[0].id

OperationType.getAllOperationType = () ->
    OperationType.all (err, found) ->
        if err?
            console.log "Error when retrieving operation types"
        for operationtype in found
            ListOperationType["#{operationtype.weboobvalue}"] =
                name: operationtype.name
                id: created.id
