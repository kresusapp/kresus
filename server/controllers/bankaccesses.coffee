BankAccess = require '../models/bankaccess'
BankAccount = require '../models/bankaccount'

module.exports.loadBankAccess = (req, res, next, bankAccessID) ->
    BankAccess.find bankAccessID, (err, access) =>
        if err? or not access?
            res.send 404, error: "BankAccess not found"
        else
            delete access.password
            @access = access
            next()

module.exports.index = (req, res) ->
    BankAccess.all (err, accesses) ->
        if err?
            res.send 500, error: 'Server error occurred while retrieving data'
        else
            res.send 200, accesses

module.exports.create = (req, res) ->

    BankAccess.create req.body, (err, access) ->
        if err
            res.send 500, error: "Server error while creating bank access."
        else
            access.retrieveAccounts (err) ->
                if err?
                    res.send 500, error: "Could not retrieved data from bank"
                else
                    res.send 201, access

module.exports.destroy = (req, res) ->
    @access.destroy (err) ->
        if err?
            res.send 500, error: "Server error while deleting the bank access"
        else
            res.send 204, success: true

module.exports.update = (req, res) ->
    @access.updateAttributes body, (err, access) ->
        if err?
            res.send 500, error: "Server error while saving bank access"
        else
            res.send 200, access

module.exports.show = (req, res) ->
    res.send 200, @access

module.exports.getAccounts = (req, res) ->
    BankAccount.allFromBankAccess @access, (err, accounts) ->
        if err
            res.send 500, error: 'Server error occurred while retrieving data'
        else
            res.send 200, accounts