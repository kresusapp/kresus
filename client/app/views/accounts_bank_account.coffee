BaseView = require '../lib/base_view'

module.exports = class AccountsBankAccountView extends Backbone.View

    template: require('./templates/accounts_bank_account')

    tagName: "tr"

    constructor: (@model) ->
    	super()

    render: () ->
    	@$el.html @template
    		model: @model
    	@