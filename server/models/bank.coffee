americano = require('../db').module

BankAccount = require './account'

module.exports = Bank = americano.getModel 'bank',
    name: String
    uuid: String
    websites: (x) -> x


Bank.all = (callback) ->
    Bank.request "allByName", callback


Bank.createOrUpdate = (bank, callback) ->

    params = key: bank.uuid
    Bank.request "byUuid", params, (err, found) ->
        if err?
            callback err
            return

        if found?.length
            if found.length isnt 1
                console.error "More than one bank with uuid #{bank.uuid}!"
                callback 'Duplicate bank'
                return

            found = found[0]
            console.log "Updating attributes of bank with uuid #{bank.uuid}..."
            found.updateAttributes bank, callback
            return

        console.log "Creating bank with uuid #{bank.uuid}..."
        Bank.create bank, callback


Bank.getBanksWithAccounts = (callback) ->
    params = group: true

    BankAccount.rawRequest 'bankWithAccounts', params, (err, banks) ->

        if err?
            callback err, null
            return

        if not banks?
            callback null, []
            return

        uuids = banks.map (bank) -> bank.key
        Bank.getManyByUuid uuids, (err, banks) ->
            callback err, banks


Bank.getManyByUuid = (uuids, callback) ->
    if not (uuids instanceof Array)
        uuids = [uuids]
    params = keys: uuids
    Bank.request "byUuid", params, callback

