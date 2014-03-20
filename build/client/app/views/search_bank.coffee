BaseView = require '../lib/base_view'
SearchBankTitleView = require './search_bank_title'
SearchBankSubTitleView = require './search_bank_subtitle'

module.exports = class SearchBankView extends BaseView

    className: 'bank'

    events:
        "change .choice-bank" : "bankChange"

    viewsAccount: []

    constructor: (@bank) ->
        super()

    initialize: ->
        @listenTo @bank.accounts, "add", @addOne
        @listenTo @bank.accounts, "destroy", @render

    bankChange: (event) ->

        enabled = @$(event.target).prop("checked")
        console.log "[Search] " + @bank.get("name") + ": " + enabled

        # check/uncheck all
        $.each @$("input[type=checkbox].choice-account"), (index, element) ->
            $(element).prop "checked", enabled
        for account in @bank.accounts.models
            account.checked = enabled

        # mark the entire bank as checked
        @bank.checked = enabled

        # and fire "update" on accounts
        window.collections.banks.trigger "search-update-accounts"

    addOne: (account) ->
        # add the account
        viewAccount = new SearchBankSubTitleView account
        @viewsAccount.push viewAccount
        account.view = viewAccount
        @$el.append viewAccount.render().el

    render: ->

        # generate the title
        @viewTitle = new SearchBankTitleView @bank
        @$el.html @viewTitle.render().el
        @viewTitle = null
        @sum = 0

        # add accounts
        for account in @bank.accounts.models
            @addOne account
        @

    destroy: ->
        @viewTitle?.destroy()
        for viewAccount in @viewsAccount
            viewAccount.destroy()
        super()
