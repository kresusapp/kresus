BankAccount = require '../models/bankaccount'
BankOperation = require '../models/bankoperation'
BankAccess = require '../models/bankaccess'

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

module.exports.destroy = (req, res) ->
    @account.destroyWithOperations (err) ->
        if err?
            res.send 500, error: err
        else
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
    BankAccess.find @account.bankAccess, (err, access) =>
        if err?
            msg = "Server error occurred while retrieving data -- #{err}"
            res.send 500, error: msg
        else
            access.retrieveOperations (err) =>
                if err?
                    msg = "Server error occurred while retrieving data"
                    res.send 500, error: "#{msg} -- #{err}"
                else
                    res.send 200, @account