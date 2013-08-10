module.exports = (compound, BankOperation) ->
    
    BankOperation.all = (callback) ->
        BankOperation.request "all", callback

    BankOperation.allFromBankAccess = (bankAccount, callback) ->
        params =
            key: bankAccount.id
        BankOperation.request "allByBankAccess", params, callback

    BankOperation.destroyAll = (callback) ->
        BankOperation.requestDestroy "all", callback
