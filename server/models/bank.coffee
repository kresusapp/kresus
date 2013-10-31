americano = require 'americano'
async = require 'async'
BankAccess = require './bankaccess'

module.exports = Bank = americano.getModel 'bank',
    name: String
    uuid: String

Bank.all = (callback) ->
    Bank.request "all", callback

# Destroy all bank accesses for a given bank
Bank::destroyBankAccess = (callback) ->
    console.log "Deleting all accesses for bank #{@uuid}"
    BankAccess.allFromBank @, (err, accesses) ->

        if err?
            console.log "Could not get BankAccess from bank -- #{@uuid}"
            callback err
        else
            treatment = (access, callback) ->
                access.destroyWithAccounts callback

            async.eachSeries accesses, treatment, (err) ->
                callback err