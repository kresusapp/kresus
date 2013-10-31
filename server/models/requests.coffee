americano = require 'americano'

allByName = (doc) -> emit doc.name, doc
allByBank = (doc) -> emit doc.bank, doc
allByBankAccess = (doc) -> emit doc.bankAccess, doc
allByBankAccount = (doc) -> emit doc.bankAccount, doc
allReportsByFrequency = (doc) -> emit [doc.type, doc.frequency], doc
allByBankAccountAndType = (doc) -> emit [doc.bankAccount, doc.type], doc
allByBankAccountAndDate = (doc) -> emit [doc.bankAccount, doc.date], doc
allLike = (doc) ->
    emit [doc.bankAccount, doc.date, doc.amount.toFixed(2), doc.title], doc
getBalance =
    map: (doc) ->
        emit doc.bankAccount, doc.amount
    reduce: (keys, values, rereduce) ->
        sum values

module.exports =
    bank:
        all: allByName
    bankaccess:
        all: allByName
        allByBank: allByBank

    bankaccount:
        all: allByName
        allByBankAccess: allByBankAccess
        allByBank: allByBank

    bankoperation:
        all: allByName
        allByBankAccount: allByBankAccount
        allByBankAccountAndDate: allByBankAccountAndDate
        allLike: allLike
        getBalance: getBalance

    bankalert:
        all: allByName
        allByBankAccount: allByBankAccount
        allReportsByFrequency: allReportsByFrequency
        allByBankAccountAndType: allByBankAccountAndType
