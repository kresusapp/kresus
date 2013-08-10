BankAccountsCollection = require "../collections/bank_accounts"

module.exports = class BankAccess extends Backbone.Model

	url: "bankaccesses"

	# a collection to hold Accounts for this Acccess
	bankAccounts: new BankAccountsCollection()

	initialize: =>
		@bankAccounts.url = "/bankaccesses/getAccounts/" + @id
		@bankAccounts.fetch()
