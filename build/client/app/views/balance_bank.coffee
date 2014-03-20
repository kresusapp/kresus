BaseView = require '../lib/base_view'
BankTitleView = require './bank_title'
BankSubTitleView = require './bank_subtitle'

module.exports = class BalanceBankView extends BaseView

    className: 'bank'

    sum: 0

    subViews: []

    constructor: (@bank) ->
        super()

    initialize: ->
        @listenTo @bank.accounts, "add", @addOne
        @listenTo @bank.accounts, "destroy", @render

    addOne: (account) ->
        # add the account
        viewAccount = new BankSubTitleView account
        @subViews.push viewAccount
        account.view = viewAccount
        @$el.append viewAccount.render().el

    render: ->

        # generate the title
        @viewTitle = new BankTitleView @bank
        @$el.html @viewTitle.render().el
        @viewTitle = null
        @sum = 0

        # add accounts
        for account in @bank.accounts.models
            @addOne account
        @

    destroy: ->
        @viewTitle?.destroy()
        for view in @subViews
            view.destroy()
        super()