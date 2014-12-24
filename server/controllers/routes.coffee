banks      = require './banks'
accesses   = require './bankaccesses'
accounts   = require './bankaccounts'
operations = require './bankoperations'
alerts     = require './bankalerts'
categories = require './bankcategories'

module.exports =
    'banks':
        get: banks.index
    'bankID': param: banks.loadBank
    'banks/:bankID':
        get: banks.show
        del: banks.destroy
    'banks/getAccesses/:bankID':
        get: banks.getAccesses
    'banks/getAccounts/:bankID':
        get: banks.getAccounts

    'accesses':
        get: accesses.index
        post: accesses.create
    'bankAccessID': param: accesses.loadBankAccess
    'accesses/:bankAccessID':
        get: accesses.show
        put: accesses.update
        del: accesses.destroy
    'accesses/getAccounts/:bankAccessID':
        get: accesses.getAccounts

    'accounts':
        get: accounts.index
    'bankAccountID': param: accounts.loadBankAccount
    'accounts/:bankAccountID':
        get: accounts.show
        del: accounts.destroy
    'accounts/getOperations/:bankAccountID':
        get: accounts.getOperations
    'accounts/retrieveOperations/:bankAccountID':
        get: accounts.retrieveOperations

    'operations':
        get: operations.index
        post: operations.create
    'bankOperationID': param: operations.loadBankOperation
    'operations/:bankOperationID':
        get: operations.show
        put: operations.update
        del: operations.delete
    'operations/query':
        post: operations.query

    'categoryId': param: categories.loadCategory
    'categories':
        get: categories.index
        post: categories.create
    'categories/:categoryId':
        put: categories.update

    'alerts':
        get: alerts.index
        post: alerts.create
    'bankAlertID': param: alerts.loadAlert
    'alerts/:bankAlertID':
        get: alerts.show
        put: alerts.update
        del: alerts.destroy
    'alerts/getForBankAccount/:accountID':
        get: alerts.getForBankAccount
