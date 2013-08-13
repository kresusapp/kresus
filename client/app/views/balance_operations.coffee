BaseView = require '../lib/base_view'
BalanceBanksView = require './balance_banks'
BankOperationsCollection = require "../collections/bank_operations"

module.exports = class BalanceOperationsView extends BaseView

    templateHeader: require './templates/balance_operations_header'
    templateElement: require './templates/balance_operations_element'

    constructor: (@el) ->
        super()

    initialize: ->
        @operations = new BankOperationsCollection
        @listenTo window.activeObjects, 'changeActiveAccount', @reload

    render: ->
        @$el.html require "./templates/balance_operations_empty"
        @

    reload: (account) =>
        
        view = @
        @account = account
        @operations.url = "bankaccounts/getOperations/" + @account.get("id")

        @$el.html @templateHeader
            model: @account

        # get the operations for this account
        @operations.fetch
            success: (operations) ->

                view.$("#table-operations").html ""

                operations.each (operation) ->

                    # add the operation to the table
                    view.$("#table-operations").append view.templateElement
                        model: operation
        @
