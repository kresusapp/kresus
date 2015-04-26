BankAccess = require '../models/bankaccess'
BankAccount = require '../models/bankaccount'

weboob = require '../lib/weboob-manager'
h = require './helpers'


# Preloads a bank access (sets @access).
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


# Returns all bank accesses
module.exports.index = (req, res) ->
    BankAccess.all (err, accesses) ->
        if err? or not accesses?
            h.sendErr res, "couldn't retrieve all bank accesses: #{err}"
            return

        res.status(200).send(accesses)


# Creates a new bank access (expecting at least (bank / login / password)), and
# retrieves its accounts and operations.
module.exports.create = (req, res) ->
    access = req.body

    if not access.bank? or not access.login? or not access.password?
        h.sendErr res, "missing parameters", 400, "missing parameters"
        return

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
                    h.sendErr res, "when loading accounts for the first time: #{err}", 500, err
                    return

                weboob.retrieveOperationsByBankAccess access, (err) ->
                    if err?
                        access.destroy()
                        h.sendErr res, "when loading operations for the first time: #{err}", 500, err
                        return

                    res.status(201).send access


# Deletes a bank access.
module.exports.destroy = (req, res) ->
    @access.destroy (err) ->
        if err?
            h.sendErr res, "couldn't delete bank access: #{err}"
            return

        res.status(204).send(success: true)


# Updates the bank access
module.exports.update = (req, res) ->

    access = req.body

    if not access.bank? or not access.login? or not access.password?
        h.sendErr res, "missing parameters", 400, "missing parameters"
        return

    @access.updateAttributes access, (err, access) ->
        if err?
            h.sendErr res, "couldn't update bank access: #{err}"
            return

        res.status(200).send(access)


# Returns the raw bank access
module.exports.show = (req, res) ->
    res.status(200).send(@access)

