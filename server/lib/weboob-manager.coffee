util = require 'util'
Client = require('request-json').JsonClient
async = require 'async'
BankOperation = require '../models/bankoperation'
BankAccount = require '../models/bankaccount'

NotificationsHelper = require 'cozy-notifications-helper'
appData = require '../../package.json'
alertManager = require './alert-manager'

class WeboobManager

    newAccounts: []
    newOperations: []

    constructor: ->
        @client = new Client 'http://localhost:9101/'
        @notificator = new NotificationsHelper appData.name

    retrieveAccountsByBankAccess: (access, callback) ->
        url = "connectors/bank/#{access.bank}/"
        @client.post url, access.getAuth(), (err, res, body) =>
            if err? or body.error?
                msg = "Weboob is not available -- #{err}"
                console.log msg
                callback msg
            else
                accountsWeboob = body["#{access.bank}"]
                accounts = []

                for accountWeboob in accountsWeboob
                    account =
                        accountNumber: accountWeboob.accountNumber
                        bank: access.bank
                        bankAccess: access.id
                        title: accountWeboob.label
                        amount: accountWeboob.balance
                        initialAmount: accountWeboob.balance
                        lastChecked: new Date()
                    accounts.push account

                console.log "-> #{accounts.length} bank account(s) found"

                @processRetrievedAccounts accounts, callback

    processRetrievedAccounts: (accounts, callback) ->

        processAccount = (account, callback) =>
            BankAccount.create account, (err, account) =>
                @newAccounts.push account unless err?
                callback err

        async.each accounts, processAccount, (err) ->
            console.log err if err?
            callback err

    retrieveOperationsByBankAccess: (access, callback) ->
        url = "/connectors/bank/#{access.bank}/history"
        @client.post url, access.getAuth(), (err, res, body) =>
            if err? or body.error?
                msg = "Weboob is not available -- #{err}"
                console.log msg
                callback msg
            else
                operationsWeboob = body["#{access.bank}"]
                operations = []
                for operationWeboob in operationsWeboob
                    relatedAccount = operationWeboob.account
                    operation =
                        title: operationWeboob.label
                        amount: operationWeboob.amount
                        date: operationWeboob.rdate
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
            console.log err if err?

            if operations? and operations.length > 0
                callback()
            else
                console.log "New operation found!"
                BankOperation.create operation, (err, operation) =>
                    @newOperations.push operation unless err?
                    callback err

    afterOperationsRetrieved: (callback) ->
        processes = []
        processes.push @_initializeAmountForNewAccounts
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

    # Set the correct initial amount for new bank accounts
    # must be done because we compute the balance from the operations
    _initializeAmountForNewAccounts: (callback) =>
        console.log "Initializing initial amount of the new accounts..."
        if @newAccounts.length > 0
            console.log "Initialize #{@newAccounts.length} accounts..."
            BankAccount.initializeAmount @newAccounts, callback
        else
            callback()

    _notifyNewOperations: (callback) =>
        console.log "Informing user new operations have been imported..."
        operationsCount = @newOperations.length

        # we don't show the notification on account import
        if operationsCount > 0 and @newAccounts.length is 0
            params =
                text: "PFM: #{operationsCount} new transaction(s) imported."
            @notificator.createTemporary params

        callback()

    _updateLastCheckedBankAccount: (callback) ->
        console.log "Updating 'last checked' date for all accounts..."
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

module.exports = new WeboobManager()