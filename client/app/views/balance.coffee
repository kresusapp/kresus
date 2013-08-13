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

        treatment = (bank, callback) ->
            viewBank = new BalanceBanksView bank
            viewBank.accounts = new BankAccountsCollection()
            viewBank.accounts.url = "banks/getAccounts/" + bank.get("id")
            viewBank.$el.html "<p class='loading'>" + window.i18n("loading") + " <img src='./loader.gif' /></p>"
            $(view.elAccounts).append viewBank.el
            viewBank.accounts.fetch
                success: (col) ->
                    # return the number of accounts
                    callback null, col.length
                    viewBank.render()
                error: (col, err, opts) ->
                    console.log col
                    callback null, col.length
                    viewBank.$el.html ""

        async.concat window.collections.banks.models, treatment, (err, results) ->
            
            if err
                console.log err
                alert window.i18n "error_loading_accounts"
            
            # no accounts
            if results.length == 0
                $(view.elAccounts).html require "./templates/balance_banks_empty"
        @
