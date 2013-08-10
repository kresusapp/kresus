BankAccessesCollection = require '../collections/bank_accesses'

module.exports = class Bank extends Backbone.Model
	
	# a collection to hold Accesses for this Bank
	bankAccesses: new BankAccessesCollection()

	initialize: =>
		@bankAccesses.url = "/banks/getAccesses/" + @id
		@bankAccesses.fetch()
