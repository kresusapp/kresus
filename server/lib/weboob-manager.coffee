moment = require 'moment'
async = require 'async'

NotificationsHelper = require 'cozy-notifications-helper'

BankOperation = require '../models/bankoperation'
BankAccount = require '../models/bankaccount'

appData = require '../../package.json'
alertManager = require './alert-manager'

# in dev mode, import mocked weboob module
if process.kresus.dev
    {FetchAccounts, FetchOperations} = require './weboob-mock'
else
    {FetchAccounts, FetchOperations} = require './weboob-fetch'


class WeboobManager

    newAccounts: []
    newOperations: []

    constructor: ->
        @notificator = new NotificationsHelper appData.name

    retrieveAccountsByBankAccess: (access, callback) ->

        FetchAccounts access.bank, access.login, access.password, access.website, (err, body) =>

            if err?
                console.error "When fetching accounts: #{err}"
                callback err
                return

            accountsWeboob = body["#{access.bank}"]
            accounts = []

            for accountWeboob in accountsWeboob
                account =
                    accountNumber: accountWeboob.accountNumber
                    bank: access.bank
                    bankAccess: access.id
                    title: accountWeboob.label
                    initialAmount: accountWeboob.balance
                    lastChecked: new Date()
                accounts.push account

            console.log "-> #{accounts.length} bank account(s) found"

            @processRetrievedAccounts accounts, callback

    processRetrievedAccounts: (accounts, callback) ->

        processAccount = (account, callback) =>
            BankAccount.allLike account, (err, matches) =>

                if err?
                    console.error 'when trying to find identical accounts:', err
                    callback err
                    return

                if matches.length
                    console.log 'Account was already present.'
                    callback null
                    return

                console.log 'New account found.'
                BankAccount.create account, (err, account) =>
                    @newAccounts.push account unless err?
                    callback err

        async.each accounts, processAccount, (err) ->
            console.log err if err?
            callback err

    retrieveOperationsByBankAccess: (access, callback) ->

        FetchOperations access.bank, access.login, access.password, access.website, (err, body) =>

            if err?
                msg = "when retrieving operations: #{err}"
                console.error msg
                callback msg
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

module.exports = WeboobManager
