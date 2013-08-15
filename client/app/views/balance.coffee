BaseView = require '../lib/base_view'

BalanceBankView = require './balance_bank'
BalanceOperationsView = require "./balance_operations"

module.exports = class BalanceView extends BaseView

    template: require('./templates/balance')

    el: 'div#content'

    elAccounts: '#balance-column-left'
    elOperations: '#balance-column-right'

    render: ->
        # lay down the template
        super()

        # prepare the operations list
        if not @operations
            @operations = new BalanceOperationsView @$(@elOperations)
        @operations.render()

        # prepare the banks list
        view = @
        
        treatment = (bank, callback) ->
            viewBank = new BalanceBankView bank
            # load loading placeholder
            viewBank.$el.html "<p class='loading'>" + window.i18n("loading") + " <img src='./loader.gif' /></p>"
            # add to the main view
            $(view.elAccounts).append viewBank.el
            # get bank accounts
            bank.accounts.fetch
                success: (col) ->
                    # return the number of accounts
                    callback null, col.length
                    viewBank.render()
                error: (col, err, opts) ->
                    callback null, col.length
                    viewBank.$el.html ""

        # render all banks
        async.concat window.collections.banks.models, treatment, (err, results) ->
            
            if err
                console.log err
                alert window.i18n "error_loading_accounts"
            
            # no accounts
            if results.length == 0
                $(view.elAccounts).html require "./templates/balance_banks_empty"
        
        @
