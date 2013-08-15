BankOperation = require '../models/bank_operation'

module.exports = class BankOperations extends Backbone.Collection

    model: BankOperation
    url: "bankoperations"

    setAccount: (@account) ->
        @url = "bankaccounts/getOperations/" + @account.get("id")
        #console.log @url
