americano = require('../db').module

log = (require 'printit')(
    prefix: 'models/operationtype'
    date: true
)

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
            if found[0].name isnt operationtype.name 
                OperationType.updateAttributes found[0].id, name: operationtype.name, (err) ->
                    if err?
                        callback err
                        return
                    log.info "Updating label of Operationtype with weboobvalue #{operationtype.weboobvalue}"
                    ListOperationType["#{found[0].weboobvalue}"] =
                        name: operationtype.name
                        id: found[0].id
            else
                ListOperationType["#{found[0].weboobvalue}"] =
                    name: found[0].name
                    id: found[0].id
                log.info "Operationtype with weboobvalue #{operationtype.weboobvalue} already exists!"
                callback null
                return

        else
            log.info "Creating operationtype with weboobvalue #{operationtype.weboobvalue}..."
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
        log.error "Error: #{weboobvalue} is undefined, please contact a kresus maintainer"
        return ListOperationType["0"].id


OperationType.getAllOperationType = () ->
    return ListOperationType

