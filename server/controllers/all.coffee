Bank      = require '../models/bank'
Access    = require '../models/bankaccess'
Account   = require '../models/bankaccount'
Category  = require '../models/bankcategory'
Operation = require '../models/bankoperation'
Config    = require '../models/kresusconfig'
Cozy      = require '../models/cozyinstance'
h         = require './helpers'

async = require 'async'

ERR_MSG_LOADING_ALL = 'Error when loading all Kresus data'

GetAllData = (cb) ->
    errorFunc = (err, object) ->
        cb "when loading #{object}: #{err}"
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
                            cb null, ret

module.exports.all = (req, res) ->
    GetAllData (err, ret) ->
        if err?
            return h.sendErr res, err, 500, ERR_MSG_LOADING_ALL
        res.status(200).send ret

CleanData = (all) ->

    # Bank information is static and shouldn't be exported.
    delete all.banks

    # Cozy information is very tied to the instance.
    if all.cozy?
        delete all.cozy

    accessMap = {}
    nextAccessId = 0

    all.accesses ?= []
    for a in all.accesses
        accessMap[a.id] = nextAccessId
        a.id = nextAccessId++
        # Strip away password
        a.password = undefined

    all.accounts ?= []
    for a in all.accounts
        a.bankAccess = accessMap[a.bankAccess]
        # Strip away id
        a.id = undefined

    categoryMap = {}
    nextCatId = 0
    all.categories ?= []
    for c in all.categories
        categoryMap[c.id] = nextCatId
        c.id = nextCatId++

    all.operations ?= []
    for o in all.operations
        if o.categoryId?
            if not categoryMap[o.categoryId]?
                throw 'unexpected category id'
            o.categoryId = categoryMap[o.categoryId]
        # Strip away id
        o.id = undefined

    all.settings ?= []
    all.settings = all.settings.filter (s) ->
        s.name isnt 'weboob-log' and s.name isnt 'weboob-installed'
    all.settings.forEach (s) ->
        s.id = undefined

    all


module.exports.export = (req, res) ->
    GetAllData (err, ret) ->
        if err?
            return h.sendErr res, err, 500, ERR_MSG_LOADING_ALL

        Access.all (err, accesses) ->
            if err?
                return h.sendErr res, 'when loading accesses', 500, ERR_MSG_LOADING_ALL

            ret.accesses = accesses

            CleanData ret

            res.setHeader 'Content-Type', 'application/json'
            res.status(200).send ret

module.exports.import = (req, res) ->
    if not req.body.all?
         return h.sendErr res, "missing parameter all", 400, "missing parameter 'all' in the file"

    all = req.body.all
    all.accesses   ?= []
    all.accounts   ?= []
    all.categories ?= []
    all.operations ?= []
    all.settings   ?= []

    accessMap = {}
    importAccess = (access, cb) ->
        accessId = access.id
        access.id = undefined
        Access.create access, (err, created) ->
            if err?
                return cb err
            accessMap[accessId] = created.id
            cb null, created

    importAccount = (account, cb) ->
        if not accessMap[account.bankAccess]?
            return h.sendErr res, "unknown bank access #{account.bankAccess}", 400, "unknown bank access"
        account.bankAccess = accessMap[account.bankAccess]
        Account.create account, cb

    categoryMap = {}
    importCategory = (cat, cb) ->
        catId = cat.id
        cat.id = undefined;
        Category.create cat, (err, created) ->
            if err?
                return cb err
            categoryMap[catId] = created.id
            cb null, created

    importOperation = (op, cb) ->
        if op.categoryId? and not categoryMap[op.categoryId]?
            return h.sendErr res, "unknown category #{op.categoryId}", 400, "unknown category"
        op.categoryId = categoryMap[op.categoryId]
        Operation.create op, cb

    importSetting = Config.create.bind Config

    console.log """Importing:
    accesses: #{all.accesses.length}
    accounts: #{all.accounts.length}
    categories: #{all.categories.length}
    operations: #{all.operations.length}
    settings: #{all.settings.length}
    """

    async.each all.accesses, importAccess, (err) ->
        if err?
            return h.sendErr res, "When creating access: #{err.toString()}"

        async.each all.accounts, importAccount, (err) ->
            if err?
                return h.sendErr res, "When creating account: #{err.toString()}"

            async.each all.categories, importCategory, (err) ->
                if err?
                    return h.sendErr res, "When creating category: #{err.toString()}"

                async.each all.operations, importOperation, (err) ->
                    if err?
                        return h.sendErr res, "When creating operation: #{err.toString()}"

                    async.each all.settings, importSetting, (err) ->
                        if err?
                            return h.sendErr res, "When creating setting: #{err.toString()}"

                        console.log "Import finished with success!"
                        res.sendStatus 200

