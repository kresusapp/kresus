BaseView = require '../lib/base_view'
BalanceBanksView = require './balance_banks'
BankOperationsCollection = require "../collections/bank_operations"

module.exports = class BalanceOperationsView extends BaseView

    templateHeader: require './templates/balance_operations_header'
    templateElement: require './templates/balance_operations_element'

    initialize: ->
        #@listenTo @model, 'change', @render
        @listenTo window.activeObjects, 'changeActiveAccount', @reload
        @operations = new BankOperationsCollection

    render: ->
        @$el.html "<p>Select an account to display operations</p>"
        @

    reload: (account) =>
        
        view = @
        @account = account
        @operations.url = "/bankaccounts/getOperations/" + @account.get("id")

        @$el.html @templateHeader
            model: @account

        # get the operations for this account
        sum = 0
        @operations.fetch
            success: (operations) ->

                view.$("#table-operations").html ""

                operations.each (operation) ->

                    sum = sum + Number(account.get("amount"))

                    # add the operation to the table
                    view.$("#table-operations").append view.templateElement
                        model: operation

                #view.account.set("amount", sum)
        @
