banks      = require './banks'
accesses   = require './accesses'
accounts   = require './accounts'
operations = require './operations'
alerts     = require './alerts'
categories = require './categories'
settings   = require './settings'

module.exports =

    # Accesses
    'accesses':
        get: accesses.index
        post: accesses.create
    'bankAccessID': param: accesses.loadBankAccess
    'accesses/:bankAccessID':
        get: accesses.show
        put: accesses.update
        delete: accesses.destroy

    # Accounts
    'accounts':
        get: accounts.index
    'bankAccountID': param: accounts.loadBankAccount
    'accounts/:bankAccountID':
        get: accounts.show
        delete: accounts.destroy
    'accounts/:bankAccountID/accounts':
        get: accounts.fetchAccounts # TODO should be moved to bank or access!
    'accounts/:bankAccountID/fetch':
        get: accounts.fetchOperations
    'accounts/:bankAccountID/operations':
        get: accounts.getOperations

    # Banks
    'banks':
        get: banks.index
    'bankID': param: banks.loadBank
    'banks/:bankID':
        get: banks.show
        delete: banks.destroy
    'banks/:bankID/accounts':
        get: banks.getAccounts

    # Categories
    'categories':
        get: categories.index
        post: categories.create
    'categoryId': param: categories.loadCategory
    'categories/:categoryId':
        put: categories.update
        delete: categories.delete

    # Operations
    'operations':
        get: operations.index
    'bankOperationID': param: operations.loadBankOperation
    'operations/:bankOperationID':
        get: operations.show
        put: operations.update
        delete: operations.delete
    'operations/:bankOperationID/file':
        get: operations.file

    # Settings
    'settings':
        get: settings.all
        post: settings.save
    'settings/weboob':
        put: settings.updateWeboob

    # TODO unused yet: alerts
    'alerts':
        get: alerts.index
        post: alerts.create
    'bankAlertID': param: alerts.loadAlert
    'alerts/:bankAlertID':
        get: alerts.show
        put: alerts.update
        delete: alerts.destroy
    'alerts/getForBankAccount/:accountID':
        get: alerts.getForBankAccount
