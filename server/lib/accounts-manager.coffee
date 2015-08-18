moment = require 'moment'
async = require 'async'

NotificationsHelper = require 'cozy-notifications-helper'

Bank = require '../models/bank'
BankOperation = require '../models/bankoperation'
BankAlert = require '../models/bankalert'
BankAccount = require '../models/bankaccount'

appData = require '../../package.json'
alertManager = require './alert-manager'


# Add backends here.
SOURCE_HANDLERS = {}
AddBackend = (exportObject) ->
    if not exportObject.SOURCE_NAME? or
      not exportObject.FetchAccounts? or
      not exportObject.FetchOperations?
        throw "Backend doesn't implement basic functionalty, see accounts-manager.coffee."

    SOURCE_HANDLERS[exportObject.SOURCE_NAME] = exportObject

AddBackend require './sources/mock'
AddBackend require './sources/weboob'


# Connect static bank information to their backends.
ALL_BANKS = require '../../../weboob/banks-all.json'
BANK_HANDLERS = {}
for bank in ALL_BANKS
    if not bank.backend? or bank.backend not of SOURCE_HANDLERS
        throw "Bank handler not described in the static JSON file, or not imported."
    BANK_HANDLERS[bank.uuid] = SOURCE_HANDLERS[bank.backend]


TryMatchAccount = (target, accounts) ->
    res =
        found: false

    for a in accounts

        if a.bank isnt target.bank
            console.log 'data inconsistency when trying to match accounts with existing ones: "bank" attributes are different', a.bank, target.bank

        # Remove spaces (e.g. Credit Mutuel would randomly add spaces in
        # account names) and lower case.
        oldTitle = a.title.replace(/ /g, '').toLowerCase()
        newTitle = target.title.replace(/ /g, '').toLowerCase()

        if oldTitle is newTitle
            if a.accountNumber is target.accountNumber
                res.found = true
                return res

            res.mergeCandidates =
                old: a
                new: target
            return res

        if a.accountNumber is target.accountNumber
            res.mergeCandidates =
                old: a
                new: target
            return res

    return res


MergeAccounts = (old, kid, callback) ->

    if old.accountNumber is kid.accountNumber and old.title is kid.title
        return callback "MergeAccounts shouldn't have been called in the first place!"

    console.log "Merging (#{old.accountNumber}, #{old.title}) with (#{kid.accountNumber}, #{kid.title}) "

    replaceBankAccount = (obj, next) ->
        if obj.bankAccount isnt kid.accountNumber
            obj.updateAttributes bankAccount: kid.accountNumber, next
        else
            next()

    # 1. Update operations
    BankOperation.allFromBankAccount old, (err, ops) ->
        if err?
            console.error "when merging accounts (reading operations): #{err}"
            return callback err

        async.eachSeries ops, replaceBankAccount, (err) ->
            if err?
                console.error "when updating operations, on a merge: #{err}"
                return callback err

            # 2. Update alerts
            BankAlert.allFromBankAccount old, (err, als) ->
                if err?
                    console.error "when merging accounts (reading alerts): #{err}"
                    return callback err

                async.eachSeries als, replaceBankAccount, (err) ->
                    if err?
                        console.error "when updating alerts, on a merge: #{err}"
                        return callback err

                    # 3. Update account
                    newAccount =
                        accountNumber: kid.accountNumber
                        title: kid.title
                    old.updateAttributes newAccount, callback


class AccountManager

    constructor: ->
        @newAccounts = []
        @newOperations = []
        @notificator = new NotificationsHelper appData.name

    retrieveAccountsByBankAccess: (access, callback) ->
        BANK_HANDLERS[access.bank].FetchAccounts access.bank, access.login, access.password, access.website, (err, body) =>

            if err?
                console.error "When fetching accounts: #{JSON.stringify err}"
                callback err
                return

            accountsWeboob = body["#{access.bank}"]
            accounts = []

            for accountWeboob in accountsWeboob
                account =
                    accountNumber: accountWeboob.accountNumber
                    bank: access.bank
                    bankAccess: access.id
                    iban: accountWeboob.iban
                    title: accountWeboob.label
                    initialAmount: accountWeboob.balance
                    lastChecked: new Date()
                accounts.push account

            console.log "-> #{accounts.length} bank account(s) found"

            @processRetrievedAccounts access, accounts, callback

    processRetrievedAccounts: (access, newAccounts, callback) ->

        BankAccount.allFromBankAccess access, (err, oldAccounts) =>

            if err?
                console.error 'when trying to find identical accounts:', err
                callback err
                return

            processAccount = (account, callback) =>

                    matches = TryMatchAccount account, oldAccounts
                    if matches.found
                        console.log 'Account was already present.'
                        callback null
                        return

                    if matches.mergeCandidates?
                        m = matches.mergeCandidates
                        console.log 'Found candidates for merging!'
                        MergeAccounts m.old, m.new, callback
                        return

                    console.log 'New account found.'
                    BankAccount.create account, (err, account) =>
                        @newAccounts.push account unless err?
                        callback err

            async.each newAccounts, processAccount, (err) ->
                console.log err if err?
                callback err

    retrieveOperationsByBankAccess: (access, callback) ->

        BANK_HANDLERS[access.bank].FetchOperations access.bank, access.login, access.password, access.website, (err, body) =>

            if err?
                console.error "When fetching operations: #{JSON.stringify err}"
                callback err
                return

            operationsWeboob = body["#{access.bank}"]
            operations = []
            now = moment()
            for operationWeboob in operationsWeboob
                relatedAccount = operationWeboob.account
                operation =
                    title: operationWeboob.label
                    amount: operationWeboob.amount
                    date: operationWeboob.rdate
                    dateImport: now.format "YYYY-MM-DDTHH:mm:ss.000Z"
                    raw: operationWeboob.raw
                    bankAccount: relatedAccount
                operations.push operation

            @processRetrievedOperations operations, callback

    processRetrievedOperations: (operations, callback) ->
        async.each operations, @processRetrievedOperation, (err) =>
            console.log err if err?
            @afterOperationsRetrieved callback

    processRetrievedOperation: (operation, callback) =>
        BankOperation.allLike operation, (err, operations) =>
            if err?
                console.error "When comparing operations with an existing one: #{err}"
                callback err
                return

            if operations? and operations.length > 0
                return callback()

            console.log "New operation found!"
            BankOperation.create operation, (err, operation) =>
                @newOperations.push operation unless err?
                callback err

    afterOperationsRetrieved: (callback) ->
        processes = []
        processes.push @_updateInitialAmountFirstImport
        processes.push @_updateLastCheckedBankAccount
        processes.push @_notifyNewOperations
        processes.push @_checkAccountsAlerts
        processes.push @_checkOperationsAlerts

        async.series processes, (err) =>
            console.log "Post process: done."
            # reset object
            @newAccounts = []
            @newOperations = []
            callback err

    _updateInitialAmountFirstImport: (callback) =>
        if @newAccounts.length is 0
            callback()
            return

        process = (account, cb) =>
            relatedOperations = @newOperations.slice().filter (op) ->
                op.bankAccount == account.accountNumber
            if relatedOperations.length is 0
                return cb()
            offset = relatedOperations.reduce ((a, b) -> a + b.amount), 0
            account.initialAmount -= offset
            account.save cb
            return

        async.each @newAccounts, process, callback

    _notifyNewOperations: (callback) =>
        console.log "Informing user new operations have been imported..."
        operationsCount = @newOperations.length

        # we don't show the notification on account import
        if operationsCount > 0 and @newAccounts.length is 0
            params =
                text: "Kresus: #{operationsCount} new transaction(s) imported."
                resource:
                    app: 'kresus'
                    url: '/'
            @notificator.createTemporary params

        callback()

    _updateLastCheckedBankAccount: (callback) ->
        console.log "Updating 'last checked' date for all accounts..."
        # TODO this is incorrect if you have several banks
        BankAccount.all (err, accounts) ->
            process = (account, callback) ->
                account.updateAttributes lastChecked: new Date(), callback

            async.each accounts, process, callback

    _checkAccountsAlerts: (callback) =>
        console.log "Checking alerts for accounts balance..."

        # If no new operations, it is useless to notify the user again
        if @newOperations.length > 0
            alertManager.checkAlertsForAccounts callback
        else
            callback()

    _checkOperationsAlerts: (callback) =>
        console.log "Checking alerts for operations amount"
        alertManager.checkAlertsForOperations @newOperations, callback

module.exports = AccountManager
