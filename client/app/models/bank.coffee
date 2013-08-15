BankAccountsCollection = require '../collections/bank_accounts'

module.exports = class Bank extends Backbone.Model

    defaults:
        amount: 0

    initialize: ->
        @accounts = new BankAccountsCollection @
