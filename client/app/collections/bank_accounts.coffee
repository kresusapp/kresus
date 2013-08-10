BankAccount = require '../models/bank_account'

module.exports = class BankAccounts extends Backbone.Collection

	model: BankAccount
	url: "bankaccounts"
