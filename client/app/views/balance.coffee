BaseView = require '../lib/base_view'

BalanceBanksView = require './balance_banks'
BalanceOperationsView = require "./balance_operations"

BankAccountsCollection = require '../collections/bank_accounts'

module.exports = class BalanceView extends BaseView

    template: require('./templates/balance')

    el: 'div#content'

    elAccounts: '#balance-column-left'
    elOperations: '#balance-column-right'

    initialize: ->
        #@listenTo window.collections.banks, 'add', @renderBank
        @listenTo window.activeObjects, "new_access_added_successfully", @render

    render: =>
        super()

        # prepare the operations list
        @operations = new BalanceOperationsView @$ @elOperations
        @operations.render()

        # prepare the banks list
        view = @

        views = []
        for bank in window.collections.banks.models
            views[bank] = new BalanceBanksView bank
            views[bank].accounts = new BankAccountsCollection()
            views[bank].accounts.urlRoot = "banks/getAccounts/" + bank.get("id")

        console.log views


        treatment = (bank, callback) ->
            views[bank].$el.html "<p class='loading'>" + window.i18n("loading") + " <img src='loader.gif' /></p>"
            $(view.elAccounts).append views[bank].el
            views[bank].accounts.fetch
                success: () ->
                    # return the number of accounts
                    callback null, views[bank].accounts.length
                    views[bank].render()
                error: (err) ->
                    callback err
                    views[bank].el.html ""
        
        async.concatSeries window.collections.banks.models, treatment, (err, results) ->
            
            if err
                alert window.i18n "error_loading_accounts"
            
            # no accounts
            if results.length == 0
                $(view.elAccounts).html require "./templates/balance_banks_empty"

        @
