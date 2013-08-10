BankAccess = require '../models/bank_access'

module.exports = class Banks extends Backbone.Collection

	model: BankAccess
	url: "bankaccesses"
