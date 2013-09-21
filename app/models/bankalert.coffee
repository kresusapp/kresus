module.exports = (compound, BankAlert) ->
    
    BankAlert.all = (callback) ->
        BankAlert.request "all", callback

    BankAlert.allFromBankAccount = (bankAlert, callback) ->
        params =
            key: bankAlert.id
        BankAlert.request "allByBankAccount", params, callback

    BankAlert.destroyAll = (callback) ->
        BankAlert.requestDestroy "all", callback
