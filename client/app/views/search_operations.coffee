BaseView = require '../lib/base_view'
BankOperationsCollection = require "../collections/bank_operations"

module.exports = class SearchOperationsView extends BaseView

    templateElement: require './templates/balance_operations_element'

    events:
        "change input" : "updateResults"
        "keyup input" : "updateResults"

    constructor: (@el) ->
        super()

    updateResults: (event) ->
        console.log "Updating results"

        # get elements
        caller = @$(event.target)

        dateFrom = @$("input#search-date-from")
        dateTo = @$("input#search-date-to")
        amountFrom = @$("input#search-amount-from")
        amountTo = @$("input#search-amount-to")
        searchText = @$("input#search-text")

        # debug
        #console.log caller
        #console.log dateFrom.val() or null
        #console.log dateTo.val() or null
        #console.log amountFrom.val() or null
        #console.log amountTo.val() or null
        #console.log searchText.val() or null

        # get values
        dateFromVal = new Date(dateFrom.val() or null)
        dateToVal = new Date(dateTo.val() or new Date())
        amountFromVal = Number(amountFrom.val() or Number.MIN_VALUE)
        amountToVal = Number(amountTo.val() or Number.MAX_VALUE)
        searchTextVal = searchText.val()

        # debug
        console.log dateFromVal
        console.log dateToVal
        console.log amountFromVal
        console.log amountToVal
        console.log searchTextVal

        console.log caller[0] is amountFrom[0]

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


        # check which accounts/banks are checked
        accounts = []
        for bank in window.collections.banks.models
            for account in bank.accounts.models
                if bank.checked or account.checked
                    accounts.push account.get "id"



        # send query & display results
        $.ajax
            type: "POST"
            url: "bankoperations/query"
            data:
                dateFrom:   dateFromVal
                dateTo:     dateToVal
                amountFrom: amountFromVal
                amountTo:   amountToVal
                searchText: searchTextVal
                accounts:   accounts

            success: ->
                console.log "sent successfully!"
            error: (err) ->
                console.log "there was an error"

    render: ->
        @$el.html require "./templates/search_operations"
        $("#balance-column-right").niceScroll()
        $("#balance-column-right").getNiceScroll().onResize()
        @

