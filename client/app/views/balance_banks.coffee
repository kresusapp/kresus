BaseView = require '../lib/base_view'
BankAccountsCollection = require '../collections/bank_accounts'
BankTitleView = require './bank_title'
BankSubTitleView = require './bank_subtitle'

module.exports = class BalanceBanksView extends BaseView

    templateSub: require('./templates/balance_bank_subtitle')

    className: 'bank'

    constructor: (@model) ->
        super()

    initialize: ->
        @accounts = new BankAccountsCollection()
        @accounts.url = "/banks/getAccounts/" + @model.get("id")
        @listenTo window.activeObjects, "new_access_added_successfully", @checkIfRenderNeccessary

    checkIfRenderNeccessary: (model) ->
        if @model.get("id") == model.get("bank")
            @render

    render: ->

        view = @

        @$el.html "<p class='loading'>Loading...<img src='/loader.gif' /></p>"

        # get all accounts in this bank
        @accounts.fetch
            success: (accounts) ->

                view.$el.html ""

                # update the sum of accounts
                sum = 0
                accounts.each (account) ->
                    # calculate the sum
                    sum = sum + Number(account.get("amount"))

                    # add the account
                    viewAccount = new BankSubTitleView account
                    view.$el.append viewAccount.render().el
                
                view.model.set("amount", sum)
                #console.log view.model

                if accounts.length > 0

                    # render the bank title
                    viewTitle = new BankTitleView view.model
                    view.$el.prepend viewTitle.render().el
        @
