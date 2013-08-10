module.exports = (compound, BankOperation) ->
    
    BankOperation.all = (callback) ->
        BankOperation.request "all", callback

    BankOperation.allFromBankAccount = (bankAccount, callback) ->
        params =
            key: bankAccount.id
        BankOperation.request "allByBankAccount", params, callback

    BankOperation.destroyAll = (callback) ->
        BankOperation.requestDestroy "all", callback
