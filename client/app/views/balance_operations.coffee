BaseView = require '../lib/base_view'
BankOperationsCollection = require "../collections/bank_operations"

module.exports = class BalanceOperationsView extends BaseView

    templateHeader: require './templates/balance_operations_header'
    templateElement: require './templates/balance_operations_element'

    events:
        'click a.recheck-button' : "checkAccount"

    inUse: false

    constructor: (@el) ->
        super()

    setIntervalWithContext: (code,delay,context) ->
        setInterval(() ->
            code.call(context)
        ,delay)

    initialize: ->
        @listenTo window.activeObjects, 'changeActiveAccount', @reload
        @setIntervalWithContext @updateTimer, 1000, @

    render: ->
        @$el.html require "./templates/balance_operations_empty"
        $("#balance-column-right").niceScroll()
        $("#balance-column-right").getNiceScroll().onResize()
        @

    checkAccount: (event) ->
        
        event.preventDefault()
        button = $ event.target
        view = @

        if not @inUse
            console.log "Checking account ..."
            view.inUse = true
            button.html "checking..."
            $.ajax
                url: url = "bankaccounts/retrieveOperations/" + @model.get("id")
                type: "GET"
                success: ->

                    #update it's url
                    view.model?.url = "bankaccounts/" + view.model?.get("id")

                    # update the model
                    view.model?.fetch
                        success: () ->
                            console.log "... checked"
                            button.html "checked"
                            view.inUse = false
                            view.reload view.model
                        error: () ->
                            console.log "... there was an error fetching"
                            button.html "error..."
                            view.inUse = false
                error: (err) ->
                    console.log "... there was an error checking"
                    console.log err
                    button.html "error..."
                    view.inUse = false

    updateTimer: () ->
        if @model?
            model = @model
            @$("span.last-checked").html "Last checked #{moment(moment(model.get("lastChecked"))).fromNow()}. "

    reload: (account) ->
        
        view = @
        @model = account

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

                # table sort
                if not $.fn.DataTable.fnIsDataTable(@$("table.table"))
                    $('table.table').dataTable
                        "bPaginate": false,
                        "bLengthChange": false,
                        "bFilter": true,
                        "bSort": true,
                        "bInfo": false,
                        "bAutoWidth": false
                        "bDestroy": true
                        "aoColumns": [
                            {"sType": "date-euro"}
                            null
                            null
                        ]

                # nicescroll
                $("#balance-column-right").niceScroll()
                $("#balance-column-right").getNiceScroll().onResize()
        
            error: ->
                console.log "error fetching operations"
        @
