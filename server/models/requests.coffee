americano = require('../db').module

allByName = (doc) -> emit doc.name, doc
byUuid = (doc) -> emit doc.uuid, doc
allByTitle = (doc) -> emit doc.title, doc
allByBank = (doc) -> emit doc.bank, doc
allByBankAccess = (doc) -> emit doc.bankAccess, doc
allByBankAccount = (doc) -> emit doc.bankAccount, doc
allReportsByFrequency = (doc) -> emit [doc.type, doc.frequency], doc
allByBankAccountAndType = (doc) -> emit [doc.bankAccount, doc.type], doc
allByBankAccountAndDate = (doc) -> emit [doc.bankAccount, doc.date], doc
allByCategory = (doc) -> emit doc.categoryId, doc
allAccessesLike = (doc) ->
    emit [doc.bank, doc.login, doc.password], doc
allAccountsLike = (doc) ->
    emit [doc.bank, doc.accountNumber], doc
allOperationsLike = (doc) ->
    emit [doc.bankAccount, doc.date, doc.amount.toFixed(2), doc.raw], doc
getBanksWithAccounts =
    map: (doc) ->
        emit doc.bank, 1
    reduce: (keys, values, rereduce) ->
        return 1

allByWeboobValue = (doc) ->
    emit doc.weboobvalue, doc

module.exports =
    bank:
        allByName: allByName
        byUuid: byUuid

    bankaccess:
        all: americano.defaultRequests.all
        allByBank: allByBank
        allLike: allAccessesLike

    bankaccount:
        allByTitle: allByTitle
        allByBankAccess: allByBankAccess
        allByBank: allByBank
        allLike: allAccountsLike
        bankWithAccounts: getBanksWithAccounts

    bankoperation:
        all: americano.defaultRequests.all
        allByBankAccount: allByBankAccount
        allByBankAccountAndDate: allByBankAccountAndDate
        allByCategory: allByCategory
        allLike: allOperationsLike

    bankalert:
        all: americano.defaultRequests.all
        allByBankAccount: allByBankAccount
        allReportsByFrequency: allReportsByFrequency
        allByBankAccountAndType: allByBankAccountAndType

    bankcategory:
        all: americano.defaultRequests.all
        byId: (doc) -> emit doc.id, doc

    kresusconfig:
        all: americano.defaultRequests.all
        byName: allByName
        
    operationtype:
        all:americano.defaultRequests.all
        byWeboobValue: allByWeboobValue
