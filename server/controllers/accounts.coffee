async = require 'async'

BankAccount = require '../models/account'
BankOperation = require '../models/operation'
BankAccess = require '../models/access'
BankAlert = require '../models/alert'

h = require './helpers'

# Prefills the @account field with a queried bank account.
module.exports.loadBankAccount = (req, res, next, accountID) ->
    BankAccount.find accountID, (err, account) =>
        if err?
            h.sendErr res, "when finding a bank account: #{err}"
            return

        if not account?
            h.sendErr res, "bank account not found", 404, "bank account not found"
            return

        @account = account
        next()


# Returns all bank accounts
module.exports.index = (req, res) ->
    BankAccount.all (err, accounts) ->
        if err?
            h.sendErr res, "when retrieving all bank accounts: #{err}"
            return
        res.status(200).send(accounts)


# Destroy an account and all its operations, alerts, and accesses if no other
# accounts are bound to this access.
module.exports.DestroyWithOperations = DestroyWithOperations = (account, callback) ->
    console.log "Removing account #{account.title} from database..."
    requests = []

    # Destroy operations
    requests.push (callback) =>
        console.log "\t-> Destroying operations for account #{account.title}"
        BankOperation.destroyByAccount account.accountNumber, (err) ->
            if err?
                callback "Could not remove operations: #{err}", null
                return
            callback null, true

    # Destroy alerts
    requests.push (callback) =>
        console.log "\t-> Destroy alerts for account #{account.title}"
        BankAlert.destroyByAccount account.id, (err) ->
            if err?
                callback "Could not remove alerts -- #{err}", null
                return
            callback null, true

    # Destroy account
    requests.push (callback) =>
        account.destroy (err) ->
            if err?
                callback "Could not delete account -- #{err}", null
                return
            callback null, true

    # Find bank accounts for this access and destroy access if it has no
    # accounts.
    requests.push (callback) =>
        console.log "\t-> Destroying access if no other accounts are bound"
        # Fake a bankAccess object by providing an id...
        # TODO clean this up
        BankAccount.allFromBankAccess {id: account.bankAccess}, (err, accounts) =>
                if err? or not accounts?
                    callback "Couldn't retrieve accounts by bank -- #{err}"
                    return

                if accounts.length is 0
                    console.log '\t\tNo other bank account bound to this access!'
                    BankAccess.find account.bankAccess, (err, access) ->
                        if err?
                            callback err
                            return

                        if not access?
                            console.log '\t\tAccess not found?'
                            callback()
                            return

                        access.destroy()
                        console.log "\t\t-> Access destroyed"
                        callback()
                else
                    console.log '\t\tAt least one other bank account bound to this access.'
                    callback()

    async.series requests, (err, results) ->
        callback err


# Delete account, operations and alerts.
module.exports.destroy = (req, res) ->
    DestroyWithOperations @account, (err) ->
        if err?
            h.sendErr res, "when destroying account: #{err}"
            return
        res.status(204).send(success: true)


# Returns the raw account
module.exports.show = (req, res) ->
    res.status(200).send(@account)


# Get operations of a given bank account
module.exports.getOperations = (req, res) ->
    BankOperation.allFromBankAccountDate @account, (err, operations) ->
        if err?
            h.sendErr res, "when retrieving operations for a bank account: #{err}"
            return
        res.status(200).send(operations)

