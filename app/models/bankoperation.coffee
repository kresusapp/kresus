module.exports = (compound, BankAccess) ->
    
    BankAccess.all = (callback) ->
        BankAccess.request "all", callback

    BankAccess.allFromBank = (bank, callback) ->
        params =
            key: bank.id
        BankAccess.request "allByBank", params, callback

    BankAccess.destroyAll = (callback) ->
        BankAccess.requestDestroy "all", callback
