americano = require 'americano'

allByName = (doc) -> emit doc.name, doc
byUuid = (doc) -> emit doc.uuid, doc
allByTitle = (doc) -> emit doc.title, doc
allByBank = (doc) -> emit doc.bank, doc
allByBankAccess = (doc) -> emit doc.bankAccess, doc
allByBankAccount = (doc) -> emit doc.bankAccount, doc
allReportsByFrequency = (doc) -> emit [doc.type, doc.frequency], doc
allByBankAccountAndType = (doc) -> emit [doc.bankAccount, doc.type], doc
allByBankAccountAndDate = (doc) -> emit [doc.bankAccount, doc.date], doc
allAccessesLike = (doc) ->
    emit [doc.bank, doc.login, doc.password], doc
allOperationsLike = (doc) ->
    emit [doc.bankAccount, doc.date, doc.amount.toFixed(2), doc.raw], doc
getBalance =
    map: (doc) ->
        emit doc.bankAccount, doc.amount
    reduce: (keys, values, rereduce) ->
        sum values
getBanksWithAccounts =
    map: (doc) ->
        emit doc.bank, 1
    reduce: (keys, values, rereduce) ->
        return 1

module.exports =
    bank:
        all: allByName
        byUuid: byUuid
    bankaccess:
        all: americano.defaultRequests.all
        allByBank: allByBank
        allLike: allAccessesLike

    bankaccount:
        all: allByTitle
        allByBankAccess: allByBankAccess
        allByBank: allByBank
        bankWithAccounts: getBanksWithAccounts

    bankoperation:
        all: americano.defaultRequests.all
        allByBankAccount: allByBankAccount
        allByBankAccountAndDate: allByBankAccountAndDate
        allLike: allOperationsLike
        getBalance: getBalance

    bankalert:
        all: americano.defaultRequests.all
        allByBankAccount: allByBankAccount
        allReportsByFrequency: allReportsByFrequency
        allByBankAccountAndType: allByBankAccountAndType
