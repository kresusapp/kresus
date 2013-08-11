module.exports = (compound, BankOperation) ->
    
    BankOperation.all = (callback) ->
        BankOperation.request "all", callback

    BankOperation.allFromBankAccount = (bankAccount, callback) ->
        params =
            key: bankAccount.id
        BankOperation.request "allByBankAccount", params, callback


    BankOperation.allFromBankAccountDate = (bankAccount, callback) ->
        params =
            startKey: [bankAccount.id, new Date(0)]
            endKey: [bankAccount.id, new Date()]
            descending: true
        BankOperation.request "allByBankAccountAndDate", params, callback

    BankOperation.destroyAll = (callback) ->
        BankOperation.requestDestroy "all", callback
