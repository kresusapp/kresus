module.exports = (compound, BankAccount) ->
    
    BankAccount.all = (callback) ->
        BankAccount.request "all", callback

    BankAccount.allFromBank = (bank, callback) ->
        params =
            key: bank.id
        BankAccount.request "allByBank", params, callback

    BankAccount.allFromBankAccess = (bankAccess, callback) ->
        params =
            key: bankAccess.id
        BankAccount.request "allByBankAccess", params, callback

    BankAccount.destroyAll = (callback) ->
        BankAccount.requestDestroy "all", callback
