BankAccess = require '../models/bankaccess'
BankAccount = require '../models/bankaccount'

weboob = require '../lib/weboob-manager'
h = require './helpers'


module.exports.loadBankAccess = (req, res, next, bankAccessID) ->
    BankAccess.find bankAccessID, (err, access) =>
        if err?
            h.sendErr res, "when finding bank access: #{err}"
            return

        if not access?
            h.sendErr res, "bank access not found", 404, "bank access not found"
            return

        delete access.password
        @access = access
        next()


module.exports.index = (req, res) ->
    BankAccess.all (err, accesses) ->
        if err? or not accesses?
            h.sendErr res, "couldn't retrieve all bank accesses: #{err}"
            return

        res.send 200, accesses


module.exports.create = (req, res) ->
    # TODO check attributes
    access = req.body

    BankAccess.allLike access, (err, accesses) ->
        if err? or not accesses?
            h.sendErr res, "couldn't retrieve all bank accesses like #{err}"
            return

        if accesses.length isnt 0
            h.sendErr res, "bank access already exists", 409, "bank access already exists"
            return

        BankAccess.create access, (err, access) ->
            if err?
                h.sendErr res, "when creating bank access"
                return

            weboob.retrieveAccountsByBankAccess access, (err) ->
                if err?
                    access.destroy()
                    h.sendErr res, "when loading accounts for the first time: #{err}"
                    return

                weboob.retrieveOperationsByBankAccess access, (err) ->
                    if err?
                        access.destroy()
                        h.sendErr res, "when loading operations for the first time: #{err}"
                        return

                    res.send 201, access


module.exports.destroy = (req, res) ->
    @access.destroy (err) ->
        if err?
            h.sendErr res, "couldn't delete bank access: #{err}"
            return

        res.send 204, success: true


module.exports.update = (req, res) ->
    # TODO check attributes
    @access.updateAttributes req.body, (err, access) ->
        if err?
            h.sendErr res, "couldn't update bank access: #{err}"
            return

        res.send 200, access


module.exports.show = (req, res) ->
    res.send 200, @access


module.exports.getAccounts = (req, res) ->
    BankAccount.allFromBankAccess @access, (err, accounts) ->
        if err
            h.sendErr res, "when retrieving accounts by bank access"
            return

        res.send 200, accounts
