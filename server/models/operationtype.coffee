americano = require('../db').module

log = (require 'printit')(
    prefix: 'models/operationtype'
    date: true
)

module.exports = OperationType = americano.getModel 'operationtype',
    name: String
    weboobvalue: Number


MapOperationType = {}


RecordOperationType = (name, weboobId, id) ->
    MapOperationType["#{weboobId}"] =
        name: name
        id: id


OperationType.all = (callback) ->
    OperationType.request "all", callback


OperationType.checkAndCreate = (operationtype, callback) ->
    params = key: operationtype.weboobvalue
    OperationType.request "byWeboobValue", params, (err, found) ->
        if err?
            callback err
            return

        if found? and found.length >= 1

            RecordOperationType operationtype.name, found[0].weboobvalue, found[0].id

            if found[0].name isnt operationtype.name
                found[0].updateAttributes name: operationtype.name, (err) ->
                    if err?
                        callback err
                        return
                    log.info "Updated label of Operationtype with weboobvalue #{operationtype.weboobvalue}"
                    callback null
                    return
            else
                log.info "Operationtype with weboobvalue #{operationtype.weboobvalue} already exists!"
                callback null
                return

        else
            log.info "Creating operationtype with weboobvalue #{operationtype.weboobvalue}..."
            OperationType.create operationtype, (err,created) ->
                if err? or not created?
                    callback err

                log.info "Operation type #{operationtype.weboobvalue} has been created."
                RecordOperationType created.name, created.weboobvalue, created.id
                callback null
                return


OperationType.getOperationTypeID = (weboobvalue) ->
    if not weboobvalue?
        return undefined

    weboobvalue = "#{weboobvalue}"

    if not MapOperationType[weboobvalue]?
        log.error "Error: #{weboobvalue} is undefined, please contact a kresus maintainer"
        return undefined

    return MapOperationType[weboobvalue].id


OperationType.getAllOperationType = () ->
    return MapOperationType

