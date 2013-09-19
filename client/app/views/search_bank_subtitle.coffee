BaseView = require '../lib/base_view'

module.exports = class SearchBankSubTitleView extends BaseView

    template: require('./templates/search_bank_subtitle')

    constructor: (@model) ->
        super()

    events:
        "change .choice-account" : "accountChosen"

    accountChosen: (event) ->

    	# get the value
        enabled = @$(event.target).prop("checked")
        console.log "[Search] " + @model.get("title") + ": " + enabled

        # mark the account as checked
        @model.checked = true

        # and fire "update" on accounts
        window.collections.banks.trigger "search-update-accounts"

    initialize: ->
        @listenTo @model, 'change', @render
