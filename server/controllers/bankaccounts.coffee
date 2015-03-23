async = require 'async'

BankAccount = require '../models/bankaccount'
BankOperation = require '../models/bankoperation'
BankAccess = require '../models/bankaccess'
BankAlert = require '../models/bankalert'

h = require './helpers'

module.exports.loadBankAccount = (req, res, next, accountID) ->
    BankAccount.find accountID, (err, account) =>
        if err? or not account?
            res.send 404, error: "BankAccount not found"
        else
            @account = account
            next()

module.exports.index = (req, res) ->
    BankAccount.all (err, accounts) ->
        if err?
            res.send 500, error: 'Server error occurred while retrieving data'
        else
            res.send 200, accounts

module.exports.DestroyWithOperations = DestroyWithOperations = (account, callback) ->
    console.log "Removing account #{account.title} from database..."
    requests = []
    requests.push (callback) =>
        console.log "\t-> Destroying operations for account #{account.title}"
        BankOperation.destroyByAccount account.accountNumber, (err) ->
            if err?
                callback "Could not remove operations: #{err}", null
            else
                callback null, true

    requests.push (callback) =>
        console.log "\t-> Destroy alerts for account #{account.title}"
        BankAlert.destroyByAccount account.id, (err) ->
            if err?
                callback "Could not remove alerts -- #{err}", null
            else
                callback null, true

    requests.push (callback) =>
        account.destroy (err) ->
            if err?
                callback "Could not delete account -- #{err}", null
            else
                callback null, true

    requests.push (callback) =>
        console.log "\t-> Destroying access if no accounts are bound"
        BankAccess.removeIfNoAccountBound id: account.bankAccess, (err) ->
            if err?
                callback err, null
            else
                callback null, true

    async.series requests, (err, results) ->
        callback err


module.exports.destroy = (req, res) ->
    DestroyWithOperations @account, (err) ->
        if err?
            h.sendErr res, "when destroying account: #{err}"
            return
        res.send 204, success: true


module.exports.show = (req, res) ->
    res.send 200, @account


module.exports.getOperations = (req, res) ->
    BankOperation.allFromBankAccountDate @account, (err, operations) ->
        if err?
            res.send 500, error: 'Server error occurred while retrieving data'
        else
            res.send 200, operations

module.exports.retrieveOperations = (req, res) ->
    msg = 'while fetching new operations:'
    BankAccess.find @account.bankAccess, (err, access) =>
        if err?
            res.send 500, error: "#{msg} -- #{err}"
        else
            access.retrieveAccounts (err) =>
                if err?
                    msg = "Server error occurred while retrieving data"
                    res.send 500, error: "#{msg} -- #{err}"
                else
                    # Reload the account, for taking the lastChecked into account.
                    BankAccount.find @account.id, (err, account) =>

                        if err?
                            res.send 500, error: "#{msg} -- #{err}"
                            return

                        BankAccount.calculateBalance [account], (err, accounts) =>
                            if err?
                                res.send 500, error: "#{msg} -- #{err}"
                                return
                            res.send 200, accounts[0]
