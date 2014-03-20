BankAccountsCollection = require '../collections/bank_accounts'

module.exports = class Bank extends Backbone.Model

    defaults:
        amount: 0

    checked: true

    initialize: ->
        @accounts = new BankAccountsCollection @
        @listenTo @accounts, "add", @updateAmount
        @listenTo @accounts, "remove", @updateAmount
        @listenTo @accounts, "destroy", @updateAmount
        @listenTo @accounts, "change", @updateAmount

    updateAmount: ->
        @set("amount", @accounts.getSum())
        console.log "updated balance bank " + @get("name") + " is now " + @get("amount")
