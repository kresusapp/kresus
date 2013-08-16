BaseView = require '../lib/base_view'
BankOperationsCollection = require "../collections/bank_operations"

module.exports = class BalanceOperationsView extends BaseView

    templateHeader: require './templates/balance_operations_header'
    templateElement: require './templates/balance_operations_element'

    constructor: (@el) ->
        super()

    initialize: ->
        @listenTo window.activeObjects, 'changeActiveAccount', @reload

    render: ->
        @$el.html require "./templates/balance_operations_empty"
        @

    reload: (account) ->
        
        view = @

        # render the header - title etc
        @$el.html @templateHeader
            model: account

        # get the operations for this account
        window.collections.operations.reset()
        window.collections.operations.setAccount account
        window.collections.operations.fetch
            success: (operations) ->

                view.$("#table-operations").html ""
                view.$(".loading").remove()

                # and render all of them
                for operation in operations.models

                    # add the operation to the table
                    view.$("#table-operations").append view.templateElement
                        model: operation

                # nicescroll
                $("#balance-column-right").niceScroll()
                $("#balance-column-right").getNiceScroll().onResize()
        
            error: ->
                console.log "error fetching operations"
        @
