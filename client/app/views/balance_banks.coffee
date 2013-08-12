BaseView = require '../lib/base_view'
BankTitleView = require './bank_title'
BankSubTitleView = require './bank_subtitle'

module.exports = class BalanceBanksView extends BaseView

    templateSub: require('./templates/balance_bank_subtitle')

    className: 'bank'

    constructor: (@model) ->
        super()

    initialize: ->
        @listenTo window.activeObjects, "new_access_added_successfully", @checkIfRenderNeccessary

    checkIfRenderNeccessary: (model) ->
        if @model.get("id") == model.get("bank")
            @render

    render: ->

        view = @
        view.$el.html ""

        if view.accounts.length > 0

            # update the sum of accounts
            sum = 0
            view.accounts.each (account) ->
                # calculate the sum
                sum = sum + Number(account.get("amount"))

                # add the account
                viewAccount = new BankSubTitleView account
                view.$el.append viewAccount.render().el
            
            view.model.set("amount", sum)
            #console.log view.model

            # render the bank title
            viewTitle = new BankTitleView view.model
            view.$el.prepend viewTitle.render().el
        @
