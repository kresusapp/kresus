BaseView = require '../lib/base_view'
BankOperationsCollection = require "../collections/bank_operations"

module.exports = class SearchOperationsTableView extends BaseView

    templateHeader: require './templates/search_operations_table_header'
    templateElement: require './templates/balance_operations_element'

    constructor: (@el) ->
        super()

    initialize: ->
        @listenTo window.collections.operations, 'reset', @reload

    render: ->
        @$el.html @templateHeader()

        # table sort
        $('table#search-table').dataTable
            "bPaginate": false,
            "bLengthChange": false,
            "bFilter": false,
            "bSort": true,
            "bInfo": true,
            "bAutoWidth": false
            "bDestroy": true
            "aoColumns": [
                {"sType": "date-euro"}
                null
                {"sType": "fr-number"}
            ]
        @

    reload: ->
        
        view = @

        view.$("#search-operations-table-body").html ""
        $('table#search-table').dataTable().fnClearTable();

        console.log window.collections.operations.models

        # add operations
        for operation in window.collections.operations.models
            view.$("#search-operations-table-body").append view.templateElement
                model: operation

        # table sort
        $('table#search-table').dataTable
            "bPaginate": false,
            "bLengthChange": false,
            "bFilter": false,
            "bSort": true,
            "bInfo": true,
            "bAutoWidth": false
            "bDestroy": true
            "aoColumns": [
                {"sType": "date-euro"}
                null
                {"sType": "fr-number"}
            ]

        # nicescroll
        $("#layout-2col-column-right").niceScroll()
        $("#layout-2col-column-right").getNiceScroll().onResize()

        @
