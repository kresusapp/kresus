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
        dateFromVal = new Date(dateFrom.val())
        dateToVal = new Date(dateTo.val())
        amountFromVal = Number(amountFrom.val())
        amountToVal = Number(amountTo.val())
        searchTextVal = searchText.val()

        # debug
        console.log dateFromVal
        console.log dateToVal
        console.log amountFromVal
        console.log amountToVal
        console.log searchTextVal
        
        console.log caller[0] is amountFrom[0]

        # validate/correct the arguments


        # send query & display results

    render: ->
        @$el.html require "./templates/search_operations"
        $("#balance-column-right").niceScroll()
        $("#balance-column-right").getNiceScroll().onResize()
        @

