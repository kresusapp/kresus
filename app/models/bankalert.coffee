module.exports = (compound, BankAlert) ->
    
    BankAlert.all = (callback) ->
        BankAlert.request "all", callback

    BankAlert.allFromBankAccount = (bankAccount, callback) ->
        params =
            key: bankAccount.id
        BankAlert.request "allByBankAccount", params, callback

    BankAlert.destroyAll = (callback) ->
        BankAlert.requestDestroy "all", callback

    BankAlert.testTransaction = (operation, bankalert) ->
    	if not bankalert.type == "transaction"
    		false
    	else
    		(bankalert.order == "lt" and operation.amount <= Number(bankalert.limit)) or (bankalert.order == "gt" and operation.amount >= Number(bankalert.limit))