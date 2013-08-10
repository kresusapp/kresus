BankAccount = require '../models/bank_account'

module.exports = class Banks extends Backbone.Collection

	model: BankAccount
	url: "bankaccounts"
