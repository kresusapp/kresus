Bank = require '../models/bank'

module.exports = class Banks extends Backbone.Collection

	model: Bank
	url: "banks"
