BankOperation = require '../models/bank_operation'

module.exports = class BankOperations extends Backbone.Collection

	model: BankOperation
	url: "bankoperations"
