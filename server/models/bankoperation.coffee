americano = require 'americano'

module.exports = BankOperation = americano.getModel 'bankoperation',
    bankAccount: String
    title: String
    date: Date
    amount: Number
    raw: String

BankOperation.all = (callback) ->
    BankOperation.request "all", callback

BankOperation.allFromBankAccount = (account, callback) ->
    params =
        key: account.id
    BankOperation.request "allByBankAccount", params, callback

BankOperation.allFromBankAccounts = (accountNums, callback) ->
    params = keys: accountNums
    BankOperation.request "allByBankAccount", params, callback

BankOperation.allFromBankAccountDate = (account, callback) ->
    params =
        startkey: [account.accountNumber + "0"]
        endkey: [account.accountNumber]
        descending: true
    BankOperation.request "allByBankAccountAndDate", params, callback

BankOperation.allLike = (operation, callback) ->
    date = new Date(operation.date).toISOString()
    params =
        key: [operation.bankAccount, date, \
             operation.amount, operation.title]
    BankOperation.request "allLike", params, callback

BankOperation.destroyByAccount = (accountNum, callback) ->
    BankOperation.requestDestroy "allByBankAccount", key: accountNum, callback
