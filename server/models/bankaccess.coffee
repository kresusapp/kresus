americano = require 'americano'
async = require 'async'

BankAccount = require './bankaccount'
weboob = require '../lib/weboob-manager'

module.exports = BankAccess = americano.getModel 'bankaccess',
    bank: String
    login: String
    password: String

BankAccess.all = (callback) ->
    BankAccess.request "all", callback

BankAccess.allFromBank = (bank, callback) ->
    params =
        key: bank.uuid
    BankAccess.request "allByBank", params, callback

# Destroy one bank access with its accounts and operations
BankAccess::destroyWithAccounts = (callback) ->

    console.log "Removing access #{@id} for bank #{@bank} from database..."
    BankAccount.allFromBankAccess @, (err, accounts) ->
        process = (account, callback) ->
            account.destroyWithOperations callback

        async.eachSeries accounts, process, (err) =>
            @destroy callback

BankAccess::retrieveAccounts = (callback) ->
    weboob.retrieveAccountsByBankAccess @, (err) =>
        if err?
            callback err
        else
            @retrieveOperations callback

BankAccess::retrieveOperations = (callback) ->
    weboob.retrieveOperationsByBankAccess @, callback

BankAccess.retrieveOperationsForAllAccesses = (callback) ->
    BankAccess.all (err, accesses) ->
        unless err?
            process = (access, callback) -> access.retrieveOperations callback
            async.eachSeries accesses, process, callback
        else
            callback()

BankAccess::getAuth = ->
    return login: @login, password: @password