BaseView = require '../lib/base_view'
BankOperationsCollection = require "../collections/bank_operations"
BalanceOperationView = require "./balance_operation"

module.exports = class SearchOperationsTableView extends BaseView

    templateHeader: require './templates/search_operations_table_header'
    templateElement: require './templates/balance_operations_element'

    subViews: []

    events:
        'click th.sort-date' : "sortByDate"
        'click th.sort-title' : "sortByTitle"
        'click th.sort-amount' : "sortByAmount"

    constructor: (@el) ->
        super()

    initialize: ->
        @listenTo window.collections.operations, 'reset', @reload
        @listenTo window.collections.operations, 'sort', @reload

    # SORTING
    sortByDate: (event) ->
        @sortBy "date"

    sortByTitle: (event) ->
        @sortBy "title"

    sortByAmount: (event) ->
        @sortBy "amount"

    sortBy: (order) ->

        operations = window.collections.operations

        # check if we're just reversing order
        operations.toggleSort order

        # apply styles
        @$("th.sorting_asc").removeClass "sorting_asc"
        @$("th.sorting_desc").removeClass "sorting_desc"
        @$("th.sort-#{order}").addClass "sorting_#{operations.order}" 
        
        # change comparator & sort
        operations.setComparator order
        operations.sort()


    render: ->
        @$el.html @templateHeader()
        @

    reload: ->

        view = @

        # remove any previous views
        view.$("#search-operations-table-body").html ""

        # get the bank accounts
        accounts = []
        for bank in window.collections.banks.models
            for account in bank.accounts.models
                accounts[account.get("accountNumber")] = account

        # add operations
        for operation in window.collections.operations.models
            #add the operation to the table
            accountNum = operation.get("bankAccount")
            subView = new BalanceOperationView operation, \
                                               accounts[accountNum], true
            view.$("#search-operations-table-body").append subView.render().el
            @subViews.push subView

        # nicescroll
        $("#layout-2col-column-right").niceScroll()
        $("#layout-2col-column-right").getNiceScroll().onResize()

        @

    destroy: ->
        @viewTitle?.destroy()
        for view in @subViews
            view.destroy()
        super()