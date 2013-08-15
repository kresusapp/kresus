BaseView = require '../lib/base_view'
BankTitleView = require './bank_title'
BankSubTitleView = require './bank_subtitle'

module.exports = class BalanceBanksView extends BaseView

    templateSub: require('./templates/balance_bank_subtitle')

    className: 'bank'

    constructor: (@bank) ->
        super()

    initialize: ->
        @listenTo @bank.accounts, "change", @render
        @listenTo @bank.accounts, "add", @render
        @listenTo @bank.accounts, "destroy", @render

    render: ->

        @$el.html ""
        
        if @bank.accounts.length > 0

            # update the sum of accounts
            sum = 0
            for account in @bank.accounts.models
                # calculate the sum
                sum += Number(account.get("amount"))

                # add the account
                viewAccount = new BankSubTitleView account
                @$el.append viewAccount.render().el
            
            # update the bank amount
            @bank.set("amount", sum)

            # render the bank title
            if not @viewTitle?
                @viewTitle = new BankTitleView @bank
            @$el.prepend @viewTitle.render().el
        @
