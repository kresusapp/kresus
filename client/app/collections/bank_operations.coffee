BankOperation = require '../models/bank_operation'

module.exports = class Banks extends Backbone.Collection

	model: BankOperation
	url: "bankoperations"
