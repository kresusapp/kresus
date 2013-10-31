BaseView = require '../lib/base_view'
BankOperationsCollection = require "../collections/bank_operations"
SearchOperationsTableView = require "./search_operations_table"

module.exports = class SearchOperationsView extends BaseView

    data: {}

    send: true

    events:
        "change input" : "handleUpdateFilters"
        "keyup input" : "handleUpdateFilters"

    constructor: (@el) ->
        super()

    initialize: ->
        @listenTo window.collections.banks, "search-update-accounts", @handleUpdateAccounts

    updateFilters: (event) ->
        # get elements
        caller = @$(event.target)
        dateFrom = @$("input#search-date-from")
        dateTo = @$("input#search-date-to")
        amountFrom = @$("input#search-amount-from")
        amountTo = @$("input#search-amount-to")
        searchText = @$("input#search-text")

         # check that there are things to send
        unless dateFrom.val() or dateTo.val() or amountFrom.val() or \
               amountTo.val() or searchText.val() != ""
           console.log "Empty query"
           @send = false
           window.collections.operations.reset()
           return
        else
           @send = true

        # get values
        dateFromVal = new Date(dateFrom.val() or null)
        dateToVal = new Date(dateTo.val() or new Date())
        amountFromVal = Number(amountFrom.val() or Number.NEGATIVE_INFINITY)
        amountToVal = Number(amountTo.val() or Number.POSITIVE_INFINITY)
        searchTextVal = searchText.val()

        # validate/correct the arguments
        if amountFromVal > amountToVal
            if caller[0] is amountTo[0]
                # go down
                amountFromVal = amountToVal
                amountFrom.val amountToVal
            else
                # go up
                amountToVal = amountFromVal
                amountTo.val amountFromVal

        if dateFromVal.getTime() >  dateToVal.getTime()
            if caller[0] is dateTo[0]
                # go down
                dateFromVal = dateToVal
                dateFrom.val moment(dateToVal).format("YYYY-MM-DD")
            else
                # go up
                dateToVal = dateFromVal
                dateTo.val moment(dateFromVal).format("YYYY-MM-DD")

        # store the results
        @data =
            dateFrom:   dateFromVal
            dateTo:     dateToVal
            amountFrom: amountFromVal
            amountTo:   amountToVal
            searchText: searchTextVal
            accounts:   @data.accounts # keep accounts intact

    updateAccounts: () ->
        # check which accounts/banks are checked
        accounts = []
        for bank in window.collections.banks.models
            for account in bank.accounts.models
                if bank.checked and account.checked
                    accounts.push account.get "accountNumber"

        @data.accounts = accounts


    getResults: () ->
        # send query & display results
        if @send
            $.ajax
                type: "POST"
                url: "bankoperations/query"
                data: @data
                success: (objects) ->
                    console.log "sent successfully!"
                    console.log objects
                    if objects
                        window.collections.operations.reset objects
                    else
                        window.collections.operations.reset()
                error: (err) ->
                    console.log "there was an error"

    # handle when accounts to show are changes
    handleUpdateAccounts: ->
        console.log "handleUpdateAccounts"
        @updateAccounts()
        @getResults()

    # handle when filteres are changed
    handleUpdateFilters: (event) ->
        console.log "handleUpdateFilters"
        # update data
        @updateFilters event
        # get the results
        @updateAccounts()
        @getResults()

    render: ->
        @$el.html require "./templates/search_operations"
        @operationsTableView = new SearchOperationsTableView @$("#search-operations-table")
        @operationsTableView.render()
        @

    destroy: ->
        @operationsTableView?.destroy()
        super()

