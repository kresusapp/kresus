americano = require('../db').module

module.exports = BankOperation = americano.getModel 'bankoperation',
    bankAccount: String         # actually the account number as in the bank, not as in the data-system
    title: String
    date: Date
    amount: Number
    raw: String
    dateImport: Date
    categoryId: String
    operationTypeID: String
    # Binary is an object containing one field (file) that links to a binary
    # document via an id. The binary document has a binary file
    # as attachment.
    binary: (x) -> x

BankOperation.all = (callback) ->
    BankOperation.request "all", callback

BankOperation.allFromBankAccount = (account, callback) ->
    params =
        key: account.accountNumber
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
    amount = (+operation.amount).toFixed(2)
    params =
        key: [operation.bankAccount, date, amount, operation.raw]
    BankOperation.request "allLike", params, callback

BankOperation.destroyByAccount = (accountNum, callback) ->
    BankOperation.requestDestroy "allByBankAccount", key: accountNum, callback

BankOperation.allByCategory = (categoryId, callback) ->
    params =
        key: categoryId
    BankOperation.request "allByCategory", params, callback
