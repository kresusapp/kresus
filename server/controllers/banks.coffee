async = require 'async'

h = require './helpers'

Bank = require '../models/bank'
BankAccess = require '../models/access'
BankAccount = require '../models/account'
BankOperation = require '../models/operation'

BankAccountController = require './accounts'

# Preloads @bank in a request
module.exports.loadBank = (req, res, next, bankID) ->
    Bank.find bankID, (err, bank) =>
        if err?
            h.sendErr res, "when loading bank: #{err}"
            return

        if not bank?
            h.sendErr res, "bank not found", 404, "bank not found"
            return

        @bank = bank
        next()


# Retrieves a list of all banks (if !withAccountsOnly), or banks that have an
# account within Kresus (if withAccountsOnly).
module.exports.index = (req, res) ->
    callback = (err, banks) ->
        if err?
            h.sendErr res, "when retrieving banks: #{err}"
            return
        res.status(200).send(banks)

    if req.query.withAccountOnly?
        Bank.getBanksWithAccounts callback
    else
        Bank.all callback


# Returns the queried bank.
module.exports.show = (req, res) ->
    res.status(200).send(@bank)


# Returns accounts of the queried bank.
module.exports.getAccounts = (req, res) ->
    BankAccount.allFromBank @bank, (err, accounts) ->
        if err?
            h.sendErr res, "when retrieving accounts by bank: #{err}"
            return

        res.status(200).send(accounts)


# Erase all accesses bounds to the queried bank (triggering deletion of
# accounts as well).
module.exports.destroy = (req, res) ->
    console.log "Deleting all accesses for bank #{@bank.uuid}"
    # 1. Retrieve all accesses
    BankAccess.allFromBank @bank, (err, accesses) ->
        if err?
            h.sendErr res, "could not retrieve accesses for bank: #{err}"
            return

        # 2. for each access,
        process = (access, callback) ->
            console.log "Removing access #{access.id} for bank #{access.bank} from database..."
            # 2.1. retrieve all accounts bounds to this access
            BankAccount.allFromBankAccess access, (err, accounts) =>
                # 2.1.1 Delete account and operations, and maybe the access
                async.eachSeries accounts, BankAccountController.DestroyWithOperations, callback

        # Note that the access will be deleted by DestroyWithOperations, when
        # there are no more bounds accounts.
        async.eachSeries accesses, process, (err) ->
            if err?
                h.sendErr res, "when deleting access: #{err}"
                return
            res.status(204).send(success: true)
