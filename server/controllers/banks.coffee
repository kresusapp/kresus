Bank = require '../models/bank'
BankAccess = require '../models/bankaccess'
BankAccount = require '../models/bankaccount'
BankOperation = require '../models/bankoperation'

module.exports.loadBank = (req, res, next, bankID) ->
    Bank.find bankID, (err, bank) =>
        if err? or not bank?
            res.send 404, error: "Bank not found"
        else
            @bank = bank
            next()

module.exports.index = (req, res) ->
    doRespond = (err, banks) ->
        if err? or not banks?
            msg = "Couldn't retrieve banks -- #{err}"
            res.send 500, msg
        else
            res.send 200, banks
    if req.query.withAccountOnly?
        Bank.getBanksWithAccounts doRespond
    else
        Bank.all doRespond

module.exports.show = (req, res) ->
    res.send 200, @bank

module.exports.getAccesses = (req, res) ->
    BankAccess.allFromBank @bank, (err, accesses) ->
        if err?
            res.send 500, error: 'Server error occurred while retrieving data'
        else
            res.send 200, accesses

module.exports.getAccounts = (req, res) ->
    BankAccount.allFromBank @bank, (err, accounts) ->
        if err?
            res.send 500, error: 'Server error occurred while retrieving data'
        else
            res.send 200, accounts

module.exports.destroy = (req, res) ->
    @bank.destroyBankAccess (err) ->
        if err?
            msg = "Could not delete accesses for bank #{bank.name}"
            res.send 500, error: msg
        else
            res.send 204, success: true