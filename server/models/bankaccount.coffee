americano = require 'americano'
async = require 'async'

BankOperation = require './bankoperation'
BankAlert = require './bankalert'

module.exports = BankAccount = americano.getModel 'bankaccount',
    bank: String
    bankAccess: String
    title: String
    accountNumber: String
    initialAmount: Number
    lastChecked: Date

BankAccount.all = (callback) ->
    BankAccount.request "all", (err, accounts) ->
        BankAccount.calculateBalance accounts, callback

BankAccount.allLike = (account, callback) ->
    params =
        key: [account.bank, account.accountNumber]
    BankAccount.request "allLike", params, callback

BankAccount.allFromBank = (bank, callback) ->
    params =
        key: bank.uuid
    BankAccount.request "allByBank", params, (err, accounts) ->
        BankAccount.calculateBalance accounts, callback

BankAccount.findMany = (accountIDs, callback) ->
    ids = []
    ids.push accountID for accountID in accountIDs
    params = key: ids
    BankAccount.request "all", (err, accounts) ->
        BankAccount.calculateBalance accounts, callback

BankAccount.allFromBankAccess = (bankAccess, callback) ->
    params =
        key: bankAccess.id
    BankAccount.request "allByBankAccess", params, callback

# When a new account is added, we need to set its initial amount
# so it works nicely with the "getBalance" view
BankAccount.initializeAmount = (relatedAccounts, callback) ->
    BankAccount.all (err, accounts) ->
        # we only want new accounts to be initalized
        accountsToProcess = []
        for account in accounts
            for relatedAccount in relatedAccounts
                if account.accountNumber is relatedAccount.accountNumber
                    accountsToProcess.push account

        process = (account, callback) ->
            newAmount = account.initialAmount - account.__data.operationSum
            attr = initialAmount: newAmount.toFixed 2
            account.updateAttributes attr, (err) ->
                callback err

        async.each accountsToProcess, process, (err) ->
            callback err

# Adds the calculated balance for a list of accounts
BankAccount.calculateBalance = (accounts, callback) ->
    calculatedAccounts = []
    BankOperation.rawRequest "getBalance", group: true, (err, balances) ->
        for account, i in accounts
            calculatedAccounts.push account.toJSON()
            accountNumber = account.accountNumber
            initialAmount = account.initialAmount

            accounts[i].__data.operationSum = 0
            accounts[i].setBalance 0

            for balance in balances
                if balance.key is accountNumber
                    amount = (initialAmount + balance.value).toFixed 2
                    accounts[i].setBalance parseFloat amount
                    accounts[i].__data.operationSum = balance.value.toFixed 2

        callback err, accounts

BankAccount::getBalance = ->
    return @__data.amount

BankAccount::setBalance = (balance) ->
    @__data.amount = balance

BankAccount::toJSON = ->
    json = @toObject true
    json.amount = @getBalance()
    return json
