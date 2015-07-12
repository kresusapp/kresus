americano = require 'americano'

module.exports = BankAccount = americano.getModel 'bankaccount',
    bank: String
    bankAccess: String
    title: String
    accountNumber: String
    initialAmount: Number
    lastChecked: Date

BankAccount.all = (callback) ->
    BankAccount.request "allByTitle", callback

BankAccount.allLike = (account, callback) ->
    params =
        key: [account.bank, account.accountNumber]
    BankAccount.request "allLike", params, callback

BankAccount.allFromBank = (bank, callback) ->
    params =
        key: bank.uuid
    BankAccount.request "allByBank", params, callback

BankAccount.findMany = (accountIDs, callback) ->
    ids = []
    ids.push accountID for accountID in accountIDs
    params = key: ids
    BankAccount.request "all", callback

BankAccount.allFromBankAccess = (bankAccess, callback) ->
    params =
        key: bankAccess.id
    BankAccount.request "allByBankAccess", params, callback

BankAccount::getBalance = () -> 0
