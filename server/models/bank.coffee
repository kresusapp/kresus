americano = require 'americano'
async = require 'async'
BankAccess = require './bankaccess'
BankAccount = require './bankaccount'

module.exports = Bank = americano.getModel 'bank',
    name: String
    uuid: String

Bank.all = (callback) ->
    Bank.request "all", callback

Bank.getBanksWithAccounts = (callback) ->
    params = group: true
    BankAccount.rawRequest 'bankWithAccounts', params, (err, banks) ->

        if err?
            callback err, null
        else if not banks?
            callback null, []
        else
            uuids = []
            uuids.push bank.key for bank in banks

            Bank.getManyByUuid uuids, (err, banks) ->
                callback err, banks

Bank.getManyByUuid = (uuids, callback) ->

    uuids = [uuids] if not (uuids instanceof Array)
    params = keys: uuids

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