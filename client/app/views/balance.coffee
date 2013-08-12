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
            viewBank.accounts.url = "/banks/getAccounts/" + bank.get("id")
            viewBank.accounts.fetch
                success: () ->
                    callback null, viewBank.accounts.length
                    $(view.elAccounts).append viewBank.render().el
                error: (err) ->
                    callback err
                    $(view.elAccounts).append viewBank.render().el

        async.concat window.collections.banks.models, treatment, (err, results) ->
            
            if err
                alert window.i18n "error_loading_accounts"
            
            # no accounts
            if results.length == 0
                $(view.elAccounts).html require "./templates/balance_banks_empty"
        @
