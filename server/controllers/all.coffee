Bank      = require '../models/bank'
Account   = require '../models/bankaccount'
Category  = require '../models/bankcategory'
Operation = require '../models/bankoperation'
Config    = require '../models/kresusconfig'
Cozy      = require '../models/cozyinstance'
h         = require './helpers'

module.exports.all = (req, res) ->

    errorFunc = (err, object) ->
        h.sendErr res, "when loading #{object}: #{err}", 500, 'Error when loading all Kresus data'
        return

    ret = {}
    Bank.all (err, banks) ->
        if err? then return errorFunc err, 'banks'
        ret.banks = banks

        Account.all (err, accounts) ->
            if err? then return errorFunc err, 'accounts'
            ret.accounts = accounts

            Operation.all (err, ops) ->
                if err? then return errorFunc err, 'operations'
                ret.operations = ops

                Category.all (err, cats) ->
                    if err? then return errorFunc err, 'categories'
                    ret.categories = cats

                    Config.all (err, configs) ->
                        if err? then return errorFunc err, 'configs'
                        ret.settings = configs

                        Cozy.all (err, cozy) ->
                            if err? then return errorFunc err, 'cozy'
                            ret.cozy = cozy
                            res.status(200).send ret
