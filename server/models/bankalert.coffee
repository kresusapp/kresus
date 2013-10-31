americano = require 'americano'

module.exports = BankAlert = americano.getModel 'bankalert',
    bankAccount: String
    type: String        # possible options are: report, balance, transaction
    frequency: String   # only for reports : daily, weekly, monthly
    limit: Number       # only for balance/transaction
    order: String       # only for balance/transaction: gt, lt

BankAlert.all = (callback) ->
    BankAlert.request "all", callback

BankAlert.allFromBankAccount = (account, callback) ->
    params = key: account.id
    BankAlert.request "allByBankAccount", params, callback

BankAlert.allByAccountAndType = (accountID, type, callback) ->
    params = key: [accountID, type]
    BankAlert.request "allByBankAccountAndType", params, callback

 BankAlert.allReportsByFrequency = (frequency, callback) ->
    params = key: ["report", frequency]
    BankAlert.request "allReportsByFrequency", params, callback

BankAlert.destroyByAccount = (id, callback) ->
    BankAlert.requestDestroy "allByBankAccount", key: id, callback

BankAlert::testTransaction = (operation) ->
    unless @type is "transaction"
        return false
    else
        alertLimit = Number @limit
        amount = Math.abs operation.amount
        return (@order is "lt" and amount <= alertLimit) or \
        (@order is "gt" and amount >= alertLimit)

BankAlert::testBalance = (account) ->
    unless @type is "balance"
        return false
    else
        alertLimit = Number @limit
        balance = account.getBalance()
        return (@order is "lt" and balance <= alertLimit) or \
        (@order is "gt" and balance >= alertLimit)