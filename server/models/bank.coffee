americano = require 'americano'
async = require 'async'
BankAccess = require './bankaccess'

module.exports = Bank = americano.getModel 'bank',
    name: String
    uuid: String

Bank.all = (callback) ->
    Bank.request "all", callback

Bank.getManyByUuid = (uuids, callback) ->

    uuids = [uuids] if not (uuids instanceof Array)
    params =
        keys: uuids
    console.log params
    Bank.request "byUuid", params, callback

# Destroy all bank accesses for a given bank
Bank::destroyBankAccess = (callback) ->
    console.log "Deleting all accesses for bank #{@uuid}"
    BankAccess.allFromBank @, (err, accesses) ->

        if err?
            console.log "Could not get BankAccess from bank -- #{@uuid}"
            callback err
        else
            treatment = (access, callback) ->
                access.destroyAccounts callback

            async.eachSeries accesses, treatment, (err) ->
                callback err